const express = require('express');
const router = express.Router();

module.exports = (pool) => {
  // Get all users
  router.get('/', async (req, res) => {
    try {
      const [rows] = await pool.query('SELECT id, email, name, role, profile_picture, created_at FROM users');
      res.json(rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  // Get user by ID
  router.get('/:id', async (req, res) => {
    try {
      const [rows] = await pool.query(
        'SELECT id, email, name, role, profile_picture, created_at FROM users WHERE id = ?',
        [req.params.id]
      );

      if (rows.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json(rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  // Create new user (registration)
  router.post('/', async (req, res) => {
    const { email, password, name, role } = req.body;

    // Basic validation
    if (!email || !password || !name || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (role !== 'student' && role !== 'teacher') {
      return res.status(400).json({ message: 'Role must be either student or teacher' });
    }

    try {
      // Check if email already exists
      const [existingUsers] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
      if (existingUsers.length > 0) {
        return res.status(400).json({ message: 'Email already in use' });
      }

      // Insert new user
      const [result] = await pool.query(
        'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
        [email, password, name, role]
      );

      // Create corresponding profile
      if (role === 'student') {
        await pool.query(
          'INSERT INTO student_profiles (user_id) VALUES (?)',
          [result.insertId]
        );
      } else {
        await pool.query(
          'INSERT INTO teacher_profiles (user_id) VALUES (?)',
          [result.insertId]
        );
      }

      res.status(201).json({
        id: result.insertId,
        email,
        name,
        role
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  // Update user
  router.put('/:id', async (req, res) => {
    const { name, profile_picture } = req.body;
    const userId = req.params.id;

    try {
      const [userCheck] = await pool.query('SELECT id FROM users WHERE id = ?', [userId]);
      if (userCheck.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      await pool.query(
        'UPDATE users SET name = ?, profile_picture = ?, updated_at = NOW() WHERE id = ?',
        [name, profile_picture, userId]
      );

      res.json({ message: 'User updated successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  // Delete user
  router.delete('/:id', async (req, res) => {
    const userId = req.params.id;

    try {
      const [userCheck] = await pool.query('SELECT id FROM users WHERE id = ?', [userId]);
      if (userCheck.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      await pool.query('DELETE FROM users WHERE id = ?', [userId]);
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  // Login endpoint (simplified without authentication tokens)
  router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
      const [users] = await pool.query(
        'SELECT id, email, name, role FROM users WHERE email = ? AND password = ?',
        [email, password]
      );

      if (users.length === 0) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      res.json(users[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  return router;
};