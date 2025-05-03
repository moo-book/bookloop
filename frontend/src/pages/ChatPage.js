// src/pages/ChatPage.js
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import api from '../api';
import './ChatPage.css';

// Point Socket.IO at your Render backend
const socket = io(
  process.env.REACT_APP_API_URL
    ? process.env.REACT_APP_API_URL.replace('/api', '')
    : 'https://bookloop-q8dv.onrender.com',
  {
    withCredentials: true
  }
);

function ChatPage() {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Join chat room
    socket.emit('join-chat', chatId);

    // Load existing messages
    (async () => {
      try {
        const res = await api.get(`/chat/session/${chatId}`, { withCredentials: true });
        setMessages(res.data);
      } catch (err) {
        console.error(err);
        navigate('/login');
      }
    })();

    // Listen for new messages
    socket.on('new-message', (msg) => {
      if (msg.chatId === chatId) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => {
      socket.off('new-message');
    };
  }, [chatId, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim()) return;
    const sender = localStorage.getItem('userId') || 'Anonymous';
    try {
      // Save to DB
      await api.post(
        '/chat/session/send',
        { chatId, text, sender },
        { withCredentials: true }
      );
      // Emit via socket
      socket.emit('send-message', { chatId, text, sender });
      setText('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="chat-page-container">
      <div className="chat-header">
        <img
          src="/images/home.png"
          alt="Home"
          style={{ width: '40px', cursor: 'pointer', marginRight: '10px' }}
          onClick={() => navigate('/')}
        />
        <img
          src="/images/chat.png"
          alt="ChatList"
          style={{ width: '40px', cursor: 'pointer' }}
          onClick={() => navigate('/chatlist')}
        />
      </div>

      <div className="chat-messages">
        {messages.map((msg, idx) => {
          const isMine = msg.sender === localStorage.getItem('userId');
          return (
            <div
              key={idx}
              className={`message-row ${isMine ? 'own-message' : ''}`}
            >
              <div className="message-bubble">
                <p className="message-text">{msg.text}</p>
                <span className="message-time">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-form">
        <input
          type="text"
          className="text-input"
          placeholder="Type message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <img
          src="/images/send.png"
          alt="Send"
          style={{ width: '40px', cursor: 'pointer' }}
          onClick={handleSend}
        />
      </div>
    </div>
  );
}

export default ChatPage;
