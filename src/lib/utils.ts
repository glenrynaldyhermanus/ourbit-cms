/**
 * Format number to Indonesian currency format
 * @param value - Number to format
 * @returns Formatted string with dots as thousand separators
 */
export function formatCurrency(value: number | string): string {
	const numValue = typeof value === "string" ? parseFloat(value) || 0 : value;
	return numValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/**
 * Parse formatted currency string back to number
 * @param formattedValue - Formatted currency string (e.g., "10.000")
 * @returns Number value
 */
export function parseCurrency(formattedValue: string): number {
	return parseInt(formattedValue.replace(/\./g, "")) || 0;
}

/**
 * Format input value for currency display
 * @param value - Raw input value
 * @returns Formatted currency string
 */
export function formatCurrencyInput(value: string): string {
	// Remove all non-digit characters
	const cleanValue = value.replace(/\D/g, "");

	// If empty, return empty string
	if (!cleanValue) return "";

	// Format with dots
	return formatCurrency(parseInt(cleanValue));
}

/**
 * Format number to Indonesian number format (for integers)
 * @param value - Number to format
 * @returns Formatted string with dots as thousand separators
 */
export function formatNumber(value: number | string): string {
	const numValue = typeof value === "string" ? parseInt(value) || 0 : value;
	return numValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/**
 * Parse formatted number string back to number
 * @param formattedValue - Formatted number string (e.g., "1.000")
 * @returns Number value
 */
export function parseNumber(formattedValue: string): number {
	return parseInt(formattedValue.replace(/\./g, "")) || 0;
}

/**
 * Format input value for number display (integers only)
 * @param value - Raw input value
 * @returns Formatted number string
 */
export function formatNumberInput(value: string): string {
	// Remove all non-digit characters
	const cleanValue = value.replace(/\D/g, "");

	// If empty, return empty string
	if (!cleanValue) return "";

	// Format with dots
	return formatNumber(parseInt(cleanValue));
}
