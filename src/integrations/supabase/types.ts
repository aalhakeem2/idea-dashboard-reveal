export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      evaluations: {
        Row: {
          created_at: string | null
          enrichment_score: number | null
          evaluation_type: Database["public"]["Enums"]["evaluation_type"]
          evaluator_id: string
          feasibility_score: number | null
          feedback: string | null
          id: string
          idea_id: string
          impact_score: number | null
          innovation_score: number | null
          overall_score: number | null
          recommendation: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          enrichment_score?: number | null
          evaluation_type?: Database["public"]["Enums"]["evaluation_type"]
          evaluator_id: string
          feasibility_score?: number | null
          feedback?: string | null
          id?: string
          idea_id: string
          impact_score?: number | null
          innovation_score?: number | null
          overall_score?: number | null
          recommendation?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          enrichment_score?: number | null
          evaluation_type?: Database["public"]["Enums"]["evaluation_type"]
          evaluator_id?: string
          feasibility_score?: number | null
          feedback?: string | null
          id?: string
          idea_id?: string
          impact_score?: number | null
          innovation_score?: number | null
          overall_score?: number | null
          recommendation?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "evaluations_evaluator_id_fkey"
            columns: ["evaluator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluations_idea_id_fkey"
            columns: ["idea_id"]
            isOneToOne: false
            referencedRelation: "ideas"
            referencedColumns: ["id"]
          },
        ]
      }
      evaluator_assignments: {
        Row: {
          assigned_at: string | null
          assigned_by: string
          evaluation_type: Database["public"]["Enums"]["evaluation_type"]
          evaluator_id: string
          id: string
          idea_id: string
          is_active: boolean | null
        }
        Insert: {
          assigned_at?: string | null
          assigned_by: string
          evaluation_type: Database["public"]["Enums"]["evaluation_type"]
          evaluator_id: string
          id?: string
          idea_id: string
          is_active?: boolean | null
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string
          evaluation_type?: Database["public"]["Enums"]["evaluation_type"]
          evaluator_id?: string
          id?: string
          idea_id?: string
          is_active?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "evaluator_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluator_assignments_evaluator_id_fkey"
            columns: ["evaluator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluator_assignments_idea_id_fkey"
            columns: ["idea_id"]
            isOneToOne: false
            referencedRelation: "ideas"
            referencedColumns: ["id"]
          },
        ]
      }
      idea_action_log: {
        Row: {
          action_detail: string | null
          action_id: string
          action_type: string
          idea_id: string
          performed_by: string
          timestamp: string
          user_role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          action_detail?: string | null
          action_id?: string
          action_type: string
          idea_id: string
          performed_by: string
          timestamp?: string
          user_role: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          action_detail?: string | null
          action_id?: string
          action_type?: string
          idea_id?: string
          performed_by?: string
          timestamp?: string
          user_role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: [
          {
            foreignKeyName: "idea_action_log_idea_id_fkey"
            columns: ["idea_id"]
            isOneToOne: false
            referencedRelation: "ideas"
            referencedColumns: ["id"]
          },
        ]
      }
      idea_attachments: {
        Row: {
          created_at: string | null
          file_name: string | null
          file_type: string | null
          file_url: string | null
          id: string
          idea_id: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string | null
          file_name?: string | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          idea_id: string
          uploaded_by: string
        }
        Update: {
          created_at?: string | null
          file_name?: string | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          idea_id?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "idea_attachments_idea_id_fkey"
            columns: ["idea_id"]
            isOneToOne: false
            referencedRelation: "ideas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "idea_attachments_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      idea_comments: {
        Row: {
          comment: string
          created_at: string | null
          id: string
          idea_id: string
          user_id: string
        }
        Insert: {
          comment: string
          created_at?: string | null
          id?: string
          idea_id: string
          user_id: string
        }
        Update: {
          comment?: string
          created_at?: string | null
          id?: string
          idea_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "idea_comments_idea_id_fkey"
            columns: ["idea_id"]
            isOneToOne: false
            referencedRelation: "ideas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "idea_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      idea_status_log: {
        Row: {
          changed_by: string
          comments: string | null
          idea_id: string
          log_id: string
          previous_status: string | null
          status: string
          timestamp: string
          user_role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          changed_by: string
          comments?: string | null
          idea_id: string
          log_id?: string
          previous_status?: string | null
          status: string
          timestamp?: string
          user_role: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          changed_by?: string
          comments?: string | null
          idea_id?: string
          log_id?: string
          previous_status?: string | null
          status?: string
          timestamp?: string
          user_role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: [
          {
            foreignKeyName: "idea_status_log_idea_id_fkey"
            columns: ["idea_id"]
            isOneToOne: false
            referencedRelation: "ideas"
            referencedColumns: ["id"]
          },
        ]
      }
      ideas: {
        Row: {
          assigned_evaluator_id: string | null
          average_evaluation_score: number | null
          category: Database["public"]["Enums"]["idea_category"]
          created_at: string | null
          current_stage: string | null
          description: string
          evaluated_at: string | null
          expected_roi: number | null
          feasibility_study_url: string | null
          id: string
          idea_reference_code: string | null
          implementation_cost: number | null
          implemented_at: string | null
          is_active: boolean
          is_draft: boolean
          language: string | null
          pricing_offer_url: string | null
          priority_score: number | null
          prototype_images_urls: string[] | null
          status: Database["public"]["Enums"]["idea_status"]
          strategic_alignment_score: number | null
          strategic_alignment_selections: string[] | null
          submitted_at: string | null
          submitter_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_evaluator_id?: string | null
          average_evaluation_score?: number | null
          category: Database["public"]["Enums"]["idea_category"]
          created_at?: string | null
          current_stage?: string | null
          description: string
          evaluated_at?: string | null
          expected_roi?: number | null
          feasibility_study_url?: string | null
          id?: string
          idea_reference_code?: string | null
          implementation_cost?: number | null
          implemented_at?: string | null
          is_active?: boolean
          is_draft?: boolean
          language?: string | null
          pricing_offer_url?: string | null
          priority_score?: number | null
          prototype_images_urls?: string[] | null
          status?: Database["public"]["Enums"]["idea_status"]
          strategic_alignment_score?: number | null
          strategic_alignment_selections?: string[] | null
          submitted_at?: string | null
          submitter_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_evaluator_id?: string | null
          average_evaluation_score?: number | null
          category?: Database["public"]["Enums"]["idea_category"]
          created_at?: string | null
          current_stage?: string | null
          description?: string
          evaluated_at?: string | null
          expected_roi?: number | null
          feasibility_study_url?: string | null
          id?: string
          idea_reference_code?: string | null
          implementation_cost?: number | null
          implemented_at?: string | null
          is_active?: boolean
          is_draft?: boolean
          language?: string | null
          pricing_offer_url?: string | null
          priority_score?: number | null
          prototype_images_urls?: string[] | null
          status?: Database["public"]["Enums"]["idea_status"]
          strategic_alignment_score?: number | null
          strategic_alignment_selections?: string[] | null
          submitted_at?: string | null
          submitter_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ideas_assigned_evaluator_id_fkey"
            columns: ["assigned_evaluator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ideas_submitter_id_fkey"
            columns: ["submitter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      list_of_values: {
        Row: {
          created_at: string | null
          id: number
          is_active: boolean | null
          list_key: string
          value_ar: string
          value_en: string
          value_key: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          is_active?: boolean | null
          list_key: string
          value_ar: string
          value_en: string
          value_key: string
        }
        Update: {
          created_at?: string | null
          id?: number
          is_active?: boolean | null
          list_key?: string
          value_ar?: string
          value_en?: string
          value_key?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          department: string | null
          email: string | null
          email_confirmed: boolean | null
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          specialization:
            | Database["public"]["Enums"]["evaluation_type"][]
            | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          department?: string | null
          email?: string | null
          email_confirmed?: boolean | null
          full_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["user_role"]
          specialization?:
            | Database["public"]["Enums"]["evaluation_type"][]
            | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          department?: string | null
          email?: string | null
          email_confirmed?: boolean | null
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          specialization?:
            | Database["public"]["Enums"]["evaluation_type"][]
            | null
          updated_at?: string | null
        }
        Relationships: []
      }
      translations: {
        Row: {
          arabic_text: string
          created_at: string | null
          english_text: string
          id: string
          interface_name: string
          position_key: string
          updated_at: string | null
        }
        Insert: {
          arabic_text: string
          created_at?: string | null
          english_text: string
          id?: string
          interface_name: string
          position_key: string
          updated_at?: string | null
        }
        Update: {
          arabic_text?: string
          created_at?: string | null
          english_text?: string
          id?: string
          interface_name?: string
          position_key?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_average_evaluation_score: {
        Args: { idea_uuid: string }
        Returns: number
      }
      calculate_comprehensive_evaluation_score: {
        Args: { idea_uuid: string }
        Returns: {
          technology_score: number
          finance_score: number
          commercial_score: number
          overall_average: number
          enrichment_average: number
        }[]
      }
      generate_idea_reference_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_evaluation_progress: {
        Args: { p_idea_id: string }
        Returns: {
          total_assigned: number
          total_completed: number
          progress_percentage: number
          missing_types: Database["public"]["Enums"]["evaluation_type"][]
        }[]
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      log_idea_action: {
        Args: {
          p_idea_id: string
          p_action_type: string
          p_action_detail?: string
        }
        Returns: undefined
      }
    }
    Enums: {
      evaluation_type: "technology" | "finance" | "commercial"
      idea_category:
        | "innovation"
        | "process_improvement"
        | "cost_reduction"
        | "customer_experience"
        | "technology"
        | "sustainability"
      idea_status:
        | "draft"
        | "submitted"
        | "under_review"
        | "approved"
        | "rejected"
        | "implemented"
      user_role: "submitter" | "evaluator" | "management"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      evaluation_type: ["technology", "finance", "commercial"],
      idea_category: [
        "innovation",
        "process_improvement",
        "cost_reduction",
        "customer_experience",
        "technology",
        "sustainability",
      ],
      idea_status: [
        "draft",
        "submitted",
        "under_review",
        "approved",
        "rejected",
        "implemented",
      ],
      user_role: ["submitter", "evaluator", "management"],
    },
  },
} as const
