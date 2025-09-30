const express = require('express');
const cors = require('cors');
const pool = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

// Get all jobs
app.get('/api/jobs', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM jobs ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/jobs', async (req, res) => {
  try {
    const { company, role, location, salary_range, sponsors_visa, application_url, job_description, status, notes } = req.body;
    
    const result = await pool.query(
      `INSERT INTO jobs (company, role, location, salary_range, sponsors_visa, application_url, job_description, status, notes) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
       RETURNING *`,
      [company, role, location, salary_range, sponsors_visa, application_url, job_description, status || 'Applied', notes]
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
    const { company, role, location, salary_range, sponsors_visa, application_url, job_description, status, notes } = req.body;
    
    const result = await pool.query(
      `UPDATE jobs 
       SET company = $1, role = $2, location = $3, salary_range = $4, 
           sponsors_visa = $5, application_url = $6, job_description = $7, 
           status = $8, notes = $9, updated_at = NOW()
       WHERE id = $10
       RETURNING *`,
      [company, role, location, salary_range, sponsors_visa, application_url, job_description, status, notes, id]
    );
    
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
    await pool.query('DELETE FROM jobs WHERE id = $1', [id]);
    res.json({ message: 'Job deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});