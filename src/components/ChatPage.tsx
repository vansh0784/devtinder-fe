import { useEffect, useState } from "react";
import { io } from "socket.io-client";
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
import { socket } from "../socket";


// types.ts or in your ChatPage.tsx file

export interface IMessage {
  _id?: string;           // MongoDB document ID, optional if not yet saved
  roomId: string;         // e.g., "userA_userB"
  senderId: string;
  receiverId: string;
  content: string;
  read?: boolean;         // optional because it has a default in backend
  createdAt?: string;     // ISO string from backend
  updatedAt?: string;     // ISO string from backend
}
import { useAuth } from "../hooks/useAuth";

// const socket = io("http://localhost:5000", {
//   transports: ["websocket"], // avoid polling fallback
// });

const CHATS = [
	{
		id: 1,
		name: "Emma Wilson",
		username: "@emmawilson",
		avatar: "https://images.unsplash.com/photo-1715029005043-e88d219a3c48?w=100",
		lastMessage: "That sounds great! When can we start?",
		time: "2m ago",
		unread: 2,
		online: true,
	},
	{
		id: 2,
		name: "Marcus Chen",
		username: "@marcuschen",
		avatar: "https://images.unsplash.com/photo-1715029005043-e88d219a3c48?w=100",
		lastMessage: "I'll send over the API documentation",
		time: "1h ago",
		unread: 0,
		online: true,
	},
	{
		id: 3,
		name: "Sofia Rodriguez",
		username: "@sofiarodriguez",
		avatar: "https://images.unsplash.com/photo-1715029005043-e88d219a3c48?w=100",
		lastMessage: "Check out this ML model I built",
		time: "3h ago",
		unread: 1,
		online: false,
	},
	{
		id: 4,
		name: "David Kim",
		username: "@davidkim",
		avatar: "https://images.unsplash.com/photo-1715029005043-e88d219a3c48?w=100",
		lastMessage: "The WebSocket implementation looks good!",
		time: "1d ago",
		unread: 0,
		online: false,
	},
];

const MESSAGES = [
	{
		id: 1,
		sender: "them",
		content: "Hey! I saw your project on GitHub. Really impressive work!",
		time: "10:30 AM",
	},
	{
		id: 2,
		sender: "me",
		content: "Thank you! I've been working on it for a few months now.",
		time: "10:32 AM",
	},
	{
		id: 3,
		sender: "them",
		content:
			"I'm actually working on something similar. Would you be interested in collaborating?",
		time: "10:35 AM",
	},
	{
		id: 4,
		sender: "me",
		content: "That sounds great! What kind of project are you working on?",
		time: "10:37 AM",
	},
	{
		id: 5,
		sender: "them",
		content:
			"It's a real-time collaboration tool for developers. Think Figma but for code.",
		time: "10:40 AM",
	},
	{
		id: 6,
		sender: "me",
		content:
			"Wow, that's exactly the kind of project I'd love to work on! 🚀",
		time: "10:42 AM",
	},
	{
		id: 7,
		sender: "them",
		content: "That sounds great! When can we start?",
		time: "10:45 AM",
	},
];

