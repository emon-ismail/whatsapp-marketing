import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Breadcrumb from '../../components/ui/Breadcrumb';
import QueueStatistics from './components/QueueStatistics';
import NumbersDataTable from './components/NumbersDataTable';
import ActionPanel from './components/ActionPanel';
import FilterToolbar from './components/FilterToolbar';

const ModeratorAssignmentDashboard = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedNumbers, setSelectedNumbers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [connectionStatus, setConnectionStatus] = useState('connected');

  // Mock data for moderator's assigned numbers
  const [numbers, setNumbers] = useState([
    {
      id: 1,
      phone: '+1-555-0123',
      name: 'John Anderson',
      status: 'pending',
      lastUpdated: new Date('2025-09-01T10:30:00'),
      priority: 'high',
      source: 'upload',
      notes: ''
    },
    {
      id: 2,
      phone: '+1-555-0124',
      name: 'Sarah Johnson',
      status: 'sent',
      lastUpdated: new Date('2025-09-01T09:15:00'),
      priority: 'medium',
      source: 'manual',
      notes: 'Follow-up required'
    },
    {
      id: 3,
      phone: '+1-555-0125',
      name: 'Michael Chen',
      status: 'failed',
      lastUpdated: new Date('2025-09-01T08:45:00'),
      priority: 'high',
      source: 'api',
      notes: 'Invalid number'
    },
    {
      id: 4,
      phone: '+1-555-0126',
      name: 'Emily Davis',
      status: 'done',
      lastUpdated: new Date('2025-09-01T07:20:00'),
      priority: 'low',
      source: 'upload',
      notes: 'Completed successfully'
    },
    {
      id: 5,
      phone: '+1-555-0127',
      name: 'David Wilson',
      status: 'assigned',
      lastUpdated: new Date('2025-09-01T11:00:00'),
      priority: 'medium',
      source: 'upload',
      notes: ''
    },
    {
      id: 6,
      phone: '+1-555-0128',
      name: 'Lisa Brown',
      status: 'pending',
      lastUpdated: new Date('2025-09-01T10:45:00'),
      priority: 'high',
      source: 'manual',
      notes: 'VIP customer'
    },
    {
      id: 7,
      phone: '+1-555-0129',
      name: 'Robert Taylor',
      status: 'sent',
      lastUpdated: new Date('2025-09-01T09:30:00'),
      priority: 'medium',
      source: 'api',
      notes: ''
    },
    {
      id: 8,
      phone: '+1-555-0130',
      name: 'Jennifer Martinez',
      status: 'pending',
      lastUpdated: new Date('2025-09-01T11:15:00'),
      priority: 'low',
      source: 'upload',
      notes: 'New lead'
    },
    {
      id: 9,
      phone: '+1-555-0131',
      name: 'Christopher Lee',
      status: 'failed',
      lastUpdated: new Date('2025-09-01T08:30:00'),
      priority: 'medium',
      source: 'manual',
      notes: 'Number not reachable'
    },
    {
      id: 10,
      phone: '+1-555-0132',
      name: 'Amanda White',
      status: 'sent',
      lastUpdated: new Date('2025-09-01T10:00:00'),
      priority: 'high',
      source: 'upload',
      notes: 'Urgent follow-up'
    }
  ]);

  // Calculate moderator statistics
  const moderatorData = {
    totalAssigned: numbers?.length,
    completed: numbers?.filter(n => n?.status === 'done')?.length,
    pending: numbers?.filter(n => n?.status === 'pending')?.length,
    sent: numbers?.filter(n => n?.status === 'sent')?.length,
    failed: numbers?.filter(n => n?.status === 'failed')?.length,
    assigned: numbers?.filter(n => n?.status === 'assigned')?.length
  };

  // Filter numbers based on search and status
  const filteredNumbers = numbers?.filter(number => {
    const matchesSearch = !searchTerm || 
      number?.phone?.includes(searchTerm) || 
      number?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || number?.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSidebarToggle = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleSelectionChange = (newSelection) => {
    setSelectedNumbers(newSelection);
  };

  const handleStatusUpdate = (numberId, newStatus) => {
    setNumbers(prevNumbers => 
      prevNumbers?.map(number => 
        number?.id === numberId 
          ? { ...number, status: newStatus, lastUpdated: new Date() }
          : number
      )
    );
  };

  const handleBulkStatusUpdate = (numberIds, newStatus) => {
    setNumbers(prevNumbers => 
      prevNumbers?.map(number => 
        numberIds?.includes(number?.id)
          ? { ...number, status: newStatus, lastUpdated: new Date() }
          : number
      )
    );
    setSelectedNumbers([]);
  };

  const handleWhatsAppLaunch = (number) => {
    // Simulate WhatsApp launch
    const message = encodeURIComponent(`Hello ${number?.name}, this is a message from our team.`);
    const whatsappUrl = `https://wa.me/${number?.phone?.replace(/[^0-9]/g, '')}?text=${message}`;
    
    // Update status to sent
    handleStatusUpdate(number?.id, 'sent');
    
    // Open WhatsApp in new tab
    window.open(whatsappUrl, '_blank');
  };

  const handleTemplateApply = (numberIds, templateId) => {
    console.log('Applying template', templateId, 'to numbers', numberIds);
    // Here you would apply the selected template to the numbers
  };

  const handleBulkReassign = (numberIds, newModeratorId) => {
    console.log('Reassigning numbers', numberIds, 'to moderator', newModeratorId);
    // Here you would reassign numbers to another moderator
  };

  const handleFilterChange = (filterType) => {
    setStatusFilter(filterType);
  };

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly update connection status
      const statuses = ['connected', 'connecting', 'disconnected'];
      const randomStatus = statuses?.[Math.floor(Math.random() * statuses?.length)];
      if (Math.random() > 0.9) { // 10% chance to change status
        setConnectionStatus(randomStatus);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event?.ctrlKey || event?.metaKey) {
        switch (event?.key) {
          case 'a':
            event?.preventDefault();
            setSelectedNumbers(filteredNumbers?.map(n => n?.id));
            break;
          case 'Enter':
            event?.preventDefault();
            if (selectedNumbers?.length === 1) {
              const number = numbers?.find(n => n?.id === selectedNumbers?.[0]);
              if (number) handleWhatsAppLaunch(number);
            }
            break;
          default:
            break;
        }
      }

      if (event?.key === 'F5') {
        event?.preventDefault();
        window.location?.reload();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedNumbers, filteredNumbers, numbers]);

  const customBreadcrumbs = [
    { label: 'Dashboard', path: '/real-time-progress-monitoring', icon: 'Home' },
    { label: 'Moderator Assignment Dashboard', path: '/moderator-assignment-dashboard', icon: 'Users', current: true }
  ];

  return (
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
      <main className={`transition-all duration-300 ease-in-out ${
        isSidebarCollapsed ? 'ml-16' : 'ml-60'
      } pt-16`}>
        <div className="p-6">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Breadcrumb customBreadcrumbs={customBreadcrumbs} />
          </div>

          {/* Page Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Moderator Assignment Dashboard</h1>
                <p className="text-muted-foreground mt-1">
                  Manage your assigned phone number queue and execute messaging workflows
                </p>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Real-time sync active</span>
              </div>
            </div>
          </div>

          {/* Filter Toolbar */}
          <div className="mb-6">
            <FilterToolbar
              onSearchChange={setSearchTerm}
              onStatusFilterChange={setStatusFilter}
              onDateRangeChange={setDateRange}
              searchTerm={searchTerm}
              statusFilter={statusFilter}
              dateRange={dateRange}
              totalNumbers={numbers?.length}
              filteredCount={filteredNumbers?.length}
            />
          </div>

          {/* Three Panel Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* Left Panel - Queue Statistics */}
            <div className="xl:col-span-3">
              <QueueStatistics
                moderatorData={moderatorData}
                onFilterChange={handleFilterChange}
                activeFilter={statusFilter}
              />
            </div>

            {/* Center Panel - Numbers Data Table */}
            <div className="xl:col-span-6">
              <NumbersDataTable
                numbers={filteredNumbers}
                selectedNumbers={selectedNumbers}
                onSelectionChange={handleSelectionChange}
                onStatusUpdate={handleStatusUpdate}
                onWhatsAppLaunch={handleWhatsAppLaunch}
                searchTerm={searchTerm}
                statusFilter={statusFilter}
              />
            </div>

            {/* Right Panel - Action Panel */}
            <div className="xl:col-span-3">
              <ActionPanel
                selectedNumbers={selectedNumbers}
                onBulkStatusUpdate={handleBulkStatusUpdate}
                onBulkReassign={handleBulkReassign}
                onTemplateApply={handleTemplateApply}
                connectionStatus={connectionStatus}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ModeratorAssignmentDashboard;