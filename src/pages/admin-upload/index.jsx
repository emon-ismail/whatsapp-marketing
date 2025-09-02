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

  const downloadDemoFile = () => {
    let demoData;
    let filename;
    
    if (campaignType === 'zizii_island') {
      // Zizii Island demo with birthday data
      demoData = [
        ['Phone Number', 'Birthday', 'Name'],
        ['01712345678', '1990-01-15', 'John Doe'],
        ['01823456789', '1985-03-22', 'Jane Smith'],
        ['01934567890', '1992-07-08', 'Mike Johnson'],
        ['01645678901', '1988-12-03', 'Sarah Wilson'],
        ['01756789012', '1995-05-17', 'David Brown']
      ];
      filename = 'zizii_island_demo.xlsx';
    } else {
      // Oasis Outfit demo with just phone numbers
      demoData = [
        ['Phone Number'],
        ['01712345678'],
        ['01823456789'],
        ['01934567890'],
        ['01645678901'],
        ['01756789012'],
        ['01867890123'],
        ['01978901234'],
        ['01589012345']
      ];
      filename = 'oasis_outfit_demo.xlsx';
    }
    
    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(demoData);
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Demo Data');
    
    // Download file
    XLSX.writeFile(wb, filename);
  };

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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg">
              <Icon name="Upload" className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Upload Phone Numbers
            </h1>
          </div>
          <p className="text-sm text-gray-600">
            Upload Excel file with phone numbers for moderators to process
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="space-y-6">
              {/* Campaign Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Campaign Type
                </label>
                <div className="flex space-x-3">
                  <select
                    value={campaignType}
                    onChange={(e) => setCampaignType(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="oasis_outfit">Oasis Outfit</option>
                    <option value="zizii_island">Zizii Island (Birthday)</option>
                  </select>
                  <button
                    onClick={downloadDemoFile}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-colors flex items-center space-x-2"
                  >
                    <Icon name="Download" size={16} />
                    <span>Demo File</span>
                  </button>
                </div>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Excel File
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-emerald-400 transition-colors">
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gradient-to-r file:from-emerald-500 file:to-teal-500 file:text-white hover:file:from-emerald-600 hover:file:to-teal-600"
                  />
                  {!file && (
                    <div className="mt-2">
                      <Icon name="Upload" className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Choose Excel file or drag and drop</p>
                    </div>
                  )}
                </div>
                {file && (
                  <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Icon name="FileSpreadsheet" className="h-5 w-5 text-emerald-600" />
                      <div>
                        <p className="text-sm font-medium text-emerald-900">{file.name}</p>
                        <p className="text-xs text-emerald-700">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Upload Button */}
              <button
                onClick={processExcelFile}
                disabled={!file || uploading}
                className={`w-full px-4 py-3 rounded-lg font-medium transition-colors ${
                  !file || uploading
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600'
                }`}
              >
                {uploading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Icon name="Loader2" className="h-4 w-4 animate-spin" />
                    <span>Uploading... {progress}%</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <Icon name="Upload" className="h-4 w-4" />
                    <span>Upload Phone Numbers</span>
                  </div>
                )}
              </button>

              {/* Progress Bar */}
              {uploading && (
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 h-3 rounded-full transition-all duration-300 flex items-center justify-center"
                    style={{ width: `${progress}%` }}
                  >
                    <span className="text-xs text-white font-medium">{progress}%</span>
                  </div>
                </div>
              )}

              {/* Results */}
              {result && (
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="p-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full">
                      <Icon name="CheckCircle" className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="font-medium text-emerald-900">Upload Results</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-emerald-700">Total Numbers:</span>
                      <span className="font-medium text-emerald-900">{result.total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-emerald-700">Unique Numbers:</span>
                      <span className="font-medium text-emerald-900">{result.unique}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-emerald-700">Successfully Inserted:</span>
                      <span className="font-medium text-green-600">{result.inserted}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-emerald-700">Errors:</span>
                      <span className="font-medium text-red-600">{result.errors}</span>
                    </div>
                    <div className="flex justify-between sm:col-span-2">
                      <span className="text-emerald-700">Duplicates Removed:</span>
                      <span className="font-medium text-emerald-900">{result.duplicates}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Instructions */}
              <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-xl p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Icon name="Info" className="h-5 w-5 text-cyan-600" />
                    <h4 className="font-medium text-cyan-900">Instructions</h4>
                  </div>
                  <button
                    onClick={downloadDemoFile}
                    className="text-cyan-600 hover:text-cyan-700 hover:bg-cyan-100 px-2 py-1 rounded-lg transition-colors flex items-center space-x-1"
                  >
                    <Icon name="Download" size={14} />
                    <span className="text-xs">Download Demo</span>
                  </button>
                </div>
                {campaignType === 'zizii_island' ? (
                  <ul className="text-sm text-cyan-800 space-y-1">
                    <li>• Column A: Phone numbers (01XXXXXXXXX format)</li>
                    <li>• Column B: Birthday (YYYY-MM-DD or MM/DD/YYYY)</li>
                    <li>• Column C: Person Name (required for birthday wishes)</li>
                    <li>• First row will be treated as header and skipped</li>
                    <li>• Download demo file to see exact format</li>
                  </ul>
                ) : (
                  <ul className="text-sm text-cyan-800 space-y-1">
                    <li>• Column A: Phone numbers (01XXXXXXXXX format)</li>
                    <li>• First row will be treated as header and skipped</li>
                    <li>• Duplicate numbers will be automatically removed</li>
                    <li>• Download demo file to see exact format</li>
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