import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import './UpdateDonationPage.css';

function UpdateDonationPage() {
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
        const res = await api.get(`/donations/${id}`, { withCredentials: true });
        const d = res.data;
        if (!d) {
          alert('Donation not found!');
          return;
        }
        setTitle(d.title || '');
        setAuthor(d.author || '');
        setGenre(d.genre || '');
        setBookShape(d.bookShape || '');
        setPages(d.pages || '');
        setDescription(d.description || '');
        setExistingCover(d.coverImage || '');
      } catch (err) {
        console.error(err);
        alert('Error fetching donation data');
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
      alert('Please fill in Title, Author, Genre, Book Shape, and Pages');
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
      await api.put(`/donations/${id}`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigate('/userbookslisted');
    } catch (err) {
      console.error(err);
      alert('Error updating donation');
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0] || null);
  };

  return (
    <div className="update-donation-container">
      <div className="top-bar">
        <img
          src="/images/home.png"
          alt="Home"
          className="icon-button"
          onClick={() => navigate('/')}
        />
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
          <input type="text" placeholder="Enter book title..." value={title} onChange={(e) => setTitle(e.target.value)} />

          <label>Author</label>
          <input type="text" placeholder="Enter author..." value={author} onChange={(e) => setAuthor(e.target.value)} />

          <label>Genre</label>
          <input type="text" placeholder="Enter genre..." value={genre} onChange={(e) => setGenre(e.target.value)} />

          <label>Book Shape</label>
          <input type="text" placeholder="Enter book shape..." value={bookShape} onChange={(e) => setBookShape(e.target.value)} />

          <label>Number of Pages</label>
          <input type="number" placeholder="Enter number of pages..." value={pages} onChange={(e) => setPages(e.target.value)} />

          <label>About The Book</label>
          <textarea placeholder="Write description here..." value={description} onChange={(e) => setDescription(e.target.value)} />
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
      <button className="update-btn" onClick={handleUpdate}>
        update
      </button>
    </div>
  );
}

export default UpdateDonationPage;
