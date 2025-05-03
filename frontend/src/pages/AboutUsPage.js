// src/pages/AboutUsPage.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import './AboutUsPage.css';

function AboutUsPage() {
  const navigate = useNavigate();
  const [notificationCount, setNotificationCount] = useState(0);

  // Fetch notifications that are pending (i.e. not accepted/rejected)
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/notifications', { withCredentials: true });
        // Count notifications where status is 'pending'
        const count = res.data.filter(n => n.status === 'pending').length;
        setNotificationCount(count);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  return (
    <div className="about-container">
      {/* === Top bar === */}
      <div className="top-bar">
        {/* Left corner: Home icon */}
        <img
          src="/images/home.png"
          alt="Home"
          className="icon-button"
          onClick={() => navigate('/')}
        />

        <div className="center-brand">
          <h2 className="site-title">The Book Loop</h2>
          <img
            src="/images/book-loop.png"
            alt="BookLoop Logo"
            className="site-logo"
          />
        </div>
        
        {/* Right corner: Notifications */}
        <div className="notification-icon-wrapper" onClick={() => navigate('/notifications')}>
          <img
            src="/images/notification.png"
            alt="Notifications"
            className="icon-button"
          />
          {notificationCount > 0 && (
            <div className="notification-counter">
              {notificationCount > 9 ? '9+' : notificationCount}
            </div>
          )}
        </div>
      </div>

      {/* === Main content: navy card with creators info === */}
      <div className="navy-card">
        <h3 className="card-title">Creators</h3>
        <ul className="creators-list">
          <li>
            <div className="avatar"></div>
            <span>Osama Mohammed Alqarnie.</span>
          </li>
          <li>
            <div className="avatar"></div>
            <span>Osama Mohammed Deabas</span>
          </li>
          <li>
            <div className="avatar"></div>
            <span>Meshari Salman Alasmari</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default AboutUsPage;
