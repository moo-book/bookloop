// src/pages/RegisterPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import './RegisterPage.css';

function RegisterPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    try {
      await api.post('/users/register', {
        email,
        username,
        password,
        confirmPassword,
      });
      navigate('/login');
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.message) {
        alert(err.response.data.message);
      } else {
        alert('Registration error');
      }
    }
  };

  return (
    <div className="register-container">
      {/* Top center title + image */}
      <div className="register-top-bar">
        <h1 className="site-title">The Book Loop</h1>
        <img
          src="/images/book-loop.png"
          alt="Site Logo"
          className="infinity-icon"
        />
      </div>

      {/* The registration form box */}
      <div className="form-box">
        <label htmlFor="email">Email</label>
        <input
          className="input-field"
          type="email"
          id="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label htmlFor="username">Username</label>
        <input
          className="input-field"
          type="text"
          id="username"
          placeholder="Choose a username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <label htmlFor="password">Password</label>
        <input
          className="input-field"
          type="password"
          id="password"
          placeholder="Password (>= 8 chars)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <label htmlFor="confirmPassword">Confirm Password</label>
        <input
          className="input-field"
          type="password"
          id="confirmPassword"
          placeholder="Re-enter your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <button className="register-button" onClick={handleRegister}>
          Register
        </button>

        {/* Link to login */}
        <div className="bottom-text">
          Already have an account?
          <span
            className="login-link"
            onClick={() => navigate('/login')}
          >
            Login
          </span>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
