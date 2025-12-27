// config/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_KEY;
const anon_key = process.env.SUPABASE_ANON_KEY;

if (!url || !key) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_KEY in environment");
}

export const supabase = createClient(url, key);

export const supabaseLogin = createClient(url, anon_key);