import React, { useEffect } from 'react'
import { Route, Routes, Navigate, useLocation } from 'react-router-dom'
import { useUser, useAuth } from '@clerk/clerk-react'
import { useDispatch } from 'react-redux'
import toast, { Toaster } from 'react-hot-toast'

import Login from './pages/Login'
import Feed from './pages/Feed'
import Message from './pages/Message'
import ChatBox from './pages/ChatBox'
import Connect from './pages/Connect'
import Discover from './pages/discover'
import Profile from './pages/Profile'
import CreatePost from './pages/createPost'
import LayOut from './pages/LayOut'

import { fetchUser } from './features/user/userSlice'
import { fetchConnections } from './features/connections/connectionSlice'
import { useRef } from 'react'
import { addMessage } from './features/messages/messageSlice'
import Notification from './components/Notification'

const App = () => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const {pathname} = useLocation();

  const pathnameRef = useRef(pathname)

  const dispatch = useDispatch()

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      const token = await getToken()
      dispatch(fetchUser(token))
      dispatch(fetchConnections(token))
    }

    fetchData()
  }, [user, getToken, dispatch])


  useEffect(() => (
    pathnameRef.current = pathname
  ), [pathname])

  console.log(import.meta.env.VITE_BACKEND_URL);


  useEffect(() => {
    if (user) {
      const eventSource = new EventSource(import.meta.env.VITE_BACKEND_URL + '/api/message/' + user._id)

      eventSource.onmessage = (event) => {
        const message = JSON.parse(event.data)

        if(pathnameRef.current === ('/messages/' + message.from_user_id._id)){
          dispatch(addMessage(message))
        }else{
          toast.custom((t)=> (
            <Notification t={t} message={message}/>
          ),{position: "bottom-right"})
        }
      }
      return () => {
        eventSource.close();
      }
    }
  }, [user, dispatch])

  return (
    <>
      <Toaster />

      <Routes>
        {!user ? (
          <>
            {/* ONLY login when user is null */}
            <Route path="*" element={<Login />} />
          </>
        ) : (
          <>
            {/* Protected app routes */}
            <Route path="/" element={<LayOut />}>
              <Route index element={<Feed />} />
              <Route path="messages" element={<Message />} />
              <Route path="messages/:userId" element={<ChatBox />} />
              <Route path="connections" element={<Connect />} />
              <Route path="discover" element={<Discover />} />
              <Route path="profile" element={<Profile />} />
              <Route path="profile/:profileId" element={<Profile />} />
              <Route path="create-post" element={<CreatePost />} />
            </Route>

            {/* Redirect unknown routes */}
            <Route path="*" element={<Navigate to="/" />} />
          </>
        )}
      </Routes>
    </>
  )
}

export default App
