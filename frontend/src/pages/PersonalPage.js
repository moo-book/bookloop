// src/pages/PersonalPage.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import './PersonalPage.css';

/* ─────────────────────────────────────────────────────────── */
/* Hard-coded city list. Replace with a fetch to /api/cities   */
/* if you already expose a list from the backend.              */
const CITY_LIST = [
  'Riyadh',
  'Jeddah',
  'Dammam',
  'Makkah',
  'Medina',
  'Tabuk',
  'Abha',
  'Taif'
];
/* ─────────────────────────────────────────────────────────── */

function PersonalPage() {
  const navigate = useNavigate();

  /* user basics */
  const [user, setUser] = useState(null);

  /* username editing */
  const [editingUsername, setEditingUsername] = useState(false);
  const [tempUsername, setTempUsername]   = useState('');

  /* quote editing */
  const [editingQuote,   setEditingQuote] = useState(false);
  const [tempQuote,      setTempQuote]    = useState('');

  /* profile-pic */
  const [previewPic, setPreviewPic] = useState('');
  const [file, setFile] = useState(null);

  /* city editing */
  const [editingCity, setEditingCity] = useState(false);
  const [tempCity,   setTempCity]   = useState('');
  const [geoCoords,  setGeoCoords]  = useState(null);   // {lat,lng}

  /* misc */
  const [allUserBooks, setAllUserBooks]   = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);

  /* ─────────── Fetch profile on mount ─────────── */
  useEffect(() => {
    (async () => {
      try {
        const userRes = await api.get(
          `/users/${localStorage.getItem('userId')}`,
          { withCredentials: true }
        );
        const fetchedUser = userRes.data;
        setUser(fetchedUser);
        setTempUsername(fetchedUser.username);
        setTempQuote(fetchedUser.quote || '');
        setTempCity(fetchedUser.city || '');
      } catch (err) {
        console.error(err);
        navigate('/login');
      }
    })();
  }, [navigate]);

  /* ─────────── Load user books (unchanged) ─────────── */
  useEffect(() => {
    (async () => {
      try {
        const userId = localStorage.getItem('userId');
        if (!userId) return;

        const resBooks = await api.get('/books?limit=9999&page=1', { withCredentials: true });
        const userOwnedEx = resBooks.data.books.filter((b) => b.owner === userId);

        const resDonations = await api.get(`/donations/user/${userId}`, { withCredentials: true });
        const userOwnedDonations = resDonations.data;

        const combined = [
          ...userOwnedEx.map((ex) => ({ ...ex, type: 'exchange' })),
          ...userOwnedDonations.map((dn) => ({ ...dn, type: 'donate' }))
        ];
        setAllUserBooks(combined);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  /* ─────────── Notifications count (unchanged) ─────────── */
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/notifications', { withCredentials: true });
        const count = res.data.filter((n) => n.status === 'pending').length;
        setNotificationCount(count);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  /* ─────────── Sign-out helper (unchanged) ─────────── */
  const handleSignOut = async () => {
    try {
      await api.post('/users/logout', {}, { withCredentials: true });
      localStorage.removeItem('userId');
      localStorage.removeItem('username');
      navigate('/login');
    } catch (err) {
      console.error(err);
    }
  };

  /* ─────────── Picture upload helpers (unchanged) ─────────── */
  const handleFileChange = (e) => {
    const chosenFile = e.target.files[0];
    setFile(chosenFile);
    if (chosenFile) setPreviewPic(URL.createObjectURL(chosenFile));
  };

  const handleSavePicture = async () => {
    if (!user || !file) return;
    try {
      const formData = new FormData();
      formData.append('profilePicture', file);
      formData.append('username', user.username || '');
      formData.append('quote', user.quote || '');
      formData.append('city',  user.city  || '');

      await api.put(`/users/${user._id}`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Profile picture updated!');
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert('Error updating picture');
    }
  };

  /* ─────────── Username / Quote save (unchanged) ─────────── */
  const patchUser = async (payload, successMsg) => {
    try {
      await api.put(`/users/${user._id}`, payload, { withCredentials: true });
      setUser((prev) => ({ ...prev, ...payload }));
      alert(successMsg);
    } catch (err) {
      console.error(err);
      alert('Error updating profile');
    }
  };

  const handleSaveUsername = () =>
    patchUser({ username: tempUsername }, 'Username updated!').then(() =>
      setEditingUsername(false)
    );

  const handleSaveQuote = () =>
    patchUser({ quote: tempQuote }, 'Quote updated!').then(() =>
      setEditingQuote(false)
    );

  /* ─────────── City helpers ─────────── */
  const handleSaveCity = async () => {
    const payload = { city: tempCity };
    if (geoCoords) {
      payload.latitude  = geoCoords.lat;
      payload.longitude = geoCoords.lng;
    }
    await patchUser(payload, 'Location updated!');
    setEditingCity(false);
    setGeoCoords(null);
  };

  const useGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation not supported.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setGeoCoords({ lat, lng });

        /* quick heuristic: choose nearest city from CITY_LIST */
        let nearest = CITY_LIST[0];
        try {
          /* call backend for actual nearest if you have that; else keep heuristic */
          const res = await api.get(
            `/ai/nearest-city?lat=${lat}&lng=${lng}`
          ); // OPTIONAL ENDPOINT
          if (res.data?.city) nearest = res.data.city;
        } catch (_) {
          // ignore
        }
        setTempCity(nearest);
        setEditingCity(true);
      },
      (err) => {
        console.error(err);
        alert('Failed to get location');
      }
    );
  };

  if (!user) return <div>Loading profile...</div>;

  /* ─────────────────────────────────────────────────────────── */
  return (
    <div className="personal-page-container">
      {/* ========== TOP BAR (unchanged) ========== */}
      <div className="top-bar">
        <div className="left-icons">
          <img
            src="/images/home.png"
            alt="Home"
            className="icon-button"
            onClick={() => navigate('/')}
          />
          <div
            className="notification-icon-wrapper"
            onClick={() => navigate('/notifications')}
          >
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

        <div className="center-brand">
          <h2 className="site-title">The Book Loop</h2>
          <img
            src="/images/book-loop.png"
            alt="BookLoop Logo"
            className="site-logo"
          />
        </div>

        <button className="signout-btn" onClick={handleSignOut}>
          sign out
        </button>
      </div>

      {/* ========== PROFILE SECTION ========== */}
      <div className="profile-section">
        {/* ---- Picture ---- */}
        <div className="profile-pic-wrapper">
          {previewPic ? (
            <img src={previewPic} alt="preview" className="profile-pic" />
          ) : user.profilePicture ? (
            <img src={user.profilePicture} alt="profile" className="profile-pic" />
          ) : (
            <div className="profile-placeholder">No Picture</div>
          )}
          <input type="file" onChange={handleFileChange} />
          {file && (
            <button className="save-pic-btn" onClick={handleSavePicture}>
              Update Picture
            </button>
          )}
        </div>

        {/* ---- INFO BLOCK ---- */}
        <div className="info-block">
          {/* Username row */}
          <div className="edit-row">
            <label>Username:</label>
            {!editingUsername ? (
              <>
                <span>{user.username}</span>
                <button
                  className="edit-btn"
                  onClick={() => setEditingUsername(true)}
                >
                  edit
                </button>
              </>
            ) : (
              <>
                <input
                  type="text"
                  value={tempUsername}
                  onChange={(e) => setTempUsername(e.target.value)}
                />
                <button className="save-btn" onClick={handleSaveUsername}>
                  save
                </button>
                <button
                  className="cancel-btn"
                  onClick={() => {
                    setEditingUsername(false);
                    setTempUsername(user.username);
                  }}
                >
                  cancel
                </button>
              </>
            )}
          </div>

          {/* Quote row */}
          <div className="edit-row">
            <label>Quote:</label>
            {!editingQuote ? (
              <>
                <span>{user.quote || ''}</span>
                <button
                  className="edit-btn"
                  onClick={() => setEditingQuote(true)}
                >
                  edit
                </button>
              </>
            ) : (
              <>
                <textarea
                  value={tempQuote}
                  onChange={(e) => setTempQuote(e.target.value)}
                />
                <button className="save-btn" onClick={handleSaveQuote}>
                  save
                </button>
                <button
                  className="cancel-btn"
                  onClick={() => {
                    setEditingQuote(false);
                    setTempQuote(user.quote || '');
                  }}
                >
                  cancel
                </button>
              </>
            )}
          </div>

          {/* NEW: City / Location row */}
          <div className="edit-row">
            <label>City:</label>
            {!editingCity ? (
              <>
                <span>{user.city || '—'}</span>
                <button
                  className="edit-btn"
                  onClick={() => setEditingCity(true)}
                >
                  edit
                </button>
                <button className="edit-btn" onClick={useGPS}>
                  Use my GPS
                </button>
              </>
            ) : (
              <>
                <select
                  value={tempCity}
                  onChange={(e) => setTempCity(e.target.value)}
                >
                  <option value="">-- choose city --</option>
                  {CITY_LIST.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <button className="save-btn" onClick={handleSaveCity}>
                  save
                </button>
                <button
                  className="cancel-btn"
                  onClick={() => {
                    setEditingCity(false);
                    setTempCity(user.city || '');
                    setGeoCoords(null);
                  }}
                >
                  cancel
                </button>
              </>
            )}
          </div>
        </div>

        {/* My Listed Books shortcut */}
        <button
          className="mybooks-btn"
          onClick={() => navigate('/userbookslisted')}
        >
          My Listed Books
        </button>
      </div>

      {/* ========== BOOKS ROW (unchanged) ========== */}
      <h3 className="exchange-books-title">
        books offered to exchange or donate
      </h3>
      <div className="books-row">
        {allUserBooks.map((item) => {
          const isExchange = item.type === 'exchange';
          const cardClass = isExchange ? 'green-card' : 'blue-card';
          const cover = item.coverImage || '/images/defaultBook.png';
          const descSnippet = item.description
            ? item.description.slice(0, 100)
            : 'No description';
          const showEllipsis =
            item.description && item.description.length > 100;
          return (
            <div key={item._id} className={`item-card ${cardClass}`}>
              <div className="book-cover">
                <img src={cover} alt="cover" />
              </div>
              <div className="book-info">
                <h4>{item.title}</h4>
                <p>
                  {descSnippet}
                  {showEllipsis && '...'}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PersonalPage;
