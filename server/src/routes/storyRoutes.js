import express from 'express'
import { upload } from '../config/multer.js';
import { addUserStory, getStory } from '../controllers/storyController.js';
import { protect } from '../middleware/auth.js';

const storyRouter = express.Router();

storyRouter.post('/create', upload.single('media'), protect, addUserStory);
storyRouter.get('/get', protect, getStory);

export default storyRouter;