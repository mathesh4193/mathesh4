import React, { useState } from 'react';
import { Container, Form, Button, Alert, Card, Row, Col, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './SignIn.css';

const SignIn = () => {
  const [activeRole, setActiveRole] = useState('student');
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSuccessfulLogin = (userData) => {
    localStorage.setItem('token', userData.token);
    localStorage.setItem('user', JSON.stringify(userData.user));
    
    if (userData.user.role === 'student') {
      navigate('/student/dashboard');
    } else if (userData.user.role === 'warden') {
      navigate('/warden/dashboard');
    }
  };

  const handleRoleChange = (role) => {
    setActiveRole(role);
    setUserId('');
    setPassword('');
    setError('');
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    checkPasswordStrength(value);
  };

  const checkPasswordStrength = (value) => {
    const strongPattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    setPasswordStrength(strongPattern.test(value) ? 'Strong' : 'Weak');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!userId || !password) {
      setError('Please enter all fields');
      setLoading(false);
      return;
    }

    if (activeRole === 'warden') {
      const wardenIdPattern = /^[A-Za-z0-9]+$/;
      if (!wardenIdPattern.test(userId)) {
        setError('Invalid Warden ID. Use only letters and numbers.');
        setLoading(false);
        return;
      }
    }

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        userId,
        password,
        role: activeRole
      });

      if (response.data.success) {
        handleSuccessfulLogin(response.data);
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="signin-container d-flex align-items-center justify-content-center min-vh-100 py-4">
      <Row className="justify-content-center w-100">
        <Col md={8} lg={6} xl={5}>
          <Card className="shadow-lg border-0">
            <Card.Body className="p-4 p-md-5">
              <div className="text-center mb-4">
                <h2 className="fw-bold mb-3">Hostel Management System</h2>
                <p className="text-muted mb-0">Sign in to access your account</p>
              </div>

              {error && (
                <Alert 
                  variant="danger" 
                  className="text-center mb-4"
                  onClose={() => setError('')}
                  dismissible
                >
                  {error}
                </Alert>
              )}

              <div className="role-selector mb-4">
                <div className="btn-group w-100 shadow-sm">
                  <Button
                    variant={activeRole === 'student' ? 'primary' : 'outline-primary'}
                    onClick={() => handleRoleChange('student')}
                    className={`py-2 ${activeRole === 'student' ? 'active-role' : ''}`}
                  >
                    <i className="bi bi-person-fill me-2"></i>
                    Student
                  </Button>
                  <Button
                    variant={activeRole === 'warden' ? 'primary' : 'outline-primary'}
                    onClick={() => handleRoleChange('warden')}
                    className={`py-2 ${activeRole === 'warden' ? 'active-role' : ''}`}
                  >
                    <i className="bi bi-shield-lock-fill me-2"></i>
                    Warden
                  </Button>
                </div>
              </div>

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-medium">
                    {activeRole === 'student' ? 'Roll Number' : 'Warden ID'}
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder={`Enter your ${activeRole === 'student' ? 'roll number' : 'warden ID'}`}
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    required
                    className="py-2"
                  />
                  <Form.Text className="text-muted">
                    {activeRole === 'student' 
                      ? 'Enter your university roll number' 
                      : 'Enter your provided warden ID'}
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-medium">Password</Form.Label>
                  <div className="input-group mb-1">
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={handlePasswordChange}
                      required
                      className="py-2 border-end-0"
                    />
                    <Button
                      variant="outline-secondary"
                      onClick={() => setShowPassword(!showPassword)}
                      className="border-start-0"
                    >
                      <i className={`bi bi-eye${showPassword ? '-slash' : ''}-fill`}></i>
                    </Button>
                  </div>
                  {password && (
                    <div className={`small ${passwordStrength === 'Strong' ? 'text-success' : 'text-warning'}`}>
                      <i className={`bi ${passwordStrength === 'Strong' ? 'bi-check-circle-fill' : 'bi-exclamation-circle-fill'} me-1`}></i>
                      Password strength: {passwordStrength}
                    </div>
                  )}
                </Form.Group>

                <div className="d-grid mb-3">
                  <Button
                    variant="primary"
                    type="submit"
                    size="lg"
                    disabled={loading}
                    className="py-2 fw-medium"
                  >
                    {loading ? (
                      <>
                        <Spinner as="span" animation="border" size="sm" role="status" className="me-2" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-box-arrow-in-right me-2"></i>
                        Sign In
                      </>
                    )}
                  </Button>
                </div>

                <div className="text-center pt-2">
                  <a href="/forgot-password" className="text-decoration-none small">
                    Forgot password?
                  </a>
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