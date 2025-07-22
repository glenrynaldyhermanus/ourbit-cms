"use client";

import { Card } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Divider from "@/components/ui/Divider";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PaymentSuccessPage() {
	const router = useRouter();
	return (
		<div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12">
			<Card className="w-full max-w-md p-8 flex flex-col items-center">
				<div className="bg-green-100 rounded-full p-4 mb-4">
					<Check className="w-10 h-10 text-green-600" />
				</div>
				<h1 className="text-2xl font-bold mb-2 text-center">
					Transaksi Berhasil!
				</h1>
				<Divider />
				<p className="text-gray-600 mt-4 mb-8 text-center">
					Terima kasih, pembayaran Anda telah diterima dan stok sudah
					diperbarui.
				</p>
				<Button.Root variant="default" onClick={() => router.push("/cashier")}>
					<Button.Text>Kembali ke Kasir</Button.Text>
				</Button.Root>
			</Card>
		</div>
	);
}
