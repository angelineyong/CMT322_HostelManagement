import React from "react";
import { useParams } from "react-router-dom";
import { studentSummaryData } from "../../data/mockData"; 

// Define the tracker steps
const steps = [
  { label: "Submitted" },
  { label: "Verified" },
  { label: "In Progress" },
  { label: "Resolved" },
  { label: "Feedback" },
];

const ComplaintDetail: React.FC = () => {
  const { complaintId } = useParams<{ complaintId: string }>();

  // ✅ Find the matching complaint from mock data
  const complaint = studentSummaryData.find(
    (item) => item.complaintId === complaintId
  );

  if (!complaint) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600 text-lg">
        Complaint not found 😢
      </div>
    );
  }

  // Determine current step index based on complaint.status
  const currentStep = steps.findIndex(
    (s) => s.label.toLowerCase() === complaint.status.toLowerCase()
  );

  return (
    <div className="min-h-screen bg-gray-50 p-10">
      <div className="bg-white rounded-2xl shadow p-8 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-indigo-700 mb-6">
          Complaint Summary
        </h1>

        {/* Complaint Information */}
        <div className="grid grid-cols-2 gap-4 text-gray-700 mb-10">
          <p>
            <strong>Complaint ID:</strong> {complaint.complaintId}
          </p>
          <p>
            <strong>Facility Category:</strong> {complaint.facilityCategory}
          </p>
          <p>
            <strong>Location:</strong> {complaint.location}
          </p>
          <p>
            <strong>Room Number:</strong> {complaint.roomNumber}
          </p>
          <p>
            <strong>Date Submitted:</strong> {complaint.dateSubmitted}
          </p>
          <p>
            <strong>Status:</strong>{" "}
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
          </p>
        </div>

        {/* Status Tracker */}
        <div className="relative flex items-center justify-between mt-12">
          {steps.map((step, index) => (
            <div key={step.label} className="flex flex-col items-center w-full">
              {/* Step circle */}
              <div
                className={`w-10 h-10 flex items-center justify-center rounded-full font-bold border-2 z-10 transition-all duration-300 ${
                  index <= currentStep
                    ? "bg-indigo-600 text-white border-indigo-600 scale-110"
                    : "bg-gray-200 text-gray-500 border-gray-300"
                }`}
              >
                {index + 1}
              </div>

              {/* Step label */}
              <p
                className={`mt-2 text-sm font-medium ${
                  index <= currentStep ? "text-indigo-700" : "text-gray-400"
                }`}
              >
                {step.label}
              </p>

              {/* Connecting line */}
              {index < steps.length - 1 && (
                <div
                  className={`absolute top-5 left-[10%] w-[80%] h-1 rounded-full z-0 transition-colors duration-300 ${
                    index < currentStep ? "bg-indigo-500" : "bg-gray-300"
                  }`}
                ></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetail;
