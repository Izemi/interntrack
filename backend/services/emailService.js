const { Resend } = require('resend');
const pool = require('../db');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendWelcomeEmail = async (userEmail, userName) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'InternTrack <onboarding@resend.dev>',
      to: [userEmail],
      subject: 'Welcome to InternTrack!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Welcome to InternTrack!</h2>
          <p>Hi ${userName || 'there'},</p>
          <p>Thanks for signing up! We're excited to help you track your internship applications and land your dream role.</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Getting Started</h3>
            <ul style="line-height: 1.8;">
              <li>Add your first application using the "+ Add Application" button</li>
              <li>Track your progress with status updates and activity timeline</li>
              <li>Set deadlines to receive automatic email reminders</li>
              <li>View analytics to monitor your application trends</li>
              <li>Export your data anytime as CSV</li>
            </ul>
          </div>

          <p><a href="https://interntrack.example.com" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Go to Dashboard</a></p>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            Good luck with your internship search! We'll send you email reminders when your application deadlines are approaching.
          </p>
        </div>
      `
    });

    if (error) {
      console.error('Error sending welcome email:', error);
      return false;
    }

    console.log('Welcome email sent successfully:', data);
    return true;
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    return false;
  }
};

const sendVisaSponsorAlert = async (userEmail, job) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'InternTrack <onboarding@resend.dev>',
      to: [userEmail],
      subject: `New Visa Sponsor Found: ${job.company}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #22c55e;">Great News - Visa Sponsor Found!</h2>
          <p>You just added an application to a company that sponsors visas.</p>
          
          <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #22c55e;">
            <h3 style="margin-top: 0; color: #22c55e;">✓ ${job.company}</h3>
            <p style="margin: 5px 0;"><strong>Role:</strong> ${job.role}</p>
            <p style="margin: 5px 0;"><strong>Location:</strong> ${job.location || 'Not specified'}</p>
            <p style="margin: 5px 0;"><strong>Status:</strong> ${job.status}</p>
            ${job.salary_range ? `<p style="margin: 5px 0;"><strong>Salary Range:</strong> ${job.salary_range}</p>` : ''}
          </div>

          <p>This company sponsors work visas, which is great news if you need sponsorship!</p>

          ${job.application_url ? `<p><a href="${job.application_url}" style="background-color: #22c55e; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View Application</a></p>` : ''}
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            Keep tracking your applications and good luck with your search!
          </p>
        </div>
      `
    });

    if (error) {
      console.error('Error sending visa sponsor alert:', error);
      return false;
    }

    console.log('Visa sponsor alert sent successfully:', data);
    return true;
  } catch (error) {
    console.error('Failed to send visa sponsor alert:', error);
    return false;
  }
};

const sendDeadlineReminder = async (userEmail, job, daysUntil) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'InternTrack <onboarding@resend.dev>',
      to: [userEmail],
      subject: `Reminder: ${job.company} deadline in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Application Deadline Reminder</h2>
          <p>Hi there,</p>
          <p>This is a friendly reminder that your application deadline is approaching:</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">${job.company}</h3>
            <p style="margin: 5px 0;"><strong>Role:</strong> ${job.role}</p>
            <p style="margin: 5px 0;"><strong>Location:</strong> ${job.location || 'Not specified'}</p>
            <p style="margin: 5px 0;"><strong>Deadline:</strong> ${new Date(job.deadline).toLocaleDateString()}</p>
            <p style="margin: 5px 0;"><strong>Days until deadline:</strong> <span style="color: ${daysUntil <= 1 ? '#dc2626' : '#ea580c'}; font-weight: bold;">${daysUntil}</span></p>
          </div>

          ${job.application_url ? `<p><a href="${job.application_url}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View Application</a></p>` : ''}
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            This is an automated reminder from InternTrack. You're receiving this because you set a deadline for this application.
          </p>
        </div>
      `
    });

    if (error) {
      console.error('Error sending email:', error);
      return false;
    }

    console.log('Email sent successfully:', data);
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
};

const checkAndSendReminders = async () => {
  try {
    console.log('Checking for upcoming deadlines...');
    
    // Updated query to send reminders for "Planning to Apply" status
    // but NOT for "Applied", "Offer", or "Rejected"
    const query = `
      SELECT j.*, u.email 
      FROM jobs j
      JOIN users u ON j.user_id = u.id
      WHERE j.deadline IS NOT NULL 
        AND j.deadline >= CURRENT_DATE 
        AND j.deadline <= CURRENT_DATE + INTERVAL '3 days'
        AND j.status NOT IN ('Applied', 'Offer', 'Rejected')
    `;
    
    const result = await pool.query(query);
    
    for (const job of result.rows) {
      const deadline = new Date(job.deadline);
      const today = new Date();
      const daysUntil = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
      
      if (daysUntil <= 3 && daysUntil >= 0) {
        console.log(`Sending reminder for ${job.company} to ${job.email} (${daysUntil} days until deadline)`);
        await sendDeadlineReminder(job.email, job, daysUntil);
      }
    }
    
    console.log(`Processed ${result.rows.length} jobs with upcoming deadlines`);
  } catch (error) {
    console.error('Error checking reminders:', error);
  }
};

module.exports = {
  sendWelcomeEmail,
  sendVisaSponsorAlert,
  sendDeadlineReminder,
  checkAndSendReminders
};