export function ChatPage() {
	const [selectedChat, setSelectedChat] = useState(CHATS[0]);
	const [message, setMessage] = useState("");        // single input
const [messages, setMessages] = useState<IMessage[]>([]); // all chat messages
const { user } = useAuth();


	
	useEffect(() => {
		if (!user) return;

  // join a room based on selectedChat
  socket.emit('join_room', {
    roomId: `${user._id}_${selectedChat.id}`,
    userId: user._id,
  });
  // Listen for incoming messages
  const handleReceive = (msg: IMessage) => {
    setMessages((prev) => [...prev, msg]); // add new message at the end

  };

  socket.on("receive_message", handleReceive);

  // Cleanup: remove listener on unmount
  return () => {
    socket.off("receive_message", handleReceive);
  };
}, []); // ✅ Correct, no errors


	// ✈️ SEND MESSAGE (UI + BACKEND)
	const handleSend = () => {
  if (!message.trim()||!user) return;

  
const userId = user?._id;


  const newMsg: IMessage = {
    roomId: `${userId}_${selectedChat.id}`, // example room logic
    senderId: userId,
    receiverId: selectedChat.id.toString(),
    content: message,
    read: false,
    createdAt: new Date().toISOString(),
  };

  setMessages((prev) => [...prev, newMsg]);
  setMessage(""); // reset input

  socket.emit("send_message", newMsg); // emit to backend
};


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
						{CHATS.map((chat) => (
							<motion.button
								key={chat.id}
								onClick={() => setSelectedChat(chat)}
								whileHover={{ scale: 1.02 }}
								className={`w-full p-3 rounded-xl mb-2 transition-all text-left ${
									selectedChat.id === chat.id
										? "bg-[#007BFF]/20 border border-[#007BFF]/50"
										: "hover:bg-white/5"
								}`}
							>
								<div className="flex items-center gap-3">
									<div className="relative">
										<Avatar className="w-12 h-12">
											<AvatarImage src={chat.avatar} alt={chat.name} />
											<AvatarFallback>{chat.name[0]}</AvatarFallback>
										</Avatar>
										{chat.online && (
											<div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#121212] rounded-full" />
										)}
									</div>

									<div className="flex-1 min-w-0">
										<div className="flex items-center justify-between mb-1">
											<span className="text-white truncate">{chat.name}</span>
											<span className="text-xs text-gray-400">
												{chat.time}
											</span>
										</div>
										<div className="flex items-center justify-between">
											<p className="text-sm text-gray-400 truncate">
												{chat.lastMessage}
											</p>
											{chat.unread > 0 && (
												<span className="ml-2 px-2 py-0.5 bg-[#007BFF] rounded-full text-xs">
													{chat.unread}
												</span>
											)}
										</div>
									</div>
								</div>
							</motion.button>
						))}
					</div>
				</ScrollArea>
			</div>

			{/* CHAT WINDOW — SAME */}
			<div className="flex-1 flex flex-col">
				<div className="p-4 border-b border-white/10 glass flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="relative">
							<Avatar className="w-10 h-10">
								<AvatarImage src={selectedChat.avatar} alt={selectedChat.name} />
								<AvatarFallback>{selectedChat.name[0]}</AvatarFallback>
							</Avatar>
							{selectedChat.online && (
								<div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#121212] rounded-full" />
							)}
						</div>
						<div>
							<h3 className="text-white">{selectedChat.name}</h3>
							<p className="text-sm text-gray-400">
								{selectedChat.online ? "Active now" : "Offline"}
							</p>
						</div>
					</div>

					<div className="flex items-center gap-2">
						<Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
							<Phone className="w-5 h-5" />
						</Button>
						<Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
							<Video className="w-5 h-5" />
						</Button>
						<Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
							<MoreVertical className="w-5 h-5" />
						</Button>
					</div>
				</div>

				{/* CHAT MESSAGES — SAME */}
				<ScrollArea className="flex-1 p-6">
					<div className="space-y-4 max-w-3xl mx-auto">
						{messages?.map((msg, index) => (
							<motion.div
								key={msg?._id}
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: index * 0.05 }}
								className={`flex ${
									msg.senderId === "me" ? "justify-end" : "justify-start"
								}`}
							>
								<div className={`max-w-md ${msg.senderId === "me" ? "order-2" : ""}`}>
									<div
										className={`rounded-2xl px-4 py-3 ${
											msg.senderId === "me"
												? "bg-linear-to-r from-[#007BFF] to-[#8A2BE2] text-white rounded-br-sm"
												: "glass border border-white/10 text-white rounded-bl-sm"
										}`}
									>
										<p>{msg?.content}</p>
									</div>
									<p className="text-xs text-gray-500 mt-1 px-2">{msg.createdAt}</p>
								</div>
							</motion.div>
						))}
					</div>
				</ScrollArea>

				{/* INPUT SECTION — SAME */}
				<div className="p-4 border-t border-white/10 glass">
					<div className="max-w-3xl mx-auto flex items-end gap-3">
						<div className="flex-1">
							<div className="glass rounded-2xl border border-white/10 p-3">
								<div className="flex items-center gap-2">
									<Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
										<Paperclip className="w-5 h-5" />
									</Button>
									<Input
  value={message}                     // just the string
  onChange={(e) => setMessage(e.target.value)} // update string directly
  onKeyPress={(e) => e.key === "Enter" && handleSend()}
  placeholder="Type a message..."
  className="flex-1 bg-transparent border-0 text-white placeholder:text-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0"
/>

									<Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
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
