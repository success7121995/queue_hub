"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { X } from "lucide-react";
import { ImageUploader } from "@/components";
import { TimePicker } from "@/components";
import type { PreviewImage } from "./image-uploader";

export interface ModalFormField {
	id: string;
	label: string;
	type: 'text' | 'textarea' | 'image' | 'time' | 'email' | 'tel' | 'address' | 'select';
	value?: any;
	required?: boolean;
	placeholder?: string;
	readOnly?: boolean;
	validation?: (value: any) => string | null;
	imageConfig?: {
		frameWidth?: number;
		frameHeight?: number;
		multiple?: boolean;
		fontSize?: number;
		existingImage?: PreviewImage[];
	};
	timeConfig?: {
		format?: string;
		disabled?: boolean;
	};
	options?: Array<{ value: string; label: string }>;
}

export interface ModalFormProps {
	isOpen: boolean;
	onClose: () => void;
	title: string;
	fields: ModalFormField[];
	onSubmit: (data: Record<string, any>) => void;
	onChange?: (fieldId: string, value: any, formData: Record<string, any>) => void;
	submitText?: string;
	cancelText?: string;
	initialData?: Record<string, any>;
}

const ModalForm: React.FC<ModalFormProps> = ({
	isOpen,
	onClose,
	title,
	fields,
	onSubmit,
	onChange,
	submitText = "Save",
	cancelText = "Cancel",
	initialData = {}
}) => {
	const [formData, setFormData] = useState<Record<string, any>>({});
	const [errors, setErrors] = useState<Record<string, string>>({});
	const modalRef = useRef<HTMLDivElement>(null);
	const fieldsRef = useRef<ModalFormField[]>([]);
	const initialDataRef = useRef<Record<string, any>>({});

	// Store current fields and initial data in refs to avoid dependency issues
	useEffect(() => {
		fieldsRef.current = fields;
		initialDataRef.current = initialData;
	});

	// Initialize form data only when modal opens
	useEffect(() => {
		if (isOpen) {
			const data: Record<string, any> = {};
			fieldsRef.current.forEach(field => {
				data[field.id] = initialDataRef.current[field.id] || field.value || '';
			});
			setFormData(data);
			setErrors({});
		}
	}, [isOpen]); // Only depend on isOpen

	// Handle click outside to close modal
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
				onClose();
			}
		};

		if (isOpen) {
			document.addEventListener('mousedown', handleClickOutside);
			document.body.style.overflow = 'hidden';
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
			document.body.style.overflow = 'unset';
		};
	}, [isOpen, onClose]);

	// Handle escape key to close modal
	useEffect(() => {
		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				onClose();
			}
		};

		if (isOpen) {
			document.addEventListener('keydown', handleEscape);
		}

		return () => {
			document.removeEventListener('keydown', handleEscape);
		};
	}, [isOpen, onClose]);

	const handleInputChange = useCallback((fieldId: string, value: any) => {
		setFormData(prev => {
			const newFormData = {
				...prev,
				[fieldId]: value
			};
			
			// Call onChange callback if provided (debounced)
			if (onChange) {
				setTimeout(() => onChange(fieldId, value, newFormData), 0);
			}
			
			return newFormData;
		});

		// Clear error when user starts typing
		if (errors[fieldId]) {
			setErrors(prev => ({
				...prev,
				[fieldId]: ''
			}));
		}
	}, [errors, onChange]);

	const validateField = useCallback((field: ModalFormField, value: any): string | null => {
		// Required validation
		if (field.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
			return `${field.label} is required`;
		}

		// Custom validation
		if (field.validation) {
			return field.validation(value);
		}

		return null;
	}, []);

	const validateForm = useCallback((): boolean => {
		const newErrors: Record<string, string> = {};
		let isValid = true;

		fieldsRef.current.forEach(field => {
			const error = validateField(field, formData[field.id]);
			if (error) {
				newErrors[field.id] = error;
				isValid = false;
			}
		});

		setErrors(newErrors);
		return isValid;
	}, [formData, validateField]);

	const handleSubmit = useCallback((e: React.FormEvent) => {
		e.preventDefault();
		
		if (validateForm()) {
			onSubmit(formData);
			onClose();
		}
	}, [formData, validateForm, onSubmit, onClose]);

	const handleCancel = useCallback(() => {
		onClose();
	}, [onClose]);

	const renderField = useCallback((field: ModalFormField) => {
		const fieldError = errors[field.id];
		const fieldValue = formData[field.id];

		switch (field.type) {
			case 'textarea':
				return (
					<div key={field.id} className="mb-4">
						<label className="block text-sm font-medium text-gray-700 mb-2">
							{field.label}
							{field.required && <span className="text-red-500 ml-1">*</span>}
						</label>
						<textarea
							value={fieldValue || ''}
							onChange={(e) => handleInputChange(field.id, e.target.value)}
							placeholder={field.placeholder}
							className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light transition-colors ${
								fieldError ? 'border-red-500' : 'border-gray-300 focus:border-primary-light'
							}`}
							rows={4}
						/>
						{fieldError && (
							<p className="text-red-500 text-sm mt-1">{fieldError}</p>
						)}
					</div>
				);

			case 'image':
				return (
					<div key={field.id} className="mb-4">
						<label className="block text-sm font-medium text-gray-700 mb-2">
							{field.label}
							{field.required && <span className="text-red-500 ml-1">*</span>}
						</label>
						<ImageUploader
							frameWidth={field.imageConfig?.frameWidth || 240}
							frameHeight={field.imageConfig?.frameHeight || 160}
							fontSize={field.imageConfig?.fontSize || 12}
							className="w-full"
							multiple={field.imageConfig?.multiple || false}
							onUploadComplete={(files) => handleInputChange(field.id, files)}
							existingImage={field.imageConfig?.existingImage || []}
						/>
						{fieldError && (
							<p className="text-red-500 text-sm mt-1">{fieldError}</p>
						)}
					</div>
				);

			case 'time':
				return (
					<div key={field.id} className="mb-4">
						<label className="block text-sm font-medium text-gray-700 mb-2">
							{field.label}
							{field.required && <span className="text-red-500 ml-1">*</span>}
						</label>
						<TimePicker
							value={fieldValue || '09:00'}
							onChange={(value) => handleInputChange(field.id, value)}
							format={field.timeConfig?.format || 'HH:mm'}
							disabled={field.timeConfig?.disabled || false}
							className="w-full"
						/>
						{fieldError && (
							<p className="text-red-500 text-sm mt-1">{fieldError}</p>
						)}
					</div>
				);

			case 'address':
				return (
					<div key={field.id} className="mb-4">
						<label className="block text-sm font-medium text-gray-700 mb-2">
							{field.label}
							{field.required && <span className="text-red-500 ml-1">*</span>}
						</label>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
							<input
								type="text"
								value={fieldValue?.street || ''}
								onChange={(e) => handleInputChange(field.id, { ...fieldValue, street: e.target.value })}
								placeholder="Street Address"
								className={`px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light transition-colors ${
									fieldError ? 'border-red-500' : 'border-gray-300 focus:border-primary-light'
								}`}
							/>
							<input
								type="text"
								value={fieldValue?.city || ''}
								onChange={(e) => handleInputChange(field.id, { ...fieldValue, city: e.target.value })}
								placeholder="City"
								className={`px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light transition-colors ${
									fieldError ? 'border-red-500' : 'border-gray-300 focus:border-primary-light'
								}`}
							/>
							<input
								type="text"
								value={fieldValue?.state || ''}
								onChange={(e) => handleInputChange(field.id, { ...fieldValue, state: e.target.value })}
								placeholder="State/Province"
								className={`px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light transition-colors ${
									fieldError ? 'border-red-500' : 'border-gray-300 focus:border-primary-light'
								}`}
							/>
							<input
								type="text"
								value={fieldValue?.country || ''}
								onChange={(e) => handleInputChange(field.id, { ...fieldValue, country: e.target.value })}
								placeholder="Country"
								className={`px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light transition-colors ${
									fieldError ? 'border-red-500' : 'border-gray-300 focus:border-primary-light'
								}`}
							/>
						</div>
						{fieldError && (
							<p className="text-red-500 text-sm mt-1">{fieldError}</p>
						)}
					</div>
				);

			case 'select':
				return (
					<div key={field.id} className="mb-4">
						<label className="block text-sm font-medium text-gray-700 mb-2">
							{field.label}
							{field.required && <span className="text-red-500 ml-1">*</span>}
						</label>
						<select
							value={fieldValue || ''}
							onChange={(e) => handleInputChange(field.id, e.target.value)}
							className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light transition-colors ${
								fieldError ? 'border-red-500' : 'border-gray-300 focus:border-primary-light'
							}`}
						>
							{field.options?.map(option => (
								<option key={option.value} value={option.value}>
									{option.label}
								</option>
							))}
						</select>
						{fieldError && (
							<p className="text-red-500 text-sm mt-1">{fieldError}</p>
						)}
					</div>
				);

			default:
				return (
					<div key={field.id} className="mb-4">
						<label className="block text-sm font-medium text-gray-700 mb-2">
							{field.label}
							{field.required && <span className="text-red-500 ml-1">*</span>}
						</label>
						<input
							type={field.type}
							value={fieldValue || ''}
							onChange={(e) => handleInputChange(field.id, e.target.value)}
							placeholder={field.placeholder}
							readOnly={field.readOnly}
							className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light transition-colors ${
								fieldError ? 'border-red-500' : 'border-gray-300 focus:border-primary-light'
							} ${field.readOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`}
						/>
						{fieldError && (
							<p className="text-red-500 text-sm mt-1">{fieldError}</p>
						)}
					</div>
				);
		}
	}, [formData, errors, handleInputChange]);

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
			<div
				ref={modalRef}
				className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
			>
				{/* Header */}
				<div className="flex items-center justify-between p-6 border-b border-gray-200">
					<h2 className="text-xl font-bold text-gray-900">{title}</h2>
					<button
						onClick={handleCancel}
						className="text-gray-400 hover:text-gray-600 transition-colors"
						aria-label="Close modal"
					>
						<X size={24} />
					</button>
				</div>

				{/* Form */}
				<form onSubmit={handleSubmit} className="p-6">
					<div className="space-y-4">
						{fields.map(renderField)}
					</div>

					{/* Footer */}
					<div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
						<button
							type="button"
							onClick={handleCancel}
							className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
						>
							{cancelText}
						</button>
						<button
							type="submit"
							className="px-4 py-2 bg-primary-light text-white rounded-lg hover:bg-primary-hover transition-colors"
						>
							{submitText}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default ModalForm;