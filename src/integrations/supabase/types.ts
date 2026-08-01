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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          created_at: string
          details: Json
          id: string
          ip_address: string | null
          module: string
          status: string
          user_agent: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json
          id?: string
          ip_address?: string | null
          module: string
          status?: string
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json
          id?: string
          ip_address?: string | null
          module?: string
          status?: string
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      admin_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          department: string | null
          email: string
          full_name: string
          id: string
          job_title: string | null
          last_login_at: string | null
          must_change_password: boolean
          phone: string | null
          status: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          email?: string
          full_name?: string
          id: string
          job_title?: string | null
          last_login_at?: string | null
          must_change_password?: boolean
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          email?: string
          full_name?: string
          id?: string
          job_title?: string | null
          last_login_at?: string | null
          must_change_password?: boolean
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author: string | null
          category: string | null
          comments_enabled: boolean
          content: string
          cover_image: string | null
          created_at: string
          created_by: string | null
          excerpt: string | null
          id: string
          published_at: string | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          status: string
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: {
          author?: string | null
          category?: string | null
          comments_enabled?: boolean
          content?: string
          cover_image?: string | null
          created_at?: string
          created_by?: string | null
          excerpt?: string | null
          id?: string
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          status?: string
          tags?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          author?: string | null
          category?: string | null
          comments_enabled?: boolean
          content?: string
          cover_image?: string | null
          created_at?: string
          created_by?: string | null
          excerpt?: string | null
          id?: string
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          status?: string
          tags?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          assigned_to: string | null
          created_at: string
          email: string
          id: string
          message: string
          name: string
          status: string
          subject: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          status?: string
          subject?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          status?: string
          subject?: string | null
        }
        Relationships: []
      }
      job_openings: {
        Row: {
          apply_url: string | null
          created_at: string
          department: string | null
          description: string
          employment_type: string
          id: string
          level: string | null
          location: string | null
          requirements: string | null
          salary_range: string | null
          slug: string
          sort_order: number
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          apply_url?: string | null
          created_at?: string
          department?: string | null
          description?: string
          employment_type?: string
          id?: string
          level?: string | null
          location?: string | null
          requirements?: string | null
          salary_range?: string | null
          slug: string
          sort_order?: number
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          apply_url?: string | null
          created_at?: string
          department?: string | null
          description?: string
          employment_type?: string
          id?: string
          level?: string | null
          location?: string | null
          requirements?: string | null
          salary_range?: string | null
          slug?: string
          sort_order?: number
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      media_assets: {
        Row: {
          alt_text: string | null
          caption: string | null
          created_at: string
          file_size: number | null
          file_type: string | null
          folder: string
          id: string
          name: string
          updated_at: string
          url: string
        }
        Insert: {
          alt_text?: string | null
          caption?: string | null
          created_at?: string
          file_size?: number | null
          file_type?: string | null
          folder?: string
          id?: string
          name: string
          updated_at?: string
          url: string
        }
        Update: {
          alt_text?: string | null
          caption?: string | null
          created_at?: string
          file_size?: number | null
          file_type?: string | null
          folder?: string
          id?: string
          name?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          archived: boolean
          category: string
          created_at: string
          description: string
          docs_url: string | null
          download_url: string | null
          featured: boolean
          id: string
          images: string[]
          logo_url: string | null
          long_description: string | null
          name: string
          platform: string | null
          release_date: string | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          sort_order: number
          status: string
          tags: string[]
          updated_at: string
          version: string | null
          video_url: string | null
          website_url: string | null
        }
        Insert: {
          archived?: boolean
          category: string
          created_at?: string
          description: string
          docs_url?: string | null
          download_url?: string | null
          featured?: boolean
          id?: string
          images?: string[]
          logo_url?: string | null
          long_description?: string | null
          name: string
          platform?: string | null
          release_date?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          sort_order?: number
          status?: string
          tags?: string[]
          updated_at?: string
          version?: string | null
          video_url?: string | null
          website_url?: string | null
        }
        Update: {
          archived?: boolean
          category?: string
          created_at?: string
          description?: string
          docs_url?: string | null
          download_url?: string | null
          featured?: boolean
          id?: string
          images?: string[]
          logo_url?: string | null
          long_description?: string | null
          name?: string
          platform?: string | null
          release_date?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          sort_order?: number
          status?: string
          tags?: string[]
          updated_at?: string
          version?: string | null
          video_url?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      team_members: {
        Row: {
          bio: string | null
          created_at: string
          department: string | null
          email: string | null
          featured: boolean
          github_url: string | null
          id: string
          linkedin_url: string | null
          name: string
          photo_url: string | null
          role: string
          sort_order: number
          updated_at: string
          x_url: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string
          department?: string | null
          email?: string | null
          featured?: boolean
          github_url?: string | null
          id?: string
          linkedin_url?: string | null
          name: string
          photo_url?: string | null
          role: string
          sort_order?: number
          updated_at?: string
          x_url?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string
          department?: string | null
          email?: string | null
          featured?: boolean
          github_url?: string | null
          id?: string
          linkedin_url?: string | null
          name?: string
          photo_url?: string | null
          role?: string
          sort_order?: number
          updated_at?: string
          x_url?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      waitlist_entries: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          notified_at: string | null
          phone: string | null
          product_id: string | null
          product_name: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name: string
          notified_at?: string | null
          phone?: string | null
          product_id?: string | null
          product_name: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          notified_at?: string | null
          phone?: string | null
          product_id?: string | null
          product_name?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "waitlist_entries_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      team_members_public: {
        Row: {
          bio: string | null
          created_at: string | null
          department: string | null
          featured: boolean | null
          github_url: string | null
          id: string | null
          linkedin_url: string | null
          name: string | null
          photo_url: string | null
          role: string | null
          sort_order: number | null
          updated_at: string | null
          x_url: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          department?: string | null
          featured?: boolean | null
          github_url?: string | null
          id?: string | null
          linkedin_url?: string | null
          name?: string | null
          photo_url?: string | null
          role?: string | null
          sort_order?: number | null
          updated_at?: string | null
          x_url?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          department?: string | null
          featured?: boolean | null
          github_url?: string | null
          id?: string | null
          linkedin_url?: string | null
          name?: string | null
          photo_url?: string | null
          role?: string | null
          sort_order?: number | null
          updated_at?: string | null
          x_url?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      can_edit: { Args: { _user_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role:
        | "super_admin"
        | "administrator"
        | "editor"
        | "content_manager"
        | "marketing_manager"
        | "support_manager"
        | "viewer"
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
      app_role: [
        "super_admin",
        "administrator",
        "editor",
        "content_manager",
        "marketing_manager",
        "support_manager",
        "viewer",
      ],
    },
  },
} as const
