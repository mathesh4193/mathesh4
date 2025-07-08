import React, { useState, useEffect } from 'react';
import { Table, Button, Badge, Spinner, Container, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const LeaveRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/leave/warden');
        if (!response.ok) throw new Error('Failed to fetch requests');
        const data = await response.json();
        setRequests(data);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaveRequests();
  }, []);

  const updateRequestStatus = async (id, status) => {
    try {
      setUpdating(true);
      const response = await fetch(`http://localhost:5000/api/leave/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      
      if (!response.ok) throw new Error('Update failed');
      
      setRequests(requests.map(req => 
        req._id === id ? { ...req, status } : req
      ));
      toast.success(`Leave request ${status.toLowerCase()}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return (
    <Container className="text-center py-5">
      <Spinner animation="border" />
    </Container>
  );

  return (
    <Container className="py-4">
      <h2 className="text-center mb-4">Leave Requests</h2>
      
      {requests.length === 0 ? (
        <Alert variant="info" className="text-center">
          No pending leave requests
        </Alert>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Student</th>
              <th>Reg No</th>
              <th>Room</th>
              <th>Reason</th>
              <th>From</th>
              <th>To</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(request => (
              <tr key={request._id}>
                <td>{request.studentName}</td>
                <td>{request.regNo}</td>
                <td>{request.roomNo}</td>
                <td>{request.reason}</td>
                <td>{new Date(request.fromDate).toLocaleDateString()}</td>
                <td>{new Date(request.toDate).toLocaleDateString()}</td>
                <td>
                  <Badge 
                    bg={
                      request.status === 'Pending' ? 'warning' :
                      request.status === 'Approved' ? 'success' : 'danger'
                    }
                  >
                    {request.status}
                  </Badge>
                </td>
                <td>
                  {request.status === 'Pending' && (
                    <>
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => updateRequestStatus(request._id, 'Approved')}
                        disabled={updating}
                      >
                        {updating ? <Spinner size="sm" /> : 'Approve'}
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        className="ms-2"
                        onClick={() => updateRequestStatus(request._id, 'Rejected')}
                        disabled={updating}
                      >
                        {updating ? <Spinner size="sm" /> : 'Reject'}
                      </Button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default LeaveRequests;