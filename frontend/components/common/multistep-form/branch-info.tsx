"use client";

import React, { useEffect, useRef } from "react";
import Cookies from "js-cookie";
import { useForm } from "@/constant/form-provider";
import type { UseFormReturn } from "react-hook-form";
import { AddBranchFormFields } from "@/types/form";
import { Tag } from "@/components";
import { Trash2 } from "lucide-react";

const COOKIE_KEY = "branchForm";

interface BranchInfoProps {
    onNext?: () => void;
}

const BranchInfo: React.FC<BranchInfoProps> = ({ onNext }) => {
    const { formMethods } = useForm();
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        getValues,
        control,
        formState: { errors },
    } = (formMethods as unknown) as UseFormReturn<AddBranchFormFields["branchInfo"]>;

    const tagInputRef = useRef<HTMLInputElement>(null);
    const featureInputRef = useRef<HTMLInputElement>(null);

    // Watch features and tags arrays
    const features = watch("features") || [];
    const tags = watch("tags") || [];

    // Load from cookie if available
    useEffect(() => {
        const cookie = Cookies.get(COOKIE_KEY);
        if (cookie) {
            try {
                const parsed = JSON.parse(cookie);
                if (parsed.branchInfo) {
                    Object.entries(parsed.branchInfo).forEach(([key, value]) => {
                        setValue(key as keyof AddBranchFormFields["branchInfo"], value as any);
                    });
                }
            } catch {}
        }
    }, [setValue]);

    const onSubmit = (data: AddBranchFormFields["branchInfo"]) => {
        // Save to cookie
        const cookie = Cookies.get(COOKIE_KEY);
        let cookieData = {};
        if (cookie) {
            try {
                cookieData = JSON.parse(cookie);
            } catch {}
        }
        Cookies.set(COOKIE_KEY, JSON.stringify({ ...cookieData, branchInfo: data }));
        // Advance to next step
        if (onNext) onNext();
    };

    // Listen for stepper-next event
    useEffect(() => {
        const handler = () => {
            // This is a placeholder; actual stepper logic is in parent
        };
        window.addEventListener("stepper-next", handler);
        return () => window.removeEventListener("stepper-next", handler);
    }, []);

    const handleOpeningHoursChange = (index: number, field: 'open_time' | 'close_time' | 'closed', value: string | boolean) => {
        const currentHours = getValues('opening_hours') || [];
        const dayHours = currentHours.find(h => h.dayOfWeek === index + 1);

        if (dayHours) {
            setValue('opening_hours', currentHours.map(h => 
                h.dayOfWeek === index + 1 ? { ...h, [field]: value } : h
            ));
        } else {
            setValue('opening_hours', [...currentHours, {
                id: index + 1,
                dayOfWeek: index + 1,
                open_time: field === 'open_time' ? value as string : '09:00',
                close_time: field === 'close_time' ? value as string : '18:00',
                closed: field === 'closed' ? value as boolean : false
            }]);
        }
    };

    const handleAddFeature = () => {
        if (featureInputRef.current?.value) {
            const newFeatures = [...features, featureInputRef.current.value];
            setValue("features", newFeatures);
            featureInputRef.current.value = "";
        }
    };

    const handleRemoveFeature = (index: number) => {
        const newFeatures = features.filter((_, i) => i !== index);
        setValue("features", newFeatures);
    };

    const handleAddTag = () => {
        if (tagInputRef.current?.value) {
            const newTags = [...tags, tagInputRef.current.value];
            setValue("tags", newTags);
            tagInputRef.current.value = "";
        }
    };

    const handleRemoveTag = (index: number) => {
        const newTags = tags.filter((_, i) => i !== index);
        setValue("tags", newTags);
    };

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="w-full flex justify-center items-center py-8 font-regular-eng"
        >
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-6 border border-gray-100 relative">
                <h2 className="text-3xl font-bold text-center mb-4 text-primary-light">Branch Information</h2>

                {/* Contact Person (Select) */}
                <div>
                    <label htmlFor="contact_person" className="block mb-1 font-semibold text-text-main text-sm">Contact Person</label>
                    <select
                        id="contact_person"
                        className={`w-full border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary ${
                            errors.contact_person ? "border-red-500" : "border-gray-400"
                        }`}
                        {...register("contact_person", { required: "Contact person is required" })}
                    >
                        <option value="">Select Contact Person</option>
                        <option value="John Doe">John Doe</option>
                        <option value="Jane Smith">Jane Smith</option>
                        <option value="Mike Johnson">Mike Johnson</option>
                    </select>
                    {errors.contact_person && <span className="text-red-500 text-xs">{errors.contact_person.message}</span>}
                </div>

                {/* Branch Name */}
                <div>
                    <label htmlFor="name" className="block mb-1 font-semibold text-text-main text-sm">Branch Name</label>
                    <input
                        id="name"
                        className={`w-full border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary ${
                            errors.name ? "border-red-500" : "border-gray-400"
                        }`}
                        {...register("name", { required: "Branch name is required" })}
                        placeholder="Enter branch name"
                    />
                    {errors.name && <span className="text-red-500 text-xs">{errors.name?.message}</span>}
                </div>

                {/* Email (Input) */}
                <div>
                    <label htmlFor="email" className="block mb-1 font-semibold text-text-main text-sm">Email</label>
                    <input
                        id="email"
                        type="email"
                        className={`w-full border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary ${
                            errors.email ? "border-red-500" : "border-gray-400"
                        }`}
                        {...register("email", { 
                            required: "Email is required",
                            pattern: {
                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: "Invalid email address"
                            }
                        })}
                        placeholder="Enter email address"
                    />
                    {errors.email && <span className="text-red-500 text-xs">{errors.email.message}</span>}
                </div>

                {/* Branch Tel */}
                <div>
                    <label htmlFor="branch_tel" className="block mb-1 font-semibold text-text-main text-sm">Branch Tel</label>
                    <input
                        id="branch_tel"
                        type="tel"
                        className={`w-full border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary ${
                            errors.branch_tel ? "border-red-500" : "border-gray-400"
                        }`}
                        {...register("branch_tel", { 
                            required: "Branch telephone number is required",
                            pattern: {
                                value: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
                                message: "Invalid telephone number"
                            }
                        })}
                        placeholder="Enter branch telephone number"
                    />
                    {errors.branch_tel && <span className="text-red-500 text-xs">{errors.branch_tel.message}</span>}
                </div>

                {/* Description */}
                <div>
                    <label htmlFor="description" className="block mb-1 font-semibold text-text-main text-sm">Description</label>
                    <textarea
                        id="description"
                        className={`w-full border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary min-h-[100px] ${
                            errors.description ? "border-red-500" : "border-gray-400"
                        }`}
                        { ...register("description" )}
                        placeholder="Enter branch description"
                    />
                    {errors.description && <span className="text-red-500 text-xs">{errors.description.message}</span>}
                </div>

                {/* Features */}
                <div>
                    <label className="block mb-2 font-semibold text-text-main text-sm">Features</label>
                    <div className="flex gap-2 mb-2">
                        <input 
                            ref={featureInputRef} 
                            className="input input-bordered input-xs placeholder:text-sm border-b-1 border-gray-200 py-2 outline-none text-text-main rounded-lg w-full" 
                            placeholder="Add New Feature" 
                        />
                        <button 
                            type="button" 
                            className="btn btn-xs bg-primary-light text-white px-4 rounded-full text-sm font-semibold cursor-pointer ml-2"
                            onClick={handleAddFeature}
                        >
                            Add
                        </button>
                    </div>
                    <div className="space-y-1">
                        {features.map((feature, i) => (
                            <div key={i} className="flex justify-between items-center gap-2 w-full">
                                <span className="text-base font-medium text-text-main py-2">{feature}</span>
                                <button 
                                    type="button" 
                                    className="btn btn-xs bg-red-500 text-white px-2 py-2 rounded-full text-sm font-semibold cursor-pointer ml-2"
                                    onClick={() => handleRemoveFeature(i)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                    {errors.features && <span className="text-red-500 text-xs">{errors.features.message}</span>}
                </div>

                {/* Tags */}
                <div>
                    <label className="block mb-2 font-semibold text-text-main text-sm">Tags</label>
                    <div className="flex gap-2 mb-2">
                        <input 
                            ref={tagInputRef} 
                            className="input input-bordered input-xs placeholder:text-sm border-b-1 border-gray-200 py-2 outline-none text-text-main rounded-lg w-full" 
                            placeholder="Add a new tag" 
                        />
                        <button 
                            type="button" 
                            className="btn btn-xs bg-primary-light text-white px-4 rounded-full text-sm font-semibold cursor-pointer ml-2"
                            onClick={handleAddTag}
                        >
                            Add
                        </button>
                    </div>
                    {/* Tags List */}
                    <div className="flex flex-wrap gap-2 mt-4">
                        {tags.map((tag, i) => (
                            <Tag 
                                key={i} 
                                tagName={tag} 
                                removeButton={true} 
                                onClick={() => handleRemoveTag(i)}
                            />
                        ))}
                    </div>
                    {errors.tags && <span className="text-red-500 text-xs">{errors.tags.message}</span>}
                </div>

                {/* Opening Hours */}
                <div>
                    <label className="block mb-2 font-semibold text-text-main text-sm">Opening Hours</label>
                    <div className="space-y-4">
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, index) => {
                            const dayHours = watch('opening_hours')?.find(h => h.dayOfWeek === index + 1);
                            return (
                                <div key={day} className="flex items-center space-x-4">
                                    <div className="w-32">
                                        <label className="text-sm">{day}</label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id={`closed-${day}`}
                                            className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
                                            checked={dayHours?.closed || false}
                                            onChange={(e) => handleOpeningHoursChange(index, 'closed', e.target.checked)}
                                        />
                                        <label htmlFor={`closed-${day}`} className="text-sm">Closed</label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="time"
                                            className="border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary border-gray-400"
                                            value={dayHours?.open_time || '09:00'}
                                            onChange={(e) => handleOpeningHoursChange(index, 'open_time', e.target.value)}
                                        />
                                        <span>to</span>
                                        <input
                                            type="time"
                                            className="border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary border-gray-400"
                                            value={dayHours?.close_time || '18:00'}
                                            onChange={(e) => handleOpeningHoursChange(index, 'close_time', e.target.value)}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Next Button */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        className="bg-primary-light text-white rounded-[10px] px-8 py-2 text-base font-semibold shadow-sm hover:bg-primary-dark transition-all cursor-pointer"
                    >
                        Next
                    </button>
                </div>
            </div>
        </form>
    );
};

export default BranchInfo;