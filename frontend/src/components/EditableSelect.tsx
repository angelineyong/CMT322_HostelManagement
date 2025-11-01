import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

interface EditableSelectProps {
  options: string[];
  value: string;
  onChange: (newValue: string) => void;
}

export default function EditableSelect({
  options,
  value,
  onChange,
}: EditableSelectProps) {
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = options.filter((opt) =>
    opt.toLowerCase().includes(inputValue.toLowerCase())
  );

  // Save selected value
  const handleSave = () => {
    onChange(inputValue);
    setEditing(false);
    setShowDropdown(false);
    setHighlightIndex(-1);
  };

  const handleCancel = () => {
    setInputValue(value);
    setEditing(false);
    setShowDropdown(false);
    setHighlightIndex(-1);
  };

  // Handle outside double-click to exit edit mode
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        if (e.detail === 2) handleCancel(); // double-click outside cancels
      }
    };
    document.addEventListener("click", handleOutside);
    return () => document.removeEventListener("click", handleOutside);
  }, [value]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown && ["ArrowDown", "ArrowUp"].includes(e.key)) {
      setShowDropdown(true);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((prev) =>
        prev < filtered.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === "Enter" && highlightIndex >= 0) {
      e.preventDefault();
      setInputValue(filtered[highlightIndex]);
      setShowDropdown(false); // don’t auto-save yet
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  return (
    <div ref={containerRef} className="relative inline-block">
      {editing ? (
        <div className="flex items-center gap-1">
          <div className="relative">
            <input
              className="border border-gray-300 rounded px-2 py-1 text-sm w-44 focus:outline-none focus:border-purple-500"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setShowDropdown(true);
                setHighlightIndex(-1);
              }}
              onFocus={() => setShowDropdown(true)}
              onKeyDown={handleKeyDown}
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowDropdown((prev) => !prev)}
              className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-500"
            >
              <ChevronDown size={16} />
            </button>

            {showDropdown && (
              <div className="absolute left-0 mt-1 w-full bg-white border rounded shadow max-h-40 overflow-y-auto z-10">
                {filtered.length > 0 ? (
                  filtered.map((opt, i) => (
                    <div
                      key={opt}
                      onMouseDown={() => {
                        setInputValue(opt); // update input only
                        setHighlightIndex(i);
                      }}
                      className={`px-2 py-1 text-sm cursor-pointer ${
                        highlightIndex === i
                          ? "bg-purple-100 text-purple-800"
                          : "hover:bg-purple-50"
                      }`}
                    >
                      {opt}
                    </div>
                  ))
                ) : (
                  <div className="px-2 py-1 text-xs text-gray-400 italic">
                    No match
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="text-green-600 hover:text-green-800 p-1 rounded"
            title="Confirm"
          >
            <Check size={16} />
          </button>
        </div>
      ) : (
        <span
          className="cursor-pointer hover:underline text-sm"
          onDoubleClick={() => {
            setEditing(true);
            setInputValue(value);
          }}
        >
          {value}
        </span>
      )}
    </div>
  );
}
