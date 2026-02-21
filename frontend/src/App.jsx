import React, { useEffect, useRef } from 'react'
import { Route, Routes, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth, useUser } from '@clerk/clerk-react'
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
import { addMessage } from './features/messages/messageSlice'
import Notification from './components/Notification'

const App = () => {
  const { user } = useUser()
  const { getToken } = useAuth()
  const { pathname } = useLocation()
  const dispatch = useDispatch()
  const pathnameRef = useRef(pathname)
  const navigate = useNavigate()

  console.log("Clerk user:", user)
  console.log("Clerk user id:", user?.id)

  // Fetch user and connections once user is available
  useEffect(() => {
    if (!user) return

    const fetchData = async () => {
      const token = await getToken()
      dispatch(fetchUser(token))
      dispatch(fetchConnections(token))
    }

    fetchData()
  }, [user, getToken, dispatch])

  // Keep pathname in ref
  useEffect(() => {
    pathnameRef.current = pathname
  }, [pathname])

  // Polling messages every 5 seconds
  useEffect(() => {
    if (!user || !user.id) return

    const fetchMessages = async () => {
      try {
        const res = await fetch(
          import.meta.env.VITE_BASE_URL + '/api/message/' + user.id
        )
        const data = await res.json()

        if (data.success && data.message) {
          const message = data.message

          if (pathnameRef.current === '/messages/' + message.from_user_id.id) {
            dispatch(addMessage(message))
          } else {
            toast.custom(
              (t) => <Notification t={t} message={message} />,
              { position: 'bottom-right' }
            )
          }
        }
      } catch (err) {
        console.log(err)
      }
    }

    const interval = setInterval(fetchMessages, 5000)
    return () => clearInterval(interval)
  }, [user, dispatch])

  // Redirect user to login if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login')
    }
  }, [user, navigate])

  return (
    <>
      <Toaster />
      <Routes>
        {!user ? (
          <Route path="*" element={<Login />} />
        ) : (
          <Route path="/" element={<LayOut />}>
            <Route index element={<Feed />} />
            <Route path="messages" element={<Message />} />
            <Route path="messages/:userId" element={<ChatBox />} />
            <Route path="connections" element={<Connect />} />
            <Route path="discover" element={<Discover />} />
            <Route path="profile" element={<Profile />} />
            <Route path="profile/:profileId" element={<Profile />} />
            <Route path="create-post" element={<CreatePost />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Route>
        )}
      </Routes>
    </>
  )
}

export default App
