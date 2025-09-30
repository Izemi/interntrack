import { useState, useEffect } from 'react';

export default function AddJobModal({ isOpen, onClose, onAdd, initialData = null, isEditing = false }) {
  const [formData, setFormData] = useState({
    company: '',
    role: '',
    location: '',
    salary_range: '',
    sponsors_visa: false,
    application_url: '',
    status: 'Applied',
    notes: '',
    deadline: ''  // Fixed: added comma
  });

  // Load initial data when editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        company: initialData.company || '',
        role: initialData.role || '',
        location: initialData.location || '',
        salary_range: initialData.salary_range || '',
        sponsors_visa: initialData.sponsors_visa || false,
        application_url: initialData.application_url || '',
        status: initialData.status || 'Applied',
        notes: initialData.notes || '',
        deadline: initialData.deadline ? initialData.deadline.split('T')[0] : ''  // Fixed: added comma
      });
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onAdd(formData);
    if (!isEditing) {
      setFormData({
        company: '',
        role: '',
        location: '',
        salary_range: '',
        sponsors_visa: false,
        application_url: '',
        status: 'Applied',
        notes: '',
        deadline: ''  // Fixed: added deadline reset
      });
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">
            {isEditing ? 'Edit Application' : 'Add New Application'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Company *</label>
              <input
                type="text"
                required
                value={formData.company}
                onChange={(e) => setFormData({...formData, company: e.target.value})}
                className="w-full border rounded p-2"
                placeholder="Google"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Role *</label>
              <input
                type="text"
                required
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                className="w-full border rounded p-2"
                placeholder="SWE Intern"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                className="w-full border rounded p-2"
                placeholder="New York, NY"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Salary Range</label>
              <input
                type="text"
                value={formData.salary_range}
                onChange={(e) => setFormData({...formData, salary_range: e.target.value})}
                className="w-full border rounded p-2"
                placeholder="$40-50/hr"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Application URL</label>
            <input
              type="url"
              value={formData.application_url}
              onChange={(e) => setFormData({...formData, application_url: e.target.value})}
              className="w-full border rounded p-2"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Application Deadline</label>
            <input
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({...formData, deadline: e.target.value})}
              className="w-full border rounded p-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full border rounded p-2"
              >
                <option>Applied</option>
                <option>Online Assessment</option>
                <option>Phone Screen</option>
                <option>Final Round</option>
                <option>Offer</option>
                <option>Rejected</option>
              </select>
            </div>

            <div className="flex items-center pt-6">
              <input
                type="checkbox"
                checked={formData.sponsors_visa}
                onChange={(e) => setFormData({...formData, sponsors_visa: e.target.checked})}
                className="mr-2"
                id="sponsors_visa"
              />
              <label htmlFor="sponsors_visa" className="text-sm font-medium">Sponsors F-1 Visa</label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="w-full border rounded p-2"
              rows="3"
              placeholder="Any additional notes..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              {isEditing ? 'Update Application' : 'Add Application'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 bg-gray-200 text-gray-700 py-2 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}