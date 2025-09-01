import React, { useState, useEffect, useMemo } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';

const NumbersDataTable = ({ 
  numbers, 
  selectedNumbers, 
  onSelectionChange, 
  onStatusUpdate, 
  onWhatsAppLaunch,
  searchTerm,
  statusFilter 
}) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [flashingRows, setFlashingRows] = useState(new Set());

  // Filter and sort numbers
  const filteredNumbers = numbers?.filter(number => {
    const matchesSearch = !searchTerm || 
      number?.phone?.includes(searchTerm) || 
      number?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || number?.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const sortedNumbers = React.useMemo(() => {
    if (!sortConfig?.key) return filteredNumbers;

    return [...filteredNumbers]?.sort((a, b) => {
      if (a?.[sortConfig?.key] < b?.[sortConfig?.key]) {
        return sortConfig?.direction === 'asc' ? -1 : 1;
      }
      if (a?.[sortConfig?.key] > b?.[sortConfig?.key]) {
        return sortConfig?.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredNumbers, sortConfig]);

  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig?.key === key && prevConfig?.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      const allIds = sortedNumbers?.map(number => number?.id);
      onSelectionChange(allIds);
    } else {
      onSelectionChange([]);
    }
  };

  const handleRowSelect = (numberId, checked) => {
    if (checked) {
      onSelectionChange([...selectedNumbers, numberId]);
    } else {
      onSelectionChange(selectedNumbers?.filter(id => id !== numberId));
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: 'Clock' },
      assigned: { color: 'bg-blue-100 text-blue-800', icon: 'User' },
      sent: { color: 'bg-green-100 text-green-800', icon: 'CheckCircle' },
      failed: { color: 'bg-red-100 text-red-800', icon: 'XCircle' },
      done: { color: 'bg-gray-100 text-gray-800', icon: 'Check' }
    };

    const config = statusConfig?.[status] || statusConfig?.pending;

    return (
      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${config?.color}`}>
        <Icon name={config?.icon} size={12} />
        <span className="capitalize">{status}</span>
      </span>
    );
  };

  const handleWhatsAppClick = (number) => {
    // Flash the row to indicate action
    setFlashingRows(prev => new Set([...prev, number.id]));
    setTimeout(() => {
      setFlashingRows(prev => {
        const newSet = new Set(prev);
        newSet?.delete(number?.id);
        return newSet;
      });
    }, 1000);

    onWhatsAppLaunch(number);
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '-';
    return new Date(timestamp)?.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isAllSelected = sortedNumbers?.length > 0 && 
    sortedNumbers?.every(number => selectedNumbers?.includes(number?.id));
  const isIndeterminate = selectedNumbers?.length > 0 && !isAllSelected;

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Table Header */}
      <div className="bg-muted px-4 py-3 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Checkbox
              checked={isAllSelected}
              indeterminate={isIndeterminate}
              onChange={(e) => handleSelectAll(e?.target?.checked)}
              label={`Select All (${sortedNumbers?.length})`}
            />
          </div>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>Showing {sortedNumbers?.length} of {numbers?.length} numbers</span>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
      {/* Table */}
      <div className="overflow-x-auto max-h-96 scrollbar-thin">
        <table className="w-full">
          <thead className="bg-muted sticky top-0 z-10">
            <tr>
              <th className="w-12 px-4 py-3 text-left">
                <span className="sr-only">Select</span>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('phone')}
                  className="flex items-center space-x-1 text-sm font-medium text-foreground hover:text-primary"
                >
                  <span>Phone Number</span>
                  <Icon name="ArrowUpDown" size={14} />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('name')}
                  className="flex items-center space-x-1 text-sm font-medium text-foreground hover:text-primary"
                >
                  <span>Contact Name</span>
                  <Icon name="ArrowUpDown" size={14} />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('status')}
                  className="flex items-center space-x-1 text-sm font-medium text-foreground hover:text-primary"
                >
                  <span>Status</span>
                  <Icon name="ArrowUpDown" size={14} />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('lastUpdated')}
                  className="flex items-center space-x-1 text-sm font-medium text-foreground hover:text-primary"
                >
                  <span>Last Updated</span>
                  <Icon name="ArrowUpDown" size={14} />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <span className="text-sm font-medium text-foreground">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sortedNumbers?.map((number) => (
              <tr
                key={number?.id}
                className={`hover:bg-muted/50 transition-colors duration-200 ${
                  flashingRows?.has(number?.id) ? 'bg-primary/10 animate-pulse' : ''
                } ${selectedNumbers?.includes(number?.id) ? 'bg-blue-50' : ''}`}
              >
                <td className="px-4 py-3">
                  <Checkbox
                    checked={selectedNumbers?.includes(number?.id)}
                    onChange={(e) => handleRowSelect(number?.id, e?.target?.checked)}
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <Icon name="Phone" size={14} className="text-muted-foreground" />
                    <span className="font-mono text-sm text-foreground">{number?.phone}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm font-medium text-foreground">{number?.name}</span>
                </td>
                <td className="px-4 py-3">
                  {getStatusBadge(number?.status)}
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-muted-foreground">
                    {formatTimestamp(number?.lastUpdated)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleWhatsAppClick(number)}
                      disabled={number?.status === 'sent' || number?.status === 'done'}
                      iconName="MessageCircle"
                      iconPosition="left"
                      iconSize={14}
                    >
                      WhatsApp
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onStatusUpdate(number?.id, 'failed')}
                      disabled={number?.status === 'done'}
                      iconName="MoreHorizontal"
                      iconSize={14}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {sortedNumbers?.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <Icon name="Search" size={48} className="text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No numbers found</h3>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>
      {/* Keyboard Shortcuts Help */}
      <div className="bg-muted px-4 py-2 border-t border-border">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center space-x-4">
            <span><kbd className="px-1 py-0.5 bg-background rounded">J/K</kbd> Navigate</span>
            <span><kbd className="px-1 py-0.5 bg-background rounded">Space</kbd> Select</span>
            <span><kbd className="px-1 py-0.5 bg-background rounded">Enter</kbd> WhatsApp</span>
          </div>
          <span>Real-time sync active</span>
        </div>
      </div>
    </div>
  );
};

export default NumbersDataTable;