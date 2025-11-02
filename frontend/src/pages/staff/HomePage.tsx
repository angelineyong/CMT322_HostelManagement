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
import { categories } from "../../data/mockData";

export default function HomePage() {
  const data = [
    { name: "< 24 hrs", value: 10 },
    { name: "1 - 2 days", value: 20 },
    { name: "3 - 5 days", value: 5 },
    { name: "> 5 days", value: 12 },
  ];
  const severityColors = ["#22c55e", "#eab308", "#f97316", "#ef4444"];

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
      <AccordionSection data={categories} />

      {/* Chart Section */}
      <div className="bg-white/60 backdrop-blur-md rounded-xl border border-gray-200 shadow p-4">
        <h2 className="text-md font-semibold text-purple-700 mb-4">
          Task Assigned Aging Overview
        </h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {data.map((_, index) => (
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
