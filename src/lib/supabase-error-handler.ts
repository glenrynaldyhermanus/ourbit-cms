export interface SupabaseError {
	code?: string;
	message?: string;
	details?: string;
	hint?: string;
}

export interface ErrorHandlerOptions {
	operation: string;
	entity?: string;
	showToast?: (type: "success" | "error", message: string) => void;
	logError?: boolean;
}

/**
 * Standard error handler untuk semua query Supabase
 */
export function handleSupabaseError(
	error: SupabaseError | null | undefined,
	options: ErrorHandlerOptions
): { success: boolean; message: string } {
	// Handle null, undefined, or empty error objects
	if (
		!error ||
		(typeof error === "object" && Object.keys(error).length === 0)
	) {
		return { success: true, message: "" };
	}

	// Log error untuk debugging
	if (options.logError !== false) {
		// Check if error object is empty
		const isEmptyError =
			typeof error === "object" &&
			error !== null &&
			Object.keys(error).length === 0;

		console.error(`Supabase ${options.operation} error:`, {
			isEmptyError,
			code: isEmptyError ? "EMPTY_OBJECT" : error?.code || "UNKNOWN",
			message: isEmptyError
				? "Empty error object"
				: error?.message || "Unknown error",
			details: error?.details || "",
			hint: error?.hint || "",
			entity: options.entity,
			errorObject: error,
		});
	}

	// Check if error object is empty
	const isEmptyError =
		typeof error === "object" &&
		error !== null &&
		Object.keys(error).length === 0;

	// Handle specific error codes
	switch (isEmptyError ? "EMPTY_OBJECT" : error?.code || "UNKNOWN") {
		// RLS (Row Level Security) errors
		case "PGRST116":
			return {
				success: false,
				message: `Akses ditolak. Anda tidak memiliki izin untuk ${
					options.operation
				} ${options.entity || "data"}.`,
			};

		// Permission denied
		case "42501":
			return {
				success: false,
				message: `Permission denied. Silakan hubungi administrator untuk mengatur RLS policy.`,
			};

		// Foreign key violation
		case "23503":
			return {
				success: false,
				message: `Data tidak dapat ${options.operation} karena masih terhubung dengan data lain.`,
			};

		// Unique constraint violation
		case "23505":
			return {
				success: false,
				message: `Data sudah ada. Silakan gunakan data yang berbeda.`,
			};

		// Not null violation
		case "23502":
			return {
				success: false,
				message: `Data wajib diisi. Silakan lengkapi semua field yang diperlukan.`,
			};

		// Check constraint violation
		case "23514":
			return {
				success: false,
				message: `Data tidak valid. Silakan periksa kembali input Anda.`,
			};

		// Empty error object
		case "EMPTY_OBJECT":
			return {
				success: true,
				message: "",
			};

		// Table not found errors
		case "42P01":
			return {
				success: false,
				message: `Tabel tidak ditemukan. Silakan hubungi administrator.`,
			};

		// Connection errors
		case "PGRST301":
			return {
				success: false,
				message: `Koneksi ke database terputus. Silakan coba lagi.`,
			};

		// Timeout errors
		case "PGRST302":
			return {
				success: false,
				message: `Request timeout. Silakan coba lagi.`,
			};

		// JWT errors
		case "PGRST301":
			return {
				success: false,
				message: `Sesi login telah berakhir. Silakan login ulang.`,
			};

		// RLS related errors
		default:
			if (
				error?.message?.includes("RLS") ||
				error?.message?.includes("row level security")
			) {
				return {
					success: false,
					message: `Row Level Security (RLS) memblokir akses. Silakan hubungi administrator.`,
				};
			}

			// Generic error
			return {
				success: false,
				message: `Gagal ${options.operation} ${options.entity || "data"}: ${
					error?.message || "Terjadi kesalahan"
				}`,
			};
	}
}

/**
 * Standard success handler
 */
export function handleSupabaseSuccess(
	operation: string,
	entity?: string,
	showToast?: (type: "success" | "error", message: string) => void
): void {
	const message = `${entity || "Data"} berhasil ${operation}!`;

	if (showToast) {
		showToast("success", message);
	}

	console.log(`Supabase ${operation} success:`, message);
}

/**
 * Standard query wrapper dengan error handling
 */
export async function executeSupabaseQuery<T>(
	queryFn: () => Promise<{ data: T | null; error: SupabaseError | null }>,
	options: ErrorHandlerOptions
): Promise<{ data: T | null; success: boolean; message: string }> {
	try {
		const { data, error } = await queryFn();

		const errorResult = handleSupabaseError(error, options);

		if (!errorResult.success) {
			return {
				data: null,
				success: false,
				message: errorResult.message,
			};
		}

		return {
			data,
			success: true,
			message: "",
		};
	} catch (error) {
		console.error(`Unexpected error in ${options.operation}:`, error);
		return {
			data: null,
			success: false,
			message: `Terjadi kesalahan tak terduga saat ${options.operation}.`,
		};
	}
}
