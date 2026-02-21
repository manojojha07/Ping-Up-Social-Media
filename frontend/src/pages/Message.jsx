import React from 'react'
import { Eye, MessageSquare } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { dummyConnectionsData } from '../assets/assets'

const Message = () => {
  const { connections } = useSelector((state) => state.connections)
  const navigate = useNavigate()

  // Remove duplicate users based on _id
  const uniqueConnections = connections
    ? Array.from(new Map(connections.map(u => [u._id, u])).values())
    : []

  return (
    <div className="min-h-screen relative bg-slate-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Messages</h1>
          <p className="text-slate-600">Talk to your friends and family</p>
        </div>

        {/* Connected users */}
        <div className="flex flex-col gap-3">
          {uniqueConnections?.map((user) => (
            <div
              key={user._id} // ✅ unique key
              className="max-w-xl flex flex-wrap gap-5 p-6 bg-white shadow rounded-md items-center"
            >
              <img
                src={user.profile_picture || '/default-profile.png'}
                className="rounded-full w-12 h-12"
                alt={user.full_name || 'User'}
              />

              <div className="flex-1">
                <p className="font-medium text-slate-700">{user.full_name || 'Unknown'}</p>
                <p className="text-slate-500">@{user.username || 'unknown'}</p>
                <p className="text-gray-600 text-sm">{user.bio || ''}</p>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => navigate(`/messages/${user._id}`)}
                  className="w-10 h-10 flex items-center justify-center text-sm rounded bg-slate-100
                             hover:bg-slate-200 text-slate-800 active:scale-95 transition cursor-pointer gap-1"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>

                <button
                  onClick={() => navigate(`/profile/${user._id}`)}
                  className="w-10 h-10 flex items-center justify-center text-sm rounded bg-slate-100
                             hover:bg-slate-200 text-slate-800 active:scale-95 transition cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Message
