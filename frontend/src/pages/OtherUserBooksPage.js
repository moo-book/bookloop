// src/pages/OtherUserBooksPage.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import './OtherUserBooksPage.css';

function OtherUserBooksPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);

  // Fetch all books listed by the other user.
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await api.get(`/books/user/${userId}`, { withCredentials: true });
        // Ensure each book has a type; default to "exchange" if not set.
        const updatedBooks = res.data.map((book) => ({
          ...book,
          type: book.type ? book.type : 'exchange'
        }));
        setBooks(updatedBooks);
      } catch (error) {
        console.error('Error fetching books:', error);
      }
    };

    fetchBooks();
  }, [userId]);

  // Fetch the pending notifications count.
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/notifications', { withCredentials: true });
        const count = res.data.filter(n => n.status === 'pending').length;
        setNotificationCount(count);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
  }, []);

  return (
    <div className="other-books-container">
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
            alt="Profile" 
            className="icon-button" 
            onClick={() => navigate('/personal')}
          />
        </div>
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

      <div className="books-list">
        {books.map((book) => (
          <div 
            key={book._id} 
            className={`book-card ${book.type === 'donate' ? 'donation-card' : 'exchange-card'}`}
          >
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
                {book.description
                  ? book.description.length > 180
                    ? `${book.description.slice(0, 180)}...`
                    : book.description
                  : 'No description provided.'}
              </p>
              {book.ownerInfo && (
                <p 
                  onClick={() => navigate(`/otheruserprofile/${book.ownerInfo._id}`)}
                  className="owner-name"
                >
                  {book.ownerInfo.username}
                </p>
              )}
            </div>
            <button 
              className="status-label"
              onClick={() =>
                navigate(
                  book.type === 'donate'
                    ? `/donate/${book._id}`
                    : `/exchange/${book._id}`
                )
              }
            >
              {book.type === 'donate' ? 'Take' : 'Exchange'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default OtherUserBooksPage;
  