import React, { useEffect, useState } from "react";
import { X, Star } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

/* ===================== Types ===================== */

interface FeedbackFormProps {
  // complaintId?: string;
  complaintId: string;
  onClose: () => void;
  onSubmit?: (complaintId: string, feedback: string, rating: number) => void;
}

interface Student {
  id: string;
  room_no: string;
  hostel_block: string;
}

interface Complaint {
  id: string;
  task_id: string;
  description: string;
  status_id: number;
  created_at: string;
}

interface FeedbackDetail {
  feedback_id: number | null;
  rating: number;
  comments: string;
  student: Student;
  complaint?: Complaint | null;
}

/* ===================== Component ===================== */

const FeedbackForm: React.FC<FeedbackFormProps> = ({
  complaintId: propComplaintId,
  onClose,
  onSubmit,
}) => {
  const [searchParams] = useSearchParams();
  const urlComplaintId = searchParams.get("feedbackId");
  // const complaintId = propComplaintId || urlComplaintId || "";
  const complaintId = propComplaintId;

  const [rating, setRating] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>("");
  const [feedbackDetails, setFeedbackDetails] = useState<FeedbackDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const isReadOnly = feedbackDetails?.feedback_id !== null;

  /* ===================== Fetch Feedback + Student ===================== */
  useEffect(() => {
    if (!complaintId) return;

    const fetchData = async () => {
      setLoading(true);

      try {
        // Get logged-in user
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          console.error("User not logged in:", userError);
          setLoading(false);
          return;
        }

        // Fetch student corresponding to logged-in user
        const { data: studentData, error: studentError } = await supabase
          .from("students")
          .select("id, room_no, hostel_block")
          .eq("id", user.id)
          .maybeSingle();

        if (studentError || !studentData) {
          console.error("Student record not found:", studentError);
          setLoading(false);
          return;
        }

        // Fetch existing feedback (if any)
        const { data: feedbackData } = await supabase
          .from("feedback")
          .select("feedback_id, rating, comments")
          .eq("complaint_id", complaintId)
          .maybeSingle();

        setFeedbackDetails({
          feedback_id: feedbackData?.feedback_id ?? null,
          rating: feedbackData?.rating ?? 0,
          comments: feedbackData?.comments ?? "",
          student: studentData,
        });

        setRating(feedbackData?.rating ?? 0);
        setFeedback(feedbackData?.comments ?? "");
      } catch (err) {
        console.error("Error fetching feedback/student:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [complaintId]);

  /* ===================== Submit Feedback ===================== */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      alert("Please select a rating.");
      return;
    }

    if (!feedbackDetails?.student) {
      alert("Student information missing. Cannot submit feedback.");
      return;
    }

    try {
      // Update existing feedback
      if (feedbackDetails.feedback_id) {
        const { error } = await supabase
          .from("feedback")
          .update({ rating, comments: feedback })
          .eq("feedback_id", feedbackDetails.feedback_id);

        if (error) throw error;
      } 
      // Insert new feedback
      else {
        const { error } = await supabase
          .from("feedback")
          .insert({
            complaint_id: complaintId,
            student_id: feedbackDetails.student.id,
            rating,
            comments: feedback,
          });

        if (error) throw error;

        // Optionally update complaint feedback status
        const { error: complaintError } = await supabase
          .from("complaints")
          .update({ feedback: true })
          .eq("task_id", complaintId);

        if (complaintError) console.warn("Error updating complaint:", complaintError);
      }

      alert("Thank you for your feedback!");
      onSubmit?.(complaintId, feedback, rating);
      onClose();
    } catch (err) {
      console.error("Submit feedback error:", err);
      alert("Failed to submit feedback. Please try again.");
    }
    window.location.reload();
    
  };

  /* ===================== UI ===================== */
  if (loading || !feedbackDetails) return <div>Loading...</div>;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-8 relative">
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

        {/* Feedback Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Rating */}
          <div>
            <label className="block font-medium mb-2">Rate Your Experience</label>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  type="button"
                  key={num}
                  onClick={() => !isReadOnly && setRating(num)}
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
            <label className="block font-medium mb-2">Additional Comments</label>
            <textarea
              rows={4}
              value={feedback}
              readOnly={isReadOnly}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          {/* Submit */}
          {!isReadOnly && (
            <div className="text-center">
              <button
                type="submit"
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
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
