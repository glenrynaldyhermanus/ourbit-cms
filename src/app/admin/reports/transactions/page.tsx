import UnderDevelopmentPlaceholder from "@/components/placeholders/UnderDevelopment";
import { Receipt } from "lucide-react";

export default function TransactionsReportPage() {
	return (
		<UnderDevelopmentPlaceholder
			title="Laporan Transaksi"
			description="Lihat laporan transaksi bisnis Anda di sini"
			icon={<Receipt className="w-8 h-8 text-gray-600" />}
		/>
	);
}
