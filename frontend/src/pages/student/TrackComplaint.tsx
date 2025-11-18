import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { studentSummaryData } from "../../data/mockData";
import { ArrowRight, Check, X, Minus } from "lucide-react";
import ComplaintDetail from "./ComplaintDetail";
import FeedbackForm from "./FeedbackForm";

const TrackComplaint: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);
  const [feedbackComplaintId, setFeedbackComplaintId] = useState<string | null>(null);
  const [feedbackData, setFeedbackData] = useState<{ [key: string]: { stars: number; comment: string } }>({});

  // Get feedbackId from URL query (when user clicks feedback link from email)
  const [searchParams] = useSearchParams();
  const feedbackId = searchParams.get("feedbackId");

  // Auto-open feedback form if feedbackId exists in URL
  useEffect(() => {
    if (feedbackId) {
      setFeedbackComplaintId(feedbackId);
      window.history.replaceState({}, "", "/student/track");
    }
  }, [feedbackId]);

  // Handle feedback submission
  const handleFeedbackSubmit = (complaintId: string, feedback: string, rating: number) => {
    console.log("Feedback submitted:", { complaintId, feedback, rating });

    // Save feedback in local state
    setFeedbackData((prev) => ({
      ...prev,
      [complaintId]: { stars: rating, comment: feedback },
    }));

    // alert(`Thank you for your feedback on ${complaintId}!`);
  };

  // Filter + sort complaints
  const filteredAndSortedComplaints = useMemo(() => {
    let result = [...studentSummaryData];
    const term = searchTerm.toLowerCase();

    if (searchTerm) {
      result = result.filter(
        (c) =>
          c.complaintId.toLowerCase().includes(term) ||
          c.facilityCategory.toLowerCase().includes(term) ||
          c.location.toLowerCase().includes(term) ||
          c.roomNumber.toLowerCase().includes(term) ||
          c.status.toLowerCase().includes(term)
      );
    }

    switch (sortBy) {
      case "date-asc":
        result.sort(
          (a, b) =>
            new Date(a.dateSubmitted).getTime() - new Date(b.dateSubmitted).getTime()
        );
        break;
      case "date-desc":
        result.sort(
          (a, b) =>
            new Date(b.dateSubmitted).getTime() - new Date(a.dateSubmitted).getTime()
        );
        break;
      case "category":
        result.sort((a, b) => a.facilityCategory.localeCompare(b.facilityCategory));
        break;
      case "status":
        result.sort((a, b) => a.status.localeCompare(b.status));
        break;
    }

    return result;
  }, [searchTerm, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4 lg:p-6">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-indigo-700 mb-4 sm:mb-6 lg:mb-8">Complaint History</h1>

      <div className="flex justify-end mb-2 px-2 sm:px-0">
        <p className="text-xs sm:text-sm text-black italic">
          Tap the <span className="text-red-500 font-semibold">'X'</span> under{" "}
          <span className="font-medium text-indigo-700">Feedback</span> to rate and
          comment on your complaint resolution.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow p-3 sm:p-4 lg:p-8 transition-transform duration-300 hover:scale-[1.01]">
        {/* Search and Sort Controls */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search complaints..."
              className="w-full px-2 sm:px-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div>
            <select
              className="w-full sm:w-auto px-2 sm:px-4 py-2 rounded-lg border border-gray-200 text-[10px] focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="">Sort by Date ↓</option>
              <option value="date-asc">Date (Oldest)</option>
              <option value="date-desc">Date (Newest)</option>
              <option value="category">Facility Category</option>
              <option value="status">Status</option>
            </select>
          </div>
        </div>

        {/* Table - Responsive */}
        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="text-center text-indigo-700 border-b border-gray-300 bg-transparent">
                <th className="pb-2 sm:pb-3 text-xs sm:text-sm">ID</th>
                <th className="pb-2 sm:pb-3 text-xs sm:text-sm hidden sm:table-cell">Facility</th>
                <th className="pb-2 sm:pb-3 text-xs sm:text-sm">Location</th>
                <th className="pb-2 sm:pb-3 text-xs sm:text-sm hidden md:table-cell">Date</th>
                <th className="pb-2 sm:pb-3 text-xs sm:text-sm">Status</th>
                <th className="pb-2 sm:pb-3 text-xs sm:text-sm">Feedback</th>
              </tr>
            </thead>

            <tbody>
              {filteredAndSortedComplaints.map((complaint) => (
                <tr
                  key={complaint.complaintId}
                  className="text-[10px] sm:text-sm hover:bg-indigo-50 hover:scale-[1.02] transform transition-all duration-200 cursor-default text-center"
                >
                  <td className="py-2 sm:py-3">{complaint.complaintId}</td>
                  <td className="py-2 sm:py-3 hidden sm:table-cell">{complaint.facilityCategory}</td>
                  <td className="py-2 sm:py-3 text-[10px] sm:text-sm">
                    {complaint.location}
                  </td>
                  <td className="py-2 sm:py-3 hidden md:table-cell">{complaint.dateSubmitted}</td>

                  {/* Status Button */}
                  <td className="py-2 sm:py-3 flex justify-center">
                    <button
                      onClick={() => setSelectedComplaintId(complaint.complaintId)}
                      className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[9px] sm:text-[12px] md:text-[15px] font-semibold flex items-center gap-0.5 sm:gap-1 transition-all duration-200 shadow-sm hover:scale-105 whitespace-nowrap
                        ${
                          complaint.status === "Resolved"
                            ? "bg-green-100 text-green-700 border border-green-400 hover:bg-green-200"
                            : complaint.status === "In Progress"
                            ? "bg-blue-100 text-blue-700 border border-blue-400 hover:bg-blue-200"
                            : complaint.status === "Pending"
                            ? "bg-amber-100 text-amber-700 border border-amber-400 hover:bg-amber-200"
                            : "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200"
                        }`}
                    >
                      {complaint.status}
                      <span className="text-gray-500 text-xs sm:text-sm ml-0.5 sm:ml-1 flex-shrink-0">
                        <ArrowRight size={12} />
                      </span>
                    </button>
                  </td>

                  {/* Feedback Column */}
                  <td className="py-2 sm:py-3">
                    {complaint.feedbackSubmitted === 1 ? (
                      <button
                        onClick={() => setFeedbackComplaintId(complaint.complaintId)}
                        className="hover:scale-110 transition-transform"
                        title="View feedback"
                      >
                        <Check className="w-4 sm:w-5 h-4 sm:h-5 text-green-600 inline" />
                      </button>
                    ) : complaint.feedbackSubmitted === 0 ? (
                      <button
                        onClick={() => setFeedbackComplaintId(complaint.complaintId)}
                        className="hover:scale-110 transition-transform"
                        title="Click to give feedback"
                      >
                        <X className="w-4 sm:w-5 h-4 sm:h-5 text-red-500 inline" />
                      </button>
                    ) : (
                      <Minus className="w-4 sm:w-5 h-4 sm:h-5 text-gray-400 inline" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Complaint Detail Modal */}
      {selectedComplaintId && (
        <ComplaintDetail
          complaintId={selectedComplaintId}
          onClose={() => setSelectedComplaintId(null)}
        />
      )}

     {/* Feedback Form Modal */}
    {feedbackComplaintId && (
      <FeedbackForm
        complaintId={feedbackComplaintId}
        onClose={() => setFeedbackComplaintId(null)}
        onSubmit={handleFeedbackSubmit}
        existingFeedback={
          // First check local state (newly submitted feedback), else check mock data
          feedbackData[feedbackComplaintId] ||
          studentSummaryData.find(c => c.complaintId === feedbackComplaintId && c.feedbackSubmitted === 1)
            ? {
                stars: studentSummaryData.find(c => c.complaintId === feedbackComplaintId)?.feedbackStars || 0,
                comment: studentSummaryData.find(c => c.complaintId === feedbackComplaintId)?.feedbackComment || "",
              }
            : undefined
        }
      />
    )}
    </div>
  );
};

export default TrackComplaint;
