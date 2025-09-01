import React, { useState, useMemo } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const DataPreview = ({ data = [], onDataUpdate, isProcessing = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [columnMapping, setColumnMapping] = useState({
    phone: 'phone_number',
    name: 'full_name',
    email: 'email_address'
  });

  const mockData = [
    {
      id: 1,
      phone_number: "+1-555-0123",
      full_name: "John Smith",
      email_address: "john.smith@email.com",
      company: "Tech Corp",
      status: "valid",
      whatsapp_enabled: true,
      duplicate: false,
      country_code: "+1"
    },
    {
      id: 2,
      phone_number: "+44-20-7946-0958",
      full_name: "Sarah Johnson",
      email_address: "sarah.j@company.co.uk",
      company: "UK Solutions Ltd",
      status: "valid",
      whatsapp_enabled: true,
      duplicate: false,
      country_code: "+44"
    },
    {
      id: 3,
      phone_number: "+1-555-0124",
      full_name: "Mike Davis",
      email_address: "mike.davis@email.com",
      company: "Innovation Inc",
      status: "duplicate",
      whatsapp_enabled: true,
      duplicate: true,
      country_code: "+1"
    },
    {
      id: 4,
      phone_number: "invalid-number",
      full_name: "Jane Wilson",
      email_address: "jane.wilson@email.com",
      company: "Global Corp",
      status: "invalid",
      whatsapp_enabled: false,
      duplicate: false,
      country_code: ""
    },
    {
      id: 5,
      phone_number: "+91-98765-43210",
      full_name: "Raj Patel",
      email_address: "raj.patel@email.in",
      company: "Mumbai Tech",
      status: "valid",
      whatsapp_enabled: false,
      duplicate: false,
      country_code: "+91"
    }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Records' },
    { value: 'valid', label: 'Valid Numbers' },
    { value: 'invalid', label: 'Invalid Numbers' },
    { value: 'duplicate', label: 'Duplicates' },
    { value: 'whatsapp', label: 'WhatsApp Enabled' }
  ];

  const columnOptions = [
    { value: 'phone_number', label: 'Phone Number' },
    { value: 'full_name', label: 'Full Name' },
    { value: 'email_address', label: 'Email Address' },
    { value: 'company', label: 'Company' }
  ];

  const filteredData = useMemo(() => {
    let filtered = mockData;

    if (searchTerm) {
      filtered = filtered?.filter(row =>
        Object.values(row)?.some(value =>
          String(value)?.toLowerCase()?.includes(searchTerm?.toLowerCase())
        )
      );
    }

    if (filterStatus !== 'all') {
      switch (filterStatus) {
        case 'valid':
          filtered = filtered?.filter(row => row?.status === 'valid');
          break;
        case 'invalid':
          filtered = filtered?.filter(row => row?.status === 'invalid');
          break;
        case 'duplicate':
          filtered = filtered?.filter(row => row?.duplicate);
          break;
        case 'whatsapp':
          filtered = filtered?.filter(row => row?.whatsapp_enabled);
          break;
      }
    }

    return filtered;
  }, [searchTerm, filterStatus]);

  const getStatusBadge = (status, whatsappEnabled, duplicate) => {
    if (duplicate) {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-warning/10 text-warning">Duplicate</span>;
    }
    if (status === 'invalid') {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-error/10 text-error">Invalid</span>;
    }
    if (!whatsappEnabled) {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">No WhatsApp</span>;
    }
    return <span className="px-2 py-1 rounded-full text-xs font-medium bg-success/10 text-success">Valid</span>;
  };

  const handleSelectAll = () => {
    if (selectedRows?.size === filteredData?.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(filteredData.map(row => row.id)));
    }
  };

  const handleRowSelect = (id) => {
    const newSelected = new Set(selectedRows);
    if (newSelected?.has(id)) {
      newSelected?.delete(id);
    } else {
      newSelected?.add(id);
    }
    setSelectedRows(newSelected);
  };

  const stats = useMemo(() => {
    const total = mockData?.length;
    const valid = mockData?.filter(row => row?.status === 'valid' && !row?.duplicate)?.length;
    const invalid = mockData?.filter(row => row?.status === 'invalid')?.length;
    const duplicates = mockData?.filter(row => row?.duplicate)?.length;
    const whatsappEnabled = mockData?.filter(row => row?.whatsapp_enabled)?.length;

    return { total, valid, invalid, duplicates, whatsappEnabled };
  }, []);

  if (isProcessing) {
    return (
      <div className="bg-card rounded-lg border border-border p-8">
        <div className="text-center">
          <Icon name="Loader2" size={48} className="mx-auto text-primary animate-spin mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Processing Data</h3>
          <p className="text-muted-foreground">Parsing and validating phone numbers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Data Preview</h3>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" iconName="Download" iconSize={16}>
              Export Clean Data
            </Button>
            <Button variant="outline" size="sm" iconName="FileText" iconSize={16}>
              Validation Report
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{stats?.total}</div>
            <div className="text-xs text-muted-foreground">Total Records</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-success">{stats?.valid}</div>
            <div className="text-xs text-muted-foreground">Valid Numbers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-error">{stats?.invalid}</div>
            <div className="text-xs text-muted-foreground">Invalid Numbers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-warning">{stats?.duplicates}</div>
            <div className="text-xs text-muted-foreground">Duplicates</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{stats?.whatsappEnabled}</div>
            <div className="text-xs text-muted-foreground">WhatsApp Ready</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <Input
              type="search"
              placeholder="Search records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e?.target?.value)}
            />
          </div>
          <div className="w-48">
            <Select
              options={statusOptions}
              value={filterStatus}
              onChange={setFilterStatus}
              placeholder="Filter by status"
            />
          </div>
        </div>
      </div>
      {/* Column Mapping */}
      <div className="p-4 bg-muted/30 border-b border-border">
        <h4 className="text-sm font-medium text-foreground mb-3">Column Mapping</h4>
        <div className="grid grid-cols-3 gap-4">
          <Select
            label="Phone Number Column"
            options={columnOptions}
            value={columnMapping?.phone}
            onChange={(value) => setColumnMapping(prev => ({ ...prev, phone: value }))}
          />
          <Select
            label="Name Column"
            options={columnOptions}
            value={columnMapping?.name}
            onChange={(value) => setColumnMapping(prev => ({ ...prev, name: value }))}
          />
          <Select
            label="Email Column"
            options={columnOptions}
            value={columnMapping?.email}
            onChange={(value) => setColumnMapping(prev => ({ ...prev, email: value }))}
          />
        </div>
      </div>
      {/* Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedRows?.size === filteredData?.length && filteredData?.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-border"
                />
              </th>
              <th className="p-3 text-left text-sm font-medium text-foreground">Phone Number</th>
              <th className="p-3 text-left text-sm font-medium text-foreground">Name</th>
              <th className="p-3 text-left text-sm font-medium text-foreground">Email</th>
              <th className="p-3 text-left text-sm font-medium text-foreground">Company</th>
              <th className="p-3 text-left text-sm font-medium text-foreground">Status</th>
              <th className="p-3 text-left text-sm font-medium text-foreground">WhatsApp</th>
              <th className="p-3 text-left text-sm font-medium text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData?.map((row) => (
              <tr key={row?.id} className="border-b border-border hover:bg-muted/30">
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={selectedRows?.has(row?.id)}
                    onChange={() => handleRowSelect(row?.id)}
                    className="rounded border-border"
                  />
                </td>
                <td className="p-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-foreground font-mono">{row?.phone_number}</span>
                    {row?.country_code && (
                      <span className="text-xs text-muted-foreground bg-muted px-1 rounded">
                        {row?.country_code}
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-3 text-sm text-foreground">{row?.full_name}</td>
                <td className="p-3 text-sm text-foreground">{row?.email_address}</td>
                <td className="p-3 text-sm text-muted-foreground">{row?.company}</td>
                <td className="p-3">
                  {getStatusBadge(row?.status, row?.whatsapp_enabled, row?.duplicate)}
                </td>
                <td className="p-3">
                  <Icon 
                    name={row?.whatsapp_enabled ? "CheckCircle" : "XCircle"} 
                    size={16} 
                    className={row?.whatsapp_enabled ? "text-success" : "text-error"}
                  />
                </td>
                <td className="p-3">
                  <div className="flex items-center space-x-1">
                    <Button variant="ghost" size="xs" iconName="Edit" iconSize={12} />
                    <Button variant="ghost" size="xs" iconName="Trash2" iconSize={12} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Footer */}
      <div className="p-4 border-t border-border bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {filteredData?.length} of {mockData?.length} records
            {selectedRows?.size > 0 && ` • ${selectedRows?.size} selected`}
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" disabled={selectedRows?.size === 0}>
              Bulk Edit ({selectedRows?.size})
            </Button>
            <Button variant="outline" size="sm" disabled={selectedRows?.size === 0}>
              Remove Selected
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataPreview;