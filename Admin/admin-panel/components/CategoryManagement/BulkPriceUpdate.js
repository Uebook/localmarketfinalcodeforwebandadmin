'use client';

import { useState } from 'react';
import * as XLSX from 'xlsx';

export default function BulkPriceUpdate() {
  const [file, setFile] = useState(null);
  const [importData, setImportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Sample vendor products for template
  const sampleProducts = [
    { productId: 'P001', productName: 'Rice (1kg)', currentPrice: 50, newPrice: '', category: 'Groceries', unit: 'kg' },
    { productId: 'P002', productName: 'Wheat Flour (1kg)', currentPrice: 40, newPrice: '', category: 'Groceries', unit: 'kg' },
    { productId: 'P003', productName: 'Sugar (1kg)', currentPrice: 45, newPrice: '', category: 'Groceries', unit: 'kg' },
    { productId: 'P004', productName: 'Cooking Oil (1L)', currentPrice: 120, newPrice: '', category: 'Groceries', unit: 'litre' },
    { productId: 'P005', productName: 'Milk (1L)', currentPrice: 60, newPrice: '', category: 'Dairy', unit: 'litre' },
  ];

  const handleFileUpload = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setImportData([]);
      setResult(null);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = new Uint8Array(event.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet);
          
          // Validate and format data
          const formattedData = jsonData.map((row, index) => ({
            rowNumber: index + 2, // Excel row number (1-indexed, +1 for header)
            productId: row['Product ID'] || row['productId'] || '',
            productName: row['Product Name'] || row['productName'] || '',
            currentPrice: row['Current Price'] || row['currentPrice'] || '',
            newPrice: row['New Price'] || row['newPrice'] || '',
            category: row['Category'] || row['category'] || '',
            unit: row['Unit'] || row['unit'] || '',
            errors: []
          }));

          // Validate data
          formattedData.forEach(item => {
            if (!item.productId) item.errors.push('Product ID is required');
            if (!item.newPrice || isNaN(item.newPrice)) item.errors.push('Valid New Price is required');
            if (item.newPrice && parseFloat(item.newPrice) <= 0) item.errors.push('Price must be greater than 0');
          });

          setImportData(formattedData);
        } catch (error) {
          setResult({ success: false, message: 'Error reading file: ' + error.message });
        }
      };
      reader.readAsArrayBuffer(selectedFile);
    }
  };

  const handleDownloadTemplate = () => {
    // Create template data
    const templateData = sampleProducts.map(p => ({
      'Product ID': p.productId,
      'Product Name': p.productName,
      'Current Price': p.currentPrice,
      'New Price': '',
      'Category': p.category,
      'Unit': p.unit
    }));

    // Create workbook
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Price Update Template');

    // Download
    XLSX.writeFile(wb, 'price_update_template.xlsx');
  };

  const handleImport = async () => {
    if (importData.length === 0) {
      setResult({ success: false, message: 'Please upload a file first' });
      return;
    }

    // Check for errors
    const hasErrors = importData.some(item => item.errors.length > 0);
    if (hasErrors) {
      setResult({ success: false, message: 'Please fix errors in the data before importing' });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In real implementation, send to API
      const validUpdates = importData.filter(item => item.newPrice && !isNaN(item.newPrice));
      
      setResult({
        success: true,
        message: `Successfully updated ${validUpdates.length} product prices!`
      });

      // Clear data after successful import
      setFile(null);
      setImportData([]);
    } catch (error) {
      setResult({ success: false, message: 'Error importing prices: ' + error.message });
    } finally {
      setLoading(false);
    }
  };

  const getErrorCount = () => {
    return importData.filter(item => item.errors.length > 0).length;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Bulk Price Update via Excel</h2>
        <p className="text-gray-600 mb-6">
          Upload an Excel file to bulk update product prices. Download the template first to ensure correct format.
        </p>

        {/* Download Template */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Download Template</h3>
              <p className="text-sm text-blue-700">Get the Excel template with correct format</p>
            </div>
            <button
              onClick={handleDownloadTemplate}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              📥 Download Template
            </button>
          </div>
        </div>

        {/* File Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Excel File
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-orange-500 transition">
            <div className="space-y-1 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="flex text-sm text-gray-600">
                <label className="relative cursor-pointer rounded-md font-medium text-orange-600 hover:text-orange-500">
                  <span>Upload a file</span>
                  <input 
                    type="file" 
                    className="sr-only" 
                    accept=".xlsx,.xls" 
                    onChange={handleFileUpload} 
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">Excel (.xlsx, .xls) up to 10MB</p>
            </div>
          </div>
          {file && (
            <div className="mt-2 text-sm text-gray-600">
              Selected: <span className="font-medium">{file.name}</span>
            </div>
          )}
        </div>

        {/* Import Data Preview */}
        {importData.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                Import Preview ({importData.length} rows)
              </h3>
              {getErrorCount() > 0 && (
                <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                  {getErrorCount()} error(s) found
                </span>
              )}
            </div>
            <div className="overflow-x-auto border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Row</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Product ID</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Product Name</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Current Price</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">New Price</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {importData.map((item, index) => (
                    <tr 
                      key={index} 
                      className={item.errors.length > 0 ? 'bg-red-50' : 'bg-white'}
                    >
                      <td className="px-4 py-2 text-gray-900">{item.rowNumber}</td>
                      <td className="px-4 py-2 text-gray-900">{item.productId}</td>
                      <td className="px-4 py-2 text-gray-900">{item.productName}</td>
                      <td className="px-4 py-2 text-gray-600">₹{item.currentPrice}</td>
                      <td className="px-4 py-2">
                        <span className={item.errors.length > 0 ? 'text-red-600' : 'text-green-600 font-medium'}>
                          ₹{item.newPrice}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        {item.errors.length > 0 ? (
                          <div className="text-xs text-red-600">
                            {item.errors.join(', ')}
                          </div>
                        ) : (
                          <span className="text-xs text-green-600 font-medium">✓ Valid</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Result Message */}
        {result && (
          <div className={`p-4 rounded-lg mb-6 ${
            result.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {result.message}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleImport}
            disabled={loading || importData.length === 0 || getErrorCount() > 0}
            className="gradient-primary text-white px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Importing...' : 'Import Prices'}
          </button>
          <button
            onClick={() => {
              setFile(null);
              setImportData([]);
              setResult(null);
            }}
            className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Instructions</h3>
        <ul className="space-y-2 text-sm text-gray-600 list-disc list-inside">
          <li>Download the template Excel file first</li>
          <li>Fill in the "New Price" column with updated prices</li>
          <li>Keep "Product ID" and other columns unchanged</li>
          <li>Upload the completed file to update prices in bulk</li>
          <li>Review the preview table to check for any errors before importing</li>
        </ul>
      </div>
    </div>
  );
}
