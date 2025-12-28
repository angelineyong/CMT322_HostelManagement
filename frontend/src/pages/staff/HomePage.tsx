import { useEffect, useState } from "react";
import AccordionSection from "../../components/AccordionSection";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { supabase } from "../../lib/supabaseClient";

interface TaskItem {
  id: string;
  desc: string;
  openedAt: string;
}

interface ChildCategory {
  id: string;
  title: string;
  count: number;
  items: TaskItem[];
}

interface ParentCategory {
  id: string;
  title: string;
  count: number;
  children: ChildCategory[];
}

export default function HomePage() {
  const [categories, setCategories] = useState<ParentCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([
    { name: "< 24 hrs", value: 0 },
    { name: "1 - 2 days", value: 0 },
    { name: "3 - 5 days", value: 0 },
    { name: "> 5 days", value: 0 },
  ]);

  const severityColors = ["#22c55e", "#eab308", "#f97316", "#ef4444"];

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);

      // 1. Get Current User and their assigned Group Name
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const currentUserId = user?.id;

      if (!currentUserId) return;

      const { data: staffData } = await supabase
        .from("staff")
        .select("assigned_group")
        .eq("id", currentUserId)
        .single();

      const groupName = staffData?.assigned_group;

      if (!groupName) {
        setCategories([]); // No group assigned
        return;
      }

      // 2. Resolve Group Name to ID
      const { data: groupData } = await supabase
        .from("assignment_groups")
        .select("id")
        .eq("name", groupName)
        .single();

      const groupId = groupData?.id;

      if (!groupId) {
        setCategories([]);
        return;
      }

      // 3. Fetch complaints for this GROUP
      const { data, error } = await supabase
        .from("complaints")
        .select(
          `
          *,
          status!inner ( status_name ),
          facility_type (
            id,
            facility_type,
            category_id
          )
        `
        )
        .eq("assignment_group_id", groupId) // <--- Filter by Group ID
        .filter(
          "status.status_name",
          "not.in",
          '("Resolved","Closed","Closed Complete","Closed Incomplete")'
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data) {
        transformData(data);
        // Aging stats based on MY assigned tasks (Personal Workload)
        if (currentUserId) calculateAgingStats(data, currentUserId);
      }
    } catch (err) {
      console.error("Error fetching tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  const calculateAgingStats = (complaints: any[], userId: string) => {
    const now = new Date();
    const stats = [0, 0, 0, 0]; // <24h, 1-2d, 3-5d, >5d

    complaints.forEach((c) => {
      // 1. Must be assigned to ME
      // 2. Must be open (not resolved)
      if (c.assigned_to === userId && !c.resolved_at) {
        const created = new Date(c.created_at);
        const diffMs = now.getTime() - created.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);

        if (diffHours < 24) {
          stats[0]++;
        } else if (diffHours <= 48) {
          stats[1]++;
        } else if (diffHours <= 120) {
          // 5 days
          stats[2]++;
        } else {
          stats[3]++;
        }
      }
    });

    setChartData([
      { name: "< 24 hrs", value: stats[0] },
      { name: "1 - 2 days", value: stats[1] },
      { name: "3 - 5 days", value: stats[2] },
      { name: "> 5 days", value: stats[3] },
    ]);
  };

  const transformData = (complaints: any[]) => {
    // 1. Initialize Groups
    const individual: ParentCategory = {
      id: "individual",
      title: "Individual Category",
      count: 0,
      children: [],
    };
    const shared: ParentCategory = {
      id: "shared",
      title: "Shared Category",
      count: 0,
      children: [],
    };

    // Helper to find or create a child category (Facility Type)
    const getOrAddChild = (
      parent: ParentCategory,
      facilityName: string,
      facilityId: string
    ) => {
      let child = parent.children.find((c) => c.title === facilityName);
      if (!child) {
        child = {
          id: `facility-${facilityId}`,
          title: facilityName,
          count: 0,
          items: [],
        };
        parent.children.push(child);
      }
      return child;
    };

    // 2. Iterate and Group
    complaints.forEach((complaint) => {
      const facility = complaint.facility_type;
      if (!facility) return;

      const categoryId = facility.category_id; // 1 or 2
      const targetParent = categoryId === 2 ? shared : individual;

      const child = getOrAddChild(
        targetParent,
        facility.facility_type,
        facility.id
      );

      // Create Task Item
      const taskItem: TaskItem = {
        id: complaint.task_id || "N/A",
        desc: complaint.description,
        openedAt: new Date(complaint.created_at).toLocaleString(),
      };

      child.items.push(taskItem);
      child.count++;
      targetParent.count++;
    });

    // 3. Set State (Only include parents that have items, or keep empty if desired)
    // We filter out empty parents to keep UI valid, or just pass both.
    // Let's pass both but maybe strictly ordered.
    setCategories([individual, shared]);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-purple-700 mb-1">
          Welcome to the Fixify Staff Portal
        </h1>
        <p className="text-gray-600 text-xs">
          Manage maintenance tickets, monitor task progress, and ensure timely
          resolutions.
        </p>
      </div>

      {/* Accordion Section */}
      {loading ? (
        <p className="text-gray-500 text-sm">Loading tasks...</p>
      ) : (
        <AccordionSection data={categories} />
      )}

      {/* Chart Section */}
      <div className="bg-white/60 backdrop-blur-md rounded-xl border border-gray-200 shadow p-4">
        <h2 className="text-md font-semibold text-purple-700 mb-4">
          Task Assigned Aging Overview
        </h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={severityColors[index]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
