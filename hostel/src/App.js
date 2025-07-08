import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import Layout and Components
import Layout from './components/Layout/Layout';
import Home from './components/Home/Home';
import SignIn from './components/Auth/SignIn';
import StudentDashboard from './components/Dashboard/StudentDashboard';
import WardenDashboard from './components/Dashboard/WardenDashboard';
import AdminDashboard from './components/Dashboard/AdminDashboard';
import About from './components/About/About';
import Leave from './components/Leave/Leave';
import Complaints from './components/Complaints/Complaints';
import OutpassForm from './components/Outpass/OutpassForm';
import Attendance from './components/Attendance/Attendance.jsx';
import Students from './components/Warden/Students';
import LeaveRequests from './components/Warden/LeaveRequests';
import PrivateRoute from './components/Auth/PrivateRoute';
import WardenComplaints from './components/Warden/Complaints';
import Outpass from './components/Warden/Outpass';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* Main Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<SignIn />} />
          
          {/* Student Dashboard Routes - Protected with PrivateRoute */}
          <Route path="/student/dashboard" element={<PrivateRoute><StudentDashboard /></PrivateRoute>} />
          <Route path="/student/dashboard/leave" element={<PrivateRoute><Leave /></PrivateRoute>} />
          <Route path="/student/dashboard/outpass" element={<PrivateRoute><OutpassForm /></PrivateRoute>} />
          <Route path="/student/dashboard/complaints" element={<PrivateRoute><Complaints /></PrivateRoute>} />
          <Route path="/student/dashboard/attendance" element={<PrivateRoute><Attendance /></PrivateRoute>} />

          {/* Warden Dashboard */}
          <Route path="/warden/dashboard" element={<PrivateRoute><WardenDashboard /></PrivateRoute>} />
          <Route path="/admin/dashboard" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />

          {/* Warden Management Routes */}
          <Route path="/warden/students" element={<PrivateRoute><Students /></PrivateRoute>} />
          <Route path="/warden/leaverequests" element={<PrivateRoute><LeaveRequests /></PrivateRoute>} />
          <Route path="/warden/outpass" element={<PrivateRoute><Outpass /></PrivateRoute>} />
          <Route path="/warden/complaints" element={<PrivateRoute><WardenComplaints /></PrivateRoute>} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;