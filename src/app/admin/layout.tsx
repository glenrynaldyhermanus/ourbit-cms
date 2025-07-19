"use client";

import { Sidebar } from "@/components";
import { ReactNode } from "react";

interface AdminLayoutProps {
	children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
	return (
		<div className="flex h-screen bg-white">
			{/* Sidebar */}
			<Sidebar />

			{/* Main Content */}
			<div className="flex-1 flex flex-col overflow-hidden">
				{/* Page Content */}
				<main className="flex-1 overflow-y-auto py-4 px-12">{children}</main>
			</div>
		</div>
	);
}
