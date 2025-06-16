const express = require('express');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// File upload configuration for teachers
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'teacher-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// ==================== TEACHER ROUTES ====================
router.post('/teachers/register', upload.single('profilePhoto'), async (req, res) => {
  try {
    const { name, email, password, phoneNumber, cityOrTown } = req.body; // ✅ Add name
    const profilePhoto = req.file ? req.file.filename : null;

    // Validation
    if (!name || !email || !password) { // ✅ Add name validation
      return res.status(400).json({ error: 'Name, email and password are required' });
    }

    // Check if email already exists
    const checkQuery = 'SELECT id FROM Teachers WHERE email = ?';
    global.db.execute(checkQuery, [email], async (checkErr, results) => {
      if (checkErr) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (results.length > 0) {
        return res.status(400).json({ error: 'Email already registered' });
      }

      try {
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert teacher - ADD name to query
        const insertQuery = 'INSERT INTO Teachers (name, profilePhoto, email, password, phoneNumber, cityOrTown) VALUES (?, ?, ?, ?, ?, ?)';
        
        global.db.execute(insertQuery, [name, profilePhoto, email, hashedPassword, phoneNumber, cityOrTown], (insertErr, result) => {
          if (insertErr) {
            return res.status(500).json({ error: 'Database error' });
          }
          
          res.status(201).json({
            message: 'Teacher registered successfully',
            teacherId: result.insertId,
            profilePhoto: profilePhoto ? `/uploads/${profilePhoto}` : null
          });
        });
      } catch (hashError) {
        res.status(500).json({ error: 'Password hashing error' });
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Teacher Login
router.post('/teachers/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const query = 'SELECT * FROM Teachers WHERE email = ?'; // This already gets all fields including name
    
    global.db.execute(query, [email], async (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (results.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      const teacher = results[0];
      
      try {
        const isValidPassword = await bcrypt.compare(password, teacher.password);
        if (!isValidPassword) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        // Remove password from response
        delete teacher.password;
        
        res.json({
          message: 'Login successful',
          teacher: {
            ...teacher, // This now includes name
            profilePhoto: teacher.profilePhoto ? `/uploads/${teacher.profilePhoto}` : null
          }
        });
      } catch (compareError) {
        res.status(500).json({ error: 'Authentication error' });
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/teachers', (req, res) => {
  const query = 'SELECT id, name, profilePhoto, email, phoneNumber, cityOrTown, createdAt FROM Teachers ORDER BY createdAt DESC'; // ✅ Add name
  
  global.db.execute(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    const teachers = results.map(teacher => ({
      ...teacher,
      profilePhoto: teacher.profilePhoto ? `/uploads/${teacher.profilePhoto}` : null
    }));
    
    res.json(teachers);
  });
});

// 
router.get('/teachers/:id', (req, res) => {
  const { id } = req.params;
  
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid teacher ID' });
  }

  const query = 'SELECT id, name, profilePhoto, email, phoneNumber, cityOrTown, createdAt FROM Teachers WHERE id = ?'; // ✅ Add name
  
  global.db.execute(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Teacher not found' });
    }
    
    const teacher = results[0];
    res.json({
      ...teacher,
      profilePhoto: teacher.profilePhoto ? `/uploads/${teacher.profilePhoto}` : null
    });
  });
});


router.put('/teachers/:id', upload.single('profilePhoto'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phoneNumber, cityOrTown, password } = req.body; // ✅ Add name
    const profilePhoto = req.file ? req.file.filename : null;

    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid teacher ID' });
    }

    // Check if teacher exists
    const checkQuery = 'SELECT id FROM Teachers WHERE id = ?';
    global.db.execute(checkQuery, [id], async (checkErr, results) => {
      if (checkErr) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (results.length === 0) {
        return res.status(404).json({ error: 'Teacher not found' });
      }

      let updateQuery = 'UPDATE Teachers SET ';
      const updateValues = [];
      const updates = [];

      if (name) { // ✅ Add name update
        updates.push('name = ?');
        updateValues.push(name);
      }
      if (profilePhoto) {
        updates.push('profilePhoto = ?');
        updateValues.push(profilePhoto);
      }
      if (email) {
        updates.push('email = ?');
        updateValues.push(email);
      }
      if (phoneNumber) {
        updates.push('phoneNumber = ?');
        updateValues.push(phoneNumber);
      }
      if (cityOrTown) {
        updates.push('cityOrTown = ?');
        updateValues.push(cityOrTown);
      }
      if (password) {
        try {
          const hashedPassword = await bcrypt.hash(password, 10);
          updates.push('password = ?');
          updateValues.push(hashedPassword);
        } catch (hashError) {
          return res.status(500).json({ error: 'Password hashing error' });
        }
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      updateQuery += updates.join(', ') + ' WHERE id = ?';
      updateValues.push(id);

      global.db.execute(updateQuery, updateValues, (updateErr, result) => {
        if (updateErr) {
          if (updateErr.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Email already exists' });
          }
          return res.status(500).json({ error: 'Database error' });
        }
        
        res.json({ 
          message: 'Teacher updated successfully',
          profilePhoto: profilePhoto ? `/uploads/${profilePhoto}` : undefined
        });
      });
    });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete teacher
router.delete('/teachers/:id', (req, res) => {
  const { id } = req.params;
  
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid teacher ID' });
  }

  const query = 'DELETE FROM Teachers WHERE id = ?';
  
  global.db.execute(query, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Teacher not found' });
    }
    
    res.json({ message: 'Teacher deleted successfully' });
  });
});

// Search teachers by city or email
router.get('/teachers/search', (req, res) => {
  const { cityOrTown, email } = req.query;
  
  let query = 'SELECT id, profilePhoto, email, phoneNumber, cityOrTown, createdAt FROM Teachers WHERE 1=1';
  const values = [];
  
  if (cityOrTown) {
    query += ' AND cityOrTown LIKE ?';
    values.push(`%${cityOrTown}%`);
  }
  
  if (email) {
    query += ' AND email LIKE ?';
    values.push(`%${email}%`);
  }
  
  query += ' ORDER BY createdAt DESC';
  
  global.db.execute(query, values, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    const teachers = results.map(teacher => ({
      ...teacher,
      profilePhoto: teacher.profilePhoto ? `/uploads/${teacher.profilePhoto}` : null
    }));
    
    res.json(teachers);
  });
});

// Change password
router.put('/teachers/:id/password', async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid teacher ID' });
    }

    // Get current password
    const selectQuery = 'SELECT password FROM Teachers WHERE id = ?';
    
    global.db.execute(selectQuery, [id], async (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (results.length === 0) {
        return res.status(404).json({ error: 'Teacher not found' });
      }
      
      try {
        const teacher = results[0];
        const isValidPassword = await bcrypt.compare(currentPassword, teacher.password);
        
        if (!isValidPassword) {
          return res.status(400).json({ error: 'Current password is incorrect' });
        }
        
        // Hash new password
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        
        // Update password
        const updateQuery = 'UPDATE Teachers SET password = ? WHERE id = ?';
        
        global.db.execute(updateQuery, [hashedNewPassword, id], (updateErr) => {
          if (updateErr) {
            return res.status(500).json({ error: 'Database error' });
          }
          
          res.json({ message: 'Password updated successfully' });
        });
        
      } catch (error) {
        res.status(500).json({ error: 'Password verification error' });
      }
    });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;