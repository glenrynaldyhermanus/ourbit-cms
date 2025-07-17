// Helper functions for store management
export const getStoreId = (): string | null => {
	if (typeof window === "undefined") return null;

	try {
		const storeId = localStorage.getItem("store_id");
		return storeId;
	} catch (error) {
		console.error("Error getting store ID from localStorage:", error);
		return null;
	}
};

export const getBusinessId = (): string | null => {
	if (typeof window === "undefined") return null;

	try {
		const businessId = localStorage.getItem("business_id");
		return businessId;
	} catch (error) {
		console.error("Error getting business ID from localStorage:", error);
		return null;
	}
};

export const setCurrentStore = (storeId: string) => {
	if (typeof window === "undefined") return;

	try {
		localStorage.setItem("store_id", storeId);
	} catch (error) {
		console.error("Error setting current store:", error);
	}
};

export const setCurrentBusiness = (businessId: string) => {
	if (typeof window === "undefined") return;

	try {
		localStorage.setItem("business_id", businessId);
	} catch (error) {
		console.error("Error setting current business:", error);
	}
};
