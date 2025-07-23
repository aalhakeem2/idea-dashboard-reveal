
import React, { useState } from "react";
import { Search, Bell, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { UserMenu } from "./UserMenu";
import { AdvancedSearchFilter, SearchFilters } from "./AdvancedSearchFilter";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSearchFilter } from "@/contexts/SearchFilterContext";
import { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;

interface HeaderProps {
  profile: Profile;
  onSearchChange?: (searchTerm: string) => void;
  onFiltersChange?: (filters: SearchFilters) => void;
  showSearchFilter?: boolean;
}

export const Header = ({ 
  profile, 
  onSearchChange, 
  onFiltersChange,
  showSearchFilter = true 
}: HeaderProps) => {
  const { t, isRTL } = useLanguage();
  const { searchTerm, setSearchTerm, filters, setFilters } = useSearchFilter();
  const [showFilterPopover, setShowFilterPopover] = useState(false);

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    onSearchChange?.(term);
  };

  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.status.length > 0) count++;
    if (filters.category.length > 0) count++;
    if (filters.dateFrom || filters.dateTo) count++;
    if (filters.minScore > 0 || filters.maxScore < 10) count++;
    if (filters.submitterId.length > 0) count++;
    if (filters.evaluatorId.length > 0) count++;
    if (filters.hasAttachments !== null) count++;
    if (filters.isUrgent !== null) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
        {showSearchFilter ? (
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <Search className={`absolute top-3 h-4 w-4 text-gray-400 ${isRTL ? 'right-3' : 'left-3'}`} />
              <input
                type="text"
                placeholder={t('header', 'search_placeholder')}
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className={`w-full h-12 border border-gray-300 rounded-md focus:border-primary focus:ring-primary focus:outline-none ${
                  isRTL ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4 text-left'
                }`}
                dir={isRTL ? 'rtl' : 'ltr'}
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  className={`absolute top-2 ${isRTL ? 'left-2' : 'right-2'}`}
                  onClick={() => handleSearchChange('')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1" />
        )}
        
        <div className={`flex items-center space-x-4 ${isRTL ? 'space-x-reverse' : ''}`}>
          <LanguageSwitcher />
          
          {showSearchFilter && (
            <Popover open={showFilterPopover} onOpenChange={setShowFilterPopover}>
              <PopoverTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-gray-600 hover:text-gray-800 hover:bg-primary/20 relative"
                >
                  <Filter className="h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2" />
                  {t('header', 'filter')}
                  {activeFiltersCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-primary text-white text-xs rounded-full flex items-center justify-center">
                      {activeFiltersCount}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent 
                className="w-[600px] p-0 max-h-[80vh] overflow-y-auto" 
                align="end"
                side="bottom"
              >
                <AdvancedSearchFilter
                  onFiltersChange={handleFiltersChange}
                  onSearch={handleSearchChange}
                  initialFilters={filters}
                  showAdvanced={false}
                />
              </PopoverContent>
            </Popover>
          )}
          
          <Button variant="ghost" size="sm" className="relative text-gray-600 hover:text-gray-800 hover:bg-primary/20">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 rtl:-left-1 rtl:right-auto h-2 w-2 bg-orange-500 rounded-full"></span>
          </Button>
          
          <UserMenu profile={profile} />
        </div>
      </div>
    </header>
  );
};
