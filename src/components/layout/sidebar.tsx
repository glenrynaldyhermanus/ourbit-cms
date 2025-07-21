"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronRight } from "lucide-react";
import { getBusinessId, getStoreId } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import {
	LayoutDashboard,
	ShoppingCart,
	Package,
	Archive,
	Grid3X3,
	Users,
	Building2,
	Store,
	UserCheck,
	FileText,
	TrendingUp,
	CreditCard,
	Receipt,
	DollarSign,
	FileBarChart,
	Settings,
	User,
	ClipboardList,
} from "lucide-react";

interface MenuItem {
	icon: React.ReactNode;
	label: string;
	path: string;
}

interface MenuGroup {
	label: string;
	items: MenuItem[];
}

const MENU_ITEMS: MenuItem[] = [
	{
		icon: <LayoutDashboard className="w-5 h-5" />,
		label: "Dashboard",
		path: "/admin/dashboard",
	},
	{
		icon: <ShoppingCart className="w-5 h-5" />,
		label: "Cashier",
		path: "/admin/pos",
	},
];

const MENU_GROUPS: MenuGroup[] = [
	{
		label: "Data",
		items: [
			{
				icon: <Package className="w-5 h-5" />,
				label: "Produk",
				path: "/admin/products",
			},
			{
				icon: <Archive className="w-5 h-5" />,
				label: "Inventory",
				path: "/admin/inventories",
			},
			{
				icon: <ClipboardList className="w-5 h-5" />,
				label: "Stock Opname",
				path: "/admin/inventories/opname",
			},
			{
				icon: <Grid3X3 className="w-5 h-5" />,
				label: "Kategori",
				path: "/admin/categories",
			},
			{
				icon: <Users className="w-5 h-5" />,
				label: "Pelanggan",
				path: "/admin/customers",
			},
			{
				icon: <Building2 className="w-5 h-5" />,
				label: "Supplier",
				path: "/admin/suppliers",
			},
		],
	},
	{
		label: "Organisasi",
		items: [
			{
				icon: <Store className="w-5 h-5" />,
				label: "Toko & Cabang",
				path: "/admin/stores",
			},
			{
				icon: <UserCheck className="w-5 h-5" />,
				label: "Staff",
				path: "/admin/staff",
			},
		],
	},
	{
		label: "Laporan",
		items: [
			{
				icon: <TrendingUp className="w-5 h-5" />,
				label: "Laba Rugi",
				path: "/admin/reports/profit-loss",
			},
			{
				icon: <CreditCard className="w-5 h-5" />,
				label: "Keuangan",
				path: "/admin/reports/finance",
			},
			{
				icon: <Receipt className="w-5 h-5" />,
				label: "Transaksi",
				path: "/admin/reports/transactions",
			},
			{
				icon: <DollarSign className="w-5 h-5" />,
				label: "Penjualan",
				path: "/admin/reports/sales",
			},
			{
				icon: <FileText className="w-5 h-5" />,
				label: "Pembelian",
				path: "/admin/reports/purchase",
			},
			{
				icon: <FileBarChart className="w-5 h-5" />,
				label: "Hutang Piutang",
				path: "/admin/reports/debt",
			},
		],
	},
	{
		label: "Settings",
		items: [
			{
				icon: <User className="w-5 h-5" />,
				label: "Profile",
				path: "/admin/settings/profile",
			},
			{
				icon: <Settings className="w-5 h-5" />,
				label: "Settings",
				path: "/admin/settings",
			},
		],
	},
];

interface SidebarMenuItemProps {
	item: MenuItem;
	isActive: boolean;
}

