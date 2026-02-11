import React, { useState } from 'react'
import { dummyUserData } from '../assets/assets';
import { Image, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { useAuth } from '@clerk/clerk-react'
import api from '../api/axios.js';
import { useNavigate } from 'react-router-dom'

const CreatePost = () => {

  const {getToken} = useAuth();
  const navigate = useNavigate();

  const [content, setContent] = useState('')
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);


  const user = useSelector((state) => state.user.value);

  const handleSubmit = async () => {
    if (!images.length && !content) {
      return toast.error("add image and text");
    }
    setLoading(true);
    const postType = images.length && content ? 'text-with-image' : images.length ? 'image' : 'text'

    try {
      const formData = new FormData();
      formData.append('content', content)
      formData.append('post_type', postType)
      images.map((image) => {
        formData.append('images', image)
      });

      const { data } = await api.post('/api/post/add', formData, {
        headers: { Authorization: `Bearer ${await getToken()}` }
      })
      if (data.success) {
        navigate('/');
      }
      else {
        console.log(data.message);
        throw new Error(data.message)
      }

    } catch (error) {
      console.log(error.message);
      throw new Error(error.message);
    }
    setLoading(false);
  }

  return (
    <div className='min-h-screen bg-gradient-to-b from-slate-50 to-white'>
      <div className="max-w-6xl mx-auto p-6">
        {/* titile */}
        <div className="mb-8">
          <h1 className='text-3xl font-bold text-slate-900 mb-2'>Create Post</h1>
          <p className='text-slate-600'>shere your thoutswith the world</p>
        </div>

        {/* form */}
        <div className="max-w-xl bg-white p-4 sm:p-8 sm:pb-3 rounded-xl shadow-md space-y-4">
          {/* header */}
          <div className="flex items-center gap-3">
            <img src={user.profile_picture} className='w-12 h-12 rounded-full shadow' alt="" />
            <div className="">
              <h2 className="font-semibold">{user.full_name}</h2>
              <p className='text-sm text-gray-500'>@{user.username}</p>
            </div>
          </div>
          {/* textaria */}
          <textarea className='w-full resize-none max-h-20 mt-4 text-sm 
          outline-none placeholder-gray-400' placeholder="What's happning?"
            onChange={(e) => setContent(e.target.value)} value={content} />

          {/* images */}
          {
            images.length > 0 && <div className="flex flex-wrap gap-2 mt-4">
              {images.map((image, i) => (
                <div
                  key={i} className="relative group">
                  <img src={URL.createObjectURL(image)} className='rounded-md h-20' alt="" />
                  <div className="absolute hidden group-hover:flex bg-black/40  justify-center items-center top-0
             right-0 bottom-0 left-0 rounded-md cursor-pointer"
                    onClick={() => setImages(images.filter((_, index) => index !== i))}>
                    <X
                      className='w-6 h-6 text-white' />
                  </div>
                </div>
              ))}
            </div>
          }

          {/* bottom barr */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-500">

            <label
              htmlFor="images"
              className="flex items-center gap-2 text-sm cursor-pointer
    text-gray-500 hover:text-gray-700"
            >
              <Image className="size-6" />
              <input
                type="file"
                id="images"
                accept="image/*"
                hidden
                multiple
                onChange={(e) =>
                  setImages([...images, ...e.target.files])
                }
              />
              Add Image
            </label>

            <button
              disabled={loading}
              onClick={() =>
                toast.promise(
                  handleSubmit(), // 👈 function CALL
                  {
                    loading: 'Uploading...',
                    success: 'Post Added ✅',
                    error: 'Post Not Added ❌',
                  }
                )
              }
              className="text-sm bg-gradient-to-r from-indigo-500 to-purple-600
              hover:from-indigo-700 hover:to-purple-700 rounded-md
                 active:scale-95 transition text-white font-medium px-8 py-2"
            >
              Publish Post
            </button>


          </div>

        </div>
      </div>
    </div>
  )
}

export default CreatePost
