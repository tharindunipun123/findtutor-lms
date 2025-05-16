const express = require('express');
const router = express.Router();

module.exports = (pool) => {
  // Get all classes
  router.get('/', async (req, res) => {
    try {
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
          c.updated_at,
          s.id as subject_id,
          s.name as subject_name,
          tp.id as teacher_id,
          u.id as user_id,
          u.name as teacher_name,
          u.profile_picture as teacher_profile_picture
        FROM classes c
        JOIN subjects s ON c.subject_id = s.id
        JOIN teacher_profiles tp ON c.teacher_id = tp.id
        JOIN users u ON tp.user_id = u.id
        ORDER BY c.created_at DESC
      `);
      
      res.json(rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  // Get class by ID
  router.get('/:id', async (req, res) => {
    try {
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
          c.updated_at,
          s.id as subject_id,
          s.name as subject_name,
          tp.id as teacher_id,
          u.id as user_id,
          u.name as teacher_name,
          u.profile_picture as teacher_profile_picture,
          tp.bio as teacher_bio,
          tp.years_experience,
          tp.education,
          tp.hourly_rate
        FROM classes c
        JOIN subjects s ON c.subject_id = s.id
        JOIN teacher_profiles tp ON c.teacher_id = tp.id
        JOIN users u ON tp.user_id = u.id
        WHERE c.id = ?
      `, [req.params.id]);

      if (rows.length === 0) {
        return res.status(404).json({ message: 'Class not found' });
      }

      res.json(rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  // Create a new class
  router.post('/', async (req, res) => {
    const {
      teacher_id,
      title,
      subject_id,
      description,
      price,
      location,
      lat,
      lng,
      is_online
    } = req.body;

    // Basic validation
    if (!teacher_id || !title || !subject_id || !price) {
      return res.status(400).json({ message: 'Required fields missing' });
    }

    try {
      // Check if teacher exists
      const [teacherCheck] = await pool.query(
        'SELECT id FROM teacher_profiles WHERE id = ?',
        [teacher_id]
      );

      if (teacherCheck.length === 0) {
        return res.status(404).json({ message: 'Teacher not found' });
      }

      // Check if subject exists
      const [subjectCheck] = await pool.query(
        'SELECT id FROM subjects WHERE id = ?',
        [subject_id]
      );

      if (subjectCheck.length === 0) {
        return res.status(404).json({ message: 'Subject not found' });
      }

      // Insert the class
      const [result] = await pool.query(`
        INSERT INTO classes (
          teacher_id,
          title,
          subject_id,
          description,
          price,
          location,
          lat,
          lng,
          is_online
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        teacher_id,
        title,
        subject_id,
        description,
        price,
        location,
        lat,
        lng,
        is_online || false
      ]);

      res.status(201).json({
        id: result.insertId,
        teacher_id,
        title,
        subject_id,
        description,
        price,
        location,
        lat,
        lng,
        is_online: is_online || false
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  // Update a class
  router.put('/:id', async (req, res) => {
    const classId = req.params.id;
    const {
      title,
      subject_id,
      description,
      price,
      location,
      lat,
      lng,
      is_online
    } = req.body;

    try {
      // Check if class exists
      const [classCheck] = await pool.query(
        'SELECT id, teacher_id FROM classes WHERE id = ?',
        [classId]
      );

      if (classCheck.length === 0) {
        return res.status(404).json({ message: 'Class not found' });
      }

      // Check if subject exists if provided
      if (subject_id) {
        const [subjectCheck] = await pool.query(
          'SELECT id FROM subjects WHERE id = ?',
          [subject_id]
        );

        if (subjectCheck.length === 0) {
          return res.status(404).json({ message: 'Subject not found' });
        }
      }

      // Update the class
      await pool.query(`
        UPDATE classes
        SET
          title = COALESCE(?, title),
          subject_id = COALESCE(?, subject_id),
          description = COALESCE(?, description),
          price = COALESCE(?, price),
          location = COALESCE(?, location),
          lat = COALESCE(?, lat),
          lng = COALESCE(?, lng),
          is_online = COALESCE(?, is_online),
          updated_at = NOW()
        WHERE id = ?
      `, [
        title,
        subject_id,
        description,
        price,
        location,
        lat,
        lng,
        is_online,
        classId
      ]);

      res.json({ message: 'Class updated successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  // Delete a class
  router.delete('/:id', async (req, res) => {
    const classId = req.params.id;

    try {
      // Check if class exists
      const [classCheck] = await pool.query(
        'SELECT id FROM classes WHERE id = ?',
        [classId]
      );

      if (classCheck.length === 0) {
        return res.status(404).json({ message: 'Class not found' });
      }

      // Delete the class
      await pool.query('DELETE FROM classes WHERE id = ?', [classId]);

      res.json({ message: 'Class deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  // Search classes
  router.get('/search', async (req, res) => {
    try {
      const { subject, location, min_price, max_price, online_only } = req.query;
      
      let query = `
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
          s.id as subject_id,
          s.name as subject_name,
          tp.id as teacher_id,
          u.id as user_id,
          u.name as teacher_name,
          u.profile_picture as teacher_profile_picture
        FROM classes c
        JOIN subjects s ON c.subject_id = s.id
        JOIN teacher_profiles tp ON c.teacher_id = tp.id
        JOIN users u ON tp.user_id = u.id
        WHERE 1=1
      `;
      
      const params = [];
      
      if (subject) {
        query += ` AND (s.name LIKE ? OR c.title LIKE ?)`;
        params.push(`%${subject}%`, `%${subject}%`);
      }
      
      if (location) {
        query += ` AND c.location LIKE ?`;
        params.push(`%${location}%`);
      }
      
      if (min_price) {
        query += ` AND c.price >= ?`;
        params.push(min_price);
      }
      
      if (max_price) {
        query += ` AND c.price <= ?`;
        params.push(max_price);
      }
      
      if (online_only === 'true') {
        query += ` AND c.is_online = true`;
      }
      
      query += ` ORDER BY c.created_at DESC`;
      
      const [rows] = await pool.query(query, params);
      res.json(rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  return router;
};