import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Table, Button, Badge, Spinner, Container } from 'react-bootstrap';

const Complaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/complaint');
        if (!response.ok) throw new Error('Failed to fetch complaints');
        const data = await response.json();
        setComplaints(data);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, []);

  const updateComplaintStatus = async (id, status) => {
    try {
      setUpdating(true);
      const response = await fetch(`http://localhost:5000/api/complaint/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      
      if (!response.ok) throw new Error('Update failed');
      
      setComplaints(complaints.map(c => 
        c._id === id ? { ...c, status } : c
      ));
      toast.success(`Complaint ${status.toLowerCase()} successfully`);
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
      <h2 className="text-center mb-4">Student Complaints</h2>
      
      {complaints.length === 0 ? (
        <div className="text-center py-4">No complaints found</div>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Student</th>
              <th>Reg No</th>
              <th>Room</th>
              <th>Category</th>
              <th>Description</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {complaints.map(complaint => (
              <tr key={complaint._id}>
                <td>{complaint.studentName}</td>
                <td>{complaint.regNo}</td>
                <td>{complaint.roomNo}</td>
                <td>
                  <Badge bg="info">{complaint.category}</Badge>
                </td>
                <td>{complaint.description}</td>
                <td>{new Date(complaint.date).toLocaleDateString()}</td>
                <td>
                  <Badge 
                    bg={
                      complaint.status === 'Pending' ? 'warning' :
                      complaint.status === 'Resolved' ? 'success' : 'primary'
                    }
                  >
                    {complaint.status}
                  </Badge>
                </td>
                <td>
                  {complaint.status === 'Pending' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => updateComplaintStatus(complaint._id, 'In Progress')}
                      disabled={updating}
                    >
                      {updating ? <Spinner size="sm" /> : 'Start Progress'}
                    </Button>
                  )}
                  {complaint.status !== 'Resolved' && (
                    <Button
                      variant="success"
                      size="sm"
                      className="ms-2"
                      onClick={() => updateComplaintStatus(complaint._id, 'Resolved')}
                      disabled={updating}
                    >
                      {updating ? <Spinner size="sm" /> : 'Resolve'}
                    </Button>
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

export default Complaints;