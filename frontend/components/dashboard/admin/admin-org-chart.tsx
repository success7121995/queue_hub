"use client";

import { useState } from "react";
import { User, Shield, Headset, Code2 } from "lucide-react";

// Define allowed roles
const ROLES = ["SUPER_ADMIN", "OPS_ADMIN", "SUPPORT_AGENT", "DEVELOPER"] as const;
type AdminRole = typeof ROLES[number];

interface Admin {
id: string;
name: string;
role: AdminRole;
email: string;
phone: string;
avatar: string;
children?: Admin[];
}

const adminData: { SUPER_ADMIN: Admin } = {
SUPER_ADMIN: {
id: "super1",
name: "Alex Johnson",
role: "SUPER_ADMIN",
email: "alex.johnson@queuehub.com",
phone: "555-1000",
avatar: "https://randomuser.me/api/portraits/men/32.jpg",
	children: [
		{
		id: "op1",
		name: "Olivia Parker",
		role: "OPS_ADMIN",
		email: "olivia.parker@queuehub.com",
		phone: "555-2001",
		avatar: "https://randomuser.me/api/portraits/women/44.jpg",
		},
		{
		id: "sup1",
		name: "Sam Lee",
		role: "SUPPORT_AGENT",
		email: "sam.lee@queuehub.com",
		phone: "555-3002",
		avatar: "https://randomuser.me/api/portraits/men/65.jpg",
		},
		{
		id: "dev1",
		name: "Jamie Chen",
		role: "DEVELOPER",
		email: "jamie.chen@queuehub.com",
		phone: "555-4003",
		avatar: "https://randomuser.me/api/portraits/women/68.jpg",
		},
	],
	},
};

const roleColors: Record<AdminRole, string> = {
	SUPER_ADMIN: "bg-primary-light text-white border-primary-light",
	OPS_ADMIN: "bg-gradient-to-r from-orange-400 to-orange-500 text-white border-orange-400",
	SUPPORT_AGENT: "bg-gradient-to-r from-green-400 to-green-500 text-white border-green-400",
	DEVELOPER: "bg-gradient-to-r from-yellow-300 to-yellow-500 text-white border-yellow-400",
};

const roleIcons: Record<AdminRole, JSX.Element> = {
	SUPER_ADMIN: <Shield className="w-6 h-6" />,
	OPS_ADMIN: <User className="w-6 h-6" />,
	SUPPORT_AGENT: <Headset className="w-6 h-6" />,
	DEVELOPER: <Code2 className="w-6 h-6" />,
};

const AdminCard = ({ admin, onClick }: { admin: Admin; onClick: () => void }) => {
	return (
	<div
		className={`flex flex-col items-center rounded-xl shadow-lg p-6 cursor-pointer border-2 transition-all duration-200 ${roleColors[admin.role]} hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-primary-light`}
		onClick={onClick}
		tabIndex={0}
		style={{ minWidth: 200 }}
	>
		<div className="w-20 h-20 rounded-full border-4 border-white mb-3 overflow-hidden bg-white">
		<img
			src={admin.avatar}
			alt={admin.name}
			className="w-full h-full object-cover"
		/>
		</div>
		<div className="flex items-center gap-2 mb-1">
		{roleIcons[admin.role]}
		<span className="font-bold text-lg drop-shadow-sm">{admin.name}</span>
		</div>
		<span className="text-xs font-semibold uppercase tracking-wide mb-1 opacity-90">{admin.role.replace("_", " ")}</span>
		<span className="text-xs opacity-90">{admin.email}</span>
		<span className="text-xs opacity-90">{admin.phone}</span>
	</div>
	);
}

const AdminModal = ({ admin, open, onClose }: { admin: Admin | null; open: boolean; onClose: () => void }) => {
	if (!open || !admin) return null;

	return (
	<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
		<div className="bg-white rounded-2xl shadow-2xl p-10 min-w-[340px] relative border-2 border-primary-light animate-fade-in">
		<button
			className="absolute top-3 right-3 text-gray-400 hover:text-primary-light text-2xl font-bold"
			onClick={onClose}
		>
			×
		</button>
		<div className="flex flex-col items-center">
			<div className="w-24 h-24 rounded-full border-4 border-primary-light mb-3 overflow-hidden bg-white">
			<img
				src={admin.avatar}
				alt={admin.name}
				className="w-full h-full object-cover"
			/>
			</div>
			<div className="flex items-center gap-2 mb-1">
			{roleIcons[admin.role]}
			<span className="font-bold text-xl text-primary-light drop-shadow">{admin.name}</span>
			</div>
			<span className="text-xs font-semibold uppercase tracking-wide mb-1 text-primary-light/80">{admin.role.replace("_", " ")}</span>
			<span className="text-sm mb-1 text-gray-700">{admin.email}</span>
			<span className="text-sm mb-2 text-gray-700">{admin.phone}</span>
			<div className="text-xs text-gray-500 mt-2">More details can go here...</div>
		</div>
		</div>
	</div>
	);
}

const AdminOrgChart = () => {
	const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
	const [modalOpen, setModalOpen] = useState(false);

	const handleCardClick = (admin: Admin) => {
		setSelectedAdmin(admin);
		setModalOpen(true);
	};

	const handleClose = () => {
		setModalOpen(false);
		setSelectedAdmin(null);
	};

	const superAdmin = adminData.SUPER_ADMIN;
	const children = superAdmin.children || [];

	return (
		<div className="flex flex-col items-center py-10">
			{/* SUPER_ADMIN */}
			<AdminCard admin={superAdmin} onClick={() => handleCardClick(superAdmin)} />
			{/* Connector */}
			<div className="h-8 w-1 bg-primary-light" />
			{/* Children */}
			<div className="flex flex-row gap-16 mt-4">
			{children.map((child) => (
				<div key={child.id} className="flex flex-col items-center">
				<AdminCard admin={child} onClick={() => handleCardClick(child)} />
				</div>
			))}
			</div>
			{/* Modal */}
			<AdminModal admin={selectedAdmin} open={modalOpen} onClose={handleClose} />
		</div>
		);
	};

export default AdminOrgChart; 