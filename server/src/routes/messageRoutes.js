import express from 'express'
import { getChatMessages, sendMessage, sseController } from '../controllers/messageConroller.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../config/multer.js';

const messageRouter = express.Router();

messageRouter.get('/:userId',protect, sseController);
messageRouter.post('/send' , upload.single('image'), protect, sendMessage);
messageRouter.post('/get' , protect, getChatMessages);



export default messageRouter;


