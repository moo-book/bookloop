// src/pages/ResetPasswordPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import './ResetPasswordPage.css';

function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    try {
      // Example API call for resetting password (adjust the endpoint as needed)
      await api.post('/users/resetpassword', { email });
      alert('Password reset instructions have been sent to your email.');
      navigate('/login');
    } catch (err) {
      console.error(err);
      alert('Error sending reset instructions.');
    }
  };

  return (
    <div className="reset-container">
      <div className="reset-top-bar">
        <img
          src="/images/home.png"
          alt="Home"
          className="icon-button"
          onClick={() => navigate('/')}
        />
        <h1 className="reset-title">Reset Password</h1>
      </div>
      <div className="reset-form-box">
        <form onSubmit={handleReset}>
          <label htmlFor="reset-email">Enter your email to reset your password</label>
          <input
            type="email"
            id="reset-email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" className="reset-button">
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPasswordPage;
