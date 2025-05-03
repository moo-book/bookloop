// ExchangeListPage.js – full file, auto‑location, no button
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import './ExchangeListPage.css';

function ExchangeListPage() {
  const navigate = useNavigate();
  const [books,       setBooks]       = useState([]);
  const [page,        setPage]        = useState(1);
  const [totalPages,  setTotalPages]  = useState(1);
  const [usingGPS,    setUsingGPS]    = useState(false);
  const [notifCount,  setNotifCount]  = useState(0);

  /* once: ask browser for GPS, fallback to paginated list */
  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude: lat, longitude: lng } = pos.coords;
          const res = await api.get(
            `/books/nearest?latitude=${lat}&longitude=${lng}`,
            { withCredentials: true }
          );
          setBooks(res.data.books);
          setUsingGPS(true);
        } catch (e) {
          console.error(e);
          fetchPaginated(1);
        }
      },
      () => fetchPaginated(1),
      { timeout: 4000 }
    );
    // notifications
    (async () => {
      try {
        const res = await api.get('/notifications', { withCredentials: true });
        setNotifCount(res.data.filter((n) => n.status === 'pending').length);
      } catch { /* ignore */ }
    })();
  }, []);

  const fetchPaginated = async (p) => {
    const res = await api.get(`/books?limit=4&page=${p}`);
    setBooks(res.data.books);
    setTotalPages(res.data.totalPages);
    setUsingGPS(false);
  };

  useEffect(() => {
    if (!usingGPS) fetchPaginated(page);
  }, [page, usingGPS]);

  const next = () => page < totalPages && setPage(page + 1);
  const prev = () => page > 1 && setPage(page - 1);

  return (
    <div className="exchange-list-container">
      <div className="top-bar">
        <img
          src="/images/home.png"
          alt="Home"
          className="icon-button"
          onClick={() => navigate('/')}
        />
        <div className="site-branding">
          <h1 className="site-title">The Book Loop</h1>
          <img src="/images/book-loop.png" alt="Logo" className="site-logo" />
        </div>
        <div
          className="notification-icon-wrapper"
          onClick={() => navigate('/notifications')}
        >
          <img src="/images/notification.png" alt="N" className="icon-button" />
          {notifCount > 0 && (
            <div className="notification-counter">
              {notifCount > 9 ? '9+' : notifCount}
            </div>
          )}
        </div>
      </div>

      <div className="exchange-button-container">
        <button
          className="big-exchange-button"
          onClick={() => navigate('/exchange/new')}
        >
          exchange
        </button>
      </div>

      <div className="book-list">
        {books.map((b) => (
          <div key={b._id} className="book-card2">
            <div className="book-cover">
              <img
                src={b.coverImage || '/images/defaultBook.png'}
                alt="cover"
              />
            </div>
            <div className="book-info">
              <h2>{b.title}</h2>
              <p className="book-description">
                {b.description
                  ? b.description.length > 160
                    ? `${b.description.slice(0, 160)}…`
                    : b.description
                  : 'No description.'}
              </p>
              {b.ownerInfo && (
                <p
                  onClick={() => navigate(`/otheruserprofile/${b.ownerInfo._id}`)}
                  style={{ cursor: 'pointer', color: 'yellow' }}
                >
                  Owner: {b.ownerInfo.username}
                </p>
              )}
            </div>
            <button
              className="exchange-btn"
              onClick={() => navigate(`/exchange/${b._id}`)}
            >
              exchange
            </button>
          </div>
        ))}
      </div>

      {!usingGPS && (
        <div className="pagination">
          <button disabled={page <= 1} onClick={prev}>
            ← Prev
          </button>
          <span className="page-numbers">
            {page} / {totalPages}
          </span>
          <button disabled={page >= totalPages} onClick={next}>
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

export default ExchangeListPage;
