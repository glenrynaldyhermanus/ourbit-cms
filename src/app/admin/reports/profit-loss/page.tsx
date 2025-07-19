import UnderDevelopmentPlaceholder from "@/components/placeholders/UnderDevelopment";
import { TrendingUp } from "lucide-react";

export default function ProfitLossPage() {
	return (
		<UnderDevelopmentPlaceholder
			title="Laporan Laba Rugi"
			description="Lihat laporan laba rugi bisnis Anda di sini"
			icon={<TrendingUp className="w-8 h-8 text-gray-600" />}
		/>
	);
}
