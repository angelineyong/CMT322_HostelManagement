import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import EditableSelect from "../../../components/EditableSelect";
import {
  taskCategoryMap,
  groupOptions,
  staffOptions,
} from "../../../data/mockData";
import type { Task } from "../../../types";

export default function TaskCategoryPage() {
  const { category } = useParams();
  const navigate = useNavigate();
  const formattedCategory = category?.replace(/-/g, " ") ?? "Tasks";

  const [tasks, setTasks] = useState<Task[]>(
    taskCategoryMap[category || "furniture"] || []
  );

  const updateField = (taskId: string, field: keyof Task, value: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, [field]: value } : t))
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div>
        <h1 className="text-2xl font-bold text-purple-700 mb-1 capitalize">
          {formattedCategory} Tasks
        </h1>
        {/* <p className="text-gray-600 text-sm">
          Review and manage complaints related to {formattedCategory}.
        </p> */}
      </div>

      {/* Table Section */}
      <div className="bg-white/70 backdrop-blur-md rounded-xl border border-gray-200 shadow p-4 overflow-x-auto">
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
            {tasks.map((task) => (
              <tr
                key={task.id}
                className="border-b hover:bg-purple-50 transition-all"
              >
                {/* Complaint ID with navigation */}
                <td
                  className="py-3 px-4 font-medium text-purple-700 cursor-pointer hover:underline hover:text-purple-900"
                  onClick={() => navigate(`/staff/task/${category}/${task.id}`)}
                >
                  {task.id}
                </td>

                {/* Description */}
                <td className="py-3 px-4">{task.desc}</td>

                {/* Assignment Group (Editable) */}
                <td className="py-3 px-4">
                  <EditableSelect
                    options={groupOptions}
                    value={task.assignmentGroup}
                    onChange={(val) =>
                      updateField(task.id, "assignmentGroup", val)
                    }
                  />
                </td>

                {/* Assigned To (Editable) */}
                <td className="py-3 px-4">
                  <EditableSelect
                    options={staffOptions}
                    value={task.assignedTo}
                    onChange={(val) => updateField(task.id, "assignedTo", val)}
                  />
                </td>

                {/* Opened At */}
                <td className="py-3 px-4 text-gray-500">{task.openedAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
