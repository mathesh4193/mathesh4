// src/services/authService.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

const login = async (identifier, password, role) => {
  try {
    const response = await axios.post(`${API_URL}/login`, {
      userId: identifier,
      password,
      role
    });

    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response.data;
  } catch (error) {
    let errorMessage = 'Login failed';
    if (error.response) {
      errorMessage = error.response.data.message || errorMessage;
    }
    throw new Error(errorMessage);
  }
};

const handleLogin = async (identifier, password, role) => {
  try {
    const { user, token } = await login(identifier, password, role);
    if (user.role === 'student') {
      navigate('/student/dashboard');
    } else {
      navigate('/warden/dashboard');
    }
  } catch (error) {
    setError(error.message);
  }
};