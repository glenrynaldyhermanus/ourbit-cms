import { supabase } from "@/lib/supabase";

// Types based on database schema
export interface InventoryItem {
	id: string;
	product_name: string;
	sku: string;
	category_name: string;
	category_id: string;
	current_stock: number;
	min_stock: number;
	max_stock: number;
	unit: string;
	location?: string;
	last_updated: string;
	supplier_name?: string;
	cost_price: number;
	selling_price: number;
	store_id: string;
	store_name: string;
	status: "in_stock" | "low_stock" | "out_of_stock" | "overstock";
	is_active: boolean;
}

export interface InventoryTransaction {
	id: string;
	product_id: string;
	store_id: string;
	type: string;
	quantity: number;
	previous_qty: number;
	new_qty: number;
	reference_id?: string;
	notes?: string;
	batch_number?: string;
	expiry_date?: string;
	unit_cost?: number;
	total_cost?: number;
	created_at: string;
	created_by: string;
}

export interface StockOpnameSession {
	id: string;
	store_id: string;
	status: string;
	started_at: string;
	finished_at?: string;
	total_items: number;
	items_counted: number;
	total_variance_value: number;
	notes?: string;
	created_by: string;
	created_at: string;
}

export interface StockOpnameItem {
	id: string;
	session_id: string;
	product_id: string;
	expected_qty: number;
	actual_qty: number;
	variance_qty: number;
	variance_value: number;
	notes?: string;
	created_at: string;
}

export interface OptionItem {
	key: string;
	value: string;
}

// Utility Functions

/**
 * Fetch options from database by type
 */
export const fetchOptions = async (type: string): Promise<OptionItem[]> => {
	try {
		const { data, error } = await supabase
			.from("options")
			.select("key, value")
			.eq("type", type)
			.order("value");

		if (error) {
			console.error(`Error fetching options for type ${type}:`, error);
			return [];
		}

		return data || [];
	} catch (error) {
		console.error(`Error fetching options for type ${type}:`, error);
		return [];
	}
};

/**
 * Fetch inventory transaction types
 */
export const fetchInventoryTransactionTypes = () =>
	fetchOptions("inventory_transaction_type");

/**
 * Fetch stock opname status options
 */
export const fetchStockOpnameStatus = () => fetchOptions("stock_opname_status");

/**
 * Calculate stock status based on current, min, and max stock
 */
export const calculateStockStatus = (
	currentStock: number,
	minStock: number,
	maxStock: number
): "in_stock" | "low_stock" | "out_of_stock" | "overstock" => {
	if (currentStock <= 0) return "out_of_stock";
	if (currentStock <= minStock) return "low_stock";
	if (currentStock >= maxStock) return "overstock";
	return "in_stock";
};

/**
 * Fetch inventory items with category and store info
 */
export const fetchInventoryItems = async (
	storeId?: string
): Promise<InventoryItem[]> => {
	try {
		let query = supabase
			.from("products")
			.select(
				`
				id,
				name,
				code,
				stock,
				min_stock,
				unit,
				purchase_price,
				selling_price,
				is_active,
				updated_at,
				rack_location,
				categories:category_id (
					id,
					name
				),
				stores:store_id (
					id,
					name
				)
			`
			)
			.eq("is_active", true);

		if (storeId) {
			query = query.eq("store_id", storeId);
		}

		const { data, error } = await query.order("name");

		if (error) {
			console.error("Error fetching inventory items:", error);
			return [];
		}

		return (data || []).map((item) => ({
			id: item.id,
			product_name: item.name,
			sku: item.code || "",
			category_name:
				(item.categories as unknown as { name: string; id: string })?.name ||
				"Tidak Berkategori",
			category_id:
				(item.categories as unknown as { name: string; id: string })?.id || "",
			current_stock: item.stock || 0,
			min_stock: item.min_stock || 0,
			max_stock: 1000, // Default max stock since field doesn't exist in schema
			unit: item.unit || "pcs",
			location: item.rack_location || "Gudang Utama",
			last_updated: item.updated_at,
			supplier_name: "Tidak Ada Supplier", // No supplier table in current schema
			cost_price: item.purchase_price || 0,
			selling_price: item.selling_price || 0,
			store_id:
				(item.stores as unknown as { id: string; name: string })?.id || "",
			store_name:
				(item.stores as unknown as { id: string; name: string })?.name ||
				"Tidak Ada Toko",
			status: calculateStockStatus(
				item.stock || 0,
				item.min_stock || 0,
				1000 // Default max stock since field doesn't exist in schema
			),
			is_active: item.is_active,
		}));
	} catch (error) {
		console.error("Error fetching inventory items:", error);
		return [];
	}
};

