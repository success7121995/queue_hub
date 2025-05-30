"use client"

import Image from "next/image";
import { Merchant } from "@/types/merchant";

interface BranchCardProps {
	branch: Merchant;
	idx: number;
	onReadMore: (idx: number) => void;
}

const BranchCard = ({ branch, idx, onReadMore }: BranchCardProps) => (
	<div className="rounded-2xl shadow-lg bg-white overflow-hidden max-w-xl w-full mb-8 h-full">
		{/* Top image section with overlay */}
		<div className="relative h-40 w-full">
			{branch.featureImage ? (
				<Image
					src={branch.featureImage}
					alt="branch-features"
					fill
					className="object-cover w-full h-full"
				/>
			) : null}
			{/* Gradient overlay */}
			<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

			{/* Overlayed text */}
			<div className="absolute bottom-4 left-4">
				<div className="text-white text-lg font-bold drop-shadow-md">{branch.name}</div>
				<div className="text-white text-sm font-semibold drop-shadow-md">{branch.address}</div>
			</div>
		</div>
		{/* Card body */}
		<div className="p-5 pb-3">
			<div className="text-base font-bold mb-1">{branch.user.username}</div>
			<div className="italic text-sm text-gray-700 mb-1">{branch.user.email}</div>
			<div className="text-sm text-gray-700 mb-1">{branch.user.profile?.position}</div>
			<div className="text-xs text-gray-500 mb-1">Subscription: <span className="font-semibold text-gray-700">{branch.subscription}</span></div>
			<div className="text-xs text-gray-500 mb-1">Auto Renewal: <span className="font-semibold text-gray-700">{branch.autoRenewal}</span></div>
			<div className="text-xs text-gray-500 mb-2">Registration Date: <span className="font-semibold text-gray-700">{branch.registrationDate}</span></div>
			<div className="text-sm text-gray-800 mb-2">{branch.description}</div>
		</div>
		{/* Footer */}
		<div className="flex items-center justify-between px-5 pb-4">
			<button className="rounded-full border border-gray-300 px-4 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition" onClick={() => onReadMore(idx)}>READ MORE</button>
			<div className="flex gap-3 text-gray-400">
				{/* <FaShareAlt className="w-4 h-4 cursor-pointer hover:text-gray-600" />
				<FaRegBookmark className="w-4 h-4 cursor-pointer hover:text-gray-600" /> */}
			</div>
		</div>
	</div>
);

export default BranchCard;