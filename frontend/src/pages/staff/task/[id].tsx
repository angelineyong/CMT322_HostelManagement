import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  taskCategoryMap,
  groupOptions,
  staffOptions,
} from "../../../data/mockData";
import type { Task } from "@/types";
import EditableSelect from "../../../components/EditableSelect";
import { ArrowLeft, X } from "lucide-react";

export default function TaskDetailPage() {
  const { category, id } = useParams<{ category: string; id: string }>();
  const navigate = useNavigate();

  const [editableTask, setEditableTask] = useState<Task | null>(null);
  const [workNotes, setWorkNotes] = useState("");
  const [additionalComments, setAdditionalComments] = useState("");
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  useEffect(() => {
    if (category && id && taskCategoryMap[category]) {
      const foundTask =
        taskCategoryMap[category].find((t) => t.id === id) || null;
      setEditableTask(foundTask);
      setAdditionalComments("");
    }
  }, [category, id]);

  if (!editableTask)
    return <div className="p-6 text-gray-600">Task not found.</div>;

  const updateField = (field: keyof Task, value: string) => {
    if (field === "status") {
      if (value === "Closed Incomplete") {
        const confirmed = window.confirm(
          "Are you sure you want to cancel this incident?"
        );
        if (!confirmed) return;
      }
      // Once Closed Incomplete is confirmed, disable further edits
    }
    setEditableTask((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleUpdate = () => {
    console.log("Updated:", editableTask, workNotes, additionalComments);
    alert("Changes applied successfully!");
  };

  const handleResolveSubmit = () => {
    if (uploadedFiles.length === 0) {
      alert("Please upload at least one photo as evidence.");
      return;
    }
    // Set status to Closed Complete
    setEditableTask((prev) =>
      prev ? { ...prev, status: "Closed Complete" } : prev
    );
    setShowResolveModal(false);
    alert(`Incident ${editableTask?.id} resolved!`);
  };

  // File change handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setUploadedFiles(Array.from(e.target.files));
  };

  // Reusable side-by-side label + input
  const FieldRow = ({
    label,
    value,
    onChange,
    disabled = true,
    type = "text",
  }: {
    label: string;
    value: string;
    onChange?: (val: string) => void;
    disabled?: boolean;
    type?: string;
  }) => (
    <div className="flex items-center gap-3">
      <label className="w-36 text-sm text-gray-600 text-right">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        className={`flex-1 border rounded px-2 py-1 text-sm ${
          disabled ? "bg-gray-100" : ""
        }`}
      />
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-purple-100"
          >
            <ArrowLeft className="w-5 h-5 text-purple-600" />
          </button>
          <h1 className="text-2xl font-bold text-purple-700">
            {editableTask.id}
          </h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleUpdate}
            className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md text-sm font-medium cursor-pointer"
          >
            Update
          </button>
          <button
            onClick={() => setShowResolveModal(true)}
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium cursor-pointer"
          >
            Resolve Incident
          </button>
        </div>
      </div>

      {/* Top Section: Two-column layout */}
      <div className="bg-white/70 backdrop-blur-md rounded-xl border border-gray-200 shadow p-6 grid grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-3">
          <FieldRow label="Complaint ID" value={editableTask.id} />
          <FieldRow label="Category" value={editableTask.category} />
          <FieldRow
            label="Subcategory"
            value={editableTask.subcategory || ""}
          />
          <FieldRow label="Matric No." value={editableTask.matricNo || ""} />
          <FieldRow label="HP No." value={editableTask.hpNo || ""} />
          <FieldRow label="Location/Room" value={editableTask.location || ""} />
          <FieldRow
            label="Date of Service Not Function"
            type="date"
            value={editableTask.date || ""}
          />
        </div>

        {/* Right Column */}
        <div className="space-y-3">
          <FieldRow label="Opened" value={editableTask.openedAt || ""} />
          <FieldRow label="Opened by" value={editableTask.openedBy || ""} />
          <div className="flex items-center gap-3">
            <label className="w-36 text-sm text-gray-600 text-right">
              Assignment Group
            </label>
            <EditableSelect
              options={groupOptions}
              value={editableTask.assignmentGroup}
              onChange={(val) => updateField("assignmentGroup", val)}
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="w-36 text-sm text-gray-600 text-right">
              Assigned To
            </label>
            <EditableSelect
              options={staffOptions}
              value={editableTask.assignedTo}
              onChange={(val) => updateField("assignedTo", val)}
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="w-36 text-sm text-gray-600 text-right">
              Status
            </label>
            {editableTask.status === "Closed Complete" ||
            editableTask.status === "Closed Incomplete" ? (
              <input
                value={editableTask.status}
                disabled
                className="flex-1 border rounded px-2 py-1 text-sm bg-gray-100"
              />
            ) : (
              <select
                value={editableTask.status || "In Progress"}
                onChange={(e) => updateField("status", e.target.value)}
                className="flex-1 border rounded px-2 py-1 text-sm cursor-pointer"
              >
                <option>Open</option>
                <option>In Progress</option>
                <option>On Hold</option>
                <option>Closed Incomplete</option>
              </select>
            )}
          </div>
        </div>

        {/* Description Full Width */}
        <div className="col-span-2 mt-3">
          <div className="flex items-start gap-3">
            <label className="w-36 text-sm text-gray-600 text-right pt-2">
              Description
            </label>
            <textarea
              value={editableTask.desc || ""}
              disabled
              className="flex-1 border rounded px-2 py-2 text-sm bg-gray-100"
              rows={3}
            />
          </div>
        </div>
      </div>

      {/* Notes Section */}
      <div className="bg-white/70 backdrop-blur-md rounded-xl border border-gray-200 shadow p-6 space-y-4">
        <h2 className="text-lg font-semibold text-purple-700 mb-4">Notes</h2>

        <div className="flex items-start gap-3">
          <label className="w-36 text-sm text-gray-600 text-right pt-2">
            Additional Comments (Customer Visible)
          </label>
          <textarea
            value={additionalComments}
            onChange={(e) => setAdditionalComments(e.target.value)}
            className="flex-1 border rounded px-2 py-2 text-sm"
            rows={3}
            placeholder="Enter comments..."
          />
        </div>

        <div className="flex items-start gap-3">
          <label className="w-36 text-sm text-gray-600 text-right pt-2">
            Work Notes
          </label>
          <textarea
            value={workNotes}
            onChange={(e) => setWorkNotes(e.target.value)}
            className="flex-1 border rounded px-2 py-2 text-sm bg-yellow-50"
            rows={3}
            placeholder="Enter work notes..."
          />
        </div>
      </div>

      {/* Resolve Incident Modal */}
      {showResolveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-1/2 relative">
            <button
              onClick={() => setShowResolveModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <X />
            </button>
            <h3 className="text-lg font-semibold mb-4">Resolve Incident</h3>
            <p className="text-sm text-gray-600 mb-2">
              Upload at least one photo as evidence:
            </p>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="mb-4"
            />
            {uploadedFiles.length > 0 && (
              <div className="mb-4 space-y-2">
                {uploadedFiles.map((file, idx) => (
                  <div key={idx} className="text-sm">
                    {file.name}
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowResolveModal(false)}
                className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-100 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleResolveSubmit}
                className={`px-4 py-2 rounded-md text-white text-sm ${
                  uploadedFiles.length > 0
                    ? "bg-purple-500 hover:bg-purple-600"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
                disabled={uploadedFiles.length === 0}
              >
                Submit & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
