import React from 'react';
import Icon from '../../../components/AppIcon';

const ModeratorPerformanceMatrix = ({ moderators }) => {
  const getEfficiencyColor = (efficiency) => {
    if (efficiency >= 90) return 'text-success bg-success/10';
    if (efficiency >= 75) return 'text-primary bg-primary/10';
    if (efficiency >= 60) return 'text-warning bg-warning/10';
    return 'text-error bg-error/10';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return { icon: 'Play', color: 'text-success' };
      case 'idle':
        return { icon: 'Pause', color: 'text-warning' };
      case 'offline':
        return { icon: 'Square', color: 'text-error' };
      default:
        return { icon: 'Circle', color: 'text-muted-foreground' };
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground">Moderator Performance</h2>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
          <span className="text-sm text-muted-foreground">Live Updates</span>
        </div>
      </div>
      <div className="space-y-4">
        {moderators?.map((moderator) => {
          const statusInfo = getStatusIcon(moderator?.status);
          return (
            <div key={moderator?.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors duration-200">
              {/* Moderator Info */}
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                    <Icon name="User" size={20} color="white" />
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center ${statusInfo?.color}`}>
                    <Icon name={statusInfo?.icon} size={10} />
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-foreground">{moderator?.name}</h3>
                  <p className="text-sm text-muted-foreground">ID: {moderator?.id}</p>
                </div>
              </div>
              {/* Performance Metrics */}
              <div className="flex items-center space-x-6">
                {/* Workload */}
                <div className="text-center">
                  <div className="text-lg font-bold text-foreground">{moderator?.assignedNumbers?.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">Assigned</div>
                </div>

                {/* Completed */}
                <div className="text-center">
                  <div className="text-lg font-bold text-success">{moderator?.completedMessages?.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">Completed</div>
                </div>

                {/* Success Rate */}
                <div className="text-center">
                  <div className="text-lg font-bold text-primary">{moderator?.successRate}%</div>
                  <div className="text-xs text-muted-foreground">Success Rate</div>
                </div>

                {/* Efficiency Badge */}
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getEfficiencyColor(moderator?.efficiency)}`}>
                  {moderator?.efficiency}%
                </div>

                {/* Current Activity */}
                <div className="text-right min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">{moderator?.currentActivity}</div>
                  <div className="text-xs text-muted-foreground">
                    {moderator?.status === 'active' ? `${moderator?.messagesPerMinute}/min` : 'Inactive'}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {/* Summary Stats */}
      <div className="mt-6 pt-6 border-t border-border">
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-success">{moderators?.filter(m => m?.status === 'active')?.length}</div>
            <div className="text-sm text-muted-foreground">Active</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-warning">{moderators?.filter(m => m?.status === 'idle')?.length}</div>
            <div className="text-sm text-muted-foreground">Idle</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-error">{moderators?.filter(m => m?.status === 'offline')?.length}</div>
            <div className="text-sm text-muted-foreground">Offline</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {Math.round(moderators?.reduce((acc, m) => acc + m?.efficiency, 0) / moderators?.length)}%
            </div>
            <div className="text-sm text-muted-foreground">Avg Efficiency</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModeratorPerformanceMatrix;