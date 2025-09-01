import React from 'react';
import Icon from '../../../components/AppIcon';

const StatusSummaryCards = ({ statusCounts, totalMessages, refreshRate }) => {
  const cards = [
    {
      title: 'Total Messages',
      value: totalMessages?.toLocaleString(),
      icon: 'MessageSquare',
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      change: '+2.5%',
      changeType: 'increase'
    },
    {
      title: 'Successfully Delivered',
      value: statusCounts?.delivered?.toLocaleString(),
      icon: 'CheckCircle',
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50',
      percentage: ((statusCounts?.delivered / totalMessages) * 100)?.toFixed(1),
      change: '+5.2%',
      changeType: 'increase'
    },
    {
      title: 'Failed Messages',
      value: statusCounts?.failed?.toLocaleString(),
      icon: 'XCircle',
      color: 'bg-red-500',
      textColor: 'text-red-600',
      bgColor: 'bg-red-50',
      percentage: ((statusCounts?.failed / totalMessages) * 100)?.toFixed(1),
      change: '-1.8%',
      changeType: 'decrease'
    },
    {
      title: 'Pending Messages',
      value: statusCounts?.pending?.toLocaleString(),
      icon: 'Clock',
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      percentage: ((statusCounts?.pending / totalMessages) * 100)?.toFixed(1),
      change: '-12.3%',
      changeType: 'decrease'
    },
    {
      title: 'Read Messages',
      value: statusCounts?.read?.toLocaleString(),
      icon: 'CheckCheck',
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
      percentage: ((statusCounts?.read / totalMessages) * 100)?.toFixed(1),
      change: '+8.7%',
      changeType: 'increase'
    },
    {
      title: 'Retry Queue',
      value: statusCounts?.retry?.toLocaleString(),
      icon: 'RefreshCw',
      color: 'bg-orange-500',
      textColor: 'text-orange-600',
      bgColor: 'bg-orange-50',
      percentage: ((statusCounts?.retry / totalMessages) * 100)?.toFixed(1),
      change: '+3.1%',
      changeType: 'increase'
    }
  ];

  const getChangeIcon = (changeType) => {
    return changeType === 'increase' ? 'TrendingUp' : 'TrendingDown';
  };

  const getChangeColor = (changeType) => {
    return changeType === 'increase' ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
      {cards?.map((card, index) => (
        <div key={index} className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className={`p-2 rounded-lg ${card?.bgColor}`}>
              <Icon name={card?.icon} size={20} className={card?.textColor} />
            </div>
            <div className="flex items-center space-x-1">
              <Icon 
                name={getChangeIcon(card?.changeType)} 
                size={12} 
                className={getChangeColor(card?.changeType)}
              />
              <span className={`text-xs font-medium ${getChangeColor(card?.changeType)}`}>
                {card?.change}
              </span>
            </div>
          </div>
          
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-muted-foreground">
              {card?.title}
            </h3>
            <div className="flex items-baseline space-x-2">
              <p className="text-2xl font-bold text-foreground">
                {card?.value}
              </p>
              {card?.percentage && (
                <span className="text-sm text-muted-foreground">
                  ({card?.percentage}%)
                </span>
              )}
            </div>
          </div>

          {/* Progress bar for percentage-based cards */}
          {card?.percentage && (
            <div className="mt-3">
              <div className="w-full bg-muted rounded-full h-1.5">
                <div 
                  className={`h-1.5 rounded-full ${card?.color}`}
                  style={{ width: `${Math.min(parseFloat(card?.percentage), 100)}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default StatusSummaryCards;