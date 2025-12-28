import { useEffect, useState } from "react";
import AccordionSection from "../../components/AccordionSection";
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

export default function TasksPage() {
  const [categories, setCategories] = useState<ParentCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyTasks();
  }, []);

  const fetchMyTasks = async () => {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Get Staff Assigned Group
      const { data: staffData } = await supabase
        .from("staff")
        .select("assigned_group")
        .eq("id", user.id)
        .single();

      const groupName = staffData?.assigned_group;
      if (!groupName) {
        setCategories([]);
        return;
      }

      // 2. Resolve Group ID
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
        .eq("assignment_group_id", groupId) // <--- Group Filter
        .filter(
          "status.status_name",
          "not.in",
          '("Resolved","Closed","Closed Complete","Closed Incomplete")'
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data) transformData(data);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  const transformData = (complaints: any[]) => {
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

      const taskItem: TaskItem = {
        id: complaint.task_id || "N/A",
        desc: complaint.description,
        openedAt: new Date(complaint.created_at).toLocaleString(),
      };

      child.items.push(taskItem);
      child.count++;
      targetParent.count++;
    });

    setCategories([individual, shared]);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-purple-700 mb-4">
        My Assigned Tasks
      </h1>
      {loading ? (
        <p className="text-gray-500">Loading your assignment group tasks...</p>
      ) : (
        <AccordionSection data={categories} />
      )}
    </div>
  );
}
