const express = require('express');
const router = express.Router();

// ==================== TEACHER POSTS ROUTES ====================

// Test route to verify posts routes are working
router.get('/teachers/posts/test', (req, res) => {
  res.json({ message: 'Teacher posts routes are working!' });
});

// ==================== IMPORTANT: SPECIFIC ROUTES FIRST ====================
// Order matters! Put specific routes BEFORE parameterized routes to avoid conflicts

// SEARCH - Search teacher posts (MUST come before /teachers/posts)
router.get('/teachers/posts/search', (req, res) => {
  const { subject, location, lessonType, priceType, minPrice, maxPrice, townOrDistrict } = req.query;
  
  let query = `
    SELECT 
      tp.*,
      t.name as teacherName,
      t.profilePhoto as teacherPhoto,
      AVG(pr.rating) as averageRating,
      COUNT(pr.id) as totalReviews
    FROM TeachersPosts tp
    LEFT JOIN Teachers t ON tp.teacherId = t.id
    LEFT JOIN PostReviews pr ON tp.id = pr.postId
    WHERE 1=1
  `;
  const values = [];
  
  if (subject) {
    query += ' AND tp.subject LIKE ?';
    values.push(`%${subject}%`);
  }
  
  if (location) {
    query += ' AND tp.location LIKE ?';
    values.push(`%${location}%`);
  }
  
  if (lessonType) {
    query += ' AND tp.lessonType = ?';
    values.push(lessonType);
  }
  
  if (priceType) {
    query += ' AND tp.priceType = ?';
    values.push(priceType);
  }
  
  if (minPrice) {
    query += ' AND tp.price >= ?';
    values.push(minPrice);
  }
  
  if (maxPrice) {
    query += ' AND tp.price <= ?';
    values.push(maxPrice);
  }
  
  if (townOrDistrict) {
    query += ' AND tp.townOrDistrict LIKE ?';
    values.push(`%${townOrDistrict}%`);
  }
  
  query += ' GROUP BY tp.id ORDER BY tp.createdAt DESC';
  
  global.db.execute(query, values, (err, results) => {
    if (err) {
      console.error('Error searching posts:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    const posts = results.map(post => ({
      ...post,
      teacherPhoto: post.teacherPhoto ? `/uploads/${post.teacherPhoto}` : null,
      averageRating: post.averageRating ? parseFloat(post.averageRating).toFixed(1) : null,
      totalReviews: parseInt(post.totalReviews) || 0
    }));
    
    res.json(posts);
  });
});

// READ - Get all teacher posts with teacher details and reviews
router.get('/teachers/posts', (req, res) => {
  const query = `
    SELECT 
      tp.*,
      t.name as teacherName,
      t.profilePhoto as teacherPhoto,
      t.email as teacherEmail,
      t.phoneNumber as teacherPhone,
      AVG(pr.rating) as averageRating,
      COUNT(pr.id) as totalReviews
    FROM TeachersPosts tp
    LEFT JOIN Teachers t ON tp.teacherId = t.id
    LEFT JOIN PostReviews pr ON tp.id = pr.postId
    GROUP BY tp.id
    ORDER BY tp.createdAt DESC
  `;
  
  global.db.execute(query, (err, results) => {
    if (err) {
      console.error('Error fetching teacher posts:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    const posts = results.map(post => ({
      ...post,
      teacherPhoto: post.teacherPhoto ? `/uploads/${post.teacherPhoto}` : null,
      averageRating: post.averageRating ? parseFloat(post.averageRating).toFixed(1) : null,
      totalReviews: parseInt(post.totalReviews) || 0
    }));
    
    res.json(posts);
  });
});

