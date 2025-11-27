import { useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
	Heart,
	MessageCircle,
	Share2,
	Bookmark,
	Code2,
	ExternalLink,
	TrendingUp,
	Briefcase,
	Send,
	Check,
} from "lucide-react";
import { motion } from "framer-motion";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "./ui/dialog";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { toast } from "sonner";

const MOCK_POSTS = [
	{
		id: 1,
		author: {
			name: "Sarah Chen",
			username: "@sarahchen",
			avatar: "https://images.unsplash.com/photo-1715029005043-e88d219a3c48?w=150",
			verified: true,
		},
		content:
			"Just launched my new React component library! 🚀 It's open source and includes 50+ customizable components with TypeScript support. Check it out!",
		code: `import { Button } from '@mylib/ui';\n\nfunction App() {\n  return <Button variant="gradient">Click me</Button>\n}`,
		tags: ["React", "TypeScript", "Open Source"],
		likes: 234,
		comments: 45,
		shares: 12,
		timestamp: "2h ago",
		projectLink: "github.com/sarahchen/ui-lib",
	},
	{
		id: 2,
		author: {
			name: "Alex Rodriguez",
			username: "@alexdev",
			avatar: "https://images.unsplash.com/photo-1715029005043-e88d219a3c48?w=150",
			verified: false,
		},
		content:
			"Looking for a backend developer to collaborate on a SaaS project. Stack: Node.js, PostgreSQL, Docker. DM if interested! 💼",
		tags: ["Node.js", "PostgreSQL", "Collaboration"],
		likes: 89,
		comments: 23,
		shares: 5,
		timestamp: "4h ago",
	},
	{
		id: 3,
		author: {
			name: "Maya Patel",
			username: "@mayabuilds",
			avatar: "https://images.unsplash.com/photo-1715029005043-e88d219a3c48?w=150",
			verified: true,
		},
		content:
			"Built a real-time collaborative whiteboard using WebSockets and Canvas API. Here's a quick demo of the architecture:",
		image: "https://images.unsplash.com/photo-1760548425298-22aa4b60fc16?w=800",
		tags: ["WebSockets", "Canvas API", "Real-time"],
		likes: 456,
		comments: 67,
		shares: 34,
		timestamp: "6h ago",
	},
	{
		id: 4,
		author: {
			name: "James Wilson",
			username: "@jwilson_dev",
			avatar: "https://images.unsplash.com/photo-1715029005043-e88d219a3c48?w=150",
			verified: true,
		},
		content:
			"Just finished a 30-day coding challenge! Built 30 different AI-powered tools. Here's what I learned about consistency and shipping fast 🧵",
		tags: ["AI/ML", "Python", "Productivity"],
		likes: 892,
		comments: 134,
		shares: 78,
		timestamp: "1d ago",
	},
];

