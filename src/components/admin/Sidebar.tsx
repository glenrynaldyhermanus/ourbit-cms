"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronRight } from "lucide-react";
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
		path: "/dashboard",
	},
	{
		icon: <ShoppingCart className="w-5 h-5" />,
		label: "Cashier",
		path: "/pos",
	},
];

const MENU_GROUPS: MenuGroup[] = [
	{
		label: "Data",
		items: [
			{
				icon: <Package className="w-5 h-5" />,
				label: "Produk",
				path: "/products",
			},
			{
				icon: <Archive className="w-5 h-5" />,
				label: "Inventory",
				path: "/inventories",
			},
			{
				icon: <Grid3X3 className="w-5 h-5" />,
				label: "Kategori",
				path: "/categories",
			},
			{
				icon: <Users className="w-5 h-5" />,
				label: "Pelanggan",
				path: "/customers",
			},
			{
				icon: <Building2 className="w-5 h-5" />,
				label: "Supplier",
				path: "/suppliers",
			},
		],
	},
	{
		label: "Organisasi",
		items: [
			{
				icon: <Store className="w-5 h-5" />,
				label: "Toko & Cabang",
				path: "/stores",
			},
			{
				icon: <UserCheck className="w-5 h-5" />,
				label: "Staff",
				path: "/staff",
			},
		],
	},
	{
		label: "Laporan",
		items: [
			{
				icon: <TrendingUp className="w-5 h-5" />,
				label: "Laba Rugi",
				path: "/reports/profit-loss",
			},
			{
				icon: <CreditCard className="w-5 h-5" />,
				label: "Keuangan",
				path: "/reports/finance",
			},
			{
				icon: <Receipt className="w-5 h-5" />,
				label: "Transaksi",
				path: "/reports/transactions",
			},
			{
				icon: <DollarSign className="w-5 h-5" />,
				label: "Penjualan",
				path: "/reports/sales",
			},
			{
				icon: <FileText className="w-5 h-5" />,
				label: "Pembelian",
				path: "/reports/purchase",
			},
			{
				icon: <FileBarChart className="w-5 h-5" />,
				label: "Hutang Piutang",
				path: "/reports/debt",
			},
		],
	},
	{
		label: "Settings",
		items: [
			{
				icon: <User className="w-5 h-5" />,
				label: "Profile",
				path: "/settings/profile",
			},
			{
				icon: <Settings className="w-5 h-5" />,
				label: "Settings",
				path: "/settings",
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
							? "bg-orange-100 text-orange-600"
							: isHovered
							? "bg-gray-50 text-gray-900"
							: "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
					}
				`}
				onMouseEnter={() => setIsHovered(true)}
				onMouseLeave={() => setIsHovered(false)}>
				<div className="flex items-center space-x-4">
					<div className={isActive ? "text-orange-600" : "text-gray-500"}>
						{item.icon}
					</div>
					<span className="text-sm font-medium">{item.label}</span>
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
	const hasActiveItem = group.items.some((item) => pathname === item.path);

	return (
		<div className="py-2">
			<button
				onClick={() => setIsExpanded(!isExpanded)}
				className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200">
				<span>{group.label}</span>
				<div className="text-orange-600">
					{isExpanded ? (
						<ChevronDown className="w-5 h-5" />
					) : (
						<ChevronRight className="w-5 h-5" />
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

	return (
		<div className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col">
			{/* Logo */}
			<div className="flex items-center justify-center px-18 py-8">
				<img
					src="/logo-ourbit-orange.svg"
					alt="Ourbit"
					className="h-8 w-auto"
				/>
			</div>

			{/* Menu Items */}
			<div className="flex-1 overflow-y-auto">
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
		</div>
	);
}
