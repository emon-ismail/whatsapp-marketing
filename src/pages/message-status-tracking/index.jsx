import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Breadcrumb from '../../components/ui/Breadcrumb';
import StatusSummaryCards from './components/StatusSummaryCards';
import StatusFilterBar from './components/StatusFilterBar';
import MessageStatusTable from './components/MessageStatusTable';
import MessageDetailsModal from './components/MessageDetailsModal';
import ConnectionStatusPanel from './components/ConnectionStatusPanel';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { useMessages, useMessageStats, useModerators, useSupabaseMutation } from '../../hooks/useSupabaseQuery';
import { messageService, subscriptionService } from '../../services/supabaseService';

const MessageStatusTracking = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [sortConfig, setSortConfig] = useState({ key: 'timestamp', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Filters state
  const [filters, setFilters] = useState({
    status: 'all',
    moderator: 'all',
    errorType: 'all',
    dateFrom: '',
    dateTo: '',
    search: ''
  });

  // Fetch data using custom hooks
  const { 
    messages, 
    loading: messagesLoading, 
    error: messagesError, 
    totalPages, 
    totalCount,
    refetch: refetchMessages 
  } = useMessages(filters, currentPage, pageSize);

  const { 
    data: messageStats, 
    loading: statsLoading, 
    refetch: refetchStats 
  } = useMessageStats();

  const { 
    data: moderators, 
    loading: moderatorsLoading 
  } = useModerators(true);

  const { mutate, loading: mutationLoading } = useSupabaseMutation();

  // Auto-refresh functionality
  useEffect(() => {
    if (refreshInterval > 0) {
      const interval = setInterval(() => {
        setLastRefresh(new Date());
        refetchMessages();
        refetchStats();
      }, refreshInterval * 1000);

      return () => clearInterval(interval);
    }
  }, [refreshInterval, refetchMessages, refetchStats]);

  // Real-time subscription for message updates
  useEffect(() => {
    const subscription = subscriptionService?.subscribeToMessages((payload) => {
      console.log('Real-time message update:', payload);
      refetchMessages();
      refetchStats();
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [refetchMessages, refetchStats]);

  // Format messages for display (adding computed fields)
  const formattedMessages = useMemo(() => {
    return messages?.map(message => ({
      ...message,
      phoneNumber: message?.phone_number?.phone_number || 'Unknown',
      moderator: message?.moderator?.name || 'Unassigned',
      moderatorId: message?.moderator_id,
      timestamp: new Date(message?.created_at),
      lastAttempt: message?.sent_at ? new Date(message?.sent_at) : null,
      retryCount: 0, // This would need to be calculated based on your retry logic
      priority: 'medium', // This would come from your database if you have this field
      templateName: 'default', // This would come from your database if you have this field
      isWhatsAppNumber: message?.phone_number?.has_whatsapp || false,
      errorCode: message?.error_message ? 'GENERAL_ERROR' : null,
      deliveryHistory: [] // This would need to be fetched separately if you track delivery history
    })) || [];
  }, [messages]);

  // Sort messages based on sortConfig
  const sortedMessages = useMemo(() => {
    if (!sortConfig?.key) return formattedMessages;

    return [...formattedMessages]?.sort((a, b) => {
      let aValue = a?.[sortConfig?.key];
      let bValue = b?.[sortConfig?.key];

      // Handle date sorting
      if (sortConfig?.key === 'timestamp' || sortConfig?.key === 'lastAttempt') {
        aValue = aValue ? new Date(aValue)?.getTime() : 0;
        bValue = bValue ? new Date(bValue)?.getTime() : 0;
      }

      // Handle string sorting
      if (typeof aValue === 'string') {
        aValue = aValue?.toLowerCase();
        bValue = bValue?.toLowerCase();
      }

      if (aValue < bValue) {
        return sortConfig?.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig?.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [formattedMessages, sortConfig]);

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSidebarToggle = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig?.key === key && prevConfig?.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleBulkAction = async (action) => {
    if (selectedMessages?.length === 0) return;

    const result = await mutate(async () => {
      switch (action) {
        case 'retry': console.log('Retrying selected messages:', selectedMessages);
          // Here you would call your retry logic
          // await Promise.all(selectedMessages.map(id => messageService.retryMessage(id)));
          break;
        case 'reassign': console.log('Reassigning selected messages:', selectedMessages);
          // Here you would implement reassignment logic
          break;
        case 'mark_delivered': console.log('Marking selected messages as delivered:', selectedMessages);
          await Promise.all(
            selectedMessages?.map(id => 
              messageService?.updateMessage(id, { status: 'delivered' })
            )
          );
          break;
        case 'export':
          console.log('Exporting selected messages:', selectedMessages);
          // Here you would implement export logic
          break;
        default:
          break;
      }
    });

    if (result?.success) {
      setSelectedMessages([]);
      refetchMessages();
      refetchStats();
    }
  };

  const handleRetryMessage = async (messageId) => {
    const result = await mutate(async () => {
      // Update message status to pending for retry
      return await messageService?.updateMessage(messageId, { 
        status: 'pending',
        error_message: null 
      });
    });

    if (result?.success) {
      refetchMessages();
      refetchStats();
    }
  };

  const handleViewDetails = async (message) => {
    try {
      // Fetch full message details
      const fullMessage = await messageService?.getMessageById(message?.id);
      setSelectedMessage(fullMessage);
      setIsDetailsModalOpen(true);
    } catch (error) {
      console.error('Error fetching message details:', error);
    }
  };

  const handleRetryFromModal = async (messageId, schedule) => {
    const result = await mutate(async () => {
      console.log(`Scheduling retry for message ${messageId} with schedule: ${schedule}`);
      // Here you would implement scheduled retry logic
      return await messageService?.updateMessage(messageId, { 
        status: 'pending',
        error_message: null 
      });
    });

    if (result?.success) {
      setIsDetailsModalOpen(false);
      refetchMessages();
      refetchStats();
    }
  };

  const handleReassignFromModal = async (messageId, newModeratorId) => {
    const result = await mutate(async () => {
      return await messageService?.updateMessage(messageId, { 
        moderator_id: newModeratorId 
      });
    });

    if (result?.success) {
      setIsDetailsModalOpen(false);
      refetchMessages();
      refetchStats();
    }
  };

  const handleRefreshStatus = () => {
    setLastRefresh(new Date());
    refetchMessages();
    refetchStats();
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Show loading state
  if (messagesLoading && !messages?.length) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading messages...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (messagesError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Icon name="AlertTriangle" size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Error Loading Messages</h2>
          <p className="text-muted-foreground mb-4">{messagesError}</p>
          <Button onClick={handleRefreshStatus}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Message Status Tracking - WhatsApp Bulk Messenger</title>
        <meta name="description" content="Comprehensive message lifecycle monitoring with delivery status, failure analysis, and retry management across all campaigns." />
      </Helmet>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <Header onMenuToggle={handleMenuToggle} isMenuOpen={isMenuOpen} />

        {/* Sidebar */}
        <Sidebar 
          isCollapsed={isSidebarCollapsed} 
          onToggleCollapse={handleSidebarToggle}
          userRole="moderator"
        />

        {/* Main Content */}
        <main className={`transition-all duration-300 ${
          isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'
        } pt-16`}>
          <div className="p-4 lg:p-6 space-y-6">
            {/* Page Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="space-y-2">
                <Breadcrumb />
                <div className="flex items-center space-x-3">
                  <Icon name="MessageSquare" size={24} className="text-primary" />
                  <h1 className="text-2xl font-bold text-foreground">
                    Message Status Tracking
                  </h1>
                </div>
                <p className="text-muted-foreground">
                  Monitor delivery status, analyze failures, and manage retry operations across all campaigns
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Icon name="Clock" size={16} />
                  <span>Last updated: {lastRefresh?.toLocaleTimeString()}</span>
                </div>
                <Button
                  variant="outline"
                  onClick={handleRefreshStatus}
                  iconName="RefreshCw"
                  iconPosition="left"
                  disabled={messagesLoading || mutationLoading}
                >
                  {messagesLoading ? 'Refreshing...' : 'Refresh'}
                </Button>
              </div>
            </div>

            {/* Status Summary Cards */}
            <StatusSummaryCards 
              statusCounts={messageStats || {}}
              totalMessages={totalCount || 0}
              refreshRate={refreshInterval}
              loading={statsLoading}
            />

            {/* Connection Status Panel */}
            <ConnectionStatusPanel onRefresh={handleRefreshStatus} />

            {/* Filter Bar */}
            <StatusFilterBar
              filters={filters}
              onFiltersChange={setFilters}
              onBulkAction={handleBulkAction}
              selectedCount={selectedMessages?.length}
              totalMessages={totalCount || 0}
              moderators={moderators || []}
              loading={mutationLoading}
            />

            {/* Messages Table */}
            <MessageStatusTable
              messages={sortedMessages || []}
              selectedMessages={selectedMessages}
              onSelectionChange={setSelectedMessages}
              onRetryMessage={handleRetryMessage}
              onViewDetails={handleViewDetails}
              sortConfig={sortConfig}
              onSort={handleSort}
              loading={messagesLoading}
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center">
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    <Icon name="ChevronLeft" size={16} />
                  </Button>
                  
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const page = i + 1;
                    const isActive = page === currentPage;
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-1 text-sm rounded ${
                          isActive 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-background border border-border text-foreground hover:bg-muted'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    <Icon name="ChevronRight" size={16} />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Message Details Modal */}
        <MessageDetailsModal
          message={selectedMessage}
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          onRetry={handleRetryFromModal}
          onReassign={handleReassignFromModal}
          moderators={moderators || []}
        />
      </div>
    </>
  );
};

export default MessageStatusTracking;