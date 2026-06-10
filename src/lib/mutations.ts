import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useUpsert(table: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: any) => {
      const payload = { ...values };
      let res;
      if (payload.id) {
        const { id, created_at, updated_at, ...rest } = payload;
        res = await supabase.from(table as any).update(rest).eq("id", id).select().maybeSingle();
      } else {
        const { created_at, updated_at, ...rest } = payload;
        res = await supabase.from(table as any).insert(rest).select().maybeSingle();
      }
      if (res.error) throw res.error;
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [table] });
      toast.success("Tallennettu");
    },
    onError: (e: any) => toast.error(e.message || "Tallennus epäonnistui"),
  });
}

export function useDelete(table: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(table as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [table] });
      toast.success("Poistettu");
    },
    onError: (e: any) => toast.error(e.message || "Poisto epäonnistui"),
  });
}

export function csvToArray(s: string): string[] {
  return s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

export function arrayToCsv(a: string[] | null | undefined): string {
  return (a || []).join(", ");
}
