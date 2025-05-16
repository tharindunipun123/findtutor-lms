const express = require('express');
const router = express.Router();

module.exports = (pool) => {
  // Get all subjects
  router.get('/', async (req, res) => {
    try {
      const [rows] = await pool.query('SELECT * FROM subjects ORDER BY name ASC');
      res.json(rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  // Get subject by ID
  router.get('/:id', async (req, res) => {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM subjects WHERE id = ?',
        [req.params.id]
      );

      if (rows.length === 0) {
        return res.status(404).json({ message: 'Subject not found' });
      }

      res.json(rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  // Create a new subject
  router.post('/', async (req, res) => {
    const { name } = req.body;

    // Basic validation
    if (!name) {
      return res.status(400).json({ message: 'Subject name is required' });
    }

    try {
      // Check if subject already exists
      const [existingSubjects] = await pool.query(
        'SELECT id FROM subjects WHERE name = ?',
        [name]
      );

      if (existingSubjects.length > 0) {
        return res.status(400).json({ message: 'Subject already exists' });
      }

      // Insert new subject
      const [result] = await pool.query(
        'INSERT INTO subjects (name) VALUES (?)',
        [name]
      );

      res.status(201).json({
        id: result.insertId,
        name
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  // Update a subject
  router.put('/:id', async (req, res) => {
    const subjectId = req.params.id;
    const { name } = req.body;

    // Basic validation
    if (!name) {
      return res.status(400).json({ message: 'Subject name is required' });
    }

    try {
      // Check if subject exists
      const [subjectCheck] = await pool.query(
        'SELECT id FROM subjects WHERE id = ?',
        [subjectId]
      );

      if (subjectCheck.length === 0) {
        return res.status(404).json({ message: 'Subject not found' });
      }

      // Check if name already exists for another subject
      const [nameCheck] = await pool.query(
        'SELECT id FROM subjects WHERE name = ? AND id != ?',
        [name, subjectId]
      );

      if (nameCheck.length > 0) {
        return res.status(400).json({ message: 'Subject name already exists' });
      }

      // Update the subject
      await pool.query(
        'UPDATE subjects SET name = ? WHERE id = ?',
        [name, subjectId]
      );

      res.json({ message: 'Subject updated successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  // Delete a subject
  router.delete('/:id', async (req, res) => {
    const subjectId = req.params.id;

    try {
      // Check if subject exists
      const [subjectCheck] = await pool.query(
        'SELECT id FROM subjects WHERE id = ?',
        [subjectId]
      );

      if (subjectCheck.length === 0) {
        return res.status(404).json({ message: 'Subject not found' });
      }

      // Check if subject is in use
      const [inUseCheck] = await pool.query(
        'SELECT id FROM classes WHERE subject_id = ? LIMIT 1',
        [subjectId]
      );

      if (inUseCheck.length > 0) {
        return res.status(400).json({ message: 'Cannot delete subject that is in use by classes' });
      }

      // Delete the subject
      await pool.query(
        'DELETE FROM subjects WHERE id = ?',
        [subjectId]
      );

      res.json({ message: 'Subject deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  // Get teachers by subject
  router.get('/:id/teachers', async (req, res) => {
    const subjectId = req.params.id;

    try {
      // Check if subject exists
      const [subjectCheck] = await pool.query(
        'SELECT id FROM subjects WHERE id = ?',
        [subjectId]
      );

      if (subjectCheck.length === 0) {
        return res.status(404).json({ message: 'Subject not found' });
      }

      // Get teachers
      const [rows] = await pool.query(`
        SELECT 
          u.id as user_id, 
          u.name, 
          u.profile_picture,
          tp.id as teacher_id,
          tp.bio, 
          tp.years_experience, 
          tp.education, 
          tp.hourly_rate,
          tp.location,
          tp.lat,
          tp.lng,
          tp.is_subscribed
        FROM users u
        JOIN teacher_profiles tp ON u.id = tp.user_id
        JOIN teacher_subjects ts ON tp.id = ts.teacher_id
        WHERE ts.subject_id = ? AND u.role = 'teacher'
      `, [subjectId]);

      res.json(rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  // Get classes by subject
  router.get('/:id/classes', async (req, res) => {
    const subjectId = req.params.id;

    try {
      // Check if subject exists
      const [subjectCheck] = await pool.query(
        'SELECT id FROM subjects WHERE id = ?',
        [subjectId]
      );

      if (subjectCheck.length === 0) {
        return res.status(404).json({ message: 'Subject not found' });
      }

      // Get classes
      const [rows] = await pool.query(`
        SELECT 
          c.id, 
          c.title, 
          c.description, 
          c.price,
          c.location,
          c.lat,
          c.lng,
          c.is_online,
          c.created_at,
          tp.id as teacher_id,
          u.id as user_id,
          u.name as teacher_name,
          u.profile_picture as teacher_profile_picture
        FROM classes c
        JOIN teacher_profiles tp ON c.teacher_id = tp.id
        JOIN users u ON tp.user_id = u.id
        WHERE c.subject_id = ?
        ORDER BY c.created_at DESC
      `, [subjectId]);

      res.json(rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  return router;
};