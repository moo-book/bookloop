// src/pages/NotificationPage.js
import React, { useEffect, useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import './NotificationPage.css';

function NotificationPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        // This GET will now return requesterUserDoc, itemDoc, etc.
        const res = await api.get('/notifications', { withCredentials: true });
        setNotifications(res.data);
      } catch (err) {
        console.error(err);
        navigate('/login');
      }
    })();
  }, [navigate]);

  const handleAccept = async (id) => {
    try {
      await api.post('/notifications/accept', { notificationId: id }, { withCredentials: true });
      // Refresh
      const res = await api.get('/notifications', { withCredentials: true });
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeny = async (id) => {
    try {
      await api.post('/notifications/deny', { notificationId: id }, { withCredentials: true });
      // Refresh
      const res = await api.get('/notifications', { withCredentials: true });
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Simple helper to show "exchange" vs "donate"
  const getRequestType = (noti) => {
    if (noti.type === 'exchange_request') return 'exchange';
    if (noti.type === 'donation_request') return 'donate';
    return '???';
  };

  return (
    <div className="notification-container">
      {/* === Top bar === */}
      <div className="top-bar">
        {/* Left corner: Home */}
        <img
          src="/images/home.png"
          alt="Home"
          className="icon-button"
          onClick={() => navigate('/')}
        />

        {/* Center: The Book Loop + logo */}
        <div className="center-brand">
          <h2 className="site-title">The Book Loop</h2>
          <img
            src="/images/book-loop.png"
            alt="BookLoop Logo"
            className="site-logo"
          />
        </div>

        {/* Right corner: Personal page */}
        <img
          src="/images/profileButton.png"
          alt="PersonalPage"
          className="icon-button"
          onClick={() => navigate('/personal')}
        />
      </div>

      {/* === Notification cards === */}
      <div className="cards-wrapper">
        {notifications.map((n) => {
          const reqType = getRequestType(n);

          // The requester's user doc from the server
          const userDoc = n.requesterUserDoc || {};
          const userPic = userDoc.profilePicture || '/images/defaultProfile.png';
          const userName = userDoc.username || 'Unknown';

          // The item doc from the server (book or donation)
          const itemDoc = n.itemDoc || {};
          const coverImg = itemDoc.coverImage || '/images/defaultBook.png';
          const itemTitle = itemDoc.title || 'Unknown Book';
          const itemDesc = itemDoc.description || 'No description.';
          
          return (
            <div
              key={n._id}
              className={`notify-card ${reqType === 'donate' ? 'donate-card' : 'exchange-card'}`}
            >
              {/* Card header: circle avatar, name, request type, menu dots */}
              <div className="card-header">
                {/* The requester's profile circle */}
                <div className="avatar-circle">
                  { /* Could show first letter if no pic */}
                  <img 
                    src={userPic}
                    alt="Requester Pic"
                    style={{ 
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      objectFit: 'cover'
                    }}
                  />
                </div>

                {/* Name + request type */}
                <div className="user-info">
                  <h4>{userName}</h4>
                  <span>{reqType}</span>
                </div>

                {/* The menu-dots or some icon (optional) */}
                <div className="menu-dots">&#8942;</div>
              </div>

              {/* Main image area: item cover */}
              <div className="image-area">
                <img src={coverImg} alt="Preview" />
              </div>

              {/* Title + sub text area */}
              <div className="text-area">
                <h5>{itemTitle}</h5>
                <p className="subtitle">Subtitle</p>

                {/* If it's exchange_request => show the requester's book description */}
                {/* If it's donation_request => show your donation's description plus the reason */}
                {n.type === 'exchange_request' && (
                  <p className="body-text">{itemDesc}</p>
                )}

                {n.type === 'donation_request' && (
                  <>
                    <p className="body-text">{itemDesc}</p>
                    {/* The reason user wants your donation */}
                    {n.reason && (
                      <p style={{ marginTop: '0.5rem', fontStyle: 'italic' }}>
                        Reason: {n.reason}
                      </p>
                    )}
                  </>
                )}
              </div>

              {/* Action buttons or status */}
              <div className="action-buttons">
                {n.status === 'pending' ? (
                  <>
                    <button className="reject-btn" onClick={() => handleDeny(n._id)}>
                      reject
                    </button>
                    <button className="accept-btn" onClick={() => handleAccept(n._id)}>
                      accept
                    </button>
                  </>
                ) : (
                  <p style={{ margin: 0 }}>Status: {n.status}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default NotificationPage;
