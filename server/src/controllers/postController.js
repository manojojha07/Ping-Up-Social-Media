import fs from 'fs'
import imagekit from '../config/imagekit.js';
import Post from '../models/post.js';
import User from '../models/userModel.js'


// ADd post
export const addPost = async(req , res) => {
    try {
        const { userId } = req.auth();
        const { content, post_type } = req.body;
        const images = req.files;

        let image_urls = [];
    //   const profile = req.files.profile && req.files.profile[0]
        if(images.length){
            image_urls = await Promise.all(
                images.map(async(image)=> {
              const fileBuffer = fs.readFileSync(image.path)
              const response = await imagekit.upload({
                              file: fileBuffer,
                              fileName: image.originalname,
                              folder : "posts",
                          });
                          const url = imagekit.url({
                              path: response.filePath,
                              transformation: [
                                  { quality: 'auto' },
                                  { format: 'webp' },
                                  { width: '1280' }
                              ]
                               
                          })
                          return url;
                })
            )
        }

        await Post.create({
            user:userId,
            content,
            image_urls,
            post_type
        });
        
        res.json({success:true, message:"post created successfully!"})
    } catch (error) {
        console.log("image created problam" , error);
        res.json({success:false, message:error.message})
    }
}

// getPosts
export const getFeedPosts = async(req, res) => {
try {
    const { userId } = req.auth();
    const user = await User.findById(userId)
    
    // user connection and folllwings
    const userIds = [ userId, ...user.connections, ...user.following];
    const posts = await Post.find({user :{$in: userId}}).populate('user').sort({createdAt: -1})
    
    

    res.json({success:true, posts});

} catch (error) {
     console.log("get post error problam" , error);
        res.json({success:false, message:error.message})
}
}


// like posts

export const likePost = async(req, res) => {
    try {
        const { userId } = req.auth();
        const { postId } = req.body;

        const post = await Post.findById(postId);
        if(post.likes_count.includes(userId)){
            post.likes_count = post.likes_count.filter(user => user != userId)
            await post.save();
            res.json({success:true, message:"post unliked"});
        }
        else{
            post.likes_count.push(userId);
              await post.save();
            res.json({success:true, message:"post liked"});
        }
    
    } catch (error) {
  console.log("like post error problam" , error);
        res.json({success:false, message:error.message})
    }
}

