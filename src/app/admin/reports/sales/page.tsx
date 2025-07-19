import UnderDevelopmentPlaceholder from "@/components/placeholders/UnderDevelopment";
import { DollarSign } from "lucide-react";

export default function SalesReportPage() {
	return (
		<UnderDevelopmentPlaceholder
			title="Laporan Penjualan"
			description="Lihat laporan penjualan bisnis Anda di sini"
			icon={<DollarSign className="w-8 h-8 text-gray-600" />}
		/>
	);
}
