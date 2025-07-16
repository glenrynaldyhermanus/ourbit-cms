import PagePlaceholder from "@/components/admin/PagePlaceholder";
import { TrendingUp } from "lucide-react";

export default function ProfitLossPage() {
	return (
		<PagePlaceholder
			title="Laporan Laba Rugi"
			description="Lihat laporan laba rugi bisnis Anda di sini"
			icon={<TrendingUp className="w-8 h-8 text-gray-600" />}
		/>
	);
}
