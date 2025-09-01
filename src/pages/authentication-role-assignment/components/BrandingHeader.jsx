import React from 'react';
import Icon from '../../../components/AppIcon';

const BrandingHeader = () => {
  const currentYear = new Date()?.getFullYear();

  return (
    <div className="text-center space-y-6 mb-8">
      {/* Logo and Brand */}
      <div className="space-y-4">
        <div className="flex items-center justify-center">
          <div className="relative">
            {/* Main Logo Container */}
            <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-2xl shadow-lg">
              <Icon name="MessageCircle" size={36} color="white" />
            </div>
            {/* WhatsApp Indicator */}
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-success rounded-full flex items-center justify-center border-4 border-background">
              <Icon name="MessageSquare" size={14} color="white" />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            WhatsApp Bulk Messenger
          </h1>
          <p className="text-lg text-muted-foreground">
            Enterprise Messaging Management System
          </p>
        </div>
      </div>

      {/* System Stats */}
      <div className="flex items-center justify-center space-x-8 py-4">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 text-success">
            <Icon name="Users" size={16} />
            <span className="text-sm font-semibold">12</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Moderators</p>
        </div>
        
        <div className="w-px h-8 bg-border"></div>
        
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 text-primary">
            <Icon name="MessageCircle" size={16} />
            <span className="text-sm font-semibold">27K+</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Messages</p>
        </div>
        
        <div className="w-px h-8 bg-border"></div>
        
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 text-accent">
            <Icon name="BarChart3" size={16} />
            <span className="text-sm font-semibold">98%</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Success Rate</p>
        </div>
      </div>

      {/* Welcome Message */}
      <div className="max-w-md mx-auto">
        <p className="text-muted-foreground text-sm leading-relaxed">
          Secure access to your messaging campaigns. Please authenticate with your assigned credentials to continue.
        </p>
      </div>

      {/* Trust Indicators */}
      <div className="flex items-center justify-center space-x-6 pt-2">
        <div className="flex items-center space-x-1">
          <Icon name="Shield" size={14} className="text-success" />
          <span className="text-xs text-muted-foreground">SSL Secured</span>
        </div>
        <div className="flex items-center space-x-1">
          <Icon name="Lock" size={14} className="text-success" />
          <span className="text-xs text-muted-foreground">Encrypted</span>
        </div>
        <div className="flex items-center space-x-1">
          <Icon name="Eye" size={14} className="text-success" />
          <span className="text-xs text-muted-foreground">Audited</span>
        </div>
      </div>

      {/* Copyright */}
      <div className="pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground">
          © {currentYear} WhatsApp Bulk Messenger. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default BrandingHeader;