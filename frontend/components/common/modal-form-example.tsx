"use client";

import React, { useState } from "react";
import { ModalForm } from "@/components";
import type { ModalFormField } from "@/components/common/modal-form";

const ModalFormExample = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [modalType, setModalType] = useState<string>('');
	const [formData, setFormData] = useState<Record<string, any>>({});

	// Example field configurations for different modal types
	const getExampleFields = (type: string): ModalFormField[] => {
		switch (type) {
			case 'basic':
				return [
					{
						id: 'name',
						label: 'Full Name',
						type: 'text',
						required: true,
						placeholder: 'Enter your full name',
						validation: (value) => {
							if (value && value.length < 2) {
								return 'Name must be at least 2 characters long';
							}
							return null;
						}
					},
					{
						id: 'email',
						label: 'Email Address',
						type: 'email',
						required: true,
						placeholder: 'Enter your email address',
						validation: (value) => {
							if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
								return 'Please enter a valid email address';
							}
							return null;
						}
					},
					{
						id: 'phone',
						label: 'Phone Number',
						type: 'tel',
						placeholder: 'Enter your phone number'
					}
				];

			case 'image':
				return [
					{
						id: 'title',
						label: 'Image Title',
						type: 'text',
						required: true,
						placeholder: 'Enter image title'
					},
					{
						id: 'image',
						label: 'Upload Image',
						type: 'image',
						required: true,
						imageConfig: {
							frameWidth: 300,
							frameHeight: 200,
							multiple: false,
							fontSize: 14
						}
					},
					{
						id: 'description',
						label: 'Image Description',
						type: 'textarea',
						placeholder: 'Enter image description...'
					}
				];

			case 'gallery':
				return [
					{
						id: 'galleryTitle',
						label: 'Gallery Title',
						type: 'text',
						required: true,
						placeholder: 'Enter gallery title'
					},
					{
						id: 'images',
						label: 'Upload Images',
						type: 'image',
						imageConfig: {
							frameWidth: 200,
							frameHeight: 150,
							multiple: true,
							fontSize: 12
						}
					}
				];

			case 'time':
				return [
					{
						id: 'eventName',
						label: 'Event Name',
						type: 'text',
						required: true,
						placeholder: 'Enter event name'
					},
					{
						id: 'startTime',
						label: 'Start Time',
						type: 'time',
						required: true,
						timeConfig: {
							format: 'HH:mm',
							disabled: false
						}
					},
					{
						id: 'endTime',
						label: 'End Time',
						type: 'time',
						required: true,
						timeConfig: {
							format: 'HH:mm',
							disabled: false
						}
					}
				];

			case 'address':
				return [
					{
						id: 'address',
						label: 'Full Address',
						type: 'address',
						required: true
					},
					{
						id: 'notes',
						label: 'Additional Notes',
						type: 'textarea',
						placeholder: 'Any additional notes about the location...'
					}
				];

			default:
				return [];
		}
	};

	const getModalTitle = (type: string): string => {
		switch (type) {
			case 'basic': return 'Basic Information Form';
			case 'image': return 'Image Upload Form';
			case 'gallery': return 'Gallery Upload Form';
			case 'time': return 'Time Selection Form';
			case 'address': return 'Address Information Form';
			default: return 'Form';
		}
	};

	const handleOpenModal = (type: string) => {
		setModalType(type);
		setIsOpen(true);
	};

	const handleCloseModal = () => {
		setIsOpen(false);
		setModalType('');
	};

	const handleSubmit = (data: Record<string, any>) => {
		console.log('Form submitted with data:', data);
		setFormData(data);
		// Here you would typically make an API call
		alert('Form submitted successfully! Check console for data.');
	};

	return (
		<div className="p-8 max-w-4xl mx-auto">
			<h1 className="text-3xl font-bold text-gray-900 mb-8">Modal Form Examples</h1>
			
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{/* Basic Form */}
				<div className="bg-white rounded-lg shadow-md p-6">
					<h3 className="text-lg font-semibold text-gray-900 mb-3">Basic Information</h3>
					<p className="text-gray-600 mb-4">Simple form with text inputs and validation</p>
					<button
						onClick={() => handleOpenModal('basic')}
						className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
					>
						Open Basic Form
					</button>
				</div>

				{/* Image Upload */}
				<div className="bg-white rounded-lg shadow-md p-6">
					<h3 className="text-lg font-semibold text-gray-900 mb-3">Image Upload</h3>
					<p className="text-gray-600 mb-4">Form with image uploader and description</p>
					<button
						onClick={() => handleOpenModal('image')}
						className="w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
					>
						Open Image Form
					</button>
				</div>

				{/* Gallery Upload */}
				<div className="bg-white rounded-lg shadow-md p-6">
					<h3 className="text-lg font-semibold text-gray-900 mb-3">Gallery Upload</h3>
					<p className="text-gray-600 mb-4">Form with multiple image upload</p>
					<button
						onClick={() => handleOpenModal('gallery')}
						className="w-full bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
					>
						Open Gallery Form
					</button>
				</div>

				{/* Time Selection */}
				<div className="bg-white rounded-lg shadow-md p-6">
					<h3 className="text-lg font-semibold text-gray-900 mb-3">Time Selection</h3>
					<p className="text-gray-600 mb-4">Form with time picker components</p>
					<button
						onClick={() => handleOpenModal('time')}
						className="w-full bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
					>
						Open Time Form
					</button>
				</div>

				{/* Address Form */}
				<div className="bg-white rounded-lg shadow-md p-6">
					<h3 className="text-lg font-semibold text-gray-900 mb-3">Address Information</h3>
					<p className="text-gray-600 mb-4">Form with structured address fields</p>
					<button
						onClick={() => handleOpenModal('address')}
						className="w-full bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
					>
						Open Address Form
					</button>
				</div>
			</div>

			{/* Submitted Data Display */}
			{Object.keys(formData).length > 0 && (
				<div className="mt-8 bg-gray-50 rounded-lg p-6">
					<h3 className="text-lg font-semibold text-gray-900 mb-4">Last Submitted Data:</h3>
					<pre className="bg-white p-4 rounded border text-sm overflow-auto">
						{JSON.stringify(formData, null, 2)}
					</pre>
				</div>
			)}

			{/* Modal Form */}
			<ModalForm
				isOpen={isOpen}
				onClose={handleCloseModal}
				title={getModalTitle(modalType)}
				fields={getExampleFields(modalType)}
				onSubmit={handleSubmit}
				submitText="Submit"
				cancelText="Cancel"
			/>
		</div>
	);
};

export default ModalFormExample; 