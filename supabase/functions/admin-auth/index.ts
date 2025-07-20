import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AdminAuthRequest {
  action: 'create_user' | 'reset_password' | 'update_email' | 'confirm_email' | 'delete_user'
  email?: string
  password?: string
  userData?: {
    full_name?: string
    role?: string
    department?: string
    specialization?: string[]
  }
  userId?: string
  newEmail?: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client with service role key for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Initialize regular client for user verification
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing authorization header')
    }

    // Verify the user is authenticated and has management role
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      throw new Error('Invalid authentication')
    }

    // Check if user has management role
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || profile?.role !== 'management') {
      throw new Error('Unauthorized: Management role required')
    }

    const { action, email, password, userData, userId, newEmail }: AdminAuthRequest = await req.json()

    console.log(`Admin auth action: ${action} by user: ${user.id}`)

    let result
    switch (action) {
      case 'create_user':
        if (!email || !password || !userData) {
          throw new Error('Missing required fields for user creation')
        }

        // Create user in auth
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: {
            full_name: userData.full_name || '',
          }
        })

        if (createError) {
          throw new Error(`Failed to create user: ${createError.message}`)
        }

        // Create profile
        const { error: profileCreateError } = await supabaseAdmin
          .from('profiles')
          .insert({
            id: newUser.user.id,
            email: email,
            full_name: userData.full_name || '',
            role: userData.role || 'submitter',
            department: userData.department || '',
            specialization: userData.specialization || [],
            email_confirmed: true,
            created_by: user.id,
            updated_by: user.id
          })

        if (profileCreateError) {
          // If profile creation fails, delete the auth user
          await supabaseAdmin.auth.admin.deleteUser(newUser.user.id)
          throw new Error(`Failed to create profile: ${profileCreateError.message}`)
        }

        // Log the action
        await supabaseAdmin.rpc('log_user_management_action', {
          p_target_user_id: newUser.user.id,
          p_action_type: 'user_created',
          p_action_details: userData
        })

        result = { success: true, user: newUser.user }
        break

      case 'reset_password':
        if (!userId) {
          throw new Error('Missing user ID for password reset')
        }

        // Generate a new password
        const tempPassword = crypto.randomUUID().slice(0, 12) + '!'
        
        const { error: resetError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
          password: tempPassword
        })

        if (resetError) {
          throw new Error(`Failed to reset password: ${resetError.message}`)
        }

        // Mark password reset as required
        await supabaseAdmin.rpc('admin_require_password_reset', {
          p_user_id: userId,
          p_reason: 'Admin initiated password reset'
        })

        result = { success: true, tempPassword }
        break

      case 'update_email':
        if (!userId || !newEmail) {
          throw new Error('Missing user ID or new email')
        }

        const { error: emailError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
          email: newEmail,
          email_confirm: true
        })

        if (emailError) {
          throw new Error(`Failed to update email: ${emailError.message}`)
        }

        // Update profile email
        const { error: profileEmailError } = await supabaseAdmin
          .from('profiles')
          .update({ 
            email: newEmail,
            updated_by: user.id 
          })
          .eq('id', userId)

        if (profileEmailError) {
          throw new Error(`Failed to update profile email: ${profileEmailError.message}`)
        }

        await supabaseAdmin.rpc('log_user_management_action', {
          p_target_user_id: userId,
          p_action_type: 'email_updated',
          p_action_details: { new_email: newEmail }
        })

        result = { success: true }
        break

      case 'confirm_email':
        if (!userId) {
          throw new Error('Missing user ID for email confirmation')
        }

        const { error: confirmError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
          email_confirm: true
        })

        if (confirmError) {
          throw new Error(`Failed to confirm email: ${confirmError.message}`)
        }

        // Update profile
        const { error: profileConfirmError } = await supabaseAdmin
          .from('profiles')
          .update({ 
            email_confirmed: true,
            updated_by: user.id 
          })
          .eq('id', userId)

        if (profileConfirmError) {
          throw new Error(`Failed to update profile: ${profileConfirmError.message}`)
        }

        await supabaseAdmin.rpc('log_user_management_action', {
          p_target_user_id: userId,
          p_action_type: 'email_confirmed'
        })

        result = { success: true }
        break

      case 'delete_user':
        if (!userId) {
          throw new Error('Missing user ID for user deletion')
        }

        // Delete from auth (this will cascade to profile due to foreign key)
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)

        if (deleteError) {
          throw new Error(`Failed to delete user: ${deleteError.message}`)
        }

        await supabaseAdmin.rpc('log_user_management_action', {
          p_target_user_id: userId,
          p_action_type: 'user_deleted'
        })

        result = { success: true }
        break

      default:
        throw new Error(`Unknown action: ${action}`)
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Admin auth error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})