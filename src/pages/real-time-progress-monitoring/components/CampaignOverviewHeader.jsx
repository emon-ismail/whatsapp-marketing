import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const CampaignOverviewHeader = ({ overviewData, onRefresh, onExport }) => {
  const getOverallHealthColor = (health) => {
    switch (health) {
      case 'excellent':
        return 'text-success bg-success/10';
      case 'good':
        return 'text-primary bg-primary/10';
      case 'warning':
        return 'text-warning bg-warning/10';
      case 'critical':
        return 'text-error bg-error/10';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000)?.toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000)?.toFixed(1)}K`;
    return num?.toString();
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 mb-6">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Real-time Progress Monitoring</h1>
          <p className="text-muted-foreground mt-1">
            Live campaign tracking and performance analytics
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            iconName="RefreshCw"
            iconPosition="left"
            iconSize={16}
          >
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            iconName="Download"
            iconPosition="left"
            iconSize={16}
          >
            Export
          </Button>
          <div className={`px-3 py-2 rounded-lg text-sm font-medium ${getOverallHealthColor(overviewData?.systemHealth)}`}>
            <Icon name="Activity" size={16} className="inline mr-2" />
            System {overviewData?.systemHealth}
          </div>
        </div>
      </div>
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
        {/* Active Campaigns */}
        <div className="text-center p-4 bg-primary/5 rounded-lg border border-primary/10">
          <div className="flex items-center justify-center mb-2">
            <Icon name="Play" size={20} className="text-primary" />
          </div>
          <div className="text-2xl font-bold text-primary">{overviewData?.activeCampaigns}</div>
          <div className="text-xs text-muted-foreground">Active Campaigns</div>
        </div>

        {/* Total Messages */}
        <div className="text-center p-4 bg-success/5 rounded-lg border border-success/10">
          <div className="flex items-center justify-center mb-2">
            <Icon name="MessageSquare" size={20} className="text-success" />
          </div>
          <div className="text-2xl font-bold text-success">{formatNumber(overviewData?.totalMessages)}</div>
          <div className="text-xs text-muted-foreground">Total Messages</div>
        </div>

        {/* Messages Sent */}
        <div className="text-center p-4 bg-success/5 rounded-lg border border-success/10">
          <div className="flex items-center justify-center mb-2">
            <Icon name="Send" size={20} className="text-success" />
          </div>
          <div className="text-2xl font-bold text-success">{formatNumber(overviewData?.messagesSent)}</div>
          <div className="text-xs text-muted-foreground">Messages Sent</div>
        </div>

        {/* Active Moderators */}
        <div className="text-center p-4 bg-primary/5 rounded-lg border border-primary/10">
          <div className="flex items-center justify-center mb-2">
            <Icon name="Users" size={20} className="text-primary" />
          </div>
          <div className="text-2xl font-bold text-primary">{overviewData?.activeModerators}</div>
          <div className="text-xs text-muted-foreground">Active Moderators</div>
        </div>

        {/* Success Rate */}
        <div className="text-center p-4 bg-success/5 rounded-lg border border-success/10">
          <div className="flex items-center justify-center mb-2">
            <Icon name="TrendingUp" size={20} className="text-success" />
          </div>
          <div className="text-2xl font-bold text-success">{overviewData?.successRate}%</div>
          <div className="text-xs text-muted-foreground">Success Rate</div>
        </div>

        {/* Average Velocity */}
        <div className="text-center p-4 bg-warning/5 rounded-lg border border-warning/10">
          <div className="flex items-center justify-center mb-2">
            <Icon name="Zap" size={20} className="text-warning" />
          </div>
          <div className="text-2xl font-bold text-warning">{overviewData?.avgVelocity}</div>
          <div className="text-xs text-muted-foreground">Avg Velocity/min</div>
        </div>
      </div>
      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Overall Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Overall Progress</span>
            <span className="text-sm font-bold text-foreground">{overviewData?.overallProgress}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-3">
            <div 
              className="h-3 bg-gradient-to-r from-primary to-success rounded-full transition-all duration-500"
              style={{ width: `${overviewData?.overallProgress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatNumber(overviewData?.messagesSent)} sent</span>
            <span>{formatNumber(overviewData?.totalMessages - overviewData?.messagesSent)} remaining</span>
          </div>
        </div>

        {/* Performance Indicators */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-foreground">Performance Indicators</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Message Velocity</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-foreground">{overviewData?.currentVelocity}/min</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">API Response Time</span>
              <span className="text-xs font-medium text-foreground">{overviewData?.apiResponseTime}ms</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Error Rate</span>
              <span className="text-xs font-medium text-error">{overviewData?.errorRate}%</span>
            </div>
          </div>
        </div>

        {/* Time Estimates */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-foreground">Time Estimates</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Est. Completion</span>
              <span className="text-xs font-medium text-foreground">{overviewData?.estimatedCompletion}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Running Time</span>
              <span className="text-xs font-medium text-foreground">{overviewData?.runningTime}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Next Milestone</span>
              <span className="text-xs font-medium text-primary">{overviewData?.nextMilestone}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignOverviewHeader;