const express = require('express');
const router = express.Router();

module.exports = (pool) => {
  // Get all teachers with basic info
  router.get('/', async (req, res) => {
    try {
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
        WHERE u.role = 'teacher'
      `);
      
      res.json(rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  // Get teacher by ID with detailed info including subjects
  router.get('/:id', async (req, res) => {
    try {
      const [teacherRows] = await pool.query(`
        SELECT 
          u.id as user_id, 
          u.name, 
          u.email,
          u.profile_picture,
          tp.id as teacher_id,
          tp.bio, 
          tp.years_experience, 
          tp.education, 
          tp.hourly_rate,
          tp.availability,
          tp.location,
          tp.lat,
          tp.lng,
          tp.is_subscribed
        FROM users u
        JOIN teacher_profiles tp ON u.id = tp.user_id
        WHERE tp.id = ? AND u.role = 'teacher'
      `, [req.params.id]);

      if (teacherRows.length === 0) {
        return res.status(404).json({ message: 'Teacher not found' });
      }

      const teacher = teacherRows[0];

      // Get teacher's subjects
      const [subjectRows] = await pool.query(`
        SELECT s.id, s.name
        FROM subjects s
        JOIN teacher_subjects ts ON s.id = ts.subject_id
        WHERE ts.teacher_id = ?
      `, [teacher.teacher_id]);

      // Get teacher's classes
      const [classRows] = await pool.query(`
        SELECT 
          c.id, 
          c.title, 
          c.description, 
          c.price,
          c.location,
          c.is_online,
          s.id as subject_id,
          s.name as subject_name
        FROM classes c
        JOIN subjects s ON c.subject_id = s.id
        WHERE c.teacher_id = ?
      `, [teacher.teacher_id]);

      // Combine all data
      teacher.subjects = subjectRows;
      teacher.classes = classRows;

      res.json(teacher);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  // Update teacher profile
  router.put('/:id', async (req, res) => {
    const teacherId = req.params.id;
    const {
      bio,
      years_experience,
      education,
      hourly_rate,
      availability,
      location,
      lat,
      lng
    } = req.body;

    try {
      const [teacherCheck] = await pool.query(
        'SELECT id FROM teacher_profiles WHERE id = ?',
        [teacherId]
      );

      if (teacherCheck.length === 0) {
        return res.status(404).json({ message: 'Teacher not found' });
      }

      await pool.query(`
        UPDATE teacher_profiles 
        SET 
          bio = ?,
          years_experience = ?,
          education = ?,
          hourly_rate = ?,
          availability = ?,
          location = ?,
          lat = ?,
          lng = ?
        WHERE id = ?
      `, [
        bio,
        years_experience,
        education,
        hourly_rate,
        availability,
        location,
        lat,
        lng,
        teacherId
      ]);

      res.json({ message: 'Teacher profile updated successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  // Add subject to teacher
  router.post('/:id/subjects', async (req, res) => {
    const teacherId = req.params.id;
    const { subject_id } = req.body;

    try {
      // Check if teacher exists
      const [teacherCheck] = await pool.query(
        'SELECT id FROM teacher_profiles WHERE id = ?',
        [teacherId]
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

      // Check if the relationship already exists
      const [relationCheck] = await pool.query(
        'SELECT id FROM teacher_subjects WHERE teacher_id = ? AND subject_id = ?',
        [teacherId, subject_id]
      );

      if (relationCheck.length > 0) {
        return res.status(400).json({ message: 'Teacher already has this subject' });
      }

      // Add the subject to the teacher
      await pool.query(
        'INSERT INTO teacher_subjects (teacher_id, subject_id) VALUES (?, ?)',
        [teacherId, subject_id]
      );

      res.status(201).json({ message: 'Subject added to teacher successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  // Remove subject from teacher
  router.delete('/:id/subjects/:subjectId', async (req, res) => {
    const teacherId = req.params.id;
    const subjectId = req.params.subjectId;

    try {
      await pool.query(
        'DELETE FROM teacher_subjects WHERE teacher_id = ? AND subject_id = ?',
        [teacherId, subjectId]
      );

      res.json({ message: 'Subject removed from teacher successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  // Search teachers by criteria
  router.get('/search', async (req, res) => {
    try {
      const { subject, location, max_price } = req.query;
      
      let query = `
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
          tp.lng
        FROM users u
        JOIN teacher_profiles tp ON u.id = tp.user_id
        WHERE u.role = 'teacher'
      `;
      
      const params = [];
      
      if (subject) {
        query += `
          AND tp.id IN (
            SELECT ts.teacher_id 
            FROM teacher_subjects ts 
            JOIN subjects s ON ts.subject_id = s.id 
            WHERE s.name LIKE ?
          )
        `;
        params.push(`%${subject}%`);
      }
      
      if (location) {
        query += ` AND tp.location LIKE ?`;
        params.push(`%${location}%`);
      }
      
      if (max_price) {
        query += ` AND tp.hourly_rate <= ?`;
        params.push(max_price);
      }
      
      const [rows] = await pool.query(query, params);
      res.json(rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  return router;
};