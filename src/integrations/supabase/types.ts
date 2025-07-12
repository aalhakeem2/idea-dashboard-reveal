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
          language: string | null
          pricing_offer_url: string | null
          priority_score: number | null
          prototype_images_urls: string[] | null
          status: Database["public"]["Enums"]["idea_status"]
          strategic_alignment_score: number | null
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
          language?: string | null
          pricing_offer_url?: string | null
          priority_score?: number | null
          prototype_images_urls?: string[] | null
          status?: Database["public"]["Enums"]["idea_status"]
          strategic_alignment_score?: number | null
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
          language?: string | null
          pricing_offer_url?: string | null
          priority_score?: number | null
          prototype_images_urls?: string[] | null
          status?: Database["public"]["Enums"]["idea_status"]
          strategic_alignment_score?: number | null
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
      generate_idea_reference_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
    }
    Enums: {
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
