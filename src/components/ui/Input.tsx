"use client";

import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface AlignInputRootProps {
	children: React.ReactNode;
	className?: string;
	error?: boolean;
	disabled?: boolean;
}

interface AlignInputFieldProps {
	value?: string | number;
	onChange?: (value: string) => void;
	onBlur?: () => void;
	placeholder?: string;
	type?: "text" | "email" | "password" | "number" | "tel" | "url";
	disabled?: boolean;
	readOnly?: boolean;
	className?: string;
	error?: boolean;
	required?: boolean;
	autoFocus?: boolean;
	name?: string;
	id?: string;
	maxLength?: number;
}

interface AlignInputIconProps {
	icon: LucideIcon;
	position?: "leading" | "trailing";
	className?: string;
}

interface AlignInputLabelProps {
	children: React.ReactNode;
	className?: string;
	required?: boolean;
}

interface AlignInputErrorProps {
	children: React.ReactNode;
	className?: string;
}

// Root Component
function AlignInputRoot({
	children,
	className = "",
	error = false,
	disabled = false,
}: AlignInputRootProps) {
	return (
		<div
			className={cn(
				"relative",
				error && "animate-shake",
				disabled && "opacity-50",
				className
			)}>
			{children}
		</div>
	);
}

// Field Component
function AlignInputField({
	value,
	onChange,
	onBlur,
	placeholder,
	type = "text",
	disabled = false,
	readOnly = false,
	className = "",
	error = false,
	required = false,
	autoFocus = false,
	name,
	id,
	maxLength,
}: AlignInputFieldProps) {
	const baseClasses =
		"flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-200";

	const errorClasses = error
		? "border-destructive focus-visible:ring-destructive"
		: "border-input focus-visible:ring-ring";

	const combinedClasses = cn(baseClasses, errorClasses, className);

	return (
		<input
			type={type}
			value={value}
			onChange={(e) => onChange?.(e.target.value)}
			onBlur={onBlur}
			placeholder={placeholder}
			disabled={disabled}
			readOnly={readOnly}
			required={required}
			autoFocus={autoFocus}
			name={name}
			id={id}
			maxLength={maxLength}
			className={combinedClasses}
		/>
	);
}

// Icon Component
function AlignInputIcon({
	icon: Icon,
	position = "leading",
	className = "",
}: AlignInputIconProps) {
	return (
		<Icon
			className={cn(
				"absolute top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground",
				position === "leading" ? "left-3" : "right-3",
				className
			)}
		/>
	);
}

// Label Component
function AlignInputLabel({
	children,
	className = "",
	required = false,
}: AlignInputLabelProps) {
	return (
		<label
			className={cn(
				"text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2 block",
				className
			)}>
			{children}
			{required && <span className="text-destructive ml-1">*</span>}
		</label>
	);
}

// Error Component
function AlignInputError({ children, className = "" }: AlignInputErrorProps) {
	return (
		<p className={cn("text-sm text-destructive mt-1", className)}>{children}</p>
	);
}

// Compound Component
const AlignInput = Object.assign(AlignInputRoot, {
	Field: AlignInputField,
	Icon: AlignInputIcon,
	Label: AlignInputLabel,
	Error: AlignInputError,
	Root: AlignInputRoot,
});

export default AlignInput;
