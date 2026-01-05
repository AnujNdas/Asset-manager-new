// src/context/NotificationContext.jsx
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import axiosInstance from "../Services/axiosInstance";

const NotificationContext = createContext();
export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const socketRef = useRef(null);

  // 🔐 Read auth ONCE, correctly
  const authRaw = localStorage.getItem("auth");
  const auth = authRaw ? JSON.parse(authRaw) : null;

  const token = auth?.token;
  const userId = auth?.user?._id;

  // 🚀 Fetch notifications + setup socket
  useEffect(() => {
    if (!token || !userId) return;

    const fetchNotifications = async () => {
      try {
        const [listRes, countRes] = await Promise.all([
          axiosInstance.get("/api/notifications"),
          axiosInstance.get("/api/notifications/unreadCount"),
        ]);

        setNotifications(listRes.data || []);
        setUnreadCount(countRes.data?.count || 0);
      } catch (err) {
        console.error("Notification fetch failed:", err);
      }
    };

    fetchNotifications();

    // 🔌 Socket setup
    socketRef.current = io(process.env.REACT_APP_API_URL, {
      auth: { token },
    });

    socketRef.current.emit("joinRoom", userId);

    socketRef.current.on("newNotification", (notification) => {
      console.log("🔥 REALTIME NOTIFICATION:", notification);

      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
      showToast(notification);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [token, userId]);

  // 🔔 Toast handler
  const showToast = (notification) => {
    const { title, message, type } = notification;

    switch (type) {
      case "success":
        toast.success(`${title}: ${message}`);
        break;
      case "error":
        toast.error(`${title}: ${message}`);
        break;
      case "warning":
        toast(`${title}: ${message}`, { icon: "⚠️" });
        break;
      default:
        toast(`${title}: ${message}`);
    }
  };

  // ✅ Mark all as read
  const markAllAsRead = async () => {
    await axiosInstance.put("/api/notifications/markAllRead");
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, isRead: true }))
    );
    setUnreadCount(0);
  };

  // ✅ Mark one as read
  const markAsRead = async (id) => {
    await axiosInstance.put(`/api/notifications/${id}/read`);
    setNotifications((prev) =>
      prev.map((n) =>
        n._id === id ? { ...n, isRead: true } : n
      )
    );
    setUnreadCount((prev) => Math.max(prev - 1, 0));
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, markAllAsRead, markAsRead }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
