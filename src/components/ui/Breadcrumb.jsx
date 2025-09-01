import React from 'react';
import { useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const Breadcrumb = ({ customBreadcrumbs = null }) => {
  const location = useLocation();

  // Route mapping for breadcrumb generation
  const routeMap = {
    '/real-time-progress-monitoring': {
      label: 'Real-time Progress Monitoring',
      parent: null,
      icon: 'BarChart3'
    },
    '/moderator-assignment-dashboard': {
      label: 'Moderator Assignment Dashboard',
      parent: null,
      icon: 'Users'
    },
    '/message-status-tracking': {
      label: 'Message Status Tracking',
      parent: null,
      icon: 'MessageSquare'
    },
    '/analytics-reporting-dashboard': {
      label: 'Analytics & Reporting Dashboard',
      parent: null,
      icon: 'TrendingUp'
    },
    '/campaign-upload-configuration': {
      label: 'Campaign Upload & Configuration',
      parent: null,
      icon: 'Upload'
    },
    '/authentication-role-assignment': {
      label: 'Authentication & Role Assignment',
      parent: null,
      icon: 'Shield'
    }
  };

  const generateBreadcrumbs = () => {
    if (customBreadcrumbs) {
      return customBreadcrumbs;
    }

    const currentRoute = routeMap?.[location?.pathname];
    if (!currentRoute) {
      return [{ label: 'Dashboard', path: '/real-time-progress-monitoring', icon: 'Home' }];
    }

    const breadcrumbs = [];
    
    // Add home/dashboard as root
    breadcrumbs?.push({
      label: 'Dashboard',
      path: '/real-time-progress-monitoring',
      icon: 'Home'
    });

    // Add current page if it's not the dashboard
    if (location?.pathname !== '/real-time-progress-monitoring') {
      breadcrumbs?.push({
        label: currentRoute?.label,
        path: location?.pathname,
        icon: currentRoute?.icon,
        current: true
      });
    } else {
      breadcrumbs[0].current = true;
    }

    return breadcrumbs;
  };

  const handleNavigation = (path) => {
    if (path && path !== location?.pathname) {
      window.location.href = path;
    }
  };

  const breadcrumbs = generateBreadcrumbs();

  if (breadcrumbs?.length <= 1 && breadcrumbs?.[0]?.current) {
    return null; // Don't show breadcrumbs on home page only
  }

  return (
    <nav className="flex items-center space-x-1 text-sm" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-1">
        {breadcrumbs?.map((crumb, index) => (
          <li key={crumb?.path || index} className="flex items-center">
            {index > 0 && (
              <Icon 
                name="ChevronRight" 
                size={16} 
                className="mx-2 text-muted-foreground" 
              />
            )}
            
            {crumb?.current ? (
              <span className="flex items-center space-x-2 text-foreground font-medium">
                {crumb?.icon && <Icon name={crumb?.icon} size={16} />}
                <span className="truncate max-w-xs sm:max-w-sm md:max-w-md">
                  {crumb?.label}
                </span>
              </span>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleNavigation(crumb?.path)}
                className="flex items-center space-x-2 px-2 py-1 h-auto text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                {crumb?.icon && <Icon name={crumb?.icon} size={16} />}
                <span className="truncate max-w-xs sm:max-w-sm">
                  {crumb?.label}
                </span>
              </Button>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;