import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const Sidebar = ({ isCollapsed = false, onToggleCollapse, userRole = 'moderator' }) => {
  const location = useLocation();
  const [connectionStatus, setConnectionStatus] = useState('connected');
  const [activeUsers, setActiveUsers] = useState(12);
  const [sessionDuration, setSessionDuration] = useState('2h 34m');

  // Navigation items with role-based visibility
  const navigationItems = [
    {
      section: 'Dashboard',
      items: [
        {
          label: 'Real-time Monitoring',
          path: '/real-time-progress-monitoring',
          icon: 'BarChart3',
          roles: ['moderator', 'manager', 'admin']
        }
      ]
    },
    {
      section: 'Campaign Management',
      items: [
        {
          label: 'Moderator Dashboard',
          path: '/moderator-assignment-dashboard',
          icon: 'Users',
          roles: ['moderator', 'manager', 'admin']
        },
        {
          label: 'Message Tracking',
          path: '/message-status-tracking',
          icon: 'MessageSquare',
          roles: ['moderator', 'manager', 'admin']
        }
      ]
    },
    {
      section: 'Analytics',
      items: [
        {
          label: 'Reports & Analytics',
          path: '/analytics-reporting-dashboard',
          icon: 'TrendingUp',
          roles: ['manager', 'admin']
        }
      ]
    },
    {
      section: 'Administration',
      items: [
        {
          label: 'Campaign Upload',
          path: '/campaign-upload-configuration',
          icon: 'Upload',
          roles: ['admin']
        },
        {
          label: 'Role Assignment',
          path: '/authentication-role-assignment',
          icon: 'Shield',
          roles: ['admin']
        }
      ]
    }
  ];

  // Filter navigation items based on user role
  const getFilteredNavigation = () => {
    return navigationItems?.map(section => ({
      ...section,
      items: section?.items?.filter(item => item?.roles?.includes(userRole))
    }))?.filter(section => section?.items?.length > 0);
  };

  const isActivePath = (path) => {
    return location?.pathname === path;
  };

  const handleNavigation = (path) => {
    window.location.href = path;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected':
        return 'text-success';
      case 'connecting':
        return 'text-warning';
      case 'disconnected':
        return 'text-error';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'connected':
        return 'CheckCircle';
      case 'connecting':
        return 'Clock';
      case 'disconnected':
        return 'XCircle';
      default:
        return 'Circle';
    }
  };

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveUsers(prev => prev + Math.floor(Math.random() * 3) - 1);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const filteredNavigation = getFilteredNavigation();

  return (
    <aside className={`fixed left-0 top-0 h-full bg-card border-r border-border z-100 transition-all duration-300 ease-in-out ${
      isCollapsed ? 'w-16' : 'w-60'
    }`}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-md">
                <Icon name="MessageCircle" size={20} color="white" />
              </div>
              <div>
                <h1 className="text-sm font-semibold text-foreground">
                  WhatsApp Bulk
                </h1>
                <p className="text-xs text-muted-foreground">Messenger</p>
              </div>
            </div>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="h-8 w-8"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <Icon name={isCollapsed ? 'ChevronRight' : 'ChevronLeft'} size={16} />
          </Button>
        </div>

        {/* Status Indicator */}
        <div className="p-4 border-b border-border">
          {!isCollapsed ? (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Icon 
                  name={getStatusIcon(connectionStatus)} 
                  size={16} 
                  className={getStatusColor(connectionStatus)}
                />
                <span className="text-sm font-medium text-foreground">
                  WhatsApp API
                </span>
                <span className={`text-xs ${getStatusColor(connectionStatus)}`}>
                  {connectionStatus}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Active Users: {activeUsers}</span>
                <span className="animate-pulse-slow">●</span>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <Icon 
                name={getStatusIcon(connectionStatus)} 
                size={20} 
                className={getStatusColor(connectionStatus)}
              />
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto scrollbar-thin p-2">
          <div className="space-y-6">
            {filteredNavigation?.map((section) => (
              <div key={section?.section}>
                {!isCollapsed && (
                  <h3 className="px-2 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {section?.section}
                  </h3>
                )}
                <div className="space-y-1">
                  {section?.items?.map((item) => (
                    <button
                      key={item?.path}
                      onClick={() => handleNavigation(item?.path)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left transition-all duration-200 group ${
                        isActivePath(item?.path)
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'text-foreground hover:bg-muted hover:text-foreground'
                      }`}
                      title={isCollapsed ? item?.label : undefined}
                    >
                      <Icon 
                        name={item?.icon} 
                        size={18} 
                        className={`flex-shrink-0 ${
                          isActivePath(item?.path) ? '' : 'group-hover:text-primary'
                        }`}
                      />
                      {!isCollapsed && (
                        <span className="text-sm font-medium truncate">
                          {item?.label}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </nav>

        {/* Session Management */}
        <div className="p-4 border-t border-border">
          {!isCollapsed ? (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                  <Icon name="User" size={16} color="white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {userRole?.charAt(0)?.toUpperCase() + userRole?.slice(1)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Session: {sessionDuration}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                iconName="LogOut"
                iconPosition="left"
                iconSize={14}
              >
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                <Icon name="User" size={16} color="white" />
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                title="Logout"
              >
                <Icon name="LogOut" size={16} />
              </Button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;