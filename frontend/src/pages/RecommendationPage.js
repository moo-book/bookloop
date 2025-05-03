// src/pages/RecommendationPage.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import './RecommendationPage.css';

/**
 * This version keeps the original "simple" look that you liked,
 * but turns every recommendation into a clickable card using
 * react‑router's <Link>.  No other layout changes were made.
 */
function RecommendationPage() {
  const [question, setQuestion] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [botMessage, setBotMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!question.trim()) return;
    try {
      const res = await api.post('/ai/recommend', { question });
      setBotMessage(res.data.message || '');
      setRecommendations(res.data.recommendations || []);
      setQuestion('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="recommendation-container">
      {/* ───── header ───── */}
      <div className="header-bar">
        <img
          src="/images/home.png"
          alt="Home"
          className="home-icon"
          onClick={() => navigate('/')}
        />
        <h2 className="header-title">Recommendations</h2>
      </div>

      {/* ───── input row ───── */}
      <div className="recommendation-form">
        <input
          className="question-input"
          placeholder="Type a question (e.g. fantasy books)…"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        />
        <button className="submit-btn" onClick={handleSubmit}>
          Send
        </button>
      </div>

      {/* ───── greeting / error message ───── */}
      {botMessage && (
        <div className="bot-message">
          {botMessage.split('\n').map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      )}

      {/* ───── results list ───── */}
      <div className="recommendations-list">
        {recommendations.map((rec, idx) => (
          <Link
            to={rec.link}
            key={idx}
            className="recommendation-item"
            style={{ textDecoration: 'none' }}
          >
            <h3>{rec.title}</h3>
            <p>By {rec.author}</p>
            <p>{rec.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default RecommendationPage;