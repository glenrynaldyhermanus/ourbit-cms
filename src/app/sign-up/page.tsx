"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AuthUtil } from "@/lib/auth";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/providers/ToastProvider";

export default function SignUpPage() {
	const router = useRouter();
	const { showToast } = useToast();
	const [formData, setFormData] = useState({
		email: "",
		password: "",
		confirmPassword: "",
		fullName: "",
		phone: "",
	});
	const [termsAccepted, setTermsAccepted] = useState(false);
	const [passwordVisible, setPasswordVisible] = useState(false);
	const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSignUp = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		// Validasi password
		if (formData.password !== formData.confirmPassword) {
			const errorMessage = "Password dan konfirmasi password tidak sama";
			setError(errorMessage);
			showToast({
				type: "error",
				title: "Validasi gagal",
				message: errorMessage,
			});
			setLoading(false);
			return;
		}

		if (formData.password.length < 6) {
			const errorMessage = "Password harus minimal 6 karakter";
			setError(errorMessage);
			showToast({
				type: "error",
				title: "Validasi gagal",
				message: errorMessage,
			});
			setLoading(false);
			return;
		}

		if (!termsAccepted) {
			const errorMessage =
				"Anda harus menyetujui Syarat Ketentuan dan Kebijakan Privasi";
			setError(errorMessage);
			showToast({
				type: "error",
				title: "Validasi gagal",
				message: errorMessage,
			});
			setLoading(false);
			return;
		}

		try {
			const data = await AuthUtil.signUpWithEmail(
				formData.email,
				formData.password,
				formData.fullName,
				formData.phone
			);

			if (data.user) {
				showToast({
					type: "success",
					title: "Registrasi berhasil!",
					message: "Silakan cek email untuk konfirmasi akun",
				});
				router.push("/sign-up-success");
			}
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error
					? error.message
					: "Terjadi kesalahan saat mendaftar";
			setError(errorMessage);
			showToast({
				type: "error",
				title: "Registrasi gagal",
				message: errorMessage,
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gray-50 flex">
			{/* Background Image Section - Only visible on desktop */}
			<div className="hidden lg:flex lg:flex-1 lg:max-w-2xl relative">
				<div className="flex-1 flex flex-col justify-center px-16">
					<div className="w-full h-full relative bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl overflow-hidden">
						<div className="absolute inset-0 flex items-center justify-center">
							<div className="text-center text-white">
								<h1 className="text-4xl font-bold mb-4">Bergabung dengan</h1>
								<h2 className="text-5xl font-bold">Ourbit</h2>
								<p className="text-xl mt-4 opacity-90">
									Mulai kelola bisnis Anda dengan mudah
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Form Section */}
			<div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
				<div className="mx-auto w-full max-w-sm lg:w-96">
					<div>
						{/* Logo */}
						<div className="mb-6">
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

						{/* Welcome Text */}
						<h2 className="text-3xl font-bold text-gray-900 mb-3">
							Daftar Akun Baru
						</h2>
						<p className="text-gray-600 mb-8">
							Buat akun admin untuk menggunakan sistem
						</p>
					</div>

					<form onSubmit={handleSignUp} className="space-y-6">
						{error && (
							<div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
								{error}
							</div>
						)}

						{/* Full Name Field */}
						<div>
							<label
								htmlFor="fullName"
								className="block text-sm font-medium text-gray-700 mb-2">
								Nama Lengkap
							</label>
							<input
								id="fullName"
								name="fullName"
								type="text"
								required
								value={formData.fullName}
								onChange={handleInputChange}
								className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
								placeholder="Nama Lengkap"
							/>
						</div>

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
								value={formData.email}
								onChange={handleInputChange}
								className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
								placeholder="glen.rynaldy@gmail.com"
							/>
						</div>

						{/* Phone Field */}
						<div>
							<label
								htmlFor="phone"
								className="block text-sm font-medium text-gray-700 mb-2">
								No. Handphone
							</label>
							<input
								id="phone"
								name="phone"
								type="tel"
								required
								value={formData.phone}
								onChange={handleInputChange}
								className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
								placeholder="081314169140"
							/>
						</div>

						{/* Password Field */}
						<div>
							<label
								htmlFor="password"
								className="block text-sm font-medium text-gray-700 mb-2">
								Password
							</label>
							<div className="relative">
								<input
									id="password"
									name="password"
									type={passwordVisible ? "text" : "password"}
									autoComplete="new-password"
									required
									value={formData.password}
									onChange={handleInputChange}
									className="appearance-none relative block w-full px-3 py-3 pr-12 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
									placeholder="Password (minimal 6 karakter)"
								/>
								<button
									type="button"
									className="absolute inset-y-0 right-0 pr-3 flex items-center"
									onClick={() => setPasswordVisible(!passwordVisible)}>
									{passwordVisible ? (
										<EyeOff className="h-5 w-5 text-gray-400" />
									) : (
										<Eye className="h-5 w-5 text-gray-400" />
									)}
								</button>
							</div>
						</div>

						{/* Confirm Password Field */}
						<div>
							<label
								htmlFor="confirmPassword"
								className="block text-sm font-medium text-gray-700 mb-2">
								Konfirmasi Password
							</label>
							<div className="relative">
								<input
									id="confirmPassword"
									name="confirmPassword"
									type={confirmPasswordVisible ? "text" : "password"}
									autoComplete="new-password"
									required
									value={formData.confirmPassword}
									onChange={handleInputChange}
									className="appearance-none relative block w-full px-3 py-3 pr-12 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
									placeholder="Konfirmasi Password"
								/>
								<button
									type="button"
									className="absolute inset-y-0 right-0 pr-3 flex items-center"
									onClick={() =>
										setConfirmPasswordVisible(!confirmPasswordVisible)
									}>
									{confirmPasswordVisible ? (
										<EyeOff className="h-5 w-5 text-gray-400" />
									) : (
										<Eye className="h-5 w-5 text-gray-400" />
									)}
								</button>
							</div>
						</div>

						{/* Terms & Conditions Checkbox */}
						<div className="flex items-start">
							<input
								id="terms"
								type="checkbox"
								checked={termsAccepted}
								onChange={(e) => setTermsAccepted(e.target.checked)}
								className="mt-1 h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
							/>
							<label htmlFor="terms" className="ml-3 text-sm text-gray-600">
								Saya telah membaca dan menyetujui{" "}
								<span className="text-orange-600 hover:text-orange-500 font-medium">
									Syarat Ketentuan
								</span>{" "}
								dan{" "}
								<span className="text-orange-600 hover:text-orange-500 font-medium">
									Kebijakan Privasi
								</span>
							</label>
						</div>

						{/* Sign Up Button */}
						<div>
							<button
								type="submit"
								disabled={loading}
								className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200">
								{loading ? "Memproses..." : "Daftarkan Toko"}
							</button>
						</div>

						{/* Sign In Link */}
						<div className="text-center">
							<p className="text-sm text-gray-600">
								Sudah punya akun?{" "}
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
