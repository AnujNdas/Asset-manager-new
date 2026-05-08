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
          axiosInstance.get("/notifications"),
          axiosInstance.get("/notifications/unreadCount"),
        ]);

        setNotifications(listRes.data || []);
        console.log(listRes)
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
  console.log(notification)

  const baseStyle = {
    color: "#222831",
    borderRadius: "8px",
    padding: "12px 16px",
    fontWeight: "500"
  };

  switch (type) {
    case "success":
      toast.success(`${title}: ${message}`, {
        style: {
          ...baseStyle,
          background: "#16a34a" // green
        }
      });
      break;

    case "error":
      toast.error(`${title}: ${message}`, {
        style: {
          ...baseStyle,
          background: "#d32f2f" // blue
        }
      });
      break;

    case "warning":
      toast(`${title}: ${message}`, {
        icon: "⚠️",
        style: {
          ...baseStyle,
          background: "#DFD0B8"
        }
      });
      break;

    default:
      toast(`${title}: ${message}`, {
        style: {
          ...baseStyle,
          background: "#DFD0B8"
        }
      });
  }
};

  // ✅ Mark all as read
  const markAllAsRead = async () => {
    await axiosInstance.put("/notifications/markAllRead");
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, isRead: true }))
    );
    setUnreadCount(0);
  };

  // ✅ Mark one as read
  const markAsRead = async (id) => {
    await axiosInstance.put(`/notifications/${id}/read`);
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
