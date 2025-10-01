import { useState } from 'react';
import Papa from 'papaparse';

export default function CSVImport({ isOpen, onClose, onImport }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [importing, setImporting] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }

    setFile(selectedFile);
    setError('');

    // Parse and preview
    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.data.length === 0) {
          setError('CSV file is empty');
          return;
        }
        setPreview(results.data.slice(0, 5)); // Show first 5 rows
      },
      error: (err) => {
        setError('Failed to parse CSV: ' + err.message);
      }
    });
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    setError('');

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const jobs = results.data.map(row => ({
            company: row.Company || row.company || '',
            role: row.Role || row.role || '',
            location: row.Location || row.location || '',
            salary_range: row['Salary Range'] || row.salary_range || '',
            sponsors_visa: ['Yes', 'yes', 'true', 'TRUE', '1'].includes(row['Visa Sponsor'] || row.sponsors_visa),
            application_url: row['Application URL'] || row.application_url || '',
            status: row.Status || row.status || 'Planning to Apply',
            notes: row.Notes || row.notes || '',
            deadline: row.Deadline || row.deadline || null
          })).filter(job => job.company && job.role); // Only import rows with company and role

          if (jobs.length === 0) {
            setError('No valid jobs found. Make sure CSV has Company and Role columns.');
            setImporting(false);
            return;
          }

          await onImport(jobs);
          setImporting(false);
          onClose();
          setFile(null);
          setPreview(null);
        } catch (err) {
          setError('Failed to import: ' + err.message);
          setImporting(false);
        }
      },
      error: (err) => {
        setError('Failed to parse CSV: ' + err.message);
        setImporting(false);
      }
    });
  };

  const handleClose = () => {
    setFile(null);
    setPreview(null);
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Import from CSV</h2>
          <button onClick={handleClose} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold mb-2">CSV Format Requirements:</h3>
          <p className="text-sm text-gray-600 mb-2">Your CSV should have these columns (case-insensitive):</p>
          <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
            <li><strong>Company</strong> (required)</li>
            <li><strong>Role</strong> (required)</li>
            <li>Location (optional)</li>
            <li>Status (optional, defaults to "Planning to Apply")</li>
            <li>Visa Sponsor (optional, Yes/No)</li>
            <li>Salary Range (optional)</li>
            <li>Application URL (optional)</li>
            <li>Deadline (optional)</li>
            <li>Notes (optional)</li>
          </ul>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Choose CSV File</label>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="w-full border rounded p-2"
          />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
            {error}
          </div>
        )}

        {preview && (
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Preview (first 5 rows):</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border p-2 text-left">Company</th>
                    <th className="border p-2 text-left">Role</th>
                    <th className="border p-2 text-left">Location</th>
                    <th className="border p-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map((row, idx) => (
                    <tr key={idx}>
                      <td className="border p-2">{row.Company || row.company}</td>
                      <td className="border p-2">{row.Role || row.role}</td>
                      <td className="border p-2">{row.Location || row.location || '-'}</td>
                      <td className="border p-2">{row.Status || row.status || 'Planning to Apply'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={!file || importing}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {importing ? 'Importing...' : 'Import Applications'}
          </button>
        </div>
      </div>
    </div>
  );
}