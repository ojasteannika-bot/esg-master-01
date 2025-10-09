// src/lib/supabase/server.ts
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/** Server-side Supabase klient (kasutab SERVICE ROLE võtit) */
export function createServerClient() {
  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}
