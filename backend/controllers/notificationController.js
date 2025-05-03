// controllers/notificationController.js
import Notification from '../models/Notification.js';
import Chat from '../models/Chat.js';
import Book from '../models/Book.js';
import Donation from '../models/Donation.js';
import User from '../models/User.js';

export const getNotifications = async (req, res) => {
  try {
    const userId = req.userId;
    // Return only pending notifications
    let notifications = await Notification.find({ user: userId, status: 'pending' })
      .sort({ createdAt: -1 })
      .lean();

    // For each notification, populate additional details
    for (let n of notifications) {
      // Fetch requester details
      const userDoc = await User.findById(n.requester).lean();
      if (userDoc) {
        n.requesterUserDoc = {
          _id: userDoc._id.toString(),
          username: userDoc.username,
          profilePicture: userDoc.profilePicture || '/images/defaultProfile.png'
        };
      }

      // Depending on type, fetch item details (book/donation)
      if (n.type === 'exchange_request' && n.requesterBook) {
        const requestersBook = await Book.findById(n.requesterBook).lean();
        if (requestersBook) {
          n.itemDoc = {
            _id: requestersBook._id.toString(),
            coverImage: requestersBook.coverImage || '/images/defaultBook.png',
            title: requestersBook.title || 'No Title',
            description: requestersBook.description || 'No description.'
          };
        }
      } else if (n.type === 'donation_request') {
        const donationDoc = await Donation.findById(n.book).lean();
        if (donationDoc) {
          n.itemDoc = {
            _id: donationDoc._id.toString(),
            coverImage: donationDoc.coverImage || '/images/defaultBook.png',
            title: donationDoc.title || 'No Title',
            description: donationDoc.description || 'No description.'
          };
        }
      }
    }

    res.status(200).json(notifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    await Notification.findByIdAndDelete(notificationId);
    res.status(200).json({ message: 'Notification deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const acceptBookRequest = async (req, res) => {
  try {
    const { notificationId } = req.body;
    const notification = await Notification.findById(notificationId);
    if (!notification)
      return res.status(404).json({ message: 'Notification not found' });

    // For exchange or donation, determine the book title for the chat
    let itemTitle = '';
    if (notification.type === 'exchange_request') {
      const targetBook = await Book.findById(notification.book);
      if (targetBook) {
        itemTitle = targetBook.title;
      }
    } else if (notification.type === 'donation_request') {
      const donation = await Donation.findById(notification.book);
      if (donation) {
        itemTitle = donation.title;
      }
    }

    // Find or create a chat
    let chat = await Chat.findOne({
      participants: { $all: [notification.user, notification.requester] },
      bookTitle: itemTitle
    });
    if (!chat) {
      chat = new Chat({
        participants: [notification.user, notification.requester],
        bookTitle: itemTitle,
        messages: []
      });
      await chat.save();
    }

    // Delete the notification so it no longer appears on refresh
    await Notification.findByIdAndDelete(notificationId);

    res.status(200).json({ message: 'Request accepted', chatId: chat._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const denyBookRequest = async (req, res) => {
  try {
    const { notificationId } = req.body;
    const notification = await Notification.findById(notificationId);
    if (!notification)
      return res.status(404).json({ message: 'Notification not found' });

    // Delete the notification on rejection.
    await Notification.findByIdAndDelete(notificationId);

    res.status(200).json({ message: 'Request denied' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// (markNotificationAsRead remains if needed elsewhere)
export const markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.body;
    await Notification.findByIdAndUpdate(notificationId, { read: true });
    res.status(200).json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
