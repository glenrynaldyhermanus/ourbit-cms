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
				"relative z-10",
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
	onClick,
	open = false,
}: AlignSelectTriggerProps) {
	const baseClasses =
		"flex h-10 w-full items-center justify-between rounded-xl border border-[var(--border-input)] bg-[var(--background)] px-3 py-2 text-sm ring-offset-[var(--background)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-200";

	const errorClasses = error
		? "border-[var(--destructive)] focus:ring-[var(--destructive)]"
		: "border-[var(--border-input)] focus:ring-orange-500";

	const combinedClasses = cn(baseClasses, errorClasses, className);

	return (
		<button
			type="button"
			onClick={onClick}
			disabled={disabled}
			className={combinedClasses}>
			<span
				className={cn(
					"block truncate",
					!value && "text-[var(--muted-foreground)]"
				)}>
				{value || placeholder}
			</span>
			<ChevronDown
				className={cn(
					"h-4 w-4 shrink-0 text-[var(--muted-foreground)] transition-transform duration-200",
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
		<>
			{/* Backdrop untuk memastikan dropdown tidak ketutupan */}
			<div
				className="fixed inset-0 z-[9998] bg-transparent"
				onClick={(e) => {
					e.stopPropagation();
					// Close dropdown when backdrop is clicked
					const event = new MouseEvent("mousedown", { bubbles: true });
					document.dispatchEvent(event);
				}}
			/>
			<div
				className={cn(
					"absolute top-full left-0 right-0 z-[9999] mt-1 max-h-60 w-full overflow-auto rounded-xl border-2 border-[var(--border)] bg-[var(--popover)] shadow-xl animate-in fade-in-0 zoom-in-95 py-1",
					className
				)}>
				{children}
			</div>
		</>
	);
}

// Item Component
function AlignSelectItem({
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
				"relative flex w-full cursor-default select-none items-center rounded-lg px-3 py-2 text-sm outline-none hover:bg-[var(--accent)] focus:bg-[var(--accent)] transition-colors duration-200 bg-[var(--popover)] mx-1 text-[var(--popover-foreground)]",
				selected && "bg-[var(--primary)]/10 text-[var(--primary)] font-medium",
				className
			)}>
			{children}
		</button>
	);
}

// Icon Component
function AlignSelectIcon({ icon: Icon, className = "" }: AlignSelectIconProps) {
	return (
		<Icon
			className={cn(
				"h-4 w-4 shrink-0 text-[var(--muted-foreground)]",
				className
			)}
		/>
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
				"text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2 block text-[var(--foreground)]",
				className
			)}>
			{children}
			{required && <span className="text-[var(--destructive)] ml-1">*</span>}
		</label>
	);
}

// Error Component
function AlignSelectError({ children, className = "" }: AlignSelectErrorProps) {
	return (
		<p className={cn("text-sm text-[var(--destructive)] mt-1", className)}>
			{children}
		</p>
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
