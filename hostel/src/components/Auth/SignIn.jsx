import React, { useState } from 'react';
import { Container, Form, Button, Alert, Card, Row, Col } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import './SignIn.css';

const SignIn = () => {
  const [activeRole, setActiveRole] = useState('student');
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleSuccessfulLogin = (role) => {
    const from = location.state?.from || '/';
    if (from !== '/' && from.startsWith(`/${role}`)) {
      navigate(from);
    } else {
      navigate(`/${role}/dashboard`);
    }
  };

  const handleRoleChange = (role) => {
    setActiveRole(role);
    setUserId('');
    setPassword('');
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Validation for empty fields
    if (!userId || !password) {
      setError('Please enter all fields');
      return;
    }

    // Student Validation: Roll Number (Alphanumeric) & Password (12-digit number)
    if (activeRole === 'student') {
      const studentRollPattern = /^[A-Za-z0-9]+$/; // Alphanumeric check
      const studentPassPattern = /^\d{12}$/; // 12-digit number check

      if (!studentRollPattern.test(userId)) {
        setError('Invalid Student Roll Number. Use only letters and numbers.');
        return;
      }
      if (!studentPassPattern.test(password)) {
        setError('Invalid Student Password. Must be exactly 12 digits.');
        return;
      }
    }

    // Warden Validation: Warden ID (Alphanumeric) & Password (Alphanumeric + Special Characters)
    if (activeRole === 'warden') {
      const wardenIdPattern = /^[A-Za-z0-9]+$/; // Alphanumeric check
      const wardenPassPattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/; // Letters, numbers, and special characters

      if (!wardenIdPattern.test(userId)) {
        setError('Invalid Warden ID. Use only letters and numbers.');
        return;
      }
      if (!wardenPassPattern.test(password)) {
        setError('Invalid Warden Password. Must include letters, numbers, and special characters.');
        return;
      }
    }

    // Store login session
    localStorage.setItem('token', `${activeRole}-token`);
    localStorage.setItem('role', activeRole);
    localStorage.setItem('userName', `${activeRole} ${userId}`);
    handleSuccessfulLogin(activeRole);
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          <Card className="shadow-sm">
            <Card.Body className="p-4">
              <h2 className="text-center mb-4">Sign In</h2>

              {error && <Alert variant="danger">{error}</Alert>}

              <div className="mb-4">
                <p className="text-center mb-3">Please select your role and enter your credentials</p>

                <div className="role-selector d-flex mb-4">
                  <Button 
                    variant={activeRole === 'student' ? 'primary' : 'outline-primary'} 
                    className="flex-grow-1 me-2"
                    onClick={() => handleRoleChange('student')}
                  >
                    <div className="text-center">
                      <div>Student</div>
                      <small>Enter Roll Number & Password</small>
                    </div>
                  </Button>
                  
                  <Button 
                    variant={activeRole === 'warden' ? 'primary' : 'outline-primary'} 
                    className="flex-grow-1"
                    onClick={() => handleRoleChange('warden')}
                  >
                    <div className="text-center">
                      <div>Warden</div>
                      <small>Enter Warden ID & Password</small>
                    </div>
                  </Button>
                </div>
              </div>

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    {activeRole === 'student' ? 'Roll Number' : 'Warden ID'}
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder={`Enter ${activeRole === 'student' ? 'Roll Number' : 'Warden ID'}`}
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Password</Form.Label>
                  <div className="position-relative">
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button 
                      variant="link" 
                      className="position-absolute end-0 top-0 text-decoration-none"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ padding: '0.375rem 0.75rem' }}
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </Button>
                  </div>
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100 py-2 mb-3">
                  Sign In
                </Button>

                <div className="text-center">
                  <a href="#forgot-password" className="text-decoration-none">Forgot Password?</a>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default SignIn;
