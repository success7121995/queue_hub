"use client";

import React, { useState } from "react";
import { useMerchant } from "@/hooks/merchant-hooks";
import { useAuth } from "@/hooks/auth-hooks";
import { useRouter } from "next/navigation";
import { LoadingIndicator } from "@/components";
import { ConfirmationModal } from "@/components/common/confirmation-modal";
import { CreditCard, Calendar, DollarSign, RefreshCw, Settings, AlertTriangle, CheckCircle, XCircle, ChevronRight, Shield, Check } from "lucide-react";
import Switch from "@/components/common/switch";

// Mock plan data - in real implementation this would come from API
const PLAN_DATA = {
    TRIAL: {
        name: "Free Trial",
        price: 0,
        features: [
            "Start 30-day trial",
            "Up to 3 branches",
            "Basic queue management",
            "Standard support"
        ],
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200"
    },
    ESSENTIAL: {
        name: "Essential Plan",
        price: 50,
        features: [
            "Perfect for individual shops, restaurants, clinics, and service providers",
            "Up to 5 branches",
            "Advanced queue management",
            "Email notifications",
            "Basic analytics",
            "Priority support"
        ],
        color: "text-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-200"
    },
    GROWTH: {
        name: "Growth Plan",
        price: 75,
        features: [
            "Best for businesses with multiple branches and growing customer volume",
            "Up to 15 branches",
            "Real-time analytics",
            "SMS notifications",
            "Custom branding",
            "API access",
            "24/7 support"
        ],
        color: "text-purple-600",
        bgColor: "bg-purple-50",
        borderColor: "border-purple-200"
    }
};