function SidebarMenuItem({ item, isActive }: SidebarMenuItemProps) {
	const [isHovered, setIsHovered] = useState(false);

	return (
		<Link href={item.path}>
			<div
				className={`
					flex items-center w-full h-11 px-6 transition-colors duration-200 cursor-pointer
					${
						isActive
							? "bg-[#FF5701]/10 text-[#FF5701] border-r-2 border-[#FF5701]"
							: isHovered
							? "bg-[#F3F4F6] text-[#191919]"
							: "text-[#4A4A4A] hover:bg-[#F3F4F6] hover:text-[#191919]"
					}
				`}
				onMouseEnter={() => setIsHovered(true)}
				onMouseLeave={() => setIsHovered(false)}>
				<div className="flex items-center space-x-3">
					<div className={isActive ? "text-[#FF5701]" : "text-[#6B7280]"}>
						{item.icon}
					</div>
					<span className="text-sm font-medium font-['Inter']">
						{item.label}
					</span>
				</div>
			</div>
		</Link>
	);
}

interface SidebarMenuGroupProps {
	group: MenuGroup;
	pathname: string;
}

function SidebarMenuGroup({ group, pathname }: SidebarMenuGroupProps) {
	const [isExpanded, setIsExpanded] = useState(true);

	return (
		<div className="py-2">
			<button
				onClick={() => setIsExpanded(!isExpanded)}
				className="flex items-center justify-between w-full px-4 py-2 text-xs font-medium text-[#6B7280] hover:text-[#191919] transition-colors duration-200 font-['Inter'] uppercase tracking-wider">
				<span>{group.label}</span>
				<div className="text-[#FF5701]">
					{isExpanded ? (
						<ChevronDown className="w-4 h-4" />
					) : (
						<ChevronRight className="w-4 h-4" />
					)}
				</div>
			</button>
			{isExpanded && (
				<div className="space-y-1">
					{group.items.map((item) => (
						<SidebarMenuItem
							key={item.path}
							item={item}
							isActive={pathname === item.path}
						/>
					))}
				</div>
			)}
		</div>
	);
}

export default function Sidebar() {
	const pathname = usePathname();
	const [businessName, setBusinessName] = useState("");
	const [storeName, setStoreName] = useState("");

	useEffect(() => {
		const loadBusinessAndStore = async () => {
			try {
				const businessId = getBusinessId();
				const storeId = getStoreId();

				if (businessId) {
					const { data: business } = await supabase
						.from("businesses")
						.select("name")
						.eq("id", businessId)
						.single();
					if (business) {
						setBusinessName(business.name);
					}
				}

				if (storeId) {
					const { data: store } = await supabase
						.from("stores")
						.select("name")
						.eq("id", storeId)
						.single();
					if (store) {
						setStoreName(store.name);
					}
				}
			} catch (error) {
				console.error("Error loading business and store:", error);
			}
		};

		loadBusinessAndStore();
	}, []);

	return (
		<div className="w-64 h-screen bg-white border-r border-[#D1D5DB] flex flex-col shadow-sm">
			{/* Business & Store Info */}
			<div className="px-6 py-6 border-b border-[#D1D5DB]">
				<div className="space-y-2">
					<div className="flex items-center space-x-2">
						<div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
							<span className="text-white font-bold text-sm">O</span>
						</div>
						<div>
							<h2 className="text-sm font-semibold text-gray-900 font-['Inter']">
								{businessName || "Loading..."}
							</h2>
							<p className="text-xs text-gray-500 font-['Inter']">
								{storeName || "Loading..."}
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Menu Items */}
			<div className="flex-1 overflow-y-auto py-4">
				<div className="space-y-1">
					{/* Individual Menu Items */}
					{MENU_ITEMS.map((item) => (
						<SidebarMenuItem
							key={item.path}
							item={item}
							isActive={pathname === item.path}
						/>
					))}

					{/* Menu Groups */}
					{MENU_GROUPS.map((group) => (
						<SidebarMenuGroup
							key={group.label}
							group={group}
							pathname={pathname}
						/>
					))}
				</div>
			</div>

			{/* Ourbit Logo & Version */}
			<div className="border-t border-[#D1D5DB] p-4">
				<div className="flex items-center space-x-3">
					<div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
						<span className="text-white font-bold text-sm">O</span>
					</div>
					<div>
						<div className="text-sm font-semibold text-gray-900 font-['Inter']">
							Ourbit
						</div>
						<div className="text-xs text-gray-500 font-['Inter']">v.1.0</div>
					</div>
				</div>
			</div>
		</div>
	);
}
