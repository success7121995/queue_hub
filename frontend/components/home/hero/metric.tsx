"use client";

import { motion, useAnimation } from "framer-motion";
import CountUp from "react-countup";
import { useEffect, useRef, useState } from "react";

export interface MetricProps {
    value: number;
    suffix?: string;
    label: string;
    tooltip: string;
    color?: string;
    labelColor?: string;
}

const Metric = ({ value, suffix = "", label, tooltip, color, labelColor }: MetricProps) => {
const ref = useRef<HTMLDivElement>(null);
const controls = useAnimation();
const [showTooltip, setShowTooltip] = useState(false);

useEffect(() => {
    const handleScroll = () => {
        if (!ref.current) return;
        
        const rect = ref.current.getBoundingClientRect();

        if (rect.top < window.innerHeight && rect.bottom > 0) {
            controls.start({ scale: 1.1, color: color || "var(--color-primary)" });
        } else {
            controls.start({ scale: 1, color: labelColor || "var(--color-text-main)" });
        }
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
    }, [controls, color]);

    return (
    <motion.div
        ref={ref}
        className="flex flex-col items-center relative cursor-pointer"
        initial={{ scale: 1, color: labelColor || "var(--color-text-main)" }}
        animate={controls}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
    >
            <span className="text-2xl font-bold select-none">
                <CountUp end={value} duration={2} />{suffix}
            </span>
            <span className="text-xs mt-1" style={{ color: labelColor || "var(--color-text-main)" }}>{label}</span>
            
            {showTooltip && (
            <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-white border border-gray-200 rounded shadow px-3 py-1 text-xs z-10 min-w-[150px]">
                {tooltip}
            </div>
        )}
    </motion.div>
    );
};

export default Metric;