// DonateListPage.js – full file, auto‑location, no button
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import './DonateListPage.css';

function DonateListPage() {
  const navigate = useNavigate();
  const [list,       setList]       = useState([]);
  const [page,       setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [usingGPS,   setUsingGPS]   = useState(false);
  const [notif,      setNotif]      = useState(0);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude: lat, longitude: lng } = pos.coords;
          const res = await api.get(
            `/donations/nearest?latitude=${lat}&longitude=${lng}`
          );
          setList(res.data.donations);
          setUsingGPS(true);
        } catch (e) {
          console.error(e);
          fetchPaginated(1);
        }
      },
      () => fetchPaginated(1),
      { timeout: 4000 }
    );

    (async () => {
      try {
        const res = await api.get('/notifications', { withCredentials: true });
        setNotif(res.data.filter((n) => n.status === 'pending').length);
      } catch { /* ignore */ }
    })();
  }, []);

  const fetchPaginated = async (p) => {
    const res = await api.get(`/donations?limit=4&page=${p}`);
    setList(res.data.donations);
    setTotalPages(res.data.totalPages);
    setUsingGPS(false);
  };

  useEffect(() => {
    if (!usingGPS) fetchPaginated(page);
  }, [page, usingGPS]);

  const next = () => page < totalPages && setPage(page + 1);
  const prev = () => page > 1 && setPage(page - 1);

  return (
    <div className="donate-list-container">
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
          {notif > 0 && (
            <div className="notification-counter">{notif > 9 ? '9+' : notif}</div>
          )}
        </div>
      </div>

      <div className="donate-button-container">
        <button
          className="big-donate-button"
          onClick={() => navigate('/donate/new')}
        >
          donate
        </button>
      </div>

      <div className="donation-list">
        {list.map((d) => (
          <div key={d._id} className="donation-card">
            <div className="book-cover">
              <img
                src={d.coverImage || '/images/defaultBook.png'}
                alt="cover"
              />
            </div>
            <div className="book-info">
              <h2>{d.title}</h2>
              <p className="book-description">
                {d.description
                  ? d.description.length > 160
                    ? `${d.description.slice(0, 160)}…`
                    : d.description
                  : 'No description.'}
              </p>
              {d.ownerInfo && (
                <p
                  onClick={() =>
                    navigate(`/otheruserprofile/${d.ownerInfo._id}`)
                  }
                  style={{ cursor: 'pointer', color: '#5c7c67' }}
                >
                  {d.ownerInfo.username}
                </p>
              )}
            </div>
            <button
              className="take-button"
              onClick={() => navigate(`/donate/${d._id}`)}
            >
              take
            </button>
          </div>
        ))}
      </div>

      {!usingGPS && (
        <div className="pagination">
          <button disabled={page <= 1} onClick={prev}>
            ← Previous
          </button>
          <span className="page-numbers">
            Page {page} of {totalPages}
          </span>
          <button disabled={page >= totalPages} onClick={next}>
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

export default DonateListPage;
