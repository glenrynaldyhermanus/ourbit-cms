"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

interface ButtonProps {
	children: React.ReactNode;
	variant?: "primary" | "primary-stroke";
	size?: "sm" | "md" | "lg";
	loading?: boolean;
	disabled?: boolean;
	onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
	className?: string;
	iconLeading?: LucideIcon;
	iconTrailing?: LucideIcon;
	iconPadding?: "sm" | "md" | "lg";
	type?: "button" | "submit" | "reset";
}

export default function Button({
	children,
	variant = "primary",
	size = "md",
	loading = false,
	disabled = false,
	onClick,
	className = "",
	iconLeading: IconLeading,
	iconTrailing: IconTrailing,
	iconPadding = "md",
	type = "button",
}: ButtonProps) {
	const baseClasses =
		"font-medium font-['Inter'] transition-all duration-300 transform hover:scale-[1.05] active:scale-[0.95] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center group relative overflow-hidden rounded";

	const sizeClasses = {
		sm: "px-4 h-8 text-sm",
		md: "px-6 h-10 text-base",
		lg: "px-8 h-12 text-lg",
	};

	const iconPaddingClasses = {
		sm: "gap-2",
		md: "gap-3",
		lg: "gap-4",
	};

	const variantClasses = {
		primary:
			"bg-gradient-to-r from-[#FF5701] to-[#E04E00] text-white shadow-md hover:shadow-lg",
		"primary-stroke": "bg-transparent text-[#FF5701] border-2 border-[#FF5701]",
	};

	const iconSize = {
		sm: "w-4 h-4",
		md: "w-5 h-5",
		lg: "w-6 h-6",
	};

	const combinedClasses = `
		${baseClasses}
		${sizeClasses[size]}
		${iconPaddingClasses[iconPadding]}
		${variantClasses[variant]}
		${className}
	`.trim();

	return (
		<button
			type={type}
			onClick={onClick}
			disabled={disabled || loading}
			className={combinedClasses}>
			{/* Ripple effect for primary variant */}
			{variant === "primary" && (
				<div className="absolute inset-0 bg-white/20 transform scale-0 group-hover:scale-100 transition-transform duration-200"></div>
			)}

			{loading ? (
				<>
					<div
						className={`border-2 border-current border-t-transparent rounded-full animate-spin ${iconSize[size]}`}></div>
				</>
			) : (
				<>
					{IconLeading && <IconLeading className={iconSize[size]} />}
					<span>{children}</span>
					{IconTrailing && <IconTrailing className={iconSize[size]} />}
				</>
			)}
		</button>
	);
}

// Convenience components for specific variants
export function PrimaryButton(props: Omit<ButtonProps, "variant">) {
	return <Button {...props} variant="primary" />;
}

export function PrimaryStrokeButton(props: Omit<ButtonProps, "variant">) {
	return <Button {...props} variant="primary-stroke" />;
}
