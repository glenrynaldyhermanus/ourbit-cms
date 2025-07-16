import PagePlaceholder from "@/components/admin/PagePlaceholder";
import { DollarSign } from "lucide-react";

export default function SalesReportPage() {
	return (
		<PagePlaceholder
			title="Laporan Penjualan"
			description="Lihat laporan penjualan bisnis Anda di sini"
			icon={<DollarSign className="w-8 h-8 text-gray-600" />}
		/>
	);
}
