import React, { useState, useMemo } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';

const MessageStatusTable = ({ 
  messages, 
  selectedMessages, 
  onSelectionChange, 
  onRetryMessage,
  onViewDetails,
  sortConfig,
  onSort 
}) => {
  const [hoveredRow, setHoveredRow] = useState(null);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return 'Clock';
      case 'sent': return 'Send';
      case 'delivered': return 'CheckCircle';
      case 'failed': return 'XCircle';
      case 'read': return 'CheckCheck';
      default: return 'Circle';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-warning';
      case 'sent': return 'text-blue-600';
      case 'delivered': return 'text-success';
      case 'failed': return 'text-error';
      case 'read': return 'text-green-700';
      default: return 'text-muted-foreground';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp)?.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateMessage = (message, maxLength = 50) => {
    return message?.length > maxLength ? `${message?.substring(0, maxLength)}...` : message;
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      onSelectionChange(messages?.map(msg => msg?.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectMessage = (messageId, checked) => {
    if (checked) {
      onSelectionChange([...selectedMessages, messageId]);
    } else {
      onSelectionChange(selectedMessages?.filter(id => id !== messageId));
    }
  };

  const isAllSelected = messages?.length > 0 && selectedMessages?.length === messages?.length;
  const isPartiallySelected = selectedMessages?.length > 0 && selectedMessages?.length < messages?.length;

  const sortedMessages = useMemo(() => {
    if (!sortConfig?.key) return messages;

    return [...messages]?.sort((a, b) => {
      let aValue = a?.[sortConfig?.key];
      let bValue = b?.[sortConfig?.key];

      if (sortConfig?.key === 'timestamp' || sortConfig?.key === 'lastAttempt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (aValue < bValue) {
        return sortConfig?.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig?.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [messages, sortConfig]);

  const SortableHeader = ({ column, children, className = "" }) => (
    <th 
      className={`px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/50 transition-colors ${className}`}
      onClick={() => onSort(column)}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        {sortConfig?.key === column && (
          <Icon 
            name={sortConfig?.direction === 'asc' ? 'ChevronUp' : 'ChevronDown'} 
            size={14} 
          />
        )}
      </div>
    </th>
  );

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/30">
            <tr>
              <th className="px-4 py-3 w-12">
                <Checkbox
                  checked={isAllSelected}
                  indeterminate={isPartiallySelected}
                  onChange={(e) => handleSelectAll(e?.target?.checked)}
                />
              </th>
              <SortableHeader column="phoneNumber">Phone Number</SortableHeader>
              <SortableHeader column="message">Message</SortableHeader>
              <SortableHeader column="status">Status</SortableHeader>
              <SortableHeader column="moderator">Moderator</SortableHeader>
              <SortableHeader column="timestamp">Sent At</SortableHeader>
              <SortableHeader column="lastAttempt">Last Attempt</SortableHeader>
              <SortableHeader column="retryCount">Retries</SortableHeader>
              <SortableHeader column="priority">Priority</SortableHeader>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-32">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sortedMessages?.map((message) => (
              <tr 
                key={message?.id}
                className={`hover:bg-muted/30 transition-colors ${
                  selectedMessages?.includes(message?.id) ? 'bg-blue-50' : ''
                }`}
                onMouseEnter={() => setHoveredRow(message?.id)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                <td className="px-4 py-3">
                  <Checkbox
                    checked={selectedMessages?.includes(message?.id)}
                    onChange={(e) => handleSelectMessage(message?.id, e?.target?.checked)}
                  />
                </td>
                
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-sm">{message?.phoneNumber}</span>
                    {message?.isWhatsAppNumber && (
                      <Icon name="MessageCircle" size={14} className="text-green-600" />
                    )}
                  </div>
                </td>
                
                <td className="px-4 py-3 max-w-xs">
                  <div className="text-sm text-foreground">
                    {truncateMessage(message?.message)}
                  </div>
                  {message?.templateName && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Template: {message?.templateName}
                    </div>
                  )}
                </td>
                
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <Icon 
                      name={getStatusIcon(message?.status)} 
                      size={16} 
                      className={getStatusColor(message?.status)}
                    />
                    <span className={`text-sm font-medium ${getStatusColor(message?.status)}`}>
                      {message?.status?.charAt(0)?.toUpperCase() + message?.status?.slice(1)}
                    </span>
                  </div>
                  {message?.errorCode && (
                    <div className="text-xs text-error mt-1">
                      Error: {message?.errorCode}
                    </div>
                  )}
                </td>
                
                <td className="px-4 py-3">
                  <div className="text-sm text-foreground">{message?.moderator}</div>
                  <div className="text-xs text-muted-foreground">ID: {message?.moderatorId}</div>
                </td>
                
                <td className="px-4 py-3">
                  <div className="text-sm text-foreground">
                    {formatTimestamp(message?.timestamp)}
                  </div>
                </td>
                
                <td className="px-4 py-3">
                  <div className="text-sm text-foreground">
                    {message?.lastAttempt ? formatTimestamp(message?.lastAttempt) : '-'}
                  </div>
                </td>
                
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-1">
                    <span className="text-sm font-medium">{message?.retryCount}</span>
                    {message?.retryCount > 0 && (
                      <Icon name="RefreshCw" size={12} className="text-warning" />
                    )}
                  </div>
                </td>
                
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(message?.priority)}`}>
                    {message?.priority}
                  </span>
                </td>
                
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onViewDetails(message)}
                      className="h-8 w-8"
                      title="View Details"
                    >
                      <Icon name="Eye" size={14} />
                    </Button>
                    
                    {(message?.status === 'failed' || message?.status === 'pending') && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onRetryMessage(message?.id)}
                        className="h-8 w-8 text-warning hover:text-warning"
                        title="Retry Message"
                      >
                        <Icon name="RefreshCw" size={14} />
                      </Button>
                    )}
                    
                    {hoveredRow === message?.id && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title="More Actions"
                      >
                        <Icon name="MoreHorizontal" size={14} />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {sortedMessages?.length === 0 && (
        <div className="text-center py-12">
          <Icon name="MessageSquare" size={48} className="text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No messages found</h3>
          <p className="text-muted-foreground">
            Try adjusting your filters or search criteria
          </p>
        </div>
      )}
    </div>
  );
};

export default MessageStatusTable;