import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';

const ActionPanel = ({ 
  selectedNumbers, 
  onBulkStatusUpdate, 
  onBulkReassign, 
  onTemplateApply,
  connectionStatus 
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [quickNote, setQuickNote] = useState('');
  const [bulkAction, setBulkAction] = useState('');

  const messageTemplates = [
    {
      value: 'welcome',
      label: 'Welcome Message',
      description: 'Standard welcome greeting'
    },
    {
      value: 'followup',
      label: 'Follow-up Message',
      description: 'Follow-up for previous contact'
    },
    {
      value: 'promotion',
      label: 'Promotional Message',
      description: 'Product/service promotion'
    },
    {
      value: 'reminder',
      label: 'Reminder Message',
      description: 'Appointment or event reminder'
    },
    {
      value: 'custom',
      label: 'Custom Template',
      description: 'Create custom message'
    }
  ];

  const bulkActions = [
    { value: 'mark_sent', label: 'Mark as Sent' },
    { value: 'mark_failed', label: 'Mark as Failed' },
    { value: 'mark_pending', label: 'Mark as Pending' },
    { value: 'reassign', label: 'Reassign Numbers' }
  ];

  const moderatorOptions = [
    { value: 'mod_001', label: 'Moderator 1 - Sarah Chen' },
    { value: 'mod_002', label: 'Moderator 2 - Mike Johnson' },
    { value: 'mod_003', label: 'Moderator 3 - Emily Davis' },
    { value: 'mod_004', label: 'Moderator 4 - David Wilson' }
  ];

  const handleBulkAction = () => {
    if (!bulkAction || selectedNumbers?.length === 0) return;

    switch (bulkAction) {
      case 'mark_sent': onBulkStatusUpdate(selectedNumbers,'sent');
        break;
      case 'mark_failed': onBulkStatusUpdate(selectedNumbers,'failed');
        break;
      case 'mark_pending': onBulkStatusUpdate(selectedNumbers,'pending');
        break;
      case 'reassign':
        // This would open a reassignment modal
        break;
      default:
        break;
    }

    setBulkAction('');
  };

  const handleTemplateApply = () => {
    if (!selectedTemplate || selectedNumbers?.length === 0) return;
    onTemplateApply(selectedNumbers, selectedTemplate);
  };

  const getConnectionStatusColor = (status) => {
    switch (status) {
      case 'connected':
        return 'text-green-600 bg-green-50';
      case 'connecting':
        return 'text-yellow-600 bg-yellow-50';
      case 'disconnected':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getConnectionStatusIcon = (status) => {
    switch (status) {
      case 'connected':
        return 'CheckCircle';
      case 'connecting':
        return 'Clock';
      case 'disconnected':
        return 'XCircle';
      default:
        return 'Circle';
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Actions</h2>
        <span className="text-sm text-muted-foreground">
          {selectedNumbers?.length} selected
        </span>
      </div>
      {/* WhatsApp Connection Status */}
      <div className="bg-muted rounded-lg p-3 border border-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">WhatsApp Web</span>
          <div className={`flex items-center space-x-2 px-2 py-1 rounded-full text-xs font-medium ${getConnectionStatusColor(connectionStatus)}`}>
            <Icon name={getConnectionStatusIcon(connectionStatus)} size={12} />
            <span className="capitalize">{connectionStatus}</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          {connectionStatus === 'connected' ?'Ready to send messages' 
            : connectionStatus === 'connecting' ?'Establishing connection...' :'Please check WhatsApp Web connection'
          }
        </p>
      </div>
      {/* Message Templates */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Message Templates</h3>
        <Select
          label="Select Template"
          options={messageTemplates}
          value={selectedTemplate}
          onChange={setSelectedTemplate}
          placeholder="Choose a template..."
          searchable
        />
        <Button
          variant="outline"
          fullWidth
          onClick={handleTemplateApply}
          disabled={!selectedTemplate || selectedNumbers?.length === 0}
          iconName="MessageSquare"
          iconPosition="left"
          iconSize={16}
        >
          Apply to Selected ({selectedNumbers?.length})
        </Button>
      </div>
      {/* Quick Notes */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Quick Notes</h3>
        <Input
          type="text"
          placeholder="Add a note for selected numbers..."
          value={quickNote}
          onChange={(e) => setQuickNote(e?.target?.value)}
          className="text-sm"
        />
        <Button
          variant="ghost"
          size="sm"
          fullWidth
          disabled={!quickNote || selectedNumbers?.length === 0}
          iconName="StickyNote"
          iconPosition="left"
          iconSize={14}
        >
          Add Note
        </Button>
      </div>
      {/* Bulk Actions */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Bulk Actions</h3>
        <Select
          label="Select Action"
          options={bulkActions}
          value={bulkAction}
          onChange={setBulkAction}
          placeholder="Choose an action..."
        />
        <Button
          variant="default"
          fullWidth
          onClick={handleBulkAction}
          disabled={!bulkAction || selectedNumbers?.length === 0}
          iconName="Zap"
          iconPosition="left"
          iconSize={16}
        >
          Execute Action
        </Button>
      </div>
      {/* Performance Metrics */}
      <div className="bg-muted rounded-lg p-3 border border-border">
        <h3 className="text-sm font-semibold text-foreground mb-3">Today's Performance</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Messages Sent</span>
            <span className="font-medium text-foreground">1,247</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Success Rate</span>
            <span className="font-medium text-green-600">94.2%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Avg. Response Time</span>
            <span className="font-medium text-foreground">2.3s</span>
          </div>
        </div>
      </div>
      {/* Quick Actions */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-foreground">Quick Actions</h3>
        <div className="grid grid-cols-1 gap-2">
          <Button
            variant="outline"
            size="sm"
            fullWidth
            iconName="RefreshCw"
            iconPosition="left"
            iconSize={14}
          >
            Refresh Queue
          </Button>
          <Button
            variant="outline"
            size="sm"
            fullWidth
            iconName="Download"
            iconPosition="left"
            iconSize={14}
          >
            Export Data
          </Button>
          <Button
            variant="outline"
            size="sm"
            fullWidth
            iconName="Settings"
            iconPosition="left"
            iconSize={14}
          >
            Preferences
          </Button>
        </div>
      </div>
      {/* Keyboard Shortcuts */}
      <div className="bg-muted rounded-lg p-3 border border-border">
        <h3 className="text-sm font-semibold text-foreground mb-2">Keyboard Shortcuts</h3>
        <div className="space-y-1 text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>Select All</span>
            <kbd className="px-1 py-0.5 bg-background rounded">Ctrl+A</kbd>
          </div>
          <div className="flex justify-between">
            <span>Send Message</span>
            <kbd className="px-1 py-0.5 bg-background rounded">Ctrl+Enter</kbd>
          </div>
          <div className="flex justify-between">
            <span>Refresh</span>
            <kbd className="px-1 py-0.5 bg-background rounded">F5</kbd>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActionPanel;