import { createClient } from "@supabase/supabase-js";

// Ganti dengan URL dan key Supabase Anda
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
	console.error(
		"Error: NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY harus diset di environment variables"
	);
	process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
	try {
		console.log("Menjalankan migration untuk menambahkan field is_active...");

		const { error } = await supabase.rpc("exec_sql", {
			sql: `
        ALTER TABLE public.products 
        ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;
        
        COMMENT ON COLUMN public.products.is_active IS 'Status aktif produk (true = aktif, false = non-aktif)';
      `,
		});

		if (error) {
			console.error("Error menjalankan migration:", error);
			return;
		}

		console.log(
			"✅ Migration berhasil! Field is_active telah ditambahkan ke tabel products."
		);
		console.log(
			"Sekarang fitur status aktif/non-aktif produk akan berfungsi dengan baik."
		);
	} catch (error) {
		console.error("Error:", error);
	}
}

runMigration();
