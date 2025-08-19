import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";

export default function TermsPage() {
	return (
		<div className="container mx-auto max-w-4xl py-10 px-4">
			<Card className="overflow-hidden">
				<CardHeader>
					<CardTitle>Syarat dan Ketentuan Ourbit</CardTitle>
					<p className="text-sm text-[var(--muted-foreground)]">
						Terakhir diperbarui: 13 Agustus 2025
					</p>
				</CardHeader>
				<CardContent>
					<div className="prose prose-neutral dark:prose-invert max-w-none">
						<p>
							Syarat dan Ketentuan ini mengatur penggunaan Anda atas platform
							dan layanan Ourbit, termasuk aplikasi, situs, dan fitur terkait.
							Dengan membuat akun, mengakses, atau menggunakan layanan, Anda
							menyatakan telah membaca, memahami, dan menyetujui ketentuan ini.
						</p>

						<h2>1. Definisi</h2>
						<ul>
							<li>
								“Platform” adalah aplikasi dan/atau situs Ourbit beserta layanan
								yang disediakan.
							</li>
							<li>
								“Pengguna” adalah pihak yang membuat akun atau menggunakan
								layanan Ourbit, termasuk pemilik usaha, staf, dan pelanggan.
							</li>
						</ul>

						<h2>2. Kelayakan & Pembuatan Akun</h2>
						<ul>
							<li>
								Anda menyatakan berusia minimal 18 tahun atau memiliki
								persetujuan hukum dari wali.
							</li>
							<li>
								Anda wajib memberikan data yang akurat dan memperbaruinya secara
								berkala.
							</li>
							<li>
								Anda bertanggung jawab atas kerahasiaan kredensial dan seluruh
								aktivitas pada akun Anda.
							</li>
						</ul>

						<h2>3. Penggunaan yang Dilarang</h2>
						<p>
							Anda setuju untuk tidak menggunakan layanan untuk: (a) melanggar
							hukum; (b) mengunggah konten ilegal, menyesatkan, atau melanggar
							hak pihak ketiga; (c) mencoba meretas, merusak, atau mengganggu
							sistem; (d) melakukan penipuan, spam, atau scraping berlebihan.
						</p>

						<h2>4. Fitur, Pemesanan, Pembayaran, dan Pengiriman</h2>
						<ul>
							<li>
								Harga, ketersediaan, dan deskripsi produk ditentukan oleh
								pemilik toko.
							</li>
							<li>
								Pembayaran online diproses melalui penyedia pembayaran pihak
								ketiga dan tunduk pada ketentuannya.
							</li>
							<li>
								Kebijakan pengiriman, pengembalian, dan pengembalian dana
								(refund) dikelola oleh masing-masing toko.
							</li>
						</ul>

						<h2>5. Konten Pengguna</h2>
						<p>
							Anda memiliki hak atas konten yang Anda unggah. Dengan mengunggah,
							Anda memberikan lisensi non-eksklusif global kepada Ourbit untuk
							menyimpan, menampilkan, dan memproses konten tersebut semata-mata
							untuk menjalankan layanan.
						</p>

						<h2>6. Hak Kekayaan Intelektual</h2>
						<p>
							Seluruh logo, merek, dan materi milik Ourbit dilindungi hukum.
							Penggunaan tanpa izin tertulis dilarang.
						</p>

						<h2>7. Privasi</h2>
						<p>
							Penggunaan layanan tunduk pada Kebijakan Privasi Ourbit yang
							menjelaskan bagaimana data Anda dikumpulkan dan digunakan.
						</p>

						<h2>8. Batasan Tanggung Jawab</h2>
						<p>
							Sepanjang diizinkan hukum, Ourbit tidak bertanggung jawab atas
							kerugian tidak langsung, insidental, atau konsekuensial yang
							timbul dari penggunaan layanan. Layanan diberikan “apa adanya”.
						</p>

						<h2>9. Pengakhiran</h2>
						<p>
							Kami dapat menangguhkan atau menghentikan akses ke layanan jika
							terjadi pelanggaran ketentuan atau hukum.
						</p>

						<h2>10. Perubahan</h2>
						<p>
							Kami dapat memperbarui Syarat & Ketentuan ini dari waktu ke waktu.
							Versi terbaru akan dipublikasikan di halaman ini.
						</p>

						<h2>11. Hukum yang Berlaku</h2>
						<p>
							Dokumen ini diatur oleh hukum Republik Indonesia. Sengketa
							diselesaikan sesuai mekanisme yang berlaku.
						</p>

						<h2>12. Kontak</h2>
						<p>Untuk pertanyaan, hubungi support Ourbit.</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
