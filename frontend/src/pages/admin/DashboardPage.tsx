import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import {
  dashboardCards,
  staffTaskData,
  trendData,
  facilityIssues,
  staffPerformanceData,
  studentComplaints,
} from "../../data/mockData";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function DashboardPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFacility, setSelectedFacility] = useState("");
  const [selectedStaff, setSelectedStaff] = useState("");

  // Filter complaints based on search and selected filters
  const filteredComplaints = studentComplaints.filter((c) => {
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      c.complaintId.toLowerCase().includes(search) ||
      c.comment.toLowerCase().includes(search) ||
      c.facility.toLowerCase().includes(search) ||
      c.assignedTo.toLowerCase().includes(search) ||
      c.openedAt.toLowerCase().includes(search) ||
      (c.closedAt && c.closedAt.toLowerCase().includes(search));

    const matchesFacility = selectedFacility
      ? c.facility === selectedFacility
      : true;
    const matchesStaff = selectedStaff ? c.assignedTo === selectedStaff : true;

    return matchesSearch && matchesFacility && matchesStaff;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-purple-700 mb-1">
            Facility & Ticket Insights
          </h1>
          <p className="text-gray-600 text-xs">
            Manage and analyze hostel facility feedback to improve services.
          </p>
        </div>
        {/* Admin quick entry to Staff Profile Management */}
        <Link
          to="/admin/userManagement"
          className="text-sm px-3 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors"
        >
          Manage Staff Profiles
        </Link>
      </div>

      {/* Subtitle + Separator */}
      <div className="mb-4">
        <hr className="border-t border-gray-300 mb-2" />
        <h2 className="text-lg font-semibold text-purple-700">
          Insights &amp; Reports
        </h2>
        <hr className="border-t border-gray-300 mt-2" />
      </div>
      {/* --- Top Row: Insight Cards --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <InsightCard
          title="Opened Tickets"
          value={dashboardCards.openedTickets}
          color="bg-purple-100"
          textColor="text-purple-700"
        />
        <InsightCard
          title="Overdue Tickets (>3 days)"
          value={dashboardCards.overdueTickets}
          color="bg-red-100"
          textColor="text-red-700"
        />
        <InsightCard
          title="Resolved This Month"
          value={dashboardCards.resolvedThisMonth}
          color="bg-green-100"
          textColor="text-green-700"
        />
        <InsightCard
          title="Most Reported Facility"
          value={`${dashboardCards.mostReportedFacility.category} (${dashboardCards.mostReportedFacility.percentage}%)`}
          color="bg-yellow-100"
          textColor="text-yellow-700"
        />
      </div>

      {/* --- Bottom Row: Facility Issues + Trend Graph --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Facility Issues */}
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
          <h2 className="text-md font-semibold text-purple-700 mb-4">
            Most Frequent Facility Issues
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={facilityIssues}
              layout="vertical"
              margin={{ left: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" fontSize={14} />
              <YAxis
                type="category"
                dataKey="category"
                width={65}
                tick={{ fill: "#4b5563", fontSize: 12 }} // lighter gray
                interval={0}
                angle={-20}
                textAnchor="end"
              />
              <Tooltip formatter={(value: number) => `${value} tickets`} />
              <Bar
                dataKey="count"
                name="Count"
                fill="#facc15"
                radius={[0, 8, 8, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Right: Complaint & Satisfaction Trend */}
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
          <h2 className="text-md font-semibold text-purple-700 mb-4">
            Complaint &amp; Satisfaction Trend
          </h2>
          <ResponsiveContainer width="105%" height={250}>
            <LineChart
              data={trendData}
              margin={{ top: 5, right: 40, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" fontSize={14} />
              <YAxis
                yAxisId="left"
                orientation="left"
                tick={{ fill: "#4b5563", fontSize: 12 }}
                label={{
                  value: "Complaints (Count)",
                  angle: -90,
                  position: "insideLeft",
                  offset: 10,
                  fill: "#ef4444",
                  fontSize: 14,
                  style: { textAnchor: "middle" },
                }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[0, 5]}
                tick={{ fill: "#4b5563", fontSize: 12 }}
                label={{
                  value: "Satisfaction (%)",
                  angle: 90,
                  position: "insideRight",
                  offset: 10,
                  fill: "#10b981",
                  fontSize: 14,
                  style: { textAnchor: "middle" },
                }}
              />
              <Tooltip
                formatter={(value: number, name: string) =>
                  name === "complaints"
                    ? `${value} tickets`
                    : (value as number).toFixed(1)
                }
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="complaints"
                stroke="#ef4444"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="satisfaction"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* --- Middle Row: Staff Tasks --- */}
      <div className="mt-8">
        {/* Subtitle + Separator */}
        <div className="mb-4">
          <hr className="border-t border-gray-300 mb-2" />
          <h2 className="text-lg font-semibold text-purple-700">
            Staff Performance Analytics
          </h2>
          <hr className="border-t border-gray-300 mt-2" />
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
          <h2 className="text-md font-semibold text-purple-700 mb-4">
            Tasks Assigned per Staff
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={staffTaskData} margin={{ top: 5, bottom: 5 }}>
              <XAxis dataKey="staffName" fontSize={14} />
              <YAxis />
              <Tooltip
                formatter={(value: number, name) =>
                  name === "tasksInHand" ? `${value} tasks` : value
                }
                labelFormatter={(label) => {
                  const staff = staffTaskData.find(
                    (s) => s.staffName === label
                  );
                  return `Oldest ticket: ${staff?.oldestTicketDays} day(s)`;
                }}
              />
              <Bar
                dataKey="tasksInHand"
                name="Task in hand"
                fill="#7c3aed"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* --- Staff Performance Table --- */}
      <div className="mt-6 bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
        <h2 className="text-md font-semibold text-purple-700 mb-4">
          Performance Rating
        </h2>
        <div className="overflow-x-auto rounded-md">
          <table className="min-w-full border border-gray-200 rounded-lg">
            <thead>
              <tr className="bg-purple-100">
                <th className="p-2 text-left text-sm font-medium w-2/7">
                  Staff
                </th>
                <th className="p-2 text-left text-sm font-medium w-2/7">
                  Average Rating
                </th>
                <th className="p-2 text-left text-sm font-medium w-2/7">
                  Complaints Resolved
                </th>
                <th className="p-2 text-center text-sm font-medium w-1/7">
                  Remarks
                </th>
              </tr>
            </thead>
            <tbody>
              {staffPerformanceData.map((staff, idx) => {
                let remark = "";
                let badgeColor = "";

                if (staff.averageRating >= 4.5) {
                  remark = "Excellent";
                  badgeColor = "bg-green-100 text-green-800";
                } else if (staff.averageRating >= 3.5) {
                  remark = "Satisfactory";
                  badgeColor = "bg-yellow-100 text-yellow-800";
                } else {
                  remark = "Needs Improvement";
                  badgeColor = "bg-red-100 text-red-800";
                }

                return (
                  <tr key={idx} className="border-t border-gray-200 text-xs">
                    <td className="p-2">{staff.staffName}</td>
                    <td className="p-2">{staff.averageRating.toFixed(1)}</td>
                    <td className="p-2">{staff.totalTasks}</td>
                    <td className="p-2 text-center">
                      <span
                        className={`inline-block w-28 py-1 font-semibold rounded-lg ${badgeColor}`}
                      >
                        {remark}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Subtitle + Separator */}
      <div className="mb-4">
        <hr className="border-t border-gray-300 mb-2" />
        <h2 className="text-lg font-semibold text-purple-700">
          Staff Performance Records
        </h2>
        <hr className="border-t border-gray-300 mt-2" />
      </div>

      {/* --- Student Complaint Records --- */}
      <div className="mt-8 bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
        {/* Search & Filter */}
        <div className="mb-4 flex flex-wrap gap-4 items-center">
          <input
            type="text"
            placeholder="Search by complaint ID, comment..."
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm flex-1 min-w-[200px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            value={selectedFacility}
            onChange={(e) => setSelectedFacility(e.target.value)}
          >
            <option value="">All Facilities</option>
            {[...new Set(studentComplaints.map((c) => c.facility))].map(
              (facility) => (
                <option key={facility} value={facility}>
                  {facility}
                </option>
              )
            )}
          </select>

          <select
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            value={selectedStaff}
            onChange={(e) => setSelectedStaff(e.target.value)}
          >
            <option value="">All Staff</option>
            {[...new Set(studentComplaints.map((c) => c.assignedTo))].map(
              (staff) => (
                <option key={staff} value={staff}>
                  {staff}
                </option>
              )
            )}
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-md">
          <table className="min-w-full border border-gray-200 rounded-lg text-left text-xs">
            <thead>
              <tr className="bg-purple-100">
                <th className="p-2 text-sm font-medium">Complaint ID</th>
                <th className="p-2 text-sm font-medium">Facility</th>
                <th className="p-2 text-sm font-medium">Assigned To</th>
                <th className="p-2 text-sm font-medium">Rating</th>
                <th className="p-2 text-sm font-medium">Comment</th>
                <th className="p-2 text-sm font-medium">Opened At</th>
                <th className="p-2 text-sm font-medium">Closed At</th>
              </tr>
            </thead>
            <tbody>
              {filteredComplaints.map((complaint, idx) => (
                <tr key={idx} className="border-t border-gray-200">
                  <td className="p-2">{complaint.complaintId}</td>
                  <td className="p-2">{complaint.facility}</td>
                  <td className="p-2">{complaint.assignedTo}</td>
                  <td className="p-2">{complaint.rating.toFixed(1)}</td>
                  <td className="p-2">{complaint.comment}</td>
                  <td className="p-2">{complaint.openedAt}</td>
                  <td className="p-2">{complaint.closedAt || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// --- Insight Card Component ---
interface InsightCardProps {
  title: string;
  value: string | number;
  color?: string;
  textColor?: string;
}

function InsightCard({
  title,
  value,
  color = "",
  textColor = "",
}: InsightCardProps) {
  return (
    <div
      className={`${color} ${textColor} rounded-xl shadow-lg p-6 flex flex-col justify-between transform transition-transform duration-300 hover:scale-105 hover:shadow-xl`}
    >
      <p className="text-sm font-medium">{title}</p>
      <p className="text-lg font-semibold mt-2">{value}</p>
    </div>
  );
}
