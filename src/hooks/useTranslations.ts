import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";

export interface Translation {
  id: string;
  interface_name: string;
  position_key: string;
  english_text: string;
  arabic_text: string;
}

export const useTranslations = (interfaceName: string) => {
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();

  useEffect(() => {
    const fetchTranslations = async () => {
      try {
        const { data, error } = await supabase
          .from("translations")
          .select("*")
          .eq("interface_name", interfaceName);

        if (error) throw error;

        const translationMap: Record<string, string> = {};
        data?.forEach((translation) => {
          translationMap[translation.position_key] = 
            language === 'ar' ? translation.arabic_text : translation.english_text;
        });

        setTranslations(translationMap);
      } catch (error) {
        console.error("Error fetching translations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTranslations();
  }, [interfaceName, language]);

  const t = (key: string, fallback?: string) => {
    return translations[key] || fallback || key;
  };

  return { t, loading, translations };
};