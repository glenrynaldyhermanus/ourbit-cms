import { ReactNode } from "react";

interface DashboardPagePlaceholderProps {
	title: string;
	description?: string;
	icon?: ReactNode;
}

export default function DashboardPagePlaceholder({
	title,
	description,
	icon,
}: DashboardPagePlaceholderProps) {
	return (
		<div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
			{icon && <div className="mb-4 p-4 bg-gray-100 rounded-full">{icon}</div>}
			<h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
			{description && (
				<p className="text-gray-600 mb-8 max-w-md">{description}</p>
			)}
			<div className="bg-white rounded-lg shadow p-8 max-w-md w-full">
				<div className="text-center">
					<div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
						<span className="text-orange-600 text-2xl font-bold">🚧</span>
					</div>
					<h3 className="text-lg font-semibold text-gray-900 mb-2">
						Coming Soon
					</h3>
					<p className="text-gray-600 text-sm">
						This feature is currently under development. Please check back
						later.
					</p>
				</div>
			</div>
		</div>
	);
}
