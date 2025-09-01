import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

import Select from '../../../components/ui/Select';

const MessageDetailsModal = ({ message, isOpen, onClose, onRetry, onReassign }) => {
  const [activeTab, setActiveTab] = useState('details');
  const [reassignModerator, setReassignModerator] = useState('');
  const [retrySchedule, setRetrySchedule] = useState('immediate');

  if (!isOpen || !message) return null;

  const moderatorOptions = [
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

  const retryOptions = [
    { value: 'immediate', label: 'Retry Immediately' },
    { value: '5min', label: 'Retry in 5 minutes' },
    { value: '15min', label: 'Retry in 15 minutes' },
    { value: '1hour', label: 'Retry in 1 hour' },
    { value: '4hours', label: 'Retry in 4 hours' }
  ];

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

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp)?.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const handleRetry = () => {
    onRetry(message?.id, retrySchedule);
    onClose();
  };

  const handleReassign = () => {
    if (reassignModerator) {
      onReassign(message?.id, reassignModerator);
      onClose();
    }
  };

  const tabs = [
    { id: 'details', label: 'Message Details', icon: 'Info' },
    { id: 'history', label: 'Delivery History', icon: 'Clock' },
    { id: 'actions', label: 'Actions', icon: 'Settings' }
  ];

  return (
    <div className="fixed inset-0 z-200 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-black bg-opacity-50"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className="inline-block w-full max-w-4xl my-8 overflow-hidden text-left align-middle transition-all transform bg-card shadow-xl rounded-lg border border-border">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div className="flex items-center space-x-3">
              <Icon name="MessageSquare" size={24} className="text-primary" />
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  Message Details
                </h3>
                <p className="text-sm text-muted-foreground">
                  {message?.phoneNumber}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
            >
              <Icon name="X" size={20} />
            </Button>
          </div>

          {/* Tabs */}
          <div className="border-b border-border">
            <nav className="flex space-x-8 px-6">
              {tabs?.map((tab) => (
                <button
                  key={tab?.id}
                  onClick={() => setActiveTab(tab?.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab?.id
                      ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
                  }`}
                >
                  <Icon name={tab?.icon} size={16} />
                  <span>{tab?.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="px-6 py-6 max-h-96 overflow-y-auto">
            {activeTab === 'details' && (
              <div className="space-y-6">
                {/* Status Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium text-foreground">Current Status</h4>
                    <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
                      <Icon 
                        name={getStatusIcon(message?.status)} 
                        size={20} 
                        className={getStatusColor(message?.status)}
                      />
                      <div>
                        <p className={`font-medium ${getStatusColor(message?.status)}`}>
                          {message?.status?.charAt(0)?.toUpperCase() + message?.status?.slice(1)}
                        </p>
                        {message?.errorCode && (
                          <p className="text-sm text-error">Error: {message?.errorCode}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-foreground">Assignment Info</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Moderator:</span>
                        <span className="font-medium">{message?.moderator}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Priority:</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          message?.priority === 'high' ? 'bg-red-100 text-red-800' :
                          message?.priority === 'medium'? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {message?.priority}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Retry Count:</span>
                        <span className="font-medium">{message?.retryCount}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Message Content */}
                <div className="space-y-4">
                  <h4 className="font-medium text-foreground">Message Content</h4>
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <p className="text-foreground whitespace-pre-wrap">{message?.message}</p>
                    {message?.templateName && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Template: {message?.templateName}
                      </p>
                    )}
                  </div>
                </div>

                {/* Timestamps */}
                <div className="space-y-4">
                  <h4 className="font-medium text-foreground">Timeline</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created:</span>
                      <span className="font-medium">{formatTimestamp(message?.timestamp)}</span>
                    </div>
                    {message?.lastAttempt && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Last Attempt:</span>
                        <span className="font-medium">{formatTimestamp(message?.lastAttempt)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-4">
                <h4 className="font-medium text-foreground">Delivery Attempts</h4>
                <div className="space-y-3">
                  {message?.deliveryHistory?.map((attempt, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-muted/30 rounded-lg">
                      <Icon 
                        name={getStatusIcon(attempt?.status)} 
                        size={16} 
                        className={getStatusColor(attempt?.status)}
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-foreground">
                              Attempt #{attempt?.attemptNumber}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {formatTimestamp(attempt?.timestamp)}
                            </p>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(attempt?.status)}`}>
                            {attempt?.status}
                          </span>
                        </div>
                        {attempt?.errorMessage && (
                          <p className="text-sm text-error mt-1">{attempt?.errorMessage}</p>
                        )}
                      </div>
                    </div>
                  )) || (
                    <p className="text-muted-foreground text-center py-4">
                      No delivery history available
                    </p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'actions' && (
              <div className="space-y-6">
                {/* Retry Section */}
                {(message?.status === 'failed' || message?.status === 'pending') && (
                  <div className="space-y-4">
                    <h4 className="font-medium text-foreground">Retry Message</h4>
                    <div className="space-y-3">
                      <Select
                        label="Retry Schedule"
                        options={retryOptions}
                        value={retrySchedule}
                        onChange={setRetrySchedule}
                      />
                      <Button
                        variant="default"
                        onClick={handleRetry}
                        iconName="RefreshCw"
                        iconPosition="left"
                        className="w-full"
                      >
                        Schedule Retry
                      </Button>
                    </div>
                  </div>
                )}

                {/* Reassign Section */}
                <div className="space-y-4">
                  <h4 className="font-medium text-foreground">Reassign Message</h4>
                  <div className="space-y-3">
                    <Select
                      label="New Moderator"
                      options={moderatorOptions}
                      value={reassignModerator}
                      onChange={setReassignModerator}
                      placeholder="Select moderator"
                    />
                    <Button
                      variant="outline"
                      onClick={handleReassign}
                      disabled={!reassignModerator}
                      iconName="UserCheck"
                      iconPosition="left"
                      className="w-full"
                    >
                      Reassign Message
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 px-6 py-4 border-t border-border bg-muted/20">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageDetailsModal;