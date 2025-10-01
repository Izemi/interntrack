export default function Settings({ user }) {
    return (
      <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
        <h2 className="text-2xl font-bold mb-6">Settings</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Account Information</h3>
            <div className="space-y-2">
              <div>
                <span className="text-sm text-gray-600">Name:</span>
                <p className="font-medium">{user.name || 'Not set'}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Email:</span>
                <p className="font-medium">{user.email}</p>
              </div>
            </div>
          </div>
  
          <div>
            <h3 className="text-lg font-semibold mb-2">Email Notifications</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Deadline Reminders:</strong> You'll receive email reminders for application deadlines 3 days, 1 day, and on the day of the deadline.
              </p>
            </div>
          </div>
  
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">
              More settings coming soon: notification preferences, theme customization, and more.
            </p>
          </div>
        </div>
      </div>
    );
  }