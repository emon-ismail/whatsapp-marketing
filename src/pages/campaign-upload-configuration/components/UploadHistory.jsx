import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const UploadHistory = ({ uploads = [], onSelectUpload }) => {
  const mockUploads = [
    {
      id: 1,
      fileName: "Q4_Campaign_Numbers.xlsx",
      recordCount: 27450,
      uploadDate: "2025-08-30 14:32:15",
      status: "completed",
      fileSize: "2.3 MB",
      validNumbers: 26890,
      duplicates: 560,
      errors: 0
    },
    {
      id: 2,
      fileName: "Regional_Contacts_Aug.csv",
      recordCount: 15200,
      uploadDate: "2025-08-29 09:15:42",
      status: "completed",
      fileSize: "1.8 MB",
      validNumbers: 14950,
      duplicates: 250,
      errors: 0
    },
    {
      id: 3,
      fileName: "New_Leads_Batch_3.xlsx",
      recordCount: 8750,
      uploadDate: "2025-08-28 16:45:30",
      status: "processing",
      fileSize: "1.2 MB",
      validNumbers: 0,
      duplicates: 0,
      errors: 0
    },
    {
      id: 4,
      fileName: "Customer_Database_July.csv",
      recordCount: 32100,
      uploadDate: "2025-08-27 11:20:18",
      status: "failed",
      fileSize: "3.1 MB",
      validNumbers: 0,
      duplicates: 0,
      errors: 1250
    }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return { icon: 'CheckCircle', color: 'text-success' };
      case 'processing':
        return { icon: 'Clock', color: 'text-warning' };
      case 'failed':
        return { icon: 'XCircle', color: 'text-error' };
      default:
        return { icon: 'Circle', color: 'text-muted-foreground' };
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case 'completed':
        return `${baseClasses} bg-success/10 text-success`;
      case 'processing':
        return `${baseClasses} bg-warning/10 text-warning`;
      case 'failed':
        return `${baseClasses} bg-error/10 text-error`;
      default:
        return `${baseClasses} bg-muted text-muted-foreground`;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date?.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-card rounded-lg border border-border">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Upload History</h3>
          <Button variant="ghost" size="sm" iconName="RefreshCw" iconSize={16}>
            Refresh
          </Button>
        </div>
      </div>
      <div className="max-h-96 overflow-y-auto scrollbar-thin">
        {mockUploads?.length === 0 ? (
          <div className="p-8 text-center">
            <Icon name="FileX" size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No upload history found</p>
          </div>
        ) : (
          <div className="space-y-1">
            {mockUploads?.map((upload) => {
              const statusConfig = getStatusIcon(upload?.status);
              
              return (
                <div
                  key={upload?.id}
                  className="p-4 hover:bg-muted/50 transition-colors duration-200 cursor-pointer border-b border-border last:border-b-0"
                  onClick={() => onSelectUpload(upload)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      <Icon 
                        name={statusConfig?.icon} 
                        size={16} 
                        className={statusConfig?.color}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {upload?.fileName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(upload?.uploadDate)}
                        </p>
                      </div>
                    </div>
                    <span className={getStatusBadge(upload?.status)}>
                      {upload?.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Icon name="Hash" size={12} />
                      <span>{upload?.recordCount?.toLocaleString()} records</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Icon name="HardDrive" size={12} />
                      <span>{upload?.fileSize}</span>
                    </div>
                    
                    {upload?.status === 'completed' && (
                      <>
                        <div className="flex items-center space-x-1 text-success">
                          <Icon name="CheckCircle" size={12} />
                          <span>{upload?.validNumbers?.toLocaleString()} valid</span>
                        </div>
                        <div className="flex items-center space-x-1 text-warning">
                          <Icon name="Copy" size={12} />
                          <span>{upload?.duplicates} duplicates</span>
                        </div>
                      </>
                    )}
                    
                    {upload?.status === 'failed' && (
                      <div className="flex items-center space-x-1 text-error col-span-2">
                        <Icon name="AlertTriangle" size={12} />
                        <span>{upload?.errors} errors found</span>
                      </div>
                    )}
                  </div>
                  {upload?.status === 'completed' && (
                    <div className="mt-2 flex space-x-2">
                      <Button variant="ghost" size="xs" iconName="Eye" iconSize={12}>
                        View
                      </Button>
                      <Button variant="ghost" size="xs" iconName="Download" iconSize={12}>
                        Export
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadHistory;