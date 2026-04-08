// import { createContext, useContext, useEffect, useState } from "react";
// import { socket } from "../utils/socket";
// import type { ReactNode } from "react";
// import { getApi } from "../utils/api";

// export type Notification = {
//   _id: string;
//   type: "REQUEST" | "MESSAGE";
//   senderId: string;
//   senderName?: string;
//   senderAvatar?: string;
//   roomId?: string;
//   message: string;
//   read: boolean;
//   createdAt: string;
// };

// type NotificationContextType = {
//   notifications: Notification[];
//   markAsRead: (id: string) => void;
//   markAllAsRead: () => void;
// };

// const NotificationContext = createContext<NotificationContextType | null>(null);

// export const NotificationProvider = ({ children }: { children: ReactNode }) => {
//   const [notifications, setNotifications] = useState<Notification[]>([]);

//   // 🔹 Load unread notifications (DB)
//   useEffect(() => {
//     getApi<Notification[]>("/notifications/unread")
//       .then(setNotifications)
//       .catch(() => {});
//   }, []);

//   // 🔹 Realtime notifications (socket)
//   useEffect(() => {
//     socket.on("notification", (data: Notification) => {
//       console.log("🔔 Notification received:", data);
//       setNotifications(prev => [data, ...prev]);
//     });

//     return () => {
//       socket.off("notification");
//     };
//   }, []);

//   // 🔹 Mark one read
//   const markAsRead = async (id: string) => {
//     setNotifications(prev =>
//       prev.map(n => (n._id === id ? { ...n, read: true } : n)),
//     );
//     await getApi(`/notifications/read/${id}`,{
//   method: "PATCH",});
//   };

//   // 🔹 Mark all read
//   const markAllAsRead = async () => {
//     setNotifications(prev => prev.map(n => ({ ...n, read: true })));
//     await getApi(`/notifications/read-all`,{
//   method: "PATCH",});

//   };

//   return (
//     <NotificationContext.Provider
//       value={{ notifications, markAsRead, markAllAsRead }}
//     >
//       {children}
//     </NotificationContext.Provider>
//   );
// };

// export const useNotifications = () => {
//   const ctx = useContext(NotificationContext);
//   if (!ctx) throw new Error("useNotifications must be used inside provider");
//   return ctx;
// };

import { createContext, useContext, useEffect, useState } from "react";
import { socket } from "../utils/socket";
import type { ReactNode } from "react";
import { getApi, patchApi } from "../utils/api";
import { useAuth } from "../hooks/useAuth";

export type Notification = {
  _id: string;
  type: "REQUEST" | "MESSAGE";
  senderId: string;
  senderName?: string;
  senderAvatar?: string;
  roomId?: string;
  message: string;
  read: boolean;
  createdAt: string;
};

type NotificationContextType = {
  notifications: Notification[];
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
};

const NotificationContext = createContext<NotificationContextType | null>(null);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user } = useAuth();
  // 🔹 Load unread notifications from DB
  useEffect(() => {
    if (user?._id) {
      getApi<Notification[]>("/notifications/unread")
        .then(setNotifications)
        .catch(() => {});
    }
  }, [user]);

  // 🔹 Realtime socket notifications
  useEffect(() => {
    socket.on("connect", async () => {
      if (user?._id) {
        const data = await getApi<Notification[]>("/notifications/unread");
        setNotifications(data);
      }
    });

    socket.on("notification", (data: Notification) => {
      setNotifications((prev) => [data, ...prev]);
    });

    return () => {
      socket.off("connect");
      socket.off("notification");
    };
  }, [user]);

  // 🔹 Mark single notification read
  const markAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, read: true } : n)),
    );

    await patchApi<null, any>(`/notifications/read/${id}`, null);
  };

  // 🔹 Mark all notifications read
  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

    await patchApi<null, any>(`/notifications/read-all`, null);
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, markAsRead, markAllAsRead }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used inside provider");
  return ctx;
};
