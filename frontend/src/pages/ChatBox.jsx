import React, { useEffect, useRef, useState } from 'react'
import { dummyMessagesData, dummyUserData } from '../assets/assets'
import { ImagesIcon, SendHorizonal } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useParams } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import api from '../api/axios';
import { addMessage, fetchMessages, resetMessages } from '../features/messages/messageSlice.js';
import toast from 'react-hot-toast';


 console.log("backend url from chat box :> " ,import.meta.env.VITE_BASE_URL);
 


const ChatBox = () => {

  const {messages} = useSelector((state) => state.messages);
  const { userId } = useParams()
  const { getToken } = useAuth();
  
  const { pathname } = useLocation();
  const pathnameRef = useRef(pathname)

  
  const dispatch = useDispatch()

  const [text, setText] = useState('');
  const [image, setImages] = useState(null);
  const [user, setUser] = useState(null);
  const messagesEndRef = useRef(null)

  const connections = useSelector((state) => state.connections.connections)


  const fetchUserMessages = async ()=> {
    try {
      const token = await getToken();
      dispatch(fetchMessages({token, userId}))
    } catch (error) {
      console.log("fatchng problam chatbox error");
      
      toast.error(error.message);
    }
  }

  const sendMessage = async() => {
try {
  if(!text && !image) return;

  const token = await getToken();
  const formData = new FormData();
  formData.append('to_user_id', userId)
  formData.append('text', text);
  image && formData.append('image', image);

  const  { data } = await api.post('/api/message/send', formData, {headers:{
    Authorization : `Bearer ${token}`
  }})

   console.log("SSE URL:", `${import.meta.env.VITE_BASE_URL}/api/message/${user?._id}?token=...`);


  if(data.success){
    setText('')
    setImages(null)
    dispatch(addMessage(data.message))
  }else{
    throw new Error(data.message)
  }
} catch (error) {
  console.log("error sent message chatbox");
  
  toast.error(
   error.message
  );
}
  }



  useEffect(()=> {
    fetchUserMessages();
    return () => {
      dispatch(resetMessages());
    }
  },[userId]);


  useEffect(() => {
    if(connections.length > 0){
      const user = connections.find(connection => connection._id === userId)
      setUser(user);
    }
  },[connections, userId])


useEffect(() => {
pathnameRef.current = pathname
}, [pathname])

useEffect(() => {
  if (user) {
    const eventSource = new EventSource(import.meta.env.VITE_BASE_URL + '/api/message/' + user._id);

    eventSource.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (pathnameRef.current === ('/messages/' + message.from_user_id._id)) {
        dispatch(addMessage(message));
      }
    };

    return () => {
      eventSource.close();
    };
  }
}, [user, dispatch]);



  useEffect(()=> {
    messagesEndRef.current?.scrollIntoView({behavior: "smooth"})
  },[messages])


  return user && (
    <div className='flex flex-col h-screen'>
       <div className="flex items-center gap-2 p-2 md:px-10 xl:pl-42 border-b border-gray-300
       bg-gradient-to-r from-indigo-50 to-purple-50">
        <img src={user.profile_picture} alt="" className='size-8 rounded-full' />
        <div className="">
          <p className='font-medium'>{user.full_name}</p>
          <p className="text-sm -mt-1.5 text-gray-500">@{user.username}</p>
        </div>
       </div>
       <div className="p-5 md:px-10 h-full overflow-x-scroll">
        <div className="space-y-4 max-w-4xl mx-auto">
          {
            messages.toSorted((a,b)=> new Date(a.createdAt) - new Date(b.createdAt)).map((message, index)=> (
             <div  key={index} className={`flex flex-col ${message.to_user_id !== user._id
              ? 'items-start' : 'items-end'}`}>
                <div className={`p-2 text-sm max-w-sm bg-white text-salte-700 rounded-lg shadow ${message.to_user_id !== user._id ? 'rounded-bl-none' : 'rounded-br-none'}`}>
                  {message.message_type  === 'image' &&
                  <img src={message.media_url} className='w-full max-w-sm rounded-lg mb-1' alt="" /> }
                  <p>{message.text}</p>
                </div>
             </div>
            ))
          }
          <div ref={messagesEndRef} className="" />
        </div>

       </div>

       <div className="px-4">
        <div className="flex items-center gap-3 pl-5 p-1.5 bg-white w-full max-w-xl mx-auto border border-gray-200 shadow rounded-full mb-5">
          <input type="text" className='flex-1 outline-none text-salte-700' placeholder='Type a message...' onChange={(e) =>setText(e.target.value)} value={text}
         onKeyDown={(e) => e.key === 'Enter' && sendMessage()} />
          <label htmlFor="image">
            {
              image 
              ? <img src={URL.createObjectURL(image)}  alt='' className='h-8 rounded'/> 
              : <ImagesIcon className='size-7 text-gray-400 cursor-pointer' />
            }
            <input type="file" id='image' accept='image/*' hidden onChange={(e) => setImages(e.target.files[0])} />
          </label>
          <button onClick={sendMessage}
           className='bg-purple-500  active:scale-95 cursor-pointer text-white p-2 rounded-full'>
            <SendHorizonal size={18} />
          </button>
        </div>
       </div>
    </div>
  )
}

export default ChatBox
