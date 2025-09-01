import React, { useState, useCallback } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const FileUploadZone = ({ onFileUpload, isProcessing = false }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleDragOver = useCallback((e) => {
    e?.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e?.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e?.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e?.dataTransfer?.files);
    const validFiles = files?.filter(file => 
      file?.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file?.type === 'application/vnd.ms-excel' ||
      file?.type === 'text/csv'
    );

    if (validFiles?.length > 0) {
      simulateUpload(validFiles?.[0]);
    }
  }, []);

  const handleFileSelect = useCallback((e) => {
    const file = e?.target?.files?.[0];
    if (file) {
      simulateUpload(file);
    }
  }, []);

  const simulateUpload = (file) => {
    setUploadProgress(0);
    onFileUpload(file, true);

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          onFileUpload(file, false);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  return (
    <div className="bg-card rounded-lg border-2 border-dashed border-border p-8">
      <div
        className={`relative transition-all duration-300 ${
          isDragOver ? 'border-primary bg-primary/5' : ''
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Icon 
              name={isProcessing ? "Loader2" : "Upload"} 
              size={32} 
              className={`text-primary ${isProcessing ? 'animate-spin' : ''}`}
            />
          </div>
          
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {isProcessing ? 'Processing File...' : 'Upload Campaign Data'}
          </h3>
          
          <p className="text-muted-foreground mb-6">
            Drag and drop your Excel or CSV file here, or click to browse
          </p>

          {isProcessing && (
            <div className="mb-6">
              <div className="w-full bg-muted rounded-full h-2 mb-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Uploading... {uploadProgress}%
              </p>
            </div>
          )}

          <div className="space-y-4">
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
              disabled={isProcessing}
            />
            
            <Button
              variant="default"
              size="lg"
              onClick={() => document.getElementById('file-upload')?.click()}
              disabled={isProcessing}
              iconName="FolderOpen"
              iconPosition="left"
            >
              Choose File
            </Button>

            <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Icon name="FileSpreadsheet" size={16} />
                <span>Excel</span>
              </div>
              <div className="flex items-center space-x-1">
                <Icon name="FileText" size={16} />
                <span>CSV</span>
              </div>
              <div className="flex items-center space-x-1">
                <Icon name="HardDrive" size={16} />
                <span>Max 50MB</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUploadZone;