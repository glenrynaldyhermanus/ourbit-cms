"use client";

import { ReactNode } from "react";
import Sidebar from "@/components/layout/sidebar";
import AppBar from "@/components/layout/appbar";

interface AdminLayoutProps {
	children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
	return (
		<div className="flex h-screen bg-[#EFEDED]">
			{/* Sidebar */}
			<Sidebar />

			{/* Main Content */}
			<div className="flex-1 flex flex-col overflow-hidden">
				{/* AppBar */}
				<AppBar />

				{/* Page Content */}
				<main className="flex-1 overflow-y-auto p-6">{children}</main>
			</div>
		</div>
	);
}
