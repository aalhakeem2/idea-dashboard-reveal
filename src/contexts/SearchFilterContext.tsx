import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { SearchFilters } from '@/components/dashboard/AdvancedSearchFilter';

interface SearchFilterContextType {
  searchTerm: string;
  filters: SearchFilters;
  filteredData: any[];
  setSearchTerm: (term: string) => void;
  setFilters: (filters: SearchFilters) => void;
  setData: (data: any[]) => void;
  clearFilters: () => void;
  applyFilters: (data: any[], filters: SearchFilters, searchTerm: string) => any[];
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

const SearchFilterContext = createContext<SearchFilterContextType | undefined>(undefined);

export const useSearchFilter = () => {
  const context = useContext(SearchFilterContext);
  if (!context) {
    throw new Error('useSearchFilter must be used within a SearchFilterProvider');
  }
  return context;
};

interface SearchFilterProviderProps {
  children: ReactNode;
}

export const SearchFilterProvider: React.FC<SearchFilterProviderProps> = ({ children }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFiltersState] = useState<SearchFilters>(defaultFilters);
  const [originalData, setOriginalData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);

  const setFilters = useCallback((newFilters: SearchFilters) => {
    setFiltersState(newFilters);
    const filtered = applyFilters(originalData, newFilters, searchTerm);
    setFilteredData(filtered);
  }, [originalData, searchTerm]);

  const setData = useCallback((data: any[]) => {
    setOriginalData(data);
    const filtered = applyFilters(data, filters, searchTerm);
    setFilteredData(filtered);
  }, [filters, searchTerm]);

  const handleSearchTermChange = useCallback((term: string) => {
    setSearchTerm(term);
    const filtered = applyFilters(originalData, filters, term);
    setFilteredData(filtered);
  }, [originalData, filters]);

  const clearFilters = useCallback(() => {
    setFiltersState(defaultFilters);
    setSearchTerm('');
    setFilteredData(originalData);
  }, [originalData]);

  const applyFilters = useCallback((data: any[], currentFilters: SearchFilters, searchQuery: string): any[] => {
    let filtered = [...data];

    // Apply search term filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((item) => {
        const searchableFields = [
          item.title,
          item.description,
          item.full_name,
          item.email,
          item.department,
          item.idea_reference_code,
          item.feedback,
          item.recommendation,
        ].filter(Boolean);

        return searchableFields.some(field => 
          field?.toString().toLowerCase().includes(query)
        );
      });
    }

    // Apply status filter
    if (currentFilters.status.length > 0) {
      filtered = filtered.filter((item) => 
        currentFilters.status.includes(item.status)
      );
    }

    // Apply category filter
    if (currentFilters.category.length > 0) {
      filtered = filtered.filter((item) => 
        currentFilters.category.includes(item.category)
      );
    }

    // Apply date range filter
    if (currentFilters.dateFrom) {
      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.created_at || item.submitted_at || item.timestamp);
        return itemDate >= currentFilters.dateFrom!;
      });
    }

    if (currentFilters.dateTo) {
      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.created_at || item.submitted_at || item.timestamp);
        return itemDate <= currentFilters.dateTo!;
      });
    }

    // Apply score range filter
    if (currentFilters.minScore > 0 || currentFilters.maxScore < 10) {
      filtered = filtered.filter((item) => {
        const score = item.average_evaluation_score || item.overall_score || 0;
        return score >= currentFilters.minScore && score <= currentFilters.maxScore;
      });
    }

    // Apply submitter filter
    if (currentFilters.submitterId.length > 0) {
      filtered = filtered.filter((item) => 
        currentFilters.submitterId.includes(item.submitter_id || item.id)
      );
    }

    // Apply evaluator filter
    if (currentFilters.evaluatorId.length > 0) {
      filtered = filtered.filter((item) => 
        currentFilters.evaluatorId.includes(item.evaluator_id || item.id)
      );
    }

    // Apply has attachments filter
    if (currentFilters.hasAttachments !== null) {
      filtered = filtered.filter((item) => {
        const hasAttachments = (item.attachments && item.attachments.length > 0) ||
                               (item.prototype_images_urls && item.prototype_images_urls.length > 0) ||
                               item.feasibility_study_url ||
                               item.pricing_offer_url;
        return currentFilters.hasAttachments ? hasAttachments : !hasAttachments;
      });
    }

    // Apply urgent filter (could be based on priority_score or other criteria)
    if (currentFilters.isUrgent !== null) {
      filtered = filtered.filter((item) => {
        const isUrgent = item.priority_score > 8 || item.status === 'urgent';
        return currentFilters.isUrgent ? isUrgent : !isUrgent;
      });
    }

    return filtered;
  }, []);

  const contextValue: SearchFilterContextType = {
    searchTerm,
    filters,
    filteredData,
    setSearchTerm: handleSearchTermChange,
    setFilters,
    setData,
    clearFilters,
    applyFilters,
  };

  return (
    <SearchFilterContext.Provider value={contextValue}>
      {children}
    </SearchFilterContext.Provider>
  );
};