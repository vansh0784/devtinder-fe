import { Card } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import {
  MessageCircle,
  UserPlus,
  Code2,
} from "lucide-react";
import { motion } from "framer-motion";
import { useNotifications } from "../context/NotificationContext";
import { useNavigate } from "react-router-dom";

// 🔹 UI mapping based on type
const notificationUI = {
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
};

export function NotificationsPage() {
  const { notifications, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl text-white mb-2">Notifications</h1>
          <p className="text-gray-400">Stay updated with your activity</p>
        </div>
        {notifications.length > 0 && (
          <Button
            variant="outline"
            className="border-white/20"
            onClick={markAllAsRead}
          >
            Mark all as read
          </Button>
        )}
      </div>

      {notifications.length === 0 && (
        <div className="mt-24 text-center">
          <Code2 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500">You're all caught up!</p>
        </div>
      )}

      <div className="space-y-3">
        {notifications.map((n, index) => {
          const UI = notificationUI[n.type];
          const Icon = UI.icon;

          return (
            <motion.div
              key={n._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card
                onClick={() => {
                  markAsRead(n._id);
                  if (n.type === "MESSAGE" && n.roomId) {
                    navigate("/chat", { state: { roomId: n.roomId } });
                  }
                }}
                className={`glass border-white/10 p-4 cursor-pointer transition-all ${
                  !n.read ? "border-l-4 border-l-[#007BFF]" : ""
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-10 h-10 rounded-full ${UI.iconBg} flex items-center justify-center`}
                  >
                    <Icon className={`w-5 h-5 ${UI.iconColor}`} />
                  </div>

                  <div className="flex-1 flex gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={n.senderAvatar} />
                      <AvatarFallback>
                        {n.senderName?.[0] ?? "U"}
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <p className="text-white">
                        <span className={!n.read ? "font-medium" : ""}>
                          {n.senderName ?? "Someone"}
                        </span>{" "}
                        <span className="text-gray-400">{n.message}</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(n.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {!n.read && (
                    <div className="w-2 h-2 bg-[#007BFF] rounded-full mt-2" />
                  )}
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