/**
 * Create inventory transaction
 */
export const createInventoryTransaction = async (
	transaction: Omit<InventoryTransaction, "id" | "created_at">
): Promise<{ success: boolean; error?: string }> => {
	try {
		console.log("Creating inventory transaction:", transaction);

		const { error } = await supabase.from("inventory_transactions").insert([
			{
				product_id: transaction.product_id,
				store_id: transaction.store_id,
				type: 1, // Default type for adjustment
				quantity: transaction.quantity,
				reference: transaction.reference_id || null,
				note: transaction.notes || null,
			},
		]);

		if (error) {
			console.error("Error creating inventory transaction:", error);
			return { success: false, error: error.message };
		}

		console.log("Inventory transaction created successfully");
		return { success: true };
	} catch (error) {
		console.error("Error creating inventory transaction:", error);
		return { success: false, error: "Failed to create transaction" };
	}
};

/**
 * Update product stock
 */
export const updateProductStock = async (
	productId: string,
	newStock: number
): Promise<{ success: boolean; error?: string }> => {
	try {
		const { error } = await supabase
			.from("products")
			.update({
				stock: newStock,
				updated_at: new Date().toISOString(),
			})
			.eq("id", productId);

		if (error) {
			console.error("Error updating product stock:", error);
			return { success: false, error: error.message };
		}

		return { success: true };
	} catch (error) {
		console.error("Error updating product stock:", error);
		return { success: false, error: "Failed to update stock" };
	}
};

/**
 * Perform stock adjustment
 */
export const performStockAdjustment = async (
	productId: string,
	adjustmentType: "add" | "subtract",
	quantity: number,
	reason: string,
	note: string,
	currentStock: number,
	userId: string,
	storeId: string
): Promise<{ success: boolean; error?: string }> => {
	try {
		console.log("Starting stock adjustment:", {
			productId,
			adjustmentType,
			quantity,
			reason,
			note,
			currentStock,
			userId,
			storeId,
		});

		const newStock =
			adjustmentType === "add"
				? currentStock + quantity
				: currentStock - quantity;

		console.log("Calculated new stock:", newStock);

		// Ensure stock doesn't go below 0
		if (newStock < 0) {
			console.error("Stock would go below 0");
			return { success: false, error: "Stok tidak boleh kurang dari 0" };
		}

		// Update product stock
		console.log("Updating product stock...");
		const stockUpdateResult = await updateProductStock(productId, newStock);
		if (!stockUpdateResult.success) {
			console.error("Failed to update product stock:", stockUpdateResult.error);
			return stockUpdateResult;
		}
		console.log("Product stock updated successfully");

		// Create inventory transaction
		console.log("Creating inventory transaction...");
		const transactionResult = await createInventoryTransaction({
			product_id: productId,
			store_id: storeId,
			type: "adjustment",
			quantity: adjustmentType === "add" ? quantity : -quantity,
			previous_qty: currentStock,
			new_qty: newStock,
			reference_id: reason,
			notes: note || `${reason} penyesuaian stok`,
			created_by: userId,
		});

		console.log("Stock adjustment completed:", transactionResult);
		return transactionResult;
	} catch (error) {
		console.error("Error performing stock adjustment:", error);
		return { success: false, error: "Failed to perform stock adjustment" };
	}
};

/**
 * Fetch active stock opname session
 */
export const fetchActiveStockOpname = async (
	storeId: string
): Promise<StockOpnameSession | null> => {
	try {
		const { data, error } = await supabase
			.from("stock_opname_sessions")
			.select("*")
			.eq("store_id", storeId)
			.in("status", ["1", "2"]) // Using numeric status as per schema
			.order("created_at", { ascending: false })
			.limit(1)
			.single();

		if (error && error.code !== "PGRST116") {
			// PGRST116 = no rows found
			console.error("Error fetching active stock opname:", error);
			return null;
		}

		return data || null;
	} catch (error) {
		console.error("Error fetching active stock opname:", error);
		return null;
	}
};

/**
 * Create stock opname session
 */
