"use client"

import { useForm, useFieldArray, Controller } from "react-hook-form";
import { useRef, useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Tag, ImageUploader } from "@/components";
import { type Branch } from "@/types/merchant";
import TimePicker from 'react-time-picker';
import 'react-time-picker/dist/TimePicker.css';
import 'react-clock/dist/Clock.css';
import { Trash2, MapPin, User, Tag as TagIcon, Image, Info, Clock, Star } from "lucide-react";

// Validation schema
const branchSchema = z.object({
	name: z.string().min(1, "Branch name is required"),
	address: z.string().min(1, "Address is required"),
	logo: z.string().optional(),
	featureImage: z.string().optional(),
	description: z.string().optional(),
	tags: z.array(z.object({
		id: z.string(),
		tagId: z.number(),
		tagName: z.string(),
		createdAt: z.string(),
		updatedAt: z.string(),
	})),
	features: z.array(z.object({
		id: z.string(),
		featureId: z.number(),
		value: z.string(),
		createdAt: z.string(),
		updatedAt: z.string(),
	})),
	openingHours: z.array(z.object({
		id: z.string(),
		dayOfWeek: z.number(),
		openTime: z.string(),
		closeTime: z.string(),
		closed: z.boolean(),
	})),
	galleries: z.array(z.object({
		id: z.string(),
		imageUrl: z.string(),
		caption: z.string().optional(),
		createdAt: z.string(),
		updatedAt: z.string(),
	})),
	user: z.object({
		email: z.string().email("Invalid email address"),
		profile: z.object({
			position: z.string().optional(),
			phone: z.string().optional(),
			address: z.string().optional(),
		}),
	}),
	subscription: z.string().optional(),
	subscriptionStartDate: z.string().optional(),
	subscriptionEndDate: z.string().optional(),
});

type BranchFormData = z.infer<typeof branchSchema>;

interface BranchDetailProps {
	branch: Branch;
	onClose: () => void;
	onSave: (updatedBranch: Branch) => void;
}

