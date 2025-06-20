const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

// Simple middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Create uploads directory
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Simple database connection
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'tharindu2005V#',
  database: process.env.DB_NAME || 'student_platform'
});

// Connect to database
db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

// Make database available globally for route files
global.db = db;

// Simple file upload setup
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images allowed'));
    }
  }
});

// Create tables
db.execute(`
  CREATE TABLE IF NOT EXISTS StudentProfile (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phoneNumber VARCHAR(20),
    location VARCHAR(255),
    country VARCHAR(100),
    email VARCHAR(255) UNIQUE NOT NULL,
    profilePhoto VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`, (err) => {
  if (err) console.error('Error creating StudentProfile table:', err);
  else console.log('StudentProfile table ready');
});

db.execute(`
  CREATE TABLE IF NOT EXISTS StudentPost (
    id INT AUTO_INCREMENT PRIMARY KEY,
    studentId INT NOT NULL,
    lessonType ENUM('online', 'in-person') NOT NULL,
    subject VARCHAR(255) NOT NULL,
    headline VARCHAR(255) NOT NULL,
    description TEXT,
    townOrCity VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (studentId) REFERENCES StudentProfile(id) ON DELETE CASCADE
  )
`, (err) => {
  if (err) console.error('Error creating StudentPost table:', err);
  else console.log('StudentPost table ready');
});

// Create Teachers table
db.execute(`
  CREATE TABLE IF NOT EXISTS Teachers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    profilePhoto VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phoneNumber VARCHAR(20),
    cityOrTown VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )
`, (err) => {
  if (err) console.error('Error creating Teachers table:', err);
  else console.log('Teachers table ready');
});

db.execute(`
  CREATE TABLE IF NOT EXISTS TeachersPosts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    teacherId INT NOT NULL,
    headline VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    description TEXT,
    lessonType ENUM('in-person', 'online', 'both') NOT NULL,
    distanceFromLocation DECIMAL(5,2), -- in kilometers
    townOrDistrict VARCHAR(255),
    price DECIMAL(10,2) NOT NULL,
    priceType ENUM('hourly', 'monthly', 'daily') NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (teacherId) REFERENCES Teachers(id) ON DELETE CASCADE
  )
`, (err) => {
  if (err) console.error('Error creating TeachersPosts table:', err);
  else console.log('TeachersPosts table ready');
});

db.execute(`
  CREATE TABLE IF NOT EXISTS studentrequests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    postId INT NOT NULL,
    studentId INT NOT NULL,
    teacherId INT NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    reviewText TEXT,
    payed BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (postId) REFERENCES TeachersPosts(id) ON DELETE CASCADE,
    FOREIGN KEY (studentId) REFERENCES StudentProfile(id) ON DELETE CASCADE,
    FOREIGN KEY (teacherId) REFERENCES Teachers(id) ON DELETE CASCADE,
    UNIQUE KEY unique_student_post (studentId, postId)
  )
`, (err) => {
  if (err) console.error('Error creating Student Request table:', err);
  else console.log('Student Request table ready');
});

// Create TeacherPurchases table
db.execute(`
  CREATE TABLE IF NOT EXISTS TeacherPurchases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    studentPostId INT NOT NULL,
    teacherId INT NOT NULL,
    studentId INT NOT NULL,
    paymentAmount DECIMAL(10,2) NOT NULL,
    paymentStatus ENUM('paid', 'pending', 'failed') DEFAULT 'pending',
    phoneNumberAccess BOOLEAN DEFAULT FALSE,
    purchasedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (studentPostId) REFERENCES StudentPost(id) ON DELETE CASCADE,
    FOREIGN KEY (teacherId) REFERENCES Teachers(id) ON DELETE CASCADE,
    FOREIGN KEY (studentId) REFERENCES StudentProfile(id) ON DELETE CASCADE,
    UNIQUE KEY unique_teacher_purchase (teacherId, studentPostId)
  )
`, (err) => {
  if (err) console.error('Error creating TeacherPurchases table:', err);
  else console.log('TeacherPurchases table ready');
});

db.execute(`
  CREATE TABLE IF NOT EXISTS PostReviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    postId INT NOT NULL,
    studentId INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    reviewText TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (postId) REFERENCES TeachersPosts(id) ON DELETE CASCADE,
    FOREIGN KEY (studentId) REFERENCES StudentProfile(id) ON DELETE CASCADE,
    UNIQUE KEY unique_student_post_review (studentId, postId)
  )
`, (err) => {
  if (err) console.error('Error creating PostReviews table:', err);
  else console.log('PostReviews table ready');
});


// STUDENT ROUTES

// Register student
app.post('/api/students/register', upload.single('profilePhoto'), (req, res) => {
  const { name, phoneNumber, location, country, email } = req.body;
  const profilePhoto = req.file ? req.file.filename : null;

  if (!name || !email || !country) {
    return res.status(400).json({ error: 'Name, email, and country are required' });
  }

  const query = 'INSERT INTO StudentProfile (name, phoneNumber, location, country, email, profilePhoto) VALUES (?, ?, ?, ?, ?, ?)';
  
  db.execute(query, [name, phoneNumber, location, country, email, profilePhoto], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: 'Email already registered' });
      }
      return res.status(500).json({ error: 'Database error' });
    }
    
    res.status(201).json({
      message: 'Student registered successfully',
      studentId: result.insertId,
      profilePhoto: profilePhoto ? `/uploads/${profilePhoto}` : null
    });
  });
});

// Get all students
app.get('/api/students', (req, res) => {
  const query = 'SELECT id, name, phoneNumber, location, country, email, profilePhoto, createdAt FROM StudentProfile ORDER BY createdAt DESC';
  
  db.execute(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    const students = results.map(student => ({
      ...student,
      profilePhoto: student.profilePhoto ? `/uploads/${student.profilePhoto}` : null
    }));
    
    res.json(students);
  });
});

