"use client"

import React, { useState, useCallback, useEffect } from "react"
import { useAuth } from "@/hooks/auth-hooks";
import { useUploadLogo, useDeleteLogo, useMerchant } from "@/hooks/merchant-hooks";
import { ConfirmationModal } from "@/components/common/confirmation-modal";
import { ImageUploader, ImagePreviewModal, LoadingIndicator } from "@/components";
import { Shield, Lock, Mail, Monitor, Trash2, Eye, EyeOff, CheckCircle, XCircle, AlertTriangle, Image } from "lucide-react";
import type { PreviewImage } from "@/components/common/image-uploader";

// Mock session data structure
interface Session {
    session_id: string;
    user_id: string;
    ip_address: string;
    user_agent: string;
    created_at: string;
    last_used: string;
    location: string;
    is_current: boolean;
}

// Mock user data for demonstration
const mockUser = {
    user_id: "user-123",
    username: "merchant_user",
    fname: "John",
    lname: "Doe",
    email: "john.doe@example.com",
    phone: "+1-555-123-4567",
    email_verified: false,
    created_at: "2024-01-15T10:30:00Z",
    UserMerchant: {
        staff_id: "staff-123",
        user_id: "user-123",
        merchant_id: "merchant-456",
        position: "Store Manager",
        role: "OWNER", // This will be overridden by actual user data
        join_at: "2024-01-15T10:30:00Z",
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-15T10:30:00Z"
    }
};

// Mock sessions data
const mockSessions: Session[] = [
    {
        session_id: "session-1",
        user_id: "user-123",
        ip_address: "192.168.1.100",
        user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        created_at: "2024-01-15T10:30:00Z",
        last_used: "2024-01-20T14:22:00Z",
        location: "San Francisco, CA",
        is_current: true
    },
    {
        session_id: "session-2",
        user_id: "user-123",
        ip_address: "203.0.113.45",
        user_agent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
        created_at: "2024-01-18T09:15:00Z",
        last_used: "2024-01-19T16:45:00Z",
        location: "Los Angeles, CA",
        is_current: false
    },
    {
        session_id: "session-3",
        user_id: "user-123",
        ip_address: "198.51.100.123",
        user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        created_at: "2024-01-16T11:20:00Z",
        last_used: "2024-01-17T13:30:00Z",
        location: "New York, NY",
        is_current: false
    }
];

