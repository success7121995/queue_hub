"use client";

import Metric, { MetricProps } from "./metric";
import Image from "next/image";

const Hero = () => {
    const metrics: MetricProps[] = [
        {
            value: 15000,
            suffix: "+",
            label: "Queues Managed",
            tooltip: "Total queues managed by QueueHub clients.",
            labelColor: "var(--color-text-main)",
        },
        {
            value: 98,
            suffix: "%",
            label: "Customer Satisfaction",
            tooltip: "Average customer satisfaction rate.",
            labelColor: "var(--color-text-main)",
        },
        {
            value: 500,
            suffix: "+",
            label: "Active Businesses",
            tooltip: "Businesses actively using QueueHub.",
            labelColor: "var(--color-text-main)",
        },
    ];

    return (
        <div className="w-full">
            {/* Hero section with backdrop image */}
            <div className="relative w-full h-[500px] flex items-center justify-center overflow-hidden">
                {/* Backdrop Image */}
                <img
                    src="/images/hero-bg.png"
                    alt="Backdrop"
                    className="absolute inset-0 w-full h-full object-cover z-0"
                />
                {/* Dark Overlay */}
                <div className="absolute inset-0 bg-black/65 z-10" />

                {/* Content */}
                <div className="relative z-20 flex flex-col items-center text-text-light px-4 text-center">
                    <h1 className="text-4xl leading-snug md:text-5xl">
                        No More Waiting. Queue Smarter with <br />
                        <span className="italic font-bold text-5xl text-orange-400">Queue</span>
                        <span className="italic font-bold text-5xl text-text-light">Hub</span>
                    </h1>
                    <p className="mt-4 text-md max-w-[400px] text-gray-200">
                        QueueHub is a platform that helps you manage your queues smarter.
                    </p>
                    <a
                        href="#"
                        className="mt-8 bg-transparent text-primary px-5 py-2 rounded-md border-2 border-primary hover:bg-primary hover:text-text-light font-semibold transition-all duration-300"
                    >
                        Get Started
                    </a>
                </div>
            </div>

            {/* Metrics Section */}
            <div className="flex justify-center gap-16 mt-24 px-4">
                {metrics.map((metric, index) => (
                    <Metric
                        key={index}
                        value={metric.value}
                        suffix={metric.suffix}
                        label={metric.label}
                        tooltip={metric.tooltip}
                        labelColor={metric.labelColor}
                    />
                ))}
            </div>
        </div>
    );
};

export default Hero;
