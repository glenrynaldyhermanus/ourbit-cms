"use client";

import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ButtonRootProps {
	children: React.ReactNode;
	variant?:
		| "default"
		| "destructive"
		| "outline"
		| "secondary"
		| "ghost"
		| "link";
	size?: "default" | "sm" | "lg" | "icon";
	loading?: boolean;
	disabled?: boolean;
	onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
	className?: string;
	type?: "button" | "submit" | "reset";
}

interface ButtonIconProps {
	icon: LucideIcon;
	className?: string;
}

interface ButtonTextProps {
	children: React.ReactNode;
	className?: string;
}

// Root Component
function ButtonRoot({
	children,
	variant = "default",
	size = "default",
	loading = false,
	disabled = false,
	onClick,
	className = "",
	type = "button",
}: ButtonRootProps) {
	const baseClasses =
		"inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-all duration-300 transform hover:scale-[1.05] active:scale-[0.95] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:transform-none group relative overflow-hidden";

	const variantClasses = {
		default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
		destructive:
			"bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",
		outline:
			"border border-input bg-background hover:bg-accent hover:text-accent-foreground",
		secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
		ghost: "hover:bg-accent hover:text-accent-foreground",
		link: "text-primary underline-offset-4 hover:underline",
	};

	const sizeClasses = {
		default: "h-10 px-4 py-2",
		sm: "h-9 rounded-xl px-3",
		lg: "h-11 rounded-xl px-8",
		icon: "h-10 w-10",
	};

	const combinedClasses = cn(
		baseClasses,
		variantClasses[variant],
		sizeClasses[size],
		className
	);

	return (
		<button
			type={type}
			onClick={onClick}
			disabled={disabled || loading}
			className={combinedClasses}>
			{/* Ripple effect for default variant */}
			{variant === "default" && (
				<div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
			)}
			{loading ? (
				<div className="flex items-center gap-2">
					<div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
					<span>Loading...</span>
				</div>
			) : (
				children
			)}
		</button>
	);
}

// Icon Component
function ButtonIcon({ icon: Icon, className = "" }: ButtonIconProps) {
	return <Icon className={cn("w-4 h-4", className)} />;
}

// Text Component
function ButtonText({ children, className = "" }: ButtonTextProps) {
	return <span className={cn("", className)}>{children}</span>;
}

// Compound Component
const Button = Object.assign(ButtonRoot, {
	Icon: ButtonIcon,
	Text: ButtonText,
	Root: ButtonRoot,
});

// Convenience Components
export function PrimaryButton(props: Omit<ButtonRootProps, "variant">) {
	return <ButtonRoot {...props} variant="default" />;
}

export function DestructiveButton(props: Omit<ButtonRootProps, "variant">) {
	return <ButtonRoot {...props} variant="destructive" />;
}

export function OutlineButton(props: Omit<ButtonRootProps, "variant">) {
	return <ButtonRoot {...props} variant="outline" />;
}

export function SecondaryButton(props: Omit<ButtonRootProps, "variant">) {
	return <ButtonRoot {...props} variant="secondary" />;
}

export function GhostButton(props: Omit<ButtonRootProps, "variant">) {
	return <ButtonRoot {...props} variant="ghost" />;
}

export function LinkButton(props: Omit<ButtonRootProps, "variant">) {
	return <ButtonRoot {...props} variant="link" />;
}

export default Button;