const Account = () => {
    const { data: authData, refetch } = useAuth();
    const user = authData?.user || mockUser;
    const merchantRole = user.UserMerchant?.role || "OWNER";
    const isOwner = merchantRole === "OWNER";

    // Get merchant data for logo
    const { data: merchantData } = useMerchant(user.UserMerchant?.merchant_id as string);
    const logo = merchantData?.logo;

    // Logo upload state
    const [optimisticLogoUrl, setOptimisticLogoUrl] = useState<string | undefined>();
    const [logoId, setLogoId] = useState<string | undefined>();
    const [imagePreviewModal, setImagePreviewModal] = useState<{ isOpen: boolean; imageUrl: string; alt: string }>({
        isOpen: false,
        imageUrl: "",
        alt: ""
    });

    const uploadLogoMutation = useUploadLogo();
    const deleteLogoMutation = useDeleteLogo();

    // Password change state
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });
    const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});

    // Email verification state
    const [isResendingVerification, setIsResendingVerification] = useState(false);

    // Sessions state
    const [sessions] = useState<Session[]>(mockSessions);
    const [revokingSession, setRevokingSession] = useState<string | null>(null);

    // Account deletion state
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Sync logo state with merchant data
    useEffect(() => {
        if (logo && logo.logo_url && logo.logo_id) {
            setOptimisticLogoUrl(logo.logo_url);
            setLogoId(logo.logo_id);
        } else {
            setOptimisticLogoUrl(undefined);
            setLogoId(undefined);
        }
    }, [logo]);

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
            alt: alt || "Logo Preview"
        });
    }, []);

    const handleCloseImagePreview = useCallback(() => {
        setImagePreviewModal({
            isOpen: false,
            imageUrl: "",
            alt: ""
        });
    }, []);

    const handleLogoAdded = (image: PreviewImage): Promise<void> => {
        return new Promise((resolve, reject) => {
            setOptimisticLogoUrl(image.preview);
            
            const uploadNew = () => {
                uploadLogoMutation.mutate(image.file, {
                    onSuccess: async (res) => {
                        // Refetch merchant data to get new logo info
                        await refetch();
                        resolve();
                    },
                    onError: async (err) => {
                        setOptimisticLogoUrl(undefined);
                        setLogoId(undefined);
                        reject(err);
                    }
                });
            };

            if (logoId) {
                // Remove old logo first
                deleteLogoMutation.mutate(logoId, {
                    onSuccess: uploadNew,
                    onError: (err) => {
                        setOptimisticLogoUrl(undefined);
                        setLogoId(undefined);
                        reject(err);
                    }
                });
            } else {
                uploadNew();
            }
        });
    };

    const handleLogoRemoved = (id: string) => {
        if (logoId) {
            deleteLogoMutation.mutate(logoId, {
                onSuccess: async () => {
                    // Refetch merchant data to clear logo info
                    await refetch();
                },
                onError: () => {
                    setOptimisticLogoUrl(undefined);
                    setLogoId(undefined);
                }
            });
        }
    };

    // Password validation
    const validatePassword = () => {
        const errors: Record<string, string> = {};

        if (!passwordData.currentPassword) {
            errors.currentPassword = "Current password is required";
        }

        if (!passwordData.newPassword) {
            errors.newPassword = "New password is required";
        } else if (passwordData.newPassword.length < 8) {
            errors.newPassword = "Password must be at least 8 characters";
        }

        if (!passwordData.confirmPassword) {
            errors.confirmPassword = "Please confirm your new password";
        } else if (passwordData.newPassword !== passwordData.confirmPassword) {
            errors.confirmPassword = "Passwords do not match";
        }

        setPasswordErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Handle password change
    const handlePasswordChange = () => {
        if (validatePassword()) {
            // Mock password change logic
            console.log("Password changed successfully");
            setPasswordData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: ""
            });
            setPasswordErrors({});
            // Here you would typically make an API call
        }
    };

    // Handle resend verification email
    const handleResendVerification = () => {
        setIsResendingVerification(true);
        // Mock API call
        setTimeout(() => {
            setIsResendingVerification(false);
            console.log("Verification email sent");
        }, 2000);
    };

    // Handle session revocation
    const handleRevokeSession = (sessionId: string) => {
        setRevokingSession(sessionId);
        // Mock API call
        setTimeout(() => {
            setRevokingSession(null);
            console.log(`Session ${sessionId} revoked`);
        }, 1000);
    };

    // Handle account deletion
    const handleDeleteAccount = () => {
        setIsDeleting(true);
        // Mock API call
        setTimeout(() => {
            setIsDeleting(false);
            setShowDeleteModal(false);
            console.log("Account deletion initiated");
        }, 2000);
    };

    // Format date helper
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Get device type from user agent
    const getDeviceType = (userAgent: string) => {
        if (userAgent.includes('iPhone') || userAgent.includes('Android')) {
            return 'Mobile';
        } else if (userAgent.includes('iPad')) {
            return 'Tablet';
        } else {
            return 'Desktop';
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto font-regular-eng p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-primary-light flex items-center gap-3">
                    <Shield className="w-8 h-8" />
                    Account Settings
                </h1>
                <p className="text-gray-600 mt-2">Manage your account security and preferences</p>
            </div>

            <div className="space-y-6">
                {/* Logo Upload Section - Only for OWNER */}
                {isOwner && (
                    <div className="bg-white rounded-2xl shadow-md p-6">
                        <h2 className="text-xl font-bold text-primary-light mb-4 flex items-center gap-2">
                            <Image className="w-5 h-5" />
                            Company Logo
                        </h2>
                        
                        <div className="flex flex-col items-center">
                            <ImageUploader
                                frameWidth={200}
                                frameHeight={200}
                                multiple={false}
                                acceptSvg={true}
                                noSizeRestriction={true}
                                onImageAdded={handleLogoAdded}
                                onImageRemoved={handleLogoRemoved}
                                existingImage={optimisticLogoUrl ? [{ 
                                    id: logoId || 'logo', 
                                    file: null as any, 
                                    preview: buildImageUrl(optimisticLogoUrl)
                                }] : []}
                                onImageClick={handleImagePreview}
                            />
                            
                            <p className="text-sm text-gray-500 mt-3 text-center">
                                Upload your company logo. Supports SVG, JPEG, PNG formats.
                            </p>
                        </div>
                    </div>
                )}

                {/* Change Password Section */}
                <div className="bg-white rounded-2xl shadow-md p-6">
                    <h2 className="text-xl font-bold text-primary-light mb-4 flex items-center gap-2">
                        <Lock className="w-5 h-5" />
                        Change Password
                    </h2>
                    
                    <div className="space-y-4">
                        {/* Current Password */}
                        <div>
                            <label className="block font-semibold text-primary-light mb-2">
                                Current Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPasswords.current ? "text" : "password"}
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent ${
                                        passwordErrors.currentPassword ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="Enter current password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                    {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {passwordErrors.currentPassword && (
                                <p className="text-red-500 text-sm mt-1">{passwordErrors.currentPassword}</p>
                            )}
                        </div>

                        {/* New Password */}
                        <div>
                            <label className="block font-semibold text-primary-light mb-2">
                                New Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPasswords.new ? "text" : "password"}
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent ${
                                        passwordErrors.newPassword ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="Enter new password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                    {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {passwordErrors.newPassword && (
                                <p className="text-red-500 text-sm mt-1">{passwordErrors.newPassword}</p>
                            )}
                        </div>

                        {/* Confirm New Password */}
                        <div>
                            <label className="block font-semibold text-primary-light mb-2">
                                Confirm New Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPasswords.confirm ? "text" : "password"}
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent ${
                                        passwordErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="Confirm new password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                    {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {passwordErrors.confirmPassword && (
                                <p className="text-red-500 text-sm mt-1">{passwordErrors.confirmPassword}</p>
                            )}
                        </div>

                        <button
                            onClick={handlePasswordChange}
                            disabled={!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                            className="px-6 py-2 bg-primary-light text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Change Password
                        </button>
                    </div>
                </div>

                {/* Email Verification Section */}
                <div className="bg-white rounded-2xl shadow-md p-6">
                    <h2 className="text-xl font-bold text-primary-light mb-4 flex items-center gap-2">
                        <Mail className="w-5 h-5" />
                        Email Verification
                    </h2>
                    
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="font-semibold text-gray-700">Status:</span>
                            {((user as any).email_verified ?? false) ? (
                                <span className="flex items-center gap-2 text-green-600">
                                    <CheckCircle className="w-5 h-5" />
                                    Verified
                                </span>
                            ) : (
                                <span className="flex items-center gap-2 text-red-600">
                                    <XCircle className="w-5 h-5" />
                                    Unverified
                                </span>
                            )}
                        </div>
                        
                        {!((user as any).email_verified ?? false) && (
                            <button
                                onClick={handleResendVerification}
                                disabled={isResendingVerification}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                            >
                                {isResendingVerification ? "Sending..." : "Resend Verification Email"}
                            </button>
                        )}
                    </div>
                </div>

                {/* Active Sessions Section */}
                <div className="bg-white rounded-2xl shadow-md p-6">
                    <h2 className="text-xl font-bold text-primary-light mb-4 flex items-center gap-2">
                        <Monitor className="w-5 h-5" />
                        Active Sessions
                    </h2>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Device</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">IP Address</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Location</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Last Used</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sessions.map((session) => (
                                    <tr key={session.session_id} className="border-b border-gray-100">
                                        <td className="py-3 px-4">
                                            <div>
                                                <div className="font-medium text-gray-900">
                                                    {getDeviceType(session.user_agent)}
                                                </div>
                                                <div className="text-sm text-gray-500 truncate max-w-xs">
                                                    {session.user_agent}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-gray-700">
                                            {session.ip_address}
                                        </td>
                                        <td className="py-3 px-4 text-gray-700">
                                            {session.location}
                                        </td>
                                        <td className="py-3 px-4 text-gray-700">
                                            {formatDate(session.last_used)}
                                        </td>
                                        <td className="py-3 px-4">
                                            {session.is_current ? (
                                                <span className="text-green-600 text-sm font-medium">Current Session</span>
                                            ) : (
                                                <button
                                                    onClick={() => handleRevokeSession(session.session_id)}
                                                    disabled={revokingSession === session.session_id}
                                                    className="px-3 py-1 text-red-600 border border-red-600 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
                                                >
                                                    {revokingSession === session.session_id ? "Revoking..." : "Revoke"}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Account Deletion Section - Only for OWNER */}
                {isOwner && (
                    <div className="bg-white rounded-2xl shadow-md p-6 border-2 border-red-200">
                        <h2 className="text-xl font-bold text-red-600 mb-4 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" />
                            Account Deletion
                        </h2>
                        
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                                <div>
                                    <h3 className="font-semibold text-red-800 mb-2">Warning: This action cannot be undone</h3>
                                    <p className="text-red-700 text-sm">
                                        Deleting your account will permanently remove all your data, including merchant information, 
                                        branches, and queue history. This action cannot be reversed.
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <button
                            onClick={() => setShowDeleteModal(true)}
                            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete Account
                        </button>
                    </div>
                )}
            </div>

            {/* Image Preview Modal */}
            <ImagePreviewModal
                isOpen={imagePreviewModal.isOpen}
                onClose={handleCloseImagePreview}
                imageUrl={imagePreviewModal.imageUrl}
                alt={imagePreviewModal.alt}
            />

            {/* Account Deletion Confirmation Modal */}
            <ConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDeleteAccount}
                title="Delete Account"
                message="Are you sure you want to delete your account? This action will permanently remove all your data and cannot be undone. You will lose access to all merchant features, branches, and queue history."
                confirmText={isDeleting ? "Deleting..." : "Delete Account"}
                cancelText="Cancel"
                isLoading={isDeleting}
            />
        </div>
    );
};

export default Account;