const BranchDetail = ({ branch, onClose, onSave }: BranchDetailProps) => {
	return (
		<div className="p-8 max-w-7xl mx-auto font-regular-eng">
			<button type="button" className="mb-4 flex items-center gap-2 text-gray-600 hover:text-primary-light font-semibold cursor-pointer" onClick={onClose}>
				<span className="text-xl">←</span>
				<span>Back</span>
			</button>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
				{/* Left Column */}
				<div className="w-full flex flex-col gap-8">
					{/* Basic Info Card */}
					<div className="bg-white rounded-2xl shadow-md p-6">
						<div className="flex items-center gap-2 mb-4">
							<h2 className="text-lg font-bold text-primary-light">Basic Info</h2>
						</div>
						<div className="mb-4">
							<label className="block font-semibold mb-1 text-primary-light text-base">Branch Name</label>
							<div className="input input-bordered w-full text-base border-b-1 outline-none text-text-main border-gray-200 py-2 rounded-lg">{branch.branch_name || 'N/A'}</div>
						</div>
						<div className="mb-4">
							<label className="block font-semibold mb-1 text-primary-light text-base">Address</label>
							<div className="flex items-center gap-2">
								<div className="input input-bordered w-full text-base border-b-1 outline-none text-text-main border-gray-200 py-2 rounded-lg">
									{branch.Address?.street || ''}{branch.Address?.city ? `, ${branch.Address.city}` : ''}{branch.Address?.state ? `, ${branch.Address.state}` : ''}{branch.Address?.country ? `, ${branch.Address.country}` : ''}
								</div>
							</div>
						</div>
						<div className="mb-4">
							<label className="block font-semibold mb-1 text-primary-light text-base">Contact</label>
							<div className="input input-bordered w-full text-base border-b-1 outline-none text-text-main border-gray-200 py-2 rounded-lg">{branch.email || branch.phone || branch.contact_person_id || 'N/A'}</div>
						</div>
						<div className="mb-4">
							<label className="block font-semibold mb-1 text-primary-light text-base">Active</label>
							<div className="input input-bordered w-full text-base border-b-1 outline-none text-text-main border-gray-200 py-2 rounded-lg">{branch.is_active ? 'Yes' : 'No'}</div>
						</div>
						<div className="mb-4">
							<label className="block font-semibold mb-1 text-primary-light text-base">Created At</label>
							<div className="input input-bordered w-full text-base border-b-1 outline-none text-text-main border-gray-200 py-2 rounded-lg">{branch.created_at || 'N/A'}</div>
						</div>
						<div className="mb-4">
							<label className="block font-semibold mb-1 text-primary-light text-base">Updated At</label>
							<div className="input input-bordered w-full text-base border-b-1 outline-none text-text-main border-gray-200 py-2 rounded-lg">{branch.updated_at || 'N/A'}</div>
						</div>
					</div>
					{/* Description Card */}
					<div className="bg-white rounded-2xl shadow-md p-6">
						<div className="flex items-center gap-2 mb-4">
							<h2 className="text-lg font-bold text-primary-light">Description</h2>
						</div>
						<div className="input input-bordered w-full border-1 border-gray-200 p-2 outline-none text-text-main rounded-lg min-h-[100px]">{branch.description || 'N/A'}</div>
					</div>
				</div>
				
				{/* Right Column */}
				<div className="flex flex-col w-full h-full gap-8">
					{/* Features Card */}
					<div className="bg-white rounded-2xl shadow-md p-6">
						<div className="flex items-center gap-2 mb-4">
							<h2 className="text-lg font-bold text-primary-light">Features</h2>
						</div>
						<ul className="list-disc ml-6">
							{branch.BranchFeature && branch.BranchFeature.length > 0 ? (
								branch.BranchFeature.map((feature) => (
									<li key={feature.feature_id}>{feature.label} ({feature.is_positive ? 'Yes' : 'No'})</li>
								))
							) : (
								<li>No features</li>
							)}
						</ul>
					</div>

					{/* Images Card */}
					<div className="bg-white rounded-2xl shadow-md p-6">
						<div className="flex items-center gap-2 mb-4">
							<h2 className="text-lg font-bold text-primary-light">Images</h2>
						</div>
						<ul className="list-disc ml-6">
							{branch.BranchImage && branch.BranchImage.length > 0 ? (
								branch.BranchImage.map((img) => (
									<li key={img.image_id}>{img.image_url}</li>
								))
							) : (
								<li>No images</li>
							)}
						</ul>
					</div>

					{/* Opening Hours Card */}
					<div className="bg-white rounded-2xl shadow-md p-6">
						<div className="flex items-center gap-2 mb-4">
							<h2 className="text-lg font-bold text-primary-light">Opening Hours</h2>
						</div>
						<ul className="list-disc ml-6">
							{branch.BranchOpeningHour && branch.BranchOpeningHour.length > 0 ? (
								branch.BranchOpeningHour.map((hour) => (
									<li key={hour.id}>{hour.day_of_week}: {hour.open_time} - {hour.close_time} {hour.is_closed ? '(Closed)' : ''}</li>
								))
							) : (
								<li>No opening hours</li>
							)}
						</ul>
					</div>

					{/* UserMerchantOnBranch Card */}
					<div className="bg-white rounded-2xl shadow-md p-6">
						<div className="flex items-center gap-2 mb-4">
							<h2 className="text-lg font-bold text-primary-light">User Merchant On Branch</h2>
						</div>
						<ul className="list-disc ml-6">
							{branch.UserMerchantOnBranch && branch.UserMerchantOnBranch.length > 0 ? (
								branch.UserMerchantOnBranch.map((user) => (
									<li key={user.staff_id}>{user.staff_id} (Assigned: {user.assigned_at})</li>
								))
							) : (
								<li>No users assigned</li>
							)}
						</ul>
					</div>
				</div>
			</div>
		</div>
	);
};

export default BranchDetail;