const Billing = () => {
    const router = useRouter();
    const { data: authData, isLoading: isAuthLoading } = useAuth();
    const user = authData?.user;
    const merchantId = user?.UserMerchant?.merchant_id;

    const { data: merchant } = useMerchant(merchantId as string);

    // State for modals and actions
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showPlanModal, setShowPlanModal] = useState(false);
    const [isUpdatingAutoRenewal, setIsUpdatingAutoRenewal] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);

    // Subscription data
    const subscription = merchant?.merchant.subscription_status;
    const subscriptionEnd = merchant?.merchant.subscription_end;
    const subscriptionStart = merchant?.merchant.subscription_start;
    const autoRenewal = merchant?.merchant.auto_renewal || false;
    const createdAt = merchant?.merchant.created_at;
    const updatedAt = merchant?.merchant.updated_at;

    // Get current plan data
    const currentPlan = PLAN_DATA[subscription as keyof typeof PLAN_DATA] || PLAN_DATA.TRIAL;

    // Mock payment method data
    const paymentMethod = {
        type: "Visa",
        last4: "4242",
        expiry: "12/25",
        isDefault: true
    };

    // Calculate next billing date
    const getNextBillingDate = () => {
        if (!subscriptionEnd) return "N/A";
        const endDate = new Date(subscriptionEnd);
        return endDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Handle auto-renewal toggle
    const handleAutoRenewalToggle = async () => {
        setIsUpdatingAutoRenewal(true);
        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsUpdatingAutoRenewal(false);
        // In real implementation, this would update the merchant data
    };

    // Handle subscription cancellation
    const handleCancelSubscription = async () => {
        setIsCancelling(true);
        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsCancelling(false);
        setShowCancelModal(false);
        // In real implementation, this would update the merchant data  
    };

    // Format date helper
    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (isAuthLoading) {
        return <LoadingIndicator fullScreen={true} text="Loading Billing..." />;
    }

    if (!merchant) {
        router.push("/404");
        return null;
    }

    return (
        <div className="w-full max-w-4xl mx-auto font-regular-eng p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-primary-light flex items-center gap-3">
                    <CreditCard className="w-8 h-8" />
                    Billing & Subscription
                </h1>
                <p className="text-gray-600 mt-2">Manage your subscription, payment methods, and billing preferences</p>
            </div>

            <div className="space-y-6">
                {/* Current Plan Section */}
                <div className="bg-white rounded-2xl shadow-md p-6">
                    <h2 className="text-xl font-bold text-primary-light mb-4 flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        Current Plan
                    </h2>
                    
                    <div className={`p-4 rounded-lg border ${currentPlan.bgColor} ${currentPlan.borderColor}`}>
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className={`text-lg font-bold ${currentPlan.color}`}>
                                    {currentPlan.name}
                                </h3>
                                <p className="text-gray-600">
                                    ${currentPlan.price}/month
                                </p>
                            </div>
                            <div className="text-right">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${currentPlan.bgColor} ${currentPlan.color}`}>
                                    {subscription === "TRIAL" ? "Trial" : "Active"}
                                </span>
                            </div>
                        </div>
                        
                        <div className="mb-4">
                            <h4 className="font-semibold text-gray-700 mb-2">Plan Features:</h4>
                            <ul className="space-y-1">
                                {currentPlan.features.map((feature, index) => (
                                    <li key={index} className="flex items-center gap-2 text-base text-gray-600 my-2">
                                        <Check className="w-6 h-6 mt-1 text-primary flex-shrink-0" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        
                        <button
                            onClick={() => setShowPlanModal(true)}
                            className="px-4 py-2 bg-primary-light text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2"
                        >
                            <Settings className="w-4 h-4" />
                            Change Plan
                        </button>
                    </div>
                </div>

                {/* Billing Information Section */}
                <div className="bg-white rounded-2xl shadow-md p-6">
                    <h2 className="text-xl font-bold text-primary-light mb-4 flex items-center gap-2">
                        <DollarSign className="w-5 h-5" />
                        Billing Information
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Next Billing */}
                        <div className="p-4 border border-gray-200 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <Calendar className="w-5 h-5 text-gray-500" />
                                <span className="font-semibold text-gray-700">Next Billing Date</span>
                            </div>
                            <p className="text-lg font-medium text-gray-900">
                                {getNextBillingDate()}
                            </p>
                        </div>

                        {/* Billing Amount */}
                        <div className="p-4 border border-gray-200 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <DollarSign className="w-5 h-5 text-gray-500" />
                                <span className="font-semibold text-gray-700">Billing Amount</span>
                            </div>
                            <p className="text-lg font-medium text-gray-900">
                                ${currentPlan.price}/month
                            </p>
                        </div>

                        {/* Payment Method */}
                        <div className="p-4 border border-gray-200 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <CreditCard className="w-5 h-5 text-gray-500" />
                                <span className="font-semibold text-gray-700">Payment Method</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-5 bg-blue-600 rounded flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">V</span>
                                </div>
                                <span className="text-gray-900">
                                    •••• •••• •••• {paymentMethod.last4}
                                </span>
                                {paymentMethod.isDefault && (
                                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                        Default
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                                Expires {paymentMethod.expiry}
                            </p>
                        </div>

                        {/* Auto-Renewal Status */}
                        <div className="p-4 border border-gray-200 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <RefreshCw className="w-5 h-5 text-gray-500" />
                                <span className="font-semibold text-gray-700">Auto-Renewal</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`text-sm font-medium ${autoRenewal ? 'text-green-600' : 'text-red-600'}`}>
                                    {autoRenewal ? 'Enabled' : 'Disabled'}
                                </span>
                                <Switch
                                    checked={autoRenewal}
                                    onCheckedChange={handleAutoRenewalToggle}
                                    disabled={isUpdatingAutoRenewal}
                                    aria-label="Toggle auto-renewal"
                                />
                                {isUpdatingAutoRenewal && (
                                    <span className="text-sm text-gray-500">Updating...</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Subscription Details Section */}
                <div className="bg-white rounded-2xl shadow-md p-6">
                    <h2 className="text-xl font-bold text-primary-light mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        Subscription Details
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block font-semibold text-primary-light mb-2">Subscription Start</label>
                            <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-700">
                                {formatDate(subscriptionStart?.toString() || '')}
                            </div>
                        </div>
                        
                        <div>
                            <label className="block font-semibold text-primary-light mb-2">Subscription End</label>
                            <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-700">
                                {formatDate(subscriptionEnd?.toString() || '')}
                            </div>
                        </div>
                        
                        <div>
                            <label className="block font-semibold text-primary-light mb-2">Account Created</label>
                            <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-700">
                                {formatDate(createdAt?.toString() || '')}
                            </div>
                        </div>
                        
                        <div>
                            <label className="block font-semibold text-primary-light mb-2">Last Updated</label>
                            <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-700">
                                {formatDate(updatedAt?.toString() || '')}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Danger Zone Section */}
                <div className="bg-white rounded-2xl shadow-md p-6 border-2 border-red-200">
                    <h2 className="text-xl font-bold text-red-600 mb-4 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" />
                        Danger Zone
                    </h2>
                    
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <h3 className="font-semibold text-red-800 mb-2">Cancel Subscription</h3>
                                <p className="text-red-700 text-sm">
                                    Canceling your subscription will immediately downgrade your account to the free tier. 
                                    You'll lose access to premium features and your data may be affected.
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <button
                        onClick={() => setShowCancelModal(true)}
                        className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                    >
                        <XCircle className="w-4 h-4" />
                        Cancel Subscription
                    </button>
                </div>
            </div>

            {/* Plan Change Modal */}
            {showPlanModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-primary-light">Change Plan</h2>
                            <button
                                onClick={() => setShowPlanModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.entries(PLAN_DATA).map(([key, plan]) => (
                                <div
                                    key={key}
                                    className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                                        subscription === key
                                            ? `${plan.borderColor} ${plan.bgColor}`
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className={`font-bold ${plan.color}`}>{plan.name}</h3>
                                        {subscription === key && (
                                            <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                                                Current
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-2xl font-bold text-gray-900 mb-3">
                                        ${plan.price}
                                        <span className="text-sm font-normal text-gray-500">/month</span>
                                    </p>
                                    <ul className="space-y-1 mb-4">
                                        {plan.features.slice(0, 3).map((feature, index) => (
                                            <li key={index} className="flex items-center gap-2 text-base text-gray-600 my-2">
                                                <Check className="w-6 h-6 mt-1 text-primary flex-shrink-0" />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <button
                                        className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                                            subscription === key
                                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                : 'bg-primary-light text-white hover:bg-primary-dark'
                                        }`}
                                        disabled={subscription === key}
                                    >
                                        {subscription === key ? 'Current Plan' : 'Select Plan'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Cancel Subscription Confirmation Modal */}
            <ConfirmationModal
                isOpen={showCancelModal}
                onClose={() => setShowCancelModal(false)}
                onConfirm={handleCancelSubscription}
                title="Cancel Subscription"
                message="Are you sure you want to cancel your subscription? This action will immediately downgrade your account to the free tier and you'll lose access to all premium features. This action cannot be undone."
                confirmText={isCancelling ? "Cancelling..." : "Cancel Subscription"}
                cancelText="Keep Subscription"
                isLoading={isCancelling}
            />
        </div>
    );
};

export default Billing;