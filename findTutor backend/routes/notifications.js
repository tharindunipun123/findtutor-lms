const express = require('express');
const router = express.Router();

module.exports = (pool) => {
  // Get user notifications
  router.get('/user/:userId', async (req, res) => {
    const userId = req.params.userId;

    try {
      const [rows] = await pool.query(`
        SELECT * FROM notifications 
        WHERE user_id = ? 
        ORDER BY created_at DESC
      `, [userId]);
      
      res.json(rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  // Mark notification as read
  router.patch('/:id/read', async (req, res) => {
    const notificationId = req.params.id;

    try {
      // Check if notification exists
      const [notificationCheck] = await pool.query(
        'SELECT id FROM notifications WHERE id = ?',
        [notificationId]
      );

      if (notificationCheck.length === 0) {
        return res.status(404).json({ message: 'Notification not found' });
      }

      // Update the notification
      await pool.query(
        'UPDATE notifications SET is_read = TRUE WHERE id = ?',
        [notificationId]
      );

      res.json({ message: 'Notification marked as read' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  // Mark all user notifications as read
  router.patch('/user/:userId/read-all', async (req, res) => {
    const userId = req.params.userId;

    try {
      await pool.query(
        'UPDATE notifications SET is_read = TRUE WHERE user_id = ?',
        [userId]
      );

      res.json({ message: 'All notifications marked as read' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  // Delete a notification
  router.delete('/:id', async (req, res) => {
    const notificationId = req.params.id;

    try {
      // Check if notification exists
      const [notificationCheck] = await pool.query(
        'SELECT id FROM notifications WHERE id = ?',
        [notificationId]
      );

      if (notificationCheck.length === 0) {
        return res.status(404).json({ message: 'Notification not found' });
      }

      // Delete the notification
      await pool.query(
        'DELETE FROM notifications WHERE id = ?',
        [notificationId]
      );

      res.json({ message: 'Notification deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  // Delete all read notifications for a user
  router.delete('/user/:userId/read', async (req, res) => {
    const userId = req.params.userId;

    try {
      await pool.query(
        'DELETE FROM notifications WHERE user_id = ? AND is_read = TRUE',
        [userId]
      );

      res.json({ message: 'All read notifications deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  // Create a notification (for testing purposes)
  router.post('/', async (req, res) => {
    const { user_id, title, message } = req.body;

    // Basic validation
    if (!user_id || !title || !message) {
      return res.status(400).json({ message: 'Required fields missing' });
    }

    try {
      // Check if user exists
      const [userCheck] = await pool.query(
        'SELECT id FROM users WHERE id = ?',
        [user_id]
      );

      if (userCheck.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Insert the notification
      const [result] = await pool.query(`
        INSERT INTO notifications (
          user_id,
          title,
          message
        ) VALUES (?, ?, ?)
      `, [
        user_id,
        title,
        message
      ]);

      res.status(201).json({
        id: result.insertId,
        user_id,
        title,
        message,
        is_read: false,
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  return router;
};