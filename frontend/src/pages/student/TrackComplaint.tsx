import React, { useState, useMemo } from "react";
import { studentSummaryData } from "../../data/mockData";
import { ArrowRight } from "lucide-react";
import ComplaintDetail from "./ComplaintDetail";

const TrackComplaint: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);

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
            new Date(a.dateSubmitted).getTime() -
            new Date(b.dateSubmitted).getTime()
        );
        break;
      case "date-desc":
        result.sort(
          (a, b) =>
            new Date(b.dateSubmitted).getTime() -
            new Date(a.dateSubmitted).getTime()
        );
        break;
      case "category":
        result.sort((a, b) =>
          a.facilityCategory.localeCompare(b.facilityCategory)
        );
        break;
      case "status":
        result.sort((a, b) => a.status.localeCompare(b.status));
        break;
    }

    return result;
  }, [searchTerm, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50 p-10">
      <h1 className="text-4xl font-bold text-indigo-700 mb-10">
        Complaint History
      </h1>

      <div className="bg-white rounded-2xl shadow p-8 transition-transform duration-300 hover:scale-[1.01]">
        {/* Search and Sort Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search complaints..."
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div>
            <select
              className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
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

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="text-left text-gray-600 border-b border-gray-300 bg-transparent">
                <th className="pb-3">Complaint ID</th>
                <th className="pb-3">Facility Category</th>
                <th className="pb-3">Location / Room</th>
                <th className="pb-3">Date Submitted</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredAndSortedComplaints.map((complaint) => (
                <tr
                  key={complaint.complaintId}
                  className="border-b hover:bg-gray-50 hover:scale-[1.02] transform transition-all duration-200 cursor-default"
                >
                  <td className="py-3">{complaint.complaintId}</td>
                  <td className="py-3">{complaint.facilityCategory}</td>
                  <td className="py-3">
                    {complaint.location} / {complaint.roomNumber}
                  </td>
                  <td className="py-3">{complaint.dateSubmitted}</td>

                  {/* Status button */}
                  <td className="py-3">
                    <button
                      onClick={() => setSelectedComplaintId(complaint.complaintId)}
                      className={`px-4 py-1.5 rounded-full text-sm font-semibold flex items-center gap-1 transition-all duration-200 shadow-sm hover:scale-105
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
                      <span className="text-gray-500 text-base ml-2">
                        <ArrowRight size={16} />
                      </span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Popup */}
      {selectedComplaintId && (
        <ComplaintDetail
          complaintId={selectedComplaintId}
          onClose={() => setSelectedComplaintId(null)}
        />
      )}
    </div>
  );
};

export default TrackComplaint;
