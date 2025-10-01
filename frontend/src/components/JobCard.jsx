export default function JobCard({ job, onEdit, onDelete, onTimeline, onStatusUpdate, getStatusColor, getDaysAgo, getDeadlineWarning }) {
    return (
      <div className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-bold text-lg">{job.company}</h3>
            <p className="text-gray-600">{job.role}</p>
          </div>
          <select
            value={job.status}
            onChange={(e) => onStatusUpdate(job.id, e.target.value)}
            className={`px-2 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${getStatusColor(job.status)}`}
          >
            <option>Applied</option>
            <option>Online Assessment</option>
            <option>Phone Screen</option>
            <option>Final Round</option>
            <option>Offer</option>
            <option>Rejected</option>
          </select>
        </div>
  
        {/* Details */}
        <div className="space-y-2 mb-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Location:</span>
            <span className="font-medium">{job.location || '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Applied:</span>
            <span className="font-medium">{getDaysAgo(job.applied_date)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Visa Sponsor:</span>
            <span className={job.sponsors_visa ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
              {job.sponsors_visa ? '✓ Yes' : '✗ No'}
            </span>
          </div>
          {job.salary_range && (
            <div className="flex justify-between">
              <span className="text-gray-600">Salary:</span>
              <span className="font-medium">{job.salary_range}</span>
            </div>
          )}
          {job.deadline && (
            <div className="flex justify-between">
              <span className="text-gray-600">Deadline:</span>
              <span className={getDeadlineWarning(job.deadline)?.color}>
                {getDeadlineWarning(job.deadline)?.text}
              </span>
            </div>
          )}
        </div>
  
        {/* Research Links */}
        <div className="flex gap-3 mb-3 pb-3 border-b">
          <a
            href={`https://www.glassdoor.com/Search/results.htm?keyword=${encodeURIComponent(job.company)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 text-sm"
            title="Glassdoor"
          >
            💼 Glassdoor
          </a>
          <a
            href={`https://www.linkedin.com/search/results/companies/?keywords=${encodeURIComponent(job.company)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 text-sm"
            title="LinkedIn"
          >
            💻 LinkedIn
          </a>
          <a
            href={`https://www.levels.fyi/companies/${encodeURIComponent(job.company.toLowerCase().replace(/\s+/g, '-'))}/salaries`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 text-sm"
            title="Levels.fyi"
          >
            💰 Levels
          </a>
        </div>
  
        {/* Actions */}
        <div className="flex gap-3 text-sm">
          <button
            onClick={() => onTimeline(job)}
            className="text-purple-600 hover:text-purple-800"
          >
            Timeline
          </button>
          <button
            onClick={() => onEdit(job)}
            className="text-blue-600 hover:text-blue-800"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(job.id)}
            className="text-red-600 hover:text-red-800"
          >
            Delete
          </button>
        </div>
      </div>
    );
  }
  