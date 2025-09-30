import { useState, useEffect } from 'react'
import AddJobModal from './components/AddJobModal'
import axios from 'axios'

const API_URL = 'http://localhost:8080/api';

function App() {
  const [jobs, setJobs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    try {
      const response = await axios.get(`${API_URL}/jobs`);
      setJobs(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleAddJob = async (jobData) => {
    try {
      await axios.post(`${API_URL}/jobs`, jobData);
      fetchJobs();
    } catch (error) {
      console.error('Error adding job:', error);
    }
  };

  const handleDeleteJob = async (id) => {
    if (window.confirm('Are you sure you want to delete this application?')) {
      try {
        await axios.delete(`${API_URL}/jobs/${id}`);
        fetchJobs();
      } catch (error) {
        console.error('Error deleting job:', error);
      }
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Applied': 'bg-blue-100 text-blue-800',
      'Online Assessment': 'bg-purple-100 text-purple-800',
      'Phone Screen': 'bg-yellow-100 text-yellow-800',
      'Final Round': 'bg-orange-100 text-orange-800',
      'Offer': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-xl">Loading...</div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">InternTrack 🎯</h1>
            <p className="text-gray-600 mt-1">Track your internship applications with visa sponsorship insights</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
          >
            + Add Application
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow">
          {jobs.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <p className="text-xl mb-2">No applications yet!</p>
              <p>Click "Add Application" to track your first internship application.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-4 font-semibold">Company</th>
                    <th className="text-left p-4 font-semibold">Role</th>
                    <th className="text-left p-4 font-semibold">Location</th>
                    <th className="text-left p-4 font-semibold">Status</th>
                    <th className="text-left p-4 font-semibold">Visa Sponsor</th>
                    <th className="text-left p-4 font-semibold">Salary</th>
                    <th className="text-left p-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map(job => (
                    <tr key={job.id} className="border-t hover:bg-gray-50">
                      <td className="p-4 font-medium">{job.company}</td>
                      <td className="p-4">{job.role}</td>
                      <td className="p-4 text-gray-600">{job.location || '-'}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(job.status)}`}>
                          {job.status}
                        </span>
                      </td>
                      <td className="p-4">
                        {job.sponsors_visa ? (
                          <span className="text-green-600 font-medium">✓ Yes</span>
                        ) : (
                          <span className="text-red-600 font-medium">✗ No</span>
                        )}
                      </td>
                      <td className="p-4 text-gray-600">{job.salary_range || '-'}</td>
                      <td className="p-4">
                        <button
                          onClick={() => handleDeleteJob(job.id)}
                          className="text-red-600 hover:text-red-800 font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {jobs.length > 0 && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              💡 <strong>Tip:</strong> {jobs.filter(j => j.sponsors_visa).length} out of {jobs.length} companies sponsor F-1 visas
            </p>
          </div>
        )}
      </div>

      <AddJobModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddJob}
      />
    </div>
  )
}

export default App