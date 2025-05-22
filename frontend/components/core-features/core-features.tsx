"use client"

import FeatureBlock, { type FeatureBlockProps } from "./feature-block";
import { CheckCircle } from 'lucide-react';
import Image from "next/image";

const CoreFeatures = () => {
        const features: FeatureBlockProps[] = [
            {
                title: "Real-time Updates",
                bullets: [
                "Track customer flow live with auto-updating queue entries",
                "Mark customers as “serving” “done” or “no-show”",
                "Instantly reorder or remove entries in critical cases",
                "Synchronize actions across all devices — no refresh needed",
                "Customers see updates in real-time, reducing uncertainty",
                "Prevent front desk overload during peak hours"
                ]
            },
            {
                title: "Smart Notifications & Queue Reminders",
                bullets: [
                "Customers are notified before their turn, minimizing no-shows",
                "Set buffer timing (e.g. 5 mins before turn) to optimize arrivals",
                "Staff can trigger urgent or custom notifications",
                "QueueHub learns user patterns to fine-tune reminder timing",
                "Quiet hours and holiday settings available for flexibility",
                "Merchants can monitor which users opened or ignored alerts"
                ]
            },
            {
                title: "Multi-Role & Team Access Control",
                bullets: [
                "Define Owner, Manager, and Frontline roles with specific permissions",
                "Prevent accidental queue overrides by restricting critical actions",
                "Managers can oversee queues without full admin access",
                "Frontline staff get a simple, distraction-free interface",
                "Add or remove team members on demand",
                "Track actions by role for audit and accountability"
                ]
            },
            {
                title: "Analytics & Feedback Dashboard",
                bullets: [
                "Monitor daily queue volume and average wait times",
                "Track no-show rates and customer return patterns",
                "View busiest hours and staff response efficiency",
                "Export performance reports",
                "Filter insights by staff, location, or time period",
                "Collect customer reviews and flag repeated issues"
                ],
                image: "/images/analytics-and-feedback-dashboard.png",
                imageAlt: "Analytics & Feedback Dashboard",
                imageWidth: 500,
                imageHeight: 500
            },
            {
                title: "Mobile-Friendly & Cross-Device Access (Merchant Web Dashboard)",
                bullets: [
                "Web dashboard is fully responsive and works on phones, tablets, and desktops",
                "Merchants and staff can log in on multiple devices simultaneously",
                "No app download required — web-based control for all operations",
                "Optimized layout for touch devices (iPad, Android tablets, etc.)",
                "Queue management tools are accessible even on-the-go via browser",
                "Mobile app is customer-facing only — used for joining queues and discovering merchants"
                ]
            },
            {
                title: "2FA Secure Login & Access Control",
                bullets: [
                "All staff logins secured with optional Two-Factor Authentication",
                "Time-limited sessions and auto-expiry for sensitive accounts",
                "Role-based access ensures least-privilege by default",
                "Logs of all login activities for traceability",
                "Secure password reset flow with email verification",
                "Internal admin accounts have test-only sandbox mode"
                ]
            }
    ];

    return (
        <section className=" mt-20 pt-10 font-regular-eng">
            <h1 className="text-3xl font-bold text-center">Core Features</h1>
            <div className="w-[70%] mx-auto max-w-[1200px]">
                {features.map((feature, index) => (
                    <FeatureBlock key={index} feature={feature} imageLeft={index % 2 === 0} index={index} />
                ))}
            </div>
        </section>
    );
};

export default CoreFeatures;
