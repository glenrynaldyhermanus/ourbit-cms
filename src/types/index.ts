export interface Product {
	id: string;
	name: string;
	description?: string;
	selling_price: number;
	purchase_price: number;
	category_id?: string;
	category_name?: string; // For joined category name
	stock: number;
	code: string;
	image_url?: string;
	type: string;
	unit?: string;
	weight_grams: number;
	rack_location?: string;
	min_stock: number;
	is_active?: boolean;
	created_at: string;
	updated_at: string;
	store_id: string;
}

export interface Category {
	id: string;
	name: string;
	description?: string;
	created_at: string;
}

export interface Customer {
	id: string;
	name: string;
	code?: string;
	email?: string;
	phone?: string;
	address?: string;
	city_id?: string;
	province_id?: string;
	country_id?: string;
	tax_number?: string;
	customer_type?: "retail" | "wholesale" | "corporate";
	credit_limit?: number;
	payment_terms?: number;
	is_active?: boolean;
	notes?: string;
	business_id: string;
	created_at: string;
	updated_at?: string;
}

export interface Supplier {
	id: string;
	name: string;
	code?: string;
	contact_person?: string;
	email?: string;
	phone?: string;
	address?: string;
	city_id?: string;
	province_id?: string;
	country_id?: string;
	tax_number?: string;
	bank_name?: string;
	bank_account_number?: string;
	bank_account_name?: string;
	credit_limit?: number;
	payment_terms?: number;
	is_active?: boolean;
	notes?: string;
	business_id: string;
	created_at: string;
	updated_at?: string;
}

export interface OrderItem {
	id: string;
	order_id: string;
	product_id: string;
	quantity: number;
	price: number;
	product?: Product;
}

export interface Order {
	id: string;
	customer_id?: string;
	total_amount: number;
	tax_amount: number;
	discount_amount: number;
	status: "pending" | "completed" | "cancelled";
	payment_method: "cash" | "card" | "digital";
	created_at: string;
	customer?: Customer;
	order_items?: OrderItem[];
}

export interface CartItem {
	product: Product;
	quantity: number;
}

export interface InventoryTransaction {
	id: string;
	product_id: string;
	store_id: string;
	type: number;
	quantity: number;
	reference?: string;
	note?: string;
	previous_qty?: number;
	new_qty?: number;
	batch_number?: string;
	expiry_date?: string;
	unit_cost?: number;
	total_cost?: number;
	created_at: string;
	created_by: string;
}

export interface Store {
	id: string;
	name: string;
	address: string;
	latitude?: number;
	longitude?: number;
	phone_country_code: string;
	phone_number: string;
	phone_verified?: boolean;
	business_field: string;
	business_description?: string;
	stock_setting: string;
	currency: string;
	default_tax_rate: number;
	motto?: string;
	is_branch: boolean;
	business_id: string;
	country_id: string;
	province_id: string;
	city_id: string;
	created_at: string;
	updated_at?: string;
}

export interface Role {
	id: string;
	name: string;
	created_at: string;
	updated_at?: string;
}

export interface User {
	id: string;
	name?: string;
	email: string;
	phone?: string;
	created_at: string;
	updated_at?: string;
}

export interface RoleAssignment {
	id: string;
	user_id: string;
	business_id: string;
	role_id: string;
	store_id: string;
	created_at: string;
	updated_at?: string;
}

export interface StaffMember extends User {
	role?: Role;
	role_assignment_id?: string;
	store_id?: string;
}

export interface ProfitLossItem {
	id: string;
	category:
		| "revenue"
		| "cost_of_goods"
		| "operating_expense"
		| "other_income"
		| "other_expense";
	subcategory: string;
	description: string;
	amount: number;
	percentage_of_revenue?: number;
	created_at: string;
}

export interface ProfitLossStats {
	total_revenue: number;
	total_cost_of_goods: number;
	total_operating_expenses: number;
	total_other_income: number;
	total_other_expenses: number;
	gross_profit: number;
	operating_profit: number;
	net_profit: number;
	gross_margin: number;
	net_margin: number;
}
