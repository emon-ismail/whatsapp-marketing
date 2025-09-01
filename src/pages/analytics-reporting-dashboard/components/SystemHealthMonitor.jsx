import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const SystemHealthMonitor = () => {
  const [systemMetrics, setSystemMetrics] = useState({
    apiStatus: 'healthy',
    dbStatus: 'healthy',
    queueStatus: 'healthy',
    responseTime: 245,
    throughput: 1250,
    errorRate: 0.02,
    uptime: 99.97,
    activeConnections: 156,
    memoryUsage: 68,
    cpuUsage: 42
  });

  const [alerts, setAlerts] = useState([
    {
      id: 1,
      type: 'warning',
      message: 'High memory usage detected on server-02',
      timestamp: '2025-09-01 06:05:00',
      resolved: false
    },
    {
      id: 2,
      type: 'info',
      message: 'Scheduled maintenance completed successfully',
      timestamp: '2025-09-01 05:30:00',
      resolved: true
    }
  ]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemMetrics(prev => ({
        ...prev,
        responseTime: prev?.responseTime + Math.floor(Math.random() * 20) - 10,
        throughput: prev?.throughput + Math.floor(Math.random() * 100) - 50,
        activeConnections: prev?.activeConnections + Math.floor(Math.random() * 10) - 5,
        memoryUsage: Math.max(0, Math.min(100, prev?.memoryUsage + Math.floor(Math.random() * 6) - 3)),
        cpuUsage: Math.max(0, Math.min(100, prev?.cpuUsage + Math.floor(Math.random() * 8) - 4))
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy':
        return 'text-success bg-success/10';
      case 'warning':
        return 'text-warning bg-warning/10';
      case 'critical':
        return 'text-error bg-error/10';
      default:
        return 'text-muted-foreground bg-muted/10';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy':
        return 'CheckCircle';
      case 'warning':
        return 'AlertTriangle';
      case 'critical':
        return 'XCircle';
      default:
        return 'Circle';
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'error':
        return 'XCircle';
      case 'warning':
        return 'AlertTriangle';
      case 'info':
        return 'Info';
      default:
        return 'Bell';
    }
  };

  const getAlertColor = (type) => {
    switch (type) {
      case 'error':
        return 'text-error';
      case 'warning':
        return 'text-warning';
      case 'info':
        return 'text-primary';
      default:
        return 'text-muted-foreground';
    }
  };

  const getUsageColor = (percentage) => {
    if (percentage >= 90) return 'bg-error';
    if (percentage >= 75) return 'bg-warning';
    return 'bg-success';
  };

  return (
    <div className="space-y-6">
      {/* System Status Overview */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">System Health Monitor</h3>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              <span>Live</span>
            </div>
            <Button variant="outline" size="sm" iconName="RefreshCw" iconPosition="left">
              Refresh
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Service Status */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground">Service Status</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Icon name="Server" size={16} className="text-muted-foreground" />
                  <span className="text-sm text-foreground">API Gateway</span>
                </div>
                <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(systemMetrics?.apiStatus)}`}>
                  <Icon name={getStatusIcon(systemMetrics?.apiStatus)} size={12} />
                  <span className="capitalize">{systemMetrics?.apiStatus}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Icon name="Database" size={16} className="text-muted-foreground" />
                  <span className="text-sm text-foreground">Database</span>
                </div>
                <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(systemMetrics?.dbStatus)}`}>
                  <Icon name={getStatusIcon(systemMetrics?.dbStatus)} size={12} />
                  <span className="capitalize">{systemMetrics?.dbStatus}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Icon name="Layers" size={16} className="text-muted-foreground" />
                  <span className="text-sm text-foreground">Message Queue</span>
                </div>
                <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(systemMetrics?.queueStatus)}`}>
                  <Icon name={getStatusIcon(systemMetrics?.queueStatus)} size={12} />
                  <span className="capitalize">{systemMetrics?.queueStatus}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground">Performance</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Response Time</span>
                <span className="text-sm font-medium text-foreground">{systemMetrics?.responseTime}ms</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Throughput</span>
                <span className="text-sm font-medium text-foreground">{systemMetrics?.throughput?.toLocaleString()}/min</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Error Rate</span>
                <span className="text-sm font-medium text-foreground">{systemMetrics?.errorRate}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Uptime</span>
                <span className="text-sm font-medium text-success">{systemMetrics?.uptime}%</span>
              </div>
            </div>
          </div>

          {/* Resource Usage */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground">Resource Usage</h4>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-muted-foreground">Memory</span>
                  <span className="text-sm font-medium text-foreground">{systemMetrics?.memoryUsage}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${getUsageColor(systemMetrics?.memoryUsage)}`}
                    style={{ width: `${systemMetrics?.memoryUsage}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-muted-foreground">CPU</span>
                  <span className="text-sm font-medium text-foreground">{systemMetrics?.cpuUsage}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${getUsageColor(systemMetrics?.cpuUsage)}`}
                    style={{ width: `${systemMetrics?.cpuUsage}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Active Connections</span>
                <span className="text-sm font-medium text-foreground">{systemMetrics?.activeConnections}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Recent Alerts */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-foreground">Recent Alerts</h4>
          <Button variant="outline" size="sm" iconName="Settings" iconPosition="left">
            Configure
          </Button>
        </div>

        <div className="space-y-3">
          {alerts?.map((alert) => (
            <div 
              key={alert?.id} 
              className={`flex items-start space-x-3 p-3 rounded-lg border ${
                alert?.resolved ? 'bg-muted/30 border-muted' : 'bg-card border-border'
              }`}
            >
              <Icon 
                name={getAlertIcon(alert?.type)} 
                size={16} 
                className={`mt-0.5 ${getAlertColor(alert?.type)} ${alert?.resolved ? 'opacity-50' : ''}`}
              />
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${alert?.resolved ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                  {alert?.message}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{alert?.timestamp}</p>
              </div>
              {!alert?.resolved && (
                <Button variant="ghost" size="sm" iconName="X" iconPosition="left">
                  Dismiss
                </Button>
              )}
            </div>
          ))}
        </div>

        {alerts?.length === 0 && (
          <div className="text-center py-8">
            <Icon name="CheckCircle" size={48} className="text-success mx-auto mb-4" />
            <h4 className="text-lg font-medium text-foreground mb-2">All Systems Operational</h4>
            <p className="text-muted-foreground">No alerts or issues detected</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemHealthMonitor;