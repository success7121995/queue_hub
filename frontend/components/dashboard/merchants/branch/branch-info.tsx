"use client";

import React, { useState } from "react";
import { CirclePlus } from "lucide-react";
import { BranchDetail, BranchCard } from "@/components";
import { Merchant } from "@/types/merchant";
import Link from "next/link";

const branches: Merchant[] = [
	{
	  merchantId: 1,
	  name: "Kowloon Branch",
	  user: {
		id: 1,
		username: "kowloon.manager",
		email: "kowloon.manager@queuehub.com",
		profile: {
			id: 1,
			position: "Manager",
			phone: "+852 1234 5678",
			address: "123 Kowloon, Hong Kong",
			createdAt: new Date("2023-01-15"),
			updatedAt: new Date("2023-01-15")
		},
		createdAt: new Date("2023-01-15"),
		updatedAt: new Date("2023-01-15"),
	  },
	  subscription: "Active",
	  subscriptionStartDate: "2023-01-15",
	  subscriptionEndDate: "2024-01-15",
	  autoRenewal: true,
	  registrationDate: "2023-01-15",
	  description: "Located in the heart of Kowloon, this branch offers express and reserved queueing services for up to 8 persons.",
	  tags: [
		{ tagId: 1, tagName: "Reserved", createdAt: new Date("2023-01-15"), updatedAt: new Date("2023-01-15") },
		{ tagId: 2, tagName: "Express", createdAt: new Date("2023-01-15"), updatedAt: new Date("2023-01-15") },
		{ tagId: 3, tagName: "5-8 Persons", createdAt: new Date("2023-01-15"), updatedAt: new Date("2023-01-15") }
	  ],
	  features: [
		{ id: 1, featureId: 1, value: "Pet-Friendly", createdAt: new Date("2023-01-15"), updatedAt: new Date("2023-01-15") },
		{ id: 2, featureId: 2, value: "Non-Smoking Area", createdAt: new Date("2023-01-15"), updatedAt: new Date("2023-01-15") },
		{ id: 3, featureId: 3, value: "Wheelchair Accessible", createdAt: new Date("2023-01-15"), updatedAt: new Date("2023-01-15") },
		{ id: 4, featureId: 4, value: "Wifi", createdAt: new Date("2023-01-15"), updatedAt: new Date("2023-01-15") }
	  ],
	  openingHours: [
		{ id: 1, dayOfWeek: 1, openTime: "09:00", closeTime: "18:00" },
		{ id: 2, dayOfWeek: 2, openTime: "09:00", closeTime: "18:00" },
		{ id: 3, dayOfWeek: 3, openTime: "09:00", closeTime: "18:00" },
		{ id: 4, dayOfWeek: 4, openTime: "09:00", closeTime: "18:00" },
		{ id: 5, dayOfWeek: 5, openTime: "09:00", closeTime: "18:00" },
		{ id: 6, dayOfWeek: 6, openTime: "09:00", closeTime: "18:00" },
		{ id: 7, dayOfWeek: 7, openTime: "09:00", closeTime: "18:00" },
		{ id: 8, dayOfWeek: 8, openTime: "09:00", closeTime: "18:00" }
	  ],
	  galleries: [
		// { id: 1, imageUrl: "/images/kowloon-gallery-1.jpg", createdAt: "2023-01-15", updatedAt: "2023-01-15" },
		// { id: 2, imageUrl: "/images/kowloon-gallery-2.jpg", createdAt: "2023-01-15", updatedAt: "2023-01-15" }
	  ],
	  createdAt: new Date("2023-01-15"),
	  updatedAt: new Date("2023-01-15")
	},
	{
	  merchantId: 2,
	  name: "Central Branch",
	  address: "88 Queen's Road Central, Central, Hong Kong",
	  subscription: "Active",
	  subscriptionStartDate: "2023-01-15",
	  subscriptionEndDate: "2024-01-15",
	  autoRenewal: false,
	  registrationDate: "2022-11-20",
	  description: "Central branch is known for its non-smoking area and pet-friendly environment, perfect for families.",
	  tags: [
		{ tagId: 4, tagName: "Family", createdAt: new Date("2023-01-15"), updatedAt: new Date("2023-01-15") },
		{ tagId: 5, tagName: "Non-Smoking", createdAt: new Date("2023-01-15"), updatedAt: new Date("2023-01-15") }
	  ],
	  features: [
		{ id: 1, featureId: 1, value: "Pet-Friendly", createdAt: new Date("2023-01-15"), updatedAt: new Date("2023-01-15") },
		{ id: 2, featureId: 2, value: "Non-Smoking Area", createdAt: new Date("2023-01-15"), updatedAt: new Date("2023-01-15") },
		{ id: 3, featureId: 3, value: "Wheelchair Accessible", createdAt: new Date("2023-01-15"), updatedAt: new Date("2023-01-15") },
		{ id: 4, featureId: 4, value: "Wifi", createdAt: new Date("2023-01-15"), updatedAt: new Date("2023-01-15") }
	  ],
	  openingHours: [
		{ id: 1, dayOfWeek: 1, openTime: "10:00", closeTime: "19:00", closed: false },
		{ id: 2, dayOfWeek: 2, openTime: "10:00", closeTime: "19:00", closed: false },
		{ id: 3, dayOfWeek: 3, openTime: "10:00", closeTime: "19:00", closed: false },
		{ id: 4, dayOfWeek: 4, openTime: "10:00", closeTime: "19:00", closed: false },
		{ id: 5, dayOfWeek: 5, openTime: "10:00", closeTime: "19:00", closed: false },
		{ id: 6, dayOfWeek: 6, openTime: "10:00", closeTime: "17:00", closed: false },
		// { id: 7, dayOfWeek: 7, openTime: "Closed", closeTime: "Closed", closed: true },
		// { id: 8, dayOfWeek: 8, openTime: "Closed", closeTime: "Closed", closed: true }
	  ],
	  galleries: [
		// { id: 1, imageUrl: "/images/central-gallery-1.jpg", createdAt: "2023-01-15", updatedAt: "2023-01-15" }
	  ],
	  createdAt: new Date("2023-01-15"),
	  updatedAt: new Date("2023-01-15"),
	  user: {
		id: 1,
		username: "central.manager",
		email: "central.manager@queuehub.com",
		profile: {
			id: 1,
			position: "Manager",
			phone: "+852 1234 5678",
			address: "123 Kowloon, Hong Kong",
			createdAt: new Date("2023-01-15"),
			updatedAt: new Date("2023-01-15")
		},
		createdAt: new Date("2023-01-15"),
		updatedAt: new Date("2023-01-15")
	  }
	},
	{
	  merchantId: 3,
	  name: "Tsim Sha Tsui Branch",
	  address: "20 Salisbury Road, Tsim Sha Tsui, Hong Kong",
	  subscription: "Inactive",
	  subscriptionStartDate: "2023-01-15",
	  subscriptionEndDate: "2024-01-15",
	  autoRenewal: false,
	  registrationDate: "2023-03-10",
	  description: "Tsim Sha Tsui branch offers express queueing and is wheelchair accessible.",
	  tags: [
		{ tagId: 6, tagName: "Express", createdAt: new Date("2023-01-15"), updatedAt: new Date("2023-01-15") },
		{ tagId: 7, tagName: "Wheelchair", createdAt: new Date("2023-01-15"), updatedAt: new Date("2023-01-15") }
	  ],
	  features: [
		{ id: 1, featureId: 1, value: "Pet-Friendly", createdAt: new Date("2023-01-15"), updatedAt: new Date("2023-01-15") },
		{ id: 2, featureId: 2, value: "Non-Smoking Area", createdAt: new Date("2023-01-15"), updatedAt: new Date("2023-01-15") },
		{ id: 3, featureId: 3, value: "Wheelchair Accessible", createdAt: new Date("2023-01-15"), updatedAt: new Date("2023-01-15") },
		{ id: 4, featureId: 4, value: "Wifi", createdAt: new Date("2023-01-15"), updatedAt: new Date("2023-01-15") }
	  ],
	  openingHours: [
		{ id: 1, dayOfWeek: 1, openTime: "08:00", closeTime: "17:00", closed: false },
		{ id: 2, dayOfWeek: 2, openTime: "08:00", closeTime: "17:00", closed: false },
		{ id: 3, dayOfWeek: 3, openTime: "08:00", closeTime: "17:00", closed: false },
		{ id: 4, dayOfWeek: 4, openTime: "08:00", closeTime: "17:00", closed: false },
		{ id: 5, dayOfWeek: 5, openTime: "08:00", closeTime: "17:00", closed: false },
		{ id: 6, dayOfWeek: 6, openTime: "09:00", closeTime: "13:00", closed: false },
		// { id: 7, dayOfWeek: 7, openTime: "09:00", closeTime: "13:00", closed: false },
		// { id: 8, dayOfWeek: 8, openTime: "09:00", closeTime: "13:00", closed: false }
	  ],
	  galleries: [
		// { id: 1, imageUrl: "/images/tst-gallery-1.jpg", createdAt: "2023-01-15", updatedAt: "2023-01-15" },
		// { id: 2, imageUrl: "/images/tst-gallery-2.jpg", createdAt: "2023-01-15", updatedAt: "2023-01-15" },
		// { id: 3, imageUrl: "/images/tst-gallery-3.jpg", createdAt: "2023-01-15", updatedAt: "2023-01-15" }
	  ],
	  createdAt: new Date("2023-01-15"),
	  updatedAt: new Date("2023-01-15"),
	  user: {
		id: 1,
		username: "tst.manager",
		email: "tst.manager@queuehub.com",
		profile: {
			id: 1,
			position: "Manager",
			phone: "+852 1234 5678",
			address: "123 Kowloon, Hong Kong",
			createdAt: new Date("2023-01-15"),
			updatedAt: new Date("2023-01-15")
		},
		createdAt: new Date("2023-01-15"),
		updatedAt: new Date("2023-01-15")
	  }
	}
];

const BranchInfo = () => {
	const [selectedBranchIdx, setSelectedBranchIdx] = useState<number | null>(null);
	const [branchList, setBranchList] = useState(branches);

	const handleReadMore = (idx: number) => {
		setSelectedBranchIdx(idx);
	};

	const handleCloseDetail = () => {
		setSelectedBranchIdx(null);
	};

	const handleSaveDetail = (updatedBranch: any) => {
		setBranchList((prev) =>
			prev.map((b, i) => (i === selectedBranchIdx ? updatedBranch : b))
		);
		handleCloseDetail();
	};

	return (
		<div className="min-h-screen px-8 py-8 font-regular-eng">
			<h1 className="text-3xl mb-8 text-primary-light font-bold">Branch Info</h1>

			{selectedBranchIdx === null ? (
				<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 items-center w-full">
					<Link href="/dashboard/1/add-branch" className="flex flex-col items-center justify-center max-w-xl cursor-pointer my-32">
						<CirclePlus className="w-10 h-10 text-primary-light" />
						<h4 className="text-primary-light text-xl font-semibold">Expand Your Business</h4>
					</Link>

					{branchList.map((branch, idx) => (
						<BranchCard branch={branch} key={idx} idx={idx} onReadMore={handleReadMore} />
					))}
				</div>
			) : (
				<BranchDetail
					branch={branchList[selectedBranchIdx]}
					onClose={handleCloseDetail}
					onSave={handleSaveDetail}
				/>
			)}
		</div>
	);
};

export default BranchInfo;