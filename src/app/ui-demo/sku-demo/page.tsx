"use client";

import React, { useState } from "react";
import {
	RefreshCw,
	Settings,
	CheckCircle,
	AlertCircle,
	Info,
	Copy,
	Download,
} from "lucide-react";
import SKUGeneratorComponent from "@/components/forms/SKUGenerator";

const mockCategories = [
	{ id: "cat-1", name: "Electronics" },
	{ id: "cat-2", name: "Food & Beverages" },
	{ id: "cat-3", name: "Clothing" },
	{ id: "cat-4", name: "Books" },
];

const mockProducts = [
	{ name: "Laptop HP Pavilion", category: "Electronics", sku: "ELE-001" },
	{ name: "Susu Ultra Milk", category: "Food & Beverages", sku: "FAB-001" },
	{ name: "T-Shirt Cotton", category: "Clothing", sku: "CLT-001" },
	{ name: "Programming Book", category: "Books", sku: "BOO-001" },
];

export default function SKUDemoPage() {
	const [selectedCategory, setSelectedCategory] = useState<string>("cat-1");
	const [productName, setProductName] = useState<string>("Laptop HP Pavilion");
	const [generatedSKU, setGeneratedSKU] = useState<string>("ELE-001");
	const [skuValidation, setSkuValidation] = useState({
		isValid: true,
		message: "SKU valid",
	});
	const [activeTab, setActiveTab] = useState("live-demo");

	const getCategoryName = (categoryId: string) => {
		return mockCategories.find((cat) => cat.id === categoryId)?.name || "";
	};

	const handleSKUChange = (sku: string) => {
		setGeneratedSKU(sku);
	};

	const handleValidationChange = (isValid: boolean, message: string) => {
		setSkuValidation({ isValid, message });
	};

	const copyToClipboard = (text: string) => {
		navigator.clipboard.writeText(text);
	};

	return (
		<div className="container mx-auto p-6 space-y-6">
			<div className="text-center space-y-2">
				<h1 className="text-3xl font-bold text-gray-900">SKU Generator Demo</h1>
				<p className="text-gray-600">
					Demo fitur SKU Generator yang advanced dengan berbagai pola dan
					validasi real-time
				</p>
			</div>

			{/* Tab Navigation */}
			<div className="flex space-x-1 rounded-lg bg-gray-100 p-1">
				{[
					{ id: "live-demo", label: "Live Demo" },
					{ id: "examples", label: "Contoh Penggunaan" },
					{ id: "comparison", label: "Perbandingan" },
				].map((tab) => (
					<button
						key={tab.id}
						onClick={() => setActiveTab(tab.id)}
						className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-all ${
							activeTab === tab.id
								? "bg-white text-gray-900 shadow-sm"
								: "text-gray-600 hover:text-gray-900"
						}`}>
						{tab.label}
					</button>
				))}
			</div>

			{/* Live Demo Tab */}
			{activeTab === "live-demo" && (
				<div className="space-y-6">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						{/* Input Controls */}
						<div className="bg-white border border-gray-200 rounded-lg shadow-sm">
							<div className="px-6 py-4 border-b border-gray-100">
								<h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
									<Settings className="w-5 h-5" />
									<span>Input Parameters</span>
								</h3>
							</div>
							<div className="px-6 py-4 space-y-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Nama Produk
									</label>
									<input
										type="text"
										value={productName}
										onChange={(e) => setProductName(e.target.value)}
										placeholder="Masukkan nama produk"
										className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									/>
									<p className="text-xs text-gray-500 mt-1">
										Minimal 3 karakter untuk auto-generate SKU
									</p>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Kategori
									</label>
									<select
										value={selectedCategory}
										onChange={(e) => setSelectedCategory(e.target.value)}
										className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
										{mockCategories.map((category) => (
											<option key={category.id} value={category.id}>
												{category.name}
											</option>
										))}
									</select>
								</div>
							</div>
						</div>

						{/* SKU Generator Component */}
						<div className="bg-white border border-gray-200 rounded-lg shadow-sm">
							<div className="px-6 py-4 border-b border-gray-100">
								<h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
									<RefreshCw className="w-5 h-5" />
									<span>SKU Generator</span>
								</h3>
							</div>
							<div className="px-6 py-4">
								<SKUGeneratorComponent
									productName={productName}
									categoryId={selectedCategory}
									categoryName={getCategoryName(selectedCategory)}
									storeId="demo-store"
									currentSKU={generatedSKU}
									onSKUChange={handleSKUChange}
									onValidationChange={handleValidationChange}
								/>
							</div>
						</div>
					</div>

					{/* Generated SKU Display */}
					<div className="bg-white border border-gray-200 rounded-lg shadow-sm">
						<div className="px-6 py-4 border-b border-gray-100">
							<h3 className="text-lg font-semibold text-gray-900">
								Generated SKU
							</h3>
						</div>
						<div className="px-6 py-4">
							<div className="flex items-center space-x-4">
								<div className="flex-1">
									<div className="flex items-center space-x-2">
										<span
											className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
												skuValidation.isValid
													? "bg-green-100 text-green-800"
													: "bg-red-100 text-red-800"
											}`}>
											{skuValidation.isValid ? "Valid" : "Invalid"}
										</span>
										<span className="font-mono text-lg">{generatedSKU}</span>
									</div>
									{skuValidation.message && (
										<p
											className={`text-sm mt-1 ${
												skuValidation.isValid
													? "text-green-600"
													: "text-red-600"
											}`}>
											{skuValidation.message}
										</p>
									)}
								</div>
								<button
									onClick={() => copyToClipboard(generatedSKU)}
									className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
									<Copy className="w-4 h-4" />
									<span>Copy</span>
								</button>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Examples Tab */}
			{activeTab === "examples" && (
				<div className="space-y-6">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{/* Pattern Examples */}
						<div className="bg-white border border-gray-200 rounded-lg shadow-sm">
							<div className="px-6 py-4 border-b border-gray-100">
								<h3 className="text-lg font-semibold text-gray-900">
									Pattern Examples
								</h3>
							</div>
							<div className="px-6 py-4 space-y-4">
								{[
									{
										name: "Category + Sequential",
										examples: ["ELE-001", "FOO-002", "CLT-003"],
									},
									{
										name: "Name-based",
										examples: ["LHP-001", "SUM-002", "TSC-003"],
									},
									{
										name: "Date-based",
										examples: ["240101-001", "240101-002", "240101-003"],
									},
									{
										name: "Custom",
										examples: ["PROD-ELE-001", "ITEM-FOO-002", "STK-CLT-003"],
									},
								].map((pattern) => (
									<div key={pattern.name} className="border rounded-lg p-3">
										<h4 className="font-medium text-sm">{pattern.name}</h4>
										<div className="flex flex-wrap gap-1 mt-2">
											{pattern.examples.map((example, index) => (
												<span
													key={index}
													className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 font-mono">
													{example}
												</span>
											))}
										</div>
									</div>
								))}
							</div>
						</div>

						{/* Sample Products */}
						<div className="bg-white border border-gray-200 rounded-lg shadow-sm">
							<div className="px-6 py-4 border-b border-gray-100">
								<h3 className="text-lg font-semibold text-gray-900">
									Sample Products
								</h3>
							</div>
							<div className="px-6 py-4">
								<div className="space-y-3">
									{mockProducts.map((product, index) => (
										<div
											key={index}
											className="flex items-center justify-between p-3 border rounded-lg">
											<div>
												<p className="font-medium text-sm">{product.name}</p>
												<p className="text-xs text-gray-500">
													{product.category}
												</p>
											</div>
											<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border border-gray-300 text-gray-700 bg-white font-mono">
												{product.sku}
											</span>
										</div>
									))}
								</div>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Comparison Tab */}
			{activeTab === "comparison" && (
				<div className="space-y-6">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						{/* KasirPintar.id */}
						<div className="bg-white border border-gray-200 rounded-lg shadow-sm">
							<div className="px-6 py-4 border-b border-gray-100">
								<h3 className="text-lg font-semibold text-orange-600">
									KasirPintar.id
								</h3>
							</div>
							<div className="px-6 py-4 space-y-4">
								<div className="space-y-2">
									<h4 className="font-medium">Fitur:</h4>
									<ul className="text-sm space-y-1 text-gray-600">
										<li>• Auto SKU generation</li>
										<li>• Single pattern (name-based)</li>
										<li>• Basic validation</li>
										<li>• Manual override</li>
									</ul>
								</div>
								<div className="space-y-2">
									<h4 className="font-medium">Keterbatasan:</h4>
									<ul className="text-sm space-y-1 text-red-600">
										<li>• Hanya 1 pola SKU</li>
										<li>• Tidak ada real-time validation</li>
										<li>• Tidak ada custom options</li>
										<li>• UX kurang advanced</li>
									</ul>
								</div>
							</div>
						</div>

						{/* OurBit CMS */}
						<div className="bg-white border border-gray-200 rounded-lg shadow-sm">
							<div className="px-6 py-4 border-b border-gray-100">
								<h3 className="text-lg font-semibold text-blue-600">
									OurBit CMS
								</h3>
							</div>
							<div className="px-6 py-4 space-y-4">
								<div className="space-y-2">
									<h4 className="font-medium">Fitur:</h4>
									<ul className="text-sm space-y-1 text-gray-600">
										<li>• 4 pola SKU berbeda</li>
										<li>• Real-time validation</li>
										<li>• Custom prefix/suffix</li>
										<li>• Advanced UX dengan visual feedback</li>
										<li>• Toggle auto/manual</li>
										<li>• Uniqueness checking</li>
									</ul>
								</div>
								<div className="space-y-2">
									<h4 className="font-medium">Keunggulan:</h4>
									<ul className="text-sm space-y-1 text-green-600">
										<li>• Multiple patterns</li>
										<li>• Better user experience</li>
										<li>• More flexible</li>
										<li>• Advanced features</li>
									</ul>
								</div>
							</div>
						</div>
					</div>

					{/* Feature Comparison Table */}
					<div className="bg-white border border-gray-200 rounded-lg shadow-sm">
						<div className="px-6 py-4 border-b border-gray-100">
							<h3 className="text-lg font-semibold text-gray-900">
								Feature Comparison
							</h3>
						</div>
						<div className="px-6 py-4">
							<div className="overflow-x-auto">
								<table className="w-full text-sm">
									<thead>
										<tr className="border-b">
											<th className="text-left py-2">Feature</th>
											<th className="text-center py-2">KasirPintar.id</th>
											<th className="text-center py-2">OurBit CMS</th>
										</tr>
									</thead>
									<tbody>
										{[
											{
												feature: "Auto SKU Generation",
												kasirpintar: "✓",
												ourbit: "✓",
											},
											{
												feature: "Multiple Patterns",
												kasirpintar: "✗",
												ourbit: "✓",
											},
											{
												feature: "Real-time Validation",
												kasirpintar: "✗",
												ourbit: "✓",
											},
											{
												feature: "Custom Options",
												kasirpintar: "✗",
												ourbit: "✓",
											},
											{
												feature: "Visual Feedback",
												kasirpintar: "✗",
												ourbit: "✓",
											},
											{
												feature: "Toggle Auto/Manual",
												kasirpintar: "✗",
												ourbit: "✓",
											},
											{
												feature: "Uniqueness Check",
												kasirpintar: "✗",
												ourbit: "✓",
											},
											{
												feature: "Pattern Examples",
												kasirpintar: "✗",
												ourbit: "✓",
											},
										].map((row, index) => (
											<tr key={index} className="border-b">
												<td className="py-2">{row.feature}</td>
												<td className="text-center py-2">{row.kasirpintar}</td>
												<td className="text-center py-2">{row.ourbit}</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Footer */}
			<div className="text-center space-y-2">
				<p className="text-sm text-gray-500">SKU Generator Demo - OurBit CMS</p>
				<div className="flex justify-center space-x-4">
					<button className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
						<Download className="w-4 h-4" />
						<span>Download Demo</span>
					</button>
					<button className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
						<Info className="w-4 h-4" />
						<span>Documentation</span>
					</button>
				</div>
			</div>
		</div>
	);
}
