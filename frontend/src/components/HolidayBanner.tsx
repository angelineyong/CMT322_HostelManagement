import React, { useEffect, useState } from "react";
import type { Holiday } from "../pages/student/useHolidays";

const HolidayBanner: React.FC<{ holidays: Holiday[] }> = ({ holidays }) => {
  const [currentHolidayIndex, setCurrentHolidayIndex] = useState(0);

  useEffect(() => {
    if (!holidays.length) return;
    const timer = setInterval(() => {
      setCurrentHolidayIndex(i => (i + 1) % holidays.length);
    }, 7000);

    return () => clearInterval(timer);
  }, [holidays]);

  if (!holidays.length) return null;

  const current = holidays[currentHolidayIndex];

  return (
    <div className="relative rounded-lg overflow-hidden h-56">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${current.image_url})` }}
      />
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative z-10 p-6 text-white">
        <h2 className="text-2xl font-semibold">{current.holiday_name}</h2>
        <p className="text-sm">
          {current.start_date}
          {current.end_date !== current.start_date && ` - ${current.end_date}`}
        </p>
        <p className="mt-2 text-sm">{current.description}</p>
      </div>
    </div>
  );
};

export default HolidayBanner;
