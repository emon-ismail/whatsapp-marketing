import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const Header = ({ onMenuToggle, isMenuOpen = false }) => {
  const location = useLocation();
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  const primaryNavItems = [
    {
      label: 'Dashboard',
      path: '/real-time-progress-monitoring',
      icon: 'BarChart3'
    },
    {
      label: 'Campaign Management',
      path: '/moderator-assignment-dashboard',
      icon: 'Users'
    },
    {
      label: 'Message Tracking',
      path: '/message-status-tracking',
      icon: 'MessageSquare'
    },
    {
      label: 'Analytics',
      path: '/analytics-reporting-dashboard',
      icon: 'TrendingUp'
    }
  ];

  const secondaryNavItems = [
    {
      label: 'Campaign Upload',
      path: '/campaign-upload-configuration',
      icon: 'Upload'
    },
    {
      label: 'Role Assignment',
      path: '/authentication-role-assignment',
      icon: 'Shield'
    }
  ];

  const isActivePath = (path) => {
    return location?.pathname === path;
  };

  const handleNavigation = (path) => {
    window.location.href = path;
  };

  const toggleMoreMenu = () => {
    setIsMoreMenuOpen(!isMoreMenuOpen);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-100 bg-card border-b border-border">
      <div className="flex items-center justify-between h-16 px-4">
        {/* Left Section - Logo and Mobile Menu */}
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuToggle}
            className="lg:hidden"
            aria-label="Toggle navigation menu"
          >
            <Icon name={isMenuOpen ? 'X' : 'Menu'} size={20} />
          </Button>

          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-md">
              <Icon name="MessageCircle" size={20} color="white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold text-foreground">
                WhatsApp Bulk Messenger
              </h1>
            </div>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-1">
          {primaryNavItems?.map((item) => (
            <Button
              key={item?.path}
              variant={isActivePath(item?.path) ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleNavigation(item?.path)}
              className="flex items-center space-x-2 px-3 py-2"
            >
              <Icon name={item?.icon} size={16} />
              <span className="text-sm font-medium">{item?.label}</span>
            </Button>
          ))}

          {/* More Menu */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMoreMenu}
              className="flex items-center space-x-2 px-3 py-2"
              aria-expanded={isMoreMenuOpen}
              aria-haspopup="true"
            >
              <Icon name="MoreHorizontal" size={16} />
              <span className="text-sm font-medium">More</span>
            </Button>

            {/* Dropdown Menu */}
            {isMoreMenuOpen && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-popover border border-border rounded-md shadow-elevation-2 z-200">
                <div className="py-1">
                  {secondaryNavItems?.map((item) => (
                    <button
                      key={item?.path}
                      onClick={() => {
                        handleNavigation(item?.path);
                        setIsMoreMenuOpen(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-3 py-2 text-sm text-left hover:bg-muted transition-colors duration-200 ${
                        isActivePath(item?.path) ? 'bg-muted text-primary font-medium' : 'text-foreground'
                      }`}
                    >
                      <Icon name={item?.icon} size={16} />
                      <span>{item?.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Right Section - User Actions */}
        <div className="flex items-center space-x-2">
          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            aria-label="Notifications"
          >
            <Icon name="Bell" size={20} />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-error rounded-full"></span>
          </Button>

          {/* User Menu */}
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            aria-label="User menu"
          >
            <Icon name="User" size={20} />
          </Button>
        </div>
      </div>
      {/* Mobile Navigation Overlay */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-16 bg-background z-200">
          <nav className="p-4 space-y-2">
            {[...primaryNavItems, ...secondaryNavItems]?.map((item) => (
              <button
                key={item?.path}
                onClick={() => {
                  handleNavigation(item?.path);
                  onMenuToggle();
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-md text-left transition-colors duration-200 ${
                  isActivePath(item?.path)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                <Icon name={item?.icon} size={20} />
                <span className="font-medium">{item?.label}</span>
              </button>
            ))}
          </nav>
        </div>
      )}
      {/* Click outside to close more menu */}
      {isMoreMenuOpen && (
        <div
          className="fixed inset-0 z-100"
          onClick={() => setIsMoreMenuOpen(false)}
        />
      )}
    </header>
  );
};

export default Header;