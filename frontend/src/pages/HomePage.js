import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import './HomePage.css';

function HomePage() {
  const navigate = useNavigate();
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/notifications', { withCredentials: true });
        const count = res.data.filter(n => n.status === 'pending').length;
        setNotificationCount(count);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  const goProfile = () => {
    navigate('/personal');
  };
  const goNotifications = () => {
    navigate('/notifications');
  };
  const goChatbot = () => {
    navigate('/recommendations');
  };

  const goExchange = () => {
    navigate('/exchange');
  };
  const goDonate = () => {
    navigate('/donate');
  };

  const goAboutUs = () => {
    navigate('/about');
  };
  const goChatList = () => {
    navigate('/chatlist');
  };

  return (
    <div className="home-container">
      <div className="top-bar">
        <div className="left-buttons">
          <img
            src="/images/profileButton.png"
            alt="Profile"
            className="icon-button"
            onClick={goProfile}
          />
          <div className="notification-icon-wrapper" onClick={goNotifications}>
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
        <h1 className="bar-title">The Book Loop</h1>
        <img
          src="/images/aiB.png"
          alt="Chatbot"
          className="icon-button"
          onClick={goChatbot}
        />
      </div>

      <div className="center-section">
        <img
          src="/images/book-loop.png"
          alt="Main Logo"
          className="main-logo"
        />
        <div className="main-buttons">
          <button className="home-btn" onClick={goExchange}>
            Exchange
          </button>
          <button className="home-btn" onClick={goDonate}>
            Donate
          </button>
        </div>
      </div>

      <div className="bottom-links">
        <div className="about-link" onClick={goAboutUs}>
          About Us
        </div>
        <div className="chatlist-icon" onClick={goChatList}>
          <img src="/images/chat.png" alt="Chat List" />
        </div>
      </div>
    </div>
  );
}

export default HomePage;
