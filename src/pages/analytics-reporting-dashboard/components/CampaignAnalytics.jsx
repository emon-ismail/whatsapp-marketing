import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const CampaignAnalytics = ({ campaigns, onCampaignSelect }) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');
  const [selectedCampaign, setSelectedCampaign] = useState('all');

  const timeframeOptions = [
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const campaignOptions = [
    { value: 'all', label: 'All Campaigns' },
    ...campaigns?.map(campaign => ({
      value: campaign?.id,
      label: campaign?.name
    }))
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-success bg-success/10';
      case 'active':
        return 'text-primary bg-primary/10';
      case 'paused':
        return 'text-warning bg-warning/10';
      case 'failed':
        return 'text-error bg-error/10';
      default:
        return 'text-muted-foreground bg-muted/10';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return 'CheckCircle';
      case 'active':
        return 'Play';
      case 'paused':
        return 'Pause';
      case 'failed':
        return 'XCircle';
      default:
        return 'Circle';
    }
  };

  const calculateCompletionRate = (completed, total) => {
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Campaign Analytics</h3>
        <div className="flex items-center space-x-3">
          <Select
            options={timeframeOptions}
            value={selectedTimeframe}
            onChange={setSelectedTimeframe}
            className="w-40"
          />
          <Select
            options={campaignOptions}
            value={selectedCampaign}
            onChange={setSelectedCampaign}
            className="w-48"
          />
          <Button variant="outline" size="sm" iconName="RefreshCw" iconPosition="left">
            Refresh
          </Button>
        </div>
      </div>
      <div className="space-y-4">
        {campaigns?.map((campaign) => (
          <div 
            key={campaign?.id} 
            className="border border-border rounded-lg p-4 hover:bg-muted/30 transition-colors duration-200 cursor-pointer"
            onClick={() => onCampaignSelect(campaign)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Icon name="Target" size={20} className="text-primary" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">{campaign?.name}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{campaign?.description}</p>
                </div>
              </div>
              <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign?.status)}`}>
                <Icon name={getStatusIcon(campaign?.status)} size={12} />
                <span className="capitalize">{campaign?.status}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-lg font-bold text-foreground">{campaign?.totalNumbers?.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Total Numbers</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-success">{campaign?.completed?.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-error">{campaign?.failed?.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Failed</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-primary">{calculateCompletionRate(campaign?.completed, campaign?.totalNumbers)}%</div>
                <div className="text-xs text-muted-foreground">Success Rate</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="text-foreground font-medium">
                  {campaign?.completed?.toLocaleString()} / {campaign?.totalNumbers?.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${calculateCompletionRate(campaign?.completed, campaign?.totalNumbers)}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Icon name="Calendar" size={12} />
                  <span>Started: {campaign?.startDate}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Icon name="Users" size={12} />
                  <span>{campaign?.moderatorsAssigned} moderators</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Icon name="Clock" size={12} />
                  <span>Avg: {campaign?.avgResponseTime}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" iconName="BarChart3" iconPosition="left">
                  Analytics
                </Button>
                <Button variant="ghost" size="icon">
                  <Icon name="MoreHorizontal" size={16} />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {campaigns?.length === 0 && (
        <div className="text-center py-12">
          <Icon name="BarChart3" size={48} className="text-muted-foreground mx-auto mb-4" />
          <h4 className="text-lg font-medium text-foreground mb-2">No Campaigns Found</h4>
          <p className="text-muted-foreground mb-4">Start by creating your first campaign to see analytics here.</p>
          <Button variant="default" iconName="Plus" iconPosition="left">
            Create Campaign
          </Button>
        </div>
      )}
    </div>
  );
};

export default CampaignAnalytics;