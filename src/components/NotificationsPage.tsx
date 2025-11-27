import { Card } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import {
	Heart,
	MessageCircle,
	UserPlus,
	Star,
	GitPullRequest,
	Code2,
} from "lucide-react";
import { motion } from "framer-motion";

const NOTIFICATIONS = [
	{
		id: 1,
		type: "match",
		icon: Heart,
		iconColor: "text-red-500",
		iconBg: "bg-red-500/20",
		user: "Emma Wilson",
		avatar: "https://images.unsplash.com/photo-1715029005043-e88d219a3c48?w=100",
		message: "matched with you!",
		time: "2 minutes ago",
		unread: true,
	},
	{
		id: 2,
		type: "message",
		icon: MessageCircle,
		iconColor: "text-[#007BFF]",
		iconBg: "bg-[#007BFF]/20",
		user: "Marcus Chen",
		avatar: "https://images.unsplash.com/photo-1715029005043-e88d219a3c48?w=100",
		message: "sent you a message",
		time: "1 hour ago",
		unread: true,
	},
	{
		id: 3,
		type: "follow",
		icon: UserPlus,
		iconColor: "text-[#8A2BE2]",
		iconBg: "bg-[#8A2BE2]/20",
		user: "Sofia Rodriguez",
		avatar: "https://images.unsplash.com/photo-1715029005043-e88d219a3c48?w=100",
		message: "started following you",
		time: "3 hours ago",
		unread: true,
	},
	{
		id: 4,
		type: "star",
		icon: Star,
		iconColor: "text-yellow-500",
		iconBg: "bg-yellow-500/20",
		user: "David Kim",
		avatar: "https://images.unsplash.com/photo-1715029005043-e88d219a3c48?w=100",
		message: "starred your project 'DevTools Pro'",
		time: "5 hours ago",
		unread: false,
	},
	{
		id: 5,
		type: "comment",
		icon: MessageCircle,
		iconColor: "text-[#007BFF]",
		iconBg: "bg-[#007BFF]/20",
		user: "Olivia Martinez",
		avatar: "https://images.unsplash.com/photo-1715029005043-e88d219a3c48?w=100",
		message: "commented on your post",
		time: "1 day ago",
		unread: false,
	},
	{
		id: 6,
		type: "pr",
		icon: GitPullRequest,
		iconColor: "text-green-500",
		iconBg: "bg-green-500/20",
		user: "James Wilson",
		avatar: "https://images.unsplash.com/photo-1715029005043-e88d219a3c48?w=100",
		message: "wants to collaborate on 'API Builder'",
		time: "2 days ago",
		unread: false,
	},
	{
		id: 7,
		type: "match",
		icon: Heart,
		iconColor: "text-red-500",
		iconBg: "bg-red-500/20",
		user: "Sarah Chen",
		avatar: "https://images.unsplash.com/photo-1715029005043-e88d219a3c48?w=100",
		message: "matched with you!",
		time: "3 days ago",
		unread: false,
	},
];

export function NotificationsPage() {
	return (
		<div className="min-h-screen p-6 max-w-3xl mx-auto">
			<div className="flex items-center justify-between mb-8">
				<div>
					<h1 className="text-3xl text-white mb-2">Notifications</h1>
					<p className="text-gray-400">
						Stay updated with your activity
					</p>
				</div>
				<Button variant="outline" className="border-white/20">
					Mark all as read
				</Button>
			</div>
			<div className="space-y-3">
				{NOTIFICATIONS.map((notification, index) => (
					<motion.div
						key={notification.id}
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.3, delay: index * 0.05 }}
					>
						<Card
							className={`glass border-white/10 p-4 hover:border-[#007BFF]/50 transition-all cursor-pointer ${
								notification.unread
									? "border-l-4 border-l-[#007BFF]"
									: ""
							}`}
						>
							<div className="flex items-start gap-4">
								<div
									className={`w-10 h-10 rounded-full ${notification.iconBg} flex items-center justify-center shrink-0`}
								>
									<notification.icon
										className={`w-5 h-5 ${notification.iconColor}`}
									/>
								</div>
								<div className="flex-1 min-w-0">
									<div className="flex items-start gap-3 mb-2">
										<Avatar className="w-8 h-8 shrink-0">
											<AvatarImage
												src={notification.avatar}
												alt={notification.user}
											/>
											<AvatarFallback>
												{notification.user[0]}
											</AvatarFallback>
										</Avatar>
										<div className="flex-1 min-w-0">
											<p className="text-white">
												<span
													className={
														notification.unread
															? "font-medium"
															: ""
													}
												>
													{notification.user}
												</span>{" "}
												<span className="text-gray-400">
													{notification.message}
												</span>
											</p>
											<p className="text-sm text-gray-500 mt-1">
												{notification.time}
											</p>
										</div>
									</div>
									{notification.type === "match" && (
										<div className="flex gap-2 mt-3">
											<Button
												size="sm"
												className="bg-linear-to-r from-[#007BFF] to-[#8A2BE2]"
											>
												Send Message
											</Button>
											<Button
												size="sm"
												variant="outline"
												className="border-white/20"
											>
												View Profile
											</Button>
										</div>
									)}
									{notification.type === "follow" && (
										<div className="flex gap-2 mt-3">
											<Button
												size="sm"
												className="bg-linear-to-r from-[#007BFF] to-[#8A2BE2]"
											>
												Follow Back
											</Button>
											<Button
												size="sm"
												variant="outline"
												className="border-white/20"
											>
												View Profile
											</Button>
										</div>
									)}
									{notification.type === "pr" && (
										<div className="flex gap-2 mt-3">
											<Button
												size="sm"
												className="bg-linear-to-r from-[#007BFF] to-[#8A2BE2]"
											>
												Accept
											</Button>
											<Button
												size="sm"
												variant="outline"
												className="border-white/20"
											>
												View Details
											</Button>
										</div>
									)}
								</div>
								{notification.unread && (
									<div className="w-2 h-2 bg-[#007BFF] rounded-full shrink-0 mt-2" />
								)}
							</div>
						</Card>
					</motion.div>
				))}
			</div>
			<div className="mt-12 text-center">
				<Code2 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
				<p className="text-gray-500">You're all caught up!</p>
			</div>
		</div>
	);
}
