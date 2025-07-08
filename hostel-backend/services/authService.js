// services/authService.js
import axios from 'axios';

export const login = async (userId, password, role) => {
  const response = await axios.post('http://localhost:5000/api/login', {
    userId,
    password,
    role
  });

  return response.data; // expects { user: { role: 'student' }, token: '...' }
};
