import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import './UserBooksListedPage.css';

function UserBooksListedPage() {
  const navigate = useNavigate();
  const [exchangeBooks, setExchangeBooks] = useState([]);
  const [donations, setDonations] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    const localUserId = localStorage.getItem('userId');
    if (!localUserId) {
      navigate('/login');
      return;
    }
    (async () => {
      try {
        const resBooks = await api.get(`/books/user/${localUserId}`);
        setExchangeBooks(resBooks.data);
        const resDonations = await api.get(`/donations/user/${localUserId}`);
        setDonations(resDonations.data);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [navigate]);

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

  const handleDeleteBook = async (bookId) => {
    try {
      await api.delete(`/books/${bookId}`);
      setExchangeBooks(exchangeBooks.filter((b) => b._id !== bookId));
    } catch (err) {
      console.error(err);
      alert('Error deleting book');
    }
  };

  const handleDeleteDonation = async (donationId) => {
    try {
      await api.delete(`/donations/${donationId}`);
      setDonations(donations.filter((d) => d._id !== donationId));
    } catch (err) {
      console.error(err);
      alert('Error deleting donation');
    }
  };

  const handleUpdateBook = (bookId) => {
    navigate(`/exchange/${bookId}/update`);
  };

  const handleUpdateDonation = (donationId) => {
    navigate(`/donate/${donationId}/update`);
  };

  return (
    <div className="user-books-listed-container">
      <div className="top-bar">
        <div className="left-icons">
          <img
            src="/images/home.png"
            alt="Home"
            className="icon-button"
            onClick={() => navigate('/')}
          />
          <img
            src="/images/profileButton.png"
            alt="Personal"
            className="icon-button"
            onClick={() => navigate('/personal')}
          />
        </div>
        <div className="notification-icon-wrapper" onClick={() => navigate('/notifications')}>
          <img src="/images/notification.png" alt="Notifications" className="icon-button" />
          {notificationCount > 0 && (
            <div className="notification-counter">
              {notificationCount > 9 ? '9+' : notificationCount}
            </div>
          )}
        </div>
      </div>

      <div className="books-list">
        {exchangeBooks.map((book) => (
          <div key={book._id} className="book-card1 exchange-card">
            <div className="cover-wrapper">
              {book.coverImage ? (
                <img src={book.coverImage} alt="cover" />
              ) : (
                <div className="placeholder-cover">No Image</div>
              )}
            </div>
            <div className="book-info">
              <h2>{book.title}</h2>
              <p className="description">
                {book.description?.slice(0, 180) || 'No description provided.'}
                {book.description && book.description.length > 180 && '...'}
              </p>
              <div className="buttons-row">
                <button className="delete-btn" onClick={() => handleDeleteBook(book._id)}>
                  delete
                </button>
                <button className="update-btn" onClick={() => handleUpdateBook(book._id)}>
                  update
                </button>
              </div>
            </div>
            <div className="status-label">ready for exchange</div>
          </div>
        ))}

        {donations.map((don) => (
          <div key={don._id} className="book-card1 donation-card">
            <div className="cover-wrapper">
              {don.coverImage ? (
                <img src={don.coverImage} alt="cover" />
              ) : (
                <div className="placeholder-cover">No Image</div>
              )}
            </div>
            <div className="book-info">
              <h2>{don.title}</h2>
              <p className="description">
                {don.description?.slice(0, 180) || 'No description provided.'}
                {don.description && don.description.length > 180 && '...'}
              </p>
              <div className="buttons-row">
                <button className="delete-btn" onClick={() => handleDeleteDonation(don._id)}>
                  delete
                </button>
                <button className="update-btn" onClick={() => handleUpdateDonation(don._id)}>
                  update
                </button>
              </div>
            </div>
            <div className="status-label">ready for donation</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default UserBooksListedPage;
