import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { 
  Search, 
  Filter, 
  X, 
  Calendar as CalendarIcon,
  Star,
  User,
  FileText,
  Settings2
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export interface SearchFilters {
  searchTerm: string;
  status: string[];
  category: string[];
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
  minScore: number;
  maxScore: number;
  submitterId: string[];
  evaluatorId: string[];
  hasAttachments: boolean | null;
  isUrgent: boolean | null;
}

interface AdvancedSearchFilterProps {
  onFiltersChange: (filters: SearchFilters) => void;
  onSearch: (searchTerm: string) => void;
  availableStatuses?: string[];
  availableCategories?: string[];
  availableUsers?: { id: string; name: string; role: string }[];
  initialFilters?: Partial<SearchFilters>;
  placeholder?: string;
  showAdvanced?: boolean;
}

const defaultFilters: SearchFilters = {
  searchTerm: '',
  status: [],
  category: [],
  dateFrom: undefined,
  dateTo: undefined,
  minScore: 0,
  maxScore: 10,
  submitterId: [],
  evaluatorId: [],
  hasAttachments: null,
  isUrgent: null,
};

export const AdvancedSearchFilter: React.FC<AdvancedSearchFilterProps> = ({
  onFiltersChange,
  onSearch,
  availableStatuses = ['draft', 'submitted', 'under_review', 'approved', 'rejected', 'implemented'],
  availableCategories = ['technology', 'process_improvement', 'cost_saving', 'innovation', 'customer_service'],
  availableUsers = [],
  initialFilters = {},
  placeholder,
  showAdvanced = true,
}) => {
  const { t, isRTL, language } = useLanguage();
  const [filters, setFilters] = useState<SearchFilters>({ ...defaultFilters, ...initialFilters });
  const [showAdvancedPanel, setShowAdvancedPanel] = useState(false);
  const [scoreRange, setScoreRange] = useState([filters.minScore, filters.maxScore]);

  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const handleSearchChange = (value: string) => {
    setFilters(prev => ({ ...prev, searchTerm: value }));
    onSearch(value);
  };

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleMultiSelectChange = (key: keyof SearchFilters, value: string, checked: boolean) => {
    setFilters(prev => {
      const currentArray = prev[key] as string[];
      if (checked) {
        return { ...prev, [key]: [...currentArray, value] };
      } else {
        return { ...prev, [key]: currentArray.filter(item => item !== value) };
      }
    });
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
    setScoreRange([0, 10]);
    setShowAdvancedPanel(false);
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

  const handleScoreRangeChange = (values: number[]) => {
    setScoreRange(values);
    setFilters(prev => ({ 
      ...prev, 
      minScore: values[0], 
      maxScore: values[1] 
    }));
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className={`absolute top-3 h-4 w-4 text-gray-400 ${isRTL ? 'right-3' : 'left-3'}`} />
        <Input
          placeholder={placeholder || t('header', 'search_placeholder')}
          value={filters.searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          className={`h-12 border-gray-300 focus:border-primary focus:ring-primary ${
            isRTL ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4 text-left'
          }`}
          dir={isRTL ? 'rtl' : 'ltr'}
        />
        {filters.searchTerm && (
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

      {/* Filter Controls */}
      <div className="flex items-center gap-2 flex-wrap">
        {showAdvanced && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvancedPanel(!showAdvancedPanel)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            {t('header', 'advanced_filter')}
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        )}

        {/* Quick Status Filters */}
        <div className="flex items-center gap-2">
          {availableStatuses.slice(0, 4).map((status) => (
            <Button
              key={status}
              variant={filters.status.includes(status) ? "default" : "outline"}
              size="sm"
              onClick={() => handleMultiSelectChange('status', status, !filters.status.includes(status))}
              className="text-xs"
            >
              {status.replace('_', ' ')}
            </Button>
          ))}
        </div>

        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-red-600 hover:text-red-700"
          >
            <X className="h-4 w-4 mr-1" />
            {t('header', 'clear_filters')}
          </Button>
        )}
      </div>

      {/* Advanced Filter Panel */}
      {showAdvancedPanel && (
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings2 className="h-5 w-5" />
                {t('header', 'advanced_filter')}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAdvancedPanel(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Status Filter */}
              <div className="space-y-2">
                <Label className="font-medium">{t('header', 'filter_by_status')}</Label>
                <div className="space-y-2">
                  {availableStatuses.map((status) => (
                    <div key={status} className="flex items-center space-x-2">
                      <Checkbox
                        id={`status-${status}`}
                        checked={filters.status.includes(status)}
                        onCheckedChange={(checked) => 
                          handleMultiSelectChange('status', status, checked as boolean)
                        }
                      />
                      <Label 
                        htmlFor={`status-${status}`} 
                        className="text-sm font-normal capitalize cursor-pointer"
                      >
                        {status.replace('_', ' ')}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category Filter */}
              <div className="space-y-2">
                <Label className="font-medium">{t('header', 'filter_by_category')}</Label>
                <div className="space-y-2">
                  {availableCategories.map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category}`}
                        checked={filters.category.includes(category)}
                        onCheckedChange={(checked) => 
                          handleMultiSelectChange('category', category, checked as boolean)
                        }
                      />
                      <Label 
                        htmlFor={`category-${category}`} 
                        className="text-sm font-normal capitalize cursor-pointer"
                      >
                        {category.replace('_', ' ')}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* User Filters */}
              {availableUsers.length > 0 && (
                <div className="space-y-4">
                  {/* Submitters */}
                  <div className="space-y-2">
                    <Label className="font-medium flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {language === 'ar' ? 'مقدمو الأفكار' : 'Submitters'}
                    </Label>
                    <Select
                      value={filters.submitterId[0] || ''}
                      onValueChange={(value) => handleFilterChange('submitterId', value ? [value] : [])}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={language === 'ar' ? 'اختر مقدم الفكرة' : 'Select submitter'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">{language === 'ar' ? 'جميع المقدمين' : 'All submitters'}</SelectItem>
                        {availableUsers
                          .filter(user => user.role === 'submitter')
                          .map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Evaluators */}
                  <div className="space-y-2">
                    <Label className="font-medium flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      {language === 'ar' ? 'المقيمون' : 'Evaluators'}
                    </Label>
                    <Select
                      value={filters.evaluatorId[0] || ''}
                      onValueChange={(value) => handleFilterChange('evaluatorId', value ? [value] : [])}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={language === 'ar' ? 'اختر المقيم' : 'Select evaluator'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">{language === 'ar' ? 'جميع المقيمين' : 'All evaluators'}</SelectItem>
                        {availableUsers
                          .filter(user => user.role === 'evaluator')
                          .map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-medium">{t('header', 'date_from')}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !filters.dateFrom && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateFrom ? format(filters.dateFrom, "PPP") : 
                        (language === 'ar' ? 'اختر التاريخ' : 'Pick a date')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.dateFrom}
                      onSelect={(date) => handleFilterChange('dateFrom', date)}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label className="font-medium">{t('header', 'date_to')}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !filters.dateTo && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateTo ? format(filters.dateTo, "PPP") : 
                        (language === 'ar' ? 'اختر التاريخ' : 'Pick a date')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.dateTo}
                      onSelect={(date) => handleFilterChange('dateTo', date)}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Score Range */}
            <div className="space-y-3">
              <Label className="font-medium flex items-center gap-2">
                <Star className="h-4 w-4" />
                {t('header', 'filter_by_score')}
              </Label>
              <div className="px-3">
                <Slider
                  value={scoreRange}
                  onValueChange={handleScoreRangeChange}
                  max={10}
                  min={0}
                  step={0.1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground mt-2">
                  <span>{scoreRange[0].toFixed(1)}</span>
                  <span>{scoreRange[1].toFixed(1)}</span>
                </div>
              </div>
            </div>

            {/* Additional Options */}
            <div className="space-y-3">
              <Label className="font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" />
                {language === 'ar' ? 'خيارات إضافية' : 'Additional Options'}
              </Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="has-attachments"
                    checked={filters.hasAttachments === true}
                    onCheckedChange={(checked) => 
                      handleFilterChange('hasAttachments', checked ? true : null)
                    }
                  />
                  <Label htmlFor="has-attachments" className="text-sm font-normal cursor-pointer">
                    {language === 'ar' ? 'يحتوي على مرفقات' : 'Has attachments'}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is-urgent"
                    checked={filters.isUrgent === true}
                    onCheckedChange={(checked) => 
                      handleFilterChange('isUrgent', checked ? true : null)
                    }
                  />
                  <Label htmlFor="is-urgent" className="text-sm font-normal cursor-pointer">
                    {language === 'ar' ? 'عاجل' : 'Urgent'}
                  </Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.status.map(status => (
            <Badge key={`status-${status}`} variant="secondary" className="flex items-center gap-1">
              {status.replace('_', ' ')}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleMultiSelectChange('status', status, false)}
              />
            </Badge>
          ))}
          {filters.category.map(category => (
            <Badge key={`category-${category}`} variant="secondary" className="flex items-center gap-1">
              {category.replace('_', ' ')}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleMultiSelectChange('category', category, false)}
              />
            </Badge>
          ))}
          {(filters.dateFrom || filters.dateTo) && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {language === 'ar' ? 'فترة التاريخ' : 'Date range'}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => {
                  handleFilterChange('dateFrom', undefined);
                  handleFilterChange('dateTo', undefined);
                }}
              />
            </Badge>
          )}
          {(filters.minScore > 0 || filters.maxScore < 10) && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {language === 'ar' ? 'نطاق النقاط' : 'Score range'}: {filters.minScore.toFixed(1)}-{filters.maxScore.toFixed(1)}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => {
                  setScoreRange([0, 10]);
                  handleFilterChange('minScore', 0);
                  handleFilterChange('maxScore', 10);
                }}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};