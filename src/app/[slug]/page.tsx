import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import AddToCartButton from "@/components/public/AddToCartButton";
import CartSheet from "@/components/cart/CartSheet";

type Props = { params: Promise<{ slug: string }> };

async function fetchPublicData(slug: string) {
	function getBaseUrl(): string {
		const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
		if (siteUrl && /^https?:\/\//.test(siteUrl))
			return siteUrl.replace(/\/$/, "");
		const vercelUrl = process.env.NEXT_PUBLIC_VERCEL_URL;
		if (vercelUrl) return `https://${vercelUrl}`.replace(/\/$/, "");
		const port = process.env.PORT ?? "3000";
		return `http://localhost:${port}`;
	}

	const url = `${getBaseUrl()}/api/public/${slug}`;
	const res = await fetch(url, {
		// revalidate quickly for near-live updates
		next: { revalidate: 60 },
	});
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
		<div className="container mx-auto px-4 py-8">
			<div className="mb-8">
				<h1 className="text-3xl font-bold">
					{profile.display_name ?? profile.slug}
				</h1>
				{profile.bio && (
					<p className="text-[var(--muted-foreground)] mt-2">{profile.bio}</p>
				)}
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
				{(products ?? []).map((p) => (
					<Card key={p.id}>
						<CardHeader>
							<CardTitle>{p.name}</CardTitle>
						</CardHeader>
						<CardContent>
							{p.image_url && (
								// eslint-disable-next-line @next/next/no-img-element
								<img
									src={p.image_url}
									alt={p.name}
									className="w-full h-48 object-cover rounded-md mb-3"
								/>
							)}
							{p.description && (
								<p className="text-sm text-[var(--muted-foreground)] line-clamp-3 mb-3">
									{p.description}
								</p>
							)}
							<div className="flex items-center justify-between">
								<div className="font-semibold">
									Rp {Number(p.price).toLocaleString("id-ID")}
								</div>
								<AddToCartButton storeId={profile.store_id} productId={p.id} />
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			<CartSheet storeId={profile.store_id} />
		</div>
	);
}
