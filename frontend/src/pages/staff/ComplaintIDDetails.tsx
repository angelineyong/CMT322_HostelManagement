import { useState, useEffect } from "react";
import { staffPerformanceData } from "../../data/mockData";
import type { Feedback } from "../../data/mockData";
import { Star, StarHalf } from "lucide-react";

interface ComplaintDetailPageProps {
  complaintId: string;
}

export default function ComplaintDetailPage({
  complaintId,
}: ComplaintDetailPageProps) {
  const [complaint, setComplaint] = useState<Feedback | null>(null);

  useEffect(() => {
    if (!complaintId) return;

    for (const staff of staffPerformanceData) {
      const found = staff.recentFeedback.find(
        (fb) => fb.complaintId === complaintId
      );
      if (found) {
        setComplaint(found);
        break;
      }
    }
  }, [complaintId]);

  if (!complaint)
    return (
      <div className="p-6 text-gray-500 text-center">Complaint not found.</div>
    );

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <h1 className="text-3xl font-bold text-purple-700 mb-4">
        Complaint Details
      </h1>

      {/* General Details */}
      <div className="bg-white/70 backdrop-blur-md rounded-xl border border-gray-200 shadow p-6 grid grid-cols-2 gap-4">
        <DetailRow label="Complaint ID" value={complaint.complaintId} />
        <DetailRow label="Student Name" value={complaint.student} />
        <DetailRow label="Location" value={complaint.location || "-"} />
        <DetailRow label="Room Number" value={complaint.roomNumber || "-"} />
        <DetailRow label="Category" value={complaint.assignmentGroup || "-"} />
        <DetailRow label="Description" value={complaint.description || "-"} />
      </div>

      {/* Rating & Comments Card */}
      <div className="bg-purple-50 border-l-4 border-purple-600 rounded-xl shadow-lg p-6 space-y-4">
        {/* Rating */}
        <div>
          <h2 className="text-xl font-semibold text-purple-700 mb-2">Rating</h2>
          <div className="flex items-center gap-4">
            <span className="text-3xl font-bold text-purple-600">
              {complaint.rating?.toFixed(1) || "-"}
            </span>
            <Stars rating={complaint.rating || 0} />
          </div>
        </div>

        {/* Comments */}
        <div>
          <h2 className="text-xl font-semibold text-purple-700 mb-2">
            Comments
          </h2>
          <p className="text-gray-800 text-sm whitespace-pre-wrap">
            {complaint.comments || "-"}
          </p>
        </div>
      </div>
    </div>
  );
}

// Reusable row for general details
const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center gap-3">
    <div className="w-40 text-sm text-gray-600 font-medium">{label}</div>
    <div className="flex-1 text-sm text-gray-800">{value}</div>
  </div>
);

// Stars component with half and full stars
const Stars = ({ rating }: { rating: number }) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  return (
    <div className="flex items-center gap-1">
      {Array(fullStars)
        .fill(0)
        .map((_, i) => (
          <Star
            key={`full-${i}`}
            className="w-7 h-7 text-yellow-400"
            fill="#FFD700"
          />
        ))}
      {halfStar && (
        <StarHalf className="w-7 h-7 text-yellow-400" fill="#FFD700" />
      )}
      {Array(emptyStars)
        .fill(0)
        .map((_, i) => (
          <Star key={`empty-${i}`} className="w-7 h-7 text-gray-300" />
        ))}
    </div>
  );
};
