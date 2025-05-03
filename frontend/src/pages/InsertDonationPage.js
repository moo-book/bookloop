// src/pages/InsertDonationPage.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import './InsertDonationPage.css';

function InsertDonationPage() {
  const navigate = useNavigate();

  /* ───────── auth check ───────── */
  const [loggedIn, setLoggedIn] = useState(false);
  useEffect(() => {
    const uid = localStorage.getItem('userId');
    if (!uid) return;                    // stay on page, but disable submit
    (async () => {
      try {
        await api.get(`/users/${uid}`);  // cookie must be valid
        setLoggedIn(true);
      } catch {/* ignore – remain false */}
    })();
  }, []);

  /* ───────── form state ───────── */
  const [title,       setTitle]       = useState('');
  const [author,      setAuthor]      = useState('');
  const [genre,       setGenre]       = useState('');
  const [bookShape,   setBookShape]   = useState('');
  const [pages,       setPages]       = useState('');
  const [description, setDescription] = useState('');
  const [file,        setFile]        = useState(null);

  const [badge, setBadge] = useState(0);
  useEffect(() => {
    if (!loggedIn) return;
    (async () => {
      try {
        const { data } = await api.get('/notifications');
        setBadge(data.filter(n => n.status === 'pending').length);
      } catch {/* ignore */}
    })();
  }, [loggedIn]);

  /* ───────── submit ───────── */
  const handleSubmit = async () => {
    if (!loggedIn) { navigate('/login'); return; }
    if (!title || !author || !genre || !bookShape || !pages) {
      alert('Fill Title, Author, Genre, Shape & Pages.');
      return;
    }
    try {
      const fd = new FormData();
      fd.append('title', title);
      fd.append('author', author);
      fd.append('genre', genre);
      fd.append('bookShape', bookShape);
      fd.append('pages', pages);
      fd.append('description', description);
      if (file) fd.append('coverImage', file);

      await api.post('/donations', fd, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      navigate('/donate');                     // back to list after success
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error adding donation');
    }
  };

  return (
    <div className="insert-donation-container">
      {/* ───────── top‑bar ───────── */}
      <div className="top-bar">
        <img src="/images/home.png" className="icon-button" alt="home" onClick={() => navigate('/')} />
        <h2 className="site-title">The Book Loop</h2>
        <div className="notification-icon-wrapper" onClick={() => navigate('/notifications')}>
          <img src="/images/notification.png" className="icon-button" alt="bell" />
          {badge > 0 && <div className="notification-counter">{badge > 9 ? '9+' : badge}</div>}
        </div>
      </div>

      {/* ───────── form block ───────── */}
      <div className="donation-block">
        <div className="left-info">
          {[['Title',title,setTitle],['Author',author,setAuthor],['Genre',genre,setGenre],
            ['Book Shape',bookShape,setBookShape]].map(([lbl,val,setter])=>(
            <React.Fragment key={lbl}>
              <label>{lbl}</label>
              <input value={val} onChange={e=>setter(e.target.value)} />
            </React.Fragment>
          ))}
          <label>Number of Pages</label>
          <input type="number" value={pages} onChange={e=>setPages(e.target.value)} />

          <label>About The Book</label>
          <textarea value={description} onChange={e=>setDescription(e.target.value)} />
        </div>

        <div className="right-cover">
          {file
            ? <img src={URL.createObjectURL(file)} alt="preview" className="cover-preview" />
            : <div className="placeholder-cover">No Image</div>}
          <input type="file" onChange={e=>setFile(e.target.files[0]||null)} />
        </div>
      </div>

      <button className="donate-btn" onClick={handleSubmit}>
        {loggedIn ? 'donate' : 'log in to donate'}
      </button>
    </div>
  );
}

export default InsertDonationPage;
