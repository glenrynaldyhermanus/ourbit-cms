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
			return React.cloneElement(child, {
				activeTab,
				setActiveTab,
			} as React.JSX.IntrinsicAttributes);
		}
		return child;
	});

	return <div className={className}>{childrenWithProps}</div>;
}

export function TabsList({ children, className = "" }: TabsListProps) {
	return (
		<div className={`flex space-x-1 rounded-lg bg-gray-100 p-1 ${className}`}>
			{children}
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
					? "bg-white text-gray-900 shadow-sm"
					: "text-gray-600 hover:text-gray-900"
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
