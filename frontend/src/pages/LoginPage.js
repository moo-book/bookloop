// src/pages/LoginPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import './LoginPage.css';

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/users/login', { email, password });
      localStorage.setItem('userId', res.data.userId);
      localStorage.setItem('username', res.data.username);
      navigate('/');
    } catch (err) {
      console.error(err);
      if (err.response?.data?.message) {
        alert(err.response.data.message);
      } else {
        alert('Login error');
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-top-bar">
        <h1 className="site-title">The Book Loop</h1>
        <img src="/images/book-loop.png" alt="Site Logo" className="infinity-icon" />
      </div>

      <div className="form-box">
        <label htmlFor="email">Email</label>
        <input
          className="input-field"
          id="email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label htmlFor="password">Password</label>
        <input
          className="input-field"
          id="password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button className="login-button" onClick={handleLogin}>Login</button>

        <div className="bottom-text">
          <span>New?</span>
          <span className="register-link" onClick={() => navigate('/register')}>
            Create an account
          </span>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
