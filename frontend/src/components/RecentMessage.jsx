import React, { useEffect, useState } from 'react'
import { dummyMessagesData, dummyRecentMessagesData } from '../assets/assets';
import { Link } from 'react-router-dom'
import moment from 'moment';
import { useAuth, useUser } from '@clerk/clerk-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const RecentMessage = () => {
  const [messages, setMessages] = useState([]);

  const { getToken } = useAuth();
  const { user } = useUser();

  const fetchRecentMessages = async () => {
    try {
      const { data } = await api.get('/api/user/recent-messages', {
        headers:
          { Authorization: `Bearer ${await getToken()}` }
      })
      if (data.success) {
      const groupedMessages = data.messages.reduce((acc, message) => {
  const senderId = message?.from_user_id?._id;
  if (!senderId) return acc; // skip agar sender missing ho

  const msgCreatedAt = message?.createdAt ? new Date(message.createdAt) : new Date(0); // default date agar missing ho

  if (!acc[senderId] || msgCreatedAt > new Date(acc[senderId].createdAt || 0)) {
    acc[senderId] = message;
  }
  return acc;
}, {})

// sort message by date safely
const sortedMessage = Object.values(groupedMessages).sort((a, b) => {
  const aDate = a?.createdAt ? new Date(a.createdAt) : new Date(0)
  const bDate = b?.createdAt ? new Date(b.createdAt) : new Date(0)
  return bDate - aDate
})

setMessages(sortedMessage)
      }
      else (
        toast.error(data.message)
      )
    } catch (error) {
      toast.error(error.message)
    }
  }
  useEffect(() => {
    fetchRecentMessages();
  }, [])


  return (
    <div className='bg-white max-w-xs mt-4 p-4 min-h-20 rounded-md shadow
     text-xs text-salte-800'>
      <h3 className='font-semibold text-salte-800 mb-4'>Recent Message</h3>
      <div className="flex flex-col max-h-50 overflow-y-scroll no-scrollbar">
        {
          messages.map((message, index) => (
            <Link to={`/messages/${message?.from_user_id?._id}`} key={index} className='flex items-start gap-2 py-2 hover:bg-slate-100'>
              <img src={message?.from_user_id?.profile_picture} className='w-8 h-8  rounded-full' alt="" />
              <div className="w-full ">
                <div className="flex justify-between ">
                  <p className='font-medium '>{message?.from_user_id?.full_name}</p>
                  <p className='text-slate-400 text-[10px]'>
                    {message?.createdAt ? moment(message.createdAt).fromNow() : ""}
                  </p>
                </div>
                <div className="flex justify-between">
                  <p className='text-gray-500'>{message.text ? message.text : 'Media'}</p>
                  {!message.seen && <p className='bg-indigo-500 text-white w-4 h-4 flex items-center
               justify-center rounded-full text-[10px]'> 1</p>}
                </div>
              </div>
            </Link>
          ))
        }

      </div>
    </div>
  )
}

export default RecentMessage




