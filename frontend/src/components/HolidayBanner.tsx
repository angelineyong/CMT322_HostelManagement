import React, { useEffect, useState } from "react";
import { holidays } from "../data/mockData";

const HolidayBanner: React.FC = () => {
	const [currentHolidayIndex, setCurrentHolidayIndex] = useState(0);

	useEffect(() => {
		if (!holidays || holidays.length === 0) return;
		const timer = setInterval(() => {
			setCurrentHolidayIndex((c) => (c + 1) % holidays.length);
		}, 7000);

		return () => clearInterval(timer);
	}, []);

	if (!holidays || holidays.length === 0) return null;

	const current = holidays[currentHolidayIndex] || holidays[0];

	return (
		<div className="mb-8">
			<div className="relative rounded-lg overflow-hidden h-55 bg-gray-200">
				{holidays && holidays.length > 0 && (
					<>
						{/* background image with fade transition */}
						<div
							className="absolute inset-0 bg-cover bg-center transition-opacity duration-[1500ms]"
							style={{ backgroundImage: `url(${current.image})` }}
						/>
						{/* dim overlay */}
						<div className="absolute inset-0 bg-black/10" />
						<div className="relative z-10 h-full flex items-center px-6">
							<div className="flex-1 transition-all duration-800">
								<div className="text-white text-2xl font-semibold">{current.name}</div>
								<div className="text-white/90 mt-1">{current.date}</div>
								{current.description && (
									<div className="text-white/80 mt-2">{current.description}</div>
								)}
							</div>
							{/* Next button on the right overlay */}
							<button
								aria-label="Next holiday"
								onClick={() => setCurrentHolidayIndex((c) => (c + 1) % holidays.length)}
								className="ml-4 p-2 bg-white/20 hover:bg-white/30 text-white rounded-full"
							>
								›
							</button>

							{/* Dots centered at the bottom of the banner */}
							<div className="absolute left-1/2 transform -translate-x-1/2 bottom-3 flex gap-2">
								{holidays.map((_, index) => (
									<button
										key={index}
										onClick={() => setCurrentHolidayIndex(index)}
										className={`w-2 h-2 rounded-full transition-all ${
											index === currentHolidayIndex ? "bg-white scale-125" : "bg-white/50"
										}`}
										aria-label={`Show holiday ${index + 1}`}
									/>
								))}
							</div>
						</div>
					</>
				)}
			</div>
		</div>
	);
};

export default HolidayBanner;
