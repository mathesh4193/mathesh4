import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Table, Button, Modal, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// VCET Campus Coordinates
const VCET_COORDS = {
  latitude: 9.8945572,
  longitude: 78.1776890,
  radius: 200  // Campus radius in meters
};

const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth radius in meters
  const toRadians = (deg) => (deg * Math.PI) / 180;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const Attendance = () => {
  const [location, setLocation] = useState(null);
  const [distance, setDistance] = useState(null);
  const [isInCampus, setIsInCampus] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState({
    location: true,
    attendance: false,
    data: true
  });
  const [address, setAddress] = useState("");
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [showModal, setShowModal] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState('');
  const [attendanceMessage, setAttendanceMessage] = useState('');
  const [attendanceData, setAttendanceData] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    present: 0,
    percentage: 0
  });

  // API endpoints
  const API_URL = 'http://localhost:5000/api/attendance';

  // Fetch attendance data when month changes
  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        setLoading(prev => ({ ...prev, data: true }));
        const studentId = localStorage.getItem('studentId') || 'current-user-id';
        const response = await axios.get(`${API_URL}?studentId=${studentId}&month=${month}`);
        setAttendanceData(response.data);
        calculateStats(response.data);
      } catch (error) {
        toast.error('Failed to fetch attendance data');
        console.error('Error fetching attendance:', error);
      } finally {
        setLoading(prev => ({ ...prev, data: false }));
      }
    };

    fetchAttendanceData();
  }, [month]);

  // Get current location on component mount
  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");
      setLoading(prev => ({ ...prev, location: false }));
      return;
    }

    const fetchLocation = async () => {
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          });
        });

        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
        const calculatedDistance = getDistance(latitude, longitude, VCET_COORDS.latitude, VCET_COORDS.longitude);
        setDistance(Math.round(calculatedDistance));
        setIsInCampus(calculatedDistance <= VCET_COORDS.radius);

        if (calculatedDistance > VCET_COORDS.radius) {
          setError(`You are ${Math.round(calculatedDistance)}m away from VCET.`);
        } else {
          setError("");
        }

        // Fetch address using OpenStreetMap Nominatim API
        const addressResponse = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
        );
        const addressData = await addressResponse.json();
        setAddress(addressData.display_name || "Location not found");

      } catch (err) {
        setError(err.message.includes('denied') 
          ? "Location access denied. Please enable GPS." 
          : "Failed to get your location. Please try again.");
      } finally {
        setLoading(prev => ({ ...prev, location: false }));
      }
    };

    fetchLocation();
  }, []);

  const calculateStats = (data) => {
    const total = data.length;
    const present = data.filter(day => day.status === 'Present').length;
    const percentage = total > 0 ? ((present / total) * 100).toFixed(2) : 0;
    setStats({ total, present, percentage });
  };

  const markAttendance = async () => {
    try {
      setLoading(prev => ({ ...prev, attendance: true }));
      const student = JSON.parse(localStorage.getItem('student')) || {};

      const attendancePayload = {
        studentId: student.id || student._id,
        studentName: student.name || 'Student',
        regNo: student.regNo || 'N/A',
        status: isInCampus ? 'Present' : 'Absent',
        timestamp: new Date().toISOString(),
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
          address: address
        },
        distanceFromCampus: distance,
        month: new Date().toISOString().slice(0, 7)
      };

      // Send attendance to backend
      const response = await axios.post(API_URL, attendancePayload);
      
      // Update local state with new attendance record
      const updatedAttendance = [response.data, ...attendanceData];
      setAttendanceData(updatedAttendance);
      calculateStats(updatedAttendance);

      // Show success feedback
      setAttendanceStatus(isInCampus ? 'PRESENT' : 'ABSENT');
      setAttendanceMessage(
        isInCampus
          ? 'Your attendance has been marked successfully!'
          : `You are ${distance}m away from VCET. Absence has been recorded.`
      );
      setShowModal(true);

      toast.success('Attendance recorded successfully!');

    } catch (error) {
      console.error('Error marking attendance:', error);
      setAttendanceStatus('ERROR');
      setAttendanceMessage('Failed to mark attendance. Please try again.');
      setShowModal(true);
      toast.error('Failed to mark attendance');
    } finally {
      setLoading(prev => ({ ...prev, attendance: false }));
    }
  };

  return (
    <Container className="py-4">
      <h2 className="text-center mb-4">Attendance System</h2>

      {/* Current Status Card */}
      <Card className="mb-4 shadow-sm">
        <Card.Header className="bg-primary text-white py-3">
          <h5 className="mb-0">Current Status</h5>
        </Card.Header>
        <Card.Body>
          {loading.location ? (
            <div className="text-center py-3">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Detecting your location...</p>
            </div>
          ) : (
            <>
              {error && <Alert variant="danger">{error}</Alert>}
              {location && (
                <div>
                  <div className="mb-3 p-3 bg-light rounded">
                    <p className="mb-2">
                      <strong>Status: </strong>
                      <span className={`badge ${isInCampus ? "bg-success" : "bg-danger"}`}>
                        {isInCampus ? "INSIDE CAMPUS" : "OUTSIDE CAMPUS"}
                      </span>
                    </p>
                    <p className="mb-1"><strong>Your Location: </strong>{address}</p>
                    {distance && <p className="mb-0"><strong>Distance from VCET: </strong>{distance}m</p>}
                  </div>
                  <Button
                    variant={isInCampus ? "success" : "danger"}
                    size="lg"
                    className="w-100"
                    onClick={markAttendance}
                    disabled={!location || !!error || loading.attendance}
                  >
                    {loading.attendance ? (
                      <>
                        <Spinner as="span" animation="border" size="sm" className="me-2" />
                        Processing...
                      </>
                    ) : (
                      `MARK ${isInCampus ? "PRESENT" : "ABSENT"}`
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </Card.Body>
      </Card>

      {/* Attendance Statistics */}
      <Row className="mb-4 g-3">
        <Col md={4}>
          <Card className="h-100 text-center border-primary">
            <Card.Body>
              <Card.Title>Total Days</Card.Title>
              <Card.Text className="display-4">{stats.total}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100 text-center border-success">
            <Card.Body>
              <Card.Title>Present Days</Card.Title>
              <Card.Text className="display-4 text-success">{stats.present}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100 text-center border-info">
            <Card.Body>
              <Card.Title>Attendance %</Card.Title>
              <Card.Text className="display-4 text-info">{stats.percentage}%</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Attendance History */}
      <Card className="shadow-sm">
        <Card.Header className="bg-light d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Attendance History</h5>
          <Form.Group className="mb-0" style={{ width: '200px' }}>
            <Form.Control
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            />
          </Form.Group>
        </Card.Header>
        <Card.Body>
          {loading.data ? (
            <div className="text-center py-4">
              <Spinner animation="border" />
              <p>Loading attendance records...</p>
            </div>
          ) : attendanceData.length > 0 ? (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Location</th>
                  <th>Distance</th>
                </tr>
              </thead>
              <tbody>
                {attendanceData.map((record, index) => (
                  <tr key={index}>
                    <td>{new Date(record.timestamp).toLocaleDateString()}</td>
                    <td>{new Date(record.timestamp).toLocaleTimeString()}</td>
                    <td>
                      <span className={`badge ${record.status === 'Present' ? 'bg-success' : 'bg-danger'}`}>
                        {record.status}
                      </span>
                    </td>
                    <td>{record.location?.address || 'N/A'}</td>
                    <td>{record.distanceFromCampus ? `${record.distanceFromCampus}m` : 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <Alert variant="info" className="text-center">
              No attendance records found for this month.
            </Alert>
          )}
        </Card.Body>
      </Card>

      {/* Attendance Confirmation Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header 
          closeButton 
          className={`text-white ${attendanceStatus === 'PRESENT' ? 'bg-success' : attendanceStatus === 'ABSENT' ? 'bg-danger' : 'bg-warning'}`}
        >
          <Modal.Title>{attendanceStatus}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{attendanceMessage}</p>
          {location && (
            <div className="mt-3 p-2 bg-light rounded">
              <p className="mb-1"><strong>Location:</strong> {address}</p>
              <p className="mb-0"><strong>Coordinates:</strong> {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Attendance;