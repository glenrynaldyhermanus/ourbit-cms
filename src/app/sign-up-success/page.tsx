"use client";

import { CheckCircle, Mail } from "lucide-react";
import Link from "next/link";

export default function SignUpSuccessPage() {
	return (
		<div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
			<div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
				<div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
					<div className="text-center">
						{/* Success Icon */}
						<div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
							<CheckCircle className="h-8 w-8 text-green-600" />
						</div>

						{/* Logo */}
						<div className="mb-6 flex justify-center">
							<div className="w-32 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
								<span className="text-white font-bold text-xl">OURBIT</span>
							</div>
						</div>

						{/* Success Message */}
						<h2 className="text-2xl font-bold text-gray-900 mb-4">
							Pendaftaran Berhasil!
						</h2>

						<div className="mb-6">
							<div className="flex justify-center mb-4">
								<Mail className="h-12 w-12 text-orange-500" />
							</div>
							<p className="text-gray-600 text-base mb-4">
								Akun Anda telah berhasil dibuat. Kami telah mengirimkan email
								konfirmasi ke alamat email yang Anda daftarkan.
							</p>
							<p className="text-gray-600 text-sm">
								Silakan cek email Anda dan klik link konfirmasi untuk
								mengaktifkan akun.
							</p>
						</div>

						{/* Instructions */}
						<div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
							<div className="text-sm text-blue-800">
								<p className="font-medium mb-2">Langkah selanjutnya:</p>
								<ol className="text-left list-decimal list-inside space-y-1">
									<li>Buka email Anda</li>
									<li>Cari email dari OURBIT CMS</li>
									<li>Klik link konfirmasi dalam email</li>
									<li>Kembali ke halaman login</li>
								</ol>
							</div>
						</div>

						{/* Actions */}
						<div className="space-y-4">
							<Link
								href="/sign-in"
								className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors duration-200">
								Kembali ke Halaman Login
							</Link>

							<div className="text-center">
								<p className="text-sm text-gray-600">
									Tidak menerima email?{" "}
									<button
										onClick={() => window.location.reload()}
										className="font-medium text-orange-600 hover:text-orange-500 transition-colors duration-200">
										Kirim ulang
									</button>
								</p>
							</div>
						</div>

						{/* Help */}
						<div className="mt-8 pt-6 border-t border-gray-200">
							<p className="text-xs text-gray-500">
								Butuh bantuan? Hubungi tim support kami di{" "}
								<a
									href="mailto:support@ourbit.com"
									className="text-orange-600 hover:text-orange-500">
									support@ourbit.com
								</a>
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
