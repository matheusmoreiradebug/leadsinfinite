// Browser-side Supabase client — usa ANON KEY (segura para o frontend)
import { createClient } from "@supabase/supabase-js";

export function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Alias para compatibilidade com imports existentes
export const supabase = typeof window !== "undefined"
  ? getSupabase()
  : null as never;
