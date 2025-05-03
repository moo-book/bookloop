// src/pages/DonateDetailPage.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import './DonateDetailPage.css';

function DonateDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [donation, setDonation]   = useState(null);
  const [reason,   setReason]     = useState('');
  const [badge,    setBadge]      = useState(0);
  const [loggedIn, setLoggedIn]   = useState(false);

  /* ───────── load donation ───────── */
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/donations/${id}`);   // now public
        setDonation(data);
      } catch (err) {
        console.error(err);
        navigate('/donate');          // fallback to list page
      }
    })();
  }, [id, navigate]);

  /* ───────── check auth + notifications ───────── */
  useEffect(() => {
    (async () => {
      const uid = localStorage.getItem('userId');
      if (!uid) return;               // not logged in
      try {
        await api.get(`/users/${uid}`);  // cookie must be valid
        setLoggedIn(true);
        const { data } = await api.get('/notifications');
        setBadge(data.filter(n => n.status === 'pending').length);
      } catch {/* ignore auth errors */}
    })();
  }, []);

  /* ───────── send request ───────── */
  const handleRequest = async () => {
    if (!loggedIn) { navigate('/login'); return; }
    try {
      await api.post('/donations/request', {
        donationId: id,
        reason
      });
      alert('Request sent!');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Could not send request');
    }
  };

  if (!donation) return <div>Loading…</div>;

  return (
    <div className="donate-detail-container">
      {/* top‑bar */}
      <div className="top-bar">
        <img src="/images/home.png" alt="home" className="icon-button" onClick={() => navigate('/')} />
        <h2 className="site-title">The Book Loop</h2>
        <div className="notification-icon-wrapper" onClick={() => navigate('/notifications')}>
          <img src="/images/notification.png" alt="bell" className="icon-button" />
          {badge > 0 && <div className="notification-counter">{badge > 9 ? '9+' : badge}</div>}
        </div>
      </div>

      {/* book box */}
      <div className="blue-box">
        <div className="left-info">
          <h2 className="book-title">{donation.title}</h2>
          <p><strong>Author:</strong> {donation.author}</p>
          <p><strong>Genre:</strong> {donation.genre}</p>
          <p><strong>Book Shape:</strong> {donation.bookShape}</p>
          <p><strong>Pages:</strong> {donation.pages}</p>
          <p className="book-description">{donation.description || 'No description.'}</p>
        </div>
        <div className="right-cover">
          {donation.coverImage
            ? <img src={donation.coverImage} alt="cover" className="cover-preview" />
            : <div className="placeholder-cover">No Image</div>}
        </div>
      </div>

      {/* request area */}
      <div className="request-wrap">
        <textarea
          placeholder="Reason you need this book…"
          value={reason}
          onChange={e => setReason(e.target.value)}
        />
        <button className="request-btn" onClick={handleRequest}>
          request
        </button>
      </div>
    </div>
  );
}

export default DonateDetailPage;
