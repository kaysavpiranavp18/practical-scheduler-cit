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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      app_access: {
        Row: {
          created_at: string
          id: string
          last_access: string | null
          password_hash: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_access?: string | null
          password_hash: string
        }
        Update: {
          created_at?: string
          id?: string
          last_access?: string | null
          password_hash?: string
        }
        Relationships: []
      }
      departments: {
        Row: {
          code: string
          created_at: string
          id: string
          name: string
          regulation_id: string
        }
        Insert: {
          code: string
          created_at?: string
          id: string
          name: string
          regulation_id: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          name?: string
          regulation_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "departments_regulation_id_fkey"
            columns: ["regulation_id"]
            isOneToOne: false
            referencedRelation: "regulations"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_cycles: {
        Row: {
          created_at: string
          end_date: string
          id: string
          name: string
          start_date: string
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          name: string
          start_date: string
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          name?: string
          start_date?: string
        }
        Relationships: []
      }
      faculty: {
        Row: {
          created_at: string
          department: string
          email: string
          id: string
          name: string
          specialization: string | null
          years_of_experience: number
        }
        Insert: {
          created_at?: string
          department: string
          email: string
          id: string
          name: string
          specialization?: string | null
          years_of_experience: number
        }
        Update: {
          created_at?: string
          department?: string
          email?: string
          id?: string
          name?: string
          specialization?: string | null
          years_of_experience?: number
        }
        Relationships: []
      }
      labs: {
        Row: {
          code: string
          created_at: string
          department_id: string
          id: string
          name: string
          total_students: number
          year_group: string
        }
        Insert: {
          code: string
          created_at?: string
          department_id: string
          id: string
          name: string
          total_students: number
          year_group: string
        }
        Update: {
          code?: string
          created_at?: string
          department_id?: string
          id?: string
          name?: string
          total_students?: number
          year_group?: string
        }
        Relationships: [
          {
            foreignKeyName: "labs_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      phases: {
        Row: {
          created_at: string
          id: string
          name: string
          year_groups: string[]
        }
        Insert: {
          created_at?: string
          id: string
          name: string
          year_groups: string[]
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          year_groups?: string[]
        }
        Relationships: []
      }
      regulations: {
        Row: {
          created_at: string
          id: string
          name: string
          year: number
        }
        Insert: {
          created_at?: string
          id: string
          name: string
          year: number
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          year?: number
        }
        Relationships: []
      }
      schedules: {
        Row: {
          created_at: string
          department_id: string
          exam_cycle_id: string
          id: string
          lab_id: string
          phase_id: string
          regulation_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          department_id: string
          exam_cycle_id: string
          id?: string
          lab_id: string
          phase_id: string
          regulation_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          department_id?: string
          exam_cycle_id?: string
          id?: string
          lab_id?: string
          phase_id?: string
          regulation_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedules_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedules_exam_cycle_id_fkey"
            columns: ["exam_cycle_id"]
            isOneToOne: false
            referencedRelation: "exam_cycles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedules_lab_id_fkey"
            columns: ["lab_id"]
            isOneToOne: false
            referencedRelation: "labs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedules_phase_id_fkey"
            columns: ["phase_id"]
            isOneToOne: false
            referencedRelation: "phases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedules_regulation_id_fkey"
            columns: ["regulation_id"]
            isOneToOne: false
            referencedRelation: "regulations"
            referencedColumns: ["id"]
          },
        ]
      }
      session_timings: {
        Row: {
          created_at: string
          end_time: string
          id: string
          label: string
          phase_id: string
          start_time: string
        }
        Insert: {
          created_at?: string
          end_time: string
          id: string
          label: string
          phase_id: string
          start_time: string
        }
        Update: {
          created_at?: string
          end_time?: string
          id?: string
          label?: string
          phase_id?: string
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_timings_phase_id_fkey"
            columns: ["phase_id"]
            isOneToOne: false
            referencedRelation: "phases"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          assigned_faculty_id: string | null
          created_at: string
          id: string
          lab_id: string
          session_date: string | null
          session_number: number
          student_count: number
          timing_id: string
        }
        Insert: {
          assigned_faculty_id?: string | null
          created_at?: string
          id?: string
          lab_id: string
          session_date?: string | null
          session_number: number
          student_count: number
          timing_id: string
        }
        Update: {
          assigned_faculty_id?: string | null
          created_at?: string
          id?: string
          lab_id?: string
          session_date?: string | null
          session_number?: number
          student_count?: number
          timing_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_assigned_faculty_id_fkey"
            columns: ["assigned_faculty_id"]
            isOneToOne: false
            referencedRelation: "faculty"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_lab_id_fkey"
            columns: ["lab_id"]
            isOneToOne: false
            referencedRelation: "labs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_timing_id_fkey"
            columns: ["timing_id"]
            isOneToOne: false
            referencedRelation: "session_timings"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
