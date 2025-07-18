"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthUtil } from "@/lib/auth";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/Toast";
import Image from "next/image";
import { PrimaryButton } from "@/components/button/button";

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
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error ? error.message : "Terjadi kesalahan saat masuk";
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
			<div className="hidden lg:flex lg:w-3/4 relative">
				<div className="flex-1 flex flex-col">
					<div className="w-full h-full relative overflow-hidden">
						<Image
							src="/signin_bg.png"
							alt="Sign In Background"
							fill
							className="object-cover"
							priority
						/>
					</div>
				</div>
			</div>

			{/* Form Section */}
			<div className="flex-1 lg:w-1/4 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 xl:px-12">
				<div className="mx-auto w-full max-w-sm lg:w-full">
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
							<PrimaryButton
								type="submit"
								disabled={loading}
								loading={loading}
								className="w-full">
								{loading ? "Memproses..." : "Masuk"}
							</PrimaryButton>
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
