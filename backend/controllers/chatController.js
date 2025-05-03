// controllers/chatController.js
import Chat from '../models/Chat.js';
import User from '../models/User.js';

export const getUserChats = async (req, res) => {
  try {
    const userId = req.userId; // from verifyJWT
    const chats = await Chat.find({ participants: userId })
      .sort({ updatedAt: -1 })
      .lean();

    for (let chat of chats) {
      const participantDocs = await User.find(
        { _id: { $in: chat.participants } },
        { username: 1 }
      ).lean();

      const userMap = {};
      for (let doc of participantDocs) {
        userMap[doc._id.toString()] = doc.username;
      }

      chat.participants = chat.participants.map((idStr) => ({
        _id: idStr,
        username: userMap[idStr] || 'UnknownUser'
      }));
    }

    res.status(200).json(chats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const chat = await Chat.findById(chatId);
    if (!chat)
      return res.status(404).json({ message: 'Chat not found' });
    res.status(200).json(chat.messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { chatId, text, sender } = req.body;
    if (!chatId || !text || !sender) {
      return res
        .status(400)
        .json({ message: 'Chat ID, text, and sender are required' });
    }
    const chat = await Chat.findById(chatId);
    if (!chat)
      return res.status(404).json({ message: 'Chat not found' });

    chat.messages.push({ sender, text });
    await chat.save();

    res.status(201).json({
      message: 'Message sent',
      newMessage: chat.messages[chat.messages.length - 1]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.userId;
    const chat = await Chat.findById(chatId);
    if (!chat)
      return res.status(404).json({ message: 'Chat not found' });
    if (!chat.participants.includes(userId)) {
      return res
        .status(403)
        .json({ message: 'You are not a participant in this chat' });
    }
    await Chat.findByIdAndDelete(chatId);
    res.status(200).json({ message: 'Chat deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
