import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ConnectionStatusPanel = ({ onRefresh }) => {
  const [connectionStatus, setConnectionStatus] = useState('connected');
  const [apiHealth, setApiHealth] = useState({
    whatsapp: 'healthy',
    database: 'healthy',
    queue: 'healthy'
  });
  const [rateLimits, setRateLimits] = useState({
    current: 245,
    limit: 1000,
    resetTime: '14:30'
  });
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
      setRateLimits(prev => ({
        ...prev,
        current: Math.max(0, prev?.current + Math.floor(Math.random() * 10) - 5)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected': case'healthy':
        return 'text-success';
      case 'connecting': case'warning':
        return 'text-warning';
      case 'disconnected': case'error':
        return 'text-error';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'connected': case'healthy':
        return 'CheckCircle';
      case 'connecting': case'warning':
        return 'AlertTriangle';
      case 'disconnected': case'error':
        return 'XCircle';
      default:
        return 'Circle';
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'connected': case'healthy':
        return 'bg-green-50';
      case 'connecting': case'warning':
        return 'bg-yellow-50';
      case 'disconnected': case'error':
        return 'bg-red-50';
      default:
        return 'bg-gray-50';
    }
  };

  const formatTime = (date) => {
    return date?.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getRateLimitPercentage = () => {
    return (rateLimits?.current / rateLimits?.limit) * 100;
  };

  const getRateLimitColor = () => {
    const percentage = getRateLimitPercentage();
    if (percentage > 80) return 'bg-red-500';
    if (percentage > 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground flex items-center space-x-2">
          <Icon name="Activity" size={20} />
          <span>System Status</span>
        </h3>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-muted-foreground">
            Last updated: {formatTime(lastUpdate)}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={onRefresh}
            className="h-8 w-8"
            title="Refresh status"
          >
            <Icon name="RefreshCw" size={14} />
          </Button>
        </div>
      </div>
      {/* Connection Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`p-3 rounded-lg ${getStatusBg(connectionStatus)}`}>
          <div className="flex items-center space-x-2 mb-2">
            <Icon 
              name={getStatusIcon(connectionStatus)} 
              size={16} 
              className={getStatusColor(connectionStatus)}
            />
            <span className="font-medium text-foreground">WhatsApp API</span>
          </div>
          <p className={`text-sm font-medium ${getStatusColor(connectionStatus)}`}>
            {connectionStatus?.charAt(0)?.toUpperCase() + connectionStatus?.slice(1)}
          </p>
        </div>

        <div className={`p-3 rounded-lg ${getStatusBg(apiHealth?.database)}`}>
          <div className="flex items-center space-x-2 mb-2">
            <Icon 
              name={getStatusIcon(apiHealth?.database)} 
              size={16} 
              className={getStatusColor(apiHealth?.database)}
            />
            <span className="font-medium text-foreground">Database</span>
          </div>
          <p className={`text-sm font-medium ${getStatusColor(apiHealth?.database)}`}>
            {apiHealth?.database?.charAt(0)?.toUpperCase() + apiHealth?.database?.slice(1)}
          </p>
        </div>

        <div className={`p-3 rounded-lg ${getStatusBg(apiHealth?.queue)}`}>
          <div className="flex items-center space-x-2 mb-2">
            <Icon 
              name={getStatusIcon(apiHealth?.queue)} 
              size={16} 
              className={getStatusColor(apiHealth?.queue)}
            />
            <span className="font-medium text-foreground">Message Queue</span>
          </div>
          <p className={`text-sm font-medium ${getStatusColor(apiHealth?.queue)}`}>
            {apiHealth?.queue?.charAt(0)?.toUpperCase() + apiHealth?.queue?.slice(1)}
          </p>
        </div>
      </div>
      {/* Rate Limits */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-foreground">API Rate Limits</h4>
          <span className="text-sm text-muted-foreground">
            Resets at {rateLimits?.resetTime}
          </span>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Messages sent today</span>
            <span className="font-medium text-foreground">
              {rateLimits?.current?.toLocaleString()} / {rateLimits?.limit?.toLocaleString()}
            </span>
          </div>
          
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${getRateLimitColor()}`}
              style={{ width: `${Math.min(getRateLimitPercentage(), 100)}%` }}
            ></div>
          </div>
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0</span>
            <span>{getRateLimitPercentage()?.toFixed(1)}% used</span>
            <span>{rateLimits?.limit?.toLocaleString()}</span>
          </div>
        </div>
      </div>
      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
        <Button
          variant="outline"
          size="sm"
          iconName="Zap"
          iconPosition="left"
        >
          Test Connection
        </Button>
        <Button
          variant="outline"
          size="sm"
          iconName="Settings"
          iconPosition="left"
        >
          API Settings
        </Button>
        <Button
          variant="outline"
          size="sm"
          iconName="Download"
          iconPosition="left"
        >
          Export Logs
        </Button>
      </div>
    </div>
  );
};

export default ConnectionStatusPanel;