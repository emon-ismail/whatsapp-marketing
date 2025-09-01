import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Breadcrumb from '../../components/ui/Breadcrumb';
import FileUploadZone from './components/FileUploadZone';
import UploadHistory from './components/UploadHistory';
import DataPreview from './components/DataPreview';
import CampaignConfiguration from './components/CampaignConfiguration';
import Icon from '../../components/AppIcon';


const CampaignUploadConfiguration = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentFile, setCurrentFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedData, setUploadedData] = useState([]);
  const [userRole] = useState('admin'); // Mock user role

  // Handle file upload
  const handleFileUpload = (file, processing) => {
    setCurrentFile(file);
    setIsProcessing(processing);
    
    if (!processing) {
      // Simulate successful file processing
      setUploadedData([
        { id: 1, name: file?.name, records: 27450, status: 'completed' }
      ]);
    }
  };

  // Handle upload selection from history
  const handleSelectUpload = (upload) => {
    setCurrentFile({ name: upload?.fileName });
    setUploadedData([upload]);
  };

  // Handle campaign save
  const handleSaveCampaign = (campaignData) => {
    console.log('Saving campaign:', campaignData);
    // Here you would typically save to your backend
    alert('Campaign configured successfully!');
  };

  // Handle sidebar toggle
  const handleSidebarToggle = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // Handle mobile menu toggle
  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Custom breadcrumbs for this page
  const breadcrumbs = [
    { label: 'Dashboard', path: '/real-time-progress-monitoring', icon: 'Home' },
    { label: 'Campaign Upload & Configuration', path: '/campaign-upload-configuration', icon: 'Upload', current: true }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header 
        onMenuToggle={handleMobileMenuToggle}
        isMenuOpen={isMobileMenuOpen}
      />

      {/* Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleSidebarToggle}
        userRole={userRole}
      />

      {/* Main Content */}
      <main className={`transition-all duration-300 ease-in-out pt-16 ${
        isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'
      }`}>
        <div className="p-6">
          {/* Page Header */}
          <div className="mb-6">
            <Breadcrumb customBreadcrumbs={breadcrumbs} />
            <div className="mt-4">
              <h1 className="text-2xl font-bold text-foreground">Campaign Upload & Configuration</h1>
              <p className="text-muted-foreground mt-1">
                Upload phone number lists and configure campaign parameters for bulk WhatsApp messaging
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-card rounded-lg border border-border p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-md">
                  <Icon name="Upload" size={20} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Uploads</p>
                  <p className="text-xl font-semibold text-foreground">47</p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg border border-border p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-success/10 rounded-md">
                  <Icon name="CheckCircle" size={20} className="text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Valid Numbers</p>
                  <p className="text-xl font-semibold text-foreground">156,890</p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg border border-border p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-warning/10 rounded-md">
                  <Icon name="AlertTriangle" size={20} className="text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Duplicates</p>
                  <p className="text-xl font-semibold text-foreground">2,340</p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg border border-border p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-accent/10 rounded-md">
                  <Icon name="MessageSquare" size={20} className="text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">WhatsApp Ready</p>
                  <p className="text-xl font-semibold text-foreground">142,560</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* Left Panel - Upload History (30%) */}
            <div className="xl:col-span-4">
              <div className="space-y-6">
                {/* File Upload Zone */}
                <FileUploadZone 
                  onFileUpload={handleFileUpload}
                  isProcessing={isProcessing}
                />

                {/* Upload History */}
                <UploadHistory 
                  uploads={uploadedData}
                  onSelectUpload={handleSelectUpload}
                />
              </div>
            </div>

            {/* Center Panel - Data Preview (50%) */}
            <div className="xl:col-span-5">
              <DataPreview 
                data={uploadedData}
                onDataUpdate={setUploadedData}
                isProcessing={isProcessing}
              />
            </div>

            {/* Right Panel - Campaign Configuration (20%) */}
            <div className="xl:col-span-3">
              <CampaignConfiguration 
                onSaveCampaign={handleSaveCampaign}
                userRole={userRole}
              />
            </div>
          </div>

          {/* Keyboard Shortcuts Help */}
          <div className="mt-8 bg-card rounded-lg border border-border p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Icon name="Keyboard" size={16} className="text-muted-foreground" />
              <h4 className="text-sm font-medium text-foreground">Keyboard Shortcuts</h4>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-muted-foreground">
              <div className="flex items-center space-x-2">
                <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl+U</kbd>
                <span>Upload File</span>
              </div>
              <div className="flex items-center space-x-2">
                <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl+F</kbd>
                <span>Search Data</span>
              </div>
              <div className="flex items-center space-x-2">
                <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl+A</kbd>
                <span>Select All</span>
              </div>
              <div className="flex items-center space-x-2">
                <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl+S</kbd>
                <span>Save Campaign</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={handleMobileMenuToggle}
        />
      )}
    </div>
  );
};

export default CampaignUploadConfiguration;