"use client";

import { Card } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Divider from "@/components/ui/Divider";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PaymentSuccessPage() {
	const router = useRouter();
	return (
		<div className="min-h-screen flex flex-col items-center justify-center bg-[var(--background)] py-12">
			<div className="text-center">
				<div className="bg-green-500/10 rounded-full p-4 mb-4">
					<Check className="w-10 h-10 text-green-600 dark:text-green-400" />
				</div>
				<h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">
					Pembayaran Berhasil!
				</h1>
				<p className="text-[var(--muted-foreground)] mt-4 mb-8 text-center">
					Transaksi Anda telah berhasil diproses.
				</p>
				<Button.Root
					variant="default"
					onClick={() => (window.location.href = "/cashier")}
					className="rounded-xl">
					<Button.Text>Kembali ke Kasir</Button.Text>
				</Button.Root>
			</div>
		</div>
	);
}