export function HomePage() {
	const [likedPosts, setLikedPosts] = useState<number[]>([]);
	const [savedPosts, setSavedPosts] = useState<number[]>([]);
	const [hiredUsers, setHiredUsers] = useState<number[]>([]);
	const [hireDialogOpen, setHireDialogOpen] = useState(false);
	const [selectedUser, setSelectedUser] = useState<
		(typeof MOCK_POSTS)[0] | null
	>(null);
	const [customMessage, setCustomMessage] = useState("");

	const toggleLike = (postId: number) => {
		if (likedPosts.includes(postId)) {
			setLikedPosts(likedPosts.filter((id) => id !== postId));
		} else {
			setLikedPosts([...likedPosts, postId]);
		}
	};

	const toggleSave = (postId: number) => {
		if (savedPosts.includes(postId)) {
			setSavedPosts(savedPosts.filter((id) => id !== postId));
		} else {
			setSavedPosts([...savedPosts, postId]);
		}
	};

	const openHireDialog = (post: (typeof MOCK_POSTS)[0]) => {
		setSelectedUser(post);
		const defaultMessage = `Hi ${post.author.name},

I came across your profile on DevTinder and I'm impressed by your work, especially your recent post about "${post.content.substring(
			0,
			50
		)}${post.content.length > 50 ? "..." : ""}".

I have an exciting opportunity that I think would be a great fit for your skills. Would you be interested in discussing a potential collaboration or position?

Looking forward to connecting!

Best regards`;
		setCustomMessage(defaultMessage);
		setHireDialogOpen(true);
	};

	const sendHireMessage = () => {
		if (selectedUser) {
			setHiredUsers([...hiredUsers, selectedUser.id]);
			setHireDialogOpen(false);
			toast.success(`Hire request sent to ${selectedUser.author.name}!`, {
				description:
					"They'll receive your message and can respond via chat.",
			});
			setSelectedUser(null);
			setCustomMessage("");
		}
	};

	return (
		<div className="min-h-screen p-6 max-w-4xl mx-auto">
			<div className="mb-8">
				<h1 className="text-3xl text-white mb-2">Developer Feed</h1>
				<p className="text-gray-400">
					Discover projects and connect with developers
				</p>
			</div>
			<Tabs defaultValue="trending" className="mb-8">
				<TabsList className="bg-white/5 border border-white/10">
					<TabsTrigger
						value="trending"
						className="data-[state=active]:bg-[#007BFF]  text-white"
					>
						<TrendingUp className="w-4 h-4 mr-2" />
						Trending
					</TabsTrigger>
					<TabsTrigger
						value="recent"
						className="data-[state=active]:bg-[#007BFF]  text-white"
					>
						Recent
					</TabsTrigger>
					<TabsTrigger
						value="network"
						className="data-[state=active]:bg-[#007BFF]  text-white"
					>
						My Network
					</TabsTrigger>
				</TabsList>

				<TabsContent value="trending" className="mt-6 space-y-6">
					{MOCK_POSTS.map((post, index) => (
						<motion.div
							key={post.id}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.3, delay: index * 0.1 }}
						>
							<Card className="glass border-white/10 p-6 hover:border-[#007BFF]/50 transition-colors">
								<div className="flex items-start justify-between mb-4">
									<div className="flex items-center gap-3">
										<Avatar className="w-12 h-12 border-2 border-[#007BFF]">
											<AvatarImage
												src={post.author.avatar}
												alt={post.author.name}
											/>
											<AvatarFallback>
												{post.author.name[0]}
											</AvatarFallback>
										</Avatar>
										<div>
											<div className="flex items-center gap-2">
												<span className="text-white">
													{post.author.name}
												</span>
												{post.author.verified && (
													<div className="w-4 h-4 bg-[#007BFF] rounded-full flex items-center justify-center">
														<svg
															className="w-3 h-3 text-white"
															fill="currentColor"
															viewBox="0 0 20 20"
														>
															<path
																fillRule="evenodd"
																d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
																clipRule="evenodd"
															/>
														</svg>
													</div>
												)}
											</div>
											<span className="text-sm text-gray-400">
												{post.author.username} ·{" "}
												{post.timestamp}
											</span>
										</div>
									</div>
									<div className="flex gap-2">
										<Button
											size="sm"
											variant="outline"
											className=" text-[#FFF] bg-[#1e1e1e]"
										>
											Follow
										</Button>
										<Button
											size="sm"
											onClick={() => openHireDialog(post)}
											disabled={hiredUsers.includes(
												post.id
											)}
											className={
												hiredUsers.includes(post.id)
													? "bg-green-500/20 text-green-500 border border-green-500/30 hover:bg-green-500/20"
													: "bg-linear-to-r from-[#007BFF] to-[#8A2BE2] hover:opacity-90"
											}
										>
											{hiredUsers.includes(post.id) ? (
												<>
													<Check className="w-4 h-4 mr-1" />
													Contacted
												</>
											) : (
												<>
													<Briefcase className="w-4 h-4 mr-1" />
													Hire
												</>
											)}
										</Button>
									</div>
								</div>
								<p className="text-white mb-4">
									{post.content}
								</p>
								{post.code && (
									<div className="bg-black/50 rounded-xl p-4 mb-4 border border-white/10">
										<pre className="text-sm text-green-400 overflow-x-auto">
											<code>{post.code}</code>
										</pre>
									</div>
								)}
								{post.image && (
									<div className="mb-4 rounded-xl overflow-hidden">
										<ImageWithFallback
											src={post.image}
											alt="Post image"
											className="w-full h-64 object-cover"
										/>
									</div>
								)}
								{post.projectLink && (
									<a
										href={`https://${post.projectLink}`}
										target="_blank"
										rel="noopener noreferrer"
										className="flex items-center gap-2 text-[#007BFF] hover:underline mb-4"
									>
										<ExternalLink className="w-4 h-4" />
										{post.projectLink}
									</a>
								)}
								<div className="flex flex-wrap gap-2 mb-4">
									{post.tags.map((tag) => (
										<Badge
											key={tag}
											variant="outline"
											className="border-white/20 text-gray-300"
										>
											#{tag}
										</Badge>
									))}
								</div>
								<div className="flex items-center justify-between pt-4 border-t border-white/10">
									<div className="flex items-center gap-6">
										<motion.button
											whileHover={{ scale: 1.1 }}
											whileTap={{ scale: 0.95 }}
											onClick={() => toggleLike(post.id)}
											className={`flex items-center gap-2 transition-colors ${
												likedPosts.includes(post.id)
													? "text-red-500"
													: "text-gray-400 hover:text-red-500"
											}`}
										>
											<Heart
												className={`w-5 h-5 ${
													likedPosts.includes(post.id)
														? "fill-current"
														: ""
												}`}
											/>
											<span>
												{post.likes +
													(likedPosts.includes(
														post.id
													)
														? 1
														: 0)}
											</span>
										</motion.button>
										<button className="flex items-center gap-2 text-gray-400 hover:text-[#007BFF] transition-colors">
											<MessageCircle className="w-5 h-5" />
											<span>{post.comments}</span>
										</button>
										<button className="flex items-center gap-2 text-gray-400 hover:text-[#007BFF] transition-colors">
											<Share2 className="w-5 h-5" />
											<span>{post.shares}</span>
										</button>
									</div>
									<motion.button
										whileHover={{ scale: 1.1 }}
										whileTap={{ scale: 0.95 }}
										onClick={() => toggleSave(post.id)}
										className={`transition-colors ${
											savedPosts.includes(post.id)
												? "text-[#007BFF]"
												: "text-gray-400 hover:text-[#007BFF]"
										}`}
									>
										<Bookmark
											className={`w-5 h-5 ${
												savedPosts.includes(post.id)
													? "fill-current"
													: ""
											}`}
										/>
									</motion.button>
								</div>
							</Card>
						</motion.div>
					))}
				</TabsContent>

				<TabsContent value="recent" className="mt-6">
					<div className="glass rounded-2xl p-12 text-center">
						<Code2 className="w-16 h-16 text-[#007BFF] mx-auto mb-4" />
						<p className="text-gray-400">
							Recent posts will appear here
						</p>
					</div>
				</TabsContent>

				<TabsContent value="network" className="mt-6">
					<div className="glass rounded-2xl p-12 text-center">
						<Code2 className="w-16 h-16 text-[#007BFF] mx-auto mb-4" />
						<p className="text-gray-400">
							Posts from your network will appear here
						</p>
					</div>
				</TabsContent>
			</Tabs>
			<Dialog open={hireDialogOpen} onOpenChange={setHireDialogOpen}>
				<DialogContent className="bg-[#1C1C1E] border-white/10 text-white max-w-2xl">
					<DialogHeader>
						<DialogTitle className="text-2xl flex items-center gap-2">
							<div className="w-10 h-10 rounded-xl bg-linear-to-r from-[#007BFF] to-[#8A2BE2] flex items-center justify-center">
								<Briefcase className="w-5 h-5 text-white" />
							</div>
							Send Hire Request
						</DialogTitle>
						<DialogDescription className="text-gray-400">
							{selectedUser && (
								<div className="flex items-center gap-3 mt-3 p-3 bg-white/5 rounded-xl border border-white/10">
									<Avatar className="w-10 h-10 border-2 border-[#007BFF]">
										<AvatarImage
											src={selectedUser.author.avatar}
											alt={selectedUser.author.name}
										/>
										<AvatarFallback>
											{selectedUser.author.name[0]}
										</AvatarFallback>
									</Avatar>
									<div>
										<div className="flex items-center gap-2">
											<span className="text-white">
												{selectedUser.author.name}
											</span>
											{selectedUser.author.verified && (
												<div className="w-3 h-3 bg-[#007BFF] rounded-full flex items-center justify-center">
													<svg
														className="w-2 h-2 text-white"
														fill="currentColor"
														viewBox="0 0 20 20"
													>
														<path
															fillRule="evenodd"
															d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
															clipRule="evenodd"
														/>
													</svg>
												</div>
											)}
										</div>
										<span className="text-xs text-gray-400">
											{selectedUser.author.username}
										</span>
									</div>
									<div className="ml-auto flex flex-wrap gap-1">
										{selectedUser.tags
											.slice(0, 3)
											.map((tag) => (
												<Badge
													key={tag}
													variant="outline"
													className="border-white/20 text-gray-300 text-xs"
												>
													{tag}
												</Badge>
											))}
									</div>
								</div>
							)}
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4 mt-4">
						<div>
							<Label
								htmlFor="hire-message"
								className="text-white mb-2 block"
							>
								Your Message
							</Label>
							<Textarea
								id="hire-message"
								value={customMessage}
								onChange={(e) =>
									setCustomMessage(e.target.value)
								}
								className="min-h-[200px] bg-[#0A0A0A] border-white/10 text-white resize-none"
								placeholder="Write your hire request message..."
							/>
							<p className="text-xs text-gray-400 mt-2">
								💡 Tip: Personalize your message to increase
								response rate. Mention specific skills or
								projects that caught your attention.
							</p>
						</div>

						<div className="p-4 bg-[#007BFF]/10 rounded-xl border border-[#007BFF]/30">
							<h4 className="text-sm text-[#007BFF] mb-2 flex items-center gap-2">
								<MessageCircle className="w-4 h-4" />
								What happens next?
							</h4>
							<ul className="text-xs text-gray-400 space-y-1.5">
								<li className="flex items-start gap-2">
									<span className="text-[#007BFF] mt-0.5">
										•
									</span>
									<span>
										Your message will be sent directly to{" "}
										{selectedUser?.author.name}'s inbox
									</span>
								</li>
								<li className="flex items-start gap-2">
									<span className="text-[#007BFF] mt-0.5">
										•
									</span>
									<span>
										They'll receive a notification about
										your hire request
									</span>
								</li>
								<li className="flex items-start gap-2">
									<span className="text-[#007BFF] mt-0.5">
										•
									</span>
									<span>
										If interested, they can reply via the
										chat feature
									</span>
								</li>
								<li className="flex items-start gap-2">
									<span className="text-[#007BFF] mt-0.5">
										•
									</span>
									<span>
										You'll be notified when they respond
									</span>
								</li>
							</ul>
						</div>
					</div>

					<DialogFooter className="flex gap-2 mt-6">
						<Button
							variant="outline"
							onClick={() => setHireDialogOpen(false)}
							className="border-white/20 text-white hover:bg-white/10"
						>
							Cancel
						</Button>
						<Button
							onClick={sendHireMessage}
							disabled={!customMessage.trim()}
							className="bg-linear-to-r from-[#007BFF] to-[#8A2BE2] hover:opacity-90"
						>
							<Send className="w-4 h-4 mr-2" />
							Send Hire Request
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
