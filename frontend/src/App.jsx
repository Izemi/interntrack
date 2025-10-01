import { useState, useEffect } from 'react'
import AddJobModal from './components/AddJobModal'
import ActivityTimeline from './components/ActivityTimeline'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

function App() {
  const [jobs, setJobs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingJob, setEditingJob] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [visaFilter, setVisaFilter] = useState('All');
  const [sortBy, setSortBy] = useState('date');
  const [timelineJob, setTimelineJob] = useState(null);

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

  const handleEditJob = (job) => {
    setEditingJob(job);
  };

  const handleUpdateJob = async (jobData) => {
    try {
      await axios.put(`${API_URL}/jobs/${editingJob.id}`, jobData);
      setEditingJob(null);
      fetchJobs();
    } catch (error) {
      console.error('Error updating job:', error);
    }
  };

  const handleQuickStatusUpdate = async (jobId, newStatus) => {
    try {
      const job = jobs.find(j => j.id === jobId);
      if (!job) return;
      await axios.put(`${API_URL}/jobs/${jobId}`, { ...job, status: newStatus });
      fetchJobs();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Company', 'Role', 'Location', 'Status', 'Applied Date', 'Deadline', 'Visa Sponsor', 'Salary Range', 'Notes'];
    
    const csvData = jobs.map(job => [
      job.company,
      job.role,
      job.location || '',
      job.status,
      job.applied_date ? new Date(job.applied_date).toLocaleDateString() : '',
      job.deadline ? new Date(job.deadline).toLocaleDateString() : '',
      job.sponsors_visa ? 'Yes' : 'No',
      job.salary_range || '',
      job.notes || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `interntrack-applications-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
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

  const getDaysAgo = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date)) return '-';
    const today = new Date();
    const diffTime = Math.abs(today - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  const getDeadlineWarning = (deadline) => {
    if (!deadline) return null;
    
    const deadlineDate = new Date(deadline);
    if (isNaN(deadlineDate)) return null;

    const today = new Date();
    const daysUntil = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntil < 0) return { text: 'Expired', color: 'text-red-600' };
    if (daysUntil === 0) return { text: 'Today!', color: 'text-red-600 font-bold' };
    if (daysUntil <= 3) return { text: `${daysUntil}d left`, color: 'text-orange-600 font-semibold' };
    if (daysUntil <= 7) return { text: `${daysUntil}d left`, color: 'text-yellow-600' };
    return { text: `${daysUntil}d left`, color: 'text-gray-600' };
  };

  const stats = {
    total: jobs.length,
    applied: jobs.filter(j => j.status === 'Applied').length,
    interviews: jobs.filter(j => ['Phone Screen', 'Final Round', 'Online Assessment'].includes(j.status)).length,
    offers: jobs.filter(j => j.status === 'Offer').length,
    rejected: jobs.filter(j => j.status === 'Rejected').length,
    responseRate: jobs.length > 0 ? Math.round((jobs.filter(j => j.status !== 'Applied').length / jobs.length) * 100) : 0,
    sponsorsVisa: jobs.filter(j => j.sponsors_visa).length
  };

  let filteredJobs = jobs.filter(job => {
    const matchesSearch = job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || job.status === statusFilter;
    const matchesVisa = visaFilter === 'All' || 
                       (visaFilter === 'Sponsors' && job.sponsors_visa) ||
                       (visaFilter === 'No Sponsor' && !job.sponsors_visa);
    
    return matchesSearch && matchesStatus && matchesVisa;
  });

  filteredJobs = [...filteredJobs].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.applied_date) - new Date(a.applied_date);
    } else if (sortBy === 'company') {
      return a.company.localeCompare(b.company);
    } else if (sortBy === 'status') {
      return a.status.localeCompare(b.status);
    }
    return 0;
  });

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
            <h1 className="text-4xl font-bold text-gray-800">InternTrack</h1>
            <p className="text-gray-600 mt-1">Track your internship applications with visa sponsorship insights</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExportCSV}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-medium"
            >
              Export CSV
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
            >
              + Add Application
            </button>
          </div>
        </div>

        {jobs.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-600">Total Applications</div>
              <div className="text-3xl font-bold text-gray-800">{stats.total}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-600">Interviews</div>
              <div className="text-3xl font-bold text-yellow-600">{stats.interviews}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-600">Response Rate</div>
              <div className="text-3xl font-bold text-blue-600">{stats.responseRate}%</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-600">Visa Sponsors</div>
              <div className="text-3xl font-bold text-green-600">{stats.sponsorsVisa}</div>
            </div>
          </div>
        )}

        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Search</label>
              <input
                type="text"
                placeholder="Search by company or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border rounded p-2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full border rounded p-2"
              >
                <option>All</option>
                <option>Applied</option>
                <option>Online Assessment</option>
                <option>Phone Screen</option>
                <option>Final Round</option>
                <option>Offer</option>
                <option>Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Visa Sponsorship</label>
              <select
                value={visaFilter}
                onChange={(e) => setVisaFilter(e.target.value)}
                className="w-full border rounded p-2"
              >
                <option>All</option>
                <option>Sponsors</option>
                <option>No Sponsor</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full border rounded p-2"
              >
                <option value="date">Date Applied</option>
                <option value="company">Company</option>
                <option value="status">Status</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow">
          {filteredJobs.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <p className="text-xl mb-2">
                {jobs.length === 0 ? 'No applications yet!' : 'No applications match your filters'}
              </p>
              <p>
                {jobs.length === 0 
                  ? 'Click "Add Application" to track your first internship application.'
                  : 'Try adjusting your search or filters'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-4 font-semibold">Company</th>
                    <th className="text-left p-4 font-semibold">Research</th>
                    <th className="text-left p-4 font-semibold">Role</th>
                    <th className="text-left p-4 font-semibold">Location</th>
                    <th className="text-left p-4 font-semibold">Applied</th>
                    <th className="text-left p-4 font-semibold">Status</th>
                    <th className="text-left p-4 font-semibold">Visa Sponsor</th>
                    <th className="text-left p-4 font-semibold">Salary</th>
                    <th className="text-left p-4 font-semibold">Deadline</th>
                    <th className="text-left p-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredJobs.map(job => (
                    <tr key={job.id} className="border-t hover:bg-gray-50">
                      <td className="p-4 font-medium">{job.company}</td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <a
                            href={`https://www.glassdoor.com/Search/results.htm?keyword=${encodeURIComponent(job.company)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-xs"
                            title="Glassdoor"
                          >
                            💼
                          </a>
                          <a
                            href={`https://www.linkedin.com/search/results/companies/?keywords=${encodeURIComponent(job.company)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-xs"
                            title="LinkedIn"
                          >
                            💻
                          </a>
                          <a
                            href={`https://www.levels.fyi/companies/${encodeURIComponent(job.company.toLowerCase().replace(/\s+/g, '-'))}/salaries`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-xs"
                            title="Levels.fyi"
                          >
                            💰
                          </a>
                        </div>
                      </td>
                      <td className="p-4">{job.role}</td>
                      <td className="p-4 text-gray-600">{job.location || '-'}</td>
                      <td className="p-4 text-gray-600 text-sm">{getDaysAgo(job.applied_date)}</td>
                      <td className="p-4">
                        <select
                          value={job.status}
                          onChange={(e) => handleQuickStatusUpdate(job.id, e.target.value)}
                          className={`px-3 py-1 rounded-full text-sm font-medium border-0 cursor-pointer ${getStatusColor(job.status)}`}
                        >
                          <option>Applied</option>
                          <option>Online Assessment</option>
                          <option>Phone Screen</option>
                          <option>Final Round</option>
                          <option>Offer</option>
                          <option>Rejected</option>
                        </select>
                      </td>
                      <td className="p-4">
                        {job.sponsors_visa ? (
                          <span className="text-green-600 font-medium">✓ Yes</span>
                        ) : (
                          <span className="text-red-600 font-medium">✗ No</span>
                        )}
                      </td>
                      <td className="p-4 text-gray-600">{job.salary_range || '-'}</td>
                      <td className="p-4 text-sm">
                        {job.deadline ? (
                          <span className={getDeadlineWarning(job.deadline)?.color}>
                            {getDeadlineWarning(job.deadline)?.text}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-3">
                          <button
                            onClick={() => setTimelineJob(job)}
                            className="text-purple-600 hover:text-purple-800 text-sm"
                          >
                            Timeline
                          </button>
                          <button
                            onClick={() => handleEditJob(job)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteJob(job.id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {jobs.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Tip:</strong> Showing {filteredJobs.length} of {stats.total} applications
              </p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">
                <strong>{stats.sponsorsVisa}</strong> companies sponsor F-1 visas ({Math.round((stats.sponsorsVisa / stats.total) * 100)}%)
              </p>
            </div>
          </div>
        )}
      </div>

      <AddJobModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddJob}
      />

      <AddJobModal 
        isOpen={!!editingJob}
        onClose={() => setEditingJob(null)}
        onAdd={handleUpdateJob}
        initialData={editingJob}
        isEditing={true}
      />

      <ActivityTimeline
        jobId={timelineJob?.id}
        isOpen={!!timelineJob}
        onClose={() => setTimelineJob(null)}
        companyName={timelineJob?.company}
      />
    </div>
  )
}

export default App
