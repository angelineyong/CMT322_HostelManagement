import React, { useMemo, useState, useEffect, useRef } from "react";
import { studentSummaryData, holidays, staffAvailability } from "../../data/mockData";
import HolidayBanner from "../../components/HolidayBanner";
import pendingIcon from "../../assets/PendingComplaint.png";
import inProgressIcon from "../../assets/InProgress.png";
import resolvedIcon from "../../assets/Resolved.png";
import ComplaintDetail from "./ComplaintDetail";

// small hook to animate numbers from 0 -> target
function useCountUp(target: number, duration = 800) {
	const [value, setValue] = React.useState(0);

	React.useEffect(() => {
		if (!target || target <= 0) {
			setValue(target || 0);
			return;
		}

		let start = performance.now();
		let raf = 0;
		const step = (now: number) => {
			const t = Math.min(1, (now - start) / duration);
			setValue(Math.round(t * target));
			if (t < 1) raf = requestAnimationFrame(step);
		};

		raf = requestAnimationFrame(step);
		return () => cancelAnimationFrame(raf);
	}, [target, duration]);

	return value;
}

const Calendar: React.FC = () => {
	const [current, setCurrent] = useState(new Date());

	const year = current.getFullYear();
	const month = current.getMonth();

	const firstDay = new Date(year, month, 1);
	const startDay = firstDay.getDay(); // 0 (Sun) - 6 (Sat)
	const daysInMonth = new Date(year, month + 1, 0).getDate();

	const days = [] as (number | null)[];
	for (let i = 0; i < startDay; i++) days.push(null);
	for (let d = 1; d <= daysInMonth; d++) days.push(d);

	const prevMonth = () => setCurrent(new Date(year, month - 1, 1));
	const nextMonth = () => setCurrent(new Date(year, month + 1, 1));

	const getHoliday = (day: number) => {
		// Build a Date object for the calendar cell
		const target = new Date(year, month, day);

		// Support holidays defined as a single date or as comma-separated dates
		for (const holiday of holidays) {
			const raw = String(holiday.date || "");
			const tokens = raw.split(",").map((t) => t.trim()).filter(Boolean);

			for (const token of tokens) {
				let dObj: Date | null = null;

				// Try explicit YYYY-M-D or YYYY-MM-DD parts first
				const parts = token.split("-").map((p) => p.trim());
				if (parts.length === 3 && /^\d+$/.test(parts[0])) {
					const y = Number(parts[0]);
					const m = Number(parts[1]) - 1;
					const d = Number(parts[2]);
					if (!Number.isNaN(y) && !Number.isNaN(m) && !Number.isNaN(d)) {
						dObj = new Date(y, m, d);
					}
				} else {
					// Fallback to Date parsing for other acceptable formats
					const parsed = new Date(token);
					if (!isNaN(parsed.getTime())) dObj = parsed;
				}

				if (dObj) {
					if (
						dObj.getFullYear() === target.getFullYear() &&
						dObj.getMonth() === target.getMonth() &&
						dObj.getDate() === target.getDate()
					) {
						return holiday;
					}
				}
			}
		}

		return undefined;
	};

	return (
		<div className="bg-white rounded-lg shadow p-4 transition-transform duration-300 hover:scale-105">
			<div className="flex items-center justify-between mb-3">
				<button onClick={prevMonth} className="px-2 py-1 rounded hover:bg-gray-100">◀</button>
				<div className="text-lg font-medium">
					{current.toLocaleString(undefined, { month: "long" })} {year}
				</div>
				<button onClick={nextMonth} className="px-2 py-1 rounded hover:bg-gray-100">▶</button>
			</div>

			<div className="grid grid-cols-7 gap-1 text-sm text-center mb-2">
				<div className="text-red-500 font-medium">Sun</div>
				<div className="text-gray-500">Mon</div>
				<div className="text-gray-500">Tue</div>
				<div className="text-gray-500">Wed</div>
				<div className="text-gray-500">Thu</div>
				<div className="text-gray-500">Fri</div>
				<div className="text-gray-500">Sat</div>
			</div>

			<div className="grid grid-cols-7 gap-1 text-center">
				{days.map((d, i) => {
					const isToday = d === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
					const isSunday = (i % 7) === 0;
					const holiday = d ? getHoliday(d) : null;
					
					return (
						<div
							key={i}
							className={`h-8 sm:h-10 flex items-center justify-center rounded text-xs sm:text-sm relative group cursor-pointer
								${d ? "bg-gray-50" : "bg-transparent"}
								${isToday ? "ring-2 ring-indigo-300 font-semibold" : ""}
								${holiday ? "bg-red-50 text-red-600 font-semibold" : ""}
								${isSunday && d ? "text-red-500" : ""}`}
							title={holiday?.name}
						>
							{d ?? ""}
							{holiday && (
								<div className="absolute hidden group-hover:block bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap">
									{holiday.name}
								</div>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
	};

const StudentHome: React.FC = () => {
	// header visibility for on-scroll animation
	const headerRef = useRef<HTMLDivElement | null>(null);
	const [headerVisible, setHeaderVisible] = useState(false);

	useEffect(() => {
		if (!headerRef.current) return;
		const obs = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) setHeaderVisible(true);
				});
			},
			{ threshold: 0.1 }
		);

		obs.observe(headerRef.current);
		return () => obs.disconnect();
	}, []);
	const [searchTerm, setSearchTerm] = useState("");
	const [sortBy, setSortBy] = useState("");
    
	// const navigate = useNavigate();
	const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);

	const pendingCount = studentSummaryData.filter((s) => s.status.toLowerCase() === "pending").length;
	const inProgressCount = studentSummaryData.filter((s) => s.status.toLowerCase() === "in progress").length;
	const resolvedCount = studentSummaryData.filter((s) => s.status.toLowerCase() === "resolved").length;

	// animated count-up values
	const pending = useCountUp(pendingCount, 900);
	const inProgress = useCountUp(inProgressCount, 900);
	const resolved = useCountUp(resolvedCount, 900);

	const filteredAndSortedComplaints = useMemo(() => {
		let result = [...studentSummaryData];

		// Apply search filter
		if (searchTerm) {
			const term = searchTerm.toLowerCase();
			result = result.filter(
				(complaint) =>
					complaint.complaintId.toLowerCase().includes(term) ||
					complaint.facilityCategory.toLowerCase().includes(term) ||
					complaint.status.toLowerCase().includes(term)
			);
		}

		// Apply sorting
		switch (sortBy) {
			case "date-asc":
				result.sort((a, b) => new Date(a.dateSubmitted).getTime() - new Date(b.dateSubmitted).getTime());
				break;
			case "date-desc":
				result.sort((a, b) => new Date(b.dateSubmitted).getTime() - new Date(a.dateSubmitted).getTime());
				break;
			case "category":
				result.sort((a, b) => a.facilityCategory.localeCompare(b.facilityCategory));
				break;
			case "status":
				result.sort((a, b) => a.status.localeCompare(b.status));
				break;
		}

		return result; // Return all filtered and sorted complaints
	}, [searchTerm, sortBy]);

	return (
		<div className="p-2 sm:p-4 lg:p-9 mx-auto">
			{/* Section wrapper */}
			<div className="relative w-full">

			{/* Wave Background */}
			<div className="absolute inset-0 z-0">
				<div className="wave">
				<svg
					width="100%"
					height="100%"
					viewBox="0 0 1040 400"
					xmlns="http://www.w3.org/2000/svg"
					preserveAspectRatio="none"
				>
					<path
					fill="#818CF8"
					fillOpacity="0.2"
					d="M0,96L48,112C96,128,192,160,288,186.7C384,213,480,235,576,224C672,213,768,171,864,144C960,117,1056,107,1152,122.7C1248,139,1344,181,1392,202.7L1440,224L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
					/>
					<path
					fill="#818CF8"
					fillOpacity="0.3"
					d="M0,32L48,53.3C96,75,192,117,288,122.7C384,128,480,96,576,90.7C672,85,768,107,864,128C960,149,1056,171,1152,165.3C1248,160,1344,128,1392,112L1440,96L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
					/>
				</svg>
				</div>
			</div>

			{/* Header content on top of the wave */}
			<div
				ref={headerRef}
				className={`relative z-10 transform transition-all duration-700 ease-out bg-transparent text-center ${
				headerVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
				}`}
			>
			<div className="flex items-center justify-center gap-3 pt-6 sm:pt-10 lg:pt-16">
				<div className="flex flex-col justify-center h-30 sm:h-32 lg:h-48">
					<div className="font-bold text-indigo-700 mb-2 sm:mb-3 text-4xl sm:text-6xl lg:text-8xl">Fixify</div>
					<div className="text-indigo-500 font-medium mb-4 sm:mb-8 lg:mb-12 text-xs sm:text-sm lg:text-base">Creating comfort through your feedback.</div>
				</div>
			</div>				
			<h1 className="text-lg sm:text-2xl lg:text-3xl font-semibold mb-4 sm:mb-5 text-left px-4 sm:px-0">Welcome back, Kevin.</h1>
				</div>
			</div>

			

		{/* Top three summary boxes */}
		<div className="flex gap-1 sm:gap-3 lg:gap-6 overflow-x-auto sm:grid sm:grid-cols-3 mb-4 sm:mb-6 lg:mb-8 scrollbar-hide px-4 sm:px-0">
			<div className="p-2 sm:p-3 lg:p-4 rounded-lg shadow flex items-center justify-between bg-amber-100 transition-transform duration-300 hover:scale-105 min-w-[80px] sm:min-w-auto flex-shrink-0 sm:flex-shrink">
				<div className="flex items-center gap-1 sm:gap-2 lg:gap-3">
					<img src={pendingIcon} alt="pending" className="w-4 sm:w-8 lg:w-10 h-4 sm:h-8 lg:h-10 rounded-md object-cover" />
					<div>
						<div className="text-[10px] sm:text-sm lg:text-lg font-semibold text-amber-800 whitespace-nowrap">Pending</div>
						<div className="text-xs sm:text-3xl lg:text-6xl font-bold text-amber-900 mt-0.5">{pending}</div>
					</div>
				</div>
			</div>

			<div className="p-2 sm:p-3 lg:p-4 rounded-lg shadow flex items-center justify-between bg-blue-100 transition-transform duration-300 hover:scale-105 min-w-[80px] sm:min-w-auto flex-shrink-0 sm:flex-shrink">
				<div className="flex items-center gap-1 sm:gap-2 lg:gap-3">
					<img src={inProgressIcon} alt="in-progress" className="w-4 sm:w-8 lg:w-10 h-4 sm:h-8 lg:h-10 rounded-md object-cover" />
					<div>
						<div className="text-[10px] sm:text-sm lg:text-lg font-semibold text-blue-800 whitespace-nowrap">In Progress</div>
						<div className="text-xs sm:text-3xl lg:text-6xl font-bold text-blue-900 mt-0.5">{inProgress}</div>
					</div>
				</div>
			</div>

			<div className="p-2 sm:p-3 lg:p-4 rounded-lg shadow flex items-center justify-between bg-green-100 transition-transform duration-300 hover:scale-105 min-w-[80px] sm:min-w-auto flex-shrink-0 sm:flex-shrink">
				<div className="flex items-center gap-1 sm:gap-2 lg:gap-3">
					<img src={resolvedIcon} alt="resolved" className="w-4 sm:w-8 lg:w-10 h-4 sm:h-8 lg:h-10 rounded-md object-cover" />
					<div>
						<div className="text-[10px] sm:text-sm lg:text-lg font-semibold text-green-800 whitespace-nowrap">Resolved</div>
						<div className="text-xs sm:text-3xl lg:text-6xl font-bold text-green-900 mt-0.5">{resolved}</div>
						</div>
					</div>
				</div>
			</div>

		{/* Bottom area: left table, right calendar */}
		<div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 px-4 sm:px-0">
			<div className="lg:col-span-2 transition-transform duration-300 hover:scale-105">
				<div className="bg-white rounded-lg shadow p-3 sm:p-5 lg:p-7">
					<div className="flex items-center justify-between mb-4 sm:mb-5 lg:mb-7">
						<h2 className="text-sm sm:text-xl lg:text-2xl font-semibold">Recent Complaints</h2>
						</div>
						
					<div className="flex flex-col sm:flex-row gap-2 sm:gap-3 lg:gap-4 mb-4">
						<div className="flex-1">
							<input
								type="text"
								placeholder="Search complaints..."
								className="w-full px-3 sm:px-4 py-2 text-xs rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
							/>
						</div>
						<div className="flex gap-2">
							<select
								className="px-3 sm:px-4 py-2 text-[10px] rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
									value={sortBy}
									onChange={(e) => setSortBy(e.target.value)}
								>
									<option value="">Sort by Date ↓</option>
									<option value="date-asc">Date (Oldest)</option>
									<option value="date-desc">Date (Newest)</option>
									<option value="category">Facility Category</option>
									<option value="status">Status</option>
								</select>
							</div>
						</div>

					<div className="overflow-x-auto max-h-60 sm:max-h-80 overflow-y-auto">
						<table className="min-w-full divide-y divide-gray-200 text-xs sm:text-sm">
							<thead>
						<tr className="text-left text-[8px] sm:text-xs lg:text-sm text-gray-600 bg-gray-50">
									<th className="py-1 sm:py-2 px-1 sm:px-2">Complaint ID</th>
									<th className="py-1 sm:py-2 px-1 sm:px-2">Date Submitted</th>
									<th className="py-1 sm:py-2 px-1 sm:px-2">Facility Category</th>
									<th className="py-1 sm:py-2 px-1 sm:px-2">Status</th>
									</tr>
								</thead>
							<tbody className="divide-y divide-gray-100 text-[7px] sm:text-xs lg:text-sm">
								{filteredAndSortedComplaints.map((complaint) => (
									<tr key={complaint.complaintId} className="hover:bg-gray-50">
										<td className="py-1 sm:py-2 px-1 sm:px-2">{complaint.complaintId}</td>
										<td className="py-1 sm:py-2 px-1 sm:px-2">{complaint.dateSubmitted}</td>
										<td className="py-1 sm:py-2 px-1 sm:px-2">{complaint.facilityCategory}</td>
										<td className="py-1 sm:py-2 px-1 sm:px-2">
											<button
												onClick={() => setSelectedComplaintId(complaint.complaintId)}
												className={`px-1 sm:px-3 py-1 rounded-full text-[7px] sm:text-xs lg:text-sm font-semibold transition-all duration-200 shadow-sm flex items-center gap-1 hover:scale-105
													${
														complaint.status === "Resolved"
														? "bg-green-100 text-green-700 border border-green-400 hover:bg-green-200"
														: complaint.status === "In Progress"
														? "bg-blue-100 text-blue-700 border border-blue-400 hover:bg-blue-200"
														: complaint.status === "Pending"
														? "bg-amber-100 text-amber-700 border border-amber-400 hover:bg-amber-200"
														: "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200"
													}`}
												>
												{complaint.status}
												<span className="text-gray-500 text-[7px] sm:text-sm lg:text-base ml-1">→</span>
												</button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				</div>

			<div className="space-y-3 sm:space-y-4">
				{/* Staff status box above calendar */}
				<div className="bg-white rounded-lg shadow p-3 sm:p-4 flex items-center gap-3 sm:gap-4 transition-transform duration-300 hover:scale-105">
						<div className={`w-3 h-3 rounded-full ${staffAvailability.statusType === "available" ? "bg-green-500" : staffAvailability.statusType === "out-of-office" ? "bg-yellow-500" : staffAvailability.statusType === "unavailable" ? "bg-red-500" : "bg-gray-400"}`} />
						<div>
					<div className="text-xs sm:text-sm text-gray-500">Staff Status</div>
					<div className="text-sm sm:text-base font-semibold">{staffAvailability.status} <span className="text-xs sm:text-sm text-gray-400">— {staffAvailability.note}</span></div>
					<div className="text-xs text-gray-400 mt-1">Updated: {staffAvailability.updatedAt}</div>
						</div>
					</div>

					<Calendar />
				</div>
			</div>

		{/* Holiday banner + notice */}
		<div className="mt-4 sm:mt-6 lg:mt-8 px-2 sm:px-4 lg:px-0">
		<p className="mb-3 sm:mb-4 lg:mb-6">
				<span className="text-purple-700 font-bold text-xs sm:text-sm lg:text-2xl mb-2 sm:mb-3 leading-relaxed">
				Heads up!
				</span>
				<br />
				<span className="text-black text-xs sm:text-xs lg:text-base leading-relaxed">
				Our Fixify team will be taking a short break during these holidays. 
				Any new complaints will be attended to once we’re back in action.
				</span>
			</p>

			<div className="transition-transform duration-300 hover:scale-105 text-sm sm:text-base lg:text-lg">
				<HolidayBanner />
			</div>
			</div>
			{selectedComplaintId && (
				<ComplaintDetail
					complaintId={selectedComplaintId}
					onClose={() => setSelectedComplaintId(null)}
				/>
			)}
		</div>
		);
		};

export default StudentHome;
