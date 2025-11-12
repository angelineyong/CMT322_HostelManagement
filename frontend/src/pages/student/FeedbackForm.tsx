import React, { useState, useEffect } from "react";
import { X, Star } from "lucide-react";
import { studentSummaryData } from "../../data/mockData";
import { useSearchParams } from "react-router-dom";

interface FeedbackFormProps {
  complaintId: string;
  onClose: () => void;
  onSubmit?: (complaintId: string, feedback: string, rating: number) => void;
  existingFeedback?: {
    stars: number;
    comment: string;
  };
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({
  complaintId: propComplaintId,
  onClose,
  onSubmit,
  existingFeedback,
}) => {
  const [searchParams] = useSearchParams();
  const urlComplaintId = searchParams.get("feedbackId");
  const complaintId = propComplaintId || urlComplaintId || "";

  const [feedback, setFeedback] = useState(existingFeedback?.comment || "");
  const [rating, setRating] = useState(existingFeedback?.stars || 0);
  const [complaintDetails, setComplaintDetails] = useState<any>(null);

  // Determine if this feedback should be read-only
  const isReadOnly = !!existingFeedback;

  useEffect(() => {
    if (complaintId) {
      const found = studentSummaryData.find((c) => c.complaintId === complaintId);
      setComplaintDetails(found || null);

      if (found && found.feedbackSubmitted === 1) {
        setRating(found.feedbackStars || 0);
        setFeedback(found.feedbackComment || "");
      }
    }
  }, [complaintId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    if (rating === 0) {
      alert("Please select a rating before submitting!");
      return;
    }
    if (onSubmit) {
      onSubmit(complaintId, feedback, rating);
    }
    alert(`Thank you for your feedback on ${complaintId}!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex justify-center items-center z-50">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-8 relative animate-fadeIn">
        {/* Close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          >
            <X size={22} />
          </button>
        )}

        <h2 className="text-2xl font-semibold text-indigo-700 mb-4 text-center">
          {isReadOnly ? "Feedback Submitted" : "Submit Feedback"}
        </h2>

        {/* Complaint Info */}
        {/* {complaintDetails ? (
          <div className="bg-indigo-50 p-4 rounded-lg mb-6 text-sm text-gray-700">
            <p>
              <span className="font-medium text-indigo-700">Complaint ID:</span>{" "}
              {complaintDetails.complaintId}
            </p>
            <p>
              <span className="font-medium text-indigo-700">Facility:</span>{" "}
              {complaintDetails.facilityCategory}
            </p>
            <p>
              <span className="font-medium text-indigo-700">Location:</span>{" "}
              {complaintDetails.location} / {complaintDetails.roomNumber}
            </p>
            <p>
              <span className="font-medium text-indigo-700">Date Submitted:</span>{" "}
              {complaintDetails.dateSubmitted}
            </p>
            <p>
              <span className="font-medium text-indigo-700">Status:</span>{" "}
              {complaintDetails.status}
            </p>
          </div>
        ) : (
          <div className="bg-yellow-50 p-4 rounded-lg mb-6 text-sm text-gray-700">
            <p className="font-semibold text-red-600">
              Complaint details not found — displaying ID only.
            </p>
            <p>
              <span className="font-medium text-indigo-700">Complaint ID:</span>{" "}
              {complaintId || "Unknown"}
            </p>
          </div>
        )} */}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Rating Stars */}
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

          {/* Feedback text */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Additional Comments:
            </label>
            <textarea
              rows={4}
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
              placeholder="Tell us about your experience..."
              value={feedback}
              onChange={(e) => !isReadOnly && setFeedback(e.target.value)}
              readOnly={isReadOnly}
            />
          </div>

          {/* Submit button */}
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
