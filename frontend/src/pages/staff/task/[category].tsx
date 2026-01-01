import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import EditableSelect from "../../../components/EditableSelect";
import { supabase } from "../../../lib/supabaseClient";

interface Task {
  id: string; // UUID
  taskId: string; // Readable ID (TASK0001)
  desc: string;
  assignmentGroup: string; // Name
  assignmentGroupId: string; // UUID
  assignedTo: string; // Name
  assignedToId: string; // UUID
  openedAt: string;
  facilityType: string;
}

export default function TaskCategoryPage() {
  const { category } = useParams();
  const navigate = useNavigate();
  // Decode URL param (e.g. "ceiling-fan" -> "Ceiling Fan")
  // The logic in AccordionSection navigation was .toLowerCase().replace(/\s+/g, "-")
  // So we might need fuzzy matching or strict inverse.
  // Ideally we should pass ID, but title is friendlier.
  // Let's rely on string comparison for now, ignoring case.
  const targetCategory = category?.replace(/-/g, " ");

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Dropdown Options
  const [groupOptions, setGroupOptions] = useState<string[]>([]);
  const [staffOptions, setStaffOptions] = useState<string[]>([]);

  // Maps for ID lookup when saving
  const [groupMap, setGroupMap] = useState<Record<string, string>>({}); // Name -> ID
  const [staffMap, setStaffMap] = useState<Record<string, string>>({}); // Name -> ID

  useEffect(() => {
    fetchData();
  }, [category]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Get My Group Name (to filter visibility)
      const { data: staffData } = await supabase
        .from("staff")
        .select("assigned_group")
        .eq("id", user.id)
        .single();
      const myGroupName = staffData?.assigned_group;

      // 2. Resolve My Group ID
      let myGroupId = "";
      if (myGroupName) {
        const { data: gData } = await supabase
          .from("assignment_groups")
          .select("id")
          .eq("name", myGroupName)
          .single();
        myGroupId = gData?.id;
      }

      if (!myGroupId) {
        setTasks([]); // Cannot see tasks if not in a group
        return;
      }

      // 3. Fetch Complaints (Filtered by Group)
      // We perform client-side filtering for Facility Type because lookup on joined table with ILIKE is complex via JS client without RPC
      // OR we can fetch all for group and filter in JS (dataset likely small enough typical for one group)
      const { data: complaints, error } = await supabase
        .from("complaints")
        .select(
          `
          *,
          status!inner ( status_name ),
          facility_type ( facility_type ),
          assignment_groups ( id, name ),
          assigned_to_profile:assigned_to ( id, full_name )
        `
        )
        .eq("assignment_group_id", myGroupId)
        .filter(
          "status.status_name",
          "not.in",
          '("Resolved","Closed","Closed Complete","Closed Incomplete")'
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      // 4. Transform & Filter by Category param
      // normalize target: "ceiling fan"
      const normalizedTarget = targetCategory?.toLowerCase() || "";

      const filteredTasks: Task[] = (complaints || [])
        .filter((c: any) => {
          const fType = c.facility_type?.facility_type?.toLowerCase() || "";
          return fType === normalizedTarget;
        })
        .map((c: any) => ({
          id: c.id,
          taskId: c.task_id,
          desc: c.description,
          assignmentGroup: c.assignment_groups?.name || "Unassigned",
          assignmentGroupId: c.assignment_group_id,
          assignedTo: c.assigned_to_profile?.full_name || "Unassigned",
          assignedToId: c.assigned_to,
          openedAt: new Date(c.created_at).toLocaleString(),
          facilityType: c.facility_type?.facility_type,
        }));

      setTasks(filteredTasks);

      // 5. Load Options for Dropdowns (All Groups, All Staff in My Group)
      // Groups
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

      // Staff (In current group only? or all staff? Usually you transfer withing group or to another group)
      // For "Assigned To", usually you assign to someone in the SAME group.
      // So fetch staff where assigned_group = myGroupName
      if (myGroupName) {
        // Join profiles to get names
        // staff table has structure: id, assigned_group
        // profiles have full_name
        const { data: staffList } = await supabase
          .from("staff")
          .select(
            `
             id, 
             assigned_group,
             profiles ( full_name )
           `
          )
          .eq("assigned_group", myGroupName);

        const sMap: Record<string, string> = {};
        const sOpts = (staffList || []).map((s: any) => {
          const name = s.profiles?.full_name || "Unknown";
          sMap[name] = s.id;
          return name;
        });
        setStaffMap(sMap);
        setStaffOptions(sOpts);
      }
    } catch (err) {
      console.error("Error loading task category:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateField = async (task: Task, field: keyof Task, value: string) => {
    // Optimistic Update
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, [field]: value } : t))
    );

    try {
      if (field === "assignedTo") {
        const newStaffId = staffMap[value];
        if (newStaffId) {
          await supabase
            .from("complaints")
            .update({ assigned_to: newStaffId })
            .eq("id", task.id);
        }
      } else if (field === "assignmentGroup") {
        const newGroupId = groupMap[value];
        if (newGroupId) {
          await supabase
            .from("complaints")
            .update({ assignment_group_id: newGroupId })
            .eq("id", task.id);
          // Logic hint: If you transfer to another group, it should disappear from this view!
          // We might want to remove it from state locally
          setTasks((prev) => prev.filter((t) => t.id !== task.id));
        }
      }
    } catch (err) {
      console.error("Update failed:", err);
      // Revert if needed (simplified here)
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-purple-700 mb-1 capitalize">
            {targetCategory} Tasks
          </h1>
          {loading && <p className="text-sm text-gray-500">Loading...</p>}
        </div>
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-gray-600 hover:text-purple-700 underline"
        >
          Back
        </button>
      </div>

      <div className="bg-white/70 backdrop-blur-md rounded-xl border border-gray-200 shadow p-4 overflow-x-auto h-[calc(100vh-200px)]">
        <table className="min-w-full text-sm text-gray-700">
          <thead>
            <tr className="bg-purple-50 border-b text-left text-gray-800">
              <th className="py-3 px-4 font-semibold">Complaint ID</th>
              <th className="py-3 px-4 font-semibold">Description</th>
              <th className="py-3 px-4 font-semibold">Assignment Group</th>
              <th className="py-3 px-4 font-semibold">Assigned To</th>
              <th className="py-3 px-4 font-semibold">Opened At</th>
            </tr>
          </thead>
          <tbody>
            {!loading && tasks.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">
                  No tasks found.
                </td>
              </tr>
            ) : (
              tasks.map((task) => (
                <tr
                  key={task.id}
                  className="border-b hover:bg-purple-50 transition-all"
                >
                  <td
                    className="py-3 px-4 font-medium text-purple-700 cursor-pointer hover:underline hover:text-purple-900"
                    onClick={() =>
                      navigate(`/staff/task/${category}/${task.taskId}`)
                    } // Use readable ID in URL? Or UUID? Previous routing used ID.
                  >
                    {task.taskId}
                  </td>

                  <td className="py-3 px-4">{task.desc}</td>

                  <td className="py-3 px-4 w-48">
                    <EditableSelect
                      options={groupOptions}
                      value={task.assignmentGroup}
                      onChange={(val) =>
                        updateField(task, "assignmentGroup", val)
                      }
                    />
                  </td>

                  <td className="py-3 px-4 w-48">
                    <EditableSelect
                      options={staffOptions}
                      value={task.assignedTo}
                      onChange={(val) => updateField(task, "assignedTo", val)}
                    />
                  </td>

                  <td className="py-3 px-4 text-gray-500">{task.openedAt}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
