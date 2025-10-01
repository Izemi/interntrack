import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

export default function ActivityTimeline({ jobId, isOpen, onClose, companyName }) {
  const [activities, setActivities] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [activityType, setActivityType] = useState('Note');

  const fetchActivities = async () => {
    try {
      const response = await axios.get(`${API_URL}/jobs/${jobId}/activities`);
      setActivities(response.data);
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  useEffect(() => {
    if (isOpen && jobId) {
      fetchActivities();
    }
  }, [isOpen, jobId]);

  const handleAddActivity = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    try {
      await axios.post(`${API_URL}/jobs/${jobId}/activities`, {
        activity_type: activityType,
        note: newNote
      });
      setNewNote('');
      fetchActivities();
    } catch (error) {
      console.error('Error adding activity:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: 'numeric', 
      minute: '2-digit' 
    });
  };

  const getActivityIcon = (type) => {
    const icons = {
      'Note': '📝',
      'Interview': '🎤',
      'Follow-up': '📧',
      'Rejection': '❌',
      'Offer': '🎉'
    };
    return icons[type] || '📌';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Activity Timeline - {companyName}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
        </div>

        {/* Add New Activity */}
        <form onSubmit={handleAddActivity} className="mb-6 border-b pb-6">
          <div className="grid grid-cols-4 gap-3">
            <select
              value={activityType}
              onChange={(e) => setActivityType(e.target.value)}
              className="border rounded p-2"
            >
              <option>Note</option>
              <option>Interview</option>
              <option>Follow-up</option>
              <option>Rejection</option>
              <option>Offer</option>
            </select>
            <input
              type="text"
              placeholder="Add a note..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="col-span-2 border rounded p-2"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add
            </button>
          </div>
        </form>

        {/* Timeline */}
        <div className="space-y-4">
          {activities.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No activities yet. Add your first note above!</p>
          ) : (
            activities.map(activity => (
              <div key={activity.id} className="flex gap-3 border-l-4 border-blue-500 pl-4 py-2">
                <div className="text-2xl">{getActivityIcon(activity.activity_type)}</div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <span className="font-semibold text-gray-700">{activity.activity_type}</span>
                    <span className="text-sm text-gray-500">{formatDate(activity.created_at)}</span>
                  </div>
                  <p className="text-gray-600 mt-1">{activity.note}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}