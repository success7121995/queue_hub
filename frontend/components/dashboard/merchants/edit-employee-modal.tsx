"use client";

import React, { useEffect, useRef } from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EditEmployeeSchema, type EditEmployeeFormFields } from '@/types/form';
import { UserMerchant } from '@/types/user';
import { X } from 'lucide-react';

interface EditEmployeeModalProps {
    isOpen: boolean;
    onClose: () => void;
    employee: UserMerchant | null;
    onSave: (data: EditEmployeeFormFields) => void;
    isLoading: boolean;
}

const roleOptions = [
    { value: "OWNER", label: "Owner" },
    { value: "MANAGER", label: "Manager" },
    { value: "FRONTLINE", label: "Frontline" },
];

export const EditEmployeeModal: React.FC<EditEmployeeModalProps> = ({ isOpen, onClose, employee, onSave, isLoading }) => {
    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: { errors },
    } = useForm<EditEmployeeFormFields>({
        resolver: zodResolver(EditEmployeeSchema),
    });

    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (employee) {
            reset({
                fname: employee.User?.fname || '',
                lname: employee.User?.lname || '',
                email: employee.User?.email || '',
                username: employee.User?.username || '',
                phone: employee.User?.phone || '',
                position: employee.position || '',
                role: employee.role as "OWNER" | "MANAGER" | "FRONTLINE",
            });
        }
    }, [employee, reset]);
    
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

    const onSubmit: SubmitHandler<EditEmployeeFormFields> = (data) => {
        onSave(data);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div
				ref={modalRef}
				className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
			>
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
					<h2 className="text-xl font-bold text-gray-900">Edit Employee</h2>
					<button
						onClick={onClose}
						className="text-gray-400 hover:text-gray-600 transition-colors"
						aria-label="Close modal"
					>
						<X size={24} />
					</button>
				</div>
                <form onSubmit={handleSubmit(onSubmit)} className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        {/* First Name */}
                        <div>
                            <label htmlFor="fname" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                            <input {...register('fname')} id="fname" className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-light ${errors.fname ? 'border-red-500' : 'border-gray-300'}`} />
                            {errors.fname && <span className="text-red-500 text-xs mt-1">{errors.fname.message}</span>}
                        </div>

                        {/* Last Name */}
                        <div>
                            <label htmlFor="lname" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                            <input {...register('lname')} id="lname" className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-light ${errors.lname ? 'border-red-500' : 'border-gray-300'}`} />
                            {errors.lname && <span className="text-red-500 text-xs mt-1">{errors.lname.message}</span>}
                        </div>

                        {/* Email (Read-only) */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input {...register('email')} id="email" readOnly className="w-full border rounded px-3 py-2 bg-gray-100 cursor-not-allowed border-gray-300" />
                        </div>

                        {/* Username (Read-only) */}
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                            <input {...register('username')} id="username" readOnly className="w-full border rounded px-3 py-2 bg-gray-100 cursor-not-allowed border-gray-300" />
                        </div>

                        {/* Phone */}
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                            <input {...register('phone')} id="phone" className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-light ${errors.phone ? 'border-red-500' : 'border-gray-300'}`} />
                            {errors.phone && <span className="text-red-500 text-xs mt-1">{errors.phone.message}</span>}
                        </div>

                        {/* Position */}
                        <div>
                            <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                            <input {...register('position')} id="position" className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-light ${errors.position ? 'border-red-500' : 'border-gray-300'}`} />
                            {errors.position && <span className="text-red-500 text-xs mt-1">{errors.position.message}</span>}
                        </div>

                        {/* Role */}
                        <div className="md:col-span-2">
                            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                            <Controller
                                name="role"
                                control={control}
                                render={({ field }) => (
                                    <select {...field} id="role" className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-light ${errors.role ? 'border-red-500' : 'border-gray-300'}`}>
                                        {roleOptions.map(option => (
                                            <option key={option.value} value={option.value}>{option.label}</option>
                                        ))}
                                    </select>
                                )}
                            />
                            {errors.role && <span className="text-red-500 text-xs mt-1">{errors.role.message}</span>}
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
						<button
							type="button"
							onClick={onClose}
							className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            disabled={isLoading}
						>
							Cancel
						</button>
						<button
							type="submit"
							className="px-4 py-2 bg-primary-light text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
                            disabled={isLoading}
						>
							{isLoading ? 'Saving...' : 'Save Changes'}
						</button>
					</div>
                </form>
            </div>
        </div>
    );
}; 