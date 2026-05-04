import { useState, type MouseEvent } from "react";
import { Card } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import {
  MessageCircle,
  UserPlus,
  Code2,
  Heart,
  CheckCircle,
  XCircle,
  Laptop,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  useNotifications,
  type Notification,
  type PendingIncomingConnection,
} from "../context/NotificationContext";
import { useNavigate } from "react-router-dom";
import { postApi } from "../utils/api";
import type { IBaseResponse } from "../utils/types";
import { toast } from "sonner";
import { displayField, displayInitials } from "../utils/display";

const notificationUI: Record<
  Notification["type"],
  { icon: typeof MessageCircle; iconColor: string; iconBg: string }
> = {
  MESSAGE: {
    icon: MessageCircle,
    iconColor: "text-[#007BFF]",
    iconBg: "bg-[#007BFF]/20",
  },
  REQUEST: {
    icon: UserPlus,
    iconColor: "text-[#8A2BE2]",
    iconBg: "bg-[#8A2BE2]/20",
  },
  MATCH: {
    icon: Heart,
    iconColor: "text-pink-400",
    iconBg: "bg-pink-500/20",
  },
  REQUEST_ACCEPTED: {
    icon: CheckCircle,
    iconColor: "text-emerald-400",
    iconBg: "bg-emerald-500/20",
  },
  REQUEST_REJECTED: {
    icon: XCircle,
    iconColor: "text-orange-400",
    iconBg: "bg-orange-500/20",
  },
  COLLAB_INVITE: {
    icon: Laptop,
    iconColor: "text-sky-400",
    iconBg: "bg-sky-500/20",
  },
};

