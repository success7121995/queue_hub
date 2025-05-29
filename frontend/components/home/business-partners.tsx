"use client"

import Image from "next/image";

interface PartnerProps {
    name: string;
    image?: string;
    imageAlt?: string;
}

const BusinessPartners = () => {
    const partners: PartnerProps[] = [
        {
            name: "Restaurant & Cafe",
            image: "",
            imageAlt: "restaurant-and-cafe"
        },
        {   
            name: "Retail & Service Counter",
            image: "",
            imageAlt: "retail-and-service-counter"
        },
        {
            name: "Clinics & Healthcare",
            image: "",
            imageAlt: "clinics-and-healthcare"
        },
        {
            name: "Government & Public Services",
            image: "",
            imageAlt: "government-and-public-services"
        },
        {
            name: "Wellness & Lifestyle",
            image: "",
            imageAlt: "wellness-and-lifestyle"
        },
        {
            name: "Banks & Financial Services",
            image: "",
            imageAlt: "banks-and-financial-services"
        }
    ]


    return (
        <section className="bg-surface mt-20 py-10 font-regular-eng">
            <h1 className="text-3xl font-bold text-center">We Help Businesses Like Yours</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-16 gap-x-8 max-w-5xl mx-auto mt-12">
            {partners.map((partner) => (
                <div key={partner.name} className="flex flex-col items-center">
                    {/* Placeholder image */}
                    <div className="w-40 h-40 bg-gray-200 rounded-md flex items-center justify-center border border-gray-300">

                        {partner.image ? (
                            <Image src={partner.image} alt={partner.imageAlt || ""} width={160} height={160} />
                        ) : (
                            <>
                                {/* X icon for placeholder */}
                                <svg width="64" height="64" viewBox="0 0 64 64" className="text-gray-400">
                                    <rect width="64" height="64" fill="none"/>
                                    <line x1="16" y1="16" x2="48" y2="48" stroke="gray" strokeWidth="2"/>
                                    <line x1="48" y1="16" x2="16" y2="48" stroke="gray" strokeWidth="2"/>
                                </svg>
                            </>
                        )}
                    </div>
                    {/* Label */}
                    <span className="mt-4 text-center text-base font-italic-eng">{partner.name}</span>
                </div>
            ))}
        </div>
        </section>
    )
}

export default BusinessPartners;