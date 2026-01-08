import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Star, StarHalf } from "lucide-react";
import ComplaintDetailPage from "./ComplaintIDDetails";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

/* ================= TYPES ================= */
type FeedbackRow = {
  rating: number | null;
  comments: string | null;
  created_at: string;
};

type ComplaintRow = {
  task_id: string;
  created_at: string;
  feedback: FeedbackRow[] | null;
};

type RecentFeedback = {
  complaintId: string;
  student: string;
  rating: number | null;
  comments: string;
};

type RatingTrendEntry = {
  date: Date; // actual date for X-axis
  timestamp: string; // formatted for tooltip
  rating: number;
};

/* ================= COMPONENT ================= */
export default function PerformanceInsightsPage() {
  const [complaints, setComplaints] = useState<ComplaintRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] =
    useState<RecentFeedback | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [monthFilter, setMonthFilter] = useState(6); // default last 6 months

  /* ============== FETCH DATA ============== */
  useEffect(() => {
    const fetchPerformanceData = async () => {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData?.user) return;

      const { data, error } = await supabase
        .from("complaints")
        .select(`
          task_id,
          created_at,
          feedback (
            rating,
            comments,
            created_at
          )
        `)
        .eq("assigned_to", authData.user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching complaints:", error);
      } else {
        setComplaints(data ?? []);
      }

      setLoading(false);
    };

    fetchPerformanceData();
  }, []);

  /* ============== METRICS ============== */
  const allRatings = complaints
    .flatMap((c) => c.feedback ?? [])
    .map((f) => f.rating)
    .filter((r): r is number => r !== null);

  const averageRating =
    allRatings.length > 0
      ? allRatings.reduce((a, b) => a + b, 0) / allRatings.length
      : 0;

  const totalTasks = complaints.length;

  /* ============== RECENT FEEDBACK ============== */
  const recentFeedback: RecentFeedback[] = complaints.map((c) => {
    const feedback = c.feedback?.[0];
    return {
      complaintId: c.task_id,
      student: "Student",
      rating: feedback?.rating ?? null,
      comments:
        feedback?.comments ?? "Student hasn't submitted feedback",
    };
  });

  const sortedFeedback = [...recentFeedback].sort((a, b) => {
    if (a.rating !== null && b.rating === null) return -1;
    if (a.rating === null && b.rating !== null) return 1;
    return 0;
  });

  const feedbackToShow = showAll ? sortedFeedback : sortedFeedback.slice(0, 5);

  /* ============== RATING TREND (Continuous Timeline) ============== */
  const allRatingTrend: RatingTrendEntry[] = complaints
    .flatMap((c) => c.feedback ?? [])
    .filter((f) => f.rating !== null)
    .map((f) => {
      const dateObj = new Date(f.created_at);
      return {
        date: dateObj,
        timestamp: dateObj.toLocaleString("default", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        rating: f.rating!,
      };
    })
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  const trendStartDate = new Date();
  trendStartDate.setMonth(trendStartDate.getMonth() - monthFilter);

  const ratingTrend = allRatingTrend.filter(
    (entry) => entry.date >= trendStartDate
  );

  const trendChange = () => {
    if (ratingTrend.length < 2) return 0;
    const first = ratingTrend[0].rating;
    const last = ratingTrend[ratingTrend.length - 1].rating;
    return ((last - first) / (first || 1)) * 100;
  };

  /* ============== STAR RENDER ============== */
  const renderStars = (rating: number) => {
    const full = Math.floor(rating);
    const half = rating - full >= 0.5;
    const empty = 5 - full - (half ? 1 : 0);

    return (
      <div className="flex gap-1">
        {Array(full)
          .fill(0)
          .map((_, i) => (
            <Star key={i} className="w-4 h-4" fill="#facc15" stroke="#facc15" />
          ))}
        {half && <StarHalf className="w-4 h-4" fill="#facc15" stroke="#facc15" />}
        {Array(empty)
          .fill(0)
          .map((_, i) => (
            <Star key={`e-${i}`} className="w-4 h-4 text-gray-300" />
          ))}
      </div>
    );
  };

  if (loading) return <div className="p-6">Loading performance insights...</div>;

  /* ================= UI ================= */
  return (
    <div className="p-4 sm:p-6 space-y-6">
      <h1 className="text-2xl font-bold text-purple-700">
        Performance Insights
      </h1>

      {/* Average Rating */}
      <div className="bg-white rounded-xl shadow p-4 sm:p-6">
        <p className="text-sm text-gray-600">Average Rating</p>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-3xl sm:text-4xl font-bold text-purple-600">
            {averageRating.toFixed(1)}
          </span>
          {renderStars(averageRating)}
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Out of <b>{totalTasks}</b> tasks handled
        </p>
      </div>

      {/* Recent Feedback */}
      <div className="bg-white rounded-xl shadow p-4 sm:p-6 overflow-x-auto">
        <h2 className="font-semibold text-purple-700 mb-3">Recent Feedback</h2>

        <table className="min-w-full text-sm border-collapse">
          <thead className="bg-purple-100">
            <tr>
              <th className="p-2 text-left">Task ID</th>
              <th className="p-2 text-left">Rating</th>
              <th className="p-2 text-left">Comments</th>
            </tr>
          </thead>
          <tbody>
            {feedbackToShow.map((f, i) => (
              <tr key={i} className="border-b border-gray-300">
                <td className="p-2">
                  <button
                    onClick={() => setSelectedComplaint(f)}
                    className="hover:underline text-left"
                  >
                    {f.complaintId}
                  </button>
                </td>
                <td className="p-2">
                  {f.rating !== null ? (
                    renderStars(f.rating)
                  ) : (
                    <span className="text-gray-400 italic">Not rated yet</span>
                  )}
                </td>
                <td className="p-2">
                  <span
                    className={
                      f.rating === null ? "text-gray-400 italic" : "text-gray-700"
                    }
                  >
                    {f.comments}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {sortedFeedback.length > 5 && (
          <button
            className="mt-2 text-purple-600 hover:underline"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? "See Less" : "See More"}
          </button>
        )}
      </div>

      {/* Rating Trend */}
      <div className="bg-white rounded-xl shadow p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
          <h2 className="font-semibold text-purple-700">Rating Trend</h2>
          <select
            value={monthFilter}
            onChange={(e) => setMonthFilter(Number(e.target.value))}
            className="border rounded px-2 py-1 text-sm w-full sm:w-auto"
          >
            <option value={1}>Last 1 month</option>
            <option value={3}>Last 3 months</option>
            <option value={6}>Last 6 months</option>
            <option value={12}>Last 12 months</option>
          </select>
        </div>

        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={ratingTrend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              scale="time"
              type="number"
              domain={["dataMin", "dataMax"]}
              tickFormatter={(time) =>
                new Date(time).toLocaleString("default", {
                  month: "short",
                  year: "numeric",
                })
              }
            />
            <YAxis domain={[0, 5]} />
            <Tooltip
              labelFormatter={(value) =>
                `Date: ${new Date(value).toLocaleString("default", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}`
              }
              formatter={(value: any) => [`Rating: ${value}`, ""]}
            />
            <Line
              type="monotone"
              dataKey="rating"
              stroke="#7c3aed"
              strokeWidth={3}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>

        <p className="text-sm text-gray-600 mt-2">
          Trend: {trendChange() >= 0 ? "+" : ""}
          {trendChange().toFixed(1)}%
        </p>
      </div>

      {/* Complaint Detail Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-4 sm:p-6 w-full sm:w-3/4 md:w-1/2 max-h-[95vh] overflow-auto relative">
            <button
              onClick={() => setSelectedComplaint(null)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
            <ComplaintDetailPage complaintId={selectedComplaint.complaintId} />
          </div>
        </div>
      )}
    </div>
  );
}