export function NotificationsPage() {
  const {
    activityNotifications,
    pendingIncomingConnections,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
  } = useNotifications();
  const navigate = useNavigate();
  const [busy, setBusy] = useState<
    Record<string, "accept" | "reject">
  >({});

  const handlePendingAccept = async (
    conn: PendingIncomingConnection,
    e: MouseEvent<HTMLButtonElement>,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setBusy((b) => ({ ...b, [conn._id]: "accept" }));
    try {
      const res = await postApi<{ requestId: string }, IBaseResponse>(
        `/connection/accept`,
        { requestId: conn._id },
      );
      toast.success(res.message ?? "Accepted");
      await refreshNotifications();
    } catch {
      /* interceptor toast */
    } finally {
      setBusy((b) => {
        const next = { ...b };
        delete next[conn._id];
        return next;
      });
    }
  };

  const handlePendingReject = async (
    conn: PendingIncomingConnection,
    e: MouseEvent<HTMLButtonElement>,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setBusy((b) => ({ ...b, [conn._id]: "reject" }));
    try {
      const res = await postApi<{ requestId: string }, IBaseResponse>(
        `/connection/reject`,
        { requestId: conn._id },
      );
      toast.success(res.message ?? "Declined");
      await refreshNotifications();
    } catch {
      /* interceptor toast */
    } finally {
      setBusy((b) => {
        const next = { ...b };
        delete next[conn._id];
        return next;
      });
    }
  };

  const ReqIcon = notificationUI.REQUEST.icon;
  const hasAnything =
    pendingIncomingConnections.length > 0 || activityNotifications.length > 0;

  return (
    <div className="min-h-screen p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl text-white mb-2">Notifications</h1>
          <p className="text-gray-400">
            Pending connection requests and unread activity
          </p>
        </div>
        {activityNotifications.length > 0 && (
          <Button
            variant="outline"
            className="border-white/20"
            onClick={markAllAsRead}
          >
            Mark all as read
          </Button>
        )}
      </div>

      {!hasAnything && (
        <div className="mt-24 text-center">
          <Code2 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500">You're all caught up!</p>
        </div>
      )}

      <div className="space-y-8">
        {pendingIncomingConnections.length > 0 && (
          <section>
            <h2 className="text-lg font-medium text-white mb-3">
              Connection requests ({pendingIncomingConnections.length})
            </h2>
            <div className="space-y-3">
              {pendingIncomingConnections.map((conn, index) => {
                const sender = conn.userA;
                const name =
                  displayField(sender?.username) ||
                  displayField(sender?.email) ||
                  "Someone";
                const buttonsDisabled = Boolean(busy[conn._id]);
                const isBusyAccept = busy[conn._id] === "accept";
                const isBusyReject = busy[conn._id] === "reject";

                return (
                  <motion.div
                    key={conn._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card className="glass border-white/10 border-l-4 border-l-[#8A2BE2] p-4 cursor-default">
                      <div className="flex items-start gap-4">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#8A2BE2]/20">
                          <ReqIcon className="size-5 text-[#8A2BE2]" />
                        </div>
                        <div className="min-w-0 flex-1 flex gap-3">
                          <Avatar className="size-8 shrink-0">
                            <AvatarImage src={sender?.avatar} alt={name} />
                            <AvatarFallback>
                              {displayInitials(name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <p className="text-white">
                              <span className="font-medium">{name}</span>{" "}
                              <span className="text-gray-400">
                                wants to connect with you.
                              </span>
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {conn.createdAt
                                ? new Date(conn.createdAt).toLocaleString()
                                : null}
                            </p>
                            <div
                              className="mt-4 flex flex-wrap gap-2"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Button
                                size="sm"
                                className="bg-emerald-600 hover:bg-emerald-700 text-white border-0"
                                disabled={buttonsDisabled}
                                onClick={(e) =>
                                  void handlePendingAccept(conn, e)
                                }
                              >
                                {isBusyAccept ? "Accepting…" : "Accept"}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-red-400/60 text-red-300 hover:bg-red-500/10"
                                disabled={buttonsDisabled}
                                onClick={(e) =>
                                  void handlePendingReject(conn, e)
                                }
                              >
                                {isBusyReject ? "Rejecting…" : "Reject"}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </section>
        )}

        {activityNotifications.length > 0 && (
          <section>
            <h2 className="text-lg font-medium text-white mb-3">Activity</h2>
            <div className="space-y-3">
              {activityNotifications.map((n, index) => {
                const UI = notificationUI[n.type] ?? notificationUI.MESSAGE;
                const Icon = UI.icon;
                const senderLabel = displayField(n.senderName, "Someone");

                return (
                  <motion.div
                    key={n._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card
                      onClick={() => {
                        void markAsRead(n._id);
                        if (
                          n.type === "COLLAB_INVITE" &&
                          (n.collabRoomId ?? "").length > 0
                        ) {
                          navigate(`/code-editor?room=${encodeURIComponent(n.collabRoomId!)}`, {
                            state: { openCollaboration: true },
                          });
                          return;
                        }
                        if (n.type === "MESSAGE" && n.roomId) {
                          navigate("/chat", {
                            state: { roomId: n.roomId },
                          });
                        }
                      }}
                      className={`glass border-white/10 p-4 cursor-pointer transition-all ${
                        !n.read ? "border-l-4 border-l-[#007BFF]" : ""
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-10 h-10 rounded-full ${UI.iconBg} flex shrink-0 items-center justify-center`}
                        >
                          <Icon className={`w-5 h-5 ${UI.iconColor}`} />
                        </div>

                        <div className="min-w-0 flex-1 flex gap-3">
                          <Avatar className="size-8 shrink-0">
                            <AvatarImage src={n.senderAvatar} />
                            <AvatarFallback>
                              {displayInitials(senderLabel)}
                            </AvatarFallback>
                          </Avatar>

                          <div className="min-w-0 flex-1">
                            <p className="text-white">
                              <span className={!n.read ? "font-medium" : ""}>
                                {senderLabel}
                              </span>{" "}
                              <span className="text-gray-400">
                                {displayField(n.message) ||
                                  "(No details)"}
                              </span>
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(n.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        {!n.read && (
                          <div className="size-2 shrink-0 rounded-full mt-2 bg-[#007BFF]" />
                        )}
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
