import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { supabase } from '../../lib/supabase';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';

const AdminUpload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [campaignType, setCampaignType] = useState('oasis_outfit');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && (selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls'))) {
      setFile(selectedFile);
      setResult(null);
    } else {
      alert('Please select a valid Excel file (.xlsx or .xls)');
    }
  };

  const processExcelFile = async () => {
    if (!file) return;

    setUploading(true);
    setProgress(0);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      // Extract phone numbers, birthdays, and names
      const phoneData = jsonData
        .slice(1) // Skip header row
        .filter(row => row[0] && row[0].toString().trim())
        .map(row => ({
          phone: (() => {
            let phoneStr = row[0].toString().trim();
            // Handle scientific notation from Excel
            if (phoneStr.includes('E') || phoneStr.includes('e')) {
              phoneStr = parseFloat(phoneStr).toFixed(0);
            }
            return phoneStr;
          })(),
          birthday: campaignType === 'zizii_island' && row[1] ? (() => {
            // Handle different date formats
            let dateStr = row[1].toString();
            let date;
            
            // If it's a number (Excel serial date)
            if (!isNaN(dateStr) && dateStr.length > 4) {
              // Excel serial date conversion
              date = new Date((parseFloat(dateStr) - 25569) * 86400 * 1000);
            } else {
              // Regular date string
              date = new Date(dateStr);
            }
            
            return date.toISOString().split('T')[0];
          })() : null,
          name: campaignType === 'zizii_island' && row[2] ? row[2].toString().trim() : null
        }));

      // Remove duplicates by phone number
      const uniqueNumbers = phoneData.filter((item, index, self) => 
        index === self.findIndex(t => t.phone === item.phone)
      );
      
      // Prepare data for database
      let numbersToInsert;
      let tableName;
      
      if (campaignType === 'zizii_island') {
        tableName = 'birthday_numbers';
        numbersToInsert = uniqueNumbers.map(item => ({
          phone_number: item.phone,
          person_name: item.name,
          birthday: item.birthday,
          status: 'pending',
          created_at: new Date().toISOString()
        }));
      } else {
        tableName = 'phone_numbers';
        numbersToInsert = uniqueNumbers.map(item => ({
          phone_number: item.phone,
          status: 'pending',
          has_whatsapp: null,
          campaign_type: campaignType,
          created_at: new Date().toISOString()
        }));
      }

      // Insert in batches of 1000
      const batchSize = 1000;
      let inserted = 0;
      let errors = 0;

      for (let i = 0; i < numbersToInsert.length; i += batchSize) {
        const batch = numbersToInsert.slice(i, i + batchSize);
        
        try {
          const { error } = await supabase
            .from(tableName)
            .insert(batch);

          if (error) {
            console.error('Batch insert error:', error);
            errors += batch.length;
          } else {
            inserted += batch.length;
          }
        } catch (err) {
          console.error('Batch error:', err);
          errors += batch.length;
        }

        setProgress(Math.round(((i + batch.length) / numbersToInsert.length) * 100));
      }

      setResult({
        total: phoneData.length,
        unique: uniqueNumbers.length,
        inserted,
        errors,
        duplicates: phoneData.length - uniqueNumbers.length
      });

    } catch (error) {
      console.error('Upload error:', error);
      alert('Error processing file: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Admin - Upload Phone Numbers
          </h1>
          <p className="text-muted-foreground">
            Upload Excel file with phone numbers for moderators to process
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="space-y-6">
              {/* Campaign Type Selection */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Campaign Type
                </label>
                <select
                  value={campaignType}
                  onChange={(e) => setCampaignType(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="oasis_outfit">Oasis Outfit</option>
                  <option value="zizii_island">Zizii Island (Birthday)</option>
                </select>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Select Excel File
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                  />
                </div>
                {file && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>

              {/* Upload Button */}
              <Button
                onClick={processExcelFile}
                disabled={!file || uploading}
                className="w-full"
                loading={uploading}
              >
                {uploading ? `Uploading... ${progress}%` : 'Upload Phone Numbers'}
              </Button>

              {/* Progress Bar */}
              {uploading && (
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              )}

              {/* Results */}
              {result && (
                <div className="bg-muted rounded-lg p-4">
                  <h3 className="font-medium text-foreground mb-3">Upload Results</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Total Numbers:</span>
                      <span className="ml-2 font-medium">{result.total}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Unique Numbers:</span>
                      <span className="ml-2 font-medium">{result.unique}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Successfully Inserted:</span>
                      <span className="ml-2 font-medium text-green-600">{result.inserted}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Errors:</span>
                      <span className="ml-2 font-medium text-red-600">{result.errors}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Duplicates Removed:</span>
                      <span className="ml-2 font-medium">{result.duplicates}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Instructions:</h4>
                {campaignType === 'zizii_island' ? (
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Column A: Phone numbers</li>
                    <li>• Column B: Birthday (YYYY-MM-DD or MM/DD/YYYY)</li>
                    <li>• Column C: Person Name (optional)</li>
                    <li>• First row will be treated as header and skipped</li>
                    <li>• Duplicate numbers will be automatically removed</li>
                  </ul>
                ) : (
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Excel file should have phone numbers in the first column</li>
                    <li>• First row will be treated as header and skipped</li>
                    <li>• Duplicate numbers will be automatically removed</li>
                    <li>• Numbers will be assigned to moderators for processing</li>
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUpload;