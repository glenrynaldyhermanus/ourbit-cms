"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { Card } from "@/components/ui/Card";
import Divider from "@/components/ui/Divider";
import { supabase } from "@/lib/supabase";
import Button from "@/components/ui/Button";

interface PaymentType {
	id: string;
	code: string;
	name: string;
}

interface PaymentMethod {
	id: string;
	payment_type_id: string;
	code: string;
	name: string;
}

interface StorePaymentMethod {
	id: string;
	payment_method_id: string;
	is_active: boolean;
}

export default function PaymentPage() {
	const [paymentTypes, setPaymentTypes] = useState<PaymentType[]>([]);
	const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
	const [storePaymentMethods, setStorePaymentMethods] = useState<
		StorePaymentMethod[]
	>([]);
	const [activeTab, setActiveTab] = useState<string>("");
	const storeId = "STORE_ID_SAMPLE"; // TODO: ganti dengan store id aktif

	useEffect(() => {
		// Ambil payment types
		const fetchTypes = async () => {
			const { data, error } = await supabase
				.from("payment_types")
				.select("id, code, name")
				.order("name");
			if (!error && data) {
				setPaymentTypes(data);
				if (data.length > 0) setActiveTab(data[0].id);
			}
		};
		fetchTypes();
	}, []);

	useEffect(() => {
		// Ambil payment methods
		const fetchMethods = async () => {
			const { data, error } = await supabase
				.from("payment_methods")
				.select("id, payment_type_id, code, name")
				.order("name");
			if (!error && data) setPaymentMethods(data);
		};
		fetchMethods();
	}, []);

	useEffect(() => {
		// Ambil store_payment_methods
		const fetchStoreMethods = async () => {
			const { data, error } = await supabase
				.from("store_payment_methods")
				.select("id, payment_method_id, is_active")
				.eq("store_id", storeId)
				.eq("is_active", true);
			if (!error && data) setStorePaymentMethods(data);
		};
		fetchStoreMethods();
	}, [storeId]);

	// Filter payment methods yang aktif untuk store
	const getActiveMethodsByType = (typeId: string) => {
		const activeMethodIds = new Set(
			storePaymentMethods.map((spm) => spm.payment_method_id)
		);
		return paymentMethods.filter(
			(pm) => pm.payment_type_id === typeId && activeMethodIds.has(pm.id)
		);
	};

	return (
		<div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12">
			<Card className="w-full max-w-md p-8">
				<h1 className="text-2xl font-bold mb-4 text-center">
					Pilih Metode Pembayaran
				</h1>
				<Divider />
				<Tabs defaultValue={activeTab} className="mt-6">
					<TabsList>
						{paymentTypes.map((type) => (
							<TabsTrigger key={type.id} value={type.id}>
								{type.name}
							</TabsTrigger>
						))}
					</TabsList>
					<div className="mt-6">
						{paymentTypes.map((type) => (
							<TabsContent key={type.id} value={type.id}>
								<div className="flex flex-col gap-3">
									{getActiveMethodsByType(type.id).length === 0 && (
										<div className="text-center text-gray-400">
											Tidak ada metode pembayaran
										</div>
									)}
									{getActiveMethodsByType(type.id).map((m) => (
										<Button.Root
											key={m.id}
											variant="outline"
											className="w-full">
											<Button.Text>{m.name}</Button.Text>
										</Button.Root>
									))}
								</div>
							</TabsContent>
						))}
					</div>
				</Tabs>
			</Card>
		</div>
	);
}
