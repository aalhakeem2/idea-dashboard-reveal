import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ListOfValue {
  id: number;
  list_key: string;
  value_key: string;
  value_en: string;
  value_ar: string;
  is_active: boolean;
}

export const useListOfValues = (listKey: string) => {
  const [values, setValues] = useState<ListOfValue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchValues = async () => {
      try {
        const { data, error } = await supabase
          .from("list_of_values")
          .select("*")
          .eq("list_key", listKey)
          .eq("is_active", true)
          .order("value_en");

        if (error) throw error;
        setValues(data || []);
      } catch (error) {
        console.error("Error fetching list of values:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchValues();
  }, [listKey]);

  return { values, loading };
};