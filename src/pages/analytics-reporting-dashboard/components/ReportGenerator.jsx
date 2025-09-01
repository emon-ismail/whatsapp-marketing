import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const ReportGenerator = ({ onGenerateReport, isGenerating = false }) => {
  const [reportConfig, setReportConfig] = useState({
    name: '',
    type: 'summary',
    dateRange: '30d',
    format: 'pdf',
    includeCharts: true,
    includeTables: true,
    includeMetrics: true,
    recipients: '',
    schedule: 'manual'
  });

  const reportTypes = [
    { value: 'summary', label: 'Executive Summary' },
    { value: 'detailed', label: 'Detailed Analytics' },
    { value: 'performance', label: 'Performance Report' },
    { value: 'campaign', label: 'Campaign Analysis' },
    { value: 'moderator', label: 'Moderator Performance' },
    { value: 'custom', label: 'Custom Report' }
  ];

  const dateRangeOptions = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
    { value: '6m', label: 'Last 6 Months' },
    { value: '1y', label: 'Last Year' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const formatOptions = [
    { value: 'pdf', label: 'PDF Document' },
    { value: 'excel', label: 'Excel Spreadsheet' },
    { value: 'csv', label: 'CSV File' },
    { value: 'json', label: 'JSON Data' }
  ];

  const scheduleOptions = [
    { value: 'manual', label: 'Generate Manually' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' }
  ];

  const handleInputChange = (field, value) => {
    setReportConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCheckboxChange = (field, checked) => {
    setReportConfig(prev => ({
      ...prev,
      [field]: checked
    }));
  };

  const handleGenerateReport = () => {
    if (!reportConfig?.name?.trim()) {
      alert('Please enter a report name');
      return;
    }
    onGenerateReport(reportConfig);
  };

  const getReportPreview = () => {
    const sections = [];
    if (reportConfig?.includeMetrics) sections?.push('Key Metrics');
    if (reportConfig?.includeCharts) sections?.push('Visual Charts');
    if (reportConfig?.includeTables) sections?.push('Data Tables');
    return sections?.join(', ');
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Icon name="FileText" size={20} className="text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Report Generator</h3>
            <p className="text-sm text-muted-foreground">Create custom analytics reports</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          iconName="History" 
          iconPosition="left"
        >
          View History
        </Button>
      </div>
      <div className="space-y-6">
        {/* Basic Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Report Name"
            type="text"
            placeholder="Enter report name"
            value={reportConfig?.name}
            onChange={(e) => handleInputChange('name', e?.target?.value)}
            required
          />
          <Select
            label="Report Type"
            options={reportTypes}
            value={reportConfig?.type}
            onChange={(value) => handleInputChange('type', value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Date Range"
            options={dateRangeOptions}
            value={reportConfig?.dateRange}
            onChange={(value) => handleInputChange('dateRange', value)}
          />
          <Select
            label="Export Format"
            options={formatOptions}
            value={reportConfig?.format}
            onChange={(value) => handleInputChange('format', value)}
          />
        </div>

        {/* Content Options */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-foreground">Include in Report</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Checkbox
              label="Key Metrics & KPIs"
              description="Performance indicators and statistics"
              checked={reportConfig?.includeMetrics}
              onChange={(e) => handleCheckboxChange('includeMetrics', e?.target?.checked)}
            />
            <Checkbox
              label="Charts & Visualizations"
              description="Graphs and visual data representations"
              checked={reportConfig?.includeCharts}
              onChange={(e) => handleCheckboxChange('includeCharts', e?.target?.checked)}
            />
            <Checkbox
              label="Data Tables"
              description="Detailed tabular data"
              checked={reportConfig?.includeTables}
              onChange={(e) => handleCheckboxChange('includeTables', e?.target?.checked)}
            />
          </div>
        </div>

        {/* Distribution */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-foreground">Distribution</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Email Recipients"
              type="email"
              placeholder="Enter email addresses (comma separated)"
              value={reportConfig?.recipients}
              onChange={(e) => handleInputChange('recipients', e?.target?.value)}
              description="Leave empty to download only"
            />
            <Select
              label="Schedule"
              options={scheduleOptions}
              value={reportConfig?.schedule}
              onChange={(value) => handleInputChange('schedule', value)}
            />
          </div>
        </div>

        {/* Preview */}
        <div className="bg-muted/30 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-foreground mb-2">Report Preview</h4>
          <div className="text-sm text-muted-foreground space-y-1">
            <div><strong>Type:</strong> {reportTypes?.find(t => t?.value === reportConfig?.type)?.label}</div>
            <div><strong>Period:</strong> {dateRangeOptions?.find(d => d?.value === reportConfig?.dateRange)?.label}</div>
            <div><strong>Format:</strong> {formatOptions?.find(f => f?.value === reportConfig?.format)?.label}</div>
            <div><strong>Sections:</strong> {getReportPreview() || 'None selected'}</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Icon name="Info" size={16} />
            <span>Reports are generated in the background and may take a few minutes</span>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              variant="outline" 
              onClick={() => setReportConfig({
                name: '',
                type: 'summary',
                dateRange: '30d',
                format: 'pdf',
                includeCharts: true,
                includeTables: true,
                includeMetrics: true,
                recipients: '',
                schedule: 'manual'
              })}
            >
              Reset
            </Button>
            <Button 
              variant="default" 
              onClick={handleGenerateReport}
              loading={isGenerating}
              iconName="Download"
              iconPosition="left"
              disabled={!reportConfig?.name?.trim()}
            >
              {isGenerating ? 'Generating...' : 'Generate Report'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportGenerator;