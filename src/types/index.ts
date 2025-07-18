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
	email?: string;
	phone?: string;
	address?: string;
	created_at: string;
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
