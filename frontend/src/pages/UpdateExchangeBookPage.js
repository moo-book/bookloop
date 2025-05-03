import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import './UpdateExchangeBookPage.css';

function UpdateExchangeBookPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState('');
  const [bookShape, setBookShape] = useState('');
  const [pages, setPages] = useState('');
  const [description, setDescription] = useState('');
  const [existingCover, setExistingCover] = useState('');
  const [file, setFile] = useState(null);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        await api.get(`/users/${localStorage.getItem('userId')}`, { withCredentials: true });
      } catch (err) {
        navigate('/login');
        return;
      }
      try {
        const res = await api.get(`/books/${id}`, { withCredentials: true });
        const b = res.data;
        setTitle(b.title || '');
        setAuthor(b.author || '');
        setGenre(b.genre || '');
        setBookShape(b.bookShape || '');
        setPages(b.pages || '');
        setDescription(b.description || '');
        setExistingCover(b.coverImage || '');
      } catch (err) {
        console.error(err);
        alert('Error fetching book data');
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

  const handleUpdate = async () => {
    if (!title || !author || !genre || !bookShape || !pages) {
      alert('Title, Author, Genre, Book Shape, and Number of Pages cannot be empty');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('author', author);
      formData.append('genre', genre);
      formData.append('bookShape', bookShape);
      formData.append('pages', pages);
      formData.append('description', description);
      if (file) formData.append('coverImage', file);
      await api.put(`/books/${id}`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigate('/userbookslisted');
    } catch (err) {
      console.error(err);
      alert('Error updating book');
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0] || null);
  };

  return (
    <div className="update-exchange-container">
      <div className="top-bar">
        <img src="/images/home.png" alt="Home" className="icon-button" onClick={() => navigate('/')} />
        <h2 className="site-title">The Book Loop</h2>
        <div className="notification-icon-wrapper" onClick={() => navigate('/notifications')}>
          <img src="/images/notification.png" alt="Notifications" className="icon-button" />
          {notificationCount > 0 && (
            <div className="notification-counter">
              {notificationCount > 9 ? '9+' : notificationCount}
            </div>
          )}
        </div>
      </div>
      <div className="update-block">
        <div className="left-info">
          <label>Title</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />

          <label>Author</label>
          <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} />

          <label>Genre</label>
          <input type="text" value={genre} onChange={(e) => setGenre(e.target.value)} />

          <label>Book Shape</label>
          <input type="text" value={bookShape} onChange={(e) => setBookShape(e.target.value)} />

          <label>Number of Pages</label>
          <input type="number" value={pages} onChange={(e) => setPages(e.target.value)} />

          <label>About the Book</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="right-cover">
          {file ? (
            <img src={URL.createObjectURL(file)} alt="New Cover" className="cover-preview" />
          ) : existingCover ? (
            <img src={existingCover} alt="Existing Cover" className="cover-preview" />
          ) : (
            <div className="placeholder-cover">No Cover</div>
          )}
          <input type="file" onChange={handleFileChange} />
        </div>
      </div>
      <button className="update-btn" onClick={handleUpdate}>update</button>
    </div>
  );
}

export default UpdateExchangeBookPage;
