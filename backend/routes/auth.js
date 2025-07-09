import express from 'express';
import jwt from 'jsonwebtoken';
import { query } from '../db/index.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  const { userId } = req.body;
  
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const result = await query(
      'SELECT id, name, organisation_id FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    const token = jwt.sign(
      { userId: user.id, organisationId: user.organisation_id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, user });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.get('/users', async (req, res) => {
  try {
    const result = await query(
      `SELECT u.id, u.name, o.name as organisation_name 
       FROM users u 
       JOIN organisation o ON u.organisation_id = o.id
       ORDER BY u.name`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

export default router;