// Get student by ID
app.get('/api/students/:id', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT id, name, phoneNumber, location, country, email, profilePhoto, createdAt FROM StudentProfile WHERE id = ?';
  
  db.execute(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    const student = results[0];
    res.json({
      ...student,
      profilePhoto: student.profilePhoto ? `/uploads/${student.profilePhoto}` : null
    });
  });
});

// Update student
app.put('/api/students/:id', upload.single('profilePhoto'), (req, res) => {
  const { id } = req.params;
  const { name, phoneNumber, location, country, email } = req.body;
  const profilePhoto = req.file ? req.file.filename : null;

  let query = 'UPDATE StudentProfile SET ';
  const values = [];
  const updates = [];

  if (name) { updates.push('name = ?'); values.push(name); }
  if (phoneNumber) { updates.push('phoneNumber = ?'); values.push(phoneNumber); }
  if (location) { updates.push('location = ?'); values.push(location); }
  if (country) { updates.push('country = ?'); values.push(country); }
  if (email) { updates.push('email = ?'); values.push(email); }
  if (profilePhoto) { updates.push('profilePhoto = ?'); values.push(profilePhoto); }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  query += updates.join(', ') + ' WHERE id = ?';
  values.push(id);

  db.execute(query, values, (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    res.json({ 
      message: 'Student updated successfully',
      profilePhoto: profilePhoto ? `/uploads/${profilePhoto}` : undefined
    });
  });
});

// Delete student
app.delete('/api/students/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM StudentProfile WHERE id = ?';
  
  db.execute(query, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    res.json({ message: 'Student deleted successfully' });
  });
});

// STUDENT POST ROUTES

// Create post
app.post('/api/posts', (req, res) => {
  const { studentId, lessonType, subject, headline, description, townOrCity } = req.body;

  if (!studentId || !lessonType || !subject || !headline) {
    return res.status(400).json({ error: 'StudentId, lessonType, subject, and headline are required' });
  }

  if (!['online', 'in-person'].includes(lessonType)) {
    return res.status(400).json({ error: 'LessonType must be online or in-person' });
  }

  const query = 'INSERT INTO StudentPost (studentId, lessonType, subject, headline, description, townOrCity) VALUES (?, ?, ?, ?, ?, ?)';
  
  db.execute(query, [studentId, lessonType, subject, headline, description, townOrCity], (err, result) => {
    if (err) {
      if (err.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(404).json({ error: 'Student not found' });
      }
      return res.status(500).json({ error: 'Database error' });
    }
    
    res.status(201).json({
      message: 'Post created successfully',
      postId: result.insertId
    });
  });
});

// Get all posts
app.get('/api/posts', (req, res) => {
  const { lessonType, subject, townOrCity } = req.query;
  
  let query = `
    SELECT p.*, s.name as studentName, s.profilePhoto, s.location, s.country, s.email, s.phoneNumber
    FROM StudentPost p
    JOIN StudentProfile s ON p.studentId = s.id
    WHERE 1=1
  `;
  const values = [];

  if (lessonType) {
    query += ' AND p.lessonType = ?';
    values.push(lessonType);
  }
  if (subject) {
    query += ' AND p.subject LIKE ?';
    values.push(`%${subject}%`);
  }
  if (townOrCity) {
    query += ' AND p.townOrCity LIKE ?';
    values.push(`%${townOrCity}%`);
  }

  query += ' ORDER BY p.createdAt DESC';

  db.execute(query, values, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    const posts = results.map(post => ({
      ...post,
      profilePhoto: post.profilePhoto ? `/uploads/${post.profilePhoto}` : null
    }));
    
    res.json(posts);
  });
});


app.get('/api/students/:studentId/posts', (req, res) => {
  const { studentId } = req.params;
  const query = 'SELECT * FROM StudentPost WHERE studentId = ? ORDER BY createdAt DESC';
  
  db.execute(query, [studentId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});


app.get('/api/posts/:id', (req, res) => {
  const { id } = req.params;
  const query = `
    SELECT p.*, s.name as studentName, s.profilePhoto, s.email, s.phoneNumber, s.location, s.country
    FROM StudentPost p
    JOIN StudentProfile s ON p.studentId = s.id
    WHERE p.id = ?
  `;
  
  db.execute(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    const post = results[0];
    res.json({
      ...post,
      profilePhoto: post.profilePhoto ? `/uploads/${post.profilePhoto}` : null
    });
  });
});

// Update post
app.put('/api/posts/:id', (req, res) => {
  const { id } = req.params;
  const { lessonType, subject, headline, description, townOrCity } = req.body;

  let query = 'UPDATE StudentPost SET ';
  const values = [];
  const updates = [];

  if (lessonType) { updates.push('lessonType = ?'); values.push(lessonType); }
  if (subject) { updates.push('subject = ?'); values.push(subject); }
  if (headline) { updates.push('headline = ?'); values.push(headline); }
  if (description !== undefined) { updates.push('description = ?'); values.push(description); }
  if (townOrCity !== undefined) { updates.push('townOrCity = ?'); values.push(townOrCity); }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  query += updates.join(', ') + ' WHERE id = ?';
  values.push(id);

  db.execute(query, values, (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    res.json({ message: 'Post updated successfully' });
  });
});


app.delete('/api/posts/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM StudentPost WHERE id = ?';
  
  db.execute(query, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    res.json({ message: 'Post deleted successfully' });
  });
});


const teacherPostsRoutes = require('./teacher');
app.use('/api', teacherPostsRoutes);

const teacherPosts = require('./teachersposts');
app.use('/post', teacherPosts);




app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Student Platform with Teacher Integration');
});

module.exports = app;