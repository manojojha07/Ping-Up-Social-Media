import { readFileSync } from 'fs';
import Story, { } from '../models/story.js'
import imagekit from '../config/imagekit.js';
import User from '../models/userModel.js';
import { inngest } from '../ingest/index.js';

import fs from 'fs';

export const addUserStory = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { content, media_type, background_color } = req.body;

    const media = req.file;
    let media_url = '';

    // Upload media to ImageKit only if file exists
    if ((media_type === 'image' || media_type === 'video') && media) {
      const fileBuffer = fs.readFileSync(media.path);
      const response = await imagekit.upload({
        file: fileBuffer,
        fileName: media.originalname,
      });
      media_url = response.url;
    }

    // Create story
    const story = await Story.create({
      user: userId,
      content,
      media_url,
      media_type,
      background_color,
    });

    // Schedule story deletion after 24 hours
    await inngest.send({
      name: 'app/story.delete',
      data: { storyId: story._id },
    });

    res.json({ success: true, message: 'Story created successfully' });

  } catch (error) {
    console.log("Upload user story error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};




// get story allm users

export const getStory = async(req, res) => {
   try {
    const { userId } = req.auth();
    const user = await User.findById(userId);

    // user connection and follwing
    const userIds = [user, ...user.connections, ...user.following]
    const stories = await Story.find({
        user: {$in :userIds}
    }).populate('user').sort({createdAt: -1});

    res.json({success:true, stories});
    
   } catch (error) {
     console.log("get user story  ");
        res.json({ success: false, message: error.message })
   }
}