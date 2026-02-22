import fs from 'fs';
import imagekit from '../config/imagekit.js';
import Message from '../models/message.js';

// store SSE connections per user (multi-tab support)

// Store active connections
const connections = {};

export const sseController = (req, res) => {
  const { userId } = req.params;

  // SSE headers
  res.setHeader('Content-Type', 'text/event-stream');   // <- must
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Save connection
  connections[userId] = res;

  // Send initial ping
  res.write(`data: ${JSON.stringify({ message: "SSE connected" })}\n\n`);

  // Remove on disconnect
  req.on('close', () => {
    delete connections[userId];
    console.log(`Client ${userId} disconnected`);
  });
};

// Function to push messages
export const pushMessageToUser = (message) => {
  const toUserId = message.to_user_id;
  if (connections[toUserId]) {
    connections[toUserId].write(`data: ${JSON.stringify(message)}\n\n`);
  }
};

// send message
export const sendMessage = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { to_user_id, text } = req.body;
    const image = req.file;

    let media_url = '';
    let message_type = image ? 'image' : 'text';

    if (image) {
      const fileBuffer = fs.readFileSync(image.path);
      const response = await imagekit.upload({
        file: fileBuffer,
        fileName: image.originalname,
      });
      media_url = imagekit.url({ path: response.filePath });
    }

    const message = await Message.create({
      from_user_id: userId,
      to_user_id,
      text,
      message_type,
      media_url,
    });

    const messageWithUserData = await Message.findById(message._id)
      .populate('from_user_id')
      .lean();

    // Push to receiver via SSE
    pushMessageToUser(messageWithUserData);

    res.json({ success: true, message: messageWithUserData });
  } catch (err) {
    console.error("Send message error:", err);
    res.json({ success: false, message: err.message });
  }
};

// get chat messages between two users
export const getChatMessages = async (req, res) => {
  try {
    const userId = String(req.auth().userId);   // sender
    const { to_user_id } = req.body;           // receiver

    const messages = await Message.find({
      $or: [
        { from_user_id: userId, to_user_id },
        { from_user_id: to_user_id, to_user_id: userId },
      ]
    }).sort({ created_at: -1 });

    // mark messages as seen
    await Message.updateMany({ from_user_id: to_user_id, to_user_id: userId }, { seen: true });

    res.json({ success: true, messages });
  } catch (error) {
    console.error('GetChatMessages Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// get recent messages for a user
export const getUserRecentMessages = async (req, res) => {
  try {
    const userId = String(req.auth().userId);

    const messages = await Message.find({ to_user_id: userId })
      .populate('from_user_id to_user_id')
      .sort({ created_at: -1 });

    res.json({ success: true, messages });
  } catch (error) {
    console.error('GetUserRecentMessages Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};