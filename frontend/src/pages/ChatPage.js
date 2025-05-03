// src/pages/ChatPage.js
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import api from '../api';
import './ChatPage.css';

const SOCKET_URL = (
  process.env.REACT_APP_API_URL || 'http://localhost:5000'
).replace(/\/$/, '');

const socket = io(SOCKET_URL, {
  withCredentials: true
});

function ChatPage() {
  const { chatId } = useParams();
  const navigate   = useNavigate();
  const [messages, setMessages] = useState([]);
  const [text, setText]         = useState('');
  const endRef                 = useRef(null);

  useEffect(() => {
    socket.emit('join-chat', chatId);

    (async () => {
      try {
        const res = await api.get(`/chat/session/${chatId}`);
        setMessages(res.data);
      } catch {
        navigate('/login');
      }
    })();

    socket.on('new-message', msg => {
      if (msg.chatId === chatId) {
        setMessages(m => [...m, msg]);
      }
    });

    return () => socket.off('new-message');
  }, [chatId, navigate]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    if (!text.trim()) return;
    const sender = localStorage.getItem('userId') || 'anon';
    try {
      await api.post('/chat/session/send', { chatId, text, sender });
      socket.emit('send-message', { chatId, text, sender });
      setText('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="chat-page-container">
      {/* … your existing markup … */}
      <div className="chat-messages">
        {messages.map((m,i) => (
          <div key={i} className={`message-row ${m.sender === localStorage.getItem('userId') ? 'own-message' : ''}`}>
            <div className="message-bubble">
              <p>{m.text}</p>
              <span className="message-time">{new Date(m.timestamp).toLocaleTimeString()}</span>
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <div className="chat-input-form">
        <input
          type="text"
          className="text-input"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
        />
        <img src="/images/send.png" alt="Send" onClick={send} style={{ width: 40, cursor: 'pointer' }}/>
      </div>
    </div>
  );
}

export default ChatPage;
