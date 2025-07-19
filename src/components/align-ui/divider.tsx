"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface DividerProps {
	className?: string;
	color?: string;
	variant?: "solid" | "dashed";
	pattern?: {
		solid: number;
		transparent: number;
	};
}

export default function Divider({
	className = "",
	color = "#e5e7eb", // gray-200
	variant = "dashed",
	pattern = { solid: 4, transparent: 8 },
}: DividerProps) {
	const totalPattern = pattern.solid + pattern.transparent;
	const borderImage = `repeating-linear-gradient(to right, ${color} 0, ${color} ${pattern.solid}px, transparent ${pattern.solid}px, transparent ${totalPattern}px) 1`;

	return (
		<div
			className={cn("border-t", className)}
			style={{
				borderStyle: variant,
				borderWidth: "1px",
				borderColor: variant === "solid" ? color : undefined,
				borderImage: variant === "dashed" ? borderImage : undefined,
			}}
		/>
	);
}
