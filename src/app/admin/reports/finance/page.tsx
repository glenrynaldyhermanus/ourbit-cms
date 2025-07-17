import UnderDevelopmentPlaceholder from "@/components/placeholder/under-development";
import { CreditCard } from "lucide-react";

export default function FinanceReportPage() {
	return (
		<UnderDevelopmentPlaceholder
			title="Laporan Keuangan"
			description="Lihat laporan keuangan bisnis Anda di sini"
			icon={<CreditCard className="w-8 h-8 text-gray-600" />}
		/>
	);
}
