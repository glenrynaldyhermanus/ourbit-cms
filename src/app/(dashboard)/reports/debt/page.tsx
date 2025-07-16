import PagePlaceholder from "@/components/admin/PagePlaceholder";
import { FileBarChart } from "lucide-react";

export default function DebtReportPage() {
	return (
		<PagePlaceholder
			title="Laporan Hutang Piutang"
			description="Lihat laporan hutang piutang bisnis Anda di sini"
			icon={<FileBarChart className="w-8 h-8 text-gray-600" />}
		/>
	);
}
