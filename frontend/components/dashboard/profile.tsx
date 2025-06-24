"use client"

import React, { useState, useCallback, useEffect } from "react"
import { Controller, useForm } from "react-hook-form";
import { useAuth } from "@/hooks/auth-hooks";
import { useUpdateUserProfile, useUploadAvatar, useDeleteAvatar } from "@/hooks/user-hooks";
import { ImageUploader, ImagePreviewModal, LoadingIndicator } from "@/components";
import { User, Edit3, Save, X } from "lucide-react";
import { useDialingCode, CountryDialingDropdown } from "@/constant/dialing-code-provider";
import type { PreviewImage } from "@/components/common/image-uploader";
import type { CountryDialingCode } from "@/types/form";

interface ProfileFormData {
    username: string;
    fname: string;
    lname: string;
    phone: string; // Will be joined as +code-number
    phoneNumber: string; // Only the number part for UI
}

// Extend user type to include Avatar for local use
type UserWithAvatar = {
    user_id: string;
    username?: string;
    fname?: string;
    lname?: string;
    email: string;
    phone?: string;
    created_at?: string;
    UserMerchant?: any;
    UserAdmin?: any;
    merchant?: any;
    branches?: any[];
    role?: string;
    merchant_id?: string;
    branch_id?: string;
    availableBranches?: string[];
    message_received?: any[];
    lang?: string;
    Avatar?: { image_id: string; image_url: string } | null;
};

// Type guard for Avatar
function hasAvatar(user: any): user is UserWithAvatar {
    return user && typeof user === 'object' && 'Avatar' in user;
}

