import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useListOfValues } from "@/hooks/useListOfValues";
import { useLanguage } from "@/contexts/LanguageContext";

interface LocalizedDropdownProps {
  listKey: string;
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const LocalizedDropdown: React.FC<LocalizedDropdownProps> = ({
  listKey,
  value,
  onValueChange,
  placeholder,
  disabled = false,
  className
}) => {
  const { values, loading } = useListOfValues(listKey);
  const { language } = useLanguage();

  if (loading) {
    return (
      <Select disabled>
        <SelectTrigger className={className}>
          <SelectValue placeholder="Loading..." />
        </SelectTrigger>
      </Select>
    );
  }

  const defaultPlaceholder = language === 'ar' ? 'اختر خيار' : 'Select option';

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder || defaultPlaceholder} />
      </SelectTrigger>
      <SelectContent>
        {values.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};