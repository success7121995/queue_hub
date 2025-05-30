"use client"

import { UserCheck } from "lucide-react";

interface NumberCardProps {
    title: string;
    value: number;
    color?: string;
    unit?: string;
    icon?: React.ReactNode;
}

const NumberCard = ({
    title,
    value,
    color = "orange",
    icon = <UserCheck size={32} className="text-primary-light" />,
    unit = ""
}: NumberCardProps) => {
    return (
        <div className={`flex items-center bg-gradient-to-r from-${color}-50 to-${color}-100 rounded-xl p-5 shadow-sm w-full md:w-[300px] min-h-[100px]`}>
            <div className={`flex items-center justify-center w-14 h-14 rounded-full bg-${color}-200 mr-4`}>
                {icon}
            </div>
            
            <div>
                <div className="text-4xl font-bold text-primary-light">{value} {unit}</div>
                <div className="text-sm font-semibold text-primary-light mt-1">{title}</div>
            </div>
        </div>
    )
}

export default NumberCard;