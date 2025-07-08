import React, { useState, useEffect } from 'react';
import { Table, Spinner, Container, Form } from 'react-bootstrap';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/students');
        if (!response.ok) throw new Error('Failed to fetch students');
        const data = await response.json();
        setStudents(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.regNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.roomNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <Container className="text-center py-5">
      <Spinner animation="border" />
    </Container>
  );

  return (
    <Container className="py-4">
      <h2 className="text-center mb-4">Student Directory</h2>
      
      <Form.Control
        type="text"
        placeholder="Search students by name, registration number, or room number"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4"
      />

      {filteredStudents.length === 0 ? (
        <div className="text-center py-4">No students found</div>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Name</th>
              <th>Reg No</th>
              <th>Room</th>
              <th>Department</th>
              <th>Year</th>
              <th>Contact</th>
              <th>Parent Contact</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map(student => (
              <tr key={student._id}>
                <td>{student.name}</td>
                <td>{student.regNo}</td>
                <td>{student.roomNo}</td>
                <td>{student.department}</td>
                <td>{student.year}</td>
                <td>
                  <a href={`tel:${student.contact}`}>{student.contact}</a>
                </td>
                <td>
                  <a href={`tel:${student.parentContact}`}>{student.parentContact}</a>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default Students;