export const createStockOpnameSession = async (
	storeId: string,
	userId: string
): Promise<{ success: boolean; data?: StockOpnameSession; error?: string }> => {
	try {
		const { data, error } = await supabase
			.from("stock_opname_sessions")
			.insert([
				{
					store_id: storeId,
					status: "2", // in_progress status as per schema
					started_at: new Date().toISOString(),
					created_by: userId,
				},
			])
			.select()
			.single();

		if (error) {
			console.error("Error creating stock opname session:", error);
			return { success: false, error: error.message };
		}

		return { success: true, data };
	} catch (error) {
		console.error("Error creating stock opname session:", error);
		return { success: false, error: "Failed to create stock opname session" };
	}
};

/**
 * Update stock opname session
 */
export const updateStockOpnameSession = async (
	sessionId: string,
	updates: Partial<StockOpnameSession>
): Promise<{ success: boolean; error?: string }> => {
	try {
		const { error } = await supabase
			.from("stock_opname_sessions")
			.update(updates)
			.eq("id", sessionId);

		if (error) {
			console.error("Error updating stock opname session:", error);
			return { success: false, error: error.message };
		}

		return { success: true };
	} catch (error) {
		console.error("Error updating stock opname session:", error);
		return { success: false, error: "Failed to update stock opname session" };
	}
};

/**
 * Create or update stock opname item
 */
export const upsertStockOpnameItem = async (
	sessionId: string,
	productId: string,
	expectedQty: number,
	actualQty: number,
	notes?: string
): Promise<{ success: boolean; error?: string }> => {
	try {
		// Assuming cost_price from product for variance_value calculation
		// In real implementation, should fetch current cost_price
		// TODO: Calculate variance_value with actual cost price

		const { error } = await supabase.from("stock_opname_items").upsert(
			[
				{
					session_id: sessionId,
					product_id: productId,
					expected_qty: expectedQty,
					actual_qty: actualQty,
					note: notes || null,
				},
			],
			{
				onConflict: "session_id,product_id",
			}
		);

		if (error) {
			console.error("Error upserting stock opname item:", error);
			return { success: false, error: error.message };
		}

		return { success: true };
	} catch (error) {
		console.error("Error upserting stock opname item:", error);
		return { success: false, error: "Failed to save stock opname item" };
	}
};

/**
 * Complete stock opname session
 */
export const completeStockOpname = async (
	sessionId: string,
	opnameData: Record<string, { expected: number; actual: number; note: string }>
): Promise<{ success: boolean; error?: string }> => {
	try {
		// Save all opname items
		for (const [productId, data] of Object.entries(opnameData)) {
			const result = await upsertStockOpnameItem(
				sessionId,
				productId,
				data.expected,
				data.actual,
				data.note
			);

			if (!result.success) {
				return result;
			}

			// Update product stock if there's variance
			if (data.actual !== data.expected) {
				const stockResult = await updateProductStock(productId, data.actual);
				if (!stockResult.success) {
					return stockResult;
				}

				// Create inventory transaction for stock opname adjustment
				await createInventoryTransaction({
					product_id: productId,
					store_id: "", // TODO: Get from session
					type: "stock_opname",
					quantity: data.actual - data.expected,
					previous_qty: data.expected,
					new_qty: data.actual,
					reference_id: sessionId,
					notes: `Stock Opname: ${data.note}`,
					created_by: "", // TODO: Get from session
				});
			}
		}

		// Update session status to completed
		const sessionResult = await updateStockOpnameSession(sessionId, {
			status: "3", // completed status as per schema
			finished_at: new Date().toISOString(),
		});

		return sessionResult;
	} catch (error) {
		console.error("Error completing stock opname:", error);
		return { success: false, error: "Failed to complete stock opname" };
	}
};

/**
 * Get current user store ID (helper function)
 */
export const getCurrentUserStoreId = async (): Promise<string | null> => {
	try {
		const {
			data: { user },
			error,
		} = await supabase.auth.getUser();

		if (error || !user) {
			console.error("Error getting user:", error);
			return null;
		}

		// Get the first store the user has access to via role_assignments
		const { data: userStores, error: storeError } = await supabase
			.from("role_assignments")
			.select("store_id")
			.eq("user_id", user.id)
			.limit(1)
			.single();

		if (storeError) {
			console.error("Error getting user store:", storeError);
			return null;
		}

		return userStores?.store_id || null;
	} catch (error) {
		console.error("Error getting current user store ID:", error);
		return null;
	}
};
