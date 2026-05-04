import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { socket } from "../utils/socket";
import type { ReactNode } from "react";
import { getApi, patchApi } from "../utils/api";
import type { IBaseResponse } from "../utils/types";
import { useAuth } from "../hooks/useAuth";

export type Notification = {
  _id: string;
  type:
    | "REQUEST"
    | "MESSAGE"
    | "MATCH"
    | "REQUEST_ACCEPTED"
    | "REQUEST_REJECTED"
    | "COLLAB_INVITE";
  senderId: string;
  senderName?: string;
  senderAvatar?: string;
  roomId?: string;
  /** Code editor collaboration session UUID (GET /collaboration/rooms/:id must exist on server). */
  collabRoomId?: string;
  /** Connection Mongo id for accepting/rejecting */
  connectionRequestId?: string;
  message: string;
  read: boolean;
  createdAt: string;
};

/** Pending connection where current user is userB — from GET /connection/requests */
export type PendingIncomingConnection = {
  _id: string;
  userA: {
    _id: string;
    username?: string;
    email?: string;
    avatar?: string;
    phone?: string;
    age?: number;
  };
  createdAt?: string;
};

type NotificationContextType = {
  notifications: Notification[];
  pendingIncomingConnections: PendingIncomingConnection[];
  /** Unread feed items only (REQUEST surfaced separately as pendingIncomingConnections) */
  activityNotifications: Notification[];
  /** Bell badge: pending requests + unread non-request activity */
  sidebarAlertCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  refreshNotifications: () => Promise<void>;
};

const NotificationContext = createContext<NotificationContextType | null>(null);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pendingIncomingConnections, setPendingIncomingConnections] = useState<
    PendingIncomingConnection[]
  >([]);
  const { user } = useAuth();

  const refreshNotifications = useCallback(async () => {
    const uid = user?._id;
    if (!uid) return;
    try {
      const [unread, pending] = await Promise.all([
        getApi<Notification[]>("/notifications/unread"),
        getApi<PendingIncomingConnection[]>("/connection/requests"),
      ]);
      setNotifications(unread);
      setPendingIncomingConnections(pending ?? []);
    } catch {
      /* api interceptor may toast */
    }
  }, [user?._id]);

  useEffect(() => {
    if (!user?._id) {
      setNotifications([]);
      setPendingIncomingConnections([]);
      return;
    }
    void refreshNotifications();
  }, [user?._id, refreshNotifications]);

  useEffect(() => {
    socket.on("connect", () => {
      void refreshNotifications();
    });

    socket.on("notification", () => {
      void refreshNotifications();
    });

    return () => {
      socket.off("connect");
      socket.off("notification");
    };
  }, [refreshNotifications]);

  const activityNotifications = notifications.filter(
    (n) => n.type !== "REQUEST" && !n.read,
  );
  const sidebarAlertCount =
    pendingIncomingConnections.length + activityNotifications.length;

  const markAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, read: true } : n)),
    );

    await patchApi<null, IBaseResponse>(`/notifications/read/${id}`, null);
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

    await patchApi<null, IBaseResponse>(`/notifications/read-all`, null);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        pendingIncomingConnections,
        activityNotifications,
        sidebarAlertCount,
        markAsRead,
        markAllAsRead,
        refreshNotifications,
      }}
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
