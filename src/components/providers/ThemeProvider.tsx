"use client";

import React, {
	createContext,
	useContext,
	useEffect,
	useState,
	useCallback,
} from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
	theme: Theme;
	setTheme: (theme: Theme) => void;
	actualTheme: "light" | "dark"; // The actual resolved theme (light or dark)
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
	const context = useContext(ThemeContext);
	if (!context) {
		throw new Error("useTheme must be used within a ThemeProvider");
	}
	return context;
}

interface ThemeProviderProps {
	children: React.ReactNode;
	defaultTheme?: Theme;
}

export function ThemeProvider({
	children,
	defaultTheme = "system",
}: ThemeProviderProps) {
	const [theme, setTheme] = useState<Theme>(defaultTheme);
	const [actualTheme, setActualTheme] = useState<"light" | "dark">("light");

	// Get system theme preference
	const getSystemTheme = useCallback((): "light" | "dark" => {
		if (typeof window !== "undefined") {
			return window.matchMedia("(prefers-color-scheme: dark)").matches
				? "dark"
				: "light";
		}
		return "light";
	}, []);

	// Resolve the actual theme based on current setting
	const resolveTheme = useCallback(
		(currentTheme: Theme): "light" | "dark" => {
			if (currentTheme === "system") {
				return getSystemTheme();
			}
			return currentTheme;
		},
		[getSystemTheme]
	);

	// Apply theme to document
	const applyTheme = useCallback((resolvedTheme: "light" | "dark") => {
		if (typeof window !== "undefined") {
			const root = window.document.documentElement;
			root.classList.remove("light", "dark");
			root.classList.add(resolvedTheme);
			setActualTheme(resolvedTheme);
		}
	}, []);

	// Load theme from localStorage on mount
	useEffect(() => {
		if (typeof window !== "undefined") {
			const savedTheme = localStorage.getItem("ourbit-theme") as Theme;
			if (savedTheme && ["light", "dark", "system"].includes(savedTheme)) {
				setTheme(savedTheme);
			}
		}
	}, []);

	// Update theme when it changes
	useEffect(() => {
		const resolvedTheme = resolveTheme(theme);
		applyTheme(resolvedTheme);

		// Save to localStorage
		if (typeof window !== "undefined") {
			localStorage.setItem("ourbit-theme", theme);
		}
	}, [theme, resolveTheme, applyTheme]);

	// Listen for system theme changes when theme is set to "system"
	useEffect(() => {
		if (theme !== "system") return;

		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
		const handleChange = () => {
			const resolvedTheme = resolveTheme(theme);
			applyTheme(resolvedTheme);
		};

		mediaQuery.addEventListener("change", handleChange);
		return () => mediaQuery.removeEventListener("change", handleChange);
	}, [theme, resolveTheme, applyTheme]);

	// Initialize theme on mount
	useEffect(() => {
		const resolvedTheme = resolveTheme(theme);
		applyTheme(resolvedTheme);
	}, [resolveTheme, applyTheme, theme]);

	const value: ThemeContextType = {
		theme,
		setTheme,
		actualTheme,
	};

	return (
		<ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
	);
}
