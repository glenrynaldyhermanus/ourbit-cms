"use client";

import { ReactNode } from "react";
import Sidebar from "@/components/layout/sidebar";

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
