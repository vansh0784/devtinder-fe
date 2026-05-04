import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import {
  Send,
  Paperclip,
  Smile,
  MoreVertical,
  Search,
  Phone,
  Video,
} from "lucide-react";
import { motion } from "framer-motion";
import { socket } from "../utils/socket";
import { useAuth } from "../hooks/useAuth";
import { type IUser, type IMessage } from "../utils/types";
import { getApi } from "../utils/api";
import { toast } from "sonner";
import { useNotifications } from "../context/NotificationContext";
import { useRef } from "react";

export function ChatPage() {
  const bottomRef = useRef<HTMLDivElement>(null);

  // const { clearNotification } = useNotifications();
  const { notifications, markAsRead } = useNotifications();

  const [friendList, setFriendList] = useState<IUser[]>([]);
  const [selectedChat, setSelectedChat] = useState<IUser | null>(null);
  const [message, setMessage] = useState(""); // single input
  const [messages, setMessages] = useState<IMessage[]>([]); // all chat messages
  const { user } = useAuth();
  const getRoomId = (userId1: string, userId2: string) => {
    return [userId1, userId2].sort().join("_");
  };

  const sortMessagesByTime = (list: IMessage[]) =>
    [...list].sort(
      (a, b) =>
        new Date(a.createdAt ?? 0).getTime() -
        new Date(b.createdAt ?? 0).getTime(),
    );

  useEffect(() => {
    if (!selectedChat || !user) return;

    notifications
      .filter(
        (n) =>
          n.type === "MESSAGE" && n.senderId === selectedChat._id && !n.read,
      )
      .forEach((n) => markAsRead(n._id));
  }, [selectedChat, notifications, user, markAsRead]);

  useEffect(() => {
    if (!user || !selectedChat) return;

    const roomId = getRoomId(user._id, selectedChat._id);
    let cancelled = false;

    setMessages([]);

    void getApi<IMessage[]>(`/messages/room/${encodeURIComponent(roomId)}`, {
      params: { limit: 200 },
    })
      .then((rows) => {
        if (!cancelled) {
          const list = Array.isArray(rows) ? rows : [];
          setMessages(sortMessagesByTime(list));
        }
      })
      .catch(() => {});

    const bindSocketRooms = () => {
      socket.emit("join_room", { roomId, userId: user._id });
      socket.emit("load_messages", { roomId, limit: 200 });
    };

    bindSocketRooms();
    socket.on("connect", bindSocketRooms);

    const handleHistory = (msgs: IMessage[]) => {
      if (cancelled || !Array.isArray(msgs)) return;
      if (msgs.length > 0) setMessages(sortMessagesByTime(msgs));
    };

    const handleReceive = (msg: IMessage) => {
      if (!msg.roomId || msg.roomId !== roomId) return;
      setMessages((prev) => {
        if (
          msg._id &&
          prev.some((m) => m._id && m._id === msg._id)
        ) {
          return prev;
        }
        const contentKey = `${msg.senderId}|${msg.content}|${msg.createdAt ?? ""}`;
        if (
          !msg._id &&
          prev.some(
            (m) =>
              `${m.senderId}|${m.content}|${m.createdAt ?? ""}` === contentKey,
          )
        ) {
          return prev;
        }
        return sortMessagesByTime([...prev, msg]);
      });
    };

    const handleChatError = (e: { message?: string }) => {
      toast.error(e?.message ?? "Chat error");
    };

    socket.on("chat_history", handleHistory);
    socket.on("receive_message", handleReceive);
    socket.on("chat_error", handleChatError);

    return () => {
      cancelled = true;
      socket.off("connect", bindSocketRooms);
      socket.emit("leave_room", { roomId });
      socket.off("chat_history", handleHistory);
      socket.off("receive_message", handleReceive);
      socket.off("chat_error", handleChatError);
    };
  }, [user, selectedChat]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!message.trim() || !user || !selectedChat) return;

    const roomId = getRoomId(user._id, selectedChat._id);
    const trimmed = message.trim();
    setMessage("");

    socket.emit("send_message", {
      roomId,
      senderId: user._id,
      receiverId: selectedChat._id,
      content: trimmed,
      read: false,
    });
  };

  useEffect(() => {
    getApi<IUser[]>(`/connection/matches`)
      .then((res) => setFriendList(res))
      .catch((err) => console.log(err));
  }, []);

  return (
    <div className="h-screen flex">
      {/* LEFT SIDEBAR — SAME */}
      <div className="w-80 border-r border-white/10 glass flex flex-col">
        <div className="p-4 border-b border-white/10">
          <h2 className="text-xl text-white mb-4">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search conversations..."
              className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2">
            {friendList &&
              friendList?.map((chat) => (
                <motion.button
                  key={chat?._id}
                  onClick={() => setSelectedChat(chat)}
                  whileHover={{ scale: 1.02 }}
                  className={`w-full p-3 rounded-xl mb-2 transition-all text-left ${
                    selectedChat?._id === chat?._id
                      ? "bg-[#007BFF]/20 border border-[#007BFF]/50"
                      : "hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={chat.avatar} alt={chat.username} />
                        <AvatarFallback>
                          {chat?.username?.split(" ")[0]}
                        </AvatarFallback>
                      </Avatar>
                      {chat.isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#121212] rounded-full" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white truncate">
                          {chat.username}
                        </span>
                        <span className="text-xs text-gray-400">
                          {chat?.createdAt &&
                            new Date(chat?.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between"></div>
                    </div>
                  </div>
                </motion.button>
              ))}
          </div>
        </ScrollArea>
      </div>

      {/* CHAT WINDOW — SAME */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="p-4 border-b border-white/10 glass flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="w-10 h-10">
                <AvatarImage
                  src={selectedChat?.avatar}
                  alt={selectedChat?.username}
                />
                <AvatarFallback>
                  {selectedChat?.username?.split(" ")[0]}
                </AvatarFallback>
              </Avatar>
              {selectedChat?.isOnline && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#121212] rounded-full" />
              )}
            </div>
            <div>
              <h3 className="text-white">{selectedChat?.username}</h3>
              <p className="text-sm text-gray-400">
                {selectedChat?.isOnline ? "Active now" : "Offline"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="text-gray-400 hover:text-white"
            >
              <Phone className="w-5 h-5" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-gray-400 hover:text-white"
            >
              <Video className="w-5 h-5" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-gray-400 hover:text-white"
            >
              <MoreVertical className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* CHAT MESSAGES — SAME */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="space-y-4 max-w-3xl mx-auto p-6">
            <div className="h-full overflow-y-auto">
              {messages?.map((msg, index) => (
                <motion.div
                  key={msg?._id ?? index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex ${
                    msg.senderId === user?._id ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-md ${
                      msg.senderId === user?._id ? "order-2" : ""
                    }`}
                  >
                    <div
                      className={`rounded-2xl px-4 py-3 ${
                        msg.senderId === user?._id
                          ? "bg-linear-to-r from-[#007BFF] to-[#8A2BE2] text-white rounded-br-sm"
                          : "glass border border-white/10 text-white rounded-bl-sm"
                      }`}
                    >
                      <p>{msg?.content}</p>
                    </div>
                    {/* <p className="text-xs text-gray-500 mt-1 px-2">
										{msg.createdAt}
									</p> */}
                    <p className="text-xs text-gray-500 mt-1 px-2">
                      {msg.createdAt &&
                        new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                    </p>
                  </div>
                </motion.div>
              ))}
              <div ref={bottomRef} />
            </div>
          </div>
        </ScrollArea>

        {/* INPUT SECTION — SAME */}
        <div className="p-4 border-t border-white/10 glass">
          <div className="max-w-3xl mx-auto flex items-end gap-3">
            <div className="flex-1">
              <div className="glass rounded-2xl border border-white/10 p-3">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-gray-400 hover:text-white"
                  >
                    <Paperclip className="w-5 h-5" />
                  </Button>
                  <Input
                    value={message} // just the string
                    onChange={(e) => setMessage(e.target.value)} // update string directly
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSend();
                      }
                    }}
                    placeholder="Type a message..."
                    className="flex-1 bg-transparent border-0 text-white placeholder:text-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0"
                  />

                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-gray-400 hover:text-white"
                  >
                    <Smile className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>

            <Button
              onClick={handleSend}
              size="icon"
              className="w-12 h-12 bg-linear-to-r from-[#007BFF] to-[#8A2BE2] rounded-full hover:opacity-90"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
