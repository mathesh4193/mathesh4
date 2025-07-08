import React, { useState, useEffect } from 'react';
import { Table, Button, Badge, Spinner, Container, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Outpass = () => {
  const [outpasses, setOutpasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchOutpasses = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/outpass/warden');
        if (!response.ok) throw new Error('Failed to fetch outpasses');
        const data = await response.json();
        setOutpasses(data);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOutpasses();
  }, []);

  const updateOutpassStatus = async (id, status) => {
    try {
      setUpdating(true);
      const response = await fetch(`http://localhost:5000/api/outpass/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      
      if (!response.ok) throw new Error('Update failed');
      
      setOutpasses(outpasses.map(op => 
        op._id === id ? { ...op, status } : op
      ));
      toast.success(`Outpass ${status.toLowerCase()}`);
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
      <h2 className="text-center mb-4">Outpass Requests</h2>
      
      {outpasses.length === 0 ? (
        <Alert variant="info" className="text-center">
          No pending outpass requests
        </Alert>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Student</th>
              <th>Room</th>
              <th>Destination</th>
              <th>Purpose</th>
              <th>Departure</th>
              <th>Return</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {outpasses.map(outpass => (
              <tr key={outpass._id}>
                <td>{outpass.studentName}</td>
                <td>{outpass.roomNo}</td>
                <td>{outpass.destination}</td>
                <td>{outpass.purpose}</td>
                <td>{new Date(outpass.departureTime).toLocaleString()}</td>
                <td>{new Date(outpass.returnTime).toLocaleString()}</td>
                <td>
                  <Badge 
                    bg={
                      outpass.status === 'Pending' ? 'warning' :
                      outpass.status === 'Approved' ? 'success' : 'danger'
                    }
                  >
                    {outpass.status}
                  </Badge>
                </td>
                <td>
                  {outpass.status === 'Pending' && (
                    <>
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => updateOutpassStatus(outpass._id, 'Approved')}
                        disabled={updating}
                      >
                        {updating ? <Spinner size="sm" /> : 'Approve'}
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        className="ms-2"
                        onClick={() => updateOutpassStatus(outpass._id, 'Rejected')}
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

export default Outpass;