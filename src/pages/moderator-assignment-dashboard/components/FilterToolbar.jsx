import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const FilterToolbar = ({ 
  onSearchChange, 
  onStatusFilterChange, 
  onDateRangeChange,
  searchTerm,
  statusFilter,
  dateRange,
  totalNumbers,
  filteredCount 
}) => {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [tempDateRange, setTempDateRange] = useState(dateRange);

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'assigned', label: 'Assigned' },
    { value: 'sent', label: 'Sent' },
    { value: 'failed', label: 'Failed' },
    { value: 'done', label: 'Completed' }
  ];

  const statusChips = [
    { key: 'pending', label: 'Pending', count: 1250, color: 'bg-yellow-100 text-yellow-800' },
    { key: 'sent', label: 'Sent', count: 890, color: 'bg-green-100 text-green-800' },
    { key: 'failed', label: 'Failed', count: 45, color: 'bg-red-100 text-red-800' },
    { key: 'done', label: 'Done', count: 65, color: 'bg-gray-100 text-gray-800' }
  ];

  const handleClearFilters = () => {
    onSearchChange('');
    onStatusFilterChange('all');
    onDateRangeChange({ start: '', end: '' });
    setTempDateRange({ start: '', end: '' });
  };

  const handleDateRangeApply = () => {
    onDateRangeChange(tempDateRange);
    setIsAdvancedOpen(false);
  };

  const hasActiveFilters = searchTerm || statusFilter !== 'all' || dateRange?.start || dateRange?.end;

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-4">
      {/* Main Filter Row */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
        {/* Search Input */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Icon 
              name="Search" 
              size={16} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" 
            />
            <Input
              type="search"
              placeholder="Search by phone number or name..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e?.target?.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div className="w-full lg:w-48">
          <Select
            options={statusOptions}
            value={statusFilter}
            onChange={onStatusFilterChange}
            placeholder="Filter by status"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
            iconName={isAdvancedOpen ? 'ChevronUp' : 'ChevronDown'}
            iconPosition="right"
            iconSize={14}
          >
            Advanced
          </Button>
          
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              iconName="X"
              iconPosition="left"
              iconSize={14}
            >
              Clear
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            iconName="RefreshCw"
            iconSize={16}
          />
        </div>
      </div>
      {/* Status Chips */}
      <div className="flex flex-wrap gap-2">
        {statusChips?.map((chip) => (
          <button
            key={chip?.key}
            onClick={() => onStatusFilterChange(chip?.key)}
            className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
              statusFilter === chip?.key 
                ? 'ring-2 ring-primary ring-offset-1 ' + chip?.color : chip?.color +' hover:ring-1 hover:ring-gray-300'
            }`}
          >
            <span>{chip?.label}</span>
            <span className="bg-white bg-opacity-50 px-1.5 py-0.5 rounded-full text-xs">
              {chip?.count?.toLocaleString()}
            </span>
          </button>
        ))}
      </div>
      {/* Advanced Filters */}
      {isAdvancedOpen && (
        <div className="border-t border-border pt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Date Range */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Date Range</label>
              <div className="flex space-x-2">
                <Input
                  type="date"
                  value={tempDateRange?.start}
                  onChange={(e) => setTempDateRange(prev => ({ ...prev, start: e?.target?.value }))}
                  className="text-sm"
                />
                <Input
                  type="date"
                  value={tempDateRange?.end}
                  onChange={(e) => setTempDateRange(prev => ({ ...prev, end: e?.target?.value }))}
                  className="text-sm"
                />
              </div>
            </div>

            {/* Additional Filters */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Priority</label>
              <Select
                options={[
                  { value: 'all', label: 'All Priorities' },
                  { value: 'high', label: 'High Priority' },
                  { value: 'medium', label: 'Medium Priority' },
                  { value: 'low', label: 'Low Priority' }
                ]}
                value="all"
                onChange={() => {}}
                placeholder="Select priority"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Source</label>
              <Select
                options={[
                  { value: 'all', label: 'All Sources' },
                  { value: 'upload', label: 'File Upload' },
                  { value: 'manual', label: 'Manual Entry' },
                  { value: 'api', label: 'API Import' }
                ]}
                value="all"
                onChange={() => {}}
                placeholder="Select source"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAdvancedOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleDateRangeApply}
              iconName="Filter"
              iconPosition="left"
              iconSize={14}
            >
              Apply Filters
            </Button>
          </div>
        </div>
      )}
      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground border-t border-border pt-4">
        <div className="flex items-center space-x-4">
          <span>
            Showing <span className="font-medium text-foreground">{filteredCount?.toLocaleString()}</span> of{' '}
            <span className="font-medium text-foreground">{totalNumbers?.toLocaleString()}</span> numbers
          </span>
          {hasActiveFilters && (
            <div className="flex items-center space-x-1">
              <Icon name="Filter" size={14} className="text-primary" />
              <span className="text-primary">Filters active</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Auto-refresh: ON</span>
        </div>
      </div>
    </div>
  );
};

export default FilterToolbar;