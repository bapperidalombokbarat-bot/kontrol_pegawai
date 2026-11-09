export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      backup_logs: {
        Row: {
          created_at: string
          details: Json
          file_name: string
          id: string
          operation: string
        }
        Insert: {
          created_at?: string
          details?: Json
          file_name?: string
          id?: string
          operation: string
        }
        Update: {
          created_at?: string
          details?: Json
          file_name?: string
          id?: string
          operation?: string
        }
        Relationships: []
      }
      employees: {
        Row: {
          base_salary: number
          created_at: string
          employment_type: string
          grade: string
          id: string
          is_demo: boolean
          job_class: number
          last_kgb_tmt: string | null
          last_rank_tmt: string | null
          name: string
          nip: string
          position: string
          rank: string
          retirement_category: string
          status: string
          tpp_basic: number
          updated_at: string
        }
        Insert: {
          base_salary?: number
          created_at?: string
          employment_type?: string
          grade?: string
          id?: string
          is_demo?: boolean
          job_class?: number
          last_kgb_tmt?: string | null
          last_rank_tmt?: string | null
          name: string
          nip: string
          position?: string
          rank?: string
          retirement_category?: string
          status?: string
          tpp_basic?: number
          updated_at?: string
        }
        Update: {
          base_salary?: number
          created_at?: string
          employment_type?: string
          grade?: string
          id?: string
          is_demo?: boolean
          job_class?: number
          last_kgb_tmt?: string | null
          last_rank_tmt?: string | null
          name?: string
          nip?: string
          position?: string
          rank?: string
          retirement_category?: string
          status?: string
          tpp_basic?: number
          updated_at?: string
        }
        Relationships: []
      }
      family_members: {
        Row: {
          birth_date: string
          created_at: string
          employee_id: string
          id: string
          is_asn: boolean
          is_demo: boolean
          is_working: boolean
          marital_status: string
          name: string
          relationship: string
          student_certificate: boolean
        }
        Insert: {
          birth_date: string
          created_at?: string
          employee_id: string
          id?: string
          is_asn?: boolean
          is_demo?: boolean
          is_working?: boolean
          marital_status?: string
          name: string
          relationship: string
          student_certificate?: boolean
        }
        Update: {
          birth_date?: string
          created_at?: string
          employee_id?: string
          id?: string
          is_asn?: boolean
          is_demo?: boolean
          is_working?: boolean
          marital_status?: string
          name?: string
          relationship?: string
          student_certificate?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "family_members_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      kgb_logs: {
        Row: {
          created_at: string
          effective_date: string | null
          employee_id: string
          id: string
          new_salary: number
          old_salary: number
          status: string
        }
        Insert: {
          created_at?: string
          effective_date?: string | null
          employee_id: string
          id?: string
          new_salary?: number
          old_salary?: number
          status?: string
        }
        Update: {
          created_at?: string
          effective_date?: string | null
          employee_id?: string
          id?: string
          new_salary?: number
          old_salary?: number
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "kgb_logs_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string
          id: string
          job_title: string
          preferences: Json
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string
          id: string
          job_title?: string
          preferences?: Json
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string
          id?: string
          job_title?: string
          preferences?: Json
          updated_at?: string
        }
        Relationships: []
      }
      promotion_logs: {
        Row: {
          created_at: string
          effective_date: string | null
          employee_id: string
          id: string
          notes: string
          status: string
        }
        Insert: {
          created_at?: string
          effective_date?: string | null
          employee_id: string
          id?: string
          notes?: string
          status: string
        }
        Update: {
          created_at?: string
          effective_date?: string | null
          employee_id?: string
          id?: string
          notes?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "promotion_logs_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      tpp_calculations: {
        Row: {
          attendance_rate: number
          attendance_weight: number
          base_amount: number
          created_at: string
          deduction_amount: number
          details: Json
          employee_id: string
          gross_amount: number
          id: string
          job_class: number
          net_amount: number
          period: string
          productivity_rate: number
          productivity_weight: number
        }
        Insert: {
          attendance_rate?: number
          attendance_weight?: number
          base_amount?: number
          created_at?: string
          deduction_amount?: number
          details?: Json
          employee_id: string
          gross_amount?: number
          id?: string
          job_class: number
          net_amount?: number
          period: string
          productivity_rate?: number
          productivity_weight?: number
        }
        Update: {
          attendance_rate?: number
          attendance_weight?: number
          base_amount?: number
          created_at?: string
          deduction_amount?: number
          details?: Json
          employee_id?: string
          gross_amount?: number
          id?: string
          job_class?: number
          net_amount?: number
          period?: string
          productivity_rate?: number
          productivity_weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "tpp_calculations_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["simpeg_app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["simpeg_app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["simpeg_app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: { Args: { _role: string; _user_id: string }; Returns: boolean }
    }
    Enums: {
      simpeg_app_role: "admin" | "user"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      simpeg_app_role: ["admin", "user"],
    },
  },
} as const
