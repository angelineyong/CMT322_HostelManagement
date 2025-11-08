import React, { useMemo, useState, useEffect } from "react";
import { studentSummaryData, holidays, staffAvailability } from "../../data/mockData";
import pendingIcon from "../../assets/PendingComplaint.png";
import inProgressIcon from "../../assets/InProgress.png";
import resolvedIcon from "../../assets/Resolved.png";

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
		<div className="bg-white rounded-lg shadow p-4">
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
							className={`h-10 flex items-center justify-center rounded relative group cursor-pointer
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
	const [searchTerm, setSearchTerm] = useState("");
	const [sortBy, setSortBy] = useState("");
	const [currentHolidayIndex, setCurrentHolidayIndex] = useState(0);

	// Auto-rotate holidays every 7 seconds
	useEffect(() => {
		const timer = setInterval(() => {
			setCurrentHolidayIndex((current) => (current + 1) % holidays.length);
		}, 7000);

		return () => clearInterval(timer);
	}, [holidays.length]);

	const pendingCount = studentSummaryData.filter((s) => s.status.toLowerCase() === "pending").length;
	const inProgressCount = studentSummaryData.filter((s) => s.status.toLowerCase() === "in progress").length;
	const resolvedCount = studentSummaryData.filter((s) => s.status.toLowerCase() === "resolved").length;

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
		<div className="p-9 max-w-7xl mx-auto">
			<h1 className="text-5xl font-semibold mb-15">Welcome back, Student</h1>

			{/* Holidays banner: auto-rotating holiday display */}
			<div className="mb-8">
				<div className="relative rounded-lg overflow-hidden h-55 bg-gray-200">
					{holidays && holidays.length > 0 && (
						<>
							{/* background image with fade transition */}
							<div
								className="absolute inset-0 bg-cover bg-center transition-opacity duration-[1500ms]"
								style={{ backgroundImage: `url(${holidays[currentHolidayIndex].image})` }}
							/>
							{/* dim overlay */}
							<div className="absolute inset-0 bg-black/30" />
							<div className="relative z-10 h-full flex items-center px-6">
								<div className="flex-1 transition-all duration-800">
									<div className="text-white text-2xl font-semibold">{holidays[currentHolidayIndex].name}</div>
									<div className="text-white/90 mt-1">{holidays[currentHolidayIndex].date}</div>
									{holidays[currentHolidayIndex].description && (
										<div className="text-white/80 mt-2">{holidays[currentHolidayIndex].description}</div>
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

			{/* Top three summary boxes */}
			<div className="grid grid-cols-1 sm:grid-cols-3 gap-9 mb-10">
				<div className="p-6 rounded-lg shadow flex items-center justify-between bg-amber-100">
					<div className="flex items-center gap-10">
						<img src={pendingIcon} alt="pending" className="w-12 h-12 rounded-md object-cover" />
						<div>
							<div className="text-xl font-semibold text-amber-800">Pending Complaints</div>
							<div className="text-7xl font-bold text-amber-900 mt-2">{pendingCount}</div>
						</div>
					</div>
				</div>

				<div className="p-6 rounded-lg shadow flex items-center justify-between bg-blue-100">
					<div className="flex items-center gap-10">
						<img src={inProgressIcon} alt="in-progress" className="w-15 h-15 rounded-md object-cover" />
						<div>
							<div className="text-xl font-semibold text-blue-800">In Progress</div>
							<div className="text-7xl font-bold text-blue-900 mt-2">{inProgressCount}</div>
						</div>
					</div>
				</div>

				<div className="p-6 rounded-lg shadow flex items-center justify-between bg-green-100">
					<div className="flex items-center gap-10">
						<img src={resolvedIcon} alt="resolved" className="w-13 h-13 rounded-md object-cover" />
						<div>
							<div className="text-xl font-semibold text-green-800">Resolved</div>
							<div className="text-7xl font-bold text-green-900 mt-2">{resolvedCount}</div>
						</div>
					</div>
				</div>
			</div>

			{/* Bottom area: left table, right calendar */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				<div className="lg:col-span-2">
					<div className="bg-white rounded-lg shadow p-4">
						<div className="flex items-center justify-between mb-4">
							<h2 className="text-xl font-semibold">Recent Complaints</h2>
						</div>
						
						<div className="flex flex-col sm:flex-row gap-4 mb-4">
							<div className="flex-1">
								<input
									type="text"
									placeholder="Search complaints..."
									className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
								/>
							</div>
							<div className="flex gap-2">
								<select
									className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
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

						<div className="overflow-x-auto max-h-80 overflow-y-auto">
							<table className="min-w-full divide-y divide-gray-200">
								<thead>
									<tr className="text-left text-sm text-gray-600">
										<th className="py-2">Complaint ID</th>
										<th className="py-2">Date Submitted</th>
										<th className="py-2">Facility Category</th>
										<th className="py-2">Status</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-gray-100 text-sm">
									{filteredAndSortedComplaints.map((complaint) => (
										<tr key={complaint.complaintId} className="hover:bg-gray-50">
											<td className="py-3">{complaint.complaintId}</td>
											<td className="py-3">{complaint.dateSubmitted}</td>
											<td className="py-3">{complaint.facilityCategory}</td>
											<td className="py-3">{complaint.status === "Resolved" ? <span className="text-green-600">Resolved</span> : complaint.status === "Pending" ? <span className="text-amber-600">Pending</span> : <span className="text-blue-600">In Progress</span>}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				</div>

				<div className="space-y-4">
					{/* Staff status box above calendar */}
					<div className="bg-white rounded-lg shadow p-4 flex items-center gap-4">
						<div className={`w-3 h-3 rounded-full ${staffAvailability.statusType === "available" ? "bg-green-500" : staffAvailability.statusType === "out-of-office" ? "bg-yellow-500" : staffAvailability.statusType === "unavailable" ? "bg-red-500" : "bg-gray-400"}`} />
						<div>
							<div className="text-sm text-gray-500">Staff Status</div>
							<div className="font-semibold">{staffAvailability.status} <span className="text-sm text-gray-400">— {staffAvailability.note}</span></div>
							<div className="text-xs text-gray-400 mt-1">Updated: {staffAvailability.updatedAt}</div>
						</div>
					</div>

					<Calendar />
				</div>
			</div>
		</div>
	);
};

export default StudentHome;
