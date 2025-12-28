import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Pickaxe, MessageSquare, Image as ImageIcon, MessageCircle, ChevronDown, ChevronUp } from "lucide-react";
import samplePhoto from "../../assets/SampleFix.jpg";
import FeedbackForm from "./FeedbackForm";

interface ComplaintDetailProps {
  complaintId: string | null;
  onClose: () => void;
}

const steps = [
  {
    label: "Submitted",
    description:
      "Your complaint has been successfully submitted and recorded in the system.",
  },
  {
    label: "Pending",
    description:
      "A staff member has reviewed your complaint and confirmed the issue details.",
  },
  {
    label: "In Progress",
    description:
      "The maintenance team is currently solving the issue.",
  },
  {
    label: "Resolved",
    description:
      "The issue has been resolved.",
  },
];

const ComplaintDetail: React.FC<ComplaintDetailProps> = ({ complaintId, onClose }) => {
  if (!complaintId) return null;

  const [complaint, setComplaint] = useState<any | null>(null);
  const [loadingComplaint, setLoadingComplaint] = useState<boolean>(true);
  const [showComment, setShowComment] = useState(false);
  const [showPhoto, setShowPhoto] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);

  const formatDate = (iso?: string | null) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  };

  const formatDateTime = (iso?: string | null) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    return `${dd}-${mm}-${yyyy} ${hh}:${min}`;
  };

  useEffect(() => {
    const load = async () => {
      setLoadingComplaint(true);
      try {
        // attempt to extract numeric id from complaintId
        // support formats like TASK10001 (we produced TASK1000{id}), or plain numeric IDs
        let numericId: number | null = null;
        const taskMatch = complaintId.match(/TASK1000(\d+)$/i);
        if (taskMatch) {
          numericId = Number(taskMatch[1]);
        } else {
          const numericMatch = complaintId.match(/(\d+)$/);
          numericId = numericMatch ? Number(numericMatch[1]) : null;
        }

        let { data: compData, error: compError } = numericId
          ? await supabase.from("complaint").select("*").eq("id", numericId).limit(1).single()
          : await supabase.from("complaint").select("*").eq("complaint_id", complaintId).limit(1).single();

        if (compError) throw compError;

        const c = compData as any;

        // fetch facility and status names (handle multiple possible column names)
        const { data: facData } = await supabase
          .from("facility_type")
          .select("*")
          .eq("id", c.facility_type)
          .limit(1)
          .single();

        const { data: statData } = await supabase
          .from("status")
          .select("*")
          .eq("id", c.status)
          .limit(1)
          .single();

        const facilityName = facData?.facility_type ?? facData?.name ?? facData?.label ?? "";
        const statusName = statData?.status_name ?? statData?.name ?? statData?.label ?? String(c.status ?? "");

        const roomNumber = c.room_number ?? c.roomNumber ?? c.room_no ?? c.room ?? "";
        const location = c.location ?? c.loc ?? "";
        const dateIso = c.created_at ?? c.createdAt ?? null;
        const updatedAtIso = c.updated_at ?? c.updatedAt ?? null;

        setComplaint({
          numericId: c.id,
          complaintId: numericId ? `TASK1000${numericId}` : complaintId,
          facilityCategory: facilityName,
          location,
          roomNumber,
          dateSubmitted: formatDate(dateIso),
          updatedAtIso,
          status: statusName,
          description: c.description || "",
          feedback: c.feedback === true,
        });
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Error loading complaint detail:", err);
        setComplaint(null);
      }
      finally {
        setLoadingComplaint(false);
      }
    };

    load();
  }, [complaintId]);

  if (loadingComplaint) {
    return (
      <div className="fixed inset-0 bg-transparent bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="p-6">
          <p className="text-gray-700">Loading complaint...</p>
        </div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <p className="text-gray-600">Complaint not found...</p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // If status is Resolved, also show Feedback as next active stage
  let currentStep = steps.findIndex((s) => s.label.toLowerCase() === complaint.status.toLowerCase());
  if (complaint.status === "Resolved") {
    currentStep = steps.length - 1; // include Feedback step
  }

  return (
    <div className="fixed inset-0 bg-transparent bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      {/* Modal container with scroll and max height */}
      <div className="relative bg-white backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200 w-full max-w-3xl animate-[fadeIn_0.3s_ease-out] max-h-[80vh]">
        {/* Close button */}
         <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 text-gray-600 hover:text-gray-800 text-2xl font-bold"
        >
          &times;
        </button>

        {/* Inner scrollable content */}
        <div className="p-8 max-h-[80vh] overflow-y-auto">
          {/* Title */}
          <h1 className="text-3xl font-bold text-indigo-700 mb-9 text-center">
            Track Complaint
          </h1>

          {/* Complaint info boxes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
            {[
              { title: "Complaint ID", value: complaint.complaintId },
              { title: "Facility Category", value: complaint.facilityCategory },
              { title: "Location", value: complaint.location },
              { title: "Room Number", value: complaint.roomNumber },
              { title: "Date Submitted", value: complaint.dateSubmitted },
              {
                title: "Status",
                value: (
                  <span
                    className={`font-semibold ${
                      complaint.status === "Resolved"
                        ? "text-green-600"
                        : complaint.status === "In Progress"
                        ? "text-blue-600"
                        : complaint.status === "Pending"
                        ? "text-amber-600"
                        : "text-gray-600"
                    }`}
                  >
                    {complaint.status}
                  </span>
                ),
              },
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="text-xs font-semibold text-gray-600 mb-1 ml-1 tracking-wide">
                  {item.title.toUpperCase()}
                </div>
                <div className="border border-gray-300 rounded-lg px-4 py-2 text-gray-800 bg-transparent backdrop-blur-sm hover:border-indigo-400 transition-all duration-200">
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          {/* Vertical tracker */}
          <div className="mt-10">
            <h2 className="text-xl font-semibold text-indigo-700 mb-6 mb-4 flex items-center gap-2">
                <Pickaxe className="w-5 h-5 text-indigo-600" />
                Complaint Progress
            </h2>

            <div className="relative border-l-2 border-gray-300 ml-5 pl-6 space-y-8">
              {steps.map((step, index) => {
                const isActive = index <= currentStep;
                return (
                  <div key={index} className="relative flex flex-col gap-1">
                    {/* Circle */}
                    <span
                      className={`absolute -left-[40px] w-7 h-7 rounded-full flex items-center justify-center font-semibold text-xs border-2 ${
                        isActive
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-gray-200 text-gray-500 border-gray-300"
                      }`}
                    >
                      {index + 1}
                    </span>

                    {/* Step label */}
                    <h3
                      className={`font-semibold text-2sm ${
                        isActive ? "text-indigo-700" : "text-gray-500"
                      }`}
                    >
                      {step.label}
                    </h3>

                    {/* Step description */}
                    <p
                      className={`text-xs leading-relaxed ${
                        isActive ? "text-gray-700" : "text-gray-400"
                      }`}
                    >
                      {step.label === "Resolved" && complaint.updatedAtIso
                        ? `${step.description} Resolved on ${formatDateTime(
                            complaint.updatedAtIso
                          )}`
                        : step.description}
                    </p>

                    {/* Collapsible: In Progress Comment */}
                    {isActive && step.label === "In Progress" && (
                      <div className="mt-3 ml-1">
                        <button
                          onClick={() => setShowComment(!showComment)}
                          className="flex items-center gap-2 text-blue-600 text-xs font-semibold hover:underline"
                        >
                          <MessageSquare size={14} />
                          {showComment ? "Hide Staff Comment" : "View Staff Comment"}
                          {showComment ? (
                            <ChevronUp size={14} />
                          ) : (
                            <ChevronDown size={14} />
                          )}
                        </button>

                        {showComment && (
                          <div className="mt-2 border border-blue-300 bg-blue-50/70 backdrop-blur-sm rounded-lg p-3 text-xs text-gray-700">
                            <strong>Staff Comment:</strong> This issue involves electrical
                            wiring and has been forwarded to the maintenance department
                            for specialized handling.
                          </div>
                        )}
                      </div>
                    )}

                    {/* Collapsible: Resolved Photo */}
                    {isActive && step.label === "Resolved" && (
                      <div className="mt-3 ml-1">
                        <button
                          onClick={() => setShowPhoto(!showPhoto)}
                          className="flex items-center gap-2 text-green-600 text-xs font-semibold hover:underline"
                        >
                          <ImageIcon size={14} />
                          {showPhoto ? "Hide Uploaded Photo" : "View Uploaded Photo"}
                          {showPhoto ? (
                            <ChevronUp size={14} />
                          ) : (
                            <ChevronDown size={14} />
                          )}
                        </button>

                        {showPhoto && (
                          <div className="mt-3">
                            <img
                              src={samplePhoto}
                              alt="Resolved proof"
                              className="w-60 h-36 rounded-lg border border-gray-300 shadow-sm object-cover"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      {showFeedbackForm && (
      <FeedbackForm
        complaintId={complaint.complaintId}
        onClose={() => setShowFeedbackForm(false)}
        onSubmit={(complaintId, feedback, rating) => {
          console.log("Feedback submitted for:", complaintId);
          console.log("Rating:", rating);
          console.log("Feedback:", feedback);
          alert("Thank you for your feedback!");
          setShowFeedbackForm(false);
        }}
      />
    )}
    </div>
  );
};

export default ComplaintDetail;
