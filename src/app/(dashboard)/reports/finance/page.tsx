import PagePlaceholder from "@/components/admin/PagePlaceholder";
import { CreditCard } from "lucide-react";

export default function FinanceReportPage() {
	return (
		<PagePlaceholder
			title="Laporan Keuangan"
			description="Lihat laporan keuangan bisnis Anda di sini"
			icon={<CreditCard className="w-8 h-8 text-gray-600" />}
		/>
	);
}