const Profile = () => {
    const { data: authData, refetch, isLoading: isAuthLoading } = useAuth();
    const user = authData?.user as UserWithAvatar | undefined;
    const [isEditing, setIsEditing] = useState(false);
    const [imagePreviewModal, setImagePreviewModal] = useState<{ isOpen: boolean; imageUrl: string; alt: string }>({
        isOpen: false,
        imageUrl: "",
        alt: ""
    });

    const updateUserProfileMutation = useUpdateUserProfile();
    const uploadAvatarMutation = useUploadAvatar();
    const deleteAvatarMutation = useDeleteAvatar();

    const { dialingCode, setDialingCode } = useDialingCode();
    const [initialPhoneParsed, setInitialPhoneParsed] = useState(false);

    const [formData, setFormData] = useState<ProfileFormData>({
        username: user?.username || "",
        fname: user?.fname || "",
        lname: user?.lname || "",
        phone: user?.phone || "",
        phoneNumber: ""
    });

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        watch,
        control,
        setValue,
        getValues
    } = useForm<ProfileFormData>({
        defaultValues: formData
    });

    useEffect(() => {
        if (user?.phone && /^\+\d+-\d+$/.test(user.phone) && !initialPhoneParsed) {
            const [code, number] = user.phone.split("-");
            setDialingCode(code as CountryDialingCode);
            setValue("phoneNumber", number);
            setValue("phone", user.phone);
            setInitialPhoneParsed(true);
        }
    }, [user?.phone, setDialingCode, setValue, initialPhoneParsed]);

    const [optimisticAvatarUrl, setOptimisticAvatarUrl] = useState<string | undefined>();
    const [avatarId, setAvatarId] = useState<string | undefined>();

    // Sync avatar state with user data
    useEffect(() => {
        if (hasAvatar(user) && user.Avatar && user.Avatar.image_url) {
            const u = user as UserWithAvatar;
            if (u.Avatar?.image_url && u.Avatar?.image_id) {
                setOptimisticAvatarUrl(u.Avatar.image_url);
                setAvatarId(u.Avatar.image_id);
            } else {
                setOptimisticAvatarUrl(undefined);
                setAvatarId(undefined);
            }
        } else {
            setOptimisticAvatarUrl(undefined);
            setAvatarId(undefined);
        }
    }, [user]);

    useEffect(() => {
        setValue("phone", `${dialingCode}-${getValues("phoneNumber")}`);
    }, [dialingCode, setValue, getValues]);

    // Sync formData with form state in real time
    useEffect(() => {
        const subscription = watch((value) => {
            setFormData((prev) => ({ ...prev, ...value }));
        });
        return () => subscription.unsubscribe();
    }, [watch]);

    const buildImageUrl = (url: string) => {
        if (!url) return '';
        if (url.startsWith('blob:') || url.startsWith('http')) {
            return url;
        }
        return `${process.env.NEXT_PUBLIC_BACKEND_URL}${url}`;
    };

    const handleImagePreview = useCallback((imageUrl: string, alt?: string) => {
        setImagePreviewModal({
            isOpen: true,
            imageUrl: buildImageUrl(imageUrl),
            alt: alt || "Avatar Preview"
        });
    }, []);

    const handleCloseImagePreview = useCallback(() => {
        setImagePreviewModal({
            isOpen: false,
            imageUrl: "",
            alt: ""
        });
    }, []);

    const handleAvatarAdded = (image: PreviewImage): Promise<void> => {
        return new Promise((resolve, reject) => {
            setOptimisticAvatarUrl(image.preview);
            // Optimistically show preview
            const uploadNew = () => {
                uploadAvatarMutation.mutate(image.file, {
                    onSuccess: async (res) => {
                        // Refetch user data to get new avatar info
                        const { data: newAuthData } = await refetch();
                        if (newAuthData && hasAvatar(newAuthData.user)) {
                            const u = newAuthData.user as UserWithAvatar;
                            if (u.Avatar?.image_url && u.Avatar?.image_id) {
                                setOptimisticAvatarUrl(u.Avatar.image_url);
                                setAvatarId(u.Avatar.image_id);
                            } else {
                                setOptimisticAvatarUrl(undefined);
                                setAvatarId(undefined);
                            }
                        } else {
                            setOptimisticAvatarUrl(undefined);
                            setAvatarId(undefined);
                        }
                        resolve();
                    },
                    onError: async (err) => {
                        // If upload fails, delete the uploaded file (API will handle it)
                        await deleteAvatarMutation.mutateAsync("");
                        setOptimisticAvatarUrl(undefined);
                        setAvatarId(undefined);
                        reject(err);
                    }
                });
            };
            if (avatarId) {
                // Remove old avatar first
                deleteAvatarMutation.mutate("", {
                    onSuccess: uploadNew,
                    onError: (err) => {
                        setOptimisticAvatarUrl(undefined);
                        setAvatarId(undefined);
                        reject(err);
                    }
                });
            } else {
                uploadNew();
            }
        });
    };

    const handleAvatarRemoved = (id: string) => {
        if (avatarId) {
            deleteAvatarMutation.mutate("", {
                onSuccess: async () => {
                    // Refetch user data to clear avatar info
                    const { data: newAuthData } = await refetch();
                    if (newAuthData && hasAvatar(newAuthData.user)) {
                        const u = newAuthData.user as UserWithAvatar;
                        if (u.Avatar?.image_url && u.Avatar?.image_id) {
                            setOptimisticAvatarUrl(u.Avatar.image_url);
                            setAvatarId(u.Avatar.image_id);
                        } else {
                            setOptimisticAvatarUrl(undefined);
                            setAvatarId(undefined);
                        }
                    } else {
                        setOptimisticAvatarUrl(undefined);
                        setAvatarId(undefined);
                    }
                },
                onError: () => {
                    setOptimisticAvatarUrl(undefined);
                    setAvatarId(undefined);
                }
            });
        }
    };

    const [isTransferring, setIsTransferring] = useState(false);

    const onSubmit = async () => {
        setIsTransferring(true);
        const phone = `${dialingCode}-${formData.phoneNumber}`;
        const submitData = { ...formData, phone };
        (submitData as any).phoneNumber = undefined;
        await updateUserProfileMutation.mutateAsync(submitData);
        setIsEditing(false);
        const { data: newAuthData } = await refetch();
        if (newAuthData?.user) {
            const newUser = newAuthData.user;
            setFormData({
                username: newUser.username || "",
                fname: newUser.fname || "",
                lname: newUser.lname || "",
                phone: newUser.phone || "",
                phoneNumber: newUser.phone?.split("-")[1] || ""
            });
            reset({
                username: newUser.username || "",
                fname: newUser.fname || "",
                lname: newUser.lname || "",
                phone: newUser.phone || "",
                phoneNumber: newUser.phone?.split("-")[1] || ""
            });
        }
        setIsTransferring(false);
    };

    const handleCancel = () => {
        setIsEditing(false);
        reset();
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (!user || isAuthLoading || isTransferring || updateUserProfileMutation.isPending) {
        return <LoadingIndicator fullScreen={true} />;
    }

    return (
        <div className="w-full max-w-4xl mx-auto font-regular-eng p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-primary-light flex items-center gap-3">
                    <User className="w-8 h-8" />
                    User Profile
                </h1>
                <p className="text-gray-600 mt-2">Manage your personal information and account settings</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Avatar */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl shadow-md p-6">
                        <h2 className="text-xl font-bold text-primary-light mb-4 flex items-center gap-2">
                            <User className="w-5 h-5" />
                            Profile Picture
                        </h2>
                        
                        <div className="flex flex-col items-center">
                            <ImageUploader
                                frameWidth={200}
                                frameHeight={200}
                                multiple={false}
                                onImageAdded={handleAvatarAdded}
                                onImageRemoved={handleAvatarRemoved}
                                existingImage={optimisticAvatarUrl ? [{ 
                                    id: avatarId || 'avatar', 
                                    file: null as any, 
                                    preview: buildImageUrl(optimisticAvatarUrl)
                                }] : []}
                                onImageClick={handleImagePreview}
                            />
                            
                            <p className="text-sm text-gray-500 mt-3 text-center">
                                Click to upload or replace your profile picture
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Column - Profile Information */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl shadow-md p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-primary-light flex items-center gap-2">
                                <User className="w-5 h-5" />
                                Personal Information
                            </h2>
                            
                            <div className="flex gap-2">
                                {!isEditing ? (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="flex items-center gap-2 px-4 py-2 bg-primary-light text-white rounded-lg hover:bg-primary-dark transition-colors"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                        Edit
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            onClick={handleSubmit(onSubmit)}
                                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                        >
                                            <Save className="w-4 h-4" />
                                            Save
                                        </button>
                                        <button
                                            onClick={handleCancel}
                                            className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                            Cancel
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            {/* Username */}
                            <div>
                                <label className="font-semibold text-primary-light mb-2 flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    Username
                                </label>
                                {isEditing ? (
                                    <input
                                        {...register("username", { required: "Username is required" })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent"
                                        placeholder="Enter username"
                                    />
                                ) : (
                                    <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-700">
                                        {user.username || 'Not provided'}
                                    </div>
                                )}
                                {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>}
                            </div>

                            {/* Name Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-semibold text-primary-light mb-2">First Name</label>
                                    {isEditing ? (
                                        <input
                                            {...register("fname", { required: "First name is required" })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent"
                                            placeholder="Enter first name"
                                        />
                                    ) : (
                                        <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-700">
                                            {user.fname || 'Not provided'}
                                        </div>
                                    )}
                                    {errors.fname && <p className="text-red-500 text-sm mt-1">{errors.fname.message}</p>}
                                </div>

                                <div>
                                    <label className="block font-semibold text-primary-light mb-2">Last Name</label>
                                    {isEditing ? (
                                        <input
                                            {...register("lname", { required: "Last name is required" })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent"
                                            placeholder="Enter last name"
                                        />
                                    ) : (
                                        <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-700">
                                            {user.lname || 'Not provided'}
                                        </div>
                                    )}
                                    {errors.lname && <p className="text-red-500 text-sm mt-1">{errors.lname.message}</p>}
                                </div>
                            </div>

                            {/* Email - Read Only */}
                            <div>
                                <label className="block font-semibold text-primary-light mb-2">Email</label>
                                <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-700">
                                    {user.email || 'Not provided'}
                                </div>
                            </div>

                            {/* Phone - Split input */}
                            <div>
                                <label className="block font-semibold text-primary-light mb-2">Phone</label>
                                {isEditing ? (
                                    <div className="flex gap-2 items-center">
                                        <CountryDialingDropdown />
                                        <Controller
                                            name="phoneNumber"
                                            control={control}
                                            rules={{
                                                required: "Phone number is required",
                                                pattern: {
                                                    value: /^\d+$/,
                                                    message: "Phone number must be numeric"
                                                }
                                            }}
                                            render={({ field }) => (
                                                <input
                                                    {...field}
                                                    type="text"
                                                    value={field.value || user.phone?.split("-")[1] || ''}
                                                    onChange={e => {
                                                        const val = e.target.value.replace(/[^\d]/g, "");
                                                        field.onChange(val);
                                                        setValue("phone", `${dialingCode}-${val}`);
                                                    }}
                                                    className={`flex-1 border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${errors.phoneNumber ? "border-red-500" : "border-gray-400"}`}
                                                    placeholder="Enter phone number"
                                                />
                                            )}
                                        />
                                    </div>
                                ) : (
                                    <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-700">
                                        {user.phone || 'Not provided'}
                                    </div>
                                )}
                                {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber.message}</p>}
                            </div>

                            {/* Position - Read Only */}
                            <div>
                                <label className="block font-semibold text-primary-light mb-2">Position</label>
                                <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-700">
                                    {user.UserMerchant?.position || 'Not assigned'}
                                </div>
                            </div>

                            {/* Joined At - Read Only */}
                            <div>
                                <label className="block font-semibold text-primary-light mb-2">Joined At</label>
                                <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-700">
                                    {user.created_at ? formatDate(user.created_at) : 'Not provided'}
                                </div>
                            </div>

                        </form>
                    </div>
                </div>
            </div>

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

export default Profile;