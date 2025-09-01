import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const RoleConfirmation = ({ userRole, onProceed, onLogout }) => {
  const [sessionInfo, setSessionInfo] = useState({
    loginTime: new Date(),
    lastActivity: new Date(),
    sessionId: 'WBM-' + Math.random()?.toString(36)?.substr(2, 9)?.toUpperCase()
  });

  const rolePermissions = {
    moderator: {
      title: 'Moderator Access',
      icon: 'Users',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      permissions: [
        'View assigned phone numbers',
        'Send WhatsApp messages',
        'Update message status',
        'Access basic reporting',
        'View campaign progress'
      ],
      restrictions: [
        'Cannot upload campaigns',
        'Cannot assign roles',
        'Limited to assigned numbers only'
      ],
      redirectPath: '/moderator-assignment-dashboard',
      activeCampaigns: 3,
      assignedNumbers: 2250
    },
    manager: {
      title: 'Manager Access',
      icon: 'BarChart3',
      color: 'text-accent',
      bgColor: 'bg-accent/10',
      permissions: [
        'Monitor all campaigns',
        'View detailed analytics',
        'Manage moderator assignments',
        'Export campaign reports',
        'Access real-time dashboard'
      ],
      restrictions: [
        'Cannot upload new campaigns',
        'Cannot modify system settings',
        'Limited user management'
      ],
      redirectPath: '/real-time-progress-monitoring',
      activeCampaigns: 5,
      totalModerators: 12
    },
    admin: {
      title: 'Administrator Access',
      icon: 'Shield',
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      permissions: [
        'Full system administration',
        'Upload and configure campaigns',
        'Manage user roles and access',
        'System configuration',
        'Complete audit access'
      ],
      restrictions: [
        'With great power comes great responsibility'
      ],
      redirectPath: '/campaign-upload-configuration',
      activeCampaigns: 5,
      totalUsers: 15
    }
  };

  const currentRole = rolePermissions?.[userRole];

  useEffect(() => {
    const interval = setInterval(() => {
      setSessionInfo(prev => ({
        ...prev,
        lastActivity: new Date()
      }));
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (date) => {
    return date?.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getSessionDuration = () => {
    const diff = new Date() - sessionInfo?.loginTime;
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Role Header */}
      <div className="text-center space-y-4">
        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${currentRole?.bgColor}`}>
          <Icon name={currentRole?.icon} size={32} className={currentRole?.color} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">{currentRole?.title}</h2>
          <p className="text-muted-foreground">Authentication successful</p>
        </div>
      </div>
      {/* Session Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-card border border-border rounded-lg">
          <h3 className="text-sm font-semibold text-foreground mb-3">Session Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Session ID:</span>
              <span className="font-mono text-foreground">{sessionInfo?.sessionId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Login Time:</span>
              <span className="text-foreground">{formatTime(sessionInfo?.loginTime)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Duration:</span>
              <span className="text-foreground">{getSessionDuration()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last Activity:</span>
              <span className="text-foreground">{formatTime(sessionInfo?.lastActivity)}</span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-card border border-border rounded-lg">
          <h3 className="text-sm font-semibold text-foreground mb-3">Campaign Overview</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Active Campaigns:</span>
              <span className="font-semibold text-foreground">{currentRole?.activeCampaigns}</span>
            </div>
            {userRole === 'moderator' && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Assigned Numbers:</span>
                <span className="font-semibold text-foreground">{currentRole?.assignedNumbers?.toLocaleString()}</span>
              </div>
            )}
            {userRole === 'manager' && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Moderators:</span>
                <span className="font-semibold text-foreground">{currentRole?.totalModerators}</span>
              </div>
            )}
            {userRole === 'admin' && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Users:</span>
                <span className="font-semibold text-foreground">{currentRole?.totalUsers}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">System Status:</span>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span className="text-success text-xs">Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Permissions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-card border border-border rounded-lg">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center space-x-2">
            <Icon name="Check" size={16} className="text-success" />
            <span>Granted Permissions</span>
          </h3>
          <ul className="space-y-2">
            {currentRole?.permissions?.map((permission, index) => (
              <li key={index} className="flex items-start space-x-2 text-sm">
                <Icon name="CheckCircle" size={14} className="text-success mt-0.5 flex-shrink-0" />
                <span className="text-foreground">{permission}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-4 bg-card border border-border rounded-lg">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center space-x-2">
            <Icon name="X" size={16} className="text-muted-foreground" />
            <span>Restrictions</span>
          </h3>
          <ul className="space-y-2">
            {currentRole?.restrictions?.map((restriction, index) => (
              <li key={index} className="flex items-start space-x-2 text-sm">
                <Icon name="XCircle" size={14} className="text-muted-foreground mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">{restriction}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Button
          variant="default"
          size="lg"
          fullWidth
          onClick={() => onProceed(currentRole?.redirectPath)}
          iconName="ArrowRight"
          iconPosition="right"
        >
          Continue to Dashboard
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={onLogout}
          iconName="LogOut"
          iconPosition="left"
          className="sm:w-auto"
        >
          Logout
        </Button>
      </div>
      {/* Security Notice */}
      <div className="p-3 bg-muted/30 border border-border rounded-lg">
        <div className="flex items-start space-x-2">
          <Icon name="Info" size={16} className="text-primary mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="text-foreground font-medium">Security Notice</p>
            <p className="text-muted-foreground mt-1">
              Your session will automatically expire after 30 minutes of inactivity. 
              All actions are logged for security and compliance purposes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleConfirmation;