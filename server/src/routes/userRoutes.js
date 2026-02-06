import express  from 'express'
import { acceptedUserRequest, dicoverUsers, followUser, getUserConnections, getUserData, 
    sendConnectionRequest, unfollowUser, updateUserData } from "../controllers/userConroller.js"
import { protect } from '../middleware/auth.js'
import  { upload } from '../config/multer.js'

const userRouter = express.Router();

userRouter.get('/data', protect, getUserData);
userRouter.post('/update',upload.fields([{name:'profile', maxCount:1},
    {name:'cover', maxCount:1}
]), protect, updateUserData);
userRouter.post('/discover',  protect, dicoverUsers);
userRouter.post('/follow',  protect, followUser);
userRouter.post('/unfollow',  protect, unfollowUser );

userRouter.post('/connect',  protect, sendConnectionRequest );
userRouter.post('/accept',  protect, acceptedUserRequest );
userRouter.get('/connections' , protect , getUserConnections);


export default userRouter;