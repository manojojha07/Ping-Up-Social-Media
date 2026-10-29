import express from 'express'
import { getChatMessages, sendMessage, sseController } from '../controllers/messageConroller.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../config/multer.js';

const messageRouter = express.Router();

//GET -- Sesstion create
messageRouter.get('/:userId',protect, sseController);

// POST -- sent message and upload only one photo
messageRouter.post('/send' , upload.single('image'), protect, sendMessage);

//GET -- Message chat
messageRouter.post('/get' , protect, getChatMessages);


export default messageRouter;


