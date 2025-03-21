import React, { useState } from 'react';
import SpringBootServer from './Server';
import { useNavigate } from 'react-router-dom';
import './App.css';

const Login = ({ setAuth, setLoginId }) => {
  const [loginId, setLoginIdState] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // Send loginId and password to the backend for validation
      const response = await fetch(SpringBootServer + '/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ loginId, password }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Set authentication state
          setAuth(true);
          // Pass loginId to parent
          setLoginId(loginId);
          navigate('/');
        } else {
          alert('Login failed');
        }
      } else {
        alert('Server error');
      }
    } catch (error) {
    console.error('Error during fetch:', error);
    alert('An error occurred while trying to log in');
    }
  };
  
  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label htmlFor="loginId">Login ID:</label>
          <input
            type="text"
            id="loginId"
            value={loginId}
            onChange={(e) => setLoginIdState(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
