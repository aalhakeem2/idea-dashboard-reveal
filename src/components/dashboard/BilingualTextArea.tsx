import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/contexts/LanguageContext";

interface BilingualTextAreaProps {
  valueEn: string;
  valueAr: string;
  onChangeEn: (value: string) => void;
  onChangeAr: (value: string) => void;
  labelEn?: string;
  labelAr?: string;
  placeholderEn?: string;
  placeholderAr?: string;
  rows?: number;
  required?: boolean;
}

export const BilingualTextArea: React.FC<BilingualTextAreaProps> = ({
  valueEn,
  valueAr,
  onChangeEn,
  onChangeAr,
  labelEn = "English",
  labelAr = "العربية",
  placeholderEn = "Enter text in English",
  placeholderAr = "أدخل النص بالعربية",
  rows = 3,
  required = false
}) => {
  const { language } = useLanguage();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <label className="text-xs text-muted-foreground flex items-center gap-1">
          {labelEn}
          {required && <span className="text-destructive">*</span>}
        </label>
        <Textarea
          value={valueEn}
          onChange={(e) => onChangeEn(e.target.value)}
          placeholder={placeholderEn}
          rows={rows}
          dir="ltr"
          className="text-left"
          required={required}
        />
      </div>
      <div className="space-y-2">
        <label className="text-xs text-muted-foreground flex items-center gap-1">
          {labelAr}
          {required && <span className="text-destructive">*</span>}
        </label>
        <Textarea
          value={valueAr}
          onChange={(e) => onChangeAr(e.target.value)}
          placeholder={placeholderAr}
          rows={rows}
          dir="rtl"
          className="text-right"
          required={required}
        />
      </div>
    </div>
  );
};