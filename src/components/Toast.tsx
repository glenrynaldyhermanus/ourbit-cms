"use client";

import {
	useState,
	useEffect,
	createContext,
	useContext,
	ReactNode,
} from "react";
import { CheckCircle, XCircle, AlertCircle, X } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
	id: string;
	type: ToastType;
	title: string;
	message?: string;
	duration?: number;
}

interface ToastContextType {
	showToast: (toast: Omit<Toast, "id">) => void;
	hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
	const context = useContext(ToastContext);
	if (!context) {
		throw new Error("useToast must be used within a ToastProvider");
	}
	return context;
}

interface ToastProviderProps {
	children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
	const [toasts, setToasts] = useState<Toast[]>([]);

	const showToast = (toast: Omit<Toast, "id">) => {
		const id = Math.random().toString(36).substring(2, 9);
		const newToast: Toast = {
			...toast,
			id,
			duration: toast.duration || 5000,
		};

		setToasts((prev) => [...prev, newToast]);

		// Auto remove toast after duration
		if (newToast.duration && newToast.duration > 0) {
			setTimeout(() => {
				hideToast(id);
			}, newToast.duration);
		}
	};

	const hideToast = (id: string) => {
		setToasts((prev) => prev.filter((toast) => toast.id !== id));
	};

	return (
		<ToastContext.Provider value={{ showToast, hideToast }}>
			{children}
			<ToastContainer toasts={toasts} onHide={hideToast} />
		</ToastContext.Provider>
	);
}

interface ToastContainerProps {
	toasts: Toast[];
	onHide: (id: string) => void;
}

function ToastContainer({ toasts, onHide }: ToastContainerProps) {
	if (toasts.length === 0) return null;

	return (
		<div className="fixed top-4 right-4 z-50 space-y-2">
			{toasts.map((toast) => (
				<ToastItem key={toast.id} toast={toast} onHide={onHide} />
			))}
		</div>
	);
}

interface ToastItemProps {
	toast: Toast;
	onHide: (id: string) => void;
}

function ToastItem({ toast, onHide }: ToastItemProps) {
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		setIsVisible(true);
	}, []);

	const handleHide = () => {
		setIsVisible(false);
		setTimeout(() => {
			onHide(toast.id);
		}, 300);
	};

	const getIcon = () => {
		switch (toast.type) {
			case "success":
				return <CheckCircle className="w-5 h-5 text-green-500" />;
			case "error":
				return <XCircle className="w-5 h-5 text-red-500" />;
			case "warning":
				return <AlertCircle className="w-5 h-5 text-yellow-500" />;
			default:
				return <AlertCircle className="w-5 h-5 text-blue-500" />;
		}
	};

	const getBorderColor = () => {
		switch (toast.type) {
			case "success":
				return "border-l-green-500";
			case "error":
				return "border-l-red-500";
			case "warning":
				return "border-l-yellow-500";
			default:
				return "border-l-blue-500";
		}
	};

	return (
		<div
			className={`
        transform transition-all duration-300 ease-in-out
        ${
					isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
				}
        bg-white border-l-4 ${getBorderColor()} rounded-lg shadow-lg p-4 min-w-80 max-w-md
      `}>
			<div className="flex items-start">
				<div className="flex-shrink-0">{getIcon()}</div>
				<div className="ml-3 flex-1">
					<h3 className="text-sm font-medium text-gray-900">{toast.title}</h3>
					{toast.message && (
						<p className="mt-1 text-sm text-gray-600">{toast.message}</p>
					)}
				</div>
				<div className="ml-4 flex-shrink-0">
					<button
						onClick={handleHide}
						className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none">
						<X className="w-5 h-5" />
					</button>
				</div>
			</div>
		</div>
	);
}
