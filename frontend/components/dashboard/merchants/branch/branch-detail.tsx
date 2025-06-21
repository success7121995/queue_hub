"use client"

import { useState, useCallback, useEffect } from "react";
import { Tag, ImageUploader, ImagePreviewModal } from "@/components";
import { type Branch, type BranchImage } from "@/types/merchant";
import { Trash2, MapPin, User, Tag as TagIcon, Info, Clock, Star } from "lucide-react";
import Image from "next/image";
import { TimePicker, ModalForm } from "@/components";
import type { ModalFormField } from "@/components/common/modal-form";
import { useUpdateBranch, useUpdateBranchAddress, useUserMerchants, useCreateBranchFeature, useCreateBranchTag, useDeleteBranchTag, useDeleteBranchFeature, useUpdateBranchOpeningHours, useUploadBranchImages, useDeleteBranchImage } from "@/hooks/merchant-hooks";
import { useDateTime, dayOfWeekMap } from "@/constant/datetime-provider";
import type { PreviewImage } from "@/components/common/image-uploader";

interface BranchDetailProps {
	branch: Branch;
	onClose: () => void;
	onBack: () => void;
}

const BranchDetail = ({ branch, onClose, onBack }: BranchDetailProps) => {
	const [editModal, setEditModal] = useState<string | null>(null);
	const [newTag, setNewTag] = useState("");
	const [newFeature, setNewFeature] = useState("");
	const [currentFormData, setCurrentFormData] = useState<Record<string, any>>({});
	const [imagePreviewModal, setImagePreviewModal] = useState<{ isOpen: boolean; imageUrl: string; alt: string }>({
		isOpen: false,
		imageUrl: "",
		alt: ""
	});
	const { data: userMerchants } = useUserMerchants(branch.merchant_id);
	const { parseTime, formatToHHmm } = useDateTime();

	const [optimisticLogoUrl, setOptimisticLogoUrl] = useState(branch.BranchImage.find(i => i.image_type === 'LOGO')?.image_url);
	const [logoId, setLogoId] = useState(branch.BranchImage.find(i => i.image_type === 'LOGO')?.image_id);

	const [optimisticFeatureImageUrl, setOptimisticFeatureImageUrl] = useState(branch.BranchImage.find(i => i.image_type === 'FEATURE_IMAGE')?.image_url);
	const [featureImageId, setFeatureImageId] = useState(branch.BranchImage.find(i => i.image_type === 'FEATURE_IMAGE')?.image_id);
	
	const logoUrl = branch.BranchImage.find(i => i.image_type === 'LOGO')?.image_url;
	const featureImageUrl = branch.BranchImage.find(i => i.image_type === 'FEATURE_IMAGE')?.image_url;

	// Optimistic state for branch data
	const [optimisticBranch, setOptimisticBranch] = useState(() => {
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

		const dayOfWeekEnumMap: { [key: string]: string } = {
            MONDAY: 'Monday', TUESDAY: 'Tuesday', WEDNESDAY: 'Wednesday', THURSDAY: 'Thursday', FRIDAY: 'Friday', SATURDAY: 'Saturday', SUNDAY: 'Sunday', PUBLIC_HOLIDAY: 'Public Holiday'
        };

		const branchHoursMap = new Map(
            (branch.BranchOpeningHour || []).map(h => [dayOfWeekEnumMap[h.day_of_week], h])
        );

		const openingHours = defaultOpeningHours.map(defaultHour => {
            const branchHour = branchHoursMap.get(defaultHour.dayOfWeek);
            if (branchHour) {
                return {
                    id: branchHour.id,
                    dayOfWeek: defaultHour.dayOfWeek,
                    openTime: formatToHHmm(branchHour.open_time),
                    closeTime: formatToHHmm(branchHour.close_time),
						closed: branchHour.is_closed,
					};
				}
				return { ...defaultHour, id: undefined };
			});

			return {
				branch_name: branch.branch_name,
				description: branch.description || "",
				Address: branch.Address || {
					street: "", city: "", state: "", country: "", zip: "", unit: "", floor: "",
				},
				email: branch.email || "",
				phone: branch.phone || "",
				contact_person: branch.contact_person || {
					staff_id: "", user_id: "", role: "", position: "", User: { fname: "", lname: "", email: "", phone: "" }
				},	
				tags: branch.Tag ? branch.Tag.map((t: any) => t.tag_name) : [],
				features: branch.BranchFeature ? branch.BranchFeature.map((f: any) => f.label) : [],
				feature_image: branch.BranchImage.find((image: any) => image.image_type === 'FEATURE_IMAGE')?.image_url || "",
				openingHours: openingHours,
			};
		});

		// Mutations
		const updateBranchMutation = useUpdateBranch();
		const uploadBranchImagesMutation = useUploadBranchImages();
		const createBranchFeaturesMutation = useCreateBranchFeature();
		const updateBranchAddressMutation = useUpdateBranchAddress();
		const createBranchTagMutation = useCreateBranchTag();
		const deleteBranchTagMutation = useDeleteBranchTag();
		const deleteBranchFeatureMutation = useDeleteBranchFeature();
		const updateBranchOpeningHoursMutation = useUpdateBranchOpeningHours();
		const deleteBranchImageMutation = useDeleteBranchImage();

		// State
		const [galleryImages, setGalleryImages] = useState<BranchImage[]>(
			(branch.BranchImage || []).filter(img => img.image_type === 'IMAGE')
		);

		const buildImageUrl = (url: string) => {
			if (!url) return '';
			if (url.startsWith('blob:') || url.startsWith('http')) {
				return url;
			}
			return `${process.env.NEXT_PUBLIC_BACKEND_URL}${url}`;
		};

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
		const previousBranch = { ...optimisticBranch };

		const newOpeningHours = optimisticBranch.openingHours.map((hour, i) => {
			if (i === idx) {
				return { ...hour, [field]: value };
			}
			return hour;
		});

		setOptimisticBranch(prev => ({
			...prev,
			openingHours: newOpeningHours,
		}));

		const updatedHour = newOpeningHours[idx];

		const backendData = {
			day_of_week: dayOfWeekMap[idx],
			open_time: parseTime(updatedHour.openTime),
			close_time: parseTime(updatedHour.closeTime),
			is_closed: updatedHour.closed,
		};

		updateBranchOpeningHoursMutation.mutate(
			{ branch_id: branch.branch_id, data: backendData },
			{
				onError: (error) => {
					console.error('Failed to update opening hours:', error);
					setOptimisticBranch(previousBranch);
				}
			}
		);
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
						value: optimisticBranch.branch_name || ''
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
						value: optimisticBranch.Address?.street || ''
					},
					{
						id: 'city',
						label: 'City',
						type: 'text',
						required: true,
						placeholder: 'Enter city',
						value: optimisticBranch.Address?.city || ''
					},
					{
						id: 'state',
						label: 'State/Province',
						type: 'text',
						placeholder: 'Enter state or province',
						value: optimisticBranch.Address?.state || ''
					},
					{
						id: 'country',
						label: 'Country',
						type: 'text',
						required: true,
						placeholder: 'Enter country',
						value: optimisticBranch.Address?.country || ''
					},
					{
						id: 'zip',
						label: 'ZIP Code',
						type: 'text',
						required: true,
						placeholder: 'Enter ZIP code',
						value: optimisticBranch.Address?.zip || ''
					},
					{
						id: 'unit',
						label: 'Unit',
						type: 'text',
						placeholder: 'Enter unit number (optional)',
						value: optimisticBranch.Address?.unit || ''
					},
					{
						id: 'floor',
						label: 'Floor',
						type: 'text',
						placeholder: 'Enter floor number (optional)',
						value: optimisticBranch.Address?.floor || ''
					}
				];

			case 'email':
				return [
					{
						id: 'email',
						label: 'Email',
						type: 'email',
						placeholder: 'Enter email',
						value: optimisticBranch.email || ''
					}
				];

			case 'phone':
				return [
					{
						id: 'phone',
						label: 'Phone',
						type: 'text',
						placeholder: 'Enter phone number',
						value: optimisticBranch.phone || ''
					}
				];

			case 'logo':
				return [];

			case 'featureImage':
				return [];

			case 'description':
				return [
					{
						id: 'description',
						label: 'Branch Description',
						type: 'textarea',
						placeholder: 'Enter a description for your branch...',
						value: optimisticBranch.description || ''
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
						value: optimisticBranch.contact_person?.staff_id || '',
						options: staffOptions
					},
					{
						id: 'display_staff_id',
						label: 'Staff ID',
						type: 'text',
						readOnly: true,
						value: currentFormData.display_staff_id || optimisticBranch.contact_person?.staff_id || '',
						placeholder: 'Staff ID will be auto-filled'
					},
					{
						id: 'display_fname',
						label: 'First Name',
						type: 'text',
						readOnly: true,
						value: currentFormData.display_fname || optimisticBranch.contact_person?.User?.fname || '',
						placeholder: 'First name will be auto-filled'
					},
					{
						id: 'display_lname',
						label: 'Last Name',
						type: 'text',
						readOnly: true,
						value: currentFormData.display_lname || optimisticBranch.contact_person?.User?.lname || '',
						placeholder: 'Last name will be auto-filled'
					},
					{
						id: 'display_email',
						label: 'Email',
						type: 'email',
						readOnly: true,
						value: currentFormData.display_email || optimisticBranch.contact_person?.User?.email || '',
						placeholder: 'Email will be auto-filled'
					},
					{
						id: 'display_phone',
						label: 'Phone',
						type: 'tel',
						readOnly: true,
						value: currentFormData.display_phone || optimisticBranch.contact_person?.User?.phone || '',
						placeholder: 'Phone will be auto-filled'
					},
					{
						id: 'display_position',
						label: 'Position',
						type: 'text',
						readOnly: true,
						value: currentFormData.display_position || optimisticBranch.contact_person?.position || '',
						placeholder: 'Position will be auto-filled'
					}
				];

			default:
				return [];
		}
	}, [
		optimisticBranch,
		userMerchants?.user_merchants,
		currentFormData
	]);

	const getModalTitle = useCallback((modalType: string): string => {
		switch (modalType) {
			case 'branch_name': return 'Edit Branch Name';
			case 'address': return 'Edit Branch Address';
			case 'email': return 'Edit Branch Email';
			case 'phone': return 'Edit Branch Phone';
			case 'logo': return 'Edit Branch Logo';
			case 'featureImage': return 'Edit Feature Image';
			case 'description': return 'Edit Branch Description';
			case 'contact': return 'Edit Contact Information';
			default: return 'Edit';
		}
	}, []);

	const handleModalSubmit = useCallback((data: any) => {

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

			case 'email':
				setOptimisticBranch(prev => ({ ...prev, email: data.email }));

				updateBranchMutation.mutate({ branch_id: branch.branch_id, data: { email: data.email }}, {
					onError: (error) => {
						console.error('Failed to update email:', error);
						setOptimisticBranch(prev => ({ ...prev, email: previousValues.email }));
					}
				});
				break;

			case 'phone':
				setOptimisticBranch(prev => ({ ...prev, phone: data.phone }));

				updateBranchMutation.mutate({ branch_id: branch.branch_id, data: { phone: data.phone }}, {
					onError: (error) => {
						console.error('Failed to update phone:', error);
						setOptimisticBranch(prev => ({ ...prev, phone: previousValues.phone }));
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
				setOptimisticBranch(prev => ({ 
					...prev, 
					contact_person: {
						...selectedStaff,
						User: selectedStaff.User || { fname: "", lname: "", email: "", phone: "" }
					}
				}));
				
				// Use the separate contact person update mutation
				updateBranchMutation.mutate({ branch_id: branch.branch_id, data: { contact_person_id: data.staff_id } }, {
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

			case 'openingHours':
				setOptimisticBranch(prev => ({ ...prev, openingHours: data.openingHours }));

				updateBranchOpeningHoursMutation.mutate({ branch_id: branch.branch_id, data: data.openingHours }, {
					onError: (error) => {
						console.error('Failed to update opening hours:', error);
						setOptimisticBranch(prev => ({ ...prev, openingHours: previousValues.openingHours }));
					}
				});
				break;

		}

		// Close the modal
		setEditModal(null);
	}, [branch.branch_id, updateBranchMutation, optimisticBranch, userMerchants?.user_merchants, deleteBranchImageMutation, uploadBranchImagesMutation]);

	const handleModalClose = useCallback(() => {
		setEditModal(null);
	}, []);

	/**
	 * Handle opening image preview modal
	 * @param imageUrl - The URL of the image to preview
	 * @param alt - The alt text for the image
	 */
	const handleImagePreview = useCallback((imageUrl: string, alt?: string) => {
		setImagePreviewModal({
			isOpen: true,
			imageUrl: buildImageUrl(imageUrl),
			alt: alt || "Image Preview"
		});
	}, []);

	/**
	 * Handle closing image preview modal
	 */
	const handleCloseImagePreview = useCallback(() => {
		setImagePreviewModal({
			isOpen: false,
			imageUrl: "",
			alt: ""
		});
	}, []);

	// Initialize form data when contact modal opens
	useEffect(() => {
		if (editModal === 'contact') {
			const initialFormData = {
				staff_id: optimisticBranch.contact_person?.staff_id || '',
				display_staff_id: optimisticBranch.contact_person?.staff_id || '',
				display_fname: optimisticBranch.contact_person?.User?.fname || '',
				display_lname: optimisticBranch.contact_person?.User?.lname || '',
				display_email: optimisticBranch.contact_person?.User?.email || '',
				display_phone: optimisticBranch.contact_person?.User?.phone || '',
				display_position: optimisticBranch.contact_person?.position || ''
			};
			setCurrentFormData(initialFormData);
		}
	}, [editModal, optimisticBranch.contact_person]);

	const handleLogoUpload = (images: PreviewImage[]) => {
		if (images.length === 0 && logoId) { // Deletion
			const idToDelete = logoId;
			setOptimisticLogoUrl(undefined);
			setLogoId(undefined);
			deleteBranchImageMutation.mutate({ branch_id: branch.branch_id, image_id: idToDelete });
		} else if (images.length > 0 && images[0].file) { // Replacement or New Upload
			const newLogoPreview = images[0].preview;
			setOptimisticLogoUrl(newLogoPreview);
	
			const uploadNew = () => {
				uploadBranchImagesMutation.mutate({ branch_id: branch.branch_id, data: images, image_type: 'logo' }, {
					onSuccess: (res) => {
						const newImage = res.images[0];
						if (newImage) {
							setOptimisticLogoUrl(newImage.image_url);
							setLogoId(newImage.image_id);
						}
					},
					onError: () => {
						setOptimisticLogoUrl(logoUrl); 
					}
				});
			};
	
			if (logoId) { // Replace
				deleteBranchImageMutation.mutate({ branch_id: branch.branch_id, image_id: logoId }, {
					onSuccess: uploadNew
				});
			} else { // New upload
				uploadNew();
			}
		}
	};

	const handleFeatureImageUpload = (images: PreviewImage[]) => {
		if (images.length === 0 && featureImageId) { // Deletion
			const idToDelete = featureImageId;
			setOptimisticFeatureImageUrl(undefined);
			setFeatureImageId(undefined);
			deleteBranchImageMutation.mutate({ branch_id: branch.branch_id, image_id: idToDelete });
		} else if (images.length > 0 && images[0].file) { // Replacement or New Upload
			const newImagePreview = images[0].preview;
			setOptimisticFeatureImageUrl(newImagePreview);
	
			const uploadNew = () => {
				uploadBranchImagesMutation.mutate({ branch_id: branch.branch_id, data: images, image_type: 'feature-image' }, {
					onSuccess: (res) => {
						const newImage = res.images[0];
						if (newImage) {
							setOptimisticFeatureImageUrl(newImage.image_url);
							setFeatureImageId(newImage.image_id);
						}
					},
					onError: () => {
						setOptimisticFeatureImageUrl(featureImageUrl);
					}
				});
			};
	
			if (featureImageId) { // Replace
				deleteBranchImageMutation.mutate({ branch_id: branch.branch_id, image_id: featureImageId }, {
					onSuccess: uploadNew
				});
			} else { // New upload
				uploadNew();
			}
		}
	};

	const handleLogoAdded = (image: PreviewImage): Promise<void> => {
		return new Promise((resolve, reject) => {
			setOptimisticLogoUrl(image.preview);
	
			const uploadNew = () => {
				uploadBranchImagesMutation.mutate({ branch_id: branch.branch_id, data: [image], image_type: 'logo' }, {
					onSuccess: (res) => {
						const newImage = res.images[0];
						if (newImage) {
							setOptimisticLogoUrl(newImage.image_url);
							setLogoId(newImage.image_id);
						}
						resolve();
					},
					onError: (err) => {
						setOptimisticLogoUrl(logoUrl);
						reject(err);
					}
				});
			};
	
			if (logoId) { // Replace
				deleteBranchImageMutation.mutate({ branch_id: branch.branch_id, image_id: logoId }, {
					onSuccess: uploadNew,
					onError: (err) => {
						setOptimisticLogoUrl(logoUrl);
						reject(err);
					}
				});
			} else { // New upload
				uploadNew();
			}
		});
	};

	const handleLogoRemoved = (id: string) => {
		if (logoId) {
			deleteBranchImageMutation.mutate({ branch_id: branch.branch_id, image_id: logoId });
			setOptimisticLogoUrl(undefined);
			setLogoId(undefined);
		}
	};

	const handleFeatureImageAdded = (image: PreviewImage): Promise<void> => {
		return new Promise((resolve, reject) => {
			setOptimisticFeatureImageUrl(image.preview);
	
			const uploadNew = () => {
				uploadBranchImagesMutation.mutate({ branch_id: branch.branch_id, data: [image], image_type: 'feature-image' }, {
					onSuccess: (res) => {
						const newImage = res.images[0];
						if (newImage) {
							setOptimisticFeatureImageUrl(newImage.image_url);
							setFeatureImageId(newImage.image_id);
						}
						resolve();
					},
					onError: (err) => {
						setOptimisticFeatureImageUrl(featureImageUrl);
						reject(err);
					}
				});
			};
	
			if (featureImageId) { // Replace
				deleteBranchImageMutation.mutate({ branch_id: branch.branch_id, image_id: featureImageId }, {
					onSuccess: uploadNew,
					onError: (err) => {
						setOptimisticFeatureImageUrl(featureImageUrl); // revert
						reject(err);
					}
				});
			} else { // New upload
				uploadNew();
			}
		});
	};

	const handleFeatureImageRemoved = (id: string) => {
		if (featureImageId) {
			deleteBranchImageMutation.mutate({ branch_id: branch.branch_id, image_id: featureImageId });
			setOptimisticFeatureImageUrl(undefined);
			setFeatureImageId(undefined);
		}
	};

	const handleGalleryImageAdded = (image: PreviewImage): Promise<void> => {
        return new Promise((resolve, reject) => {
            uploadBranchImagesMutation.mutate({ branch_id: branch.branch_id, data: [image], image_type: 'galleries' }, {
                onSuccess: (result) => {
                    const newImageFromServer = result.images[0];
                    if (newImageFromServer) {
                        setGalleryImages(prev => [...prev.filter(p => p.image_id !== image.id), newImageFromServer]);
                    }
                    resolve();
                },
                onError: (error) => {
                    console.error('Failed to upload gallery image:', error);
                    reject(error);
                }
            });
        });
    };

    const handleGalleryImageRemoved = (id: string) => {
        const imageToDelete = galleryImages.find(img => img.image_id === id);
        if (imageToDelete) {
            deleteBranchImageMutation.mutate({ branch_id: branch.branch_id, image_id: imageToDelete.image_id });
            setGalleryImages(prev => prev.filter(p => p.image_id !== id));
        }
    };

	return (
		<div className="w-full max-w-7x1 mx-auto font-regular-eng">
			<button type="button" className="mb-4 flex items-center gap-2 text-gray-600 hover:text-primary-light font-semibold cursor-pointer" onClick={onBack}>
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
						
						{/* Email */}
						<div className="mb-2">
							<div className="font-semibold text-primary-light mb-1">Email</div>
							<span>{optimisticBranch.email || 'No email'}</span>
							<button className="ml-3 px-3 py-1 border border-primary-light text-primary-light rounded text-sm hover:bg-primary-light hover:text-white transition-all duration-200" onClick={() => setEditModal('email')}>Edit</button>
						</div>
						
						{/* Phone */}
						<div className="mb-2">
							<div className="font-semibold text-primary-light mb-1">Tel</div>
							<span>{optimisticBranch.phone || 'No phone'}</span>
							<button className="ml-3 px-3 py-1 border border-primary-light text-primary-light rounded text-sm hover:bg-primary-light hover:text-white transition-all duration-200" onClick={() => setEditModal('phone')}>Edit</button>
						</div>

						{/* Logo */}
						<div className="mb-2">
							<div className="font-semibold text-primary-light mb-1">Logo</div>
							<ImageUploader
								frameWidth={140}
								frameHeight={140}
								multiple={false}
								onImageAdded={handleLogoAdded}
								onImageRemoved={handleLogoRemoved}
								existingImage={optimisticLogoUrl ? [{ id: logoId || 'logo', file: null as any, preview: buildImageUrl(optimisticLogoUrl)}] : []}
								onImageClick={handleImagePreview}
							/>
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
								{optimisticBranch.openingHours.map((hour: any, idx: number) => (
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
							<ImageUploader
								frameWidth={240}
								frameHeight={Math.round((240 / 16) * 9)}
								multiple={false}
								onImageAdded={handleFeatureImageAdded}
								onImageRemoved={handleFeatureImageRemoved}
								existingImage={optimisticFeatureImageUrl ? [{ id: featureImageId || 'feature_image', file: null as any, preview: buildImageUrl(optimisticFeatureImageUrl) }] : []}
								onImageClick={handleImagePreview}
							/>
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
						<h2 className="text-2xl font-bold text-primary-light mb-3">Gallery</h2>
 
						{/* Gallery */}
						<ImageUploader 
							frameWidth={240} 
							frameHeight={Math.round((240 / 16) * 9)} 
							className="" 
							multiple={true} 
							onImageAdded={handleGalleryImageAdded}
							onImageRemoved={handleGalleryImageRemoved}
							existingImage={galleryImages.map((img: any) => ({
								id: img.image_id,
								file: null as any, // We don't have the file for existing images
								preview: buildImageUrl(img.image_url)
							}))}
							onImageClick={(imageUrl, alt) => handleImagePreview(imageUrl.replace(process.env.NEXT_PUBLIC_BACKEND_URL || '', ''), alt || "Gallery Image")}
						/>
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

			{/* Image Preview Modal */}
			<ImagePreviewModal
				isOpen={imagePreviewModal.isOpen}
				onClose={handleCloseImagePreview}
				imageUrl={imagePreviewModal.imageUrl}
				alt={imagePreviewModal.alt}
			/>
		</div>
	);
};

export default BranchDetail;