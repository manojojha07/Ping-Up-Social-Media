import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import Feed from './pages/Feed'
import Message from './pages/Message'
import ChatBox from './pages/ChatBox'
import Connect from './pages/Connect'
import Discover from './pages/discover'
import Profile from './pages/Profile'
import CreatePost from './pages/createPost'
import { useUser, useAuth } from '@clerk/clerk-react'
import LayOut from './pages/LayOut'
import  { Toaster } from 'react-hot-toast'
import { useEffect } from 'react'



const App = () => {

  const { user } = useUser();
  const {getToken} = useAuth();

  useEffect(() => {
 if(user){
  getToken().then((token) => console.log(token))
 }
  },[user])

  return (
    <>
    <Toaster />
     <Routes>
      <Route path='' element={!user ? <Login /> : <LayOut />}>
      <Route index element={<Feed /> }  />
      <Route path='messages' element={<Message /> }  />
      <Route path='messages/:userId' element={<ChatBox /> }  />
      <Route path='connections' element={<Connect /> }  />
      <Route path='discover' element={<Discover /> }  />
      <Route path='profile' element={<Profile /> }  />
      <Route path='profile/:profileId' element={<Profile /> }  />
      <Route path='create-post' element={<CreatePost /> }  />

      </Route>
     </Routes>
    </>
  )
}

export default App
