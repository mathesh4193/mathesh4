import React, { useState, useEffect, useCallback } from 'react';
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

  const api = axios.create({
    baseURL: 'http://localhost:5000/api/leave',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });

  const fetchLeaveRequests = useCallback(async () => {
    try {
      setLoading(true);
      const studentId = localStorage.getItem('studentId');
      if (!studentId) {
        toast.error('Student ID not found');
        return;
      }
      const response = await api.get(`/student/${studentId}`);
      setLeaveRequests(response.data);
    } catch (error) {
      handleApiError(error, 'Failed to fetch leave requests');
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    if (activeTab === 'history') {
      fetchLeaveRequests();
    }
  }, [activeTab, fetchLeaveRequests]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    if (formData.endDate < formData.startDate) {
      toast.error('End date must be after or same as Start date.');
      return;
    }

    try {
      setLoading(true);
      const studentId = localStorage.getItem('studentId');
      if (!studentId) throw new Error('Student ID not found');

      const requestData = {
        ...formData,
        studentId: String(studentId),
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        appliedOn: new Date().toISOString(),
        status: 'pending'
      };

      const response = await api.post('/', requestData);
      setLeaveRequests(prev => [response.data, ...prev]);
      resetForm();
      toast.success('Leave request submitted successfully!');
      setActiveTab('history');
    } catch (error) {
      handleApiError(error, 'Failed to submit leave request');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      leaveType: '',
      reason: '',
      startDate: '',
      endDate: '',
      parentContact: '',
      address: ''
    });
    setValidated(false);
  };

  const handleApiError = (error, defaultMessage) => {
    console.error('API Error:', error);
    const message = error.response?.data?.message || error.message || defaultMessage;
    toast.error(message);
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'warning',
      approved: 'success',
      rejected: 'danger'
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const minStartDate = new Date().toISOString().split('T')[0];
  const minEndDate = formData.startDate || minStartDate;

  return (
    <Container className="py-4">
      <Card className="shadow-sm">
        <Card.Header className="bg-primary text-white">
          <h4 className="mb-0">Leave Management</h4>
        </Card.Header>
        <Card.Body>
          <div className="mb-4">
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

          {loading ? (
            <div className="text-center py-4">
              <Spinner animation="border" role="status" />
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
                      placeholder="Enter contact number"
                      value={formData.parentContact}
                      onChange={handleChange}
                      disabled={loading}
                      pattern="[0-9]{10,15}"
                    />
                    <Form.Control.Feedback type="invalid">
                      Please provide a valid contact number.
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
                      min={minStartDate}
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
                      min={minEndDate}
                    />
                    <Form.Control.Feedback type="invalid">
                      End date must be after start date.
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
                      as="textarea"
                      rows={2}
                      name="address"
                      placeholder="Full address where you'll stay"
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
                      minLength={20}
                      placeholder="Detailed reason for leave"
                      value={formData.reason}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    <Form.Control.Feedback type="invalid">
                      Please provide a reason (minimum 20 characters).
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>

              <div className="d-grid gap-2">
                <Button variant="primary" type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Spinner as="span" size="sm" animation="border" role="status" />
                      <span className="ms-2">Submitting...</span>
                    </>
                  ) : 'Submit Leave Request'}
                </Button>
              </div>
            </Form>
          ) : (
            <>
              <h5 className="mb-3">Your Leave History</h5>
              {leaveRequests.length > 0 ? (
                <div className="table-responsive">
                  <Table striped bordered hover>
                    <thead className="table-dark">
                      <tr>
                        <th>Applied On</th>
                        <th>Type</th>
                        <th>Period</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaveRequests.map(request => (
                        <tr key={request._id}>
                          <td>{formatDate(request.appliedOn)}</td>
                          <td>{request.leaveType}</td>
                          <td>{formatDate(request.startDate)} to {formatDate(request.endDate)}</td>
                          <td>{getStatusBadge(request.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <Alert variant="info" className="text-center">
                  No leave requests found. Submit your first request using the "New Leave Request" tab.
                </Alert>
              )}
            </>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Leave;
