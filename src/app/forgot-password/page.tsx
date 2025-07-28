"use client";

import { useState } from "react";
import Image from "next/image";
import { AuthUtil } from "@/lib/auth";
import { useToast } from "@/components/providers/ToastProvider";
import { ArrowLeft, Mail } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
	const { showToast } = useToast();
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);
	const [emailSent, setEmailSent] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		try {
			await AuthUtil.resetPassword(email);
			setEmailSent(true);
			showToast({
				type: "success",
				title: "Email reset password terkirim!",
				message: "Silakan cek email Anda untuk instruksi reset password",
			});
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error
					? error.message
					: "Terjadi kesalahan saat mengirim email reset password";
			showToast({
				type: "error",
				title: "Gagal mengirim email",
				message: errorMessage,
			});
		} finally {
			setLoading(false);
		}
	};

	if (emailSent) {
		return (
			<div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
				<div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
					<div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
						<div className="text-center">
							{/* Success Icon */}
							<div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
								<Mail className="h-8 w-8 text-green-600" />
							</div>

							{/* Logo */}
							<div className="mb-6 flex justify-center">
								<div className="w-32 h-12 relative">
									<Image
										src="/logo-ourbit-orange.png"
										alt="Ourbit Logo"
										fill
										className="object-contain"
										priority
									/>
								</div>
							</div>

							{/* Success Message */}
							<h2 className="text-2xl font-bold text-gray-900 mb-4">
								Email Terkirim!
							</h2>

							<div className="mb-6">
								<p className="text-gray-600 text-base mb-4">
									Kami telah mengirimkan link reset password ke email{" "}
									<strong>{email}</strong>
								</p>
								<p className="text-gray-600 text-sm">
									Silakan cek email Anda dan klik link untuk reset password.
								</p>
							</div>

							{/* Instructions */}
							<div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
								<div className="text-sm text-blue-800">
									<p className="font-medium mb-2">Langkah selanjutnya:</p>
									<ol className="text-left list-decimal list-inside space-y-1">
										<li>Buka email Anda</li>
										<li>Cari email dari Ourbit</li>
										<li>Klik link reset password</li>
										<li>Masukkan password baru</li>
									</ol>
								</div>
							</div>

							{/* Actions */}
							<div className="space-y-4">
								<Link
									href="/sign-in"
									className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors duration-200">
									Kembali ke Login
								</Link>

								<button
									onClick={() => {
										setEmailSent(false);
										setEmail("");
									}}
									className="w-full text-center text-sm text-gray-600 hover:text-gray-800">
									Kirim ulang dengan email lain
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
			<div className="sm:mx-auto sm:w-full sm:max-w-md">
				{/* Back to Login */}
				<div className="mb-6">
					<Link
						href="/sign-in"
						className="flex items-center text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200">
						<ArrowLeft className="w-4 h-4 mr-2" />
						Kembali ke Login
					</Link>
				</div>

				<div className="text-center">
					{/* Logo */}
					<div className="mb-6 flex justify-center">
						<div className="w-32 h-12 relative">
							<Image
								src="/logo-ourbit-orange.png"
								alt="Ourbit Logo"
								fill
								className="object-contain"
								priority
							/>
						</div>
					</div>

					<h2 className="text-3xl font-bold text-gray-900 mb-2">
						Lupa Password?
					</h2>
					<p className="text-gray-600 mb-8">
						Masukkan email Anda dan kami akan mengirimkan link untuk reset
						password
					</p>
				</div>
			</div>

			<div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
				<div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
					<form onSubmit={handleSubmit} className="space-y-6">
						{/* Email Field */}
						<div>
							<label
								htmlFor="email"
								className="block text-sm font-medium text-gray-700 mb-2">
								Email
							</label>
							<input
								id="email"
								name="email"
								type="email"
								autoComplete="email"
								required
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
								placeholder="Masukkan email Anda"
							/>
						</div>

						{/* Submit Button */}
						<div>
							<button
								type="submit"
								disabled={loading}
								className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200">
								{loading ? "Mengirim..." : "Kirim Link Reset Password"}
							</button>
						</div>

						{/* Help Text */}
						<div className="text-center">
							<p className="text-sm text-gray-600">
								Ingat password Anda?{" "}
								<Link
									href="/sign-in"
									className="font-semibold text-orange-600 hover:text-orange-500 transition-colors duration-200">
									Masuk di sini
								</Link>
							</p>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}
