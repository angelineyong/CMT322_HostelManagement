import { useState } from "react";
import { staffPerformanceData } from "../../data/mockData"; // value import
import type { StaffPerformance, Feedback } from "../../data/mockData";
import { Star, StarHalf } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function PerformanceInsightsPage() {
  const [selectedStaff] = useState<StaffPerformance>(staffPerformanceData[0]);

  const trendChange = () => {
    const ratings = selectedStaff.ratingTrend;
    if (ratings.length < 2) return 0;
    const last = ratings[0].averageRating;
    const first = ratings[ratings.length - 1].averageRating;
    return ((last - first) / first) * 100;
  };

  // Convert numeric rating to stars
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating - fullStars >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    return (
      <div className="flex items-center gap-1">
        {Array(fullStars)
          .fill(0)
          .map((_, i) => (
            <Star key={`full-${i}`} className="w-5 h-5 text-yellow-400" />
          ))}
        {halfStar && <StarHalf className="w-5 h-5 text-yellow-400" />}
        {Array(emptyStars)
          .fill(0)
          .map((_, i) => (
            <Star key={`empty-${i}`} className="w-5 h-5 text-gray-300" />
          ))}
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-purple-700">
          Performance Insights
        </h1>
      </div>

      {/* Average Rating */}
      <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col gap-2 transform transition-transform duration-300 hover:scale-102">
        {/* Label on top */}
        <p className="text-sm text-gray-600 font-medium leading-tight">
          Average Rating
        </p>

        {/* Numeric rating + stars */}
        <div className="flex items-center gap-2">
          <div className="text-4xl font-extrabold text-purple-600 leading-none">
            {selectedStaff.averageRating.toFixed(1)}
          </div>
          <div>{renderStars(selectedStaff.averageRating)}</div>
        </div>

        {/* Total tasks */}
        <div className="text-sm text-gray-500 leading-none">
          Out of{" "}
          <span className="text-sm font-semibold text-purple-500">
            {selectedStaff.totalTasks}
          </span>{" "}
          tasks handled
        </div>
      </div>

      {/* Recent Feedback */}
      <div className="bg-white/70 backdrop-blur-md rounded-xl border border-gray-200 shadow p-6 transform transition-transform duration-300 hover:scale-102">
        <h2 className="text-md font-semibold text-purple-700 mb-4">
          Recent Feedback
        </h2>
        <div className="overflow-x-auto rounded-md">
          <table className="min-w-full table-auto border border-gray-200 ">
            <thead>
              <tr className="bg-purple-100">
                <th className="p-2 text-left text-sm font-medium w-1/6">
                  Complaint ID
                </th>
                <th className="p-2 text-left text-sm font-medium w-1/6">
                  Student
                </th>
                <th className="p-2 text-left text-sm font-medium w-1/6">
                  Rating
                </th>
                <th className="p-2 text-left text-sm font-medium w-3/6">
                  Comments
                </th>
              </tr>
            </thead>
            <tbody>
              {selectedStaff.recentFeedback.map((fb: Feedback, idx) => (
                <tr key={idx} className="border-t border-gray-200">
                  <td className="p-2 text-xs w-1/5">{fb.complaintId}</td>
                  <td className="p-2 text-xs w-1/5">{fb.student}</td>
                  <td className="p-2 text-xs w-1/5">
                    {renderStars(fb.rating)}
                  </td>
                  <td className="p-2 text-sm w-2/5">{fb.comments}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rating Trend */}
      <div className="bg-white/70 backdrop-blur-md rounded-xl border border-gray-200 shadow p-6 transform transition-transform duration-300 hover:scale-102">
        <h2 className="text-md font-semibold text-purple-700 mb-4">
          Rating Trend (Last 6 Months)
        </h2>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart
            data={[...selectedStaff.ratingTrend].reverse()} // oldest month left
            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis domain={[0, 5]} />
            <Tooltip formatter={(value: number) => value.toFixed(1)} />
            <Line
              type="monotone"
              dataKey="averageRating"
              stroke="#7c3aed"
              strokeWidth={3}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
        <p className="mt-2 text-sm text-gray-600">
          Last 6 months {trendChange() >= 0 ? "+" : "-"}{" "}
          {trendChange().toFixed(1)}%
        </p>
      </div>
    </div>
  );
}
