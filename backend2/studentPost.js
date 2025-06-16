const express = require('express');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// ==================== STUDENT POST ROUTES ====================

// Create student post
router.post('/posts',
  [
    body('studentId').isInt().withMessage('Valid student ID is required'),
    body('lessonType').isIn(['online', 'in-person']).withMessage('Lesson type must be online or in-person'),
    body('subject').notEmpty().withMessage('Subject is required'),
    body('headline').notEmpty().withMessage('Headline is required'),
    body('description').optional().isLength({ max: 1000 }).withMessage('Description too long')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { studentId, lessonType, subject, headline, description, townOrCity } = req.body;

      // Check if student exists
      const [students] = await global.db.execute(
        'SELECT id FROM StudentProfile WHERE id = ?',
        [studentId]
      );

      if (students.length === 0) {
        return res.status(404).json({ error: 'Student not found' });
      }

      const [result] = await global.db.execute(
        'INSERT INTO StudentPost (studentId, lessonType, subject, headline, description, townOrCity) VALUES (?, ?, ?, ?, ?, ?)',
        [studentId, lessonType, subject, headline, description, townOrCity]
      );

      res.status(201).json({
        message: 'Post created successfully',
        postId: result.insertId
      });
    } catch (error) {
      console.error('Error creating post:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Get all posts with student information
router.get('/posts', async (req, res) => {
  try {
    const { lessonType, subject, townOrCity } = req.query;
    
    let query = `
      SELECT p.*, s.name as studentName, s.profilePhoto, s.location, s.country, s.email, s.phoneNumber
      FROM StudentPost p
      JOIN StudentProfile s ON p.studentId = s.id
      WHERE 1=1
    `;
    const queryParams = [];

    if (lessonType) {
      query += ' AND p.lessonType = ?';
      queryParams.push(lessonType);
    }
    if (subject) {
      query += ' AND p.subject LIKE ?';
      queryParams.push(`%${subject}%`);
    }
    if (townOrCity) {
      query += ' AND p.townOrCity LIKE ?';
      queryParams.push(`%${townOrCity}%`);
    }

    query += ' ORDER BY p.createdAt DESC';

    const [posts] = await global.db.execute(query, queryParams);

    const postsWithPhotos = posts.map(post => ({
      ...post,
      profilePhoto: post.profilePhoto ? `/uploads/${post.profilePhoto}` : null
    }));

    res.json(postsWithPhotos);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get posts by student ID
router.get('/student/:studentId/posts', async (req, res) => {
  try {
    const { studentId } = req.params;

    // Validate studentId is a number
    if (isNaN(studentId)) {
      return res.status(400).json({ error: 'Invalid student ID' });
    }

    const [posts] = await global.db.execute(
      'SELECT * FROM StudentPost WHERE studentId = ? ORDER BY createdAt DESC',
      [studentId]
    );

    res.json(posts);
  } catch (error) {
    console.error('Error fetching student posts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get post by ID
router.get('/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Validate id is a number
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid post ID' });
    }

    const [posts] = await global.db.execute(
      `SELECT p.*, s.name as studentName, s.profilePhoto, s.email, s.phoneNumber, s.location, s.country
       FROM StudentPost p
       JOIN StudentProfile s ON p.studentId = s.id
       WHERE p.id = ?`,
      [id]
    );

    if (posts.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const post = posts[0];
    res.json({
      ...post,
      profilePhoto: post.profilePhoto ? `/uploads/${post.profilePhoto}` : null
    });
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update post
router.put('/posts/:id',
  [
    body('lessonType').optional().isIn(['online', 'in-person']).withMessage('Lesson type must be online or in-person'),
    body('subject').optional().notEmpty().withMessage('Subject cannot be empty'),
    body('headline').optional().notEmpty().withMessage('Headline cannot be empty')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { lessonType, subject, headline, description, townOrCity } = req.body;

      // Validate id is a number
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid post ID' });
      }

      // Check if post exists
      const [posts] = await global.db.execute(
        'SELECT id FROM StudentPost WHERE id = ?',
        [id]
      );

      if (posts.length === 0) {
        return res.status(404).json({ error: 'Post not found' });
      }

      let updateQuery = 'UPDATE StudentPost SET ';
      const updateValues = [];
      const updates = [];

      if (lessonType) {
        updates.push('lessonType = ?');
        updateValues.push(lessonType);
      }
      if (subject) {
        updates.push('subject = ?');
        updateValues.push(subject);
      }
      if (headline) {
        updates.push('headline = ?');
        updateValues.push(headline);
      }
      if (description !== undefined) {
        updates.push('description = ?');
        updateValues.push(description);
      }
      if (townOrCity !== undefined) {
        updates.push('townOrCity = ?');
        updateValues.push(townOrCity);
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      updateQuery += updates.join(', ') + ' WHERE id = ?';
      updateValues.push(id);

      await global.db.execute(updateQuery, updateValues);

      res.json({ message: 'Post updated successfully' });
    } catch (error) {
      console.error('Error updating post:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Delete post
router.delete('/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Validate id is a number
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid post ID' });
    }

    // Check if post exists
    const [posts] = await global.db.execute(
      'SELECT id FROM StudentPost WHERE id = ?',
      [id]
    );

    if (posts.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    await global.db.execute('DELETE FROM StudentPost WHERE id = ?', [id]);
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;