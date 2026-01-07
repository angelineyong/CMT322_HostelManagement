import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowRight, Check, X, Minus } from "lucide-react";
import FeedbackForm from "./FeedbackForm";
import { supabase } from "../../lib/supabaseClient";

const TrackComplaint: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("");
  
  const [feedbackComplaintId, setFeedbackComplaintId] = useState<string | null>(null);
  const [feedbackData, setFeedbackData] = useState<{ [key: string]: { stars: number; comment: string } }>({});
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loadingComplaints, setLoadingComplaints] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  

  // Get feedbackId from URL query (when user clicks feedback link from email)
  const [searchParams] = useSearchParams();
  const feedbackId = searchParams.get("feedbackId");
  const navigate = useNavigate();

  // Auto-open feedback form if feedbackId exists in URL
  useEffect(() => {
    if (feedbackId) {
      setFeedbackComplaintId(feedbackId);
      window.history.replaceState({}, "", "/student/track");
    }
  }, [feedbackId]);

  // Helper to format dates as dd-mm-yyyy
  const formatDate = (iso?: string | null) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  };

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id ?? null);
    });
  }, []);

  // Fetch complaints and related lookup tables from Supabase
  useEffect(() => {
    const load = async () => {
      setLoadingComplaints(true);
      try {

        if (!currentUserId) return;

        const complaintsRes = await supabase
          .from("complaints")
          .select(`
            task_id,
            user_id,
            facility_type_id,
            description,
            feedback,
            status_id,
            created_at
          `)
          .eq("user_id", currentUserId)
          .order("created_at", { ascending: false });


        if (complaintsRes.error) {
          setFetchError((complaintsRes.error as any)?.message || String(complaintsRes.error));
          throw complaintsRes.error;
        }
        setFetchError(null);

        const [facilitiesRes, statusesRes, studentsRes] = await Promise.all([
          supabase.from("facility_type").select("id, facility_type"),
          supabase.from("status").select("id, status_name"),
          supabase.from("students").select("id, room_no"),
        ]);

        const facMap: Record<number, string> = {};
        (facilitiesRes.data || []).forEach((f: any) => {
          facMap[f.id] = f.facility_type;
        });

        const statusMap: Record<number, string> = {};
        (statusesRes.data || []).forEach((s: any) => {
          statusMap[s.id] = s.status_name;
        });

        const studentRoomMap: Record<string, string> = {};
        (studentsRes.data || []).forEach((s: any) => {
          studentRoomMap[s.id] = s.room_no;
        });

        const mapped = (complaintsRes.data || []).map((c: any) => {
          return {
            complaintId: c.task_id, 
            facilityCategory: facMap[c.facility_type_id] || "",
            location: studentRoomMap[c.user_id] || "",
            dateSubmitted: formatDate(c.created_at),
            rawDate: c.created_at,
            status: statusMap[c.status_id] || "",
            statusId: c.status_id,
            feedback: c.feedback === true,
            description: c.description,
          };
        });

        setComplaints(mapped);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Error loading complaints:", err);
        setFetchError((err as any)?.message || String(err));
      } finally {
        setLoadingComplaints(false);
      }
    };

    load();
  }, [currentUserId]);

  // Handle feedback submission
  const handleFeedbackSubmit = (complaintId: string, feedback: string, rating: number) => {
    console.log("Feedback submitted:", { complaintId, feedback, rating });

    // Save feedback in local state
    setFeedbackData((prev) => ({
      ...prev,
      [complaintId]: { stars: rating, comment: feedback },
    }));

    setComplaints((prev) =>
      prev.map((c) =>
        c.complaintId === complaintId
          ? { ...c, feedback: true }
          : c
      )
    );

    // alert(`Thank you for your feedback on ${complaintId}!`);
  };

  // Filter + sort complaints
  const filteredAndSortedComplaints = useMemo(() => {
    let result = [...complaints];
    const term = searchTerm.toLowerCase();

    // ---------- FILTER ----------
    if (searchTerm) {
      result = result.filter((c) =>
        (c.complaintId || "").toLowerCase().includes(term) ||
        (c.facilityCategory || "").toLowerCase().includes(term) ||
        (c.location || "").toLowerCase().includes(term) ||   // room_no
        (c.status || "").toLowerCase().includes(term)
      );
    }

    // ---------- SORT ----------
    switch (sortBy) {
      case "date-asc":
        result.sort(
          (a, b) =>
            new Date(a.rawDate || "").getTime() -
            new Date(b.rawDate || "").getTime()
        );
        break;

      case "date-desc":
        result.sort(
          (a, b) =>
            new Date(b.rawDate || "").getTime() -
            new Date(a.rawDate || "").getTime()
        );
        break;

      case "type":
        result.sort((a, b) =>
          String(a.facilityCategory || "").localeCompare(
            String(b.facilityCategory || "")
          )
        );
        break;

      case "status":
        result.sort((a, b) =>
          String(a.status || "").localeCompare(String(b.status || ""))
        );
        break;
    }

    return result;
  }, [searchTerm, sortBy, complaints]);


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
              <option value="type">Facility</option>
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
                      onClick={() => navigate(`/complaint/${complaint.complaintId}`)}
                      className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[9px] sm:text-[12px] md:text-[15px] font-semibold flex items-center gap-0.5 sm:gap-1 transition-all duration-200 shadow-sm hover:scale-105 whitespace-nowrap
                        ${
                          complaint.status === "Resolved"
                            ? "bg-green-100 text-green-700 border border-green-400 hover:bg-green-200"
                            : complaint.status === "In Progress"
                            ? "bg-blue-100 text-blue-700 border border-blue-400 hover:bg-blue-200"
                            : complaint.status === "Pending"
                            ? "bg-amber-100 text-amber-700 border border-amber-400 hover:bg-amber-200"
                            : "bg-pink-100 text-pink-700 border border-pink-300 hover:bg-gray-200"
                        }`}
                    >
                      {complaint.status}
                      <span className="text-gray-500 text-xs sm:text-sm ml-0.5 sm:ml-1 shrink-0">
                        <ArrowRight size={12} />
                      </span>
                    </button>
                  </td>

                  {/* Feedback Column */}
                  <td className="py-2 sm:py-3">
                    {complaint.statusId === 4 ? (
                      complaint.feedback === true ? (
                        <button
                          onClick={() => setFeedbackComplaintId(complaint.complaintId)}
                          className="hover:scale-110 transition-transform"
                          title="View feedback"
                        >
                          <Check className="w-4 sm:w-5 h-4 sm:h-5 text-green-600 inline" />
                        </button>
                      ) : (
                        <button
                          onClick={() => setFeedbackComplaintId(complaint.complaintId)}
                          className="hover:scale-110 transition-transform"
                          title="Click to give feedback"
                        >
                          <X className="w-4 sm:w-5 h-4 sm:h-5 text-red-500 inline" />
                        </button>
                      )
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
      {/* Loading / empty state */}
      {loadingComplaints && (
        <div className="mt-4 text-center text-sm text-gray-600">Loading complaints…</div>
      )}
      {!loadingComplaints && complaints.length === 0 && (
        <div className="mt-4 text-center text-sm text-gray-600">No complaints found.</div>
      )}
      
      {fetchError && (
        <div className="mt-3 text-center text-sm text-red-600">Error loading complaints: {fetchError}</div>
      )}
      {!loadingComplaints && complaints.length > 0 && (
        <div className="mt-2 text-sm text-gray-600">Loaded {complaints.length} complaints.</div>
      )}

      

     {/* Feedback Form Modal */}
    {feedbackComplaintId && (
      <FeedbackForm
        complaintId={feedbackComplaintId}
        onClose={() => setFeedbackComplaintId(null)}
        onSubmit={handleFeedbackSubmit}
        // existingFeedback={
        //   // First check local state (newly submitted feedback), else check fetched complaints
        //   feedbackData[feedbackComplaintId] ||
        //   (complaints.find((c) => c.complaintId === feedbackComplaintId && c.feedback)
        //     ? { stars: 0, comment: "" }
        //     : undefined)
        // }
      />
    )}
    </div>
  );
};

export default TrackComplaint;
