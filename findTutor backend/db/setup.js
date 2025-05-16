const mysql = require('mysql2/promise');
require('dotenv').config();

// Database schema as a string (from your paste.txt file)
const schema = `
-- Create database
CREATE DATABASE IF NOT EXISTS tutor_finder;
USE tutor_finder;

-- Users table (shared for both teachers and students)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role ENUM('student', 'teacher') NOT NULL,
  profile_picture VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Student profiles
CREATE TABLE IF NOT EXISTS student_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  bio TEXT,
  education_level VARCHAR(255),
  location VARCHAR(255),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Teacher profiles
CREATE TABLE IF NOT EXISTS teacher_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  bio TEXT,
  years_experience INT,
  education VARCHAR(255),
  hourly_rate DECIMAL(10, 2),
  availability TEXT,
  location VARCHAR(255),
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  is_subscribed BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Subjects table
CREATE TABLE IF NOT EXISTS subjects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE
);

-- Teacher subjects (many-to-many relationship)
CREATE TABLE IF NOT EXISTS teacher_subjects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  teacher_id INT NOT NULL,
  subject_id INT NOT NULL,
  FOREIGN KEY (teacher_id) REFERENCES teacher_profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
  UNIQUE KEY unique_teacher_subject (teacher_id, subject_id)
);

-- Class listings
CREATE TABLE IF NOT EXISTS classes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  teacher_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  subject_id INT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  location VARCHAR(255),
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  is_online BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (teacher_id) REFERENCES teacher_profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE RESTRICT
);

-- Student requests
CREATE TABLE IF NOT EXISTS requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  teacher_id INT NOT NULL,
  subject_id INT NOT NULL,
  class_id INT,
  message TEXT NOT NULL,
  budget DECIMAL(10, 2),
  location VARCHAR(255),
  status ENUM('pending', 'accepted', 'declined', 'completed') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (teacher_id) REFERENCES teacher_profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE RESTRICT,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL
);

-- Subscription plans
CREATE TABLE IF NOT EXISTS subscription_plans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price_monthly DECIMAL(10, 2) NOT NULL,
  price_yearly DECIMAL(10, 2) NOT NULL,
  features JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Teacher subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  teacher_id INT NOT NULL,
  plan_id INT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  payment_status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
  is_yearly BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (teacher_id) REFERENCES teacher_profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (plan_id) REFERENCES subscription_plans(id) ON DELETE RESTRICT
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
`;

// Initial data for subscription plans and subjects
const initialData = `
-- Insert some initial subscription plans (only if none exist)
INSERT INTO subscription_plans (name, price_monthly, price_yearly, features)
SELECT * FROM (SELECT 'Basic', 9.99, 99.99, '["View student requests", "Create up to 5 classes"]') AS tmp
WHERE NOT EXISTS (SELECT name FROM subscription_plans WHERE name = 'Basic');

INSERT INTO subscription_plans (name, price_monthly, price_yearly, features)
SELECT * FROM (SELECT 'Pro', 19.99, 199.99, '["View student requests", "Unlimited classes", "Featured listing"]') AS tmp
WHERE NOT EXISTS (SELECT name FROM subscription_plans WHERE name = 'Pro');

INSERT INTO subscription_plans (name, price_monthly, price_yearly, features)
SELECT * FROM (SELECT 'Premium', 29.99, 299.99, '["View student requests", "Unlimited classes", "Featured listing", "Priority support", "Analytics dashboard"]') AS tmp
WHERE NOT EXISTS (SELECT name FROM subscription_plans WHERE name = 'Premium');

-- Insert some initial subjects (only if none exist)
INSERT INTO subjects (name)
SELECT * FROM (SELECT 'Mathematics') AS tmp
WHERE NOT EXISTS (SELECT name FROM subjects WHERE name = 'Mathematics');

INSERT INTO subjects (name)
SELECT * FROM (SELECT 'Physics') AS tmp
WHERE NOT EXISTS (SELECT name FROM subjects WHERE name = 'Physics');

INSERT INTO subjects (name)
SELECT * FROM (SELECT 'Chemistry') AS tmp
WHERE NOT EXISTS (SELECT name FROM subjects WHERE name = 'Chemistry');

INSERT INTO subjects (name)
SELECT * FROM (SELECT 'Biology') AS tmp
WHERE NOT EXISTS (SELECT name FROM subjects WHERE name = 'Biology');

INSERT INTO subjects (name)
SELECT * FROM (SELECT 'English') AS tmp
WHERE NOT EXISTS (SELECT name FROM subjects WHERE name = 'English');

INSERT INTO subjects (name)
SELECT * FROM (SELECT 'History') AS tmp
WHERE NOT EXISTS (SELECT name FROM subjects WHERE name = 'History');

INSERT INTO subjects (name)
SELECT * FROM (SELECT 'Computer Science') AS tmp
WHERE NOT EXISTS (SELECT name FROM subjects WHERE name = 'Computer Science');

INSERT INTO subjects (name)
SELECT * FROM (SELECT 'French') AS tmp
WHERE NOT EXISTS (SELECT name FROM subjects WHERE name = 'French');

INSERT INTO subjects (name)
SELECT * FROM (SELECT 'Spanish') AS tmp
WHERE NOT EXISTS (SELECT name FROM subjects WHERE name = 'Spanish');

INSERT INTO subjects (name)
SELECT * FROM (SELECT 'Music') AS tmp
WHERE NOT EXISTS (SELECT name FROM subjects WHERE name = 'Music');

INSERT INTO subjects (name)
SELECT * FROM (SELECT 'Art') AS tmp
WHERE NOT EXISTS (SELECT name FROM subjects WHERE name = 'Art');
`;

/**
 * Initialize database with tables and initial data
 */
async function initializeDatabase() {
  try {
    console.log('Initializing database...');
    
    // First connect without specifying database to create it if it doesn't exist
    const rootConnection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password:'tharindu2005V#',
      multipleStatements: true // This allows us to run multiple SQL statements at once
    });

    // Create database if it doesn't exist and use it
    await rootConnection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'tutor_finder'}`);
    await rootConnection.query(`USE ${process.env.DB_NAME || 'tutor_finder'}`);
    
    // Create tables
    console.log('Creating tables...');
    await rootConnection.query(schema);
    
    // Insert initial data
    console.log('Inserting initial data...');
    await rootConnection.query(initialData);
    
    await rootConnection.end();
    console.log('Database initialization completed!');
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    return false;
  }
}

module.exports = { initializeDatabase };