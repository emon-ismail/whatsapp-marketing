import React from 'react';
import Icon from '../../../components/AppIcon';

const CampaignCard = ({ campaign }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-success bg-success/10 border-success/20';
      case 'paused':
        return 'text-warning bg-warning/10 border-warning/20';
      case 'completed':
        return 'text-primary bg-primary/10 border-primary/20';
      case 'failed':
        return 'text-error bg-error/10 border-error/20';
      default:
        return 'text-muted-foreground bg-muted border-border';
    }
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 90) return 'bg-success';
    if (percentage >= 70) return 'bg-primary';
    if (percentage >= 50) return 'bg-warning';
    return 'bg-error';
  };

  const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icon name="MessageSquare" size={20} className="text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{campaign?.name}</h3>
            <p className="text-sm text-muted-foreground">ID: {campaign?.id}</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(campaign?.status)}`}>
          {campaign?.status?.charAt(0)?.toUpperCase() + campaign?.status?.slice(1)}
        </div>
      </div>
      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">Progress</span>
          <span className="text-sm font-semibold text-foreground">{campaign?.progress}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(campaign?.progress)}`}
            style={{ width: `${campaign?.progress}%` }}
          />
        </div>
      </div>
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground">{campaign?.totalNumbers?.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground">Total Numbers</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-success">{campaign?.sentMessages?.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground">Messages Sent</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-warning">{campaign?.pendingMessages?.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground">Pending</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-error">{campaign?.failedMessages?.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground">Failed</div>
        </div>
      </div>
      {/* Performance Metrics */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-2">
          <Icon name="Zap" size={16} className="text-warning" />
          <span className="text-muted-foreground">Velocity:</span>
          <span className="font-medium text-foreground">{campaign?.velocity}/min</span>
        </div>
        <div className="flex items-center space-x-2">
          <Icon name="Clock" size={16} className="text-primary" />
          <span className="text-muted-foreground">ETA:</span>
          <span className="font-medium text-foreground">{formatDuration(campaign?.estimatedTime)}</span>
        </div>
      </div>
    </div>
  );
};

export default CampaignCard;