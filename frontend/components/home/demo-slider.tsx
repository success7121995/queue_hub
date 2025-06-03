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
	const [isSmall, setIsSmall] = useState(false);

	useEffect(() => {
		const update = () => {
			const w = window.innerWidth;
			setIsMobile(w < 768);
			setIsSmall(w < 1024);
		};
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
		if (isMobile || isSmall) return [centerIdx];
		const left = (centerIdx - 1 + slides.length) % slides.length;
		const right = (centerIdx + 1) % slides.length;
		return [left, centerIdx, right];
	};

	// 16:9
	const centerWidth = 320; // px
	const centerHeight = centerWidth * 9 / 16; // 16:9 (≈ 0.5625)

	// side slide (scaled down by 70% on non-small screens)
	const sideScale = 0.7;
	const sideWidth = centerWidth * sideScale;
	const sideHeight = centerHeight * sideScale;

	return (
	<section className="w-full max-w-2xl mx-auto h-full font-regular-eng my-16 md:my-12 sm:my-6 px-2">
		<h1 className="text-3xl md:text-2xl sm:text-xl font-bold text-center mb-4 sm:mb-2">Demo</h1>

		<div className="w-full flex flex-col items-center py-10 md:py-6 sm:py-3 bg-white select-none">
			<div className="w-full flex items-center justify-center gap-2 sm:gap-1 relative">
				<button
					onClick={prev}
					className="p-3 md:p-2 sm:p-1 rounded-full bg-gray-200 hover:bg-gray-300 transition z-10 cursor-pointer min-w-[40px] min-h-[40px] md:min-w-[32px] md:min-h-[32px] sm:min-w-[28px] sm:min-h-[28px] absolute left-0 top-1/2 -translate-y-1/2"
					aria-label="Previous"
				>
					<ChevronLeft className="w-6 h-6 md:w-5 md:h-5 sm:w-4 sm:h-4" />
				</button>

				<div className="flex items-center justify-center flex-grow min-w-0 overflow-visible">
					{getVisibleSlides().map((idx) => {
						const isCenter = idx === centerIdx;
						const scale = (isSmall || isMobile) ? 1 : (isCenter ? 1.05 : 0.95);

						// Responsive slide sizing with clamp for smooth scaling
						const width = isCenter
							? 'clamp(220px, 70vw, 400px)'
							: 'clamp(150px, 50vw, 280px)';
						const height = isCenter
							? 'clamp(124px, 39vw, 225px)'
							: 'clamp(84px, 28vw, 157px)';
						const fontSize = isCenter ? 'clamp(1.1rem, 2vw, 1.5rem)' : 'clamp(0.9rem, 1.5vw, 1.1rem)';

						return (
							<div
								key={slides[idx].id}
								className={`transition-all duration-500 ease-in-out rounded-2xl flex-shrink-0 ${isCenter ? "brightness-110 z-10" : "opacity-70 z-0"}`}
								style={{
									width,
									height,
									background: "#f3f4f6",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									fontSize,
									fontWeight: "bold",
									boxShadow: isCenter ? "0 12px 36px rgba(0,0,0,0.15)" : "0 2px 8px rgba(0,0,0,0.06)",
									border: isCenter ? "2px solid #F97316" : "1px solid #e5e7eb",
									transform: `scale(${scale})`,
								}}
							>
								{slides[idx].content}
							</div>
						);
					})}
				</div>

				<button
					onClick={next}
					className="p-3 md:p-2 sm:p-1 rounded-full bg-gray-200 hover:bg-gray-300 transition z-10 cursor-pointer min-w-[40px] min-h-[40px] md:min-w-[32px] md:min-h-[32px] sm:min-w-[28px] sm:min-h-[28px] absolute right-0 top-1/2 -translate-y-1/2"
					aria-label="Next"
				>
					<ChevronRight className="w-6 h-6 md:w-5 md:h-5 sm:w-4 sm:h-4" />
				</button>
			</div>

			<div className="flex mt-6 md:mt-3 sm:mt-2 space-x-2 md:space-x-1 sm:space-x-0.5 justify-center">
				{slides.map((_, idx) => (
					<div
						key={idx}
						className={`w-3 h-3 md:w-2.5 md:h-2.5 sm:w-2 sm:h-2 rounded-full transition-all duration-300 ${idx === centerIdx ? "bg-orange-500 scale-125" : "bg-gray-300"}`}
					/>
				))}
			</div>
		</div>
	</section>
	);
};

export default DemoSlider;
