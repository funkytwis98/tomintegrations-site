import { createClient } from "@supabase/supabase-js";

export function getCommandCenterClient() {
  const url = process.env.COMMAND_CENTER_SUPABASE_URL!;
  const anonKey = process.env.COMMAND_CENTER_SUPABASE_ANON_KEY!;
  return createClient(url, anonKey);
}
