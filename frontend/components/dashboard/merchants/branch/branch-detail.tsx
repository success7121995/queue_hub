"use client"

import { useState, useCallback, useEffect } from "react";
import { Tag, ImageUploader } from "@/components";
import { type Branch, type BranchImage } from "@/types/merchant";
import { Trash2, MapPin, User, Tag as TagIcon, Info, Clock, Star } from "lucide-react";
import Image from "next/image";
import { TimePicker, ModalForm } from "@/components";
import type { ModalFormField } from "@/components/common/modal-form";
import { useUpdateBranch, useUpdateBranchImages, useUpdateBranchAddress, useUserMerchants, useCreateBranchFeature, useCreateBranchTag, useDeleteBranchTag, useDeleteBranchFeature } from "@/hooks/merchant-hooks";

interface BranchDetailProps {
	branch: Branch;
	onClose: () => void;
}

const BranchDetail = ({ branch, onClose }: BranchDetailProps) => {
	const [editModal, setEditModal] = useState<string | null>(null);
	const [newTag, setNewTag] = useState("");
	const [newFeature, setNewFeature] = useState("");
	const [currentFormData, setCurrentFormData] = useState<Record<string, any>>({});
	const { data: userMerchants } = useUserMerchants(branch.merchant_id);

	// Optimistic state for branch data
	const [optimisticBranch, setOptimisticBranch] = useState({
		branch_name: branch.branch_name,
		description: branch.description || "",
		Address: branch.Address || {
			street: "",
			city: "",
			state: "",
			country: "",
			zip: "",
			unit: "",
			floor: "",
		},
		contact_person: branch.contact_person || {
			staff_id: "",
			user_id: "",
			role: "",
			position: "",
			User: {
				fname: "",
				lname: "",
				email: "",
				phone: "",
			}
		},	
		tags: branch.Tag ? branch.Tag.map((t: any) => t.tag_name) : [],
		features: branch.BranchFeature ? branch.BranchFeature.map((f: any) => f.label) : [],
	});

	// Mutations
	const updateBranchMutation = useUpdateBranch();
	const updateBranchImagesMutation = useUpdateBranchImages();
	const createBranchFeaturesMutation = useCreateBranchFeature();
	const updateBranchAddressMutation = useUpdateBranchAddress();
	const createBranchTagMutation = useCreateBranchTag();
	const deleteBranchTagMutation = useDeleteBranchTag();
	const deleteBranchFeatureMutation = useDeleteBranchFeature();

	// State
	const [galleryImages, setGalleryImages] = useState<BranchImage[]>(branch.BranchImage || []);

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
		return defaultOpeningHours.map((defaultHour: any, idx: number) => {
			const found = branchHours.find(
				(h: any) => Number(h.day_of_week) === idx + 1 // assuming 1=Monday, 7=Sunday
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

	// Days of week
	const daysOfWeek = [
		"Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Public Holiday"
	];

	/**
	 * Handle the add tag
	 */
	const handleAddTag = () => {
		const trimmed = newTag.trim();
		if (!trimmed || optimisticBranch.tags.includes(trimmed)) return;
		setOptimisticBranch(prev => ({ ...prev, tags: [...prev.tags, trimmed] }));
		setNewTag("");
		createBranchTagMutation.mutate({ branch_id: branch.branch_id, data: { tag_name: trimmed } }, {
			onError: () => setOptimisticBranch(prev => ({ ...prev, tags: prev.tags.filter((t: string) => t !== trimmed) })),
		});
	};

	/**
	 * Handle the remove tag
	 */
	const handleRemoveTag = (tag: string) => {
		setOptimisticBranch(prev => ({ ...prev, tags: prev.tags.filter((t: string) => t !== tag) }));
		const tagObj = branch.Tag?.find((t: any) => t.tag_name === tag);
		if (tagObj) {
			deleteBranchTagMutation.mutate({ branch_id: branch.branch_id, tag_id: tagObj.tag_id }, {
				onError: () => setOptimisticBranch(prev => ({ ...prev, tags: [...prev.tags, tag] })),
			});
		}
	};

	/**
	 * Handle the add feature
	 */
	const handleAddFeature = () => {
		const trimmed = newFeature.trim();
		if (!trimmed || optimisticBranch.features.includes(trimmed)) return;
		setOptimisticBranch(prev => ({ ...prev, features: [...prev.features, trimmed] }));
		setNewFeature("");
		createBranchFeaturesMutation.mutate({ branch_id: branch.branch_id, data: { feature_name: trimmed } }, {
			onError: () => setOptimisticBranch(prev => ({ ...prev, features: prev.features.filter((f: string) => f !== trimmed) })),
		});
	};

	/**
	 * Handle the remove feature
	 */
	const handleRemoveFeature = (feature: string) => {
		setOptimisticBranch(prev => ({ ...prev, features: prev.features.filter((f: string) => f !== feature) }));
		const featureObj = branch.BranchFeature?.find((f: any) => f.label === feature);
		if (featureObj) {
			deleteBranchFeatureMutation.mutate({ branch_id: branch.branch_id, feature_id: featureObj.feature_id }, {
				onError: () => setOptimisticBranch(prev => ({ ...prev, features: [...prev.features, feature] })),
			});
		}
	};

	/**
	 * Handle the opening hour change
	 * @param idx - The index of the opening hour
	 * @param field - The field to change
	 * @param value - The value to change to
	 */
	const handleOpeningHourChange = (idx: number, field: string, value: any) => {
		setOpeningHours((prev: any[]) => prev.map((item: any, i: number) =>
			i === idx ? { ...item, [field]: value } : item
		));
	};

	/**
	 * Handle the Gallery upload
	 * @param images - The images to upload
	 */
	const handleGalleryUpload = (images: any[]) => {
		console.log('Gallery images:', images);
	};

	/**
	 * Handle form field changes
	 * @param fieldId - The field ID that changed
	 * @param value - The new value
	 * @param formData - The current form data
	 */
	const handleFormChange = useCallback((fieldId: string, value: any, formData: Record<string, any>) => {
		setCurrentFormData(formData);
		
		// If staff_id changed, update the display fields
		if (fieldId === 'staff_id' && value) {
			const selectedStaff = userMerchants?.user_merchants?.find((staff: any) => staff.staff_id === value);
			
			if (selectedStaff) {
				// Update the form data with the selected staff's information
				const updatedFormData = {
					...formData,
					display_staff_id: selectedStaff.staff_id,
					display_fname: selectedStaff.User?.fname || '',
					display_lname: selectedStaff.User?.lname || '',
					display_email: selectedStaff.User?.email || '',
					display_phone: selectedStaff.User?.phone || '',
					display_position: selectedStaff.position
				};
				
				setCurrentFormData(updatedFormData);
			}
		}
	}, [userMerchants?.user_merchants]);

	/**
	 * Get the modal form fields
	 * @param modalType - The type of modal
	 * @returns The modal form fields
	 */
	const getModalFields = useCallback((modalType: string): ModalFormField[] => {
		switch (modalType) {
			case 'branch_name':
				return [
					{
						id: 'branch_name',
						label: 'Branch Name',
						type: 'text',
						required: true,
						placeholder: 'Enter branch name',
						value: branch.branch_name || ''
					}
				];

			case 'address':
				return [
					{
						id: 'street',
						label: 'Street Address',
						type: 'text',
						required: true,
						placeholder: 'Enter street address',
						value: branch.Address?.street || ''
					},
					{
						id: 'city',
						label: 'City',
						type: 'text',
						required: true,
						placeholder: 'Enter city',
						value: branch.Address?.city || ''
					},
					{
						id: 'state',
						label: 'State/Province',
						type: 'text',
						placeholder: 'Enter state or province',
						value: branch.Address?.state || ''
					},
					{
						id: 'country',
						label: 'Country',
						type: 'text',
						required: true,
						placeholder: 'Enter country',
						value: branch.Address?.country || ''
					},
					{
						id: 'zip',
						label: 'ZIP Code',
						type: 'text',
						required: true,
						placeholder: 'Enter ZIP code',
						value: branch.Address?.zip || ''
					},
					{
						id: 'unit',
						label: 'Unit',
						type: 'text',
						placeholder: 'Enter unit number (optional)',
						value: branch.Address?.unit || ''
					},
					{
						id: 'floor',
						label: 'Floor',
						type: 'text',
						placeholder: 'Enter floor number (optional)',
						value: branch.Address?.floor || ''
					}
				];

			case 'logo':
				return [
					{
						id: 'logo',
						label: 'Branch Logo',
						type: 'image',
						required: true,
						imageConfig: {
							frameWidth: 200,
							frameHeight: 200,
							multiple: false,
							fontSize: 14
						}
					}
				];

			case 'featureImage':
				return [
					{
						id: 'featureImage',
						label: 'Feature Image',
						type: 'image',
						imageConfig: {
							frameWidth: 400,
							frameHeight: 225,
							multiple: false,
							fontSize: 14
						}
					}
				];

			case 'description':
				return [
					{
						id: 'description',
						label: 'Branch Description',
						type: 'textarea',
						placeholder: 'Enter a description for your branch...',
						value: branch.description || ''
					}
				];

			case 'contact':
				// Get all staff members for the select dropdown
				const staffOptions = userMerchants?.user_merchants?.map((staff: any) => ({
					value: staff.staff_id,
					label: `${staff.User?.fname || ''} ${staff.User?.lname || ''}`.trim() || staff.staff_id
				})) || [];

				return [
					{
						id: 'staff_id',
						label: 'Select Staff Member',
						type: 'select',
						required: true,
						placeholder: 'Select a staff member',
						value: branch.contact_person?.staff_id || '',
						options: staffOptions
					},
					{
						id: 'display_staff_id',
						label: 'Staff ID',
						type: 'text',
						readOnly: true,
						value: currentFormData.display_staff_id || branch.contact_person?.staff_id || '',
						placeholder: 'Staff ID will be auto-filled'
					},
					{
						id: 'display_fname',
						label: 'First Name',
						type: 'text',
						readOnly: true,
						value: currentFormData.display_fname || branch.contact_person?.User?.fname || '',
						placeholder: 'First name will be auto-filled'
					},
					{
						id: 'display_lname',
						label: 'Last Name',
						type: 'text',
						readOnly: true,
						value: currentFormData.display_lname || branch.contact_person?.User?.lname || '',
						placeholder: 'Last name will be auto-filled'
					},
					{
						id: 'display_email',
						label: 'Email',
						type: 'email',
						readOnly: true,
						value: currentFormData.display_email || branch.contact_person?.User?.email || '',
						placeholder: 'Email will be auto-filled'
					},
					{
						id: 'display_phone',
						label: 'Phone',
						type: 'tel',
						readOnly: true,
						value: currentFormData.display_phone || branch.contact_person?.User?.phone || '',
						placeholder: 'Phone will be auto-filled'
					},
					{
						id: 'display_position',
						label: 'Position',
						type: 'text',
						readOnly: true,
						value: currentFormData.display_position || branch.contact_person?.position || '',
						placeholder: 'Position will be auto-filled'
					}
				];

			default:
				return [];
		}
	}, [
		branch.branch_name,
		branch.description,
		branch.Address?.street,
		branch.Address?.city,
		branch.Address?.state,
		branch.Address?.country,
		branch.contact_person?.staff_id,
		branch.contact_person?.user_id,
		branch.contact_person?.User?.fname,
		branch.contact_person?.User?.lname,
		branch.contact_person?.User?.email,
		branch.contact_person?.User?.phone,
		branch.contact_person?.position,
		branch.contact_person?.role,
		userMerchants?.user_merchants,
		currentFormData
	]);

	const getModalTitle = useCallback((modalType: string): string => {
		switch (modalType) {
			case 'branch_name': return 'Edit Branch Name';
			case 'address': return 'Edit Branch Address';
			case 'logo': return 'Edit Branch Logo';
			case 'featureImage': return 'Edit Feature Image';
			case 'description': return 'Edit Branch Description';
			case 'contact': return 'Edit Contact Information';
			default: return 'Edit';
		}
	}, []);

	const handleModalSubmit = useCallback((data: any) => {
		console.log('Modal form data:', data);

		// Store previous values for rollback
		const previousValues = { ...optimisticBranch };

		// Update the branch
		switch (editModal) {
			case 'branch_name':
				setOptimisticBranch(prev => ({ ...prev, branch_name: data.branch_name }));
				
				updateBranchMutation.mutate({ branch_id: branch.branch_id, data: { branch_name: data.branch_name }}, {
					onError: (error) => {
						console.error('Failed to update branch name:', error);
						setOptimisticBranch(prev => ({ ...prev, branch_name: previousValues.branch_name }));
					}
				});
				break;
			
			case 'description':
				setOptimisticBranch(prev => ({ ...prev, description: data.description }));
				
				updateBranchMutation.mutate({ branch_id: branch.branch_id, data: { description: data.description }}, {
					onError: (error) => {
						console.error('Failed to update description:', error);
						setOptimisticBranch(prev => ({ ...prev, description: previousValues.description }));
					}
				});
				break;

			case 'address':
				// Construct address object from form fields, preserving existing data
				const addressData = {
					street: data.street,
					city: data.city,
					state: data.state,
					country: data.country,
					zip: data.zip,
					unit: data.unit,
					floor: data.floor
				};

				setOptimisticBranch(prev => ({ ...prev, Address: addressData }));
				
				updateBranchAddressMutation.mutate({ branch_id: branch.branch_id, data: addressData }, {
					onError: (error) => {
						console.error('Failed to update address:', error);
						setOptimisticBranch(prev => ({ ...prev, Address: previousValues.Address }));
					}
				});
				break;

			case 'contact':
				// Find the selected staff member
				const selectedStaff = userMerchants?.user_merchants?.find((staff: any) => staff.staff_id === data.staff_id);
				
				if (!selectedStaff) {
					console.error('Selected staff member not found');
					return;
				}

				// Optimistically update UI
				setOptimisticBranch(prev => ({ ...prev, contact_person: data.staff_id }));
				
				// Use the separate contact person update mutation
				updateBranchMutation.mutate({ branch_id: branch.branch_id, data: data.staff_id }, {
					onError: (error) => {
						console.error('Failed to update contact person:', error);
						setOptimisticBranch(prev => ({ ...prev, contact_person: previousValues.contact_person }));
					}
				});
				break;

			case 'tags':
				setOptimisticBranch(prev => ({ ...prev, tags: data.tags }));
				break;

			case 'features':
				setOptimisticBranch(prev => ({ ...prev, features: data.feature_name }));

				createBranchFeaturesMutation.mutate({ branch_id: branch.branch_id, data: data.feature_name }, {
					onError: (error) => {
						console.error('Failed to update features:', error);
						setOptimisticBranch(prev => ({ ...prev, features: [...prev.features, data.feature_name] }));
					}
				});
				break;
				
		}

		// Close the modal
		setEditModal(null);
	}, [branch.branch_id, updateBranchMutation, optimisticBranch]);

	const handleModalClose = useCallback(() => {
		setEditModal(null);
	}, []);

	// Initialize form data when contact modal opens
	useEffect(() => {
		if (editModal === 'contact') {
			const initialFormData = {
				staff_id: branch.contact_person?.staff_id || '',
				display_staff_id: branch.contact_person?.staff_id || '',
				display_fname: branch.contact_person?.User?.fname || '',
				display_lname: branch.contact_person?.User?.lname || '',
				display_email: branch.contact_person?.User?.email || '',
				display_phone: branch.contact_person?.User?.phone || '',
				display_position: branch.contact_person?.position || ''
			};
			setCurrentFormData(initialFormData);
		}
	}, [editModal, branch.contact_person]);

	return (
		<div className="w-full max-w-7x1 mx-auto font-regular-eng">
			<button type="button" className="mb-4 flex items-center gap-2 text-gray-600 hover:text-primary-light font-semibold cursor-pointer" onClick={onClose}>
				<span className="text-xl">←</span>
				<span>Back</span>
			</button>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
				{/* Left Column */}
				<div className="w-full flex flex-col gap-8">
					{/* Branch Info Card */}
					<div className="bg-white rounded-2xl shadow-md p-6 flex flex-col gap-4">
						
						<h2 className="text-2xl font-bold text-primary-light">Branch Info</h2>

						{/* Branch Name */}
						<div className="flex items-center gap-2 mb-2">
							<div className="font-bold text-xl mb-1">{optimisticBranch.branch_name}</div>
							<button className="ml-3 px-3 py-1 border border-primary-light text-primary-light rounded text-sm hover:bg-primary-light hover:text-white transition-all duration-200" onClick={() => setEditModal('branch_name')}>Edit</button>
						</div>

						{/* Address */}
						<div className="mb-2">
							<div className="font-semibold text-primary-light mb-1">Address</div>
							<div className="flex items-center gap-2">
								<span>{optimisticBranch.Address?.street || ''}{optimisticBranch.Address?.city ? `, ${optimisticBranch.Address.city}` : ''}{optimisticBranch.Address?.state ? `, ${optimisticBranch.Address.state}` : ''}{optimisticBranch.Address?.country ? `, ${optimisticBranch.Address.country}` : ''}</span>
								<button className="ml-3 px-3 py-1 border border-primary-light text-primary-light rounded text-sm hover:bg-primary-light hover:text-white transition-all duration-200" onClick={() => setEditModal('address')}>Edit</button>
							</div>
						</div>

						{/* Logo */}
						<div className="mb-2">
							<div className="font-semibold text-primary-light mb-1">Logo</div>
							<div className="flex gap-2 items-center">
								{branch.BranchImage.find((image: any) => image.image_type === 'LOGO')?.image_url ? (
									<Image src={branch.BranchImage.find((image: any) => image.image_type === 'LOGO')?.image_url || ''} alt="Logo" width={140} height={140} />
								) : (
									<div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
										<span className="text-gray-500">No logo</span>
									</div>
								)}
								<button className="ml-3 px-3 py-1 border border-primary-light text-primary-light rounded text-sm hover:bg-primary-light hover:text-white transition-all duration-200" onClick={() => setEditModal('logo')}>Edit</button>
							</div>
						</div>

						{/* Tags */}
						<div className="mb-2">
							<label className="font-semibold text-primary-light mb-1">Tags</label>
							<div className="flex items-center gap-2 mb-3 mt-2">
								<input
									className="text-sm w-48 border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
									placeholder="Add a new tag"
									value={newTag}
									onChange={e => setNewTag(e.target.value)}
								/>
								<button
									disabled={!newTag.trim() || optimisticBranch.tags.includes(newTag.trim())}
									onClick={handleAddTag}
									className={`ml-3 px-3 py-1 border rounded text-sm transition-all duration-200 ${!newTag.trim() || optimisticBranch.tags.includes(newTag.trim()) ? 'text-gray-300 cursor-not-allowed border-gray-300' : 'border-primary-light text-primary-light hover:bg-primary-light hover:text-white'}`}
								>
									Add
								</button>
							</div>
							<div className="flex flex-wrap gap-[2px]">
								{optimisticBranch.tags.map((tag: string) => (
									<Tag
										key={tag}
										tagName={tag}
										removeButton={true}
										onRemove={() => handleRemoveTag(tag)}
									/>
								))}
							</div>
						</div>

						{/* Features */}
						<div className="mb-2">
							<label className="font-semibold text-primary-light mb-1">Features</label>
							<div className="flex gap-2 mb-3 mt-2">
								<input
									className="border rounded px-2 py-1 text-sm"
									placeholder="Add New Feature"
									value={newFeature}
									onChange={e => setNewFeature(e.target.value)}
								/>
								<button
									disabled={!newFeature.trim() || optimisticBranch.features.includes(newFeature.trim())}
									onClick={handleAddFeature}
									className={`ml-2 px-3 py-1 border rounded text-sm transition-all duration-200 ${!newFeature.trim() || optimisticBranch.features.includes(newFeature.trim()) ? 'text-gray-300 cursor-not-allowed border-gray-300' : 'border-primary-light text-primary-light hover:bg-primary-light hover:text-white'}`}
								>
									Add
								</button>
							</div>
							<div className="flex flex-wrap gap-2">
								{optimisticBranch.features.map((feature: string) => (
									<Tag
										key={feature}
										tagName={feature}
										removeButton={true}
										onRemove={() => handleRemoveFeature(feature)}
									/>
								))}
							</div>
						</div>

						{/* Opening Hour */}
						<div className="mb-2">
							<label className="font-semibold text-primary-light mb-1">Opening Hour</label>
							<div className="flex flex-col gap-2 mt-2">


								{openingHours.map((hour: any, idx: number) => (
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
							<label className="font-semibold text-primary-light mb-1">Feature Image</label>
							<div className="flex items-center gap-2 mt-2">

								{branch.BranchImage.find((image: any) => image.image_type === 'FEATURE')?.image_url ? (
									<Image src={branch.BranchImage.find((image: any) => image.image_type === 'FEATURE')?.image_url || ''} alt="Feature Image" width={240} height={Math.round((240 / 16) * 9)} />
								) : (
									<div className="w-56 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
										<span className="text-gray-500">No feature image</span>
									</div>
								)}
								<button className="ml-3 px-3 py-1 border border-primary-light text-primary-light rounded text-sm hover:bg-primary-light hover:text-white transition-all duration-200" onClick={() => setEditModal('featureImage')}>Edit</button>
							</div>
						</div>

						{/* Description */}
						<div className="mb-2">
							<label className="font-semibold text-primary-light mb-1">Description</label>
							<div>
								<p className={`text-sm mt-2 ${optimisticBranch.description ? 'line-clamp-3 text-text-main' : 'text-gray-400'}`}>{optimisticBranch.description || 'No description'}</p>
								<button className="mt-3 px-3 py-1 border border-primary-light text-primary-light rounded text-sm hover:bg-primary-light hover:text-white transition-all duration-200" onClick={() => setEditModal('description')}>Edit</button>
							</div>
						</div>
					</div>
				</div>

				{/* Right Column */}
				<div className="flex flex-col w-full h-full gap-8">
					{/* Contact & Features */}
					<div className="bg-white rounded-2xl shadow-md p-6 flex flex-col gap-4">

						<div className="flex items-center gap-2">
							<h2 className="text-2xl font-bold text-primary-light">Contact</h2>
							<button className="ml-3 px-3 py-1 border border-primary-light text-primary-light rounded text-sm hover:bg-primary-light hover:text-white transition-all duration-200" onClick={() => setEditModal('contact')}>Edit</button>
						</div>

						<div className="mb-2">
							<div className="flex gap-4 mb-2">
								<div className="flex-1">
									<label className="block font-semibold mb-1 text-primary-light text-base">Contact Person</label>
									<div className="input input-bordered w-full text-base border-b-1 outline-none text-text-main border-gray-200 py-2 rounded-lg">
										{optimisticBranch.contact_person?.User?.fname} {optimisticBranch.contact_person?.User?.lname}
									</div>
								</div>
								<div className="flex-1">
									<label className="block font-semibold mb-1 text-primary-light text-base">Email</label>
									<div className="flex items-center gap-2">
										<div className="input input-bordered w-full text-base border-b-1 outline-none text-text-main border-gray-200 py-2 rounded-lg">
											{optimisticBranch.contact_person?.User?.email || 'N/A'}
										</div>
									</div>
								</div>
							</div>
							<div className="flex gap-4 mb-2">
								<div className="flex-1">
									<label className="block font-semibold mb-1 text-primary-light text-base">Position</label>
									<div className="input input-bordered w-full text-base border-b-1 outline-none text-text-main border-gray-200 py-2 rounded-lg">
										{optimisticBranch.contact_person?.position || 'N/A'}
									</div>
								</div>
								<div className="flex-1">
									<label className="block font-semibold mb-1 text-primary-light text-base">Tel</label>
									<div className="flex items-center gap-2">
										<div className="input input-bordered w-full text-base border-b-1 outline-none text-text-main border-gray-200 py-2 rounded-lg">
											{optimisticBranch.contact_person?.User?.phone || 'N/A'}
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Gallery */}
					<div className="bg-white rounded-2xl shadow-md p-6">
						<div className="flex items-center gap-2 mb-4">
							<label className="text-lg font-bold text-primary-light">Gallery</label>
						</div>
 
						{/* Gallery */}
						<ImageUploader frameWidth={240} frameHeight={Math.round((240 / 16) * 9)} className="" multiple={true} onUploadComplete={handleGalleryUpload} />
					</div>
				</div>
			</div>

			{/* Modal Form */}
			<ModalForm
				isOpen={!!editModal}
				onClose={handleModalClose}
				title={editModal ? getModalTitle(editModal) : ''}
				fields={editModal ? getModalFields(editModal) : []}
				onSubmit={handleModalSubmit}
				onChange={handleFormChange}
				initialData={editModal === 'contact' ? currentFormData : {}}
				submitText="Save Changes"
				cancelText="Cancel"
			/>
		</div>
	);
};

export default BranchDetail;