// READ - Get single teacher post by ID with reviews
router.get('/teachers/posts/:id', (req, res) => {
  const { id } = req.params;
  
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid post ID' });
  }

  const postQuery = `
    SELECT 
      tp.*,
      t.name as teacherName,
      t.profilePhoto as teacherPhoto,
      t.email as teacherEmail,
      t.phoneNumber as teacherPhone,
      t.cityOrTown as teacherCity
    FROM TeachersPosts tp
    LEFT JOIN Teachers t ON tp.teacherId = t.id
    WHERE tp.id = ?
  `;
  
  global.db.execute(postQuery, [id], (err, postResults) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (postResults.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    const post = postResults[0];
    
    // Get reviews for this post
    const reviewsQuery = `
      SELECT 
        pr.*,
        sp.name as studentName,
        sp.profilePhoto as studentPhoto
      FROM PostReviews pr
      LEFT JOIN StudentProfile sp ON pr.studentId = sp.id
      WHERE pr.postId = ?
      ORDER BY pr.createdAt DESC
    `;
    
    global.db.execute(reviewsQuery, [id], (reviewErr, reviewResults) => {
      if (reviewErr) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      const reviews = reviewResults.map(review => ({
        ...review,
        studentPhoto: review.studentPhoto ? `/uploads/${review.studentPhoto}` : null
      }));
      
      res.json({
        ...post,
        teacherPhoto: post.teacherPhoto ? `/uploads/${post.teacherPhoto}` : null,
        reviews: reviews,
        averageRating: reviews.length > 0 ? 
          (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : null,
        totalReviews: reviews.length
      });
    });
  });
});

