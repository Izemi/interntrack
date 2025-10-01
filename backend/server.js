const express = require('express');
const cors = require('cors');
const pool = require('./db');
const authRoutes = require('./routes/auth');
const authMiddleware = require('./middleware/auth');
const cron = require('node-cron');
const { checkAndSendReminders } = require('./services/emailService');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Auth routes (public)
app.use('/api/auth', authRoutes);

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

// Protected routes - all routes below require authentication
app.use(authMiddleware);

// Get all jobs for logged-in user
app.get('/api/jobs', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM jobs WHERE user_id = $1 ORDER BY created_at DESC',
      [req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new job
app.post('/api/jobs', async (req, res) => {
  try {
    const { company, role, location, salary_range, sponsors_visa, application_url, job_description, status, notes, deadline } = req.body;
    
    const result = await pool.query(
      `INSERT INTO jobs (company, role, location, salary_range, sponsors_visa, application_url, job_description, status, notes, deadline, user_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
       RETURNING *`,
      [company, role, location, salary_range, sponsors_visa, application_url, job_description, status || 'Applied', notes, deadline, req.userId]
    );
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update job
app.put('/api/jobs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { company, role, location, salary_range, sponsors_visa, application_url, job_description, status, notes, deadline } = req.body;
    
    const result = await pool.query(
      `UPDATE jobs 
       SET company = $1, role = $2, location = $3, salary_range = $4, 
           sponsors_visa = $5, application_url = $6, job_description = $7, 
           status = $8, notes = $9, deadline = $10, updated_at = NOW()
       WHERE id = $11 AND user_id = $12
       RETURNING *`,
      [company, role, location, salary_range, sponsors_visa, application_url, job_description, status, notes, deadline, id, req.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Job not found or unauthorized' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete job
app.delete('/api/jobs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM jobs WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Job not found or unauthorized' });
    }
    
    res.json({ message: 'Job deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get activity log for a job
app.get('/api/jobs/:id/activities', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verify job belongs to user
    const jobCheck = await pool.query(
      'SELECT * FROM jobs WHERE id = $1 AND user_id = $2',
      [id, req.userId]
    );
    
    if (jobCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Job not found or unauthorized' });
    }
    
    const result = await pool.query(
      'SELECT * FROM activity_log WHERE job_id = $1 ORDER BY created_at DESC',
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add activity to a job
app.post('/api/jobs/:id/activities', async (req, res) => {
  try {
    const { id } = req.params;
    const { activity_type, note } = req.body;
    
    // Verify job belongs to user
    const jobCheck = await pool.query(
      'SELECT * FROM jobs WHERE id = $1 AND user_id = $2',
      [id, req.userId]
    );
    
    if (jobCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Job not found or unauthorized' });
    }
    
    const result = await pool.query(
      'INSERT INTO activity_log (job_id, activity_type, note, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [id, activity_type, note, req.userId]
    );
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Run deadline check every day at 9 AM
cron.schedule('0 9 * * *', () => {
  console.log('Running daily deadline reminder check');
  checkAndSendReminders();
});

// Run immediately on startup for testing (remove in production)
if (process.env.NODE_ENV !== 'production') {
  setTimeout(() => {
    console.log('Running initial deadline check...');
    checkAndSendReminders();
  }, 5000);
}
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});