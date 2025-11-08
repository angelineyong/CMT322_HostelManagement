import React, { useMemo, useState } from "react";
import { studentSummaryData } from "../../data/mockData";
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

	return (
		<div className="bg-white rounded-lg shadow p-4">
			<div className="flex items-center justify-between mb-3">
				<button onClick={prevMonth} className="px-2 py-1 rounded hover:bg-gray-100">◀</button>
				<div className="text-lg font-medium">
					{current.toLocaleString(undefined, { month: "long" })} {year}
				</div>
				<button onClick={nextMonth} className="px-2 py-1 rounded hover:bg-gray-100">▶</button>
			</div>

			<div className="grid grid-cols-7 gap-1 text-sm text-center text-gray-500 mb-2">
				<div>Sun</div>
				<div>Mon</div>
				<div>Tue</div>
				<div>Wed</div>
				<div>Thu</div>
				<div>Fri</div>
				<div>Sat</div>
			</div>

			<div className="grid grid-cols-7 gap-1 text-center">
				{days.map((d, i) => {
					const isToday = d === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
					return (
						<div
							key={i}
							className={`h-10 flex items-center justify-center rounded ${d ? "bg-gray-50" : "bg-transparent"} ${isToday ? "ring-2 ring-indigo-300 font-semibold" : ""}`}
						>
							{d ?? ""}
						</div>
					);
				})}
			</div>
		</div>
	);
};

const StudentHome: React.FC = () => {
	const recent = useMemo(() => studentSummaryData.slice(0, 6), []);

	const pendingCount = studentSummaryData.filter((s) => s.status.toLowerCase() === "pending").length;
	const inProgressCount = studentSummaryData.filter((s) => s.status.toLowerCase() === "in progress").length;
	const resolvedCount = studentSummaryData.filter((s) => s.status.toLowerCase() === "resolved").length;

	return (
		<div className="p-6 max-w-7xl mx-auto">
			<h1 className="text-5xl font-semibold mb-8">Welcome back, Student</h1>

			{/* Top three summary boxes */}
			<div className="grid grid-cols-1 sm:grid-cols-3 gap-9 mb-10">
				<div className="p-6 rounded-lg shadow flex items-center justify-between bg-amber-50">
					<div className="flex items-center gap-10">
						<img src={pendingIcon} alt="pending" className="w-12 h-12 rounded-md object-cover" />
						<div>
							<div className="text-xl font-semibold text-amber-700">Pending Complaints</div>
							<div className="text-7xl font-bold text-amber-800 mt-2">{pendingCount}</div>
						</div>
					</div>
				</div>

				<div className="p-6 rounded-lg shadow flex items-center justify-between bg-blue-50">
					<div className="flex items-center gap-10">
						<img src={inProgressIcon} alt="in-progress" className="w-15 h-15 rounded-md object-cover" />
						<div>
							<div className="text-xl font-semibold text-blue-700">In Progress</div>
							<div className="text-7xl font-bold text-blue-800 mt-2">{inProgressCount}</div>
						</div>
					</div>
				</div>

				<div className="p-6 rounded-lg shadow flex items-center justify-between bg-green-50">
					<div className="flex items-center gap-10">
						<img src={resolvedIcon} alt="resolved" className="w-13 h-13 rounded-md object-cover" />
						<div>
							<div className="text-xl font-semibold text-green-700">Resolved</div>
							<div className="text-7xl font-bold text-green-800 mt-2">{resolvedCount}</div>
						</div>
					</div>
				</div>
			</div>

			{/* Bottom area: left table, right calendar */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
				<div className="lg:col-span-2">
					<div className="bg-white rounded-lg shadow p-4">
						<div className="flex items-center justify-between mb-3">
							<h2 className="text-lg font-medium">Recent Complaints</h2>
							<div className="text-sm text-gray-500">Showing latest {recent.length}</div>
						</div>

						<div className="overflow-x-auto">
							<table className="min-w-full divide-y divide-gray-200">
								<thead>
									<tr className="text-left text-sm text-gray-600">
										<th className="py-2">Complaint ID</th>
										<th className="py-2">Facility Category</th>
										<th className="py-2">Date Submitted</th>
										<th className="py-2">Status</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-gray-100 text-sm">
									{recent.map((c) => (
										<tr key={c.complaintId} className="hover:bg-gray-50">
											<td className="py-3">{c.complaintId}</td>
											<td className="py-3">{c.facilityCategory}</td>
											<td className="py-3">{c.dateSubmitted}</td>
											<td className="py-3">{c.status === "Resolved" ? <span className="text-green-600">Resolved</span> : c.status === "Pending" ? <span className="text-amber-600">Pending</span> : <span className="text-blue-600">{c.status}</span>}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				</div>

				<div>
					<Calendar />
				</div>
			</div>
		</div>
	);
};

export default StudentHome;
