import React from "react";

interface SwitchProps {
	checked: boolean;
	onChange: (checked: boolean) => void;
	disabled?: boolean;
	label?: string;
	description?: string;
	className?: string;
}

export default function Switch({
	checked,
	onChange,
	disabled = false,
	label,
	description,
	className = "",
}: SwitchProps) {
	return (
		<div className={`space-y-2 ${className}`}>
			<div className="flex items-center justify-between">
				{(label || description) && (
					<div className="flex-1">
						{label && (
							<div className="flex items-center space-x-3">
								<label className="text-sm font-medium text-gray-700">
									{label}
								</label>
								<span
									className={`text-xs font-medium px-2 py-1 rounded-full ${
										checked
											? "bg-green-100 text-green-700"
											: "bg-red-100 text-red-700"
									}`}>
									{checked ? "Aktif" : "Non-aktif"}
								</span>
							</div>
						)}
						{description && (
							<p className="text-xs text-gray-500 mt-1">{description}</p>
						)}
					</div>
				)}
				<div className="relative">
					<button
						type="button"
						onClick={() => !disabled && onChange(!checked)}
						disabled={disabled}
						className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-500 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#FF5701] focus:ring-offset-2 ${
							disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
						}`}
						style={{
							background: checked
								? "linear-gradient(to right, #FF5701, #E04E00)"
								: "#E5E7EB",
							transition: "background 0.5s ease-in-out",
						}}>
						<span
							className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-all duration-500 ease-in-out ${
								checked ? "translate-x-6" : "translate-x-1"
							}`}
						/>
					</button>
				</div>
			</div>
		</div>
	);
}
