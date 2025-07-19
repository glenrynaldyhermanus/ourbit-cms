"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface AlignSwitchProps {
	checked: boolean;
	onChange: (checked: boolean) => void;
	disabled?: boolean;
	label?: string;
	description?: string;
	className?: string;
}

export default function AlignSwitch({
	checked,
	onChange,
	disabled = false,
	label,
	description,
	className = "",
}: AlignSwitchProps) {
	return (
		<div className={cn("flex items-center space-x-2", className)}>
			<button
				type="button"
				onClick={() => !disabled && onChange(!checked)}
				disabled={disabled}
				className={cn(
					"peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
					checked ? "bg-primary" : "bg-input"
				)}
				data-state={checked ? "checked" : "unchecked"}>
				<span
					className={cn(
						"pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0",
						checked ? "translate-x-5" : "translate-x-0"
					)}
					data-state={checked ? "checked" : "unchecked"}
				/>
			</button>
			{(label || description) && (
				<div className="grid gap-1.5 leading-none">
					{label && (
						<label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
							{label}
						</label>
					)}
					{description && (
						<p className="text-sm text-muted-foreground">{description}</p>
					)}
				</div>
			)}
		</div>
	);
}
