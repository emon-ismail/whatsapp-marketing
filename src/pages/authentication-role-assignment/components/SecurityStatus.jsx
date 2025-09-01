import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';

const SecurityStatus = () => {
  const [connectionStatus, setConnectionStatus] = useState('connected');
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [activeUsers, setActiveUsers] = useState(8);

  const securityFeatures = [
    {
      id: 'ssl',
      label: 'SSL Certificate',
      status: 'active',
      icon: 'Shield',
      description: 'Secure connection established'
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp API',
      status: connectionStatus,
      icon: 'MessageCircle',
      description: connectionStatus === 'connected' ? 'API connection stable' : 'Checking connection...'
    },
    {
      id: 'database',
      label: 'Database Health',
      status: 'active',
      icon: 'Database',
      description: 'All systems operational'
    },
    {
      id: 'session',
      label: 'Session Security',
      status: 'active',
      icon: 'Lock',
      description: 'Advanced encryption enabled'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
      // Simulate occasional connection checks
      if (Math.random() > 0.95) {
        setConnectionStatus(prev => prev === 'connected' ? 'checking' : 'connected');
        setTimeout(() => setConnectionStatus('connected'), 2000);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': case'connected':
        return 'text-success';
      case 'checking': case'warning':
        return 'text-warning';
      case 'error': case'disconnected':
        return 'text-error';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': case'connected':
        return 'CheckCircle';
      case 'checking':
        return 'Clock';
      case 'error': case'disconnected':
        return 'XCircle';
      default:
        return 'Circle';
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {/* System Status Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center space-x-2">
          <Icon name="Shield" size={24} className="text-success" />
          <h3 className="text-lg font-semibold text-foreground">System Security</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Last updated: {lastUpdate?.toLocaleTimeString()}
        </p>
      </div>
      {/* Security Features Grid */}
      <div className="grid grid-cols-1 gap-3">
        {securityFeatures?.map((feature) => (
          <div
            key={feature?.id}
            className="flex items-center justify-between p-3 bg-card border border-border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8 bg-muted rounded-full">
                <Icon name={feature?.icon} size={16} className="text-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{feature?.label}</p>
                <p className="text-xs text-muted-foreground">{feature?.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Icon 
                name={getStatusIcon(feature?.status)} 
                size={16} 
                className={getStatusColor(feature?.status)}
              />
              <span className={`text-xs font-medium ${getStatusColor(feature?.status)}`}>
                {feature?.status === 'active' ? 'Active' : 
                 feature?.status === 'connected' ? 'Connected' :
                 feature?.status === 'checking' ? 'Checking' : 'Error'}
              </span>
            </div>
          </div>
        ))}
      </div>
      {/* Active Sessions */}
      <div className="p-4 bg-muted/30 border border-border rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-foreground">Active Sessions</h4>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
            <span className="text-xs text-success">Live</span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Current Users:</span>
            <span className="font-medium text-foreground">{activeUsers}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Failed Attempts:</span>
            <span className={`font-medium ${failedAttempts > 0 ? 'text-warning' : 'text-success'}`}>
              {failedAttempts}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Session Timeout:</span>
            <span className="font-medium text-foreground">30 min</span>
          </div>
        </div>
      </div>
      {/* Security Badges */}
      <div className="flex items-center justify-center space-x-4 pt-2">
        <div className="flex items-center space-x-1">
          <Icon name="Shield" size={14} className="text-success" />
          <span className="text-xs text-muted-foreground">256-bit SSL</span>
        </div>
        <div className="flex items-center space-x-1">
          <Icon name="Lock" size={14} className="text-success" />
          <span className="text-xs text-muted-foreground">2FA Ready</span>
        </div>
        <div className="flex items-center space-x-1">
          <Icon name="Eye" size={14} className="text-success" />
          <span className="text-xs text-muted-foreground">Audit Trail</span>
        </div>
      </div>
    </div>
  );
};

export default SecurityStatus;