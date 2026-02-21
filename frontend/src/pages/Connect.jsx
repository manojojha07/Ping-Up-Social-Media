import React, { useState, useEffect, useMemo } from "react";
import {
  Users,
  UserCheck,
  UserRoundPen,
  MessageSquare,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useAuth } from "@clerk/clerk-react";
import { fetchConnections } from "../features/connections/connectionSlice";
import api from "../api/axios";
import toast from "react-hot-toast";

const Connect = () => {
  const { getToken } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [currentTab, setCurrentTab] = useState("Followers");

  const {
    connections = [],
    pendingConnections = [],
    followers = [],
    following = [],
  } = useSelector((state) => state.connections);

  const dataArray = [
    { label: "Followers", value: followers, icon: Users },
    { label: "Following", value: following, icon: UserCheck },
    { label: "Pending", value: pendingConnections, icon: UserRoundPen },
    { label: "Connections", value: connections, icon: MessageSquare },
  ];

  // ✅ Keep this line as you requested
  const currentUsers =
    dataArray.find((item) => item.label === currentTab)?.value || [];

  // Remove duplicate users
  const uniqueUsers = useMemo(() => {
    return Array.from(
      new Map(currentUsers.map((user) => [user._id, user])).values()
    );
  }, [currentUsers]);

  // Fetch connections on load
  useEffect(() => {
    const loadConnections = async () => {
      const token = await getToken();
      dispatch(fetchConnections(token));
    };
    loadConnections();
  }, [dispatch, getToken]);

  // Unfollow user
  const handleUnfollow = async (userId) => {
    try {
      const token = await getToken();
      const { data } = await api.post(
        "/api/user/unfollow",
        { id: userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success(data.message);
        dispatch(fetchConnections(token));
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Accept connection
  const acceptConnection = async (userId) => {
    try {
      const token = await getToken();
      const { data } = await api.post(
        "/api/user/accept",
        { id: userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success(data.message);
        dispatch(fetchConnections(token));
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Connections
          </h1>
          <p className="text-slate-600">
            Manage your network and discover new connections
          </p>
        </div>

        {/* Counts */}
        <div className="mb-8 flex flex-wrap gap-6">
          {dataArray.map((item, index) => (
            <div
              key={index}
              className="flex flex-col items-center justify-center gap-1 border h-20 w-40 border-gray-300 bg-white shadow rounded-md"
            >
              <b>{item.value?.length || 0}</b>
              <p className="text-slate-600">{item.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="inline-flex flex-wrap items-center justify-center border border-gray-300 rounded-md p-1 bg-white shadow-sm">
          {dataArray.map((tab) => (
            <button
              key={tab.label}
              onClick={() => setCurrentTab(tab.label)}
              className={`flex items-center px-3 py-1 text-sm rounded-md transition-colors ${
                currentTab === tab.label
                  ? "bg-white font-medium text-black"
                  : "text-gray-500 hover:text-black"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="ml-1">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Users */}
        <div className="flex flex-wrap gap-6 mt-6">
          {uniqueUsers.map((user, index) => (
            <div
              key={`${currentTab}_${user._id}_${index}`}
              className="w-full max-w-88 flex gap-5 p-6 bg-white shadow rounded-md"
            >
              <img
                src={user.profile_picture}
                className="w-12 h-12 shadow-md rounded-full"
                alt={user.full_name}
              />

              <div className="flex-1">
                <p className="font-medium text-slate-700">
                  {user.full_name}
                </p>
                <p className="text-slate-500">@{user.username}</p>
                <p className="text-sm text-gray-500">
                  {user.bio?.slice(0, 30) || ""}
                </p>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => navigate(`/profile/${user._id}`)}
                    className="w-full p-2 text-sm rounded bg-gradient-to-t from-indigo-700 to-purple-600 text-white"
                  >
                    View Profile
                  </button>

                  {currentTab === "Following" && (
                    <button
                      onClick={() => handleUnfollow(user._id)}
                      className="w-full p-2 text-sm rounded bg-slate-100"
                    >
                      Unfollow
                    </button>
                  )}

                  {currentTab === "Pending" && (
                    <button
                      onClick={() => acceptConnection(user._id)}
                      className="w-full p-2 text-sm rounded bg-slate-100"
                    >
                      Accept
                    </button>
                  )}

                  {currentTab === "Connections" && (
                    <button
                      onClick={() => navigate(`/messages/${user._id}`)}
                      className="w-full p-2 text-sm rounded bg-slate-100 flex gap-1 justify-center"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Message
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Connect;
