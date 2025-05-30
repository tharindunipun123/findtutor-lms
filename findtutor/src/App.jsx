import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import EduLink from './components/homepage'
import About from './components/about'
import Header from './components/header'
import Pricing from './components/pricing'
import Contact from './components/contact'
import FindTeachers from './components/findTeachers'
import Footer from './components/footer'
import StudentPosts from './components/studentPosts'
import StudentAuth from './components/auth/StudentAuth'
import TeacherAuth from './components/auth/TeacherAuth'
import TeacherDashboard from './components/dashboard/TeacherDashboard'
import './App.css'

// Protected Route component
const ProtectedRoute = ({ children, userType }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/" />;
  }

  if (userType && user.userType !== userType) {
    return <Navigate to="/" />;
  }

  return children;
};

const AppContent = () => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />
      <main className="flex-grow-1">
        <Routes>
          <Route path="/" element={<EduLink />} />
          <Route path="/about" element={<About />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/find-teachers" element={<FindTeachers />} />
          <Route path="/student-posts" element={<StudentPosts />} />
          <Route path="/login/student" element={<StudentAuth isLogin={true} />} />
          <Route path="/login/teacher" element={<TeacherAuth isLogin={true} />} />
          <Route path="/register/student" element={<StudentAuth isLogin={false} />} />
          <Route path="/register/teacher" element={<TeacherAuth isLogin={false} />} />
          <Route
            path="/dashboard/teacher"
            element={
              <ProtectedRoute userType="teacher">
                <TeacherDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  )
}

export default App