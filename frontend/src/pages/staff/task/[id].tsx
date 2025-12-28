import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
// import { sendFeedbackEmail } from "../../../components/Email"; // Keep if needed or comment out if not ready
import { supabase } from "../../../lib/supabaseClient";
import EditableSelect from "../../../components/EditableSelect";
import { ArrowLeft, X } from "lucide-react";

interface TaskDetail {
  id: string; // UUID
  taskId: string; // Readable TASK0001
  category: string; // "Individual" or "Shared" (derived)
  facilityType: string;
  desc: string;
  status: string; // "Submitted", "In Progress", "Resolved", "Rejected"
  statusId: number;

  // Student Info
  studentName: string;
  matricNo?: string; // Removed from UI as requested, but keeping in type just in case
  hpNo: string;
  room: string;
  block: string;
  email: string;

  // Assignment
  assignmentGroup: string; // Name
  assignmentGroupId: string; // UUID
  assignedTo: string; // Name
  assignedToId: string; // UUID

  // Timestamps
  openedAt: string;
  openedBy: string; // Same as studentName usually

  // Evidence
  imageUrl: string | null;
}

// Interfaces for History
interface Comment {
  id: string;
  user_name: string;
  comment: string;
  created_at: string;
}

interface Note {
  id: string;
  staff_name: string;
  note: string;
  created_at: string;
}

interface StatusLog {
  id: string;
  old_status: string;
  new_status: string;
  changed_by: string;
  created_at: string;
}

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [task, setTask] = useState<TaskDetail | null>(null);
  const [originalTask, setOriginalTask] = useState<TaskDetail | null>(null); // Track original state
  const [loading, setLoading] = useState(true);

  // History State
  const [comments, setComments] = useState<Comment[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [logs, setLogs] = useState<StatusLog[]>([]);
  const [activeTab, setActiveTab] = useState<"comments" | "notes" | "logs">(
    "comments"
  );

  // For dropdowns
  const [groupOptions, setGroupOptions] = useState<string[]>([]);
  const [staffOptions, setStaffOptions] = useState<string[]>([]);
  const [statusOptions, setStatusOptions] = useState<string[]>([]);

  const [groupMap, setGroupMap] = useState<Record<string, string>>({});
  const [staffMap, setStaffMap] = useState<Record<string, string>>({});
  const [statusMap, setStatusMap] = useState<Record<string, string>>({});

  // Local edits
  const [workNotes, setWorkNotes] = useState("");
  const [additionalComments, setAdditionalComments] = useState("");
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  // Calculate if there are unsaved changes
  const isDirty =
    (task &&
      originalTask &&
      (task.assignmentGroup !== originalTask.assignmentGroup ||
        task.assignedTo !== originalTask.assignedTo ||
        task.status !== originalTask.status)) ||
    workNotes.trim().length > 0 ||
    additionalComments.trim().length > 0;

  // Warn on page unload (browser close/refresh)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // Handle Back Navigation with warning
  const handleBack = () => {
    if (isDirty) {
      const confirmLeave = window.confirm(
        "You have unsaved changes. Are you sure you want to leave?"
      );
      if (!confirmLeave) return;
    }
    navigate(-1);
  };

  useEffect(() => {
    if (id) {
      fetchTaskDetails();
    }
    fetchDropdownOptions();
  }, [id]);

  const fetchTaskDetails = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("complaints")
        .select(
          `
          *,
          facility_type ( facility_type, category_id ),
          status ( id, status_name ),
          assignment_groups ( id, name ),
          assigned_to_profile:assigned_to ( id, full_name ),
          profiles:user_id ( 
            id, 
            full_name, 
            email, 
            phone,
            students ( room_no, hostel_block ) 
          )
        `
        )
        .eq("task_id", id)
        .single();

      if (error) throw error;
      if (!data) {
        setTask(null);
        return;
      }

      const studentData =
        data.profiles?.students?.[0] || data.profiles?.students;

      const mappedTask: TaskDetail = {
        id: data.id,
        taskId: data.task_id,
        category:
          data.facility_type?.category_id === 1 ? "Individual" : "Shared",
        facilityType: data.facility_type?.facility_type || "Unknown",
        desc: data.description,
        status: data.status?.status_name || "Unknown",
        statusId: data.status_id,

        studentName: data.profiles?.full_name || "Unknown",
        hpNo: data.profiles?.phone || "-",
        email: data.profiles?.email || "",

        block: studentData?.hostel_block || "-",
        room: studentData?.room_no || "-",

        assignmentGroup: data.assignment_groups?.name || "Unassigned",
        assignmentGroupId: data.assignment_group_id,
        assignedTo: data.assigned_to_profile?.full_name || "Unassigned",
        assignedToId: data.assigned_to,

        openedAt: new Date(data.created_at).toLocaleString(),
        openedBy: data.profiles?.full_name || "System",

        imageUrl: data.image_url,
      };

      setTask(mappedTask);
      setOriginalTask(mappedTask);

      // Need real ID for history if we used task_id in URL, but fetchHistory handles it by refetching or using param if consistent?
      // Actually fetchHistory needs the UUID 'id' (data.id), not the 'task_id' string from URL if param is taskId.
      // But here `id` param IS the `task_id` (TASK001).
      // The history tables reference the UUID.
      // So detailed fetchHistory MUST run AFTER we have data.id.

      // Let's call fetchHistory explicitly here with the correct UUID
      fetchHistoryForUUID(data.id);

      if (mappedTask.assignmentGroupId) {
        fetchStaffForGroup(mappedTask.assignmentGroup);
      }
    } catch (err) {
      console.error("Error fetching task:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistoryForUUID = async (uuid: string) => {
    // Re-implement fetching logic with confirmed UUID
    // Comments
    const { data: c } = await supabase
      .from("complaint_comments")
      .select(`id, comment, created_at, profiles(full_name)`)
      .eq("complaint_id", uuid)
      .order("created_at", { ascending: false });
    setComments(
      (c || []).map((x: any) => ({
        id: x.id,
        user_name: x.profiles?.full_name || "Unknown",
        comment: x.comment,
        created_at: new Date(x.created_at).toLocaleString(),
      }))
    );

    // Notes
    const { data: n } = await supabase
      .from("complaint_internal_notes")
      .select(`id, note, created_at, profiles:staff_id(full_name)`)
      .eq("complaint_id", uuid)
      .order("created_at", { ascending: false });
    setNotes(
      (n || []).map((x: any) => ({
        id: x.id,
        staff_name: x.profiles?.full_name || "Unknown",
        note: x.note,
        created_at: new Date(x.created_at).toLocaleString(),
      }))
    );

    // Logs
    const { data: l } = await supabase
      .from("complaint_status_logs")
      .select(
        `id, created_at, profiles:changed_by(full_name), old_status:previous_status_id(status_name), new_status:new_status_id(status_name)`
      )
      .eq("complaint_id", uuid)
      .order("created_at", { ascending: false });
    setLogs(
      (l || []).map((x: any) => ({
        id: x.id,
        old_status: x.old_status?.status_name || "-",
        new_status: x.new_status?.status_name || "-",
        changed_by: x.profiles?.full_name || "System",
        created_at: new Date(x.created_at).toLocaleString(),
      }))
    );
  };

  const fetchDropdownOptions = async () => {
    // 1. Groups
    const { data: groups } = await supabase
      .from("assignment_groups")
      .select("id, name");
    const gMap: Record<string, string> = {};
    const gOpts = (groups || []).map((g) => {
      gMap[g.name] = g.id;
      return g.name;
    });
    setGroupMap(gMap);
    setGroupOptions(gOpts);

    // 2. Statuses
    const { data: statuses } = await supabase
      .from("status")
      .select("id, status_name");
    const stMap: Record<string, string> = {};
    const stOpts = (statuses || []).map((s) => {
      stMap[s.status_name] = s.id;
      return s.status_name;
    });
    setStatusMap(stMap);
    setStatusOptions(stOpts);
  };

  const fetchStaffForGroup = async (groupName: string) => {
    if (!groupName || groupName === "Unassigned") return;
    const { data: staffList } = await supabase
      .from("staff")
      .select(`id, profiles ( full_name )`)
      .eq("assigned_group", groupName);

    const sMap: Record<string, string> = {};
    const sOpts = (staffList || []).map((s: any) => {
      const name = s.profiles?.full_name || "Unknown";
      sMap[name] = s.id;
      return name;
    });
    setStaffMap(sMap);
    setStaffOptions(sOpts);
  };

  const updateLocalField = (field: keyof TaskDetail, value: string) => {
    setTask((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleUpdate = async () => {
    if (!task) return;
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const updates: any = {};

      // 1. Check Assignment Group
      const newGroupId = groupMap[task.assignmentGroup];
      if (newGroupId && newGroupId !== task.assignmentGroupId) {
        updates.assignment_group_id = newGroupId;
      }

      // 2. Check Assigned To
      const newStaffId = staffMap[task.assignedTo];
      if (newStaffId && newStaffId !== task.assignedToId) {
        updates.assigned_to = newStaffId;
      }

      // 3. Check Status
      const newStatusId = statusMap[task.status];
      if (newStatusId && Number(newStatusId) !== task.statusId) {
        // statusId in DB is integer
        updates.status_id = Number(newStatusId);
      }

      // Always update 'updated_by'
      updates.updated_by = user.id;

      let hasChanges = Object.keys(updates).length > 1; // >1 because updated_by is always there

      if (hasChanges) {
        const { error } = await supabase
          .from("complaints")
          .update(updates)
          .eq("id", task.id);

        if (error) throw error;
      }

      // 4. Insert Comments (if any)
      if (additionalComments.trim()) {
        const { error: commentError } = await supabase
          .from("complaint_comments")
          .insert({
            complaint_id: task.id,
            user_id: user.id, // Staff commenting
            comment: additionalComments,
          });
        if (commentError) console.error("Error adding comment:", commentError);
        else {
          hasChanges = true;
          setAdditionalComments(""); // Clear on success
        }
      }

      // 5. Insert Internal Notes (if any)
      if (workNotes.trim()) {
        const { error: noteError } = await supabase
          .from("complaint_internal_notes")
          .insert({
            complaint_id: task.id,
            staff_id: user.id,
            note: workNotes,
          });
        if (noteError) console.error("Error adding note:", noteError);
        else {
          hasChanges = true;
          setWorkNotes(""); // Clear on success
        }
      }

      if (hasChanges) {
        alert("Changes saved successfully!");
        fetchTaskDetails(); // Refresh all data, re-syncs originalTask
      } else {
        alert("No changes to save.");
      }
    } catch (err) {
      console.error("Update error:", err);
      alert("Failed to update task.");
    }
  };

  const isResolved =
    task &&
    ["Resolved", "Closed", "Closed Complete", "Closed Incomplete"].includes(
      task.status
    );

  const handleResolveSubmit = async () => {
    if (!task) return;

    if (uploadedFiles.length === 0) {
      alert("Please upload evidence to resolve the incident.");
      return;
    }

    let evidenceUrl = null;
    if (uploadedFiles.length > 0) {
      const file = uploadedFiles[0];
      const fileName = `evidence/${task.taskId}_${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("complaints")
        .upload(fileName, file);

      if (uploadError) {
        alert("Error uploading evidence: " + uploadError.message);
        return;
      }

      const { data: publicUrl } = supabase.storage
        .from("complaints")
        .getPublicUrl(fileName);
      evidenceUrl = publicUrl.publicUrl;
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const resolvedId = statusMap["Resolved"]
        ? Number(statusMap["Resolved"])
        : 3;

      const { error } = await supabase
        .from("complaints")
        .update({
          status_id: resolvedId,
          resolved_at: new Date().toISOString(),
          resolved_evidence_url: evidenceUrl,
          updated_by: user.id,
        })
        .eq("id", task.id);

      if (error) throw error;

      alert("Incident resolved successfully!");
      setShowResolveModal(false);
      fetchTaskDetails();
    } catch (err) {
      console.error("Resolve error:", err);
      alert("Failed to resolve incident.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setUploadedFiles(Array.from(e.target.files));
  };

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

  if (loading) return <div className="p-6">Loading task details...</div>;
  if (!task) return <div className="p-6">Task not found.</div>;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="p-2 rounded-full hover:bg-purple-100"
          >
            <ArrowLeft className="w-5 h-5 text-purple-600" />
          </button>
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-purple-700">
              {task.taskId}
            </h1>
          </div>
        </div>
        <div className="flex gap-2">
          {!isResolved && (
            <>
              <button
                onClick={handleUpdate}
                disabled={!isDirty}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isDirty
                    ? "bg-gray-200 hover:bg-gray-300 cursor-pointer"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                Update
              </button>
              <button
                onClick={() => setShowResolveModal(true)}
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Resolve Incident
              </button>
            </>
          )}
        </div>
      </div>

      {/* Top Section */}
      <div className="bg-white/70 backdrop-blur-md rounded-xl border border-gray-200 shadow p-6 grid grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-3">
          <FieldRow label="Category" value={task.category} />
          <FieldRow label="Facility Type" value={task.facilityType} />
          {/* Removed Matric No */}
          <FieldRow label="HP No." value={task.hpNo} />
          {/* Split Block and Room */}
          <FieldRow label="Hostel Block" value={task.block} />
          <FieldRow label="Room Number" value={task.room} />
        </div>

        {/* Right Column */}
        <div className="space-y-3">
          <FieldRow label="Opened" value={task.openedAt} />
          <FieldRow label="Opened by" value={task.openedBy} />

          <div className="flex items-center gap-3">
            <label className="w-36 text-sm text-gray-600 text-right">
              Assignment Group
            </label>
            <EditableSelect
              options={groupOptions}
              value={task.assignmentGroup}
              onChange={(val) => {
                updateLocalField("assignmentGroup", val);
                // If group changes, we might want to clear assignedTo or re-fetch staff options
                fetchStaffForGroup(val);
                updateLocalField("assignedTo", "Unassigned");
              }}
            />
          </div>

          <div className="flex items-center gap-3">
            <label className="w-36 text-sm text-gray-600 text-right">
              Assigned To
            </label>
            <EditableSelect
              options={staffOptions}
              value={task.assignedTo}
              onChange={(val) => updateLocalField("assignedTo", val)}
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="w-36 text-sm text-gray-600 text-right">
              Status
            </label>
            {task.status === "Resolved" ||
            task.status === "Closed" ||
            task.status === "Closed Complete" ||
            task.status === "Closed Incomplete" ? (
              <input
                value={task.status}
                disabled
                className="flex-1 border rounded px-2 py-1 text-sm bg-gray-100"
              />
            ) : (
              <select
                value={task.status || "In Progress"}
                onChange={(e) => updateLocalField("status", e.target.value)}
                className="flex-1 border rounded px-2 py-1 text-sm cursor-pointer bg-white"
              >
                {statusOptions
                  .filter(
                    (opt) =>
                      ![
                        "Resolved",
                        "Closed",
                        "Closed Complete",
                        "Closed Incomplete",
                      ].includes(opt)
                  )
                  .map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
              </select>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="col-span-2 mt-3">
          <div className="flex items-start gap-3">
            <label className="w-36 text-sm text-gray-600 text-right pt-2">
              Description
            </label>
            <textarea
              value={task.desc || ""}
              disabled
              className="flex-1 border rounded px-2 py-2 text-sm bg-gray-100"
              rows={3}
            />
          </div>
        </div>
        {/* Connected Image with Label */}
        {task.imageUrl && (
          <div className="flex items-start gap-3 mt-4">
            <label className="w-36 text-sm text-gray-600 text-right pt-1">
              Attached Image
            </label>
            <div className="flex-1">
              <div
                className="relative group w-40 h-40 border rounded-lg overflow-hidden bg-gray-50 cursor-pointer hover:shadow-md transition-all"
                onClick={() => setShowImageModal(true)}
              >
                <img
                  src={task.imageUrl}
                  alt="Evidence"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <span className="text-xs bg-white/90 px-2 py-1 rounded shadow text-gray-800 font-medium">
                    Expand
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Notes Section */}
      <div className="bg-white/70 backdrop-blur-md rounded-xl border border-gray-200 shadow p-6 space-y-4">
        <h2 className="text-lg font-semibold text-purple-700 mb-4">
          Add Notes
        </h2>
        <div className="flex items-start gap-3">
          <label className="w-36 text-sm text-gray-600 text-right pt-2">
            Additional Comments
          </label>
          <textarea
            value={additionalComments}
            onChange={(e) => setAdditionalComments(e.target.value)}
            className="flex-1 border rounded px-2 py-2 text-sm"
            rows={2}
            placeholder="Visible to student..."
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
            rows={2}
            placeholder="Internal staff notes..."
          />
        </div>
      </div>

      {/* Activity History Section */}
      <div className="bg-white/70 backdrop-blur-md rounded-xl border border-gray-200 shadow p-6">
        <h2 className="text-lg font-semibold text-purple-700 mb-4">
          Activity History
        </h2>

        {/* Simple Tabs */}
        <div className="flex gap-4 border-b mb-4">
          <button
            onClick={() => setActiveTab("comments")}
            className={`pb-2 px-1 text-sm font-medium ${
              activeTab === "comments"
                ? "border-b-2 border-purple-600 text-purple-700"
                : "text-gray-500"
            }`}
          >
            Comments ({comments.length})
          </button>
          <button
            onClick={() => setActiveTab("notes")}
            className={`pb-2 px-1 text-sm font-medium ${
              activeTab === "notes"
                ? "border-b-2 border-purple-600 text-purple-700"
                : "text-gray-500"
            }`}
          >
            Work Notes ({notes.length})
          </button>
          <button
            onClick={() => setActiveTab("logs")}
            className={`pb-2 px-1 text-sm font-medium ${
              activeTab === "logs"
                ? "border-b-2 border-purple-600 text-purple-700"
                : "text-gray-500"
            }`}
          >
            Status Log ({logs.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="max-h-64 overflow-y-auto pr-2 space-y-3">
          {activeTab === "comments" &&
            (comments.length === 0 ? (
              <p className="text-gray-400 text-sm">No comments yet.</p>
            ) : (
              comments.map((c) => (
                <div key={c.id} className="border-b pb-2 last:border-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-sm text-gray-700">
                      {c.user_name}
                    </span>
                    <span className="text-xs text-gray-400">
                      {c.created_at}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{c.comment}</p>
                </div>
              ))
            ))}

          {activeTab === "notes" &&
            (notes.length === 0 ? (
              <p className="text-gray-400 text-sm">No work notes yet.</p>
            ) : (
              notes.map((n) => (
                <div
                  key={n.id}
                  className="border-b pb-2 last:border-0 bg-yellow-50/50 p-2 rounded"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-sm text-gray-700">
                      {n.staff_name}
                    </span>
                    <span className="text-xs text-gray-400">
                      {n.created_at}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{n.note}</p>
                </div>
              ))
            ))}

          {activeTab === "logs" &&
            (logs.length === 0 ? (
              <p className="text-gray-400 text-sm">No history yet.</p>
            ) : (
              logs.map((l) => (
                <div
                  key={l.id}
                  className="flex justify-between items-center py-2 border-b last:border-0"
                >
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-700">
                      Status changed from{" "}
                      <span className="font-medium">{l.old_status}</span> to{" "}
                      <span className="font-medium text-purple-600">
                        {l.new_status}
                      </span>
                    </span>
                    <span className="text-xs text-gray-500">
                      by {l.changed_by}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">{l.created_at}</span>
                </div>
              ))
            ))}
        </div>
      </div>

      {/* Resolve Modal */}
      {showResolveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-1/2 relative max-w-lg">
            <button
              onClick={() => setShowResolveModal(false)}
              className="absolute top-3 right-3"
            >
              <X />
            </button>
            <h3 className="text-lg font-semibold mb-4 text-purple-700">
              Resolve Incident
            </h3>

            <div className="mb-4">
              <p className="text-sm text-gray-700 mb-2 font-medium">
                Upload resolution evidence (Required):
              </p>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center bg-gray-50 hover:bg-white transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full text-sm text-gray-50 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                />
              </div>
            </div>

            {/* Preview */}
            {uploadedFiles.length > 0 && (
              <div className="mb-6 flex justify-center">
                <img
                  src={URL.createObjectURL(uploadedFiles[0])}
                  alt="Preview"
                  className="h-40 object-contain rounded-lg border shadow-sm"
                />
              </div>
            )}

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowResolveModal(false)}
                className="px-4 py-2 border rounded hover:bg-gray-50 text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleResolveSubmit}
                disabled={uploadedFiles.length === 0}
                className={`px-4 py-2 rounded text-white font-medium ${
                  uploadedFiles.length === 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-purple-500 hover:bg-purple-600"
                }`}
              >
                Submit & Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Expand Modal */}
      {showImageModal && task.imageUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setShowImageModal(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/50 rounded-full p-2"
            >
              <X size={24} />
            </button>
            <img
              src={task.imageUrl}
              alt="Full Evidence"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
