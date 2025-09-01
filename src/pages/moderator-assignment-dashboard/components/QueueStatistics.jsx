import React from 'react';
import Icon from '../../../components/AppIcon';

const QueueStatistics = ({ moderatorData, onFilterChange, activeFilter }) => {
  const stats = [
    {
      label: 'Total Assigned',
      value: moderatorData?.totalAssigned,
      icon: 'Users',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      label: 'Completed',
      value: moderatorData?.completed,
      icon: 'CheckCircle',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      label: 'Pending',
      value: moderatorData?.pending,
      icon: 'Clock',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      label: 'Failed',
      value: moderatorData?.failed,
      icon: 'XCircle',
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    }
  ];

  const completionPercentage = Math.round((moderatorData?.completed / moderatorData?.totalAssigned) * 100);

  const filterPresets = [
    { key: 'all', label: 'All Numbers', count: moderatorData?.totalAssigned },
    { key: 'pending', label: 'Pending', count: moderatorData?.pending },
    { key: 'sent', label: 'Sent', count: moderatorData?.sent },
    { key: 'failed', label: 'Failed', count: moderatorData?.failed },
    { key: 'completed', label: 'Completed', count: moderatorData?.completed }
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">My Queue</h2>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-muted-foreground">Live</span>
        </div>
      </div>
      {/* Progress Circle */}
      <div className="flex items-center justify-center">
        <div className="relative w-24 h-24">
          <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-muted"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={`${completionPercentage * 2.51} 251`}
              className="text-primary"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-foreground">{completionPercentage}%</span>
          </div>
        </div>
      </div>
      {/* Statistics Cards */}
      <div className="space-y-3">
        {stats?.map((stat) => (
          <div key={stat?.label} className={`${stat?.bgColor} rounded-lg p-3 border border-border`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-md ${stat?.bgColor}`}>
                  <Icon name={stat?.icon} size={16} className={stat?.color} />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{stat?.label}</p>
                  <p className={`text-lg font-bold ${stat?.color}`}>{stat?.value?.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Quick Filters */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Quick Filters</h3>
        <div className="space-y-2">
          {filterPresets?.map((filter) => (
            <button
              key={filter?.key}
              onClick={() => onFilterChange(filter?.key)}
              className={`w-full flex items-center justify-between p-2 rounded-md text-left transition-colors duration-200 ${
                activeFilter === filter?.key
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted text-foreground'
              }`}
            >
              <span className="text-sm font-medium">{filter?.label}</span>
              <span className={`text-xs px-2 py-1 rounded-full ${
                activeFilter === filter?.key
                  ? 'bg-primary-foreground text-primary'
                  : 'bg-muted text-muted-foreground'
              }`}>
                {filter?.count?.toLocaleString()}
              </span>
            </button>
          ))}
        </div>
      </div>
      {/* Daily Target */}
      <div className="bg-muted rounded-lg p-3 border border-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">Daily Target</span>
          <Icon name="Target" size={16} className="text-primary" />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium text-foreground">{moderatorData?.completed}/2250</span>
          </div>
          <div className="w-full bg-background rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((moderatorData?.completed / 2250) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QueueStatistics;