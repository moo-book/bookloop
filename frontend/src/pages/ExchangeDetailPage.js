import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import './ExchangeDetailPage.css';

function ExchangeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [myBooks, setMyBooks] = useState([]);
  const [selectedMyBookId, setSelectedMyBookId] = useState('');
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        await api.get('/users/' + localStorage.getItem('userId'), { withCredentials: true });
      } catch (err) {
        navigate('/login');
        return;
      }
      try {
        const res = await api.get(`/books/${id}`, { withCredentials: true });
        setBook(res.data);
      } catch (err) {
        console.error(err);
      }
      try {
        const userId = localStorage.getItem('userId');
        if (userId) {
          const resMyBooks = await api.get(`/books/user/${userId}`, { withCredentials: true });
          setMyBooks(resMyBooks.data);
        }
      } catch (err) {
        console.error(err);
      }
    })();
  }, [id, navigate]);

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

  const handleRequestExchange = async () => {
    if (!selectedMyBookId) {
      alert('Please select one of your books first.');
      return;
    }
    try {
      await api.post(
        '/books/request',
        {
          userId: localStorage.getItem('userId'),
          bookId: id,
          requesterBookId: selectedMyBookId,
        },
        { withCredentials: true }
      );
      alert('Exchange request sent.');
    } catch (err) {
      console.error(err);
      alert('Error requesting exchange.');
    }
  };

  if (!book) return <div>Loading book details...</div>;

  return (
    <div className="exchange-detail-container">
      <div className="top-bar">
        <img
          src="/images/home.png"
          alt="Home"
          className="icon-button"
          onClick={() => navigate('/')}
        />
        <h2 className="site-title">The Book Loop</h2>
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

      <div className="green-box">
        <div className="left-info">
          <h2 className="book-title">{book.title}</h2>
          <p><strong>Author:</strong> {book.author}</p>
          <p><strong>Genre:</strong> {book.genre}</p>
          <p><strong>Book Shape:</strong> {book.bookShape}</p>
          <p><strong>Pages:</strong> {book.pages}</p>
          <p className="book-description">{book.description || 'No description provided.'}</p>
        </div>
        <div className="right-cover">
          {book.coverImage ? (
            <img src={book.coverImage} alt="Book cover" className="cover-preview" />
          ) : (
            <div className="placeholder-cover">No Image</div>
          )}
        </div>
      </div>

      <div className="request-section">
        <h3>Select one of your books to offer:</h3>
        {myBooks.length === 0 ? (
          <p>You have no books listed. Please add one!</p>
        ) : (
          <>
            <select
              value={selectedMyBookId}
              onChange={(e) => setSelectedMyBookId(e.target.value)}
            >
              <option value="">-- Select Book --</option>
              {myBooks.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.title}
                </option>
              ))}
            </select>
            <button className="request-btn" onClick={handleRequestExchange}>
              request
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default ExchangeDetailPage;
