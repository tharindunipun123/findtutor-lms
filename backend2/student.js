// const express = require('express');
// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');
// const { body, validationResult } = require('express-validator');

// const router = express.Router();

// // Create uploads directory if it doesn't exist
// if (!fs.existsSync('uploads')) {
//   fs.mkdirSync('uploads');
// }

// // Multer configuration for file uploads
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/');
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//     cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
//   }
// });

// const upload = multer({
//   storage: storage,
//   limits: {
//     fileSize: 5 * 1024 * 1024 // 5MB limit
//   },
//   fileFilter: (req, file, cb) => {
//     const allowedTypes = /jpeg|jpg|png|gif/;
//     const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
//     const mimetype = allowedTypes.test(file.mimetype);
    
//     if (mimetype && extname) {
//       return cb(null, true);
//     } else {
//       cb(new Error('Only image files are allowed'));
//     }
//   }
// });

// // Validation middleware
// const handleValidationErrors = (req, res, next) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(400).json({ errors: errors.array() });
//   }
//   next();
// };

// // ==================== STUDENT PROFILE ROUTES ====================

// // Student Registration
// router.post('/students/register', 
//   upload.single('profilePhoto'),
//   [
//     body('name').notEmpty().withMessage('Name is required'),
//     body('email').isEmail().withMessage('Valid email is required'),
//     body('phoneNumber').optional().isMobilePhone().withMessage('Valid phone number required'),
//     body('country').notEmpty().withMessage('Country is required')
//   ],
//   handleValidationErrors,
//   async (req, res) => {
//     try {
//       const { name, phoneNumber, location, country, email } = req.body;
//       const profilePhoto = req.file ? req.file.filename : null;

//       // Check if email already exists
//       const [existingUser] = await global.db.execute(
//         'SELECT id FROM StudentProfile WHERE email = ?',
//         [email]
//       );

//       if (existingUser.length > 0) {
//         return res.status(400).json({ error: 'Email already registered' });
//       }

//       // Insert new student
//       const [result] = await global.db.execute(
//         'INSERT INTO StudentProfile (name, phoneNumber, location, country, email, profilePhoto) VALUES (?, ?, ?, ?, ?, ?)',
//         [name, phoneNumber, location, country, email, profilePhoto]
//       );

//       res.status(201).json({
//         message: 'Student registered successfully',
//         studentId: result.insertId,
//         profilePhoto: profilePhoto ? `/uploads/${profilePhoto}` : null
//       });
//     } catch (error) {
//       console.error('Registration error:', error);
//       res.status(500).json({ error: 'Internal server error' });
//     }
//   }
// );

// // Get all students
// router.get('/students', async (req, res) => {
//   try {
//     const [students] = await global.db.execute(
//       'SELECT id, name, phoneNumber, location, country, email, profilePhoto, createdAt FROM StudentProfile ORDER BY createdAt DESC'
//     );

//     const studentsWithPhotos = students.map(student => ({
//       ...student,
//       profilePhoto: student.profilePhoto ? `/uploads/${student.profilePhoto}` : null
//     }));

//     res.json(studentsWithPhotos);
//   } catch (error) {
//     console.error('Error fetching students:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// // Get student by ID
// router.get('/students/:id', async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Validate id is a number
//     if (isNaN(id)) {
//       return res.status(400).json({ error: 'Invalid student ID' });
//     }

//     const [students] = await global.db.execute(
//       'SELECT id, name, phoneNumber, location, country, email, profilePhoto, createdAt FROM StudentProfile WHERE id = ?',
//       [id]
//     );

//     if (students.length === 0) {
//       return res.status(404).json({ error: 'Student not found' });
//     }

//     const student = students[0];
//     res.json({
//       ...student,
//       profilePhoto: student.profilePhoto ? `/uploads/${student.profilePhoto}` : null
//     });
//   } catch (error) {
//     console.error('Error fetching student:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// // Update student profile
// router.put('/students/:id',
//   upload.single('profilePhoto'),
//   [
//     body('name').optional().notEmpty().withMessage('Name cannot be empty'),
//     body('email').optional().isEmail().withMessage('Valid email is required'),
//     body('phoneNumber').optional().isMobilePhone().withMessage('Valid phone number required')
//   ],
//   handleValidationErrors,
//   async (req, res) => {
//     try {
//       const { id } = req.params;
//       const { name, phoneNumber, location, country, email } = req.body;

//       // Validate id is a number
//       if (isNaN(id)) {
//         return res.status(400).json({ error: 'Invalid student ID' });
//       }

//       // Check if student exists
//       const [existingStudent] = await global.db.execute(
//         'SELECT id FROM StudentProfile WHERE id = ?',
//         [id]
//       );

//       if (existingStudent.length === 0) {
//         return res.status(404).json({ error: 'Student not found' });
//       }

//       let updateQuery = 'UPDATE StudentProfile SET ';
//       const updateValues = [];
//       const updates = [];

//       if (name) {
//         updates.push('name = ?');
//         updateValues.push(name);
//       }
//       if (phoneNumber) {
//         updates.push('phoneNumber = ?');
//         updateValues.push(phoneNumber);
//       }
//       if (location) {
//         updates.push('location = ?');
//         updateValues.push(location);
//       }
//       if (country) {
//         updates.push('country = ?');
//         updateValues.push(country);
//       }
//       if (email) {
//         updates.push('email = ?');
//         updateValues.push(email);
//       }
//       if (req.file) {
//         updates.push('profilePhoto = ?');
//         updateValues.push(req.file.filename);
//       }

//       if (updates.length === 0) {
//         return res.status(400).json({ error: 'No fields to update' });
//       }

//       updateQuery += updates.join(', ') + ' WHERE id = ?';
//       updateValues.push(id);

//       await global.db.execute(updateQuery, updateValues);

//       res.json({ 
//         message: 'Profile updated successfully',
//         profilePhoto: req.file ? `/uploads/${req.file.filename}` : undefined
//       });
//     } catch (error) {
//       console.error('Error updating student:', error);
//       res.status(500).json({ error: 'Internal server error' });
//     }
//   }
// );

// // Delete student
// router.delete('/students/:id', async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Validate id is a number
//     if (isNaN(id)) {
//       return res.status(400).json({ error: 'Invalid student ID' });
//     }

//     // Check if student exists
//     const [existingStudent] = await global.db.execute(
//       'SELECT id FROM StudentProfile WHERE id = ?',
//       [id]
//     );

//     if (existingStudent.length === 0) {
//       return res.status(404).json({ error: 'Student not found' });
//     }

//     await global.db.execute('DELETE FROM StudentProfile WHERE id = ?', [id]);
//     res.json({ message: 'Student deleted successfully' });
//   } catch (error) {
//     console.error('Error deleting student:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// module.exports = router;