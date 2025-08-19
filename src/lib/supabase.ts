import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
	// Default all queries to the 'ourbit' schema. Use supabase.schema('common') for common tables.
	db: { schema: "ourbit" },
});

export default supabase;
