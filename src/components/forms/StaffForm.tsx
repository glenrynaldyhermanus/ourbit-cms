"use client";

import React, { useState, useEffect } from "react";
import { X, Search } from "lucide-react";
import { PrimaryButton, OutlineButton, Input, Select } from "@/components/ui";
import { StaffMember, Role, User } from "@/types";
import {
	getRoles,
	searchUsers,
	createStaffAssignment,
	updateStaffAssignment,
} from "@/lib/staff";

interface StaffFormProps {
	staffMember?: StaffMember | null;
	isOpen: boolean;
	onClose: () => void;
	onSaveSuccess: (staffMember: StaffMember | null) => void;
	onError: (message: string) => void;
	businessId: string;
	storeId: string;
}

export default function StaffForm({
	staffMember,
	isOpen,
	onClose,
	onSaveSuccess,
	onError,
	businessId,
	storeId,
}: StaffFormProps) {
	const [formData, setFormData] = useState({
		user_id: staffMember?.id || "",
		role_id: staffMember?.role?.id || "",
		email_search: staffMember?.email || "",
	});
	const [roles, setRoles] = useState<Role[]>([]);
	const [searchResults, setSearchResults] = useState<User[]>([]);
	const [selectedUser, setSelectedUser] = useState<User | null>(
		staffMember || null
	);
	const [isSearching, setIsSearching] = useState(false);
	const [isAnimating, setIsAnimating] = useState(false);
	const [hasError, setHasError] = useState(false);
	const [shouldRender, setShouldRender] = useState(false);
	const [saving, setSaving] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (selectedUser && formData.role_id.trim()) {
			setSaving(true);
			try {
				const assignmentData = {
					user_id: selectedUser.id,
					business_id: businessId,
					role_id: formData.role_id,
					store_id: storeId,
				};

				if (staffMember?.role_assignment_id) {
					// Update existing assignment
					const result = await updateStaffAssignment(
						staffMember.role_assignment_id,
						{ role_id: formData.role_id }
					);

					if (!result) {
						onError("Gagal memperbarui assignment staff!");
						return;
					}
				} else {
					// Create new assignment
					const result = await createStaffAssignment(assignmentData);

					if (!result) {
						onError("Gagal menambah staff!");
						return;
					}
				}

				// Call parent callback for success handling
				onSaveSuccess(staffMember || null);
				// Close form after successful save
				handleSuccessfulSave();
			} catch (error) {
				console.error("Error:", error);
				onError("Gagal menyimpan assignment staff!");
			} finally {
				setSaving(false);
			}
		}
	};

	const handleClose = () => {
		setIsAnimating(false);
		setTimeout(() => {
			onClose();
			setFormData({
				user_id: "",
				role_id: "",
				email_search: "",
			});
			setSelectedUser(null);
			setSearchResults([]);
			setHasError(false);
		}, 300);
	};

	const handleSuccessfulSave = () => {
		setIsAnimating(false);
		setTimeout(() => {
			onClose();
			setFormData({
				user_id: "",
				role_id: "",
				email_search: "",
			});
			setSelectedUser(null);
			setSearchResults([]);
			setHasError(false);
		}, 300);
	};

	const handleInputBlur = () => {
		setHasError(false);
	};

	const handleEmailSearch = async (email: string) => {
		setFormData({ ...formData, email_search: email });

		if (email.length >= 3) {
			setIsSearching(true);
			try {
				const users = await searchUsers(email);
				setSearchResults(users);
			} catch (error) {
				console.error("Error searching users:", error);
			} finally {
				setIsSearching(false);
			}
		} else {
			setSearchResults([]);
		}
	};

	const handleUserSelect = (user: User) => {
		setSelectedUser(user);
		setFormData({ ...formData, user_id: user.id, email_search: user.email });
		setSearchResults([]);
	};

	// Fetch roles on component mount
	useEffect(() => {
		const fetchRoles = async () => {
			try {
				const rolesData = await getRoles();
				setRoles(rolesData);
			} catch (error) {
				console.error("Error fetching roles:", error);
			}
		};

		if (isOpen) {
			fetchRoles();
		}
	}, [isOpen]);

	// Handle form data changes when staffMember prop changes
	useEffect(() => {
		if (staffMember) {
			setFormData({
				user_id: staffMember.id,
				role_id: staffMember.role?.id || "",
				email_search: staffMember.email,
			});
			setSelectedUser(staffMember);
		}
	}, [staffMember]);

	// Handle modal animation
	useEffect(() => {
		if (isOpen) {
			setShouldRender(true);
			setTimeout(() => setIsAnimating(true), 10);
		} else {
			setIsAnimating(false);
			setTimeout(() => setShouldRender(false), 300);
		}
	}, [isOpen]);

	if (!shouldRender) return null;

	return (
		<div className="fixed inset-0 z-[9999]">
			{/* Backdrop */}
			<div
				className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-all duration-300 ease-out ${
					isAnimating ? "opacity-100" : "opacity-0"
				}`}
				onClick={handleClose}
			/>
			{/* Slider Panel */}
			<div
				className={`absolute top-0 right-0 h-full w-[480px] bg-[var(--card)] shadow-2xl z-20 transform transition-all duration-300 ease-out ${
					isAnimating ? "translate-x-0" : "translate-x-full"
				}`}>
				<div className="flex flex-col h-full">
					{/* Header */}
					<div className="flex items-center justify-between pl-8 pr-8 pt-4 pb-4 border-b border-[var(--border)]">
						<div>
							<h2 className="text-2xl font-semibold text-[var(--foreground)] font-['Inter']">
								{staffMember ? "Edit Staff" : "Tambah Staff"}
							</h2>
							<p className="text-[var(--muted-foreground)] text-sm mt-1 font-['Inter']">
								{staffMember
									? "Perbarui assignment staff"
									: "Assign staff ke role untuk toko ini"}
							</p>
						</div>
						<button
							onClick={handleClose}
							disabled={saving}
							className="p-2 hover:bg-[var(--muted)] rounded-lg transition-all duration-200 disabled:opacity-50 group">
							<X className="w-5 h-5 text-[var(--muted-foreground)] group-hover:text-[var(--foreground)]" />
						</button>
					</div>
					{/* Form Content */}
					<div className="flex-1 p-8 overflow-y-auto">
						<form onSubmit={handleSubmit} className="space-y-6">
							{/* User Search/Selection */}
							<div>
								<Input.Root>
									<Input.Label>Email Staff *</Input.Label>
									<div className="relative">
										<Input.Field
											type="email"
											value={formData.email_search}
											onChange={handleEmailSearch}
											onBlur={handleInputBlur}
											placeholder="Cari staff berdasarkan email"
											className={
												hasError && !selectedUser ? "border-red-500" : ""
											}
											disabled={!!staffMember} // Disable for edit
										/>
										<Search className="absolute right-3 top-3 w-4 h-4 text-[var(--muted-foreground)]" />
									</div>
									{hasError && !selectedUser && (
										<Input.Error>Staff wajib dipilih</Input.Error>
									)}
								</Input.Root>

								{/* Search Results */}
								{searchResults.length > 0 && !selectedUser && (
									<div className="mt-2 border border-[var(--border-light)] rounded-lg bg-[var(--card)] shadow-sm max-h-40 overflow-y-auto">
										{searchResults.map((user) => (
											<button
												key={user.id}
												type="button"
												onClick={() => handleUserSelect(user)}
												className="w-full text-left px-4 py-3 hover:bg-[var(--muted)] border-b border-[var(--border)] last:border-b-0">
												<div className="flex flex-col">
													<span className="text-sm font-medium text-[var(--foreground)]">
														{user.name || "No Name"}
													</span>
													<span className="text-xs text-[var(--muted-foreground)]">
														{user.email}
													</span>
												</div>
											</button>
										))}
									</div>
								)}

								{/* Selected User */}
								{selectedUser && (
									<div className="mt-2 p-3 bg-[var(--success-light)] border border-[var(--success-border)] rounded-lg">
										<div className="flex items-center justify-between">
											<div>
												<p className="text-sm font-medium text-[var(--success)]">
													{selectedUser.name || "No Name"}
												</p>
												<p className="text-xs text-[var(--success-dark)]">
													{selectedUser.email}
												</p>
											</div>
											{!staffMember && (
												<button
													type="button"
													onClick={() => {
														setSelectedUser(null);
														setFormData({
															...formData,
															user_id: "",
															email_search: "",
														});
													}}
													className="text-[var(--success)] hover:text-[var(--success-dark)]">
													<X className="w-4 h-4" />
												</button>
											)}
										</div>
									</div>
								)}

								{/* Loading indicator */}
								{isSearching && (
									<div className="mt-2 p-3 text-center text-sm text-[var(--muted-foreground)]">
										Mencari...
									</div>
								)}
							</div>

							{/* Role Selection */}
							<div>
								<Select.Root>
									<Select.Label>Role *</Select.Label>
									<Select.Trigger
										value={
											roles.find((role) => role.id === formData.role_id)
												?.name || ""
										}
										placeholder="Pilih role staff"
										className={
											hasError && !formData.role_id.trim()
												? "border-red-500"
												: ""
										}
									/>
									<Select.Content>
										{roles.map((role) => (
											<Select.Item
												key={role.id}
												value={role.id}
												onClick={() =>
													setFormData({ ...formData, role_id: role.id })
												}
												selected={formData.role_id === role.id}>
												{role.name}
											</Select.Item>
										))}
									</Select.Content>
								</Select.Root>
								{hasError && !formData.role_id.trim() && (
									<Input.Error>Role wajib dipilih</Input.Error>
								)}
							</div>
						</form>
					</div>
					{/* Footer */}
					<div className="pl-8 pr-8 pt-4 pb-4 border-t border-[var(--border)] bg-[var(--muted-light)]/50">
						<div className="flex space-x-4">
							<OutlineButton
								onClick={handleClose}
								disabled={saving}
								className="flex-1">
								Batal
							</OutlineButton>
							<PrimaryButton
								onClick={() =>
									handleSubmit(
										new Event("submit") as unknown as React.FormEvent
									)
								}
								disabled={saving || !selectedUser || !formData.role_id}
								loading={saving}
								className="flex-1">
								{staffMember ? "Update Assignment" : "Simpan"}
							</PrimaryButton>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
