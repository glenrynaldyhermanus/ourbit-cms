"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface DividerProps {
	className?: string;
	variant?: "solid" | "dashed";
	pattern?: {
		solid: number;
		transparent: number;
	};
}

export default function Divider({
	className = "",
	variant = "solid",
	pattern = { solid: 4, transparent: 8 },
}: DividerProps) {
	if (variant === "dashed") {
		const totalPattern = pattern.solid + pattern.transparent;

		return (
			<div
				className={cn("h-px", className)}
				style={{
					background: `repeating-linear-gradient(to right, var(--border) 0, var(--border) ${pattern.solid}px, transparent ${pattern.solid}px, transparent ${totalPattern}px)`,
				}}
			/>
		);
	}

	return <div className={cn("border-t border-[var(--border)]", className)} />;
}
