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
          duration_seconds: number | null
          error_message: string | null
          finished_at: string | null
          id: string
          input_data: Json | null
          output_data: Json | null
          score: number | null
          started_at: string
          status: string
          updated_at: string
        }
        Insert: {
          agent_id?: string | null
          created_at?: string
          duration_seconds?: number | null
          error_message?: string | null
          finished_at?: string | null
          id?: string
          input_data?: Json | null
          output_data?: Json | null
          score?: number | null
          started_at?: string
          status?: string
          updated_at?: string
        }
        Update: {
          agent_id?: string | null
          created_at?: string
          duration_seconds?: number | null
          error_message?: string | null
          finished_at?: string | null
          id?: string
          input_data?: Json | null
          output_data?: Json | null
          score?: number | null
          started_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_runs_agent_fk"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
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
          input_description: string | null
          last_run_at: string | null
          n8n_workflow_url: string | null
          name: string
          notes: string | null
          output_description: string | null
          project_id: string | null
          role: string | null
          status: string
          success_rate: number | null
          tools_used: string[] | null
          trigger_type: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          improvement_ideas?: string | null
          input_description?: string | null
          last_run_at?: string | null
          n8n_workflow_url?: string | null
          name: string
          notes?: string | null
          output_description?: string | null
          project_id?: string | null
          role?: string | null
          status?: string
          success_rate?: number | null
          tools_used?: string[] | null
          trigger_type?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          improvement_ideas?: string | null
          input_description?: string | null
          last_run_at?: string | null
          n8n_workflow_url?: string | null
          name?: string
          notes?: string | null
          output_description?: string | null
          project_id?: string | null
          role?: string | null
          status?: string
          success_rate?: number | null
          tools_used?: string[] | null
          trigger_type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_news: {
        Row: {
          category: string | null
          content: string | null
          created_at: string
          discovered_at: string
          id: string
          kind: string
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
          content?: string | null
          created_at?: string
          discovered_at?: string
          id?: string
          kind?: string
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
          content?: string | null
          created_at?: string
          discovered_at?: string
          id?: string
          kind?: string
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
            foreignKeyName: "ai_news_related_briefing_fk"
            columns: ["related_briefing_id"]
            isOneToOne: false
            referencedRelation: "daily_briefings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_news_related_briefing_id_fkey"
            columns: ["related_briefing_id"]
            isOneToOne: false
            referencedRelation: "daily_briefings"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_logs: {
        Row: {
          created_at: string
          duration_ms: number | null
          error_message: string | null
          finished_at: string | null
          id: string
          payload: Json | null
          result: Json | null
          source: string
          started_at: string
          status: string
          trigger_type: string | null
          updated_at: string
          workflow_name: string
        }
        Insert: {
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          finished_at?: string | null
          id?: string
          payload?: Json | null
          result?: Json | null
          source?: string
          started_at?: string
          status?: string
          trigger_type?: string | null
          updated_at?: string
          workflow_name: string
        }
        Update: {
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          finished_at?: string | null
          id?: string
          payload?: Json | null
          result?: Json | null
          source?: string
          started_at?: string
          status?: string
          trigger_type?: string | null
          updated_at?: string
          workflow_name?: string
        }
        Relationships: []
      }
      daily_briefings: {
        Row: {
          briefing_date: string
          created_at: string
          executive_summary: string | null
          hot_topics: string[] | null
          id: string
          key_links: Json | null
          learning_recommendation: string | null
          recommended_articles: Json | null
          related_experiment_id: string | null
          telegram_sent: boolean
          title: string
          updated_at: string
          why_it_matters: string | null
        }
        Insert: {
          briefing_date?: string
          created_at?: string
          executive_summary?: string | null
          hot_topics?: string[] | null
          id?: string
          key_links?: Json | null
          learning_recommendation?: string | null
          recommended_articles?: Json | null
          related_experiment_id?: string | null
          telegram_sent?: boolean
          title: string
          updated_at?: string
          why_it_matters?: string | null
        }
        Update: {
          briefing_date?: string
          created_at?: string
          executive_summary?: string | null
          hot_topics?: string[] | null
          id?: string
          key_links?: Json | null
          learning_recommendation?: string | null
          recommended_articles?: Json | null
          related_experiment_id?: string | null
          telegram_sent?: boolean
          title?: string
          updated_at?: string
          why_it_matters?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_briefings_related_experiment_fk"
            columns: ["related_experiment_id"]
            isOneToOne: false
            referencedRelation: "experiments"
            referencedColumns: ["id"]
          },
        ]
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
            foreignKeyName: "experiment_reviews_experiment_fk"
            columns: ["experiment_id"]
            isOneToOne: false
            referencedRelation: "experiments"
            referencedColumns: ["id"]
          },
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
          background_context: string | null
          category: string | null
          created_at: string
          difficulty: number | null
          estimated_time_minutes: number | null
          experiment_date: string
          id: string
          next_experiment_idea: string | null
          project_id: string | null
          result_summary: string | null
          result_url: string | null
          score_creativity: number | null
          score_documentation: number | null
          score_learning: number | null
          score_practical: number | null
          score_technical: number | null
          score_total: number | null
          self_reflection: string | null
          status: string
          step_by_step_instructions: string | null
          success_criteria: string | null
          task_description: string | null
          title: string
          tools_needed: string[] | null
          updated_at: string
          what_i_learned: string | null
        }
        Insert: {
          ai_feedback?: string | null
          background_context?: string | null
          category?: string | null
          created_at?: string
          difficulty?: number | null
          estimated_time_minutes?: number | null
          experiment_date?: string
          id?: string
          next_experiment_idea?: string | null
          project_id?: string | null
          result_summary?: string | null
          result_url?: string | null
          score_creativity?: number | null
          score_documentation?: number | null
          score_learning?: number | null
          score_practical?: number | null
          score_technical?: number | null
          score_total?: number | null
          self_reflection?: string | null
          status?: string
          step_by_step_instructions?: string | null
          success_criteria?: string | null
          task_description?: string | null
          title: string
          tools_needed?: string[] | null
          updated_at?: string
          what_i_learned?: string | null
        }
        Update: {
          ai_feedback?: string | null
          background_context?: string | null
          category?: string | null
          created_at?: string
          difficulty?: number | null
          estimated_time_minutes?: number | null
          experiment_date?: string
          id?: string
          next_experiment_idea?: string | null
          project_id?: string | null
          result_summary?: string | null
          result_url?: string | null
          score_creativity?: number | null
          score_documentation?: number | null
          score_learning?: number | null
          score_practical?: number | null
          score_technical?: number | null
          score_total?: number | null
          self_reflection?: string | null
          status?: string
          step_by_step_instructions?: string | null
          success_criteria?: string | null
          task_description?: string | null
          title?: string
          tools_needed?: string[] | null
          updated_at?: string
          what_i_learned?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "experiments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_journal: {
        Row: {
          created_at: string
          energy_level: number | null
          entry_date: string
          id: string
          mood: string | null
          next_improvement: string | null
          tags: string[] | null
          updated_at: string
          what_i_built: string | null
          what_i_learned: string | null
          what_surprised_me: string | null
          what_was_difficult: string | null
        }
        Insert: {
          created_at?: string
          energy_level?: number | null
          entry_date?: string
          id?: string
          mood?: string | null
          next_improvement?: string | null
          tags?: string[] | null
          updated_at?: string
          what_i_built?: string | null
          what_i_learned?: string | null
          what_surprised_me?: string | null
          what_was_difficult?: string | null
        }
        Update: {
          created_at?: string
          energy_level?: number | null
          entry_date?: string
          id?: string
          mood?: string | null
          next_improvement?: string | null
          tags?: string[] | null
          updated_at?: string
          what_i_built?: string | null
          what_i_learned?: string | null
          what_surprised_me?: string | null
          what_was_difficult?: string | null
        }
        Relationships: []
      }
      profile: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          daily_briefing_time: string | null
          daily_experiment_enabled: boolean
          daily_telegram_enabled: boolean
          development_goals: string[] | null
          display_name: string
          focus_areas: string[] | null
          id: string
          learning_score: number
          n8n_webhook_url: string | null
          public_summary: string | null
          skills: string[] | null
          strengths: string[] | null
          telegram_bot_status: string | null
          telegram_chat_id: string | null
          tools: string[] | null
          updated_at: string
          weekly_streak: number
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          daily_briefing_time?: string | null
          daily_experiment_enabled?: boolean
          daily_telegram_enabled?: boolean
          development_goals?: string[] | null
          display_name?: string
          focus_areas?: string[] | null
          id?: string
          learning_score?: number
          n8n_webhook_url?: string | null
          public_summary?: string | null
          skills?: string[] | null
          strengths?: string[] | null
          telegram_bot_status?: string | null
          telegram_chat_id?: string | null
          tools?: string[] | null
          updated_at?: string
          weekly_streak?: number
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          daily_briefing_time?: string | null
          daily_experiment_enabled?: boolean
          daily_telegram_enabled?: boolean
          development_goals?: string[] | null
          display_name?: string
          focus_areas?: string[] | null
          id?: string
          learning_score?: number
          n8n_webhook_url?: string | null
          public_summary?: string | null
          skills?: string[] | null
          strengths?: string[] | null
          telegram_bot_status?: string | null
          telegram_chat_id?: string | null
          tools?: string[] | null
          updated_at?: string
          weekly_streak?: number
        }
        Relationships: []
      }
      project_files: {
        Row: {
          created_at: string
          id: string
          kind: string
          notes: string | null
          project_id: string
          storage_path: string | null
          title: string
          updated_at: string
          url: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          kind?: string
          notes?: string | null
          project_id: string
          storage_path?: string | null
          title: string
          updated_at?: string
          url?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          notes?: string | null
          project_id?: string
          storage_path?: string | null
          title?: string
          updated_at?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_files_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_links: {
        Row: {
          created_at: string
          id: string
          kind: string
          label: string | null
          project_id: string
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          kind?: string
          label?: string | null
          project_id: string
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          label?: string | null
          project_id?: string
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_links_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string
          demo_url: string | null
          description: string | null
          future_ideas: string | null
          github_url: string | null
          id: string
          learnings: string | null
          name: string
          next_improvements: string | null
          notes: string | null
          problem_solved: string | null
          purpose: string | null
          status: string
          technologies: string[] | null
          tools_used: string[] | null
          updated_at: string
          value_created: string | null
        }
        Insert: {
          created_at?: string
          demo_url?: string | null
          description?: string | null
          future_ideas?: string | null
          github_url?: string | null
          id?: string
          learnings?: string | null
          name: string
          next_improvements?: string | null
          notes?: string | null
          problem_solved?: string | null
          purpose?: string | null
          status?: string
          technologies?: string[] | null
          tools_used?: string[] | null
          updated_at?: string
          value_created?: string | null
        }
        Update: {
          created_at?: string
          demo_url?: string | null
          description?: string | null
          future_ideas?: string | null
          github_url?: string | null
          id?: string
          learnings?: string | null
          name?: string
          next_improvements?: string | null
          notes?: string | null
          problem_solved?: string | null
          purpose?: string | null
          status?: string
          technologies?: string[] | null
          tools_used?: string[] | null
          updated_at?: string
          value_created?: string | null
        }
        Relationships: []
      }
      score_events: {
        Row: {
          created_at: string
          event_date: string
          id: string
          points: number
          reason: string | null
          related_experiment_id: string | null
          related_project_id: string | null
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          event_date?: string
          id?: string
          points?: number
          reason?: string | null
          related_experiment_id?: string | null
          related_project_id?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          event_date?: string
          id?: string
          points?: number
          reason?: string | null
          related_experiment_id?: string | null
          related_project_id?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "score_events_related_experiment_id_fkey"
            columns: ["related_experiment_id"]
            isOneToOne: false
            referencedRelation: "experiments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "score_events_related_project_id_fkey"
            columns: ["related_project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
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
          created_at: string
          discovered_at: string
          id: string
          main_arguments: string | null
          opportunity: string | null
          platform: string | null
          post_url: string | null
          relevance_score: number | null
          suggested_content_idea: string | null
          suggested_response: string | null
          summary: string | null
          topic: string | null
          updated_at: string
        }
        Insert: {
          author?: string | null
          comment_analysis?: string | null
          created_at?: string
          discovered_at?: string
          id?: string
          main_arguments?: string | null
          opportunity?: string | null
          platform?: string | null
          post_url?: string | null
          relevance_score?: number | null
          suggested_content_idea?: string | null
          suggested_response?: string | null
          summary?: string | null
          topic?: string | null
          updated_at?: string
        }
        Update: {
          author?: string | null
          comment_analysis?: string | null
          created_at?: string
          discovered_at?: string
          id?: string
          main_arguments?: string | null
          opportunity?: string | null
          platform?: string | null
          post_url?: string | null
          relevance_score?: number | null
          suggested_content_idea?: string | null
          suggested_response?: string | null
          summary?: string | null
          topic?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      telegram_messages: {
        Row: {
          content: string | null
          created_at: string
          id: string
          message_date: string
          message_type: string
          related_briefing_id: string | null
          related_experiment_id: string | null
          sent_at: string
          telegram_status: string | null
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          message_date?: string
          message_type?: string
          related_briefing_id?: string | null
          related_experiment_id?: string | null
          sent_at?: string
          telegram_status?: string | null
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          message_date?: string
          message_type?: string
          related_briefing_id?: string | null
          related_experiment_id?: string | null
          sent_at?: string
          telegram_status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "telegram_messages_related_briefing_fk"
            columns: ["related_briefing_id"]
            isOneToOne: false
            referencedRelation: "daily_briefings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "telegram_messages_related_briefing_id_fkey"
            columns: ["related_briefing_id"]
            isOneToOne: false
            referencedRelation: "daily_briefings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "telegram_messages_related_experiment_id_fkey"
            columns: ["related_experiment_id"]
            isOneToOne: false
            referencedRelation: "experiments"
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
