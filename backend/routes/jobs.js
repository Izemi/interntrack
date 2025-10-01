const express = require('express');
const pool = require('../db');
const auth = require('../middleware/auth');
const { sendVisaSponsorAlert } = require('../services/emailService');

const router = express.Router();

// Get all jobs for user
router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM jobs WHERE user_id = $1 ORDER BY applied_date DESC',
      [req.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create job
router.post('/', auth, async (req, res) => {
  try {
    const {
      company,
      role,
      location,
      salary_range,
      sponsors_visa,
      application_url,
      status,
      notes,
      deadline
    } = req.body;

    const result = await pool.query(
      `INSERT INTO jobs (
        user_id, company, role, location, salary_range, 
        sponsors_visa, application_url, status, notes, deadline
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
      RETURNING *`,
      [req.userId, company, role, location, salary_range, sponsors_visa, application_url, status || 'Applied', notes, deadline]
    );

    const job = result.rows[0];

    // Send visa sponsor alert if applicable (don't wait for it)
    if (sponsors_visa) {
      const userResult = await pool.query('SELECT email FROM users WHERE id = $1', [req.userId]);
      if (userResult.rows.length > 0) {
        sendVisaSponsorAlert(userResult.rows[0].email, job).catch(err => 
          console.error('Failed to send visa sponsor alert:', err)
        );
      }
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update job
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      company,
      role,
      location,
      salary_range,
      sponsors_visa,
      application_url,
      status,
      notes,
      deadline
    } = req.body;

    const result = await pool.query(
      `UPDATE jobs SET 
        company = $1, role = $2, location = $3, salary_range = $4,
        sponsors_visa = $5, application_url = $6, status = $7, notes = $8, deadline = $9
      WHERE id = $10 AND user_id = $11 RETURNING *`,
      [company, role, location, salary_range, sponsors_visa, application_url, status, notes, deadline, id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete job
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM jobs WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json({ message: 'Job deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;