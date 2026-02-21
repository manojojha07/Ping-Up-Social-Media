import { triggerAsyncId } from "async_hooks";
import imagekit from "../config/imagekit.js";
import Connection from "../models/Connection.js";
import User from "../models/userModel.js";
import fs from 'fs'
import Post from "../models/post.js";
import { inngest } from "../ingest/index.js";




// get user data using userId
export const getUserData = async (req, res) => {
    try {
        const { userId } = req.auth();

        const user = await User.findById(userId);

        if (!user) {
            return res.json({ success: false, message: "User not found" })
        }

        res.json({ success: true, user });
    } catch (error) {
        console.log("erro get user");
        res.json({ success: false, message: error.message })
    }
}

// updete user data 
export const updateUserData = async (req, res) => {
    try {
        const { userId } = req.auth();
        let { username, bio, location, full_name } = req.body;

        const tempUser = await User.findById(userId);

        !username && (username = tempUser.username)

        if (tempUser.username !== username) {
            const user = await User.findOne({ username })
            if (user) {
                // we will not change username if it already taken
                username = tempUser.username
            }
        }

        const updatedData = {
            username,
            bio,
            location,
            full_name
        }

        const profile = req.files.profile && req.files.profile[0]
        const cover = req.files.cover && req.files.cover[0]

        if (profile) {
            const buffer = fs.readFileSync(profile.path);
            const response = await imagekit.upload({
                file: buffer,
                fileName: profile.originalname,
            });
            const url = imagekit.url({
                path: response.filePath,
                transformation: [
                    { quality: 'auto' },
                    { format: 'webp' },
                    { width: '512' }
                ]
            })
           updatedData.profile_picture = url;
        }

        if (cover) {
            const buffer = fs.readFileSync(cover.path);
            const response = await imagekit.upload({
                file: buffer,
                fileName: cover.originalname,
            });
            const url = imagekit.url({
                path: response.filePath,
                transformation: [
                    { quality: 'auto' },
                    { format: 'webp' },
                    { width: '1280' }
                ]
                 
            })
            updatedData.cover_photo = url;
        }

        
       

        const user = await User.findByIdAndUpdate(userId, updatedData, { new: true })

        res.json({ success: true, user, message: "Profile updated successfully" })

    } catch (error) {
        console.log("erro get user");
        res.json({ success: false, message: error.message })
    }
}


// find user using username email location name
export const dicoverUsers = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { input } = req.body;

    const allUser = await User.find({
      $or: [
        { username: new RegExp(input, 'i') },
        { email: new RegExp(input, 'i') },
        { full_name: new RegExp(input, 'i') },
        { location: new RegExp(input, 'i') },
      ]
    });

    // ✅ SAFE comparison
    const filterUsers = allUser.filter(
      user => user._id.toString() !== userId
    );

    res.json({ success: true, users: filterUsers });

  } catch (error) {
    console.log("error get user", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// folllow users
export const followUser = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { id } = req.body;

        const user = await User.findById(userId);
        if (user.following.includes(id)) {
          return  res.json({ success: true, message: "you are allready folllwing this user!" })
        }
        user.following.push(id);
        await user.save();


        const toUser = await User.findById(id);
        toUser.followers.push(userId);
        await toUser.save();

        res.json({ success: true, message:" Now follow this user! " })


    } catch (error) {
        console.log("error folow  user");
        res.json({ success: false, message: error.message })
    }
}

// Unfollow user
export const unfollowUser = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { id } = req.body;

        const user = await User.findById(userId);

        user.following = user.following.filter(user => user !== id);
        await user.save();


        const toUser = await User.findById(id);
        toUser.followers = toUser.followers.filter(user => user !== userId);
        await toUser.save();

        res.json({ success: true, message: "you are not longer follwing this user!" });


    } catch (error) {
        console.log("erro get user");
        res.json({ success: false, message: error.message })
    }
}













// send connection request 
export const sendConnectionRequest = async(req , res) => {
try {
     const  {userId} = req.auth();
     const {id} = req.body;

    //  chack if user sent more then 20 connections request on the last 24 hours
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const connectionRequests = await Connection.find({from_user_id : userId,
         created_at: {$gt: last24Hours}});
         if(connectionRequests.length >= 20){
            return res.json({success:false, message:"You have sent limited Requests!"})
         }
        //  chack if user allready connected
         const connection = await Connection.findOne({
            $or: [
                {from_user_id: userId , to_user_id : id},
                {from_user_id: id , to_user_id : userId},
            ]
         })

         if(!connection) {
          const newConnection = await Connection.create({
                from_user_id : userId,
                to_user_id: id
            });

             await inngest.send({
                name: 'app/connections-request',
                data : {connectionId : newConnection._id}
             });

            return res.json({success:true, message:"Connection request sent successfully"});
         }
         else if(connection && connection.status === 'accepted'){
            return res.json({success:false, message:"you Allready Connected!"})
         }
         return res.json({success:false, message:"connection request pending :>"})

} catch (error) {
     console.log("erro follow");
        res.json({ success: false, message: error.message })
}
}

// get user connectins
export const getUserConnections = async(req , res) => {
try {
     const  {userId} = req.auth();
     const user = await User.findById(userId).populate('connections followers following')

     const connections = user.connections
     const followers = user.followers
     const following = user.following

     const pendingConnections = (await Connection.find({to_user_id:userId, 
        status: 'pending'}).populate('from_user_id')).map(connection =>connection.from_user_id )

        res.json({success:true, connections, followers, following ,pendingConnections });
     

} catch (error) {
     console.log("erro folleing");
        res.json({ success: false, message: error.message })
}
}

// accepting requests
export const acceptedUserRequest = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { id } = req.body;

    const connection = await Connection.findOne({
      from_user_id: id,
      to_user_id: userId,
    //   status: "pending",
    });

    if (!connection) {
      return res.json({
        success: false,
        message: "Connection not found",
      });
    }

    // Logged in user
    const user = await User.findById(userId);
     user.connections.push(id);
     await user.save();

    // Sender user
    const toUser = await User.findById(id);
    user.connections.push(userId);
     await toUser.save();

     

    // // ✅ Prevent duplicates
    // if (!user.connections.includes(id)) {
    //   user.connections.push(id);
    // }

    // if (!toUser.connections.includes(userId)) {
    //   toUser.connections.push(userId);
    // }

    // await user.save();
    // await toUser.save();

    // Update connection status
    connection.status = "accepted";
    await connection.save();

    res.json({
      success: true,
      message: "Connection accepted successfully",
    });
  } catch (error) {
    console.log("error accept request", error);
    res.json({ success: false, message: error.message });
  }
};




// /get user profiles
export const getUserProfiles  = async(req , res) => {
    try {
        const { profileId } = req.body;

        const profile = await User.findById(profileId);
        if(!profile){
           return res.json({success:false, message:"profile not found!"})
        }
        const posts = await Post.find({user : profileId }).populate('user');
        res.json({success:true, profile, posts})
        
        
    } catch (error) {
        console.log("get user  request");
        res.json({ success: false, message: error.message })
    }
}