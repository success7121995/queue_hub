"use client"

import { useForm, useFieldArray, Controller } from "react-hook-form";
import { useRef, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Tag, ImageUploader } from "@/components";
import { type Branch } from "@/types/merchant";
import { Trash2, MapPin, User, Tag as TagIcon, Image, Info, Clock, Star } from "lucide-react";
import TimePicker from "@/components/common/time-picker";

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
	onSave?: (updatedBranch: Branch) => void;
}

const BranchDetail = ({ branch, onClose, onSave }: BranchDetailProps) => {
	const [desc, setDesc] = useState(branch.description || "");
	const [editModal, setEditModal] = useState<string | null>(null);
	const [newTag, setNewTag] = useState("");
	const [newFeature, setNewFeature] = useState("");

	const defaultOpeningHours = [
		{ dayOfWeek: 'Monday', openTime: '09:00', closeTime: '18:00', closed: true },
		{ dayOfWeek: 'Tuesday', openTime: '09:00', closeTime: '18:00', closed: true },
		{ dayOfWeek: 'Wednesday', openTime: '09:00', closeTime: '18:00', closed: true },
		{ dayOfWeek: 'Thursday', openTime: '09:00', closeTime: '18:00', closed: true },
		{ dayOfWeek: 'Friday', openTime: '09:00', closeTime: '18:00', closed: true },
		{ dayOfWeek: 'Saturday', openTime: '09:00', closeTime: '18:00', closed: true },
		{ dayOfWeek: 'Sunday', openTime: '09:00', closeTime: '18:00', closed: true },
		{ dayOfWeek: 'Public Holiday', openTime: '09:00', closeTime: '18:00', closed: true },
	];

	const [openingHours, setOpeningHours] = useState(() => {
		// Map branch.BranchOpeningHour to days of week if available, else use defaults
		const branchHours = branch.BranchOpeningHour || [];
		return defaultOpeningHours.map((defaultHour, idx) => {
			const found = branchHours.find(
				h => Number(h.day_of_week) === idx + 1 // assuming 1=Monday, 7=Sunday
			);
			return found
				? {
						id: found.id,
						dayOfWeek: defaultHour.dayOfWeek,
						openTime: found.open_time || defaultHour.openTime,
						closeTime: found.close_time || defaultHour.closeTime,
						closed: found.is_closed,
					}
				: { ...defaultHour, id: undefined };
		});
	});

	// Helper for days of week
	const daysOfWeek = [
		"Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Public Holiday"
	];

	// Handlers for tags and features
	const handleAddTag = () => {
		const trimmed = newTag.trim();
		if (!trimmed) return;
		// Optimistically add tag (replace with mutation logic as needed)
		setNewTag("");
		// ...add to state or call mutation
	};
	const handleAddFeature = () => {
		const trimmed = newFeature.trim();
		if (!trimmed) return;
		// Optimistically add feature (replace with mutation logic as needed)
		setNewFeature("");
		// ...add to state or call mutation
	};

	// Handler for opening hours
	const handleOpeningHourChange = (idx: number, field: string, value: any) => {
		setOpeningHours(prev => prev.map((item, i) =>
			i === idx ? { ...item, [field]: value } : item
		));
	};

	return (
		<div className="w-full max-w-7x1 mx-auto font-regular-eng">
			<button type="button" className="mb-4 flex items-center gap-2 text-gray-600 hover:text-primary-light font-semibold cursor-pointer" onClick={onClose}>
				<span className="text-xl">←</span>
				<span>Back</span>
			</button>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
				{/* Left Column */}
				<div className="w-full flex flex-col gap-8">
					{/* Branch Info Card */}
					<div className="bg-white rounded-2xl shadow-md p-6 flex flex-col gap-4">
						
						<h2 className="text-2xl font-bold text-primary-light">Branch Info</h2>

						{/* Branch Name */}
						<div className="flex items-center gap-2 mb-2">
							<div className="font-bold text-xl mb-1">{branch.branch_name}</div>
							<button className="ml-2 px-3 py-1 border rounded text-xs">Edit</button>
						</div>

						{/* Address */}
						<div className="mb-2">
							<div className="font-semibold text-primary-light mb-1">Address</div>
							<div className="flex items-center gap-2">
								<span>{branch.Address?.street || ''}{branch.Address?.city ? `, ${branch.Address.city}` : ''}{branch.Address?.state ? `, ${branch.Address.state}` : ''}{branch.Address?.country ? `, ${branch.Address.country}` : ''}</span>
								<button className="ml-3 px-3 py-1 border border-primary-light text-primary-light rounded text-sm hover:bg-primary-light hover:text-white transition-all duration-200" onClick={() => setEditModal('address')}>Edit</button>
							</div>
						</div>

						{/* Logo */}
						<div className="mb-2">
							<div className="font-semibold text-primary-light mb-1">Logo</div>
							<div className="flex gap-2 items-center">
								<ImageUploader frameWidth={140} frameHeight={140} fontSize={12} className="inline-block" multiple={false} />
								<button className="ml-2 px-3 py-1 border rounded text-xs" onClick={() => setEditModal('logo')}>Edit</button>
							</div>
						</div>

						{/* Tags */}
						<div className="mb-2">
							<div className="font-semibold text-primary-light mb-1">Tags</div>
							<div className="flex items-center gap-2 mb-2">
								<input
									className="text-sm w-full border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
									placeholder="Add a new tag"
									value={newTag}
									onChange={e => setNewTag(e.target.value)}
								/>
								<button
									disabled={!newTag.trim()}
									onClick={handleAddTag}
									className={`ml-3 px-3 py-1 border rounded text-sm transition-all duration-200 ${!newTag.trim() ? 'bg-gray-300 text-gray-500 cursor-not-allowed border-gray-300' : 'border-primary-light text-primary-light hover:bg-primary-light hover:text-white'}`}
								>
									Add
								</button>
							</div>
							<div className="flex flex-wrap gap-[2px]">
								<Tag tagName="Featured" />
								<Tag tagName="Express" />
							</div>
						</div>

						{/* Features */}
						<div className="mb-2">
							<div className="font-semibold text-primary-light mb-1">Features</div>
							<div className="flex gap-2 mb-2">
								<input
									className="border rounded px-2 py-1 text-xs"
									placeholder="Add New Feature"
									value={newFeature}
									onChange={e => setNewFeature(e.target.value)}
								/>
								<button
									disabled={!newFeature.trim()}
									onClick={handleAddFeature}
									className={`ml-2 px-3 py-1 border rounded text-xs transition-all duration-200 ${!newFeature.trim() ? 'bg-gray-300 text-gray-500 cursor-not-allowed border-gray-300' : 'border-primary-light text-primary-light hover:bg-primary-light hover:text-white'}`}
								>
									Add
								</button>
							</div>
							<div className="flex flex-wrap gap-2">
								<Tag tagName="Pet-friendly" />
								<Tag tagName="Non-Smoking Area" />
								<Tag tagName="Wheelchair Accessible" />
								<Tag tagName="Wifi" />
							</div>
						</div>

						{/* Opening Hour */}
						<div className="mb-2">
							<div className="font-semibold text-primary-light mb-1">Opening Hour</div>
							<div className="flex flex-col gap-2">


								{openingHours.map((hour, idx) => (
									<div key={hour.id || idx} className="flex items-center gap-2">
										<span className="w-24">{daysOfWeek[idx]}</span>
										<TimePicker
											className="bg-gray-100"
											disabled={!!hour.closed}
											value={hour.openTime}
											onChange={val => handleOpeningHourChange(idx, 'openTime', val)}
											format="HH:mm"
										/>
										<span>-</span>
										<TimePicker
											className="bg-gray-100"
											disabled={!!hour.closed}
											value={hour.closeTime}
											onChange={val => handleOpeningHourChange(idx, 'closeTime', val)}
											format="HH:mm"
										/>
										<label className="flex items-center gap-1 ml-2">
											<input
												type="checkbox"
												checked={!!hour.closed}
												className="mr-2 h-4 w-4 text-primary-light focus:ring-primary-light border-gray-300 rounded"
												onChange={e => handleOpeningHourChange(idx, 'closed', e.target.checked)}
											/>
											<span className="text-xs">Closed</span>
										</label>
									</div>
								))}


							</div>
						</div>

						{/* Feature Image */}
						<div className="mb-2">
							<div className="font-semibold text-primary-light mb-1">Feature Image</div>
							<div className="flex items-center gap-2">
								<ImageUploader frameWidth={240} frameHeight={Math.round((240 / 16) * 9)} className="mt-2" multiple={false} />
								<button className="ml-2 px-3 py-1 border rounded text-xs" onClick={() => setEditModal('featureImage')}>Edit</button>
							</div>
						</div>

						{/* Description */}
						<div className="mb-2">
							<div className="font-semibold text-primary-light mb-1">Description</div>
							<div>
								<p className={`text-sm mt-2 ${branch.description ? 'line-clamp-3 text-text-main' : 'text-gray-400'}`}>{branch.description || 'No description'}</p>
								<button className="mt-3 px-3 py-1 border border-primary-light text-primary-light rounded text-sm hover:bg-primary-light hover:text-white transition-all duration-200" onClick={() => setEditModal('description')}>Edit</button>
							</div>
						</div>
					</div>
				</div>

				{/* Right Column */}
				<div className="flex flex-col w-full h-full gap-8">
					{/* Contact & Features */}
					<div className="bg-white rounded-2xl shadow-md p-6 flex flex-col gap-4">

						<h2 className="text-2xl font-bold text-primary-light">Contact</h2>

						<div className="mb-2">
							<div className="font-semibold text-primary-light mb-1">Contact</div>
							<div className="flex gap-4 mb-2">
								<div className="flex-1">
									<label className="block font-semibold mb-1 text-primary-light text-base">Contact Person</label>
									<div className="input input-bordered w-full text-base border-b-1 outline-none text-text-main border-gray-200 py-2 rounded-lg">{branch.contact_person?.User?.fname} {branch.contact_person?.User?.lname}</div>
								</div>
								<div className="flex-1">
									<label className="block font-semibold mb-1 text-primary-light text-base">Email</label>
									<div className="flex items-center gap-2">
										<div className="input input-bordered w-full text-base border-b-1 outline-none text-text-main border-gray-200 py-2 rounded-lg">{branch.contact_person?.User?.email || 'N/A'}</div>
										<button className="ml-2 px-3 py-1 border rounded text-xs" onClick={() => setEditModal('contact')}>Edit</button>
									</div>
								</div>
							</div>
							<div className="flex gap-4 mb-2">
								<div className="flex-1">
									<label className="block font-semibold mb-1 text-primary-light text-base">Position</label>
									<div className="input input-bordered w-full text-base border-b-1 outline-none text-text-main border-gray-200 py-2 rounded-lg">{branch.contact_person?.position || 'N/A'}</div>
								</div>
								<div className="flex-1">
									<label className="block font-semibold mb-1 text-primary-light text-base">Tel</label>
									<div className="flex items-center gap-2">
										<div className="input input-bordered w-full text-base border-b-1 outline-none text-text-main border-gray-200 py-2 rounded-lg">{branch.contact_person?.User?.phone || 'N/A'}</div>
										<button className="ml-2 px-3 py-1 border rounded text-xs" onClick={() => setEditModal('contact')}>Edit</button>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Gallery */}
					<div className="bg-white rounded-2xl shadow-md p-6">
						<div className="flex items-center gap-2 mb-4">
							<h2 className="text-lg font-bold text-primary-light">Gallery</h2>
						</div>
 
						{/* Gallery */}
						<div className="grid grid-cols-3 gap-4">
							<ImageUploader frameWidth={240} frameHeight={Math.round((240 / 16) * 9)} className="" multiple={true} />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default BranchDetail;