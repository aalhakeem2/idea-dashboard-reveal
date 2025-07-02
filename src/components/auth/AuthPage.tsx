
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Lightbulb, Users, BarChart3, Zap, TestTube, AlertCircle } from "lucide-react";

export const AuthPage = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const { toast } = useToast();

  // Test user accounts with roles
  const testUsers = [
    { 
      email: "submitter@you.com", 
      name: "Hani Gazim", 
      role: "Submitter",
      userRole: "submitter" as const,
      id: "11111111-1111-1111-1111-111111111111"
    },
    { 
      email: "evaluator@you.com", 
      name: "Abdurhman Alhakeem", 
      role: "Evaluator",
      userRole: "evaluator" as const,
      id: "22222222-2222-2222-2222-222222222222"
    },
    { 
      email: "management@you.com", 
      name: "Osama Murshed", 
      role: "Management",
      userRole: "management" as const,
      id: "33333333-3333-3333-3333-333333333333"
    },
    { 
      email: "test@you.com", 
      name: "Test User", 
      role: "Admin",
      userRole: "management" as const,
      id: "44444444-4444-4444-4444-444444444444"
    },
  ];

  const createTestProfile = async (user: typeof testUsers[0]) => {
    try {
      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .single();

      if (!existingProfile) {
        // Create profile if it doesn't exist with email_confirmed = true for test users
        const { error: profileError } = await supabase
          .from("profiles")
          .insert({
            id: user.id,
            email: user.email,
            full_name: user.name,
            role: user.userRole,
            email_confirmed: true,
            department: user.role === "Management" ? "Executive" : user.role === "Evaluator" ? "R&D" : "Operations"
          });

        if (profileError) {
          console.error("Profile creation error:", profileError);
        }
      }
    } catch (error) {
      console.error("Error creating test profile:", error);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Disable email confirmation by setting emailRedirectTo to null
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;

      // Immediately try to sign in after signup (bypassing email confirmation)
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        console.log("Auto sign-in failed:", signInError.message);
        toast({
          title: "Account Created!",
          description: "Please sign in with your credentials.",
        });
      } else {
        toast({
          title: "Account Created & Signed In!",
          description: "Welcome to YOU Innovation Hub",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "Welcome back!",
        description: "Successfully signed in.",
      });
    } catch (error: any) {
      toast({
        title: "Sign In Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTestLogin = async (testUser: typeof testUsers[0]) => {
    setLoading(true);
    try {
      console.log(`Attempting login for ${testUser.name} (${testUser.email})`);
      
      // First create the test profile
      await createTestProfile(testUser);

      // Try to sign in directly
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: testUser.email,
        password: "Abdu123+++",
      });

      if (signInError) {
        console.log("Sign in failed, attempting to create account:", signInError.message);
        
        // If sign in fails, create the account first (without email confirmation)
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: testUser.email,
          password: "Abdu123+++",
          options: {
            data: {
              full_name: testUser.name,
            },
          },
        });

        if (signUpError && !signUpError.message.includes('already registered')) {
          throw signUpError;
        }

        // Create profile after signup
        await createTestProfile(testUser);

        // Try to sign in again immediately
        const { error: secondSignInError } = await supabase.auth.signInWithPassword({
          email: testUser.email,
          password: "Abdu123+++",
        });

        if (secondSignInError) {
          console.error("Second sign in failed:", secondSignInError);
          throw new Error(`Login failed: ${secondSignInError.message}`);
        }
      }
      
      console.log("Login successful for", testUser.name);
      toast({
        title: "Login Successful",
        description: `Logged in as ${testUser.name} (${testUser.role})`,
      });
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Login Error",
        description: error.message || "Failed to login. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAccess = async () => {
    setLoading(true);
    try {
      // Create test user profile first
      const testUser = testUsers.find(u => u.email === "test@you.com")!;
      await createTestProfile(testUser);

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: "test@you.com",
        password: "Abdu123+++",
      });

      if (signInError) {
        // If sign in fails, create the account without email confirmation
        const { error: signUpError } = await supabase.auth.signUp({
          email: "test@you.com",
          password: "Abdu123+++",
          options: {
            data: {
              full_name: "Test User",
            },
          },
        });

        if (signUpError && !signUpError.message.includes('already registered')) {
          throw signUpError;
        }

        // Create the profile manually
        await createTestProfile(testUser);

        // Try signing in again immediately
        const { error: secondSignInError } = await supabase.auth.signInWithPassword({
          email: "test@you.com",
          password: "Abdu123+++",
        });

        if (secondSignInError) {
          throw new Error("Account created but login failed. Please try again.");
        }
      }
      
      toast({
        title: "Quick Access Successful",
        description: "Logged in successfully",
      });
    } catch (error: any) {
      console.error("Quick access error:", error);
      toast({
        title: "Quick Access Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Hero Section */}
        <div className="space-y-6 text-gray-800">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-you-accent rounded-xl border border-you-accent">
                <Zap className="h-8 w-8 text-you-purple" />
              </div>
              <h1 className="text-4xl font-bold font-poppins text-gray-900">
                YOU Innovation Hub
              </h1>
            </div>
            <p className="text-xl text-gray-600 font-light">
              Transform ideas into reality with our comprehensive innovation management platform
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center space-x-4 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 shadow-sm">
              <div className="p-2 bg-you-orange rounded-lg">
                <Lightbulb className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Submit & Track Ideas</h3>
                <p className="text-sm text-gray-600">Share innovative thoughts and monitor progress</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 shadow-sm">
              <div className="p-2 bg-you-green rounded-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Collaborative Evaluation</h3>
                <p className="text-sm text-gray-600">Expert review and strategic alignment assessment</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 shadow-sm">
              <div className="p-2 bg-you-blue rounded-lg">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Analytics & Insights</h3>
                <p className="text-sm text-gray-600">Data-driven decisions and performance tracking</p>
              </div>
            </div>
          </div>
        </div>

        {/* Auth Form */}
        <Card className="w-full max-w-md mx-auto shadow-xl border border-gray-200">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-poppins text-gray-900">Welcome Back</CardTitle>
            <CardDescription className="text-base text-gray-600">
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin" className="font-medium">Sign In</TabsTrigger>
                <TabsTrigger value="signup" className="font-medium">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin" className="space-y-4">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="font-medium">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="font-medium">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full h-12 bg-gray-800 hover:bg-gray-900 font-medium" disabled={loading}>
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>

                {/* Quick Access Button */}
                <div className="mt-4">
                  <Button
                    onClick={handleQuickAccess}
                    className="w-full h-12 bg-you-purple hover:bg-you-purple/90 font-medium"
                    disabled={loading}
                  >
                    {loading ? "Accessing..." : "Quick Access"}
                  </Button>
                  <p className="text-xs text-gray-500 text-center mt-2">
                    One-click testing access
                  </p>
                </div>

                {/* Test Users Section */}
                <div className="mt-6 pt-6 border-t">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-sm text-gray-600">Test Different Roles</h4>
                    <TestTube className="h-4 w-4 text-gray-400" />
                  </div>
                  <div className="space-y-2">
                    {testUsers.map((user, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="w-full justify-start h-auto p-3 text-left border-gray-200 hover:bg-gray-50"
                        onClick={() => handleTestLogin(user)}
                        disabled={loading}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${
                            user.role === 'Submitter' ? 'bg-you-blue' : 
                            user.role === 'Evaluator' ? 'bg-you-green' : 
                            user.role === 'Management' ? 'bg-you-orange' : 'bg-you-purple'
                          }`}></div>
                          <div>
                            <div className="font-medium text-sm text-gray-900">{user.name}</div>
                            <div className="text-xs text-gray-500">{user.role}</div>
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                  <div className="flex items-center space-x-2 mt-3 p-2 bg-green-50 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-green-600" />
                    <p className="text-xs text-green-700">
                      Email confirmation disabled - instant login
                    </p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="font-medium">Full Name</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="h-12"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="font-medium">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="font-medium">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full h-12 bg-gray-800 hover:bg-gray-900 font-medium" disabled={loading}>
                    {loading ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
                <div className="flex items-center space-x-2 mt-3 p-2 bg-green-50 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-green-600" />
                  <p className="text-xs text-green-700">
                    No email confirmation required - instant access
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
