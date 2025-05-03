// src/App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';

import HomePage                from './pages/HomePage';
import AboutUsPage             from './pages/AboutUsPage';
import LoginPage               from './pages/LoginPage';
import RegisterPage            from './pages/RegisterPage';
import PersonalPage            from './pages/PersonalPage';
import NotificationPage        from './pages/NotificationPage';
import ChatListPage            from './pages/ChatListPage';
import ChatPage                from './pages/ChatPage';

import ExchangeListPage        from './pages/ExchangeListPage';
import InsertExchangeBookPage  from './pages/InsertExchangeBookPage';
import ExchangeDetailPage      from './pages/ExchangeDetailPage';
import UpdateExchangeBookPage  from './pages/UpdateExchangeBookPage';

import DonateListPage          from './pages/DonateListPage';
import InsertDonationPage      from './pages/InsertDonationPage';
import DonateDetailPage        from './pages/DonateDetailPage';
import UpdateDonationPage      from './pages/UpdateDonationPage';

import RecommendationPage      from './pages/RecommendationPage';
import UserBooksListedPage     from './pages/UserBooksListedPage';
import ResetPasswordPage       from './pages/ResetPasswordPage';
import OtherUserProfilePage    from './pages/OtherUserProfilePage';
import OtherUserBooksPage      from './pages/OtherUserBooksPage';

function App() {
  return (
    <Routes>
      {/* public pages */}
      <Route path="/"             element={<HomePage />} />
      <Route path="/about"        element={<AboutUsPage />} />
      <Route path="/login"        element={<LoginPage />} />
      <Route path="/register"     element={<RegisterPage />} />
      <Route path="/resetpassword" element={<ResetPasswordPage />} />

      {/* recommendation chat */}
      <Route path="/recommendations" element={<RecommendationPage />} />

      {/* exchange flow */}
      <Route path="/exchange"           element={<ExchangeListPage />} />
      <Route path="/exchange/new"       element={<InsertExchangeBookPage />} />
      <Route path="/exchange/:id/update" element={<UpdateExchangeBookPage />} />
      <Route path="/exchange/:id"       element={<ExchangeDetailPage />} />

      {/* donation flow */}
      <Route path="/donate"            element={<DonateListPage />} />
      <Route path="/donate/new"        element={<InsertDonationPage />} />
      <Route path="/donate/:id/update" element={<UpdateDonationPage />} />
      <Route path="/donate/:id"        element={<DonateDetailPage />} />

      {/* user & social */}
      <Route path="/personal"        element={<PersonalPage />} />
      <Route path="/notifications"   element={<NotificationPage />} />
      <Route path="/chatlist"        element={<ChatListPage />} />
      <Route path="/chat/:chatId"    element={<ChatPage />} />
      <Route path="/userbookslisted" element={<UserBooksListedPage />} />
      <Route path="/otheruserprofile/:userId" element={<OtherUserProfilePage />} />
      <Route path="/otheruserbooks/:userId"   element={<OtherUserBooksPage />} />
    </Routes>
  );
}

export default App;
