import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const CampaignConfiguration = ({ onSaveCampaign, userRole = 'admin' }) => {
  const [campaignName, setCampaignName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [assignmentRule, setAssignmentRule] = useState('balanced');
  const [priority, setPriority] = useState('medium');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [enableScheduling, setEnableScheduling] = useState(false);
  const [enableCostEstimation, setEnableCostEstimation] = useState(false);
  const [complianceChecked, setComplianceChecked] = useState(false);
  const [crmSync, setCrmSync] = useState(false);

  const messageTemplates = [
    { value: 'welcome', label: 'Welcome Message Template' },
    { value: 'promotion', label: 'Promotional Campaign Template' },
    { value: 'reminder', label: 'Payment Reminder Template' },
    { value: 'survey', label: 'Customer Survey Template' },
    { value: 'custom', label: 'Custom Template' }
  ];

  const assignmentRules = [
    { value: 'balanced', label: 'Balanced Distribution' },
    { value: 'performance', label: 'Performance Based' },
    { value: 'availability', label: 'Availability Based' },
    { value: 'manual', label: 'Manual Assignment' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'high', label: 'High Priority' },
    { value: 'urgent', label: 'Urgent' }
  ];

  const moderators = [
    { id: 1, name: 'Alice Johnson', status: 'available', performance: 95 },
    { id: 2, name: 'Bob Smith', status: 'busy', performance: 88 },
    { id: 3, name: 'Carol Davis', status: 'available', performance: 92 },
    { id: 4, name: 'David Wilson', status: 'available', performance: 90 },
    { id: 5, name: 'Eva Brown', status: 'offline', performance: 85 }
  ];

  const handleSaveCampaign = () => {
    const campaignData = {
      name: campaignName,
      template: selectedTemplate,
      assignmentRule,
      priority,
      scheduling: enableScheduling ? {
        date: scheduledDate,
        time: scheduledTime
      } : null,
      settings: {
        costEstimation: enableCostEstimation,
        complianceChecked,
        crmSync
      }
    };

    onSaveCampaign(campaignData);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'text-success';
      case 'busy':
        return 'text-warning';
      case 'offline':
        return 'text-error';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'available':
        return 'CheckCircle';
      case 'busy':
        return 'Clock';
      case 'offline':
        return 'XCircle';
      default:
        return 'Circle';
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border">
      <div className="p-4 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">Campaign Configuration</h3>
        <p className="text-sm text-muted-foreground">Set up your campaign parameters and distribution rules</p>
      </div>
      <div className="p-4 space-y-6">
        {/* Basic Configuration */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-foreground">Basic Settings</h4>
          
          <Input
            label="Campaign Name"
            type="text"
            placeholder="Enter campaign name"
            value={campaignName}
            onChange={(e) => setCampaignName(e?.target?.value)}
            required
          />

          <Select
            label="Message Template"
            options={messageTemplates}
            value={selectedTemplate}
            onChange={setSelectedTemplate}
            placeholder="Select a message template"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Assignment Rule"
              options={assignmentRules}
              value={assignmentRule}
              onChange={setAssignmentRule}
            />

            <Select
              label="Priority Level"
              options={priorityOptions}
              value={priority}
              onChange={setPriority}
            />
          </div>
        </div>

        {/* Scheduling */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={enableScheduling}
              onChange={(e) => setEnableScheduling(e?.target?.checked)}
            />
            <h4 className="text-sm font-medium text-foreground">Schedule Campaign</h4>
          </div>

          {enableScheduling && (
            <div className="grid grid-cols-2 gap-4 pl-6">
              <Input
                label="Start Date"
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e?.target?.value)}
              />
              <Input
                label="Start Time"
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e?.target?.value)}
              />
            </div>
          )}
        </div>

        {/* Moderator Status */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-foreground">Moderator Availability</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin">
            {moderators?.map((moderator) => (
              <div key={moderator?.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
                <div className="flex items-center space-x-3">
                  <Icon 
                    name={getStatusIcon(moderator?.status)} 
                    size={16} 
                    className={getStatusColor(moderator?.status)}
                  />
                  <div>
                    <p className="text-sm font-medium text-foreground">{moderator?.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{moderator?.status}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">{moderator?.performance}%</p>
                  <p className="text-xs text-muted-foreground">Performance</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Advanced Settings - Role-based */}
        {(userRole === 'admin' || userRole === 'manager') && (
          <div className="space-y-4 border-t border-border pt-4">
            <h4 className="text-sm font-medium text-foreground">Advanced Settings</h4>
            
            <div className="space-y-3">
              <Checkbox
                label="Enable Cost Estimation"
                description="Calculate estimated campaign costs based on message volume"
                checked={enableCostEstimation}
                onChange={(e) => setEnableCostEstimation(e?.target?.checked)}
              />

              <Checkbox
                label="CRM Integration"
                description="Sync campaign results with CRM system"
                checked={crmSync}
                onChange={(e) => setCrmSync(e?.target?.checked)}
              />

              <Checkbox
                label="Compliance Verification"
                description="I confirm this campaign complies with messaging regulations"
                checked={complianceChecked}
                onChange={(e) => setComplianceChecked(e?.target?.checked)}
                required
              />
            </div>

            {enableCostEstimation && (
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-md">
                <div className="flex items-center space-x-2 mb-2">
                  <Icon name="Calculator" size={16} className="text-primary" />
                  <h5 className="text-sm font-medium text-foreground">Cost Estimation</h5>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Valid Numbers</p>
                    <p className="font-medium text-foreground">26,890</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Rate per Message</p>
                    <p className="font-medium text-foreground">$0.045</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Estimated Cost</p>
                    <p className="font-medium text-primary">$1,210.05</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Integration Status */}
        <div className="space-y-4 border-t border-border pt-4">
          <h4 className="text-sm font-medium text-foreground">Integration Status</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
              <div className="flex items-center space-x-2">
                <Icon name="Database" size={16} className="text-primary" />
                <span className="text-sm text-foreground">CRM System</span>
              </div>
              <div className="flex items-center space-x-1">
                <Icon name="CheckCircle" size={14} className="text-success" />
                <span className="text-xs text-success">Connected</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
              <div className="flex items-center space-x-2">
                <Icon name="MessageSquare" size={16} className="text-primary" />
                <span className="text-sm text-foreground">WhatsApp API</span>
              </div>
              <div className="flex items-center space-x-1">
                <Icon name="CheckCircle" size={14} className="text-success" />
                <span className="text-xs text-success">Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <Button variant="outline" iconName="Save" iconPosition="left">
            Save as Draft
          </Button>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline">
              Preview Campaign
            </Button>
            <Button 
              variant="default" 
              onClick={handleSaveCampaign}
              disabled={!campaignName || !selectedTemplate || !complianceChecked}
              iconName="Send"
              iconPosition="left"
            >
              Launch Campaign
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignConfiguration;