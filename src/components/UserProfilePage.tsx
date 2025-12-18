import { useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
	MapPin,
	Link as LinkIcon,
	Calendar,
	Github,
	Twitter,
	Linkedin,
	Code2,
	Star,
	GitFork,
	Users,
	Heart,
	MessageCircle,
	Share2,
	Bookmark,
	ExternalLink,
	UserPlus,
	UserMinus,
	UserCheck,
	Mail,
} from "lucide-react";
import { motion } from "framer-motion";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { toast } from "sonner";
import { useParams } from "react-router-dom";

// Mock user data
const MOCK_USERS: Record<string, any> = {
	user_1: {
		id: "user_1",
		name: "Sarah Chen",
		username: "@sarahchen",
		avatar: "https://images.unsplash.com/photo-1715029005043-e88d219a3c48?w=150",
		coverImage:
			"https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200",
		bio: "Full-stack developer passionate about React, TypeScript, and building beautiful UIs. Open source enthusiast and tech blogger.",
		location: "San Francisco, CA",
		website: "sarahchen.dev",
		joinedDate: "Jan 2023",
		verified: true,
		stats: {
			followers: 12500,
			following: 850,
			posts: 234,
		},
		skills: [
			"React",
			"TypeScript",
			"Node.js",
			"PostgreSQL",
			"GraphQL",
			"Docker",
			"AWS",
		],
		social: {
			github: "sarahchen",
			twitter: "sarahchen",
			linkedin: "sarahchen",
		},
		posts: [
			{
				id: 1,
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
				content:
					"Working on a new AI-powered code review tool. Early results are promising!",
				tags: ["AI", "Machine Learning", "DevTools"],
				likes: 189,
				comments: 32,
				shares: 8,
				timestamp: "1d ago",
			},
			{
				id: 3,
				content: "Tips for writing clean, maintainable React code 🧵",
				tags: ["React", "Best Practices", "Clean Code"],
				likes: 567,
				comments: 89,
				shares: 45,
				timestamp: "3d ago",
			},
		],
	},
	user_2: {
		id: "user_2",
		name: "Alex Rodriguez",
		username: "@alexdev",
		avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
		coverImage:
			"https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200",
		bio: "Backend engineer specializing in Node.js, PostgreSQL, and microservices architecture. Love building scalable systems.",
		location: "Austin, TX",
		website: "alexrodriguez.io",
		joinedDate: "Mar 2022",
		verified: false,
		stats: {
			followers: 5400,
			following: 420,
			posts: 156,
		},
		skills: [
			"Node.js",
			"PostgreSQL",
			"Docker",
			"Kubernetes",
			"Redis",
			"RabbitMQ",
			"Go",
		],
		social: {
			github: "alexdev",
			twitter: "alexdev",
			linkedin: "alexrodriguez",
		},
		posts: [
			{
				id: 4,
				content:
					"Looking for a backend developer to collaborate on a SaaS project. Stack: Node.js, PostgreSQL, Docker. DM if interested! 💼",
				tags: ["Node.js", "PostgreSQL", "Collaboration"],
				likes: 89,
				comments: 23,
				shares: 5,
				timestamp: "4h ago",
			},
			{
				id: 5,
				content:
					"Just implemented a distributed caching layer that reduced our API response time by 60%",
				tags: ["Performance", "Redis", "Backend"],
				likes: 312,
				comments: 54,
				shares: 18,
				timestamp: "2d ago",
			},
		],
	},
	user_3: {
		id: "user_3",
		name: "Maya Patel",
		username: "@mayabuilds",
		avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
		coverImage:
			"https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=1200",
		bio: "Creative developer building interactive experiences with WebGL, Canvas API, and modern web technologies. Always learning!",
		location: "New York, NY",
		website: "mayapatel.com",
		joinedDate: "Jul 2021",
		verified: true,
		stats: {
			followers: 18200,
			following: 950,
			posts: 287,
		},
		skills: [
			"JavaScript",
			"WebGL",
			"Canvas API",
			"Three.js",
			"React",
			"WebSockets",
			"Animation",
		],
		social: {
			github: "mayabuilds",
			twitter: "mayabuilds",
			linkedin: "mayapatel",
		},
		posts: [
			{
				id: 6,
				content:
					"Built a real-time collaborative whiteboard using WebSockets and Canvas API. Here's a quick demo of the architecture:",
				image: "https://images.unsplash.com/photo-1760548425298-22aa4b60fc16?w=800",
				tags: ["WebSockets", "Canvas API", "Real-time"],
				likes: 456,
				comments: 67,
				shares: 34,
				timestamp: "6h ago",
			},
		],
	},
	user_4: {
		id: "user_4",
		name: "James Wilson",
		username: "@jwilson_dev",
		avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150",
		coverImage:
			"https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=1200",
		bio: "AI/ML engineer and Python enthusiast. Building intelligent systems that make a difference. 30-day coding challenge survivor!",
		location: "Seattle, WA",
		website: "jameswilson.dev",
		joinedDate: "Sep 2020",
		verified: true,
		stats: {
			followers: 24300,
			following: 1200,
			posts: 412,
		},
		skills: [
			"Python",
			"TensorFlow",
			"PyTorch",
			"Machine Learning",
			"Data Science",
			"FastAPI",
			"Docker",
		],
		social: {
			github: "jwilson_dev",
			twitter: "jwilson_dev",
			linkedin: "jameswilson",
		},
		posts: [
			{
				id: 7,
				content:
					"Just finished a 30-day coding challenge! Built 30 different AI-powered tools. Here's what I learned about consistency and shipping fast 🧵",
				tags: ["AI/ML", "Python", "Productivity"],
				likes: 892,
				comments: 134,
				shares: 78,
				timestamp: "1d ago",
			},
		],
	},
};

export function UserProfilePage() {
	// Check if we're already friends with this user (mock logic - in real app would check backend)
	const { userId } = useParams();
	const getInitialFriendStatus = (
		userId: string
	): "none" | "pending" | "friends" => {
		// Mock: user_1 and user_3 are already friends
		if (userId === "user_1" || userId === "user_3") {
			return "friends";
		}
		return "none";
	};

	const [friendStatus, setFriendStatus] = useState<
		"none" | "pending" | "friends"
	>(userId ? getInitialFriendStatus(userId) : "none");
	const [likedPosts, setLikedPosts] = useState<number[]>([]);
	const [savedPosts, setSavedPosts] = useState<number[]>([]);

	// Get user data or show not found
	const user = userId ? MOCK_USERS[userId] : null;

	if (!user) {
		return (
			<div className="min-h-screen p-6 flex items-center justify-center">
				<Card className="glass border-white/10 p-12 text-center">
					<Code2 className="w-16 h-16 text-[#007BFF] mx-auto mb-4" />
					<h2 className="text-2xl text-white mb-2">User Not Found</h2>
					<p className="text-gray-400">
						This user profile doesn't exist or has been removed.
					</p>
				</Card>
			</div>
		);
	}

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

	const handleSendRequest = () => {
		setFriendStatus("pending");
		toast.success(`Friend request sent to ${user.name}!`, {
			description: "They'll be notified about your request.",
		});
	};

	const handleUnfriend = () => {
		setFriendStatus("none");
		toast.success(`Removed ${user.name} from your friends list.`);
	};

	const handleCancelRequest = () => {
		setFriendStatus("none");
		toast.success("Friend request cancelled.");
	};

	return (
		<div className="min-h-screen">
			{/* Cover Image */}
			<div className="relative h-64 w-full">
				<ImageWithFallback
					src={user.coverImage}
					alt="Cover"
					className="w-full h-full object-cover"
				/>
				<div className="absolute inset-0 bg-linear-to-b from-transparent to-[#121212]" />
			</div>

			{/* Profile Header */}
			<div className="max-w-6xl mx-auto px-6 -mt-20 relative z-10">
				<div className="flex flex-col md:flex-row gap-6 items-start md:items-end mb-6">
					{/* Avatar */}
					<Avatar className="w-32 h-32 border-4 border-[#121212] shadow-xl ring-2 ring-[#007BFF]">
						<AvatarImage src={user.avatar} alt={user.name} />
						<AvatarFallback className="text-3xl">
							{user.name[0]}
						</AvatarFallback>
					</Avatar>

					{/* User Info */}
					<div className="flex-1">
						<div className="flex items-center gap-3 mb-2">
							<h1 className="text-3xl text-white">{user.name}</h1>
							{user.verified && (
								<div className="w-6 h-6 bg-[#007BFF] rounded-full flex items-center justify-center">
									<svg
										className="w-4 h-4 text-white"
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
						<p className="text-gray-400 mb-4">{user.username}</p>

						{/* Action Buttons */}
						<div className="flex flex-wrap gap-3">
							{friendStatus === "none" && (
								<Button
									onClick={handleSendRequest}
									className="bg-linear-to-r from-[#007BFF] to-[#8A2BE2] hover:opacity-90"
								>
									<UserPlus className="w-4 h-4 mr-2" />
									Send Request
								</Button>
							)}
							{friendStatus === "pending" && (
								<Button
									onClick={handleCancelRequest}
									variant="outline"
									className="border-[#007BFF] text-[#007BFF] hover:bg-[#007BFF]/10"
								>
									<UserCheck className="w-4 h-4 mr-2" />
									Request Sent
								</Button>
							)}
							{friendStatus === "friends" && (
								<Button
									onClick={handleUnfriend}
									variant="outline"
									className="border-green-500 text-green-500 hover:bg-red-500 hover:text-white hover:border-red-500"
								>
									<UserCheck className="w-4 h-4 mr-2" />
									Friends
								</Button>
							)}
							<Button
								variant="outline"
								className="border-white/20 text-white hover:bg-white/10"
							>
								<Mail className="w-4 h-4 mr-2" />
								Message
							</Button>
						</div>
					</div>

					{/* Stats */}
					<div className="flex gap-6 glass p-4 rounded-2xl border border-white/10">
						<div className="text-center">
							<div className="text-2xl text-white">
								{user.stats.followers.toLocaleString()}
							</div>
							<div className="text-sm text-gray-400">
								Followers
							</div>
						</div>
						<div className="text-center">
							<div className="text-2xl text-white">
								{user.stats.following.toLocaleString()}
							</div>
							<div className="text-sm text-gray-400">
								Following
							</div>
						</div>
						<div className="text-center">
							<div className="text-2xl text-white">
								{user.stats.posts}
							</div>
							<div className="text-sm text-gray-400">Posts</div>
						</div>
					</div>
				</div>

				{/* Bio & Details */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
					{/* Left Column - About */}
					<div className="lg:col-span-1 space-y-4">
						<Card className="glass border-white/10 p-6">
							<h3 className="text-xl text-white mb-4">About</h3>
							<p className="text-gray-300 mb-4">{user.bio}</p>

							<div className="space-y-3 text-sm">
								{user.location && (
									<div className="flex items-center gap-2 text-gray-400">
										<MapPin className="w-4 h-4" />
										{user.location}
									</div>
								)}
								{user.website && (
									<div className="flex items-center gap-2 text-gray-400">
										<LinkIcon className="w-4 h-4" />
										<a
											href={`https://${user.website}`}
											target="_blank"
											rel="noopener noreferrer"
											className="text-[#007BFF] hover:underline"
										>
											{user.website}
										</a>
									</div>
								)}
								<div className="flex items-center gap-2 text-gray-400">
									<Calendar className="w-4 h-4" />
									Joined {user.joinedDate}
								</div>
							</div>

							{/* Social Links */}
							{user.social && (
								<div className="flex gap-3 mt-4 pt-4 border-t border-white/10">
									{user.social.github && (
										<a
											href={`https://github.com/${user.social.github}`}
											target="_blank"
											rel="noopener noreferrer"
											className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
										>
											<Github className="w-5 h-5" />
										</a>
									)}
									{user.social.twitter && (
										<a
											href={`https://twitter.com/${user.social.twitter}`}
											target="_blank"
											rel="noopener noreferrer"
											className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
										>
											<Twitter className="w-5 h-5" />
										</a>
									)}
									{user.social.linkedin && (
										<a
											href={`https://linkedin.com/in/${user.social.linkedin}`}
											target="_blank"
											rel="noopener noreferrer"
											className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
										>
											<Linkedin className="w-5 h-5" />
										</a>
									)}
								</div>
							)}
						</Card>

						{/* Skills */}
						<Card className="glass border-white/10 p-6">
							<h3 className="text-xl text-white mb-4">Skills</h3>
							<div className="flex flex-wrap gap-2">
								{user.skills.map((skill: string) => (
									<Badge
										key={skill}
										variant="outline"
										className="border-[#007BFF]/30 bg-[#007BFF]/10 text-[#007BFF]"
									>
										{skill}
									</Badge>
								))}
							</div>
						</Card>
					</div>

					{/* Right Column - Posts */}
					<div className="lg:col-span-2">
						<Tabs defaultValue="posts" className="w-full">
							<TabsList className="bg-white/5 border border-white/10 w-full">
								<TabsTrigger
									value="posts"
									className="flex-1 data-[state=active]:bg-[#007BFF]"
								>
									Posts ({user.posts.length})
								</TabsTrigger>
								<TabsTrigger
									value="projects"
									className="flex-1 data-[state=active]:bg-[#007BFF]"
								>
									Projects
								</TabsTrigger>
								<TabsTrigger
									value="activity"
									className="flex-1 data-[state=active]:bg-[#007BFF]"
								>
									Activity
								</TabsTrigger>
							</TabsList>

							<TabsContent
								value="posts"
								className="mt-6 space-y-6"
							>
								{user.posts.map((post: any, index: number) => (
									<motion.div
										key={post.id}
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{
											duration: 0.3,
											delay: index * 0.1,
										}}
									>
										<Card className="glass border-white/10 p-6 hover:border-[#007BFF]/50 transition-colors">
											{/* Post Header */}
											<div className="flex items-center gap-3 mb-4">
												<Avatar className="w-10 h-10 border-2 border-[#007BFF]">
													<AvatarImage
														src={user.avatar}
														alt={user.name}
													/>
													<AvatarFallback>
														{user.name[0]}
													</AvatarFallback>
												</Avatar>
												<div>
													<div className="flex items-center gap-2">
														<span className="text-white">
															{user.name}
														</span>
														{user.verified && (
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
														{post.timestamp}
													</span>
												</div>
											</div>

											{/* Content */}
											<p className="text-white mb-4">
												{post.content}
											</p>

											{/* Code Block */}
											{post.code && (
												<div className="bg-black/50 rounded-xl p-4 mb-4 border border-white/10">
													<pre className="text-sm text-green-400 overflow-x-auto">
														<code>{post.code}</code>
													</pre>
												</div>
											)}

											{/* Image */}
											{post.image && (
												<div className="mb-4 rounded-xl overflow-hidden">
													<ImageWithFallback
														src={post.image}
														alt="Post image"
														className="w-full h-64 object-cover"
													/>
												</div>
											)}

											{/* Project Link */}
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

											{/* Tags */}
											<div className="flex flex-wrap gap-2 mb-4">
												{post.tags.map(
													(tag: string) => (
														<Badge
															key={tag}
															variant="outline"
															className="border-white/20 text-gray-300"
														>
															#{tag}
														</Badge>
													)
												)}
											</div>

											{/* Actions */}
											<div className="flex items-center justify-between pt-4 border-t border-white/10">
												<div className="flex items-center gap-6">
													<motion.button
														whileHover={{
															scale: 1.1,
														}}
														whileTap={{
															scale: 0.95,
														}}
														onClick={() =>
															toggleLike(post.id)
														}
														className={`flex items-center gap-2 transition-colors ${
															likedPosts.includes(
																post.id
															)
																? "text-red-500"
																: "text-gray-400 hover:text-red-500"
														}`}
													>
														<Heart
															className={`w-5 h-5 ${
																likedPosts.includes(
																	post.id
																)
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
														<span>
															{post.comments}
														</span>
													</button>
													<button className="flex items-center gap-2 text-gray-400 hover:text-[#007BFF] transition-colors">
														<Share2 className="w-5 h-5" />
														<span>
															{post.shares}
														</span>
													</button>
												</div>
												<motion.button
													whileHover={{ scale: 1.1 }}
													whileTap={{ scale: 0.95 }}
													onClick={() =>
														toggleSave(post.id)
													}
													className={`transition-colors ${
														savedPosts.includes(
															post.id
														)
															? "text-[#007BFF]"
															: "text-gray-400 hover:text-[#007BFF]"
													}`}
												>
													<Bookmark
														className={`w-5 h-5 ${
															savedPosts.includes(
																post.id
															)
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

							<TabsContent value="projects" className="mt-6">
								<Card className="glass border-white/10 p-12 text-center">
									<Code2 className="w-16 h-16 text-[#007BFF] mx-auto mb-4" />
									<p className="text-gray-400">
										Projects will appear here
									</p>
								</Card>
							</TabsContent>

							<TabsContent value="activity" className="mt-6">
								<Card className="glass border-white/10 p-12 text-center">
									<Code2 className="w-16 h-16 text-[#007BFF] mx-auto mb-4" />
									<p className="text-gray-400">
										Activity will appear here
									</p>
								</Card>
							</TabsContent>
						</Tabs>
					</div>
				</div>
			</div>
		</div>
	);
}
