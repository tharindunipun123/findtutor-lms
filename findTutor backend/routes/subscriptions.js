const express = require('express');
const router = express.Router();

module.exports = (pool) => {
  // Get all subscription plans
  router.get('/plans', async (req, res) => {
    try {
      const [rows] = await pool.query(`
        SELECT * FROM subscription_plans ORDER BY price_monthly ASC
      `);
      
      // Parse JSON features
      const plans = rows.map(plan => ({
        ...plan,
        features: JSON.parse(plan.features)
      }));
      
      res.json(plans);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  // Get subscription plan by ID
  router.get('/plans/:id', async (req, res) => {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM subscription_plans WHERE id = ?',
        [req.params.id]
      );

      if (rows.length === 0) {
        return res.status(404).json({ message: 'Subscription plan not found' });
      }

      // Parse JSON features
      const plan = {
        ...rows[0],
        features: JSON.parse(rows[0].features)
      };

      res.json(plan);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  // Get teacher's subscription
  router.get('/teacher/:teacherId', async (req, res) => {
    const teacherId = req.params.teacherId;

    try {
      const [rows] = await pool.query(`
        SELECT 
          s.id,
          s.start_date,
          s.end_date,
          s.payment_status,
          s.is_yearly,
          s.created_at,
          p.id as plan_id,
          p.name as plan_name,
          p.price_monthly,
          p.price_yearly,
          p.features
        FROM subscriptions s
        JOIN subscription_plans p ON s.plan_id = p.id
        WHERE s.teacher_id = ?
        ORDER BY s.created_at DESC
        LIMIT 1
      `, [teacherId]);

      if (rows.length === 0) {
        return res.status(404).json({ message: 'No active subscription found' });
      }

      // Parse JSON features
      const subscription = {
        ...rows[0],
        features: JSON.parse(rows[0].features)
      };

      res.json(subscription);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  // Create a new subscription
  router.post('/', async (req, res) => {
    const {
      teacher_id,
      plan_id,
      is_yearly
    } = req.body;

    // Basic validation
    if (!teacher_id || !plan_id) {
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

      // Check if plan exists
      const [planCheck] = await pool.query(
        'SELECT id FROM subscription_plans WHERE id = ?',
        [plan_id]
      );

      if (planCheck.length === 0) {
        return res.status(404).json({ message: 'Subscription plan not found' });
      }

      // Calculate dates
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + (is_yearly ? 365 : 30));

      // Insert the subscription
      const [result] = await pool.query(`
        INSERT INTO subscriptions (
          teacher_id,
          plan_id,
          start_date,
          end_date,
          payment_status,
          is_yearly
        ) VALUES (?, ?, ?, ?, 'completed', ?)
      `, [
        teacher_id,
        plan_id,
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0],
        is_yearly || false
      ]);

      // Update teacher's subscription status
      await pool.query(
        'UPDATE teacher_profiles SET is_subscribed = TRUE WHERE id = ?',
        [teacher_id]
      );

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
          'Subscription Activated',
          'Your subscription has been successfully activated!'
        ]);
      }

      res.status(201).json({
        id: result.insertId,
        teacher_id,
        plan_id,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        payment_status: 'completed',
        is_yearly: is_yearly || false
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  // Cancel a subscription
  router.post('/:id/cancel', async (req, res) => {
    const subscriptionId = req.params.id;

    try {
      // Check if subscription exists
      const [subscriptionCheck] = await pool.query(
        'SELECT id, teacher_id FROM subscriptions WHERE id = ?',
        [subscriptionId]
      );

      if (subscriptionCheck.length === 0) {
        return res.status(404).json({ message: 'Subscription not found' });
      }

      const teacherId = subscriptionCheck[0].teacher_id;

      // Update the subscription end date to today
      await pool.query(
        'UPDATE subscriptions SET end_date = CURRENT_DATE() WHERE id = ?',
        [subscriptionId]
      );

      // Update teacher's subscription status
      await pool.query(
        'UPDATE teacher_profiles SET is_subscribed = FALSE WHERE id = ?',
        [teacherId]
      );

      // Create notification for teacher
      const [teacherUserQuery] = await pool.query(
        'SELECT user_id FROM teacher_profiles WHERE id = ?', 
        [teacherId]
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
          'Subscription Cancelled',
          'Your subscription has been cancelled. You will lose premium features at the end of your billing period.'
        ]);
      }

      res.json({ message: 'Subscription cancelled successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  return router;
};