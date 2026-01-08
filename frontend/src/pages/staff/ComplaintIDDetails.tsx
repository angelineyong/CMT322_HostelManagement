import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Star, StarHalf } from "lucide-react";

interface FeedbackRow {
  rating: number | null;
  comments: string | null;
  created_at: string;
}

interface ComplaintRow {
  task_id: string;
  user_id: string | null;
  student_name?: string;
  room_no?: string;
  hostel_block?: string;
  description: string | null;
  feedback?: FeedbackRow[];
}

interface ComplaintDetailPageProps {
  complaintId: string;
}

export default function ComplaintDetailPage({ complaintId }: ComplaintDetailPageProps) {
  const [complaint, setComplaint] = useState<ComplaintRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!complaintId) return;

    const fetchComplaint = async () => {
      setLoading(true);
      setErrorMsg(null);

      try {
        const { data: complaintData, error: complaintError } = await supabase
          .from("complaints")
          .select("task_id, user_id, description")
          .eq("task_id", complaintId)
          .single();
        if (complaintError) throw complaintError;

        const { data: studentData, error: studentError } = await supabase
          .from("students")
          .select("room_no, hostel_block")
          .eq("id", complaintData.user_id)
          .single();
        if (studentError) throw studentError;

        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", complaintData.user_id)
          .single();
        if (profileError) throw profileError;

        const { data: feedbackData, error: feedbackError } = await supabase
          .from("feedback")
          .select("rating, comments, created_at")
          .eq("complaint_id", complaintId);
        if (feedbackError) throw feedbackError;

        setComplaint({
          ...complaintData,
          student_name: profileData?.full_name || "-",
          room_no: studentData?.room_no || "-",
          hostel_block: studentData?.hostel_block || "-",
          feedback: feedbackData || [],
        });
      } catch (err: any) {
        console.error("Error fetching complaint:", err);
        setErrorMsg(err.message || "Failed to fetch complaint data.");
      } finally {
        setLoading(false);
      }
    };

    fetchComplaint();
  }, [complaintId]);

  if (loading) return <div className="p-6 text-center text-gray-500">Loading complaint details...</div>;
  if (errorMsg) return <div className="p-6 text-center text-red-500">{errorMsg}</div>;
  if (!complaint) return <div className="p-6 text-center text-gray-500">Complaint not found.</div>;

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-purple-700 mb-4">
        Complaint Details
      </h1>

      {/* General Details */}
      <div className="bg-white/70 backdrop-blur-md rounded-xl border border-gray-200 shadow p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <DetailRow label="Complaint ID" value={complaint.task_id || "-"} />
        <DetailRow label="Student Name" value={complaint.student_name || "-"} />
        <DetailRow label="Room Number" value={complaint.room_no || "-"} />
        <DetailRow label="Hostel Block" value={complaint.hostel_block || "-"} />
        <DetailRow label="Description" value={complaint.description || "-"} fullWidth />
      </div>

      {/* Feedback */}
      <div className="bg-purple-50 border-l-4 border-purple-600 rounded-xl shadow-lg p-4 sm:p-6 space-y-4">
        <h2 className="text-xl font-semibold text-purple-700 mb-2">
          Feedback
        </h2>

        {complaint.feedback && complaint.feedback.length > 0 ? (
          complaint.feedback.map((fb, idx) => (
            <div key={idx} className="bg-white rounded-md shadow p-4 space-y-2">
              {/* Rating + Stars + Timestamp */}
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-lg font-semibold text-purple-600">
                  {fb.rating !== null ? fb.rating.toFixed(1) : "-"}
                </span>
                <Stars rating={fb.rating || 0} />
                <span className="text-gray-400 text-sm whitespace-nowrap">
                  {new Date(fb.created_at).toLocaleString()}
                </span>
              </div>
              {/* Feedback Comments */}
              <p className="text-gray-800 text-sm">{fb.comments || "-"}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-500 italic">No feedback submitted yet.</p>
        )}
      </div>
    </div>
  );
}

// Reusable row for general details
const DetailRow = ({
  label,
  value,
  fullWidth = false,
}: {
  label: string;
  value: string;
  fullWidth?: boolean;
}) => (
  <div className={`flex flex-col sm:flex-row sm:items-center ${fullWidth ? "sm:col-span-2" : ""} gap-1`}>
    <div className="text-sm text-gray-600 font-medium w-full sm:w-40">{label}</div>
    <div className="text-sm text-gray-800 flex-1">{value}</div>
  </div>
);

// Stars component
const Stars = ({ rating }: { rating: number }) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  return (
    <div className="flex items-center gap-1">
      {Array(fullStars)
        .fill(0)
        .map((_, i) => (
          <Star key={`full-${i}`} className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" fill="#FFD700" />
        ))}
      {halfStar && <StarHalf className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" fill="#FFD700" />}
      {Array(emptyStars)
        .fill(0)
        .map((_, i) => (
          <Star key={`empty-${i}`} className="w-5 h-5 sm:w-6 sm:h-6 text-gray-300" />
        ))}
    </div>
  );
};
