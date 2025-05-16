import React from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
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
import TeacherDashboard from './components/TeacherDashboard'
import './App.css'

// Wrapper component to handle layout
const LayoutWrapper = ({ children }) => {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');

  return (
    <div className={`App ${isDashboard ? 'dashboard-layout' : ''}`}>
      <Header />
      <main className={isDashboard ? 'dashboard-main' : ''}>{children}</main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
      <Router>
        <LayoutWrapper>
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
            <Route path="/dashboard/teacher" element={<TeacherDashboard />} />
          </Routes>
        </LayoutWrapper>
      </Router>
    </GoogleOAuthProvider>
  )
}

export default App