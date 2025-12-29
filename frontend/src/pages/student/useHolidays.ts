// useHolidays.ts
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export type Holiday = {
  id: number;
  holiday_name: string;
  image_url: string;
  description: string;
  start_date: string;
  end_date: string;
}

export function useHolidays() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("holidays")
        .select("*")
        .order("start_date", { ascending: true });

      if (!error && data) setHolidays(data);
      setLoading(false);
    };

    load();
  }, []);

  return { holidays, loading };
}
