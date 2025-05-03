// src/pages/ChatListPage.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import './ChatListPage.css';

function ChatListPage() {
  const [chats, setChats] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        // Fetch all chats for the logged-in user
        const res = await api.get('/chat/user', { withCredentials: true });
        setChats(res.data);
      } catch (err) {
        console.error(err);
        navigate('/login');
      }
    })();
  }, [navigate]);

  const handleRemoveChat = async (chatId) => {
    try {
      await api.delete(`/chat/${chatId}`, { withCredentials: true });
      setChats(chats.filter((c) => c._id !== chatId));
    } catch (err) {
      console.error(err);
      alert('Error deleting chat');
    }
  };

  // For each chat, find the "other participant"
  const getOtherParticipant = (participants) => {
    const currentUserId = localStorage.getItem('userId');
    return participants.find((p) => p._id !== currentUserId) || participants[0];
  };

  return (
    <div className="chat-list-container">
      <div className="top-bar">
        <img
          src="/images/home.png"
          alt="Home"
          className="icon-button"
          onClick={() => navigate('/')}
        />

        <div className="center-brand">
          <h2 className="site-title">The Book Loop</h2>
          <img
            src="/images/book-loop.png"
            alt="Site Logo"
            className="site-logo"
          />
        </div>

        <img
          src="/images/profileButton.png"
          alt="PersonalPage"
          className="icon-button"
          onClick={() => navigate('/personal')}
        />
      </div>

      <div className="chat-list">
        {chats.map((chat) => {
          const otherUser = getOtherParticipant(chat.participants);
          const shortInfo = chat.bookTitle
            ? chat.bookTitle
            : 'No specific title / reason';

          return (
            <div key={chat._id} className="chat-card">
              <div className="user-pic">
                {otherUser?.profilePicture ? (
                  <img src={otherUser.profilePicture} alt="user" />
                ) : (
                  <img src="/images/defaultProfile.png" alt="user" />
                )}
              </div>

              <div className="chat-info">
                <h3>{otherUser?.username || 'Unknown'}</h3>
                <p>{shortInfo}</p>
              </div>

              <div className="chat-actions">
                <img 
                  src="/images/delete.png" 
                  alt="Delete Chat" 
                  className="delete-icon" 
                  onClick={() => handleRemoveChat(chat._id)}
                  style={{ cursor: 'pointer', width: '30px', height: '30px' }}
                />
                <button
                  className="join-btn"
                  onClick={() => navigate(`/chat/${chat._id}`)}
                >
                  join
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ChatListPage;