// CREATE - Add new teacher post
router.post('/teachers/posts', (req, res) => {
  try {
    const { 
      teacherId,
      headline, 
      subject, 
      location, 
      description, 
      lessonType, 
      distanceFromLocation, 
      townOrDistrict, 
      price, 
      priceType 
    } = req.body;
    
    // Validation
    if (!teacherId || !headline || !subject || !lessonType || !price || !priceType) {
      return res.status(400).json({ error: 'TeacherId, headline, subject, lessonType, price and priceType are required' });
    }

    // Validate lessonType
    const validLessonTypes = ['in-person', 'online', 'both'];
    if (!validLessonTypes.includes(lessonType)) {
      return res.status(400).json({ error: 'Invalid lesson type. Must be: in-person, online, or both' });
    }

    // Validate priceType
    const validPriceTypes = ['hourly', 'monthly', 'daily'];
    if (!validPriceTypes.includes(priceType)) {
      return res.status(400).json({ error: 'Invalid price type. Must be: hourly, monthly, or daily' });
    }

    // Check if teacher exists
    const checkTeacherQuery = 'SELECT id FROM Teachers WHERE id = ?';
    global.db.execute(checkTeacherQuery, [teacherId], (checkErr, results) => {
      if (checkErr) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (results.length === 0) {
        return res.status(404).json({ error: 'Teacher not found' });
      }

      // Insert teacher post
      const insertQuery = `
        INSERT INTO TeachersPosts 
        (teacherId, headline, subject, location, description, lessonType, distanceFromLocation, townOrDistrict, price, priceType)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      global.db.execute(insertQuery, [
        teacherId, headline, subject, location, description, lessonType, 
        distanceFromLocation, townOrDistrict, price, priceType
      ], (insertErr, result) => {
        if (insertErr) {
          console.error('Error creating teacher post:', insertErr);
          return res.status(500).json({ error: 'Database error' });
        }
        
        res.status(201).json({
          message: 'Teacher post created successfully',
          postId: result.insertId
        });
      });
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 3. FIXED UPDATE ROUTE
router.put('/teachers/posts/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { 
      headline, 
      subject, 
      location, 
      description, 
      lessonType, 
      distanceFromLocation, 
      townOrDistrict, 
      price, 
      priceType 
    } = req.body;

    console.log('Updating post ID:', id);
    console.log('Update data:', req.body);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid post ID' });
    }

    // Check if post exists first
    const checkQuery = 'SELECT id, teacherId FROM TeachersPosts WHERE id = ?';
    global.db.execute(checkQuery, [id], (checkErr, results) => {
      if (checkErr) {
        console.error('Error checking post:', checkErr);
        return res.status(500).json({ error: 'Database error checking post' });
      }
      
      if (results.length === 0) {
        return res.status(404).json({ error: 'Post not found' });
      }

      console.log('Post found, proceeding with update');

      let updateQuery = 'UPDATE TeachersPosts SET ';
      const updateValues = [];
      const updates = [];

      if (headline !== undefined) {
        updates.push('headline = ?');
        updateValues.push(headline);
      }
      if (subject !== undefined) {
        updates.push('subject = ?');
        updateValues.push(subject);
      }
      if (location !== undefined) {
        updates.push('location = ?');
        updateValues.push(location);
      }
      if (description !== undefined) {
        updates.push('description = ?');
        updateValues.push(description);
      }
      if (lessonType !== undefined) {
        const validLessonTypes = ['in-person', 'online', 'both'];
        if (!validLessonTypes.includes(lessonType)) {
          return res.status(400).json({ error: 'Invalid lesson type' });
        }
        updates.push('lessonType = ?');
        updateValues.push(lessonType);
      }
      if (distanceFromLocation !== undefined) {
        updates.push('distanceFromLocation = ?');
        updateValues.push(distanceFromLocation);
      }
      if (townOrDistrict !== undefined) {
        updates.push('townOrDistrict = ?');
        updateValues.push(townOrDistrict);
      }
      if (price !== undefined) {
        updates.push('price = ?');
        updateValues.push(price);
      }
      if (priceType !== undefined) {
        const validPriceTypes = ['hourly', 'monthly', 'daily'];
        if (!validPriceTypes.includes(priceType)) {
          return res.status(400).json({ error: 'Invalid price type' });
        }
        updates.push('priceType = ?');
        updateValues.push(priceType);
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      // Add updatedAt
      updates.push('updatedAt = CURRENT_TIMESTAMP');

      updateQuery += updates.join(', ') + ' WHERE id = ?';
      updateValues.push(id);

      console.log('Update query:', updateQuery);
      console.log('Update values:', updateValues);

      global.db.execute(updateQuery, updateValues, (updateErr, result) => {
        if (updateErr) {
          console.error('Error updating post:', updateErr);
          return res.status(500).json({ error: 'Database error updating post' });
        }
        
        console.log('Post updated successfully, affected rows:', result.affectedRows);
        res.json({ message: 'Post updated successfully' });
      });
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE - Delete teacher post
router.delete('/teachers/posts/:id', (req, res) => {
  const { id } = req.params;
  
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid post ID' });
  }

  const query = 'DELETE FROM TeachersPosts WHERE id = ?';
  
  global.db.execute(query, [id], (err, result) => {
    if (err) {
      console.error('Error deleting post:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    res.json({ message: 'Post deleted successfully' });
  });
});


router.get('/teachers/:teacherId/posts', (req, res) => {
  const { teacherId } = req.params;
  
  console.log('Fetching posts for teacher ID:', teacherId); // Debug log
  
  if (isNaN(teacherId)) {
    return res.status(400).json({ error: 'Invalid teacher ID' });
  }

  // First check if teacher exists
  const checkTeacherQuery = 'SELECT id, name FROM Teachers WHERE id = ?';
  
  global.db.execute(checkTeacherQuery, [teacherId], (checkErr, teacherResults) => {
    if (checkErr) {
      console.error('Error checking teacher:', checkErr);
      return res.status(500).json({ error: 'Database error checking teacher' });
    }
    
    if (teacherResults.length === 0) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    console.log('Teacher found:', teacherResults[0].name);

    // Query with explicit column selection to avoid GROUP BY issues
    const query = `
      SELECT 
        tp.id,
        tp.teacherId,
        tp.headline,
        tp.subject,
        tp.location,
        tp.description,
        tp.lessonType,
        tp.distanceFromLocation,
        tp.townOrDistrict,
        tp.price,
        tp.priceType,
        tp.createdAt,
        tp.updatedAt,
        COALESCE(AVG(pr.rating), 0) as averageRating,
        COALESCE(COUNT(pr.id), 0) as totalReviews
      FROM TeachersPosts tp
      LEFT JOIN PostReviews pr ON tp.id = pr.postId
      WHERE tp.teacherId = ?
      GROUP BY tp.id, tp.teacherId, tp.headline, tp.subject, tp.location, 
               tp.description, tp.lessonType, tp.distanceFromLocation, 
               tp.townOrDistrict, tp.price, tp.priceType, tp.createdAt, tp.updatedAt
      ORDER BY tp.createdAt DESC
    `;
    
    global.db.execute(query, [teacherId], (err, results) => {
      if (err) {
        console.error('Error fetching teacher posts:', err);
        
        // Fallback query without reviews if there's an issue
        const fallbackQuery = `
          SELECT 
            id, teacherId, headline, subject, location, description, 
            lessonType, distanceFromLocation, townOrDistrict, price, 
            priceType, createdAt, updatedAt,
            0 as averageRating,
            0 as totalReviews
          FROM TeachersPosts 
          WHERE teacherId = ?
          ORDER BY createdAt DESC
        `;
        
        global.db.execute(fallbackQuery, [teacherId], (fallbackErr, fallbackResults) => {
          if (fallbackErr) {
            console.error('Fallback query error:', fallbackErr);
            return res.status(500).json({ error: 'Database error fetching posts' });
          }
          
          console.log('Fallback posts found:', fallbackResults.length);
          
          const posts = fallbackResults.map(post => ({
            ...post,
            averageRating: null,
            totalReviews: 0
          }));
          
          res.json(posts);
        });
        return;
      }
      
      console.log('Posts found:', results.length);
      
      const posts = results.map(post => ({
        ...post,
        averageRating: post.averageRating && post.averageRating > 0 ? 
          parseFloat(post.averageRating).toFixed(1) : null,
        totalReviews: parseInt(post.totalReviews) || 0
      }));
      
      res.json(posts);
    });
  });
});
// READ - Get posts by teacher ID (MUST come after specific routes)
// router.get('/teachers/:teacherId/posts', (req, res) => {
//   const { teacherId } = req.params;
  
//   if (isNaN(teacherId)) {
//     return res.status(400).json({ error: 'Invalid teacher ID' });
//   }

//   const query = `
//     SELECT 
//       tp.*,
//       AVG(pr.rating) as averageRating,
//       COUNT(pr.id) as totalReviews
//     FROM TeachersPosts tp
//     LEFT JOIN PostReviews pr ON tp.id = pr.postId
//     WHERE tp.teacherId = ?
//     GROUP BY tp.id
//     ORDER BY tp.createdAt DESC
//   `;
  
//   global.db.execute(query, [teacherId], (err, results) => {
//     if (err) {
//       return res.status(500).json({ error: 'Database error' });
//     }
    
//     const posts = results.map(post => ({
//       ...post,
//       averageRating: post.averageRating ? parseFloat(post.averageRating).toFixed(1) : null,
//       totalReviews: parseInt(post.totalReviews) || 0
//     }));
    
//     res.json(posts);
//   });
// });

// ==================== POST REVIEWS ROUTES ====================

// CREATE - Add review to a post
router.post('/teachers/posts/:postId/reviews', (req, res) => {
  try {
    const { postId } = req.params;
    const { studentId, rating, reviewText } = req.body;
    
    if (isNaN(postId)) {
      return res.status(400).json({ error: 'Invalid post ID' });
    }
    
    if (!studentId || !rating) {
      return res.status(400).json({ error: 'Student ID and rating are required' });
    }
    
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Check if post exists
    const checkPostQuery = 'SELECT id FROM TeachersPosts WHERE id = ?';
    global.db.execute(checkPostQuery, [postId], (checkPostErr, postResults) => {
      if (checkPostErr) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (postResults.length === 0) {
        return res.status(404).json({ error: 'Post not found' });
      }

      // Check if student exists
      const checkStudentQuery = 'SELECT id FROM StudentProfile WHERE id = ?';
      global.db.execute(checkStudentQuery, [studentId], (checkStudentErr, studentResults) => {
        if (checkStudentErr) {
          return res.status(500).json({ error: 'Database error' });
        }
        
        if (studentResults.length === 0) {
          return res.status(404).json({ error: 'Student not found' });
        }

        // Insert review
        const insertQuery = 'INSERT INTO PostReviews (postId, studentId, rating, reviewText) VALUES (?, ?, ?, ?)';
        
        global.db.execute(insertQuery, [postId, studentId, rating, reviewText], (insertErr, result) => {
          if (insertErr) {
            if (insertErr.code === 'ER_DUP_ENTRY') {
              return res.status(400).json({ error: 'Student has already reviewed this post' });
            }
            console.error('Error creating review:', insertErr);
            return res.status(500).json({ error: 'Database error' });
          }
          
          res.status(201).json({
            message: 'Review added successfully',
            reviewId: result.insertId
          });
        });
      });
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// READ - Get reviews for a post
router.get('/teachers/posts/:postId/reviews', (req, res) => {
  const { postId } = req.params;
  
  if (isNaN(postId)) {
    return res.status(400).json({ error: 'Invalid post ID' });
  }

  const query = `
    SELECT 
      pr.*,
      sp.name as studentName,
      sp.profilePhoto as studentPhoto
    FROM PostReviews pr
    LEFT JOIN StudentProfile sp ON pr.studentId = sp.id
    WHERE pr.postId = ?
    ORDER BY pr.createdAt DESC
  `;
  
  global.db.execute(query, [postId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    const reviews = results.map(review => ({
      ...review,
      studentPhoto: review.studentPhoto ? `/uploads/${review.studentPhoto}` : null
    }));
    
    res.json(reviews);
  });
});

// UPDATE - Update a review
router.put('/teachers/posts/reviews/:reviewId', (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, reviewText } = req.body;

    if (isNaN(reviewId)) {
      return res.status(400).json({ error: 'Invalid review ID' });
    }

    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Check if review exists
    const checkQuery = 'SELECT id FROM PostReviews WHERE id = ?';
    global.db.execute(checkQuery, [reviewId], (checkErr, results) => {
      if (checkErr) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (results.length === 0) {
        return res.status(404).json({ error: 'Review not found' });
      }

      let updateQuery = 'UPDATE PostReviews SET ';
      const updateValues = [];
      const updates = [];

      if (rating) {
        updates.push('rating = ?');
        updateValues.push(rating);
      }
      if (reviewText !== undefined) {
        updates.push('reviewText = ?');
        updateValues.push(reviewText);
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      updateQuery += updates.join(', ') + ' WHERE id = ?';
      updateValues.push(reviewId);

      global.db.execute(updateQuery, updateValues, (updateErr) => {
        if (updateErr) {
          console.error('Error updating review:', updateErr);
          return res.status(500).json({ error: 'Database error' });
        }
        
        res.json({ message: 'Review updated successfully' });
      });
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE - Delete a review
router.delete('/teachers/posts/reviews/:reviewId', (req, res) => {
  const { reviewId } = req.params;
  
  if (isNaN(reviewId)) {
    return res.status(400).json({ error: 'Invalid review ID' });
  }

  const query = 'DELETE FROM PostReviews WHERE id = ?';
  
  global.db.execute(query, [reviewId], (err, result) => {
    if (err) {
      console.error('Error deleting review:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    res.json({ message: 'Review deleted successfully' });
  });
});

module.exports = router;