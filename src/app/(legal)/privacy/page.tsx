import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";

export default function PrivacyPage() {
	return (
		<div className="container mx-auto max-w-4xl py-10 px-4">
			<Card className="overflow-hidden">
				<CardHeader>
					<CardTitle>Kebijakan Privasi Ourbit</CardTitle>
					<p className="text-sm text-[var(--muted-foreground)]">
						Terakhir diperbarui: 13 Agustus 2025
					</p>
				</CardHeader>
				<CardContent>
					<div className="prose prose-neutral dark:prose-invert max-w-none">
						<p>
							Kebijakan Privasi ini menjelaskan bagaimana Ourbit mengumpulkan,
							menggunakan, mengungkapkan, dan melindungi data pribadi saat Anda
							menggunakan platform kami.
						</p>

						<h2>1. Data yang Kami Kumpulkan</h2>
						<ul>
							<li>Data akun: nama, email, nomor telepon, kredensial.</li>
							<li>
								Data penggunaan: interaksi halaman, event analitik, preferensi.
							</li>
							<li>Data transaksi: pesanan, pembayaran, pengiriman.</li>
							<li>Data perangkat: jenis perangkat, OS, browser, alamat IP.</li>
						</ul>

						<h2>2. Cara Kami Menggunakan Data</h2>
						<ul>
							<li>Menyediakan dan memelihara layanan.</li>
							<li>Autentikasi, keamanan, pencegahan penipuan.</li>
							<li>Dukungan pelanggan dan komunikasi layanan.</li>
							<li>Peningkatan fitur dan analitik kinerja.</li>
						</ul>

						<h2>3. Berbagi Data</h2>
						<p>
							Kami tidak menjual data Anda. Data dapat dibagikan dengan penyedia
							pihak ketiga (misal pembayaran dan pengiriman) hanya sejauh
							diperlukan untuk menjalankan layanan, dan sesuai hukum.
						</p>

						<h2>4. Penyimpanan & Keamanan</h2>
						<p>
							Kami menerapkan kontrol teknis dan organisasi yang wajar untuk
							melindungi data Anda. Namun tidak ada metode transmisi melalui
							internet yang sepenuhnya aman.
						</p>

						<h2>5. Hak Anda</h2>
						<ul>
							<li>Akses, perbarui, atau hapus data Anda sesuai ketentuan.</li>
							<li>Mencabut persetujuan tertentu kapan saja.</li>
							<li>Mengajukan keluhan ke otoritas terkait.</li>
						</ul>

						<h2>6. Cookie & Pelacakan</h2>
						<p>
							Kami dapat menggunakan cookie/teknologi serupa untuk
							fungsionalitas dan analitik.
						</p>

						<h2>7. Retensi Data</h2>
						<p>
							Data disimpan selama diperlukan untuk tujuan layanan atau sesuai
							kewajiban hukum.
						</p>

						<h2>8. Perubahan</h2>
						<p>
							Kebijakan ini dapat diperbarui. Perubahan material akan
							diberitahukan melalui platform.
						</p>

						<h2>9. Kontak</h2>
						<p>Untuk pertanyaan, hubungi support Ourbit.</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
