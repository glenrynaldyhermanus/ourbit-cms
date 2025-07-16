"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthUtil } from "@/lib/auth";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/Toast";

export default function SignInPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { showToast } = useToast();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [passwordVisible, setPasswordVisible] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	// Get redirect URL from query params
	const redirectTo = searchParams.get("from") || "/";

	const handleSignIn = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			const data = await AuthUtil.signInWithEmail(email, password);

			if (data.user) {
				showToast({
					type: "success",
					title: "Login berhasil!",
					message: "Selamat datang kembali",
				});
				router.push(redirectTo);
			}
		} catch (error: any) {
			const errorMessage = error.message || "Terjadi kesalahan saat masuk";
			setError(errorMessage);
			showToast({
				type: "error",
				title: "Login gagal",
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
						{/* You can add background image here */}
						<div className="absolute inset-0 flex items-center justify-center">
							<div className="text-center text-white">
								<h1 className="text-4xl font-bold mb-4">Selamat Datang di</h1>
								<h2 className="text-5xl font-bold">OURBIT CMS</h2>
								<p className="text-xl mt-4 opacity-90">
									Kelola bisnis Anda dengan mudah dan efisien
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
							<div className="w-32 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
								<span className="text-white font-bold text-xl">OURBIT</span>
							</div>
						</div>

						{/* Welcome Text */}
						<h2 className="text-3xl font-bold text-gray-900 mb-3">
							Selamat Datang!
						</h2>
						<p className="text-gray-600 mb-8">
							Silahkan masukkan akun admin kamu
						</p>
					</div>

					<form onSubmit={handleSignIn} className="space-y-6">
						{error && (
							<div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
								{error}
							</div>
						)}

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
								placeholder="Email"
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
									autoComplete="current-password"
									required
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									className="appearance-none relative block w-full px-3 py-3 pr-12 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
									placeholder="Password"
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

						{/* Sign In Button */}
						<div>
							<button
								type="submit"
								disabled={loading}
								className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200">
								{loading ? "Memproses..." : "Masuk"}
							</button>
						</div>

						{/* Forgot Password Link */}
						<div className="text-center">
							<Link
								href="/forgot-password"
								className="text-sm text-orange-600 hover:text-orange-500 transition-colors duration-200">
								Lupa password?
							</Link>
						</div>

						{/* Sign Up Link */}
						<div className="text-center">
							<p className="text-sm text-gray-600">
								Belum punya akun?{" "}
								<Link
									href="/sign-up"
									className="font-semibold text-orange-600 hover:text-orange-500 transition-colors duration-200">
									Daftar di sini
								</Link>
							</p>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}
