import React from 'react';
import Icon from '../../../components/AppIcon';

const LiveActivityFeed = ({ activities }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'message_sent':
        return { icon: 'Send', color: 'text-success' };
      case 'message_failed':
        return { icon: 'AlertCircle', color: 'text-error' };
      case 'moderator_assigned':
        return { icon: 'UserPlus', color: 'text-primary' };
      case 'campaign_started':
        return { icon: 'Play', color: 'text-success' };
      case 'campaign_paused':
        return { icon: 'Pause', color: 'text-warning' };
      case 'campaign_completed':
        return { icon: 'CheckCircle', color: 'text-success' };
      case 'system_alert':
        return { icon: 'AlertTriangle', color: 'text-warning' };
      case 'milestone_reached':
        return { icon: 'Trophy', color: 'text-primary' };
      default:
        return { icon: 'Info', color: 'text-muted-foreground' };
    }
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInSeconds = Math.floor((now - activityTime) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return activityTime?.toLocaleDateString();
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'border-l-error';
      case 'medium':
        return 'border-l-warning';
      case 'low':
        return 'border-l-primary';
      default:
        return 'border-l-border';
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground">Live Activity Feed</h2>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
          <span className="text-sm text-muted-foreground">Real-time</span>
        </div>
      </div>
      <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin">
        {activities?.map((activity) => {
          const activityInfo = getActivityIcon(activity?.type);
          return (
            <div 
              key={activity?.id} 
              className={`flex items-start space-x-3 p-3 bg-muted/20 rounded-lg border-l-4 ${getPriorityColor(activity?.priority)} hover:bg-muted/40 transition-colors duration-200`}
            >
              {/* Icon */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-background flex items-center justify-center ${activityInfo?.color}`}>
                <Icon name={activityInfo?.icon} size={16} />
              </div>
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground truncate">
                    {activity?.title}
                  </p>
                  <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                    {formatTimestamp(activity?.timestamp)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {activity?.description}
                </p>
                
                {/* Additional Details */}
                {activity?.details && (
                  <div className="flex items-center space-x-4 mt-2 text-xs">
                    {activity?.details?.moderator && (
                      <span className="text-muted-foreground">
                        <Icon name="User" size={12} className="inline mr-1" />
                        {activity?.details?.moderator}
                      </span>
                    )}
                    {activity?.details?.campaign && (
                      <span className="text-muted-foreground">
                        <Icon name="MessageSquare" size={12} className="inline mr-1" />
                        {activity?.details?.campaign}
                      </span>
                    )}
                    {activity?.details?.count && (
                      <span className="text-muted-foreground">
                        <Icon name="Hash" size={12} className="inline mr-1" />
                        {activity?.details?.count}
                      </span>
                    )}
                  </div>
                )}
              </div>
              {/* Status Indicator */}
              {activity?.status && (
                <div className={`flex-shrink-0 px-2 py-1 rounded-full text-xs font-medium ${
                  activity?.status === 'success' ? 'bg-success/10 text-success' :
                  activity?.status === 'warning' ? 'bg-warning/10 text-warning' :
                  activity?.status === 'error'? 'bg-error/10 text-error' : 'bg-muted text-muted-foreground'
                }`}>
                  {activity?.status}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {/* Activity Summary */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-success">
              {activities?.filter(a => a?.type === 'message_sent')?.length}
            </div>
            <div className="text-xs text-muted-foreground">Messages Sent</div>
          </div>
          <div>
            <div className="text-lg font-bold text-warning">
              {activities?.filter(a => a?.type === 'system_alert')?.length}
            </div>
            <div className="text-xs text-muted-foreground">System Alerts</div>
          </div>
          <div>
            <div className="text-lg font-bold text-primary">
              {activities?.filter(a => a?.type === 'milestone_reached')?.length}
            </div>
            <div className="text-xs text-muted-foreground">Milestones</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveActivityFeed;