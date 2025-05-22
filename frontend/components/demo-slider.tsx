"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
{ id: 1, content: "Slide 1" },
{ id: 2, content: "Slide 2" },
{ id: 3, content: "Slide 3" },
{ id: 4, content: "Slide 4" },
{ id: 5, content: "Slide 5" },
{ id: 6, content: "Slide 6" },
{ id: 7, content: "Slide 7" },
{ id: 8, content: "Slide 8" },
{ id: 9, content: "Slide 9" },
{ id: 10, content: "Slide 10" },
{ id: 11, content: "Slide 11" },
{ id: 12, content: "Slide 12" },
];

const DemoSlider = () => {
	const [centerIdx, setCenterIdx] = useState(0);
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		const update = () => setIsMobile(window.innerWidth < 768);
		update();
		window.addEventListener("resize", update);
		return () => window.removeEventListener("resize", update);
	}, []);

	const prev = () => {
		setCenterIdx((i) => (i - 1 + slides.length) % slides.length);
	};

	const next = () => {
		setCenterIdx((i) => (i + 1) % slides.length);
	};

	const getVisibleSlides = () => {
		if (isMobile) return [centerIdx];

		const left = (centerIdx - 1 + slides.length) % slides.length;
		const right = (centerIdx + 1) % slides.length;

		//
		return [left, centerIdx, right];
	};

	// 16:9
	const centerWidth = 320; // px
	const centerHeight = centerWidth * 9 / 16; // 16:9 約 0.5625

	// 側邊slide縮小70%，比例相同
	const sideScale = 0.7;
	const sideWidth = centerWidth * sideScale;
	const sideHeight = centerHeight * sideScale;

	return (
	<section className="max-w-[1000px] mx-auto h-full font-regular-eng my-20">
		<h1 className="text-3xl font-bold text-center">Demo</h1>

		<div className="w-full flex flex-col items-center py-12 bg-white select-none">
		<div className="flex items-center w-full max-w-7xl px-4 space-x-4 overflow-visible">
			<button
			onClick={prev}
			className="p-3 rounded-full bg-gray-200 hover:bg-gray-300 transition z-10 cursor-pointer"
			aria-label="Previous"
			>
			<ChevronLeft />
			</button>

			<div className="flex gap-4 items-center justify-center flex-grow min-w-0 overflow-visible">
			{getVisibleSlides().map((idx) => {
				const isCenter = idx === centerIdx;
				return (
				<div
					key={slides[idx].id}
					className={`transition-all duration-500 ease-in-out rounded-2xl flex-shrink-0 ${
					isCenter ? "scale-105 brightness-110 z-10" : "scale-95 opacity-70 z-0"
					}`}
					style={{
					width: isCenter ? centerWidth : sideWidth,
					height: isCenter ? centerHeight : sideHeight,
					background: "#f3f4f6",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					fontSize: isCenter ? 24 : 18,
					fontWeight: "bold",
					boxShadow: isCenter
						? "0 12px 36px rgba(0,0,0,0.15)"
						: "0 2px 8px rgba(0,0,0,0.06)",
					border: isCenter ? "2px solid #F97316" : "1px solid #e5e7eb",
					}}
				>
					{slides[idx].content}
				</div>
				);
			})}
			</div>

			<button
			onClick={next}
			className="p-3 rounded-full bg-gray-200 hover:bg-gray-300 transition z-10 cursor-pointer"
			aria-label="Next"
			>
			<ChevronRight />
			</button>
		</div>

		<div className="flex mt-6 space-x-2">
			{slides.map((_, idx) => (
			<div
				key={idx}
				className={`w-3 h-3 rounded-full transition-all duration-300 ${
				idx === centerIdx ? "bg-orange-500 scale-125" : "bg-gray-300"
				}`}
			/>
			))}
		</div>
		</div>
	</section>
	);
};

export default DemoSlider;
