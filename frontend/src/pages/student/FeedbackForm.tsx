import React, { useEffect, useState } from "react";
import { X, Star } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

/* ===================== Types ===================== */

interface FeedbackFormProps {
  complaintId?: string;
  onClose: () => void;
  onSubmit?: (complaintId: string, feedback: string, rating: number) => void;
  existingFeedback?: {
    stars: number;
    comment: string;
  };
}

interface FeedbackDetail {
  feedback_id: number; // Use as star rating
  comments: string;
  student: {
    room_no: string;
    hostel_block: string;
  };
  complaint: {
    task_id: string;
    description: string;
    status_id: number;
    created_at: string;
  };
}

/* ===================== Component ===================== */

const FeedbackForm: React.FC<FeedbackFormProps> = ({
  complaintId: propComplaintId,
  onClose,
  onSubmit,
  existingFeedback,
}) => {
  const [searchParams] = useSearchParams();
  const urlComplaintId = searchParams.get("feedbackId");
  const complaintId = propComplaintId || urlComplaintId || "";

  const [rating, setRating] = useState<number>(existingFeedback?.stars || 0);
  const [feedback, setFeedback] = useState<string>(
    existingFeedback?.comment || ""
  );
  const [feedbackDetails, setFeedbackDetails] = useState<FeedbackDetail | null>(null);
  const isReadOnly = !!existingFeedback;

  /* ===================== Fetch Feedback ===================== */

  useEffect(() => {
    const fetchFeedbackDetails = async () => {
      if (!complaintId) return;

      const { data, error } = await supabase
        .from("feedback")
        .select(`
          feedback_id,
          comments,
          student:student_id (*),
          complaint:complaint_id (task_id, description, status_id, created_at)
        `)
        .eq("complaint_id", complaintId)
        .single();

      if (error) {
        console.error("Error fetching feedback details:", error);
        setFeedbackDetails(null);
      } else if (data) {
        // Map feedback_id to rating, comments to textarea
        setRating(data.feedback_id);
        setFeedback(data.comments || "");
        setFeedbackDetails({
          feedback_id: data.feedback_id,
          comments: data.comments,
          student: data.student?.[0] || { room_no: "N/A", hostel_block: "N/A" }, // extract first
          complaint: data.complaint?.[0] || {
            task_id: "N/A",
            description: "N/A",
            status_id: 0,
            created_at: "",
          },
        });
      }
    };

    fetchFeedbackDetails();
  }, [complaintId]);

  /* ===================== Submit ===================== */

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      alert("Please select a rating before submitting.");
      return;
    }
    if (onSubmit) {
      onSubmit(complaintId, feedback, rating);
    }
    alert("Thank you for your feedback!");
    onClose();
  };

  /* ===================== UI ===================== */

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex justify-center items-center z-50">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-8 relative animate-fadeIn">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <X size={22} />
        </button>

        <h2 className="text-2xl font-semibold text-indigo-700 mb-4 text-center">
          {isReadOnly ? "Feedback Submitted" : "Submit Feedback"}
        </h2>

        {/* Complaint + Student Details */}
        {feedbackDetails ? (
          <div className="bg-indigo-50 p-4 rounded-lg mb-6 text-sm text-gray-700">
            <p>
              <span className="font-medium text-indigo-700">Complaint ID:</span>{" "}
              {feedbackDetails.complaint.task_id}
            </p>
            <p>
              <span className="font-medium text-indigo-700">Description:</span>{" "}
              {feedbackDetails.complaint.description}
            </p>
            <p>
              <span className="font-medium text-indigo-700">Location:</span>{" "}
              {feedbackDetails.student.room_no} / {feedbackDetails.student.hostel_block}
            </p>
            <p>
              <span className="font-medium text-indigo-700">Date Submitted:</span>{" "}
              {new Date(feedbackDetails.complaint.created_at).toLocaleDateString()}
            </p>
            <p>
              <span className="font-medium text-indigo-700">Status ID:</span>{" "}
              {feedbackDetails.complaint.status_id}
            </p>
          </div>
        ) : (
          <div className="bg-yellow-50 p-4 rounded-lg mb-6 text-sm text-gray-700">
            <p className="font-semibold text-red-600">Complaint details not found.</p>
            <p>
              <span className="font-medium text-indigo-700">Complaint ID:</span>{" "}
              {complaintId || "Unknown"}
            </p>
          </div>
        )}

        {/* Feedback Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Rating */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Rate Your Experience:
            </label>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  type="button"
                  key={num}
                  onClick={() => !isReadOnly && setRating(num)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    size={36}
                    fill={num <= rating ? "#ffce00" : "none"}
                    stroke={num <= rating ? "#ffce00" : "#d1d5db"}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Additional Comments:
            </label>
            <textarea
              rows={4}
              value={feedback}
              readOnly={isReadOnly}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Tell us about your experience..."
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
            />
          </div>

          {/* Submit */}
          {!isReadOnly && (
            <div className="text-center">
              <button
                type="submit"
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
              >
                Submit Feedback
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default FeedbackForm;
