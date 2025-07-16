import PagePlaceholder from "@/components/admin/PagePlaceholder";
import { FileText } from "lucide-react";

export default function PurchaseReportPage() {
	return (
		<PagePlaceholder
			title="Laporan Pembelian"
			description="Lihat laporan pembelian bisnis Anda di sini"
			icon={<FileText className="w-8 h-8 text-gray-600" />}
		/>
	);
}
