import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type TableName =
  | "profile"
  | "projects"
  | "agents"
  | "agent_runs"
  | "daily_briefings"
  | "experiments"
  | "experiment_reviews"
  | "ai_news"
  | "social_insights"
  | "learning_journal"
  | "skills"
  | "score_events"
  | "telegram_messages"
  | "automation_logs";

export function listQuery<T = any>(
  table: TableName,
  orderBy: { column: string; ascending?: boolean } = { column: "created_at", ascending: false },
) {
  return queryOptions({
    queryKey: [table, "list", orderBy],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .order(orderBy.column, { ascending: orderBy.ascending ?? false });
      if (error) throw error;
      return (data ?? []) as T[];
    },
  });
}

export function rowQuery<T = any>(table: TableName, id: string) {
  return queryOptions({
    queryKey: [table, "row", id],
    queryFn: async () => {
      const { data, error } = await supabase.from(table).select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data as T | null;
    },
    enabled: !!id,
  });
}
