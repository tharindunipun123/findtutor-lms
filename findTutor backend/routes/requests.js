const express = require('express');
const router = express.Router();

module.exports = (pool) => {
  // Get all requests (with filters)
  router.get('/', async (req, res) => {
    const { teacher_id, student_id, status } = req.query;
    
    try {
      let query = `
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
          sp.id as student_id,
          su.id as student_user_id,
          su.name as student_name,
          su.profile_picture as student_profile_picture,
          tp.id as teacher_id,
          tu.id as teacher_user_id,
          tu.name as teacher_name,
          tu.profile_picture as teacher_profile_picture,
          c.id as class_id,
          c.title as class_title
        FROM requests r
        JOIN subjects s ON r.subject_id = s.id
        JOIN student_profiles sp ON r.student_id = sp.id
        JOIN users su ON sp.user_id = su.id
        JOIN teacher_profiles tp ON r.teacher_id = tp.id
        JOIN users tu ON tp.user_id = tu.id
        LEFT JOIN classes c ON r.class_id = c.id
        WHERE 1=1
      `;
      
      const params = [];
      
      if (teacher_id) {
        query += ` AND r.teacher_id = ?`;
        params.push(teacher_id);
      }
      
      if (student_id) {
        query += ` AND r.student_id = ?`;
        params.push(student_id);
      }
      
      if (status) {
        query += ` AND r.status = ?`;
        params.push(status);
      }
      
      query += ` ORDER BY r.created_at DESC`;
      
      const [rows] = await pool.query(query, params);
      res.json(rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  // Get request by ID
  router.get('/:id', async (req, res) => {
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
          sp.id as student_id,
          su.id as student_user_id,
          su.name as student_name,
          su.profile_picture as student_profile_picture,
          tp.id as teacher_id,
          tu.id as teacher_user_id,
          tu.name as teacher_name,
          tu.profile_picture as teacher_profile_picture,
          c.id as class_id,
          c.title as class_title
        FROM requests r
        JOIN subjects s ON r.subject_id = s.id
        JOIN student_profiles sp ON r.student_id = sp.id
        JOIN users su ON sp.user_id = su.id
        JOIN teacher_profiles tp ON r.teacher_id = tp.id
        JOIN users tu ON tp.user_id = tu.id
        LEFT JOIN classes c ON r.class_id = c.id
        WHERE r.id = ?
      `, [req.params.id]);

      if (rows.length === 0) {
        return res.status(404).json({ message: 'Request not found' });
      }

      res.json(rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  // Create a new request
  router.post('/', async (req, res) => {
    const {
      student_id,
      teacher_id,
      subject_id,
      class_id,
      message,
      budget,
      location
    } = req.body;

    // Basic validation
    if (!student_id || !teacher_id || !subject_id || !message) {
      return res.status(400).json({ message: 'Required fields missing' });
    }

    try {
      // Check if student exists
      const [studentCheck] = await pool.query(
        'SELECT id FROM student_profiles WHERE id = ?',
        [student_id]
      );

      if (studentCheck.length === 0) {
        return res.status(404).json({ message: 'Student not found' });
      }

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

      // Check if class exists if provided
      if (class_id) {
        const [classCheck] = await pool.query(
          'SELECT id FROM classes WHERE id = ?',
          [class_id]
        );

        if (classCheck.length === 0) {
          return res.status(404).json({ message: 'Class not found' });
        }
      }

      // Insert the request
      const [result] = await pool.query(`
        INSERT INTO requests (
          student_id,
          teacher_id,
          subject_id,
          class_id,
          message,
          budget,
          location,
          status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
      `, [
        student_id,
        teacher_id,
        subject_id,
        class_id || null,
        message,
        budget,
        location
      ]);

      // Create notification for teacher
      const [teacherUserQuery] = await pool.query(
        'SELECT user_id FROM teacher_profiles WHERE id = ?', 
        [teacher_id]
      );
      
      if (teacherUserQuery.length > 0) {
        const teacherUserId = teacherUserQuery[0].user_id;
        
        await pool.query(`
          INSERT INTO notifications (
            user_id,
            title,
            message
          ) VALUES (?, ?, ?)
        `, [
          teacherUserId,
          'New Request',
          'You have received a new tutoring request!'
        ]);
      }

      res.status(201).json({
        id: result.insertId,
        student_id,
        teacher_id,
        subject_id,
        class_id: class_id || null,
        message,
        budget,
        location,
        status: 'pending',
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  // Update request status
  router.patch('/:id/status', async (req, res) => {
    const requestId = req.params.id;
    const { status } = req.body;

    if (!status || !['pending', 'accepted', 'declined', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Valid status required' });
    }

    try {
      // Check if request exists
      const [requestCheck] = await pool.query(
        'SELECT id, student_id, teacher_id FROM requests WHERE id = ?',
        [requestId]
      );

      if (requestCheck.length === 0) {
        return res.status(404).json({ message: 'Request not found' });
      }

      // Update the request status
      await pool.query(
        'UPDATE requests SET status = ?, updated_at = NOW() WHERE id = ?',
        [status, requestId]
      );

      // Create notification for student
      const studentId = requestCheck[0].student_id;
      const [studentUserQuery] = await pool.query(
        'SELECT user_id FROM student_profiles WHERE id = ?', 
        [studentId]
      );
      
      if (studentUserQuery.length > 0) {
        const studentUserId = studentUserQuery[0].user_id;
        
        let notificationTitle = 'Request Update';
        let notificationMessage = 'Your request status has been updated.';
        
        if (status === 'accepted') {
          notificationTitle = 'Request Accepted';
          notificationMessage = 'Your tutoring request has been accepted!';
        } else if (status === 'declined') {
          notificationTitle = 'Request Declined';
          notificationMessage = 'Your tutoring request has been declined.';
        } else if (status === 'completed') {
          notificationTitle = 'Request Completed';
          notificationMessage = 'Your tutoring request has been marked as completed.';
        }
        
        await pool.query(`
          INSERT INTO notifications (
            user_id,
            title,
            message
          ) VALUES (?, ?, ?)
        `, [
          studentUserId,
          notificationTitle,
          notificationMessage
        ]);
      }

      res.json({ message: 'Request status updated successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  // Delete a request
  router.delete('/:id', async (req, res) => {
    const requestId = req.params.id;

    try {
      // Check if request exists
      const [requestCheck] = await pool.query(
        'SELECT id FROM requests WHERE id = ?',
        [requestId]
      );

      if (requestCheck.length === 0) {
        return res.status(404).json({ message: 'Request not found' });
      }

      // Delete the request
      await pool.query('DELETE FROM requests WHERE id = ?', [requestId]);

      res.json({ message: 'Request deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  return router;
};