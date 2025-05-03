// src/pages/InsertDonationPage.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import './InsertDonationPage.css';

function InsertDonationPage() {
  const navigate = useNavigate();

  /* ───────── local state ───────── */
  const [title,       setTitle]       = useState('');
  const [author,      setAuthor]      = useState('');
  const [genre,       setGenre]       = useState('');
  const [bookShape,   setBookShape]   = useState('');
  const [pages,       setPages]       = useState('');
  const [description, setDescription] = useState('');
  const [file,        setFile]        = useState(null);
  const [notificationCount, setNotificationCount] = useState(0);

  /* ───────── auth guard ───────── */
  useEffect(() => {
    (async () => {
      try {
        await api.get(`/users/${localStorage.getItem('userId')}`, { withCredentials: true });
      } catch {
        navigate('/login');
      }
    })();
  }, [navigate]);

  /* ───────── notification badge ───────── */
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/notifications', { withCredentials: true });
        setNotificationCount(data.filter(n => n.status === 'pending').length);
      } catch {/* ignore */}
    })();
  }, []);

  /* ───────── submit ───────── */
  const handleSubmit = async () => {
    if (!title || !author || !genre || !bookShape || !pages) {
      alert('Fill Title, Author, Genre, Shape & Pages.');
      return;
    }
    try {
      const fd = new FormData();
      fd.append('userId', localStorage.getItem('userId'));
      fd.append('title',  title);
      fd.append('author', author);
      fd.append('genre',  genre);
      fd.append('bookShape', bookShape);
      fd.append('pages', pages);
      fd.append('description', description);
      if (file) fd.append('coverImage', file);

      await api.post('/donations', fd, {
        withCredentials: true,
        headers: { 'Content‑Type': 'multipart/form-data' }
      });
      navigate('/donate');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error adding donation');
    }
  };

  return (
    <div className="insert-donation-container">
      {/* top‑bar */}
      <div className="top-bar">
        <img src="/images/home.png"   alt="home"  className="icon-button" onClick={() => navigate('/')} />
        <h2 className="site-title">The Book Loop</h2>
        <div className="notification-icon-wrapper" onClick={() => navigate('/notifications')}>
          <img src="/images/notification.png" alt="bell" className="icon-button" />
          {notificationCount > 0 && <div className="notification-counter">{notificationCount > 9 ? '9+' : notificationCount}</div>}
        </div>
      </div>

      {/* main form */}
      <div className="donation-block">
        <div className="left-info">
          {[
            ['Title',        title,       setTitle,       'text'],
            ['Author',       author,      setAuthor,      'text'],
            ['Genre',        genre,       setGenre,       'text'],
            ['Book Shape',   bookShape,   setBookShape,   'text'],
            ['Number of Pages', pages,    setPages,       'number']
          ].map(([label,val,setter,type]) => (
            <React.Fragment key={label}>
              <label>{label}</label>
              <input type={type} value={val} onChange={e => setter(e.target.value)} />
            </React.Fragment>
          ))}

          <label>About The Book</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} />
        </div>

        <div className="right-cover">
          {file
            ? <img src={URL.createObjectURL(file)} className="cover-preview" alt="preview"/>
            : <div className="placeholder-cover">No Image</div>}
          <input type="file" onChange={e => setFile(e.target.files[0] || null)} />
        </div>
      </div>

      <button className="donate-btn" onClick={handleSubmit}>donate</button>
    </div>
  );
}

export default InsertDonationPage;
