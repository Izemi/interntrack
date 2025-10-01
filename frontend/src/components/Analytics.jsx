import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Analytics({ jobs }) {
  // Applications over time
  const getApplicationsOverTime = () => {
    const last30Days = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const count = jobs.filter(job => {
        const jobDate = new Date(job.applied_date).toISOString().split('T')[0];
        return jobDate === dateStr;
      }).length;
      
      last30Days.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        applications: count
      });
    }
    
    return last30Days;
  };

  // Status breakdown
  const getStatusBreakdown = () => {
    const statuses = ['Applied', 'Online Assessment', 'Phone Screen', 'Final Round', 'Offer', 'Rejected'];
    return statuses.map(status => ({
      name: status,
      count: jobs.filter(j => j.status === status).length
    })).filter(item => item.count > 0);
  };

  // Visa sponsorship pie chart
  const getVisaSponsorshipData = () => {
    const sponsors = jobs.filter(j => j.sponsors_visa).length;
    const noSponsors = jobs.length - sponsors;
    
    return [
      { name: 'Sponsors Visa', value: sponsors },
      { name: 'No Sponsorship', value: noSponsors }
    ];
  };

  const COLORS = {
    'Applied': '#3b82f6',
    'Online Assessment': '#a855f7',
    'Phone Screen': '#eab308',
    'Final Round': '#f97316',
    'Offer': '#22c55e',
    'Rejected': '#ef4444',
    'Sponsors Visa': '#22c55e',
    'No Sponsorship': '#ef4444'
  };

  const applicationsData = getApplicationsOverTime();
  const statusData = getStatusBreakdown();
  const visaData = getVisaSponsorshipData();

  if (jobs.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
        <p>Add some applications to see analytics</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Applications Over Time */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold mb-4">Applications Over Last 30 Days</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={applicationsData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="applications" stroke="#3b82f6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status Breakdown */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold mb-4">Applications by Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count">
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Visa Sponsorship */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold mb-4">Visa Sponsorship</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={visaData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {visaData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Key Insights */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold mb-4">Key Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Average Response Rate</p>
            <p className="text-2xl font-bold text-blue-600">
              {jobs.length > 0 
                ? Math.round((jobs.filter(j => j.status !== 'Applied').length / jobs.length) * 100)
                : 0}%
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Interview Rate</p>
            <p className="text-2xl font-bold text-green-600">
              {jobs.length > 0
                ? Math.round((jobs.filter(j => ['Phone Screen', 'Final Round', 'Online Assessment'].includes(j.status)).length / jobs.length) * 100)
                : 0}%
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Offer Rate</p>
            <p className="text-2xl font-bold text-purple-600">
              {jobs.length > 0
                ? Math.round((jobs.filter(j => j.status === 'Offer').length / jobs.length) * 100)
                : 0}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}