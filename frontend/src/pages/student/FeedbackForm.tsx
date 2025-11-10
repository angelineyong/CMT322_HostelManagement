import React, { useState } from "react";
import { X, Star } from "lucide-react";

interface FeedbackFormProps {
  complaintId: string;
  onClose: () => void;
  onSubmit: (complaintId: string, feedback: string, rating: number) => void;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({
  complaintId,
  onClose,
  onSubmit,
}) => {
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      alert("Please select a rating before submitting!");
      return;
    }
    onSubmit(complaintId, feedback, rating);
    onClose();
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex justify-center items-center z-50">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-8 relative animate-fadeIn">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <X size={22} />
        </button>

        <h2 className="text-2xl font-semibold text-indigo-700 mb-6 text-center">
          Submit Feedback
        </h2>

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
                  onClick={() => setRating(num)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    size={32}
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
              onChange={(e) => setFeedback(e.target.value)}
            />
          </div>

          {/* Submit button */}
          <div className="text-center">
            <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
            >
              Submit Feedback
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeedbackForm;
