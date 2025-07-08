import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Row, Col, Card, Alert, Table, Badge, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Leave = () => {
  const [activeTab, setActiveTab] = useState('new');
  const [formData, setFormData] = useState({
    leaveType: '',
    reason: '',
    startDate: '',
    endDate: '',
    parentContact: '',
    address: ''
  });
  const [validated, setValidated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [leaveRequests, setLeaveRequests] = useState([]);
  
  // API base URL
  const API_URL = 'http://localhost:5000/api/leave';

  // Fetch leave requests on component mount and when tab changes
  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        setLoading(true);
        // Replace with actual student ID from auth context or localStorage
        const studentId = localStorage.getItem('studentId');
        const response = await axios.get(`${API_URL}/student/${studentId}`);
        setLeaveRequests(response.data);
      } catch (error) {
        toast.error('Failed to fetch leave requests');
        console.error('Error fetching leave requests:', error);
      } finally {
        setLoading(false);
      }
    };

    if (activeTab === 'history') {
      fetchLeaveRequests();
    }
  }, [activeTab]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    try {
      setLoading(true);
      // Replace with actual student ID from auth context or localStorage
      const studentId = localStorage.getItem('studentId');
      
      const requestData = {
        ...formData,
        studentId,
        status: 'pending',
        appliedOn: new Date().toISOString()
      };

      const response = await axios.post(API_URL, requestData);
      
      // Update local state with the new leave request
      setLeaveRequests([response.data, ...leaveRequests]);
      
      // Reset form
      setFormData({
        leaveType: '',
        reason: '',
        startDate: '',
        endDate: '',
        parentContact: '',
        address: ''
      });
      setValidated(false);
      
      // Show success message
      toast.success('Leave request submitted successfully!');
      
      // Switch to history tab to see the new request
      setActiveTab('history');
    } catch (error) {
      toast.error('Failed to submit leave request');
      console.error('Error submitting leave request:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending':
        return <Badge bg="warning">Pending</Badge>;
      case 'approved':
        return <Badge bg="success">Approved</Badge>;
      case 'rejected':
        return <Badge bg="danger">Rejected</Badge>;
      default:
        return <Badge bg="secondary">Unknown</Badge>;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Container className="py-4">
      <Card className="shadow-sm">
        <Card.Header className="bg-primary text-white">
          <h4 className="mb-0">Leave Management</h4>
        </Card.Header>
        <Card.Body>
          <div className="mb-4">
            <Row>
              <Col>
                <div className="d-flex">
                  <Button 
                    variant={activeTab === 'new' ? 'primary' : 'outline-primary'} 
                    className="me-2"
                    onClick={() => setActiveTab('new')}
                    disabled={loading}
                  >
                    New Leave Request
                  </Button>
                  <Button 
                    variant={activeTab === 'history' ? 'primary' : 'outline-primary'} 
                    onClick={() => setActiveTab('history')}
                    disabled={loading}
                  >
                    Leave History
                  </Button>
                </div>
              </Col>
            </Row>
          </div>

          {loading ? (
            <div className="text-center py-4">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
              <p>Loading data...</p>
            </div>
          ) : activeTab === 'new' ? (
            <Form noValidate validated={validated} onSubmit={handleSubmit}>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group controlId="leaveType">
                    <Form.Label>Leave Type</Form.Label>
                    <Form.Select
                      required
                      name="leaveType"
                      value={formData.leaveType}
                      onChange={handleChange}
                      disabled={loading}
                    >
                      <option value="">Select Leave Type</option>
                      <option value="Home Visit">Home Visit</option>
                      <option value="Medical">Medical</option>
                      <option value="Emergency">Emergency</option>
                      <option value="Other">Other</option>
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      Please select a leave type.
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="parentContact">
                    <Form.Label>Parent/Guardian Contact</Form.Label>
                    <Form.Control
                      required
                      type="tel"
                      name="parentContact"
                      placeholder="Enter parent/guardian contact number"
                      value={formData.parentContact}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    <Form.Control.Feedback type="invalid">
                      Please provide a contact number.
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group controlId="startDate">
                    <Form.Label>Start Date</Form.Label>
                    <Form.Control
                      required
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                      disabled={loading}
                      min={new Date().toISOString().split('T')[0]}
                    />
                    <Form.Control.Feedback type="invalid">
                      Please select a valid start date.
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="endDate">
                    <Form.Label>End Date</Form.Label>
                    <Form.Control
                      required
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleChange}
                      disabled={loading}
                      min={formData.startDate || new Date().toISOString().split('T')[0]}
                    />
                    <Form.Control.Feedback type="invalid">
                      Please select a valid end date.
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={12}>
                  <Form.Group controlId="address">
                    <Form.Label>Address During Leave</Form.Label>
                    <Form.Control
                      required
                      type="text"
                      name="address"
                      placeholder="Enter your address during leave period"
                      value={formData.address}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    <Form.Control.Feedback type="invalid">
                      Please provide an address.
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-4">
                <Col md={12}>
                  <Form.Group controlId="reason">
                    <Form.Label>Reason for Leave</Form.Label>
                    <Form.Control
                      required
                      as="textarea"
                      rows={4}
                      name="reason"
                      placeholder="Explain the reason for your leave request"
                      value={formData.reason}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    <Form.Control.Feedback type="invalid">
                      Please provide a reason for your leave.
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>

              <div className="d-grid">
                <Button variant="primary" type="submit" disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Leave Request'}
                </Button>
              </div>
            </Form>
          ) : (
            <div className="table-responsive">
              {leaveRequests.length > 0 ? (
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Applied On</th>
                      <th>Type</th>
                      <th>From</th>
                      <th>To</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaveRequests.map(request => (
                      <tr key={request._id}>
                        <td>{formatDate(request.appliedOn)}</td>
                        <td>{request.leaveType}</td>
                        <td>{formatDate(request.startDate)}</td>
                        <td>{formatDate(request.endDate)}</td>
                        <td>{getStatusBadge(request.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <Alert variant="info">
                  You haven't submitted any leave requests yet.
                </Alert>
              )}
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Leave;