import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export const ProfessionalFooter: React.FC = () => {
  const { language, isRTL } = useLanguage();

  return (
    <footer className="mt-auto py-4 border-t border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className={`text-center ${isRTL ? 'font-arabic' : ''}`}>
          <p className="text-xs text-muted-foreground/80 font-medium">
            {language === 'ar' ? (
              <span className="text-right">
                فكرة واعداد : عبدالرحمن الحكيم
              </span>
            ) : (
              <span className="text-left">
                Initiative and prepared by Abdurhman Alhakeem
              </span>
            )}
          </p>
        </div>
      </div>
    </footer>
  );
};