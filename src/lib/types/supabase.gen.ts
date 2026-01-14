export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      ActivityEvents: {
        Row: {
          activity_type: Database["public"]["Enums"]["activity_types"]
          created_at: string
          event_date: string
          event_name: string
          id: number
          minutes_cap: number | null
        }
        Insert: {
          activity_type: Database["public"]["Enums"]["activity_types"]
          created_at?: string
          event_date?: string
          event_name: string
          id?: number
          minutes_cap?: number | null
        }
        Update: {
          activity_type?: Database["public"]["Enums"]["activity_types"]
          created_at?: string
          event_date?: string
          event_name?: string
          id?: number
          minutes_cap?: number | null
        }
        Relationships: []
      }
      ActivitySessions: {
        Row: {
          activity_type: Database["public"]["Enums"]["activity_types"]
          created_at: string
          event_id: number
          id: number
          minutes: number
          user_id: string
        }
        Insert: {
          activity_type: Database["public"]["Enums"]["activity_types"]
          created_at?: string
          event_id: number
          id?: number
          minutes: number
          user_id: string
        }
        Update: {
          activity_type?: Database["public"]["Enums"]["activity_types"]
          created_at?: string
          event_id?: number
          id?: number
          minutes?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ActivitySessions_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "ActivityEvents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ActivitySessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "UserData"
            referencedColumns: ["user_id"]
          },
        ]
      }
      BuildGroups: {
        Row: {
          created_at: string
          description: string | null
          group_name: string
          id: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          group_name: string
          id?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          group_name?: string
          id?: number
        }
        Relationships: []
      }
      BuildLocations: {
        Row: {
          created_at: string
          id: number
          is_active: boolean
          latitude: number
          location_name: string
          longitude: number
          radius_meters: number
          valid_hours: Json | null
        }
        Insert: {
          created_at?: string
          id?: number
          is_active?: boolean
          latitude: number
          location_name: string
          longitude: number
          radius_meters?: number
          valid_hours?: Json | null
        }
        Update: {
          created_at?: string
          id?: number
          is_active?: boolean
          latitude?: number
          location_name?: string
          longitude?: number
          radius_meters?: number
          valid_hours?: Json | null
        }
        Relationships: []
      }
      BuildSessions: {
        Row: {
          created_at: string
          ended_at: string | null
          id: number
          location_id: number | null
          notes: string | null
          started_at: string
          status: Database["public"]["Enums"]["build_session_status"]
          user_id: string
        }
        Insert: {
          created_at?: string
          ended_at?: string | null
          id?: number
          location_id?: number | null
          notes?: string | null
          started_at?: string
          status?: Database["public"]["Enums"]["build_session_status"]
          user_id: string
        }
        Update: {
          created_at?: string
          ended_at?: string | null
          id?: number
          location_id?: number | null
          notes?: string | null
          started_at?: string
          status?: Database["public"]["Enums"]["build_session_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "BuildSessions_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "BuildLocations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "BuildSessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "UserData"
            referencedColumns: ["user_id"]
          },
        ]
      }
      BuildTasks: {
        Row: {
          assigned_group_id: number | null
          assigned_user_id: string | null
          completed_by: string | null
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          id: number
          rejection_reason: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["build_task_status"]
          task_name: string
          updated_at: string
        }
        Insert: {
          assigned_group_id?: number | null
          assigned_user_id?: string | null
          completed_by?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: number
          rejection_reason?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["build_task_status"]
          task_name: string
          updated_at?: string
        }
        Update: {
          assigned_group_id?: number | null
          assigned_user_id?: string | null
          completed_by?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: number
          rejection_reason?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["build_task_status"]
          task_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "BuildTasks_assigned_group_id_fkey"
            columns: ["assigned_group_id"]
            isOneToOne: false
            referencedRelation: "BuildGroups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "BuildTasks_assigned_user_id_fkey"
            columns: ["assigned_user_id"]
            isOneToOne: false
            referencedRelation: "UserData"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "BuildTasks_completed_by_fkey"
            columns: ["completed_by"]
            isOneToOne: false
            referencedRelation: "UserData"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "BuildTasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "UserData"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "BuildTasks_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "UserData"
            referencedColumns: ["user_id"]
          },
        ]
      }
      rbac: {
        Row: {
          action: string
          condition: string | null
          id: number
          resource: string
          user_role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          action: string
          condition?: string | null
          id?: number
          resource: string
          user_role: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          action?: string
          condition?: string | null
          id?: number
          resource?: string
          user_role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: []
      }
      UserData: {
        Row: {
          avatar_url: string | null
          build_group: number | null
          created_at: string
          email: string
          user_id: string
          user_name: string | null
          user_role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          avatar_url?: string | null
          build_group?: number | null
          created_at?: string
          email?: string
          user_id: string
          user_name?: string | null
          user_role?: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          avatar_url?: string | null
          build_group?: number | null
          created_at?: string
          email?: string
          user_id?: string
          user_name?: string | null
          user_role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: [
          {
            foreignKeyName: "UserData_build_group_fkey"
            columns: ["build_group"]
            isOneToOne: false
            referencedRelation: "BuildGroups"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      UserActivitySummaries: {
        Row: {
          activity_type: Database["public"]["Enums"]["activity_types"] | null
          minutes: number | null
          session_count: number | null
          user_credited_minutes: number | null
          user_id: string | null
          user_name: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_rbac_condition: {
        Args: { requested_action: string; requested_resource: string }
        Returns: string
      }
      get_user_role: {
        Args: { uid: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
    }
    Enums: {
      activity_types: "build" | "outreach"
      build_session_status: "active" | "completed" | "cancelled"
      build_task_status: "to_do" | "in_review" | "rejected" | "complete"
      user_role: "admin" | "member" | "guest"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      activity_types: ["build", "outreach"],
      build_session_status: ["active", "completed", "cancelled"],
      build_task_status: ["to_do", "in_review", "rejected", "complete"],
      user_role: ["admin", "member", "guest"],
    },
  },
} as const

