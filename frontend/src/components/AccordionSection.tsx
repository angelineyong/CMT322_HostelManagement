import { useState } from "react";
import { ChevronDown, ChevronRight, Clock, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

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

interface AccordionProps {
  data: ParentCategory[];
}

export default function AccordionSection({ data }: AccordionProps) {
  const [openParents, setOpenParents] = useState<string[]>([]);
  const [openChildren, setOpenChildren] = useState<string[]>([]);
  const navigate = useNavigate();

  const toggleParent = (id: string) => {
    setOpenParents((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const toggleChild = (id: string) => {
    setOpenChildren((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  return (
    <div className="bg-white/60 backdrop-blur-md rounded-xl border border-gray-200 shadow p-4 transition-all">
      {data.map((parent) => (
        <div key={parent.id} className="border-b border-gray-200 last:border-0">
          {/* Parent Accordion */}
          <button
            onClick={() => toggleParent(parent.id)}
            className="flex justify-between items-center w-full py-3 font-semibold text-gray-800 hover:text-purple-700 transition"
          >
            <span className="flex items-center">
              {openParents.includes(parent.id) ? (
                <ChevronDown className="inline mr-2" />
              ) : (
                <ChevronRight className="inline mr-2" />
              )}
              <span className="flex items-center gap-2">
                {parent.title}
                <span className="inline-flex items-center justify-center text-xs font-medium bg-purple-100 text-purple-700 rounded-full px-2 py-0.5">
                  {parent.count}
                </span>
              </span>
            </span>
          </button>

          {/* Child Layer */}
          <div
            className={`ml-6 transition-all duration-300 ${
              openParents.includes(parent.id)
                ? "max-h-[800px] opacity-100"
                : "max-h-0 opacity-0 overflow-hidden"
            }`}
          >
            {parent.children.map((child) => (
              <div key={child.id} className="mb-2">
                {/* Entire row toggles accordion, except text */}
                <div
                  onClick={() => toggleChild(child.id)}
                  className="flex items-center justify-between w-full py-2 text-gray-700 hover:bg-purple-50 rounded-md transition cursor-pointer px-2"
                >
                  <div className="flex items-center gap-2">
                    {/* Chevron icon */}
                    {openChildren.includes(child.id) ? (
                      <ChevronDown size={16} className="text-gray-600" />
                    ) : (
                      <ChevronRight size={16} className="text-gray-600" />
                    )}

                    {/* Category title — only this redirects */}
                    <span
                      onClick={(e) => {
                        e.stopPropagation(); // prevent accordion toggle
                        navigate(
                          `/staff/task/${child.title
                            .toLowerCase()
                            .replace(/\s+/g, "-")}`
                        );
                      }}
                      className="cursor-pointer text-gray-700 hover:underline hover:text-blue-600 transition-colors text-sm"
                    >
                      {child.title}
                    </span>
                  </div>

                  <span className="text-purple-600 text-xs ml-2">
                    {child.count}
                  </span>
                </div>

                {/* Third Layer: Task Tickets */}
                <div
                  className={`mt-1 ml-4 transition-all duration-300 ${
                    openChildren.includes(child.id)
                      ? "max-h-[800px] opacity-100"
                      : "max-h-0 opacity-0 overflow-hidden"
                  }`}
                >
                  {child.items.map((item) => (
                    <div
                      key={item.id}
                      onClick={() =>
                        navigate(
                          `/staff/task/${child.title
                            .toLowerCase()
                            .replace(/\s+/g, "-")}/${item.id}`
                        )
                      }
                      className="flex justify-between items-center px-4 py-2.5 bg-linear-to-r from-purple-50 to-white border border-purple-100 rounded-lg mb-2 hover:shadow-md hover:from-purple-100 hover:cursor-pointer transition-all"
                    >
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">
                          {item.id}
                        </p>
                        <p className="text-xs text-gray-600">{item.desc}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock size={14} className="mr-1" />
                          {item.openedAt}
                        </div>
                        <ExternalLink
                          size={16}
                          className="text-purple-600 hover:text-purple-800"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
