"use client";

import React from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";
import Button from "./Button";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
	className?: string;
	variant?: "default" | "outline" | "ghost";
	size?: "default" | "sm" | "lg" | "icon";
	showLabel?: boolean;
}

const themeOptions = [
	{ value: "light" as const, icon: Sun, label: "Light" },
	{ value: "dark" as const, icon: Moon, label: "Dark" },
	{ value: "system" as const, icon: Monitor, label: "System" },
];

export default function ThemeToggle({
	className = "",
	variant = "ghost",
	size = "icon",
	showLabel = false,
}: ThemeToggleProps) {
	const { theme, setTheme } = useTheme();

	// Cycle through themes
	const cycleTheme = () => {
		const currentIndex = themeOptions.findIndex(
			(option) => option.value === theme
		);
		const nextIndex = (currentIndex + 1) % themeOptions.length;
		setTheme(themeOptions[nextIndex].value);
	};

	const currentTheme = themeOptions.find((option) => option.value === theme);
	const CurrentIcon = currentTheme?.icon || Sun;

	if (showLabel) {
		return (
			<div className={cn("flex flex-col gap-2", className)}>
				<span className="text-sm font-medium text-[var(--foreground)]">Tema</span>
				<div className="flex items-center gap-1 p-1 bg-[var(--muted)] rounded-lg">
					{themeOptions.map((option) => {
						const Icon = option.icon;
						const isActive = theme === option.value;

						return (
							<Button
								key={option.value}
								variant={isActive ? "default" : "ghost"}
								size="sm"
								onClick={() => setTheme(option.value)}
								className={cn(
									"flex-1 gap-2 transition-all",
									isActive
										? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm"
										: "hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]"
								)}>
								<Icon className="w-4 h-4" />
								<span className="text-xs">{option.label}</span>
							</Button>
						);
					})}
				</div>
			</div>
		);
	}

	return (
		<Button
			variant={variant}
			size={size}
			onClick={cycleTheme}
			className={cn("transition-all duration-200", className)}>
			<CurrentIcon className="w-4 h-4" />
		</Button>
	);
}

// Export alternative component for dropdown style
export function ThemeDropdown({ className = "" }: { className?: string }) {
	const { theme, setTheme } = useTheme();

	return (
		<div className={cn("relative", className)}>
			<select
				value={theme}
				onChange={(e) =>
					setTheme(e.target.value as "light" | "dark" | "system")
				}
				className="w-full px-3 py-2 text-sm border border-input bg-[var(--background)] rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent">
				<option value="light">Light</option>
				<option value="dark">Dark</option>
				<option value="system">System</option>
			</select>
		</div>
	);
}
