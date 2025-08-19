import { Card, CardContent, Button } from "@/components/ui";
import AddToCartButton from "@/components/public/AddToCartButton";
import CartSheet from "@/components/cart/CartSheet";
import {
	ShoppingCart,
	Grid2x2,
	Heart,
	Receipt,
	Menu,
	Search,
} from "lucide-react";
import { headers } from "next/headers";

type Props = { params: Promise<{ slug: string }> };

async function fetchPublicData(slug: string) {
	async function getBaseUrl(): Promise<string> {
		const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
		if (siteUrl && /^https?:\/\//.test(siteUrl))
			return siteUrl.replace(/\/$/, "");
		const vercelUrl = process.env.NEXT_PUBLIC_VERCEL_URL;
		if (vercelUrl) return `https://${vercelUrl}`.replace(/\/$/, "");
		const h = await headers();
		const proto = h.get("x-forwarded-proto") ?? "http";
		const host = h.get("host") ?? `localhost:${process.env.PORT ?? "3000"}`;
		return `${proto}://${host}`;
	}

	const base = await getBaseUrl();
	const cleanSlug = slug.replace(/^@/, "");
	const url = `${base}/api/public/${encodeURIComponent(cleanSlug)}`;
	const res = await fetch(url, { cache: "no-store" });
	if (!res.ok) return null;
	return res.json();
}

export default async function PublicStorePage({ params }: Props) {
	const { slug } = await params;
	const data = await fetchPublicData(slug);

	if (!data) {
		return (
			<div className="container mx-auto px-4 py-8">
				<h1 className="text-2xl font-semibold">Toko tidak ditemukan</h1>
			</div>
		);
	}

	const { profile, products } = data as {
		profile: {
			business_id: string;
			store_id: string;
			display_name?: string | null;
			slug: string;
			bio?: string | null;
		};
		products: Array<{
			id: string;
			name: string;
			description?: string | null;
			image_url?: string | null;
			price: number;
		}>;
	};

	return (
		<div className="max-w-[1080px] mx-auto px-4 py-6">
			{/* Topbar */}
			<div className="flex items-center gap-3">
				<Button variant="outline" size="icon">
					<Menu className="w-5 h-5" />
				</Button>
				<div className="font-bold text-[var(--foreground)]">
					{profile.display_name ?? profile.slug}
				</div>
				<div className="flex-1 flex items-center gap-2 bg-[var(--card)] border border-[var(--border)] rounded-xl px-3 py-2">
					<Search className="w-4 h-4 text-[var(--muted-foreground)]" />
					<input
						placeholder="Cari produk…"
						className="w-full bg-transparent outline-none text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]"
					/>
				</div>
				<Button variant="outline" size="icon">
					<ShoppingCart className="w-5 h-5" />
				</Button>
			</div>

			{/* Chips */}
			<div className="flex gap-2 overflow-x-auto scrollbar-none py-4">
				{["Semua", "Dress", "T-Shirt", "Jeans", "Sepatu", "Aksesoris"].map(
					(label, idx) => (
						<button
							key={label}
							className={`px-3.5 py-2 rounded-full border text-sm whitespace-nowrap ${
								idx === 0
									? "bg-[var(--primary)] text-[var(--primary-foreground)] border-[var(--primary)]"
									: "bg-[var(--card)] text-[var(--foreground)] border-[var(--border)]"
							}`}>
							{label}
						</button>
					)
				)}
			</div>

			{/* Banner */}
			<div className="mt-2 bg-gradient-to-tr from-[var(--card)] to-[var(--primary)]/10 rounded-2xl p-5 border border-[var(--border)] flex items-center justify-between">
				<div className="pr-4">
					<h3 className="m-0 text-base font-semibold text-[var(--foreground)]">
						Koleksi Baru
					</h3>
					<p className="m-0 text-sm text-[var(--muted-foreground)]">
						Lihat pilihan terbaru untuk harimu.
					</p>
					<Button className="mt-3">Lihat Semua</Button>
				</div>
				<div aria-hidden className="hidden sm:block">
					<div className="w-[120px] h-[90px] bg-[var(--background)] rounded-xl grid place-items-center border border-[var(--border)]" />
				</div>
			</div>

			{/* Section head */}
			<div className="flex items-center justify-between mt-5 mb-2 px-1">
				<h4 className="m-0 text-base font-semibold">Produk</h4>
				<a href="#" className="text-[var(--primary)] text-sm font-semibold">
					Lihat semua
				</a>
			</div>

			{/* Grid */}
			<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
				{(products ?? []).map((p) => (
					<Card key={p.id} className="relative rounded-2xl overflow-hidden">
						<div className="aspect-[4/3] bg-[var(--muted-background)] grid place-items-center overflow-hidden">
							{p.image_url ? (
								// eslint-disable-next-line @next/next/no-img-element
								<img
									src={p.image_url}
									alt={p.name}
									className="w-full h-full object-cover"
								/>
							) : (
								<div className="w-full h-full bg-[var(--muted)]" />
							)}
							<button className="absolute top-2 right-2 w-9 h-9 rounded-full bg-[var(--background)] border border-[var(--border)] grid place-items-center hover:bg-[var(--muted)] transition-colors">
								<Heart className="w-4 h-4 text-[var(--muted-foreground)]" />
							</button>
						</div>
						<CardContent className="p-3">
							<h5 className="text-sm font-semibold line-clamp-1">{p.name}</h5>
							{p.description && (
								<p className="text-[13px] text-[var(--muted-foreground)] line-clamp-2 mt-1">
									{p.description}
								</p>
							)}
							<div className="mt-2 flex items-center justify-between">
								<div className="text-[var(--primary)] font-bold">
									Rp {Number(p.price).toLocaleString("id-ID")}
								</div>
								<AddToCartButton storeId={profile.store_id} productId={p.id} />
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{/* Floating bottom menu */}
			<div className="fixed left-1/2 -translate-x-1/2 bottom-4 z-40">
				<div className="flex items-center gap-8 bg-[var(--card)]/90 backdrop-blur px-8 py-4 border border-[var(--border)] rounded-2xl">
					<button className="inline-flex flex-col items-center text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
						<Grid2x2 className="w-5 h-5 mb-0.5" />
						<span>Catalog</span>
					</button>
					<button className="inline-flex flex-col items-center text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
						<ShoppingCart className="w-5 h-5 mb-0.5" />
						<span>Cart</span>
					</button>
					<button className="inline-flex flex-col items-center text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
						<Receipt className="w-5 h-5 mb-0.5" />
						<span>Orders</span>
					</button>
					<button className="inline-flex flex-col items-center text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
						<Heart className="w-5 h-5 mb-0.5" />
						<span>Wishlist</span>
					</button>
				</div>
			</div>

			<CartSheet storeId={profile.store_id} />
		</div>
	);
}
