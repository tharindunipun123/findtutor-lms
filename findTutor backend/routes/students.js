const express = require('express');
const router = express.Router();

module.exports = (pool) => {
  // Get all students (basic info)
  router.get('/', async (req, res) => {
    try {
      const [rows] = await pool.query(`
        SELECT 
          u.id as user_id, 
          u.name, 
          u.profile_picture,
          sp.id as student_id,
          sp.bio, 
          sp.education_level, 
          sp.location
        FROM users u
        JOIN student_profiles sp ON u.id = sp.user_id
        WHERE u.role = 'student'
      `);
      
      res.json(rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  // Get student by ID
  router.get('/:id', async (req, res) => {
    try {
      const [studentRows] = await pool.query(`
        SELECT 
          u.id as user_id, 
          u.name, 
          u.email,
          u.profile_picture,
          sp.id as student_id,
          sp.bio, 
          sp.education_level, 
          sp.location
        FROM users u
        JOIN student_profiles sp ON u.id = sp.user_id
        WHERE sp.id = ? AND u.role = 'student'
      `, [req.params.id]);

      if (studentRows.length === 0) {
        return res.status(404).json({ message: 'Student not found' });
      }

      res.json(studentRows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  // Update student profile
  router.put('/:id', async (req, res) => {
    const studentId = req.params.id;
    const { bio, education_level, location } = req.body;

    try {
      const [studentCheck] = await pool.query(
        'SELECT id FROM student_profiles WHERE id = ?',
        [studentId]
      );

      if (studentCheck.length === 0) {
        return res.status(404).json({ message: 'Student not found' });
      }

      await pool.query(`
        UPDATE student_profiles 
        SET 
          bio = ?,
          education_level = ?,
          location = ?
        WHERE id = ?
      `, [
        bio,
        education_level,
        location,
        studentId
      ]);

      res.json({ message: 'Student profile updated successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  // Get student's requests
  router.get('/:id/requests', async (req, res) => {
    const studentId = req.params.id;

    try {
      const [rows] = await pool.query(`
        SELECT 
          r.id,
          r.message,
          r.budget,
          r.location,
          r.status,
          r.created_at,
          r.updated_at,
          s.id as subject_id,
          s.name as subject_name,
          u.id as teacher_user_id,
          u.name as teacher_name,
          u.profile_picture as teacher_profile_picture,
          tp.id as teacher_id,
          c.id as class_id,
          c.title as class_title
        FROM requests r
        JOIN subjects s ON r.subject_id = s.id
        JOIN teacher_profiles tp ON r.teacher_id = tp.id
        JOIN users u ON tp.user_id = u.id
        LEFT JOIN classes c ON r.class_id = c.id
        WHERE r.student_id = ?
        ORDER BY r.created_at DESC
      `, [studentId]);

      res.json(rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  return router;
};