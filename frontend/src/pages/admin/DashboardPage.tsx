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
import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

interface StaffPerformance {
  staffName: string;
  totalTasks: number;
  tasksResolved: number;
  averageRating: number;
  ratingCount: number; // to calculate cumulative average
}

interface ComplaintRecord {
  complaintId: string;
  facility: string;
  assignedTo: string;
  rating: number;
  comment: string;
  openedAt: string;
  closedAt: string | null;
}

export default function DashboardPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFacility, setSelectedFacility] = useState("");
  const [selectedStaff, setSelectedStaff] = useState("");

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    openedTickets: 0,
    overdueTickets: 0,
    resolvedThisMonth: 0,
    mostReportedFacility: { category: "N/A", percentage: 0 },
  });
  const [facilityData, setFacilityData] = useState<any[]>([]);
  const [trendChartData, setTrendChartData] = useState<any[]>([]);
  const [staffChartData, setStaffChartData] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
    fetchStaffPerformance();
    fetchStaffComplaints();
  }, []);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedFacility, selectedStaff]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from("complaints").select(`
          id,
          task_id,
          created_at,
          resolved_at,
          status ( status_name ),
          facility_type ( facility_type ),
          assigned_to_profile:assigned_to ( full_name )
        `);

      if (error) throw error;
      if (!data) return;

      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      let opened = 0;
      let overdue = 0;
      let resolvedMonth = 0;
      const facilityCounts: Record<string, number> = {};
      const staffMap: Record<string, { count: number; oldest: number }> = {};
      const monthMap: Record<
        string,
        { complaints: number; satisfaction: number }
      > = {};

      const staffPerfMap: Record<string, StaffPerformance> = {};
      const records: ComplaintRecord[] = [];

      // Initialize last 6 months for trend
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = d.toLocaleString("default", { month: "short" });
        monthMap[key] = { complaints: 0, satisfaction: 4.0 }; // Default sat. to 4.0
      }

      data.forEach((task: any) => {
        const status = task.status?.status_name || "Unknown";
        const created = new Date(task.created_at);
        const facility = task.facility_type?.facility_type || "Unknown";
        const isResolved = status === "Resolved";

        // Stats
        if (!isResolved) {
          opened++;
          const diffMs = now.getTime() - created.getTime();
          const diffDays = diffMs / (1000 * 60 * 60 * 24);
          if (diffDays > 3) overdue++;

          // Staff Active Workload
          if (!staffMap[staffName])
            staffMap[staffName] = { count: 0, oldest: 0 };
          staffMap[staffName].count++;
          if (diffDays > staffMap[staffName].oldest) {
            staffMap[staffName].oldest = Math.floor(diffDays);
          }
        }

        // Resolved This Month
        if (task.resolved_at) {
          const resolvedDate = new Date(task.resolved_at);
          if (
            resolvedDate.getMonth() === currentMonth &&
            resolvedDate.getFullYear() === currentYear
          ) {
            resolvedMonth++;
          }
        }

        // Facility Counts
        facilityCounts[facility] = (facilityCounts[facility] || 0) + 1;

        // Trend (All tickets, by created_at)
        const monthKey = created.toLocaleString("default", { month: "short" });
        if (monthMap[monthKey]) {
          monthMap[monthKey].complaints++;
        }
      });

      // Most Reported Facility
      let maxFacility = "N/A";
      let maxCount = 0;
      let totalCount = data.length;
      Object.entries(facilityCounts).forEach(([fac, count]) => {
        if (count > maxCount) {
          maxCount = count;
          maxFacility = fac;
        }
      });
      const topPct =
        totalCount > 0 ? Math.round((maxCount / totalCount) * 100) : 0;

      setStats({
        openedTickets: opened,
        overdueTickets: overdue,
        resolvedThisMonth: resolvedMonth,
        mostReportedFacility: { category: maxFacility, percentage: topPct },
      });

      // Finalize Facility Chart
      const fData = Object.entries(facilityCounts)
        .map(([name, count]) => ({ category: name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      setFacilityData(fData);

      const tData = Object.entries(monthMap).map(([month, val]) => ({
        month,
        complaints: val.complaints,
        satisfaction: val.satisfaction,
      }));
      // Sort by month order roughly (it was inserted in order)
      setTrendChartData(tData);


      // Finalize Staff Active Workload Chart
      const sData = Object.entries(staffMap).map(([name, val]) => ({
        staffName: name,
        tasksInHand: val.count,
        oldestTicketDays: val.oldest,
      }));
      setStaffChartData(sData);

      // Finalize Staff Performance Table
      const perfList = Object.values(staffPerfMap).map((s) => ({
        ...s,
        averageRating: s.ratingCount > 0 ? s.averageRating / s.ratingCount : 0,
      }));
      setStaffPerformanceList(perfList);

      // Finalize Complaint Records
      records
        .sort(
          (a, b) =>
            new Date(a.openedAt).getTime() - new Date(b.openedAt).getTime()
        )
        .reverse(); // Newest first
      setComplaintRecords(records);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStaffPerformance = async () => {
    try {
      // 1️⃣ Get all staff users
      const { data: staffData, error: staffError } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("role", "staff");

      if (staffError) throw staffError;
      if (!staffData) return;

      const performance: any[] = [];

      // 2️⃣ For each staff, calculate resolved complaints and average rating
      for (const staff of staffData) {
        // Get resolved complaints (status_id = 4) assigned to this staff
        const { data: complaints, error: complaintsError } = await supabase
          .from("complaints")
          .select("task_id")
          .eq("assigned_to", staff.id)
          .eq("status_id", 4)
          .eq("feedback", true); // resolved

        if (complaintsError) throw complaintsError;

        const resolvedCount = complaints?.length || 0;

        let avgRating = 0;
        if (resolvedCount > 0) {
          // Get ratings from feedback table
          const { data: feedbackData, error: feedbackError } = await supabase
            .from("feedback")
            .select("rating, complaint_id")
            .in(
              "complaint_id",
              complaints.map((c: any) => c.task_id)
            );

          if (feedbackError) throw feedbackError;

          if (feedbackData?.length > 0) {
            avgRating =
              feedbackData.reduce((acc, f: any) => acc + (f.rating || 0), 0) /
              feedbackData.length;
          }
        }

        performance.push({
          staffName: staff.full_name,
          averageRating: avgRating,
          totalTasks: resolvedCount,
        });
      }

      // 3️⃣ Optional: sort by average rating descending
      performance.sort((a, b) => b.averageRating - a.averageRating);

      // 4️⃣ Update state
      setStaffPerformanceData(performance);
    } catch (err) {
      console.error("Error fetching staff performance:", err);
    }
  };

  const fetchStaffComplaints = async () => {
    try {
      const { data, error } = await supabase
        .from("complaints")
        .select(`
          id,
          task_id,
          created_at,
          resolved_at,
          description,
          feedback,
          status:status_id ( status_name ),
          facility_type:facility_type_id ( facility_type ),
          assigned_to_profile:assigned_to ( full_name ),
          feedback_data:feedback ( rating )
        `)
        .not("assigned_to", "is", null);

      if (error) throw error;

      const formatted = data.map((c: any) => {
        // --- START OF FIX ---
        // Supabase returns relations as an array. We need to grab the first item.
        const ratingVal = 
          Array.isArray(c.feedback_data) && c.feedback_data.length > 0
            ? c.feedback_data[0].rating
            : null;
        // --- END OF FIX ---

        return {
          id: c.id,
          taskId: c.task_id,
          facility: c.facility_type?.facility_type || "Unknown",
          assignedTo: c.assigned_to_profile?.full_name || "Unassigned",
          rating: ratingVal, // Use the fixed value here
          comment: c.description || "-",
          openedAt: new Date(c.created_at).toLocaleDateString(),
          closedAt: c.resolved_at
            ? new Date(c.resolved_at).toLocaleDateString()
            : null,
        };
      });

      setStaffComplaints(formatted);

    } catch (err) {
      console.error("Error fetching staff complaints:", err);
    }
  };


  // Filter complaints based on search and selected filters (Mock Data for bottom tables)
  const filteredComplaints = studentComplaints.filter((c) => {
    const search = searchTerm.toLowerCase();

      const matchesSearch =
        c.taskId.toString().toString().toLowerCase().includes(search) ||
        c.comment.toLowerCase().includes(search) ||
        c.facility.toLowerCase().includes(search) ||
        c.assignedTo.toLowerCase().includes(search) ||
        c.openedAt.toLowerCase().includes(search) ||
        (c.closedAt && c.closedAt.toLowerCase().includes(search));

      const matchesFacility = selectedFacility
        ? c.facility === selectedFacility
        : true;

      const matchesStaff = selectedStaff
     
        ? c.assignedTo === selectedStaff
     
        : true;

      return matchesSearch && matchesFacility && matchesStaff;
    });
  }, [complaintRecords, searchTerm, selectedFacility, selectedStaff]);

  // Calculate Pagination
  const totalItems = filteredComplaints.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedData = filteredComplaints.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };


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

      {loading ? (
        <div className="text-center py-10 text-gray-500">
          Loading Dashboard...
        </div>
      ) : (
        <>
          {/* --- Top Row: Insight Cards --- */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <InsightCard
              title="Opened Tickets"
              value={stats.openedTickets}
              color="bg-purple-100"
              textColor="text-purple-700"
            />
            <InsightCard
              title="Overdue Tickets (>3 days)"
              value={stats.overdueTickets}
              color="bg-red-100"
              textColor="text-red-700"
            />
            <InsightCard
              title="Resolved This Month"
              value={stats.resolvedThisMonth}
              color="bg-green-100"
              textColor="text-green-700"
            />
            <InsightCard
              title="Most Reported Facility"
              value={`${stats.mostReportedFacility.category} (${stats.mostReportedFacility.percentage}%)`}
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
                  data={facilityData}
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
                  data={trendChartData}
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
                <BarChart data={staffChartData} margin={{ top: 5, bottom: 5 }}>
                  <XAxis dataKey="staffName" fontSize={14} />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number, name) =>
                      name === "tasksInHand" ? `${value} tasks` : value
                    }
                    labelFormatter={(label) => {
                      const staff = staffChartData.find(
                        (s) => s.staffName === label
                      );
                      return `Oldest ticket: ${
                        staff?.oldestTicketDays || 0
                      } day(s)`;
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
        </>
      )}

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
              {staffPerformanceList.length === 0 ? (
                <tr>
                  <td className="p-4 text-center text-gray-500" colSpan={4}>
                    No performance data available.
                  </td>
                </tr>
              ) : (
                staffPerformanceList.map((staff, idx) => {
                  let remark = "";
                  let badgeColor = "";

                  if (staff.averageRating >= 4.5) {
                    remark = "Excellent";
                    badgeColor = "bg-green-100 text-green-800";
                  } else if (staff.averageRating >= 3.5) {
                    remark = "Satisfactory";
                    badgeColor = "bg-yellow-100 text-yellow-800";
                  } else if (staff.averageRating > 0) {
                    remark = "Needs Improvement";
                    badgeColor = "bg-red-100 text-red-800";
                  } else {
                    remark = "No Ratings";
                    badgeColor = "bg-gray-100 text-gray-800";
                  }

                  return (
                    <tr key={idx} className="border-t border-gray-200 text-xs">
                      <td className="p-2">{staff.staffName}</td>
                      <td className="p-2">
                        {staff.averageRating > 0
                          ? staff.averageRating.toFixed(1)
                          : "N/A"}
                      </td>
                      <td className="p-2">{staff.tasksResolved}</td>
                      <td className="p-2 text-center">
                        <span
                          className={`inline-block w-32 py-1 font-semibold rounded-lg ${badgeColor}`}
                        >
                          {remark}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
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
           {[...new Set(staffComplaints.map((c) => c.assignedTo))].map(
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
              {paginatedData.length === 0 ? (
                <tr>
                  <td className="p-4 text-center text-gray-500" colSpan={7}>
                    No closed complaints match your filters.
                  </td>
                </tr>
              ) : (
                paginatedData.map((complaint, idx) => (
                  <tr key={idx} className="border-t border-gray-200">
                    <td className="p-2">{complaint.complaintId}</td>
                    <td className="p-2">{complaint.facility}</td>
                    <td className="p-2">{complaint.assignedTo}</td>
                    <td className="p-2">
                      {complaint.rating > 0 ? complaint.rating.toFixed(1) : "-"}
                    </td>
                    <td
                      className="p-2 truncate max-w-[200px]"
                      title={complaint.comment}
                    >
                      {complaint.comment}
                    </td>
                    <td className="p-2">{complaint.openedAt}</td>
                    <td className="p-2">{complaint.closedAt || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-500">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}{" "}
            entries
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1 rounded-md border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-medium text-gray-700">
              Page {currentPage} of {Math.max(1, totalPages)}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-1 rounded-md border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
          </div>
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