import React, { useState, useEffect } from 'react';
import CampaignOverviewHeader from './components/CampaignOverviewHeader';
import CampaignCard from './components/CampaignCard';
import ModeratorPerformanceMatrix from './components/ModeratorPerformanceMatrix';
import LiveActivityFeed from './components/LiveActivityFeed';
import SystemHealthPanel from './components/SystemHealthPanel';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Icon from '../../components/AppIcon';

const RealTimeProgressMonitoring = () => {
  const [refreshInterval, setRefreshInterval] = useState(5);
  const [selectedTimeRange, setSelectedTimeRange] = useState('today');
  const [selectedCampaignFilter, setSelectedCampaignFilter] = useState('all');
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Mock data for overview
  const overviewData = {
    activeCampaigns: 8,
    totalMessages: 27000,
    messagesSent: 18450,
    activeModerators: 9,
    successRate: 94.2,
    avgVelocity: 125,
    overallProgress: 68.3,
    currentVelocity: 142,
    apiResponseTime: 245,
    errorRate: 2.1,
    estimatedCompletion: "2h 15m",
    runningTime: "4h 32m",
    nextMilestone: "20K messages",
    systemHealth: "excellent"
  };

  // Mock campaigns data
  const campaigns = [
    {
      id: "CAMP-2025-001",
      name: "New Year Promotion Campaign",
      status: "active",
      progress: 75,
      totalNumbers: 5000,
      sentMessages: 3750,
      pendingMessages: 1000,
      failedMessages: 250,
      velocity: 85,
      estimatedTime: 45
    },
    {
      id: "CAMP-2025-002", 
      name: "Product Launch Announcement",
      status: "active",
      progress: 92,
      totalNumbers: 3500,
      sentMessages: 3220,
      pendingMessages: 180,
      failedMessages: 100,
      velocity: 120,
      estimatedTime: 12
    },
    {
      id: "CAMP-2025-003",
      name: "Customer Feedback Survey",
      status: "paused",
      progress: 45,
      totalNumbers: 8000,
      sentMessages: 3600,
      pendingMessages: 4200,
      failedMessages: 200,
      velocity: 0,
      estimatedTime: 180
    },
    {
      id: "CAMP-2025-004",
      name: "Holiday Special Offers",
      status: "completed",
      progress: 100,
      totalNumbers: 2500,
      sentMessages: 2450,
      pendingMessages: 0,
      failedMessages: 50,
      velocity: 0,
      estimatedTime: 0
    },
    {
      id: "CAMP-2025-005",
      name: "Service Update Notification",
      status: "active",
      progress: 28,
      totalNumbers: 6000,
      sentMessages: 1680,
      pendingMessages: 4200,
      failedMessages: 120,
      velocity: 95,
      estimatedTime: 220
    },
    {
      id: "CAMP-2025-006",
      name: "Welcome Message Series",
      status: "active",
      progress: 88,
      totalNumbers: 2000,
      sentMessages: 1760,
      pendingMessages: 200,
      failedMessages: 40,
      velocity: 110,
      estimatedTime: 8
    }
  ];

  // Mock moderators data
  const moderators = [
    {
      id: "MOD-001",
      name: "Sarah Johnson",
      status: "active",
      assignedNumbers: 2800,
      completedMessages: 2520,
      successRate: 96.2,
      efficiency: 92,
      currentActivity: "Sending batch #47",
      messagesPerMinute: 15
    },
    {
      id: "MOD-002", 
      name: "Michael Chen",
      status: "active",
      assignedNumbers: 2500,
      completedMessages: 2350,
      successRate: 94.8,
      efficiency: 89,
      currentActivity: "Processing queue",
      messagesPerMinute: 12
    },
    {
      id: "MOD-003",
      name: "Emily Rodriguez",
      status: "idle",
      assignedNumbers: 2200,
      completedMessages: 2100,
      successRate: 97.1,
      efficiency: 95,
      currentActivity: "Queue completed",
      messagesPerMinute: 0
    },
    {
      id: "MOD-004",
      name: "David Thompson",
      status: "active",
      assignedNumbers: 2600,
      completedMessages: 2340,
      successRate: 93.5,
      efficiency: 87,
      currentActivity: "Handling failed messages",
      messagesPerMinute: 8
    },
    {
      id: "MOD-005",
      name: "Lisa Wang",
      status: "active",
      assignedNumbers: 2400,
      completedMessages: 2280,
      successRate: 95.8,
      efficiency: 91,
      currentActivity: "Sending batch #32",
      messagesPerMinute: 14
    },
    {
      id: "MOD-006",
      name: "James Wilson",
      status: "offline",
      assignedNumbers: 2300,
      completedMessages: 2070,
      successRate: 92.3,
      efficiency: 85,
      currentActivity: "Offline",
      messagesPerMinute: 0
    }
  ];

  // Mock activities data
  const activities = [
    {
      id: 1,
      type: "message_sent",
      title: "Batch completed successfully",
      description: "Sarah Johnson completed batch #47 with 250 messages sent",
      timestamp: new Date(Date.now() - 30000),
      priority: "low",
      status: "success",
      details: {
        moderator: "Sarah Johnson",
        campaign: "New Year Promotion",
        count: "250 messages"
      }
    },
    {
      id: 2,
      type: "milestone_reached",
      title: "Campaign milestone achieved",
      description: "Product Launch Announcement reached 90% completion",
      timestamp: new Date(Date.now() - 120000),
      priority: "medium",
      status: "success",
      details: {
        campaign: "Product Launch Announcement",
        count: "90% complete"
      }
    },
    {
      id: 3,
      type: "system_alert",
      title: "API rate limit warning",
      description: "WhatsApp API approaching rate limit threshold",
      timestamp: new Date(Date.now() - 180000),
      priority: "high",
      status: "warning",
      details: {
        count: "85% of limit used"
      }
    },
    {
      id: 4,
      type: "moderator_assigned",
      title: "New moderator assignment",
      description: "Lisa Wang assigned to Service Update Notification campaign",
      timestamp: new Date(Date.now() - 300000),
      priority: "low",
      status: "success",
      details: {
        moderator: "Lisa Wang",
        campaign: "Service Update Notification"
      }
    },
    {
      id: 5,
      type: "message_failed",
      title: "Message delivery failed",
      description: "Failed to deliver 15 messages due to invalid numbers",
      timestamp: new Date(Date.now() - 450000),
      priority: "medium",
      status: "error",
      details: {
        moderator: "David Thompson",
        count: "15 messages"
      }
    }
  ];

  // Mock system health data
  const systemHealth = {
    overall: {
      status: "healthy"
    },
    services: [
      {
        name: "WhatsApp API",
        icon: "MessageSquare",
        status: "healthy",
        responseTime: 245,
        uptime: 99.9,
        lastCheck: "30s ago"
      },
      {
        name: "Database",
        icon: "Database",
        status: "healthy", 
        responseTime: 12,
        uptime: 100,
        lastCheck: "15s ago"
      },
      {
        name: "File Processing",
        icon: "FileText",
        status: "warning",
        responseTime: 890,
        uptime: 98.5,
        lastCheck: "1m ago"
      },
      {
        name: "Authentication",
        icon: "Shield",
        status: "healthy",
        responseTime: 156,
        uptime: 99.8,
        lastCheck: "45s ago"
      }
    ],
    metrics: {
      cpu: 45,
      memory: 62,
      disk: 78,
      activeConnections: 127
    },
    uptime: 2592000,
    version: "v2.1.4",
    region: "US-East"
  };

  // Filter options
  const timeRangeOptions = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' }
  ];

  const campaignFilterOptions = [
    { value: 'all', label: 'All Campaigns' },
    { value: 'active', label: 'Active Only' },
    { value: 'paused', label: 'Paused Only' },
    { value: 'completed', label: 'Completed Only' }
  ];

  const refreshIntervalOptions = [
    { value: 5, label: '5 seconds' },
    { value: 10, label: '10 seconds' },
    { value: 30, label: '30 seconds' },
    { value: 60, label: '1 minute' }
  ];

  // Filter campaigns based on selected filter
  const filteredCampaigns = campaigns?.filter(campaign => {
    if (selectedCampaignFilter === 'all') return true;
    return campaign?.status === selectedCampaignFilter;
  });

  // Auto-refresh functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  const handleRefresh = () => {
    setLastUpdated(new Date());
  };

  const handleExport = () => {
    // Mock export functionality
    console.log('Exporting dashboard data...');
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Campaign Overview Header */}
        <CampaignOverviewHeader 
          overviewData={overviewData}
          onRefresh={handleRefresh}
          onExport={handleExport}
        />

        {/* Controls Bar */}
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <Select
                label="Time Range"
                options={timeRangeOptions}
                value={selectedTimeRange}
                onChange={setSelectedTimeRange}
                className="w-40"
              />
              <Select
                label="Campaign Filter"
                options={campaignFilterOptions}
                value={selectedCampaignFilter}
                onChange={setSelectedCampaignFilter}
                className="w-40"
              />
              <Select
                label="Refresh Interval"
                options={refreshIntervalOptions}
                value={refreshInterval}
                onChange={setRefreshInterval}
                className="w-40"
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Icon name="Clock" size={16} />
                <span>Last updated: {lastUpdated?.toLocaleTimeString()}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                iconName="RefreshCw"
                iconPosition="left"
                iconSize={16}
              >
                Refresh Now
              </Button>
            </div>
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column - Campaigns */}
          <div className="xl:col-span-2 space-y-6">
            {/* Active Campaigns Grid */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">Active Campaigns</h2>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                  <span className="text-sm text-muted-foreground">
                    {filteredCampaigns?.length} campaigns
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredCampaigns?.map((campaign) => (
                  <CampaignCard key={campaign?.id} campaign={campaign} />
                ))}
              </div>
            </div>

            {/* Moderator Performance Matrix */}
            <ModeratorPerformanceMatrix moderators={moderators} />
          </div>

          {/* Right Column - Activity & System Health */}
          <div className="space-y-6">
            {/* Live Activity Feed */}
            <LiveActivityFeed activities={activities} />
            
            {/* System Health Panel */}
            <SystemHealthPanel systemHealth={systemHealth} />
          </div>
        </div>

        {/* Quick Actions Bar */}
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-foreground">Quick Actions</h3>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                iconName="Pause"
                iconPosition="left"
                iconSize={16}
              >
                Pause All
              </Button>
              <Button
                variant="outline"
                size="sm"
                iconName="Play"
                iconPosition="left"
                iconSize={16}
              >
                Resume All
              </Button>
              <Button
                variant="default"
                size="sm"
                iconName="Settings"
                iconPosition="left"
                iconSize={16}
              >
                Configure
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeProgressMonitoring;