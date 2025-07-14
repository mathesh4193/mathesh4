import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Grid,
  Paper,
  Button,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  //Avatar,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import AddIcon from '@mui/icons-material/Add';

const WardenDashboard = () => {
  const navigate = useNavigate();
  const [wardenName, setWardenName] = useState('');
  const [dashboardStats, setDashboardStats] = useState({
    totalStudents: 0,
    pendingLeaves: 0,
    activeComplaints: 0,
    roomsOccupied: 0
  });
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState({
    stats: true,
    students: true,
    quickActions: false
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: '',
    regNo: '',
    roomNo: '',
    department: '',
    contact: '',
    parentContact: '',
    address: '',
    block: 'A' 
  });

  useEffect(() => {
    const wardenAuth = localStorage.getItem('role') === 'warden' && localStorage.getItem('token');
    if (!wardenAuth) {
      navigate('/');
    } else {
      const storedName = localStorage.getItem('wardenName') || 'Warden';
      setWardenName(storedName);
      fetchDashboardStats();
      fetchStudents();
    }
  }, [navigate]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(prev => ({ ...prev, stats: true }));
      
      const [studentsRes, leavesRes, complaintsRes, roomsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/students/count'),
        axios.get('http://localhost:5000/api/leave/pending-count'),
        axios.get('http://localhost:5000/api/complaint/active-count'),
        axios.get('http://localhost:5000/api/rooms/occupied-count')
      ]);

      setDashboardStats({
        totalStudents: studentsRes.data.count,
        pendingLeaves: leavesRes.data.count,
        activeComplaints: complaintsRes.data.count,
        roomsOccupied: roomsRes.data.count
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(prev => ({ ...prev, stats: false }));
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(prev => ({ ...prev, students: true }));
      const response = await axios.get('http://localhost:5000/api/students');
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to load student data');
    } finally {
      setLoading(prev => ({ ...prev, students: false }));
    }
  };

  const handleAddStudent = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewStudent({
      name: '',
      regNo: '',
      roomNo: '',
      department: '',
      contact: '',
      parentContact: '',
      address: '',
      block: 'A'
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewStudent(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitStudent = async () => {
    try {
      setLoading(prev => ({ ...prev, students: true }));
      const response = await axios.post('http://localhost:5000/api/students', newStudent);
      setStudents([response.data, ...students]);
      toast.success('Student added successfully');
      handleCloseDialog();
      fetchDashboardStats(); 
    } catch (error) {
      console.error('Error adding student:', error);
      toast.error('Failed to add student');
    } finally {
      setLoading(prev => ({ ...prev, students: false }));
    }
  };

  const handleQuickAction = (path) => {
    setLoading(prev => ({ ...prev, quickActions: true }));
    navigate(path);
  };

  const StatCard = ({ title, value, color }) => (
    <Paper
      sx={{
        p: 3,
        bgcolor: color,
        color: 'white',
        borderRadius: 2,
        height: '140px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}
    >
      <Typography variant="h6">{title}</Typography>
      {loading.stats ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="60%">
          <CircularProgress color="inherit" size={30} />
        </Box>
      ) : (
        <Typography variant="h3">{value}</Typography>
      )}
    </Paper>
  );

  const QuickActionCard = ({ title, icon, path }) => (
    <Grid item xs={12} sm={6} md={4}>
      <Paper 
        elevation={3}
        onClick={() => handleQuickAction(path)}
        sx={{
          bgcolor: '#2c387e',
          color: 'white',
          p: 3,
          textAlign: 'center',
          height: '200px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          transition: 'transform 0.3s',
          cursor: 'pointer',
          '&:hover': {
            transform: 'translateY(-5px)',
            bgcolor: '#3f51b5'
          }
        }}
      >
        <Box sx={{ color: '#fff', fontSize: '2.5rem' }}>
          {icon}
        </Box>
        <Typography variant="h6">{title}</Typography>
        <Button 
          variant="contained" 
          sx={{
            bgcolor: '#fff',
            color: '#2c387e',
            '&:hover': {
              bgcolor: '#e0e0e0'
            }
          }}
          disabled={loading.quickActions}
        >
          {loading.quickActions ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'MANAGE'
          )}
        </Button>
      </Paper>
    </Grid>
  );

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: '#f5f5f5',
      p: 4,
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <Typography variant="h4" sx={{ mb: 4, color: '#2c387e', textAlign: 'center' }}>
        Welcome back, {wardenName}!
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6} lg={3}>
          <StatCard 
            title="Total Students" 
            value={dashboardStats.totalStudents} 
            color="#2c387e" 
          />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <StatCard 
            title="Pending Leaves" 
            value={dashboardStats.pendingLeaves} 
            color="#3949ab" 
          />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <StatCard 
            title="Active Complaints" 
            value={dashboardStats.activeComplaints} 
            color="#1e88e5" 
          />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <StatCard 
            title="Rooms Occupied" 
            value={dashboardStats.roomsOccupied} 
            color="#0277bd" 
          />
        </Grid>
      </Grid>

      <Typography variant="h5" sx={{ mb: 3, color: '#2c387e', textAlign: 'center' }}>
        Quick Actions
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <QuickActionCard 
          title="Student Management" 
          icon={<PeopleIcon fontSize="large" />} 
          path="/warden/students" 
        />
        <QuickActionCard 
          title="Leave Requests" 
          icon={<AssignmentIcon fontSize="large" />} 
          path="/warden/leaverequests" 
        />
        <QuickActionCard 
          title="Complaints" 
          icon={<ReportProblemIcon fontSize="large" />} 
          path="/warden/complaints" 
        />
        <QuickActionCard 
          title="Outpass Requests" 
          icon={<ExitToAppIcon fontSize="large" />} 
          path="/warden/outpass" 
        />
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" sx={{ color: '#2c387e' }}>
          Student Directory
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleAddStudent}
          sx={{ bgcolor: '#2c387e', '&:hover': { bgcolor: '#3f51b5' } }}
        >
          Add Student
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#2c387e' }}>
              <TableCell sx={{ color: 'white' }}>Name</TableCell>
              <TableCell sx={{ color: 'white' }}>Reg No</TableCell>
              <TableCell sx={{ color: 'white' }}>Room No</TableCell>
              <TableCell sx={{ color: 'white' }}>Block</TableCell>
              <TableCell sx={{ color: 'white' }}>Department</TableCell>
              <TableCell sx={{ color: 'white' }}>Contact</TableCell>
              <TableCell sx={{ color: 'white' }}>Parent Contact</TableCell>
              <TableCell sx={{ color: 'white' }}>Address</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading.students ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : students.length > 0 ? (
              students.map((student) => (
                <TableRow key={student._id}>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.regNo}</TableCell>
                  <TableCell>{student.roomNo}</TableCell>
                  <TableCell>{student.block || 'N/A'}</TableCell>
                  <TableCell>{student.department}</TableCell>
                  <TableCell>{student.contact}</TableCell>
                  <TableCell>{student.parentContact}</TableCell>
                  <TableCell>{student.address || 'N/A'}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No students found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Add New Student</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Full Name"
                name="name"
                value={newStudent.name}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Registration Number"
                name="regNo"
                value={newStudent.regNo}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Room Number"
                name="roomNo"
                value={newStudent.roomNo}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Block"
                name="block"
                value={newStudent.block}
                onChange={handleInputChange}
                select
                SelectProps={{ native: true }}
              >
                {['A', 'B', 'C', 'D'].map((block) => (
                  <option key={block} value={block}>
                    Block {block}
                  </option>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Department"
                name="department"
                value={newStudent.department}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Contact Number"
                name="contact"
                value={newStudent.contact}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Parent Contact"
                name="parentContact"
                value={newStudent.parentContact}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                name="address"
                value={newStudent.address}
                onChange={handleInputChange}
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmitStudent} 
            variant="contained" 
            disabled={loading.students}
            sx={{ bgcolor: '#2c387e', '&:hover': { bgcolor: '#3f51b5' } }}
          >
            {loading.students ? <CircularProgress size={24} /> : 'Add Student'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WardenDashboard;