"use client";

import React, { useState } from "react";

interface TabsProps {
	children: React.ReactNode;
	defaultValue: string;
	className?: string;
}

interface TabsListProps {
	children: React.ReactNode;
	className?: string;
	activeTab?: string;
	setActiveTab?: (value: string) => void;
}

interface TabsTriggerProps {
	children: React.ReactNode;
	value: string;
	className?: string;
}

interface TabsContentProps {
	children: React.ReactNode;
	value: string;
	className?: string;
}

export function Tabs({ children, defaultValue, className = "" }: TabsProps) {
	const [activeTab, setActiveTab] = useState(defaultValue);

	const childrenWithProps = React.Children.map(children, (child) => {
		if (React.isValidElement(child)) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			return React.cloneElement(child as any, {
				activeTab,
				setActiveTab,
			});
		}
		return child;
	});

	return <div className={className}>{childrenWithProps}</div>;
}

export function TabsList({
	children,
	className = "",
	activeTab,
	setActiveTab,
}: TabsListProps) {
	const childrenWithProps = React.Children.map(children, (child) => {
		if (React.isValidElement(child)) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			return React.cloneElement(child as any, {
				activeTab,
				setActiveTab,
			});
		}
		return child;
	});

	return (
		<div
			className={`flex space-x-1 rounded-lg bg-[var(--muted)] p-1 ${className}`}>
			{childrenWithProps}
		</div>
	);
}

export function TabsTrigger({
	children,
	value,
	className = "",
	...props
}: TabsTriggerProps & {
	activeTab?: string;
	setActiveTab?: (value: string) => void;
}) {
	const { activeTab, setActiveTab } = props;
	const isActive = activeTab === value;

	return (
		<button
			onClick={() => setActiveTab?.(value)}
			className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-all ${
				isActive
					? "bg-[var(--background)] text-[var(--foreground)] shadow-sm"
					: "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
			} ${className}`}>
			{children}
		</button>
	);
}

export function TabsContent({
	children,
	value,
	className = "",
	...props
}: TabsContentProps & { activeTab?: string }) {
	const { activeTab } = props;

	if (activeTab !== value) {
		return null;
	}

	return <div className={className}>{children}</div>;
}
