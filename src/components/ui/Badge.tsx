import React from "react";

interface BadgeProps {
	children: React.ReactNode;
	variant?: "default" | "secondary" | "destructive" | "outline";
	className?: string;
}

export function Badge({
	children,
	variant = "default",
	className = "",
}: BadgeProps) {
	const baseClasses =
		"inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";

	const variantClasses = {
		default: "bg-[var(--primary)]/10 text-[var(--primary)]",
		secondary: "bg-[var(--muted)] text-[var(--muted-foreground)]",
		destructive: "bg-[var(--destructive)]/10 text-[var(--destructive)]",
		outline:
			"border border-[var(--border)] text-[var(--foreground)] bg-[var(--background)]",
	};

	return (
		<span className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
			{children}
		</span>
	);
}
