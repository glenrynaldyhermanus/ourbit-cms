"use client";

import React from "react";
import { LucideIcon, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface AlignSelectRootProps {
	children: React.ReactNode;
	className?: string;
	error?: boolean;
	disabled?: boolean;
}

interface AlignSelectTriggerProps {
	value?: string;
	placeholder?: string;
	disabled?: boolean;
	className?: string;
	error?: boolean;
	required?: boolean;
	onClick?: () => void;
	open?: boolean;
}

interface AlignSelectContentProps {
	children: React.ReactNode;
	className?: string;
	open?: boolean;
}

interface AlignSelectItemProps {
	value: string;
	children: React.ReactNode;
	className?: string;
	onClick?: () => void;
	selected?: boolean;
}

interface AlignSelectIconProps {
	icon: LucideIcon;
	className?: string;
}

interface AlignSelectLabelProps {
	children: React.ReactNode;
	className?: string;
	required?: boolean;
}

interface AlignSelectErrorProps {
	children: React.ReactNode;
	className?: string;
}

// Root Component
function AlignSelectRoot({
	children,
	className = "",
	error = false,
	disabled = false,
}: AlignSelectRootProps) {
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

// Trigger Component
function AlignSelectTrigger({
	value,
	placeholder,
	disabled = false,
	className = "",
	error = false,
	required = false,
	onClick,
	open = false,
}: AlignSelectTriggerProps) {
	const baseClasses =
		"flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-200";

	const errorClasses = error
		? "border-destructive focus:ring-destructive"
		: "border-input focus:ring-ring";

	const combinedClasses = cn(baseClasses, errorClasses, className);

	return (
		<button
			type="button"
			onClick={onClick}
			disabled={disabled}
			className={combinedClasses}>
			<span className={cn("block truncate", !value && "text-muted-foreground")}>
				{value || placeholder}
			</span>
			<ChevronDown
				className={cn(
					"h-4 w-4 shrink-0 transition-transform duration-200",
					open && "rotate-180"
				)}
			/>
		</button>
	);
}

// Content Component
function AlignSelectContent({
	children,
	className = "",
	open = false,
}: AlignSelectContentProps) {
	if (!open) return null;

	return (
		<div
			className={cn(
				"absolute top-full left-0 right-0 z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-input bg-background shadow-md",
				className
			)}>
			{children}
		</div>
	);
}

// Item Component
function AlignSelectItem({
	value,
	children,
	className = "",
	onClick,
	selected = false,
}: AlignSelectItemProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				"relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground transition-colors duration-200",
				selected && "bg-accent text-accent-foreground",
				className
			)}>
			{children}
		</button>
	);
}

// Icon Component
function AlignSelectIcon({ icon: Icon, className = "" }: AlignSelectIconProps) {
	return (
		<Icon className={cn("h-4 w-4 shrink-0 text-muted-foreground", className)} />
	);
}

// Label Component
function AlignSelectLabel({
	children,
	className = "",
	required = false,
}: AlignSelectLabelProps) {
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
function AlignSelectError({ children, className = "" }: AlignSelectErrorProps) {
	return (
		<p className={cn("text-sm text-destructive mt-1", className)}>{children}</p>
	);
}

// Compound Component
const AlignSelect = Object.assign(AlignSelectRoot, {
	Trigger: AlignSelectTrigger,
	Content: AlignSelectContent,
	Item: AlignSelectItem,
	Icon: AlignSelectIcon,
	Label: AlignSelectLabel,
	Error: AlignSelectError,
	Root: AlignSelectRoot,
});

export default AlignSelect;
