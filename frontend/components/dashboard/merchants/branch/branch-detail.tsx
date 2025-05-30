"use client"

import { useForm, useFieldArray, Controller } from "react-hook-form";
import { useRef, useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Tag, ImageUploader } from "@/components";
import { type Merchant, type MerchantOpeningHour } from "@/types/merchant";
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
	branch: Merchant;
	onClose: () => void;
	onSave: (updatedBranch: Merchant) => void;
}

const defaultOpeningHours: MerchantOpeningHour[] = [
	{ id: 1, dayOfWeek: 1, openTime: "09:00", closeTime: "18:00" },
	{ id: 2, dayOfWeek: 2, openTime: "09:00", closeTime: "18:00" },
	{ id: 3, dayOfWeek: 3, openTime: "09:00", closeTime: "18:00" },
	{ id: 4, dayOfWeek: 4, openTime: "09:00", closeTime: "18:00" },
	{ id: 5, dayOfWeek: 5, openTime: "09:00", closeTime: "18:00" },
	{ id: 6, dayOfWeek: 6, openTime: "09:00", closeTime: "18:00" },
	{ id: 7, dayOfWeek: 7, openTime: "09:00", closeTime: "18:00" },
	{ id: 8, dayOfWeek: 8, openTime: "09:00", closeTime: "18:00" },
];

