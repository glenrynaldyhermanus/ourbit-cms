import UnderDevelopmentPlaceholder from "@/components/placeholder/under-development";
import { FileBarChart } from "lucide-react";

export default function DebtReportPage() {
	return (
		<UnderDevelopmentPlaceholder
			title="Laporan Hutang Piutang"
			description="Lihat laporan hutang piutang bisnis Anda di sini"
			icon={<FileBarChart className="w-8 h-8 text-gray-600" />}
		/>
	);
}
