import express from 'express';
import { query } from '../db/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get tickets for user's organization
router.get('/tickets', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      `SELECT t.id, t.title, t.description, t.status, t.created_at, 
              u.name as user_name, o.name as organisation_name
       FROM tickets t
       JOIN users u ON t.user_id = u.id
       JOIN organisation o ON t.organisation_id = o.id
       WHERE t.organisation_id = $1
       ORDER BY t.created_at DESC`,
      [req.user.organisation_id]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

router.post('/tickets', authenticateToken, async (req, res) => {
  const { title, description } = req.body;
  
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  try {
    const result = await query(
      `INSERT INTO tickets (title, description, user_id, organisation_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id, title, description, status, created_at`,
      [title, description, req.user.id, req.user.organisation_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ error: 'Failed to create ticket' });
  }
});

router.patch('/tickets/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  try {
    const result = await query(
      `UPDATE tickets SET status = $1 
       WHERE id = $2 AND organisation_id = $3
       RETURNING id, title, description, status, created_at`,
      [status, id, req.user.organisation_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating ticket:', error);
    res.status(500).json({ error: 'Failed to update ticket' });
  }
});

router.delete('/tickets/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await query(
      'DELETE FROM tickets WHERE id = $1 AND organisation_id = $2',
      [id, req.user.organisation_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting ticket:', error);
    res.status(500).json({ error: 'Failed to delete ticket' });
  }
});

export default router;
