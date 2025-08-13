import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import Button, { PrimaryButton } from "@/components/ui/Button";
import Divider from "@/components/ui/Divider";
import {
	Smartphone,
	Tablet,
	Apple,
	Laptop,
	Monitor,
	Download as DownloadIcon,
} from "lucide-react";

export const metadata = {
	title: "Download Ourbit Kasir",
	description:
		"Unduh aplikasi Ourbit Kasir untuk perangkat Anda: Android, iOS, iPadOS, macOS, dan Windows.",
};

export default function CashierDownloadPage() {
	const ANDROID_LINK =
		"https://drive.google.com/file/d/1R0RbIvQfYMlPPIw8eu4wEqYZYKAu7SXs/view?usp=sharing";

	return (
		<main className="min-h-screen bg-[var(--background)]">
			<div className="max-w-5xl mx-auto px-6 py-10">
				<div className="mb-8">
					<h1 className="text-2xl md:text-3xl font-semibold text-[var(--foreground)]">
						Download Ourbit Kasir
					</h1>
					<p className="text-[var(--muted-foreground)] mt-1">
						Pilih platform Anda untuk mengunduh aplikasi kasir.
					</p>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
					{/* Android - Smartphone */}
					<Card>
						<CardHeader className="flex items-center gap-3">
							<div className="w-10 h-10 rounded-xl bg-[var(--muted)] flex items-center justify-center">
								<Smartphone className="w-5 h-5 text-[var(--foreground)]" />
							</div>
							<div className="flex-1">
								<CardTitle>Android (Smartphone)</CardTitle>
								<div className="mt-1">
									<Badge>Available</Badge>
								</div>
							</div>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-[var(--muted-foreground)] mb-4">
								Versi khusus smartphone Android.
							</p>
							<Link
								href={ANDROID_LINK}
								target="_blank"
								rel="noopener noreferrer"
								aria-label="Download Ourbit Kasir untuk Android Smartphone">
								<PrimaryButton className="w-full">
									<DownloadIcon className="w-4 h-4" />
									<span className="ml-2">Download APK</span>
								</PrimaryButton>
							</Link>
						</CardContent>
					</Card>

					{/* Android - Tablet */}
					<Card>
						<CardHeader className="flex items-center gap-3">
							<div className="w-10 h-10 rounded-xl bg-[var(--muted)] flex items-center justify-center">
								<Tablet className="w-5 h-5 text-[var(--foreground)]" />
							</div>
							<div className="flex-1">
								<CardTitle>Android (Tablet)</CardTitle>
								<div className="mt-1">
									<Badge>Available</Badge>
								</div>
							</div>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-[var(--muted-foreground)] mb-4">
								Versi tablet Android.
							</p>
							<Link
								href={ANDROID_LINK}
								target="_blank"
								rel="noopener noreferrer"
								aria-label="Download Ourbit Kasir untuk Android Tablet">
								<PrimaryButton className="w-full">
									<DownloadIcon className="w-4 h-4" />
									<span className="ml-2">Download APK</span>
								</PrimaryButton>
							</Link>
						</CardContent>
					</Card>

					{/* iOS */}
					<Card>
						<CardHeader className="flex items-center gap-3">
							<div className="w-10 h-10 rounded-xl bg-[var(--muted)] flex items-center justify-center">
								<Apple className="w-5 h-5 text-[var(--foreground)]" />
							</div>
							<div className="flex-1">
								<CardTitle>iOS</CardTitle>
								<div className="mt-1">
									<Badge variant="secondary">Coming soon</Badge>
								</div>
							</div>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-[var(--muted-foreground)] mb-4">
								Akan tersedia di App Store.
							</p>
							<Button className="w-full" variant="outline" disabled>
								<span>Coming soon</span>
							</Button>
						</CardContent>
					</Card>

					{/* iPadOS */}
					<Card>
						<CardHeader className="flex items-center gap-3">
							<div className="w-10 h-10 rounded-xl bg-[var(--muted)] flex items-center justify-center">
								<Apple className="w-5 h-5 text-[var(--foreground)]" />
							</div>
							<div className="flex-1">
								<CardTitle>iPadOS</CardTitle>
								<div className="mt-1">
									<Badge variant="secondary">Coming soon</Badge>
								</div>
							</div>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-[var(--muted-foreground)] mb-4">
								Akan tersedia di App Store.
							</p>
							<Button className="w-full" variant="outline" disabled>
								<span>Coming soon</span>
							</Button>
						</CardContent>
					</Card>

					{/* macOS */}
					<Card>
						<CardHeader className="flex items-center gap-3">
							<div className="w-10 h-10 rounded-xl bg-[var(--muted)] flex items-center justify-center">
								<Laptop className="w-5 h-5 text-[var(--foreground)]" />
							</div>
							<div className="flex-1">
								<CardTitle>macOS</CardTitle>
								<div className="mt-1">
									<Badge variant="secondary">Coming soon</Badge>
								</div>
							</div>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-[var(--muted-foreground)] mb-4">
								Paket installer akan segera tersedia.
							</p>
							<Button className="w-full" variant="outline" disabled>
								<span>Coming soon</span>
							</Button>
						</CardContent>
					</Card>

					{/* Windows */}
					<Card>
						<CardHeader className="flex items-center gap-3">
							<div className="w-10 h-10 rounded-xl bg-[var(--muted)] flex items-center justify-center">
								<Monitor className="w-5 h-5 text-[var(--foreground)]" />
							</div>
							<div className="flex-1">
								<CardTitle>Windows</CardTitle>
								<div className="mt-1">
									<Badge variant="secondary">Coming soon</Badge>
								</div>
							</div>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-[var(--muted-foreground)] mb-4">
								Paket installer akan segera tersedia.
							</p>
							<Button className="w-full" variant="outline" disabled>
								<span>Coming soon</span>
							</Button>
						</CardContent>
					</Card>
				</div>

				<Divider className="my-10" />

				<p className="text-xs text-[var(--muted-foreground)]">
					Jika mengalami kendala saat mengunduh atau instalasi, hubungi tim
					support kami.
				</p>
			</div>
		</main>
	);
}
