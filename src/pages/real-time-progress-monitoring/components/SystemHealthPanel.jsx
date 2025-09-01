import React from 'react';
import Icon from '../../../components/AppIcon';

const SystemHealthPanel = ({ systemHealth }) => {
  const getHealthColor = (status) => {
    switch (status) {
      case 'healthy':
        return 'text-success bg-success/10 border-success/20';
      case 'warning':
        return 'text-warning bg-warning/10 border-warning/20';
      case 'critical':
        return 'text-error bg-error/10 border-error/20';
      case 'maintenance':
        return 'text-primary bg-primary/10 border-primary/20';
      default:
        return 'text-muted-foreground bg-muted border-border';
    }
  };

  const getHealthIcon = (status) => {
    switch (status) {
      case 'healthy':
        return 'CheckCircle';
      case 'warning':
        return 'AlertTriangle';
      case 'critical':
        return 'XCircle';
      case 'maintenance':
        return 'Settings';
      default:
        return 'Circle';
    }
  };

  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground">System Health</h2>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
          <span className="text-sm text-muted-foreground">Monitoring</span>
        </div>
      </div>
      {/* Overall System Status */}
      <div className="mb-6 p-4 bg-muted/20 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Icon 
              name={getHealthIcon(systemHealth?.overall?.status)} 
              size={24} 
              className={systemHealth?.overall?.status === 'healthy' ? 'text-success' : 
                        systemHealth?.overall?.status === 'warning' ? 'text-warning' : 'text-error'} 
            />
            <div>
              <h3 className="font-semibold text-foreground">Overall System Status</h3>
              <p className="text-sm text-muted-foreground">Last updated: {new Date()?.toLocaleTimeString()}</p>
            </div>
          </div>
          <div className={`px-4 py-2 rounded-full text-sm font-medium border ${getHealthColor(systemHealth?.overall?.status)}`}>
            {systemHealth?.overall?.status?.charAt(0)?.toUpperCase() + systemHealth?.overall?.status?.slice(1)}
          </div>
        </div>
      </div>
      {/* Service Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {systemHealth?.services?.map((service) => (
          <div key={service?.name} className="p-4 bg-muted/10 rounded-lg border border-border">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Icon name={service?.icon} size={18} className="text-primary" />
                <span className="font-medium text-foreground">{service?.name}</span>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${getHealthColor(service?.status)}`}>
                {service?.status}
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Response Time:</span>
                <span className="font-medium text-foreground">{service?.responseTime}ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Uptime:</span>
                <span className="font-medium text-foreground">{service?.uptime}%</span>
              </div>
              {service?.lastCheck && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Check:</span>
                  <span className="font-medium text-foreground">{service?.lastCheck}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      {/* Performance Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 bg-muted/10 rounded-lg">
          <div className="text-2xl font-bold text-primary">{systemHealth?.metrics?.cpu}%</div>
          <div className="text-xs text-muted-foreground">CPU Usage</div>
        </div>
        <div className="text-center p-3 bg-muted/10 rounded-lg">
          <div className="text-2xl font-bold text-success">{systemHealth?.metrics?.memory}%</div>
          <div className="text-xs text-muted-foreground">Memory Usage</div>
        </div>
        <div className="text-center p-3 bg-muted/10 rounded-lg">
          <div className="text-2xl font-bold text-warning">{systemHealth?.metrics?.disk}%</div>
          <div className="text-xs text-muted-foreground">Disk Usage</div>
        </div>
        <div className="text-center p-3 bg-muted/10 rounded-lg">
          <div className="text-2xl font-bold text-foreground">{systemHealth?.metrics?.activeConnections}</div>
          <div className="text-xs text-muted-foreground">Active Connections</div>
        </div>
      </div>
      {/* System Information */}
      <div className="pt-4 border-t border-border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Icon name="Clock" size={16} className="text-muted-foreground" />
            <span className="text-muted-foreground">Uptime:</span>
            <span className="font-medium text-foreground">{formatUptime(systemHealth?.uptime)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Icon name="Server" size={16} className="text-muted-foreground" />
            <span className="text-muted-foreground">Version:</span>
            <span className="font-medium text-foreground">{systemHealth?.version}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Icon name="Globe" size={16} className="text-muted-foreground" />
            <span className="text-muted-foreground">Region:</span>
            <span className="font-medium text-foreground">{systemHealth?.region}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemHealthPanel;