"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
	RefreshCw,
	Settings,
	CheckCircle,
	AlertCircle,
	Info,
} from "lucide-react";
import { SKUGenerator, SKU_PATTERNS, SKUOptions } from "@/lib/sku-generator";
import { Switch } from "@/components/ui";
import { Input, Select } from "@/components/ui";

interface SKUGeneratorProps {
	productName: string;
	categoryId: string | null;
	categoryName: string | null;
	storeId: string;
	currentSKU: string;
	onSKUChange: (sku: string) => void;
	onValidationChange: (isValid: boolean, message: string) => void;
	disabled?: boolean;
	excludeId?: string; // Untuk edit mode
}

export default function SKUGeneratorComponent({
	productName,
	categoryId,
	categoryName,
	storeId,
	currentSKU,
	onSKUChange,
	onValidationChange,
	disabled = false,
	excludeId,
}: SKUGeneratorProps) {
	const [autoGenerate, setAutoGenerate] = useState(false);
	const [selectedPattern, setSelectedPattern] = useState<SKUOptions["pattern"]>(
		"category-sequential"
	);
	const [customPrefix, setCustomPrefix] = useState("PROD");
	const [customSuffix, setCustomSuffix] = useState("");
	const [isGenerating, setIsGenerating] = useState(false);
	const [validationMessage, setValidationMessage] = useState("");
	const [isValid, setIsValid] = useState(false);
	const [isUnique, setIsUnique] = useState(true);
	const [showAdvanced, setShowAdvanced] = useState(false);
	const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(
		null
	);

	// Debounced SKU generation
	const debouncedGenerateSKU = useCallback(() => {
		if (debounceTimer) {
			clearTimeout(debounceTimer);
		}

		const timer = setTimeout(() => {
			if (autoGenerate && productName.trim().length >= 3) {
				generateSKU();
			}
		}, 800); // Increased debounce time to 800ms

		setDebounceTimer(timer);
	}, [
		autoGenerate,
		productName,
		categoryId,
		selectedPattern,
		customPrefix,
		customSuffix,
	]);

	// Auto-generate SKU when dependencies change
	useEffect(() => {
		debouncedGenerateSKU();

		return () => {
			if (debounceTimer) {
				clearTimeout(debounceTimer);
			}
		};
	}, [
		productName,
		categoryId,
		selectedPattern,
		customPrefix,
		customSuffix,
		autoGenerate,
	]);

	// Validate SKU when it changes
	useEffect(() => {
		validateSKU();
	}, [currentSKU]);

	const generateSKU = async () => {
		if (!autoGenerate || productName.trim().length < 3) return;

		setIsGenerating(true);
		try {
			const options: SKUOptions = {
				autoGenerate: true,
				pattern: selectedPattern,
				prefix: customPrefix,
				suffix: customSuffix,
			};

			const generatedSKU = await SKUGenerator.generateSKU(
				productName,
				categoryId,
				categoryName,
				storeId,
				options
			);

			onSKUChange(generatedSKU);
		} catch (error) {
			console.error("Error generating SKU:", error);
		} finally {
			setIsGenerating(false);
		}
	};

	const validateSKU = async () => {
		if (!currentSKU.trim()) {
			setValidationMessage("");
			setIsValid(false);
			onValidationChange(false, "");
			return;
		}

		// Basic validation
		const validation = SKUGenerator.validateSKU(currentSKU);
		setValidationMessage(validation.message);
		setIsValid(validation.isValid);

		if (validation.isValid) {
			// Check uniqueness
			const unique = await SKUGenerator.checkSKUUniqueness(
				currentSKU,
				storeId,
				excludeId
			);
			setIsUnique(unique);

			if (!unique) {
				setValidationMessage("SKU sudah digunakan oleh produk lain");
				setIsValid(false);
			}
		}

		onValidationChange(isValid && isUnique, validationMessage);
	};

	const handleManualSKUChange = (value: string) => {
		onSKUChange(value);
	};

	const getSelectedPatternInfo = () => {
		return SKU_PATTERNS.find((pattern) => pattern.id === selectedPattern);
	};

	return (
		<div className="space-y-4">
			{/* SKU Input Field - Selalu di atas */}
			<div className="space-y-2">
				<Input.Root
					error={!isValid && currentSKU.trim() ? true : undefined}
					className="space-y-2">
					<Input.Label required>Kode Produk (SKU)</Input.Label>
					<div className="relative">
						<Input.Field
							type="text"
							value={currentSKU}
							onChange={handleManualSKUChange}
							placeholder="Min. 3 karakter"
							required
							disabled={disabled || (autoGenerate && isGenerating)}
							className={autoGenerate ? "bg-gray-50" : ""}
						/>
						{autoGenerate && (
							<div className="absolute right-3 top-1/2 transform -translate-y-1/2">
								<div className="flex items-center space-x-1 text-xs text-gray-500 bg-blue-100 px-2 py-1 rounded">
									<Info className="w-3 h-3" />
									<span>Auto</span>
								</div>
							</div>
						)}
					</div>
					{validationMessage && (
						<div
							className={`flex items-center space-x-2 text-sm ${
								isValid && isUnique ? "text-green-600" : "text-red-600"
							}`}>
							{isValid && isUnique ? (
								<CheckCircle className="w-4 h-4" />
							) : (
								<AlertCircle className="w-4 h-4" />
							)}
							<span>{validationMessage}</span>
						</div>
					)}
				</Input.Root>
			</div>

			{/* Auto SKU Toggle */}
			<div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
				<div className="flex items-center space-x-3">
					<Switch
						checked={autoGenerate}
						onChange={setAutoGenerate}
						disabled={disabled}
						label="Auto SKU"
						description="Otomatis generate kode produk berdasarkan pola yang dipilih"
					/>
				</div>
				{autoGenerate && (
					<button
						onClick={generateSKU}
						disabled={disabled || isGenerating || productName.trim().length < 3}
						className="flex items-center space-x-2 px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed">
						<RefreshCw
							className={`w-4 h-4 ${isGenerating ? "animate-spin" : ""}`}
						/>
						<span>{isGenerating ? "Generating..." : "Refresh"}</span>
					</button>
				)}
			</div>

			{/* Pattern Selection */}
			{autoGenerate && (
				<div className="space-y-3">
					<label className="block text-sm font-medium text-gray-700">
						Pola SKU
					</label>
					<div className="grid grid-cols-2 gap-3">
						{SKU_PATTERNS.map((pattern) => (
							<div
								key={pattern.id}
								className={`p-3 border rounded-lg cursor-pointer transition-all ${
									selectedPattern === pattern.id
										? "border-blue-500 bg-blue-50"
										: "border-gray-200 hover:border-gray-300"
								}`}
								onClick={() =>
									setSelectedPattern(pattern.id as SKUOptions["pattern"])
								}>
								<div className="font-medium text-sm">{pattern.name}</div>
								<div className="text-xs text-gray-600 mt-1">
									{pattern.description}
								</div>
								<div className="text-xs text-blue-600 mt-1 font-mono">
									{pattern.example}
								</div>
							</div>
						))}
					</div>
				</div>
			)}

			{/* Advanced Options for Custom Pattern */}
			{autoGenerate && selectedPattern === "custom" && (
				<div className="space-y-3">
					<button
						onClick={() => setShowAdvanced(!showAdvanced)}
						className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800">
						<Settings className="w-4 h-4" />
						<span>Pengaturan Lanjutan</span>
					</button>

					{showAdvanced && (
						<div className="grid grid-cols-2 gap-3 p-4 bg-gray-50 rounded-lg">
							<div>
								<Input.Root>
									<Input.Label>Prefix</Input.Label>
									<Input.Field
										type="text"
										value={customPrefix}
										onChange={setCustomPrefix}
										placeholder="PROD"
										disabled={disabled}
									/>
								</Input.Root>
							</div>
							<div>
								<Input.Root>
									<Input.Label>Suffix</Input.Label>
									<Input.Field
										type="text"
										value={customSuffix}
										onChange={setCustomSuffix}
										placeholder="2024"
										disabled={disabled}
									/>
								</Input.Root>
							</div>
						</div>
					)}
				</div>
			)}

			{/* Pattern Info */}
			{autoGenerate && getSelectedPatternInfo() && (
				<div className="p-3 bg-blue-50 rounded-lg">
					<div className="flex items-start space-x-2">
						<Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
						<div className="text-sm">
							<div className="font-medium text-blue-800">
								{getSelectedPatternInfo()?.name}
							</div>
							<div className="text-blue-600 mt-1">
								{getSelectedPatternInfo()?.description}
							</div>
							<div className="text-blue-500 font-mono text-xs mt-1">
								Contoh: {getSelectedPatternInfo()?.example}
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
