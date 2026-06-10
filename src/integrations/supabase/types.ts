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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      agent_runs: {
        Row: {
          agent_id: string | null
          created_at: string
          duration_ms: number | null
          error: string | null
          id: string
          input: Json | null
          output: Json | null
          ran_at: string
          status: string
          updated_at: string
        }
        Insert: {
          agent_id?: string | null
          created_at?: string
          duration_ms?: number | null
          error?: string | null
          id?: string
          input?: Json | null
          output?: Json | null
          ran_at?: string
          status?: string
          updated_at?: string
        }
        Update: {
          agent_id?: string | null
          created_at?: string
          duration_ms?: number | null
          error?: string | null
          id?: string
          input?: Json | null
          output?: Json | null
          ran_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_runs_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agents: {
        Row: {
          created_at: string
          description: string | null
          id: string
          improvement_ideas: string | null
          input: string | null
          last_run: string | null
          n8n_url: string | null
          name: string
          notes: string | null
          output: string | null
          role: string | null
          status: string
          success_rate: number | null
          tools: string[] | null
          trigger_type: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          improvement_ideas?: string | null
          input?: string | null
          last_run?: string | null
          n8n_url?: string | null
          name: string
          notes?: string | null
          output?: string | null
          role?: string | null
          status?: string
          success_rate?: number | null
          tools?: string[] | null
          trigger_type?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          improvement_ideas?: string | null
          input?: string | null
          last_run?: string | null
          n8n_url?: string | null
          name?: string
          notes?: string | null
          output?: string | null
          role?: string | null
          status?: string
          success_rate?: number | null
          tools?: string[] | null
          trigger_type?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      ai_news: {
        Row: {
          category: string | null
          created_at: string
          discovered_at: string
          id: string
          related_briefing_id: string | null
          relevance_score: number | null
          source: string | null
          summary: string | null
          tags: string[] | null
          title: string
          trend_score: number | null
          updated_at: string
          url: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          discovered_at?: string
          id?: string
          related_briefing_id?: string | null
          relevance_score?: number | null
          source?: string | null
          summary?: string | null
          tags?: string[] | null
          title: string
          trend_score?: number | null
          updated_at?: string
          url?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          discovered_at?: string
          id?: string
          related_briefing_id?: string | null
          relevance_score?: number | null
          source?: string | null
          summary?: string | null
          tags?: string[] | null
          title?: string
          trend_score?: number | null
          updated_at?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_news_related_briefing_id_fkey"
            columns: ["related_briefing_id"]
            isOneToOne: false
            referencedRelation: "daily_briefings"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_briefings: {
        Row: {
          briefing_date: string
          created_at: string
          executive_summary: string | null
          hot_topics: string[] | null
          id: string
          key_links: Json | null
          recommended_articles: Json | null
          related_experiment_id: string | null
          telegram_sent: boolean
          title: string
          updated_at: string
          what_to_learn: string | null
          why_it_matters: string | null
        }
        Insert: {
          briefing_date?: string
          created_at?: string
          executive_summary?: string | null
          hot_topics?: string[] | null
          id?: string
          key_links?: Json | null
          recommended_articles?: Json | null
          related_experiment_id?: string | null
          telegram_sent?: boolean
          title: string
          updated_at?: string
          what_to_learn?: string | null
          why_it_matters?: string | null
        }
        Update: {
          briefing_date?: string
          created_at?: string
          executive_summary?: string | null
          hot_topics?: string[] | null
          id?: string
          key_links?: Json | null
          recommended_articles?: Json | null
          related_experiment_id?: string | null
          telegram_sent?: boolean
          title?: string
          updated_at?: string
          what_to_learn?: string | null
          why_it_matters?: string | null
        }
        Relationships: []
      }
      experiment_reviews: {
        Row: {
          created_at: string
          experiment_id: string | null
          feedback: string | null
          id: string
          reviewer: string | null
          score: number | null
          strengths: string | null
          updated_at: string
          weaknesses: string | null
        }
        Insert: {
          created_at?: string
          experiment_id?: string | null
          feedback?: string | null
          id?: string
          reviewer?: string | null
          score?: number | null
          strengths?: string | null
          updated_at?: string
          weaknesses?: string | null
        }
        Update: {
          created_at?: string
          experiment_id?: string | null
          feedback?: string | null
          id?: string
          reviewer?: string | null
          score?: number | null
          strengths?: string | null
          updated_at?: string
          weaknesses?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "experiment_reviews_experiment_id_fkey"
            columns: ["experiment_id"]
            isOneToOne: false
            referencedRelation: "experiments"
            referencedColumns: ["id"]
          },
        ]
      }
      experiments: {
        Row: {
          ai_feedback: string | null
          background: string | null
          category: string | null
          created_at: string
          difficulty: number | null
          estimated_time: string | null
          experiment_date: string
          id: string
          instructions: string | null
          learnings: string | null
          next_idea: string | null
          result_summary: string | null
          result_url: string | null
          score: number | null
          self_reflection: string | null
          status: string
          success_criteria: string | null
          task: string | null
          title: string
          tools_needed: string[] | null
          updated_at: string
        }
        Insert: {
          ai_feedback?: string | null
          background?: string | null
          category?: string | null
          created_at?: string
          difficulty?: number | null
          estimated_time?: string | null
          experiment_date?: string
          id?: string
          instructions?: string | null
          learnings?: string | null
          next_idea?: string | null
          result_summary?: string | null
          result_url?: string | null
          score?: number | null
          self_reflection?: string | null
          status?: string
          success_criteria?: string | null
          task?: string | null
          title: string
          tools_needed?: string[] | null
          updated_at?: string
        }
        Update: {
          ai_feedback?: string | null
          background?: string | null
          category?: string | null
          created_at?: string
          difficulty?: number | null
          estimated_time?: string | null
          experiment_date?: string
          id?: string
          instructions?: string | null
          learnings?: string | null
          next_idea?: string | null
          result_summary?: string | null
          result_url?: string | null
          score?: number | null
          self_reflection?: string | null
          status?: string
          success_criteria?: string | null
          task?: string | null
          title?: string
          tools_needed?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      learning_journal: {
        Row: {
          built: string | null
          created_at: string
          difficult: string | null
          entry_date: string
          id: string
          improve_next: string | null
          learned: string | null
          mood: string | null
          surprised: string | null
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          built?: string | null
          created_at?: string
          difficult?: string | null
          entry_date?: string
          id?: string
          improve_next?: string | null
          learned?: string | null
          mood?: string | null
          surprised?: string | null
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          built?: string | null
          created_at?: string
          difficult?: string | null
          entry_date?: string
          id?: string
          improve_next?: string | null
          learned?: string | null
          mood?: string | null
          surprised?: string | null
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      profile: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          development_goals: string[] | null
          display_name: string
          focus_areas: string[] | null
          id: string
          learning_score: number
          public_summary: string | null
          skills: string[] | null
          strengths: string[] | null
          tools: string[] | null
          updated_at: string
          weekly_streak: number
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          development_goals?: string[] | null
          display_name?: string
          focus_areas?: string[] | null
          id?: string
          learning_score?: number
          public_summary?: string | null
          skills?: string[] | null
          strengths?: string[] | null
          tools?: string[] | null
          updated_at?: string
          weekly_streak?: number
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          development_goals?: string[] | null
          display_name?: string
          focus_areas?: string[] | null
          id?: string
          learning_score?: number
          public_summary?: string | null
          skills?: string[] | null
          strengths?: string[] | null
          tools?: string[] | null
          updated_at?: string
          weekly_streak?: number
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string
          demo_url: string | null
          description: string | null
          github_url: string | null
          id: string
          learnings: string | null
          name: string
          next_improvements: string | null
          problem: string | null
          status: string
          tools: string[] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          demo_url?: string | null
          description?: string | null
          github_url?: string | null
          id?: string
          learnings?: string | null
          name: string
          next_improvements?: string | null
          problem?: string | null
          status?: string
          tools?: string[] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          demo_url?: string | null
          description?: string | null
          github_url?: string | null
          id?: string
          learnings?: string | null
          name?: string
          next_improvements?: string | null
          problem?: string | null
          status?: string
          tools?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      score_events: {
        Row: {
          created_at: string
          delta: number
          event_type: string
          id: string
          occurred_at: string
          reason: string | null
          source_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          delta?: number
          event_type: string
          id?: string
          occurred_at?: string
          reason?: string | null
          source_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          delta?: number
          event_type?: string
          id?: string
          occurred_at?: string
          reason?: string | null
          source_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      skills: {
        Row: {
          category: string | null
          created_at: string
          id: string
          name: string
          notes: string | null
          proficiency: number | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          proficiency?: number | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          proficiency?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      social_insights: {
        Row: {
          author: string | null
          comment_analysis: string | null
          content_idea: string | null
          created_at: string
          discovered_at: string
          id: string
          main_arguments: string | null
          opportunity: string | null
          platform: string | null
          post_url: string | null
          relevance_score: number | null
          response_idea: string | null
          summary: string | null
          topic: string | null
          updated_at: string
        }
        Insert: {
          author?: string | null
          comment_analysis?: string | null
          content_idea?: string | null
          created_at?: string
          discovered_at?: string
          id?: string
          main_arguments?: string | null
          opportunity?: string | null
          platform?: string | null
          post_url?: string | null
          relevance_score?: number | null
          response_idea?: string | null
          summary?: string | null
          topic?: string | null
          updated_at?: string
        }
        Update: {
          author?: string | null
          comment_analysis?: string | null
          content_idea?: string | null
          created_at?: string
          discovered_at?: string
          id?: string
          main_arguments?: string | null
          opportunity?: string | null
          platform?: string | null
          post_url?: string | null
          relevance_score?: number | null
          response_idea?: string | null
          summary?: string | null
          topic?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      telegram_messages: {
        Row: {
          chat_id: string | null
          created_at: string
          direction: string
          id: string
          message: string | null
          related_briefing_id: string | null
          sent_at: string
          status: string | null
          updated_at: string
        }
        Insert: {
          chat_id?: string | null
          created_at?: string
          direction?: string
          id?: string
          message?: string | null
          related_briefing_id?: string | null
          sent_at?: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          chat_id?: string | null
          created_at?: string
          direction?: string
          id?: string
          message?: string | null
          related_briefing_id?: string | null
          sent_at?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "telegram_messages_related_briefing_id_fkey"
            columns: ["related_briefing_id"]
            isOneToOne: false
            referencedRelation: "daily_briefings"
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
