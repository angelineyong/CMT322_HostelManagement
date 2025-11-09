import React from "react";
import { studentSummaryData } from "../../data/mockData";

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
    label: "Verified",
    description:
      "A staff member has reviewed your complaint and confirmed the issue details.",
  },
  {
    label: "In Progress",
    description:
      "The maintenance team is currently addressing the issue.",
  },
  {
    label: "Resolved",
    description:
      "The issue has been resolved. Please review the result below.",
  },
  {
    label: "Feedback",
    description:
      "You can provide feedback regarding the fix or service quality.",
  },
];

const ComplaintDetail: React.FC<ComplaintDetailProps> = ({
  complaintId,
  onClose,
}) => {
  if (!complaintId) return null;

  const complaint = studentSummaryData.find(
    (item) => item.complaintId === complaintId
  );

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

  const currentStep = steps.findIndex(
    (s) => s.label.toLowerCase() === complaint.status.toLowerCase()
  );

  return (
    <div className="fixed inset-0 bg-transparent bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      {/* Modal container with scroll and max height */}
      <div className="relative bg-white backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200 w-full max-w-3xl animate-[fadeIn_0.3s_ease-out] max-h-[80vh] overflow-y-auto">
        {/* Inner scrollable content */}
        <div className="p-8">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-4 text-gray-600 hover:text-gray-800 text-2xl font-bold"
          >
            &times;
          </button>

          {/* Title */}
          <h1 className="text-3xl font-bold text-indigo-700 mb-8 text-center">
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
            <h2 className="text-lg font-semibold text-indigo-700 mb-4">
              Complaint Progress
            </h2>

            <div className="relative border-l-2 border-gray-300 ml-5 pl-6 space-y-8">
              {steps.map((step, index) => {
                const isActive = index <= currentStep;
                return (
                  <div key={index} className="relative flex flex-col gap-1">
                    {/* Circle */}
                    <span
                      className={`absolute -left-[22px] w-6 h-6 rounded-full flex items-center justify-center font-semibold text-xs border-2 ${
                        isActive
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-gray-200 text-gray-500 border-gray-300"
                      }`}
                    >
                      {index + 1}
                    </span>

                    {/* Step label */}
                    <h3
                      className={`font-semibold text-sm ${
                        isActive ? "text-indigo-700" : "text-gray-500"
                      }`}
                    >
                      {step.label}
                    </h3>

                    {/* Description */}
                    <p
                      className={`text-xs leading-relaxed ${
                        isActive ? "text-gray-700" : "text-gray-400"
                      }`}
                    >
                      {step.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetail;