const BranchDetail = ({ branch, onClose, onSave }: BranchDetailProps) => {
	const processedBranch: BranchFormData = useMemo(() => ({
		...branch,
		name: branch.name || "",
		address: branch.address || "",
		tags: (branch.tags || []).map((t: any) => ({
			id: String(Date.now() + Math.random()),
			tagId: Number(t.tagId || t.id || Date.now()),
			tagName: String(t.tagName || t.value || t.name),
			createdAt: t.createdAt ? new Date(t.createdAt).toISOString() : new Date().toISOString(),
			updatedAt: t.updatedAt ? new Date(t.updatedAt).toISOString() : new Date().toISOString(),
		})),
		features: (branch.features || []).map((f: any) => ({
			id: String(Date.now() + Math.random()),
			featureId: Number(f.featureId || f.id),
			value: String(f.value || f.name),
			createdAt: f.createdAt ? new Date(f.createdAt).toISOString() : new Date().toISOString(),
			updatedAt: f.updatedAt ? new Date(f.updatedAt).toISOString() : new Date().toISOString(),
		})),
		openingHours: (branch.openingHours || defaultOpeningHours).map((o: any, idx: number) => ({
			id: String(Date.now() + Math.random()),
			dayOfWeek: o.dayOfWeek || o.day || idx + 1,
			openTime: o.openTime || o.time?.split(" - ")[0] || "09:00",
			closeTime: o.closeTime || o.time?.split(" - ")[1] || "18:00",
			closed: o.closed || false,
		})),
		galleries: (branch.galleries || []).map((g: any, idx: number) => ({
			id: String(Date.now() + Math.random()),
			imageUrl: g.imageUrl || g.value,
			caption: g.caption,
			createdAt: g.createdAt ? new Date(g.createdAt).toISOString() : new Date().toISOString(),
			updatedAt: g.updatedAt ? new Date(g.updatedAt).toISOString() : new Date().toISOString(),
		})),
		user: {
			email: branch.user?.email || "",
			profile: {
				position: branch.user?.profile?.position || "",
				phone: branch.user?.profile?.phone || "",
				address: branch.user?.profile?.address || "",
			},
		},
		subscription: branch.subscription || "",
		subscriptionStartDate: branch.subscriptionStartDate ? new Date(branch.subscriptionStartDate).toISOString() : undefined,
		subscriptionEndDate: branch.subscriptionEndDate ? new Date(branch.subscriptionEndDate).toISOString() : undefined,
	}), [branch]);

	const {
		register,
		handleSubmit,
		control,
		setValue,
		watch,
		formState: { errors },
	} = useForm<BranchFormData>({
		resolver: zodResolver(branchSchema),
		defaultValues: processedBranch,
	});

	// Tags
	const { fields: tagFields, append: appendTag, remove: removeTag } = useFieldArray({
		control,
		name: "tags",
	});
	const tagInputRef = useRef<HTMLInputElement>(null);

	// Features
	const { fields: featureFields, append: appendFeature, remove: removeFeature } = useFieldArray({
		control,
		name: "features",
	});
	const featureInputRef = useRef<HTMLInputElement>(null);

	// Opening Hours
	const { fields: openingFields, update: updateOpening } = useFieldArray({
		control,
		name: "openingHours",
	});

	// Galleries
	const { fields: galleryFields, append: appendGallery, remove: removeGallery } = useFieldArray({
		control,
		name: "galleries",
	});

	const onSubmit = (data: BranchFormData) => {
		const safeDate = (val: any) => val ? new Date(val) : new Date();
		const safeDateString = (val: any) => val ? new Date(val).toISOString() : undefined;
		const merchantData: Merchant = {
			...data,
			merchantId: branch.merchantId,
			createdAt: branch.createdAt ? safeDate(branch.createdAt) : new Date(),
			updatedAt: new Date(),
			tags: data.tags.map(t => ({
				...t,
				createdAt: safeDate(t.createdAt),
				updatedAt: safeDate(t.updatedAt),
			})),
			user: {
				...branch.user,
				email: data.user.email,
				profile: {
					...branch.user?.profile,
					id: branch.user?.profile?.id || 0,
					firstName: branch.user?.profile?.firstName || "",
					lastName: branch.user?.profile?.lastName || "",
					avatarUrl: branch.user?.profile?.avatarUrl || "",
					position: data.user.profile.position,
					phone: data.user.profile.phone,
					address: data.user.profile.address,
					createdAt: branch.user?.profile?.createdAt ? safeDate(branch.user?.profile?.createdAt) : new Date(),
					updatedAt: branch.user?.profile?.updatedAt ? safeDate(branch.user?.profile?.updatedAt) : new Date(),
				},
			},
			features: data.features.map(f => ({
				...f,
				id: Number(f.id),
				createdAt: safeDate(f.createdAt),
				updatedAt: safeDate(f.updatedAt),
			})),
			galleries: data.galleries.map(g => ({
				...g,
				id: Number(g.id),
				createdAt: safeDate(g.createdAt),
				updatedAt: safeDate(g.updatedAt),
			})),
			openingHours: data.openingHours.map(o => ({
				...o,
				id: Number(o.id),
			})),
			subscriptionStartDate: safeDateString(data.subscriptionStartDate),
			subscriptionEndDate: safeDateString(data.subscriptionEndDate),
		};
		onSave(merchantData);
	};

	return (
		<div className="p-8 max-w-7xl mx-auto font-regular-eng">
			<button type="button" className="mb-4 flex items-center gap-2 text-gray-600 hover:text-primary-light font-semibold cursor-pointer" onClick={onClose}>
				<span className="text-xl">←</span>
				<span>Back</span>
			</button>

			<form onSubmit={handleSubmit(onSubmit)}>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
					{/* Left Column */}
					<div className="w-full flex flex-col gap-8">
						{/* Basic Info Card */}
						<div className="bg-white rounded-2xl shadow-md p-6">
							<div className="flex items-center gap-2 mb-4">
								<Info className="text-primary-light" size={20} />
								<h2 className="text-lg font-bold text-primary-light">Basic Info</h2>
							</div>
							{/* Branch Name */}
							<div className="mb-4">
								<label className="block font-semibold mb-1 text-primary-light text-base">Branch Name</label>
								<input 
									className={`input input-bordered w-full text-base border-b-1 outline-none text-text-main border-gray-200 py-2 rounded-lg focus:border-primary-light focus:ring-2 focus:ring-primary-light/20 ${errors.name ? 'border-red-500' : ''}`}
									{...register("name")}
								/>
								{errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
							</div>
							{/* Address */}
							<div className="mb-4">
								<label className="block font-semibold mb-1 text-primary-light text-base">Address</label>
								<div className="flex items-center gap-2">
									<MapPin className="text-primary-light" size={18} />
									<input 
										className={`input input-bordered w-full text-base border-b-1 outline-none text-text-main border-gray-200 py-2 rounded-lg focus:border-primary-light focus:ring-2 focus:ring-primary-light/20 ${errors.address ? 'border-red-500' : ''}`}
										{...register("address")} 
									/>
								</div>
								{errors.address && <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>}
							</div>
							{/* Logo */}
							<div className="mb-8">
								<label className="block font-semibold mb-1 text-primary-light text-base">Logo</label>
								<div className="flex items-center gap-2">
									<Controller
										name="logo"
										control={control}
										render={({ field }) => (
											<ImageUploader
												frameWidth="164px"
												frameHeight="164px"
												className="w-16 h-16"
												removeImage={() => setValue("logo", "")}
												multiple={false}
												onUploadComplete={(files) => {
													field.onChange(files[0]?.preview || "");
												}}
											/>
										)}
									/>
								</div>
							</div>
						</div>

						{/* Tags Card */}
						<div className="bg-white rounded-2xl shadow-md p-6">
							<div className="flex items-center gap-2 mb-4">
								<TagIcon className="text-primary-light" size={20} />
								<h2 className="text-lg font-bold text-primary-light">Tags</h2>
							</div>
							<div className="flex gap-2 mb-2">
								<input ref={tagInputRef} className="input w-full input-bordered input-xs placeholder:text-sm border-b-1 border-gray-200 py-2 outline-none text-text-main rounded-lg" placeholder="Add a new tag" />
								<button 
									type="button" 
									className="btn btn-xs bg-primary-light text-white px-4 rounded-full text-sm font-semibold cursor-pointer ml-2"
									onClick={() => {
										if (tagInputRef.current?.value) {
											appendTag({
												id: String(Date.now() + Math.random()),
												tagId: Date.now(),
												tagName: tagInputRef.current.value,
												createdAt: new Date().toISOString(),
												updatedAt: new Date().toISOString(),
											});
											tagInputRef.current.value = "";
										}
									}}
								>
									Add
								</button>
							</div>
							{/* Tags List */}
							<div className="flex flex-nowrap gap-2 mt-4 overflow-x-auto pb-2">
								{tagFields.map((tag, i) => (
									<Tag 
										key={tag.id} 
										tagName={tag.tagName} 
										removeButton={true} 
										onClick={() => removeTag(i)} 
									/>
								))}
							</div>
						</div>

						{/* Feature Image Card */}
						<div className="bg-white rounded-2xl shadow-md p-6">
							<div className="flex items-center gap-2 mb-4">
								<Image className="text-primary-light" size={20} />
								<h2 className="text-lg font-bold text-primary-light">Feature Image</h2>
							</div>
							<Controller
								name="featureImage"
								control={control}
								render={({ field }) => (
									<ImageUploader
										frameWidth="224px"
										frameHeight="128px"
										multiple={false}
										onUploadComplete={(files) => {
											field.onChange(files[0]?.preview || "");
										}}
									/>
								)}
							/>
						</div>

						{/* Description Card */}
						<div className="bg-white rounded-2xl shadow-md p-6">
							<div className="flex items-center gap-2 mb-4">
								<Info className="text-primary-light" size={20} />
								<h2 className="text-lg font-bold text-primary-light">Description</h2>
							</div>
							<textarea 
								className="input input-bordered w-full border-1 border-gray-200 p-2 outline-none text-text-main rounded-lg min-h-[100px]" 
								rows={5} 
								{...register("description")}
							/>
						</div>
					</div>

					{/* Right Column */}
					<div className="flex flex-col w-full h-full gap-8">
						{/* Contact Card */}
						<div className="bg-white rounded-2xl shadow-md p-6">
							<div className="flex items-center gap-2 mb-4">
								<User className="text-primary-light" size={20} />
								<h2 className="text-lg font-bold text-primary-light">Contact Person</h2>
							</div>
							<input 
								className={`input input-bordered w-full text-base border-b-1 outline-none text-text-main border-gray-200 py-2 rounded-lg focus:border-primary-light focus:ring-2 focus:ring-primary-light/20 ${errors.user?.profile?.position ? 'border-red-500' : ''}`}
								{...register("user.profile.position")}
							/>
							<label className="block font-semibold mb-1 text-primary-light text-base mt-4">Phone</label>
							<input 
								className={`input input-bordered w-full text-base border-b-1 outline-none text-text-main border-gray-200 py-2 rounded-lg focus:border-primary-light focus:ring-2 focus:ring-primary-light/20 ${errors.user?.profile?.phone ? 'border-red-500' : ''}`}
								{...register("user.profile.phone")}
							/>
							<label className="block font-semibold mb-1 text-primary-light text-base mt-4">Email</label>
							<input 
								className={`input input-bordered w-full text-base border-b-1 outline-none text-text-main border-gray-200 py-2 rounded-lg focus:border-primary-light focus:ring-2 focus:ring-primary-light/20 ${errors.user?.email ? 'border-red-500' : ''}`}
								{...register("user.email")}
							/>
							{errors.user?.email && (
								<p className="text-red-500 text-sm mt-1">{errors.user.email.message}</p>
							)}
						</div>

						{/* Subscription Card */}
						<div className="bg-white rounded-2xl shadow-md p-6">
							<div className="flex items-center gap-2 mb-4">
								<Star className="text-primary-light" size={20} />
								<h2 className="text-lg font-bold text-primary-light">Subscription</h2>
							</div>
							<input 
								className="input input-bordered w-full mb-2 rounded-lg" 
								{...register("subscription")}
								readOnly 
								disabled 
							/>
							<div className="flex gap-2 justify-between items-center">
								<input 
									className="input input-bordered w-full mb-2 rounded-lg" 
									{...register("subscriptionStartDate")}
									readOnly 
									disabled 
									placeholder="Start Date" 
								/>
								<span className="self-center">-</span>
								<input 
									className="input input-bordered w-full mb-2 rounded-lg" 
									{...register("subscriptionEndDate")}
									readOnly 
									disabled 
									placeholder="End Date" 
								/>
							</div>
						</div>

						{/* Opening Hours Card */}
						<div className="bg-white rounded-2xl shadow-md p-6">
							<div className="flex items-center gap-2 mb-4">
								<Clock className="text-primary-light" size={20} />
								<h2 className="text-lg font-bold text-primary-light">Opening Hours</h2>
							</div>
							<div className="space-y-2">
								{openingFields.map((field, i) => (
									<div key={field.id} className="flex items-center gap-2 pb-1">
										<span className="w-28 inline-block text-base font-medium text-text-main">
											{["Mon","Tue","Wed","Thu","Fri","Sat","Sun","Public Holiday"][field.dayOfWeek-1]}
										</span>
										<Controller
											name={`openingHours.${i}.openTime`}
											control={control}
											render={({ field }) => (
												<TimePicker
													className="!border-none !outline-none focus:!outline-none focus:!border-none shadow-none bg-transparent"
													disableClock
													clearIcon={null}
													format="HH:mm"
													{...field}
													disabled={watch(`openingHours.${i}.closed`)}
												/>
											)}
										/>
										<span>-</span>
										<Controller
											name={`openingHours.${i}.closeTime`}
											control={control}
											render={({ field }) => (
												<TimePicker
													className="!border-none !outline-none focus:!outline-none focus:!border-none shadow-none bg-transparent"
													disableClock
													clearIcon={null}
													format="HH:mm"
													{...field}
													disabled={watch(`openingHours.${i}.closed`)}
												/>
											)}
										/>
										<Controller
											name={`openingHours.${i}.closed`}
											control={control}
											render={({ field: { value, onChange, ...field } }) => (
												<label className="flex items-center gap-1 text-xs">
													<input
														type="checkbox"
														checked={value}
														onChange={e => {
															onChange(e.target.checked);
															updateOpening(i, {
																id: openingFields[i].id,
																dayOfWeek: openingFields[i].dayOfWeek,
																openTime: e.target.checked ? "Closed" : "09:00",
																closeTime: e.target.checked ? "Closed" : "18:00",
																closed: e.target.checked,
															});
														}}
														{...field}
													/>
													Closed
												</label>
											)}
										/>
									</div>
								))}
							</div>
						</div>

						{/* Features Card */}
						<div className="bg-white rounded-2xl shadow-md p-6">
							<div className="flex items-center gap-2 mb-4">
								<Star className="text-primary-light" size={20} />
								<h2 className="text-lg font-bold text-primary-light">Features</h2>
							</div>
							<div className="flex gap-2 mb-2">
								<input ref={featureInputRef} className="input input-bordered input-xs py-2 border-b-1 border-gray-200 outline-none text-text-main w-full rounded-lg" placeholder="Add New Feature" />
								<button 
									type="button" 
									className="btn btn-xs bg-primary-light text-white px-4 rounded-full text-sm font-semibold cursor-pointer ml-2"
									onClick={() => {
										if (featureInputRef.current?.value) {
											appendFeature({
												id: String(Date.now() + Math.random()),
												featureId: Date.now(),
												value: featureInputRef.current.value,
												createdAt: new Date().toISOString(),
												updatedAt: new Date().toISOString(),
											});
											featureInputRef.current.value = "";
										}
									}}
								>
									Add
								</button>
							</div>
							<div className="space-y-1">
								{featureFields.map((feature, i) => (
									<div key={feature.id} className="flex justify-between items-center gap-2 w-full">
										<span className="text-base font-medium text-text-main py-2">{feature.value}</span>
										<button 
											type="button" 
											className="btn btn-xs bg-red-500 text-white px-2 py-2 rounded-full text-sm font-semibold cursor-pointer ml-2"
											onClick={() => removeFeature(i)}
										>
											<Trash2 className="w-4 h-4" />
										</button>
									</div>
								))}
							</div>
						</div>

						{/* Gallery Card */}
						<div className="bg-white rounded-2xl shadow-md p-6">
							<div className="flex items-center gap-2 mb-4">
								<Image className="text-primary-light" size={20} />
								<h2 className="text-lg font-bold text-primary-light">Gallery</h2>
							</div>
							<div className="block w-full mx-auto">
								<Controller
									name="galleries"
									control={control}
									render={({ field }) => (
										<ImageUploader
											multiple={true}
											onUploadComplete={(files) => {
												const newGalleries = files.map(file => ({
													id: String(Date.now() + Math.random()),
													imageUrl: file.preview,
													caption: "",
													createdAt: new Date().toISOString(),
													updatedAt: new Date().toISOString(),
												}));
												field.onChange([...field.value, ...newGalleries]);
											}}
										/>
									)}
								/>
							</div>
						</div>
					</div>
				</div>

				{/* Save/Cancel */}
				<div className="flex gap-4 mt-8 justify-end">
					<button type="submit" className="btn bg-primary-light text-white px-6 py-2 rounded-full text-base font-semibold cursor-pointer shadow-md hover:bg-primary-dark transition-all">Save</button>
					<button type="button" className="btn hover:bg-text-main hover:text-white px-6 py-2 rounded-full text-base font-semibold bg-transparent transition-all duration-300 border-2 border-text-main cursor-pointer" onClick={onClose}>Cancel</button>
				</div>
			</form>
		</div>
	);
};

export default BranchDetail;