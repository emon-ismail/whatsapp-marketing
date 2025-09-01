import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import MetricsCard from './components/MetricsCard';
import PerformanceChart from './components/PerformanceChart';
import ModeratorRankingTable from './components/ModeratorRankingTable';
import CampaignAnalytics from './components/CampaignAnalytics';
import ReportGenerator from './components/ReportGenerator';
import SystemHealthMonitor from './components/SystemHealthMonitor';

const AnalyticsReportingDashboard = () => {
  const navigate = useNavigate();
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');
  const [selectedView, setSelectedView] = useState('overview');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Mock data for metrics cards
  const metricsData = [
    {
      title: "Total Messages Sent",
      value: "2,847,392",
      change: "+12.5%",
      changeType: "positive",
      icon: "MessageSquare",
      description: "Messages delivered successfully",
      trend: [85, 92, 78, 95, 88, 96, 89, 94]
    },
    {
      title: "Success Rate",
      value: "94.2%",
      change: "+2.1%",
      changeType: "positive",
      icon: "CheckCircle",
      description: "Overall delivery success rate",
      trend: [88, 90, 92, 89, 94, 91, 95, 94]
    },
    {
      title: "Active Moderators",
      value: "12",
      change: "0",
      changeType: "neutral",
      icon: "Users",
      description: "Currently active moderators",
      trend: [12, 11, 12, 12, 10, 12, 12, 12]
    },
    {
      title: "Avg Response Time",
      value: "2.4s",
      change: "-0.3s",
      changeType: "positive",
      icon: "Clock",
      description: "Average message processing time",
      trend: [2.8, 2.6, 2.9, 2.5, 2.3, 2.4, 2.2, 2.4]
    },
    {
      title: "Cost Per Message",
      value: "$0.0045",
      change: "-$0.0002",
      changeType: "positive",
      icon: "DollarSign",
      description: "Average cost per delivered message",
      trend: [0.0048, 0.0047, 0.0049, 0.0046, 0.0044, 0.0045, 0.0043, 0.0045]
    },
    {
      title: "Failed Messages",
      value: "167,234",
      change: "-8.3%",
      changeType: "positive",
      icon: "XCircle",
      description: "Messages that failed to deliver",
      trend: [180, 175, 185, 170, 165, 167, 160, 167]
    }
  ];

  // Mock data for performance charts
  const performanceData = [
    { name: 'Jan', value: 2400 },
    { name: 'Feb', value: 2210 },
    { name: 'Mar', value: 2290 },
    { name: 'Apr', value: 2000 },
    { name: 'May', value: 2181 },
    { name: 'Jun', value: 2500 },
    { name: 'Jul', value: 2100 },
    { name: 'Aug', value: 2847 }
  ];

  const successRateData = [
    { name: 'Week 1', value: 92 },
    { name: 'Week 2', value: 89 },
    { name: 'Week 3', value: 95 },
    { name: 'Week 4', value: 94 }
  ];

  const messageStatusData = [
    { name: 'Delivered', value: 2680158 },
    { name: 'Failed', value: 167234 },
    { name: 'Pending', value: 45892 },
    { name: 'Queued', value: 23108 }
  ];

  // Mock data for moderator ranking
  const moderatorData = [
    {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah.j@company.com",
      messagesCompleted: 245678,
      messagesAssigned: 250000,
      successRate: 98.3,
      avgResponseTime: "1.8s",
      performance: 97,
      status: "active"
    },
    {
      id: 2,
      name: "Michael Chen",
      email: "michael.c@company.com",
      messagesCompleted: 238945,
      messagesAssigned: 250000,
      successRate: 95.6,
      avgResponseTime: "2.1s",
      performance: 94,
      status: "active"
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      email: "emily.r@company.com",
      messagesCompleted: 232156,
      messagesAssigned: 245000,
      successRate: 94.7,
      avgResponseTime: "2.3s",
      performance: 92,
      status: "active"
    },
    {
      id: 4,
      name: "David Kim",
      email: "david.k@company.com",
      messagesCompleted: 228734,
      messagesAssigned: 240000,
      successRate: 95.3,
      avgResponseTime: "2.0s",
      performance: 93,
      status: "idle"
    },
    {
      id: 5,
      name: "Lisa Thompson",
      email: "lisa.t@company.com",
      messagesCompleted: 225891,
      messagesAssigned: 235000,
      successRate: 96.1,
      avgResponseTime: "1.9s",
      performance: 95,
      status: "active"
    }
  ];

  // Mock data for campaigns
  const campaignData = [
    {
      id: 1,
      name: "Summer Promotion 2025",
      description: "Promotional campaign for summer products and services",
      status: "completed",
      totalNumbers: 500000,
      completed: 487500,
      failed: 12500,
      startDate: "2025-08-15",
      moderatorsAssigned: 8,
      avgResponseTime: "2.1s"
    },
    {
      id: 2,
      name: "Customer Survey Q3",
      description: "Quarterly customer satisfaction survey campaign",
      status: "active",
      totalNumbers: 275000,
      completed: 198750,
      failed: 8250,
      startDate: "2025-08-28",
      moderatorsAssigned: 6,
      avgResponseTime: "1.8s"
    },
    {
      id: 3,
      name: "Product Launch Announcement",
      description: "New product launch notification to existing customers",
      status: "paused",
      totalNumbers: 150000,
      completed: 89000,
      failed: 3500,
      startDate: "2025-08-20",
      moderatorsAssigned: 4,
      avgResponseTime: "2.3s"
    }
  ];

  const timeframeOptions = [
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
    { value: '1y', label: 'Last Year' }
  ];

  const viewOptions = [
    { value: 'overview', label: 'Overview Dashboard' },
    { value: 'performance', label: 'Performance Analytics' },
    { value: 'campaigns', label: 'Campaign Analysis' },
    { value: 'moderators', label: 'Moderator Rankings' },
    { value: 'reports', label: 'Report Generator' },
    { value: 'system', label: 'System Health' }
  ];

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setRefreshing(false);
  };

  const handleModeratorDetails = (moderator) => {
    console.log('Viewing details for:', moderator?.name);
    // Navigate to moderator details or show modal
  };

  const handleCampaignSelect = (campaign) => {
    console.log('Selected campaign:', campaign?.name);
    // Navigate to campaign details or show modal
  };

  const handleGenerateReport = async (reportConfig) => {
    setIsGeneratingReport(true);
    console.log('Generating report with config:', reportConfig);
    
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setIsGeneratingReport(false);
    alert(`Report "${reportConfig?.name}" has been generated successfully!`);
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  const renderContent = () => {
    switch (selectedView) {
      case 'performance':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PerformanceChart
                title="Message Volume Trend"
                type="line"
                data={performanceData}
                height={300}
              />
              <PerformanceChart
                title="Success Rate Over Time"
                type="bar"
                data={successRateData}
                height={300}
              />
            </div>
            <PerformanceChart
              title="Message Status Distribution"
              type="pie"
              data={messageStatusData}
              height={400}
            />
          </div>
        );

      case 'campaigns':
        return (
          <CampaignAnalytics
            campaigns={campaignData}
            onCampaignSelect={handleCampaignSelect}
          />
        );

      case 'moderators':
        return (
          <ModeratorRankingTable
            data={moderatorData}
            onViewDetails={handleModeratorDetails}
          />
        );

      case 'reports':
        return (
          <ReportGenerator
            onGenerateReport={handleGenerateReport}
            isGenerating={isGeneratingReport}
          />
        );

      case 'system':
        return <SystemHealthMonitor />;

      default:
        return (
          <div className="space-y-6">
            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {metricsData?.map((metric, index) => (
                <MetricsCard key={index} {...metric} />
              ))}
            </div>
            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PerformanceChart
                title="Message Volume Trend"
                type="line"
                data={performanceData}
                height={300}
              />
              <PerformanceChart
                title="Success Rate Distribution"
                type="pie"
                data={messageStatusData}
                height={300}
              />
            </div>
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button
                variant="outline"
                className="h-20 flex-col space-y-2"
                onClick={() => handleNavigation('/real-time-progress-monitoring')}
              >
                <Icon name="BarChart3" size={24} />
                <span>Live Monitoring</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex-col space-y-2"
                onClick={() => handleNavigation('/moderator-assignment-dashboard')}
              >
                <Icon name="Users" size={24} />
                <span>Moderator Dashboard</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex-col space-y-2"
                onClick={() => handleNavigation('/message-status-tracking')}
              >
                <Icon name="MessageSquare" size={24} />
                <span>Message Tracking</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex-col space-y-2"
                onClick={() => setSelectedView('reports')}
              >
                <Icon name="FileText" size={24} />
                <span>Generate Report</span>
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Analytics & Reporting Dashboard
            </h1>
            <p className="text-muted-foreground">
              Comprehensive performance analysis and insights for your WhatsApp bulk messaging campaigns
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <Select
              options={timeframeOptions}
              value={selectedTimeframe}
              onChange={setSelectedTimeframe}
              className="w-full sm:w-40"
            />
            <Select
              options={viewOptions}
              value={selectedView}
              onChange={setSelectedView}
              className="w-full sm:w-48"
            />
            <Button
              variant="outline"
              onClick={handleRefresh}
              loading={refreshing}
              iconName="RefreshCw"
              iconPosition="left"
              className="w-full sm:w-auto"
            >
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </div>

        {/* Breadcrumb Navigation */}
        <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
          <button 
            onClick={() => handleNavigation('/real-time-progress-monitoring')}
            className="hover:text-foreground transition-colors duration-200"
          >
            Dashboard
          </button>
          <Icon name="ChevronRight" size={16} />
          <span className="text-foreground font-medium">Analytics & Reporting</span>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {renderContent()}
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground">
            <div className="mb-4 md:mb-0">
              <p>Last updated: {new Date()?.toLocaleString()}</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="hover:text-foreground transition-colors duration-200">
                Export Data
              </button>
              <button className="hover:text-foreground transition-colors duration-200">
                Schedule Reports
              </button>
              <button className="hover:text-foreground transition-colors duration-200">
                API Documentation
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsReportingDashboard;