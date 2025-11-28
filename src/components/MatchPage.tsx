import { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { X, Heart, Star, MapPin, Code2, Zap } from "lucide-react";
import {
	motion,
	useMotionValue,
	useTransform,
	AnimatePresence,
	type PanInfo,
} from "framer-motion";

const DEVELOPERS = [
	{
		id: 1,
		name: "Emma Wilson",
		username: "@emmawilson",
		avatar: "https://images.unsplash.com/photo-1715029005043-e88d219a3c48?w=400",
		bio: "Frontend architect with a passion for creating beautiful, accessible user experiences",
		location: "New York, NY",
		skills: ["React", "TypeScript", "TailwindCSS", "Next.js", "Figma"],
		interests: ["UI/UX Design", "Web Accessibility", "Open Source"],
		githubStars: 2340,
		projects: 28,
		gradient: "from-[#FF6B6B] to-[#FFE66D]",
	},
	{
		id: 2,
		name: "Marcus Chen",
		username: "@marcuschen",
		avatar: "https://images.unsplash.com/photo-1715029005043-e88d219a3c48?w=400",
		bio: "Backend wizard specializing in scalable microservices and cloud architecture",
		location: "Seattle, WA",
		skills: ["Node.js", "Python", "Docker", "Kubernetes", "AWS"],
		interests: ["Cloud Computing", "DevOps", "System Design"],
		githubStars: 1890,
		projects: 34,
		gradient: "from-[#007BFF] to-[#00D4FF]",
	},
	{
		id: 3,
		name: "Sofia Rodriguez",
		username: "@sofiarodriguez",
		avatar: "https://images.unsplash.com/photo-1715029005043-e88d219a3c48?w=400",
		bio: "AI/ML engineer building the next generation of intelligent applications",
		location: "San Francisco, CA",
		skills: ["Python", "TensorFlow", "PyTorch", "React", "FastAPI"],
		interests: ["Machine Learning", "Deep Learning", "Computer Vision"],
		githubStars: 3450,
		projects: 19,
		gradient: "from-[#8A2BE2] to-[#FF1493]",
	},
	{
		id: 4,
		name: "David Kim",
		username: "@davidkim",
		avatar: "https://images.unsplash.com/photo-1715029005043-e88d219a3c48?w=400",
		bio: "Full-stack developer with a focus on real-time applications and WebSocket magic",
		location: "Austin, TX",
		skills: ["JavaScript", "Node.js", "WebSockets", "MongoDB", "React"],
		interests: ["Real-time Systems", "Web Development", "Startups"],
		githubStars: 1567,
		projects: 42,
		gradient: "from-[#00D4FF] to-[#6C63FF]",
	},
	{
		id: 5,
		name: "Olivia Martinez",
		username: "@oliviamartinez",
		avatar: "https://images.unsplash.com/photo-1715029005043-e88d219a3c48?w=400",
		bio: "Mobile developer crafting native experiences for iOS and Android",
		location: "Los Angeles, CA",
		skills: ["Swift", "Kotlin", "React Native", "Flutter", "Firebase"],
		interests: ["Mobile Development", "App Design", "Performance"],
		githubStars: 2100,
		projects: 31,
		gradient: "from-[#FF6B6B] to-[#8A2BE2]",
	},
];

export function MatchPage() {
	const [currentIndex, setCurrentIndex] = useState(0);
	const [matches, setMatches] = useState<number[]>([]);
	const [passes, setPasses] = useState<number[]>([]);

	const currentDev = DEVELOPERS[currentIndex];
	const x = useMotionValue(0);
	const rotate = useTransform(x, [-200, 200], [-25, 25]);
	const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

	const handleDragEnd = (
		event: MouseEvent | TouchEvent | PointerEvent,
		info: PanInfo
	) => {
		if (Math.abs(info.offset.x) > 100) {
			if (info.offset.x > 0) {
				handleLike();
			} else {
				handlePass();
			}
		}
		console.log(event);
	};

	const handleLike = () => {
		if (currentDev) {
			setMatches([...matches, currentDev.id]);
			nextCard();
		}
	};

	const handlePass = () => {
		if (currentDev) {
			setPasses([...passes, currentDev.id]);
			nextCard();
		}
	};

	const nextCard = () => {
		setTimeout(() => {
			if (currentIndex < DEVELOPERS.length - 1) {
				setCurrentIndex(currentIndex + 1);
				x.set(0);
			}
		}, 300);
	};

	if (currentIndex >= DEVELOPERS.length) {
		return (
			<div className="min-h-screen flex items-center justify-center p-6">
				<motion.div
					initial={{ opacity: 0, scale: 0.9 }}
					animate={{ opacity: 1, scale: 1 }}
					className="text-center"
				>
					<div className="w-24 h-24 bg-linear-to-r from-[#007BFF] to-[#8A2BE2] rounded-full flex items-center justify-center mx-auto mb-6">
						<Heart className="w-12 h-12 text-white" />
					</div>
					<h2 className="text-3xl text-white mb-4">
						No More Matches!
					</h2>
					<p className="text-gray-400 mb-8">
						You've reviewed all available developers. Check back
						later for more!
					</p>
					<div className="glass rounded-2xl p-6 inline-block">
						<p className="text-[#007BFF] mb-2">Your Stats</p>
						<div className="flex gap-8">
							<div>
								<div className="text-2xl text-white">
									{matches.length}
								</div>
								<div className="text-sm text-gray-400">
									Liked
								</div>
							</div>
							<div>
								<div className="text-2xl text-white">
									{passes.length}
								</div>
								<div className="text-sm text-gray-400">
									Passed
								</div>
							</div>
						</div>
					</div>
				</motion.div>
			</div>
		);
	}

	return (
		<div className="min-h-screen flex items-center justify-center p-6">
			<div className="w-full max-w-md">
				<div className="text-center mb-8">
					<h1 className="text-3xl text-white mb-2">
						Find Your Match
					</h1>
					<p className="text-gray-400">
						Swipe right to connect, left to pass
					</p>
				</div>
				<div className="relative h-[600px] flex items-center justify-center">
					<AnimatePresence>
						{DEVELOPERS.slice(currentIndex, currentIndex + 2).map(
							(dev, index) => (
								<motion.div
									key={dev.id}
									style={{
										x: index === 0 ? x : 0,
										rotate: index === 0 ? rotate : 0,
										opacity: index === 0 ? opacity : 1,
										zIndex: index === 0 ? 20 : 10,
										scale: index === 0 ? 1 : 0.95,
									}}
									drag={index === 0 ? "x" : false}
									dragConstraints={{ left: 0, right: 0 }}
									onDragEnd={
										index === 0 ? handleDragEnd : undefined
									}
									className="absolute w-full"
									initial={{ scale: 0.9, opacity: 0 }}
									animate={{
										scale: index === 0 ? 1 : 0.95,
										opacity: 1,
									}}
									exit={{ scale: 0.9, opacity: 0 }}
								>
									<div
										className="rounded-xl border border-white/10 overflow-hidden shadow-2xl"
										style={{
											backgroundColor: "#1C1C1E",
											opacity: 1,
										}}
									>
										<div
											className={`h-40 bg-linear-to-r ${dev.gradient} relative`}
										>
											<div className="absolute inset-0 flex items-center justify-center opacity-20">
												<Code2 className="w-32 h-32 text-white" />
											</div>
										</div>
										<div className="relative -mt-16 px-6">
											<Avatar className="w-32 h-32 border-4 border-[#1C1C1E] mx-auto shadow-2xl">
												<AvatarImage
													src={dev.avatar}
													alt={dev.name}
												/>
												<AvatarFallback>
													{dev.name[0]}
												</AvatarFallback>
											</Avatar>
										</div>
										<div className="p-6 pt-4 bg-[#1C1C1E]">
											<div className="text-center mb-6">
												<h2 className="text-2xl text-white mb-1">
													{dev.name}
												</h2>
												<p className="text-gray-400 mb-4">
													{dev.username}
												</p>
												<p className="text-gray-300 mb-4">
													{dev.bio}
												</p>

												<div className="flex items-center justify-center gap-4 text-sm text-gray-400 mb-4">
													<div className="flex items-center gap-1">
														<MapPin className="w-4 h-4" />
														{dev.location}
													</div>
													<div className="flex items-center gap-1">
														<Star className="w-4 h-4 text-yellow-500" />
														{dev.githubStars}
													</div>
												</div>
											</div>
											<div className="mb-6">
												<div className="flex items-center gap-2 mb-3">
													<Zap className="w-4 h-4 text-[#007BFF]" />
													<span className="text-sm text-gray-400">
														Skills
													</span>
												</div>
												<div className="flex flex-wrap gap-2">
													{dev.skills.map((skill) => (
														<Badge
															key={skill}
															className="bg-[#007BFF]/20 border border-[#007BFF]/30"
														>
															{skill}
														</Badge>
													))}
												</div>
											</div>
											<div className="mb-6">
												<div className="flex items-center gap-2 mb-3">
													<Heart className="w-4 h-4 text-[#8A2BE2]" />
													<span className="text-sm text-gray-400">
														Interests
													</span>
												</div>
												<div className="flex flex-wrap gap-2">
													{dev.interests.map(
														(interest) => (
															<Badge
																key={interest}
																variant="outline"
																className="border-white/20 text-white"
															>
																{interest}
															</Badge>
														)
													)}
												</div>
											</div>
											<div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
												<div className="text-center">
													<div className="text-xl text-white">
														{dev.githubStars}
													</div>
													<div className="text-sm text-gray-400">
														GitHub Stars
													</div>
												</div>
												<div className="text-center">
													<div className="text-xl text-white">
														{dev.projects}
													</div>
													<div className="text-sm text-gray-400">
														Projects
													</div>
												</div>
											</div>
										</div>
									</div>
								</motion.div>
							)
						)}
					</AnimatePresence>
				</div>
				<div className="flex justify-center gap-6 mt-8">
					<motion.button
						whileHover={{ scale: 1.1 }}
						whileTap={{ scale: 0.95 }}
						onClick={handlePass}
						className="w-16 h-16 rounded-full bg-white/10 border-2 border-red-500 flex items-center justify-center hover:bg-red-500/20 transition-colors"
					>
						<X className="w-8 h-8 text-red-500" />
					</motion.button>

					<motion.button
						whileHover={{ scale: 1.1 }}
						whileTap={{ scale: 0.95 }}
						onClick={handleLike}
						className="w-20 h-20 rounded-full bg-linear-to-r from-[#007BFF] to-[#8A2BE2] flex items-center justify-center shadow-xl shadow-[#007BFF]/50"
					>
						<Heart className="w-10 h-10 text-white" />
					</motion.button>
				</div>
				<div className="text-center mt-6 text-gray-400 text-sm">
					{currentIndex + 1} / {DEVELOPERS.length}
				</div>
			</div>
		</div>
	);
}
