"use client";

import Link from 'next/link';
import { Check } from 'lucide-react';
import { CrownSVG } from '@/svg';
import Cookies from 'js-cookie';  // 記得裝：npm i js-cookie
import { useRouter } from 'next/navigation';

interface PricingCardProps {
  title: string;
  highlight: boolean;
  price: string;
  priceNote: string;
  features: string[];
  button: string;
  buttonLink: string;
  planKey: string;  // 用來存plan識別字
}

const PricingHorizonCards = () => {
  const router = useRouter();

  const plans: PricingCardProps[] = [
    {
      title: "Free Trial",
      highlight: false,
      price: "Try QueueHub Free for 7 days",
      priceNote: "",
      features: [
        "Full access to all features",
        "No credit card required",
        "Cancel anytime",
      ],
      button: "Start Free Trial",
      buttonLink: "/signup",
      planKey: "free",
    },
    {
      title: "Essential Plan",
      highlight: true,
      price: "50 USD / per month",
      priceNote: "Perfect for individual shops, restaurants, clinics, and service providers.",
      features: [
        "1 Location",
        "Unlimited queues",
        "Unlimited team members",
        "Real-time queue updates",
        "Smart customer notification",
        "Full access to analytics",
        "Custom branding",
        "Email & chat support",
        "Full web dashboard access",
      ],
      button: "Subscribe",
      buttonLink: "/signup",
      planKey: "essential",
    },
    {
      title: "Growth Plan",
      highlight: false,
      price: "75 USD / per month",
      priceNote: "Best for businesses with multiple branches and growing customer volume.",
      features: [
        "3 locations included",
        "All features from Essential Plan",
        "Centralized dashboard for multi-location management",
        "Cross-branch analytics",
        "Role-based access control",
        "Priority customer support",
        "Early access to new features",
        "Onboarding assistance",
      ],
      button: "Subscribe",
      buttonLink: "/signup",
      planKey: "growth",
    },
  ];

  // 用於設定cookie再跳轉
  const handleSelectPlan = (planKey: string, link: string) => {
    Cookies.set("signupData", JSON.stringify({ plan: planKey }), { expires: 7 });
    router.push(link);
  };

  return (
    <section id="pricing" className="mt-20 py-10 font-regular-eng max-w-[1200px] mx-auto">
      <h1 className="text-3xl font-bold text-center my-10 font-regular-eng">Pricing</h1>
      <div className="flex flex-col lg:flex-row justify-center items-stretch gap-8 px-4">
        {plans.map((plan) => (
          <div
            key={plan.title}
            className={`relative bg-white border-2 border-gray-200 rounded-2xl p-8 flex flex-col items-center min-w-[300px] max-w-[350px] mx-auto
            ${plan.highlight ? "shadow-lg z-10 scale-105" : ""}
          `}
          >
            {plan.highlight && (
              <div className="absolute -top-11 -left-10 -rotate-40">
                <CrownSVG width={80} height={80} />
              </div>
            )}
            <div className="text-xl font-bold text-center mb-2 mt-2 font-italic-eng text-primary">{plan.title}</div>
            {plan.priceNote && (
              <div className="text-xs text-center mb-2 text-gray-600">{plan.priceNote}</div>
            )}
            <div className="text-2xl font-bold text-center my-2">{plan.price}</div>
            <ul className="text-left text-sm mb-6 mt-2 space-y-1">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-center space-x-2 my-3">
                  <Check className="w-6 h-6 mt-1 text-primary flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            {/* 按鈕用 onClick 代替 Link 預先set cookie */}
            <button
              onClick={() => handleSelectPlan(plan.planKey, plan.buttonLink)}
              className="mt-auto border-2 border-text-main rounded px-4 py-2 text-base text-text-main font-semibold font-regular-eng hover:bg-text-main hover:text-text-light transition-all duration-300 cursor-pointer"
            >
              {plan.button}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PricingHorizonCards;
