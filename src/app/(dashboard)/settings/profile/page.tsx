import PagePlaceholder from "@/components/admin/PagePlaceholder";
import { User } from "lucide-react";

export default function ProfileSettingsPage() {
	return (
		<PagePlaceholder
			title="Profile"
			description="Kelola profil dan informasi akun Anda di sini"
			icon={<User className="w-8 h-8 text-gray-600" />}
		/>
	);
}
