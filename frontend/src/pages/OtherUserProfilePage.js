// src/pages/OtherUserProfilePage.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import './OtherUserProfilePage.css';

function OtherUserProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [otherUser, setOtherUser] = useState(null);
  const [lastBooks, setLastBooks] = useState([]);

  // Fetch the other user's profile data.
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await api.get(`/users/${userId}`);
        setOtherUser(res.data);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };
    fetchUserProfile();
  }, [userId]);

  // Fetch the last three books of the other user.
  useEffect(() => {
    const fetchLastThreeBooks = async () => {
      try {
        const res = await api.get(`/books/user/${userId}/last-three`, { withCredentials: true });
        setLastBooks(res.data);
      } catch (error) {
        console.error('Error fetching last three books:', error);
      }
    };
    fetchLastThreeBooks();
  }, [userId]);

  if (!otherUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="other-user-container">
      <div className="top-bar">
        <img 
          src="/images/home.png" 
          alt="Home" 
          className="icon-button" 
          onClick={() => navigate('/')} 
        />
        <img 
          src="/images/notification.png" 
          alt="Notifications" 
          className="icon-button" 
          onClick={() => navigate('/notifications')}
        />
      </div>
      
      <div className="profile-section">
        {otherUser.profilePicture ? (
          <img 
            src={otherUser.profilePicture} 
            alt="User Profile" 
            className="profile-pic" 
          />
        ) : (
          <div className="profile-placeholder">No Pic</div>
        )}

        <div className="info-block">
          <p className="username">{otherUser.username}</p>
          <p className="quote">{otherUser.quote || 'No quote provided'}</p>
        </div>

        {/* Button placed immediately under the info box */}
        <div className="profile-action-btns">
          <button className="view-all-btn" onClick={() => navigate(`/otheruserbooks/${userId}`)}>
            View All Books
          </button>
        </div>
      </div>

      <h3 className="books-title">Latest Books</h3>
      <div className="last-books-row">
        {lastBooks.map((book) => (
          <div 
            key={book._id} 
            className={`small-book-card ${book.type === 'donate' ? 'donation-card' : 'exchange-card'}`}
          >
            {book.coverImage ? (
              <img src={book.coverImage} alt="Book Cover" className="small-cover" />
            ) : (
              <div className="small-placeholder">No Image</div>
            )}
            <p className="small-title">{book.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default OtherUserProfilePage;
