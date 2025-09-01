import React, { useState } from 'react';

import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const StatusFilterBar = ({ 
  filters, 
  onFiltersChange, 
  onBulkAction, 
  selectedCount,
  totalMessages 
}) => {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'sent', label: 'Sent' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'failed', label: 'Failed' },
    { value: 'read', label: 'Read' }
  ];

  const moderatorOptions = [
    { value: 'all', label: 'All Moderators' },
    { value: 'mod_001', label: 'Sarah Johnson' },
    { value: 'mod_002', label: 'Mike Chen' },
    { value: 'mod_003', label: 'Emily Davis' },
    { value: 'mod_004', label: 'James Wilson' },
    { value: 'mod_005', label: 'Lisa Anderson' },
    { value: 'mod_006', label: 'David Brown' },
    { value: 'mod_007', label: 'Maria Garcia' },
    { value: 'mod_008', label: 'Robert Taylor' },
    { value: 'mod_009', label: 'Jennifer Lee' },
    { value: 'mod_010', label: 'Michael Kim' },
    { value: 'mod_011', label: 'Amanda White' },
    { value: 'mod_012', label: 'Chris Martinez' }
  ];

  const errorTypeOptions = [
    { value: 'all', label: 'All Error Types' },
    { value: 'network', label: 'Network Error' },
    { value: 'invalid_number', label: 'Invalid Number' },
    { value: 'rate_limit', label: 'Rate Limited' },
    { value: 'blocked', label: 'Number Blocked' },
    { value: 'api_error', label: 'API Error' },
    { value: 'timeout', label: 'Timeout' }
  ];

  const handleFilterChange = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const handleBulkAction = (action) => {
    if (selectedCount > 0) {
      onBulkAction(action);
    }
  };

  const clearFilters = () => {
    onFiltersChange({
      status: 'all',
      moderator: 'all',
      errorType: 'all',
      dateFrom: '',
      dateTo: '',
      search: ''
    });
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-4">
      {/* Main Filter Row */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <Input
            type="search"
            placeholder="Search phone numbers, messages, or error codes..."
            value={filters?.search}
            onChange={(e) => handleFilterChange('search', e?.target?.value)}
            className="w-full"
          />
        </div>

        {/* Status Filter */}
        <div className="w-full lg:w-48">
          <Select
            options={statusOptions}
            value={filters?.status}
            onChange={(value) => handleFilterChange('status', value)}
            placeholder="Filter by status"
          />
        </div>

        {/* Moderator Filter */}
        <div className="w-full lg:w-48">
          <Select
            options={moderatorOptions}
            value={filters?.moderator}
            onChange={(value) => handleFilterChange('moderator', value)}
            placeholder="Filter by moderator"
          />
        </div>

        {/* Advanced Toggle */}
        <Button
          variant="outline"
          onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
          iconName={isAdvancedOpen ? 'ChevronUp' : 'ChevronDown'}
          iconPosition="right"
        >
          Advanced
        </Button>
      </div>
      {/* Advanced Filters */}
      {isAdvancedOpen && (
        <div className="flex flex-col lg:flex-row gap-4 pt-4 border-t border-border">
          <div className="w-full lg:w-48">
            <Select
              label="Error Type"
              options={errorTypeOptions}
              value={filters?.errorType}
              onChange={(value) => handleFilterChange('errorType', value)}
            />
          </div>

          <div className="w-full lg:w-40">
            <Input
              type="date"
              label="From Date"
              value={filters?.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e?.target?.value)}
            />
          </div>

          <div className="w-full lg:w-40">
            <Input
              type="date"
              label="To Date"
              value={filters?.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e?.target?.value)}
            />
          </div>

          <div className="flex items-end">
            <Button
              variant="ghost"
              onClick={clearFilters}
              iconName="X"
              iconPosition="left"
            >
              Clear All
            </Button>
          </div>
        </div>
      )}
      {/* Bulk Actions & Stats */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t border-border">
        {/* Selection Info */}
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <span>
            {selectedCount > 0 ? (
              <>
                <span className="font-medium text-foreground">{selectedCount}</span> selected
              </>
            ) : (
              <>
                Showing <span className="font-medium text-foreground">{totalMessages}</span> messages
              </>
            )}
          </span>
        </div>

        {/* Bulk Actions */}
        {selectedCount > 0 && (
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction('retry')}
              iconName="RefreshCw"
              iconPosition="left"
            >
              Retry Selected
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction('reassign')}
              iconName="UserCheck"
              iconPosition="left"
            >
              Reassign
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction('mark_delivered')}
              iconName="CheckCircle"
              iconPosition="left"
            >
              Mark Delivered
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction('export')}
              iconName="Download"
              iconPosition="left"
            >
              Export Selected
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatusFilterBar;