"use client"

import { Check } from 'lucide-react';
import Image from "next/image";
export interface FeatureBlockProps {
    title: string;
    bullets: string[];
    image?: string;
    imageAlt?: string;
    imageWidth?: number;
    imageHeight?: number;
    href?: string;
}

const FeatureBlock = ({
    feature,
    imageLeft,
    index
}: {
    feature: FeatureBlockProps;
    imageLeft: boolean;
    index: number;
}) => {
    const ImageComponent = (
        <div className="image w-[250px] h-[250px] lg:w-[500px] lg:h-[500px] flex-shrink-0 flex items-center justify-center">
            {/* Placeholder for image */}
            {feature.image ? (
                <Image src={feature.image || ""} alt={feature.imageAlt || ""} width={feature.imageWidth || 500} height={feature.imageHeight || 500} />
            ) : (
                <span className="text-gray-500">[Image {index + 1}]</span>
            )}
        </div>
    );

    const TextComponent = (
        <div className={`text w-full ${imageLeft ? 'md:pl-12' : 'md:pr-12'} mt-8 md:mt-0  text-text-main`}>
            <h2 className="text-2xl font-bold mb-4">{feature.title}</h2>
            <ul className="list-inside space-y-2">

                {feature.bullets.map((bullet, i) => (
                    <li key={i} className="flex items-center space-x-2 my-3">
                        <Check className="w-6 h-6 mt-1 text-primary flex-shrink-0" />
                        <span className="text-lg">{bullet}</span>
                    </li>
                ))}
                
            </ul>

            {/* Button */}
            <div className="mt-10">
                <a href={feature.href} className="bg-primary text-white px-4 py-3 rounded-md font-bold cursor-pointer">
                    Learn More
                </a>
            </div>
        </div>
    );

    return (
        <section className="feature-section flex flex-col md:flex-row items-center my-16">
            {imageLeft ? (
                <>
                    {ImageComponent}
                    {TextComponent}
                </>
            ) : (
                <>
                    {/* Reverse order on mobile but restore on desktop */}
                    <div className="order-2 md:order-1">{TextComponent}</div>
                    <div className="order-1 md:order-2">{ImageComponent}</div>
                </>
            )}
        </section>
    );
};

export default FeatureBlock;