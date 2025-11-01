import AccordionSection from "../../components/AccordionSection";
import { categories } from "../../data/mockData";

export default function TasksPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-purple-700 mb-4">
        Task Assigned
      </h1>
      <AccordionSection data={categories} />
    </div>
  );
}
