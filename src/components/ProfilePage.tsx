import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
	MapPin,
	Link as LinkIcon,
	Github,
	Star,
	GitFork,
	Users,
	Calendar,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../hooks/useAuth";

export interface IUser {
	_id: string;
	username: string;
	age?: number;
	email: string;
	phone?: string;
	skills?: string[];
	bio?: string;
	experienceLevel?: string;

	github?: string;
	linkedin?: string;
	portfolio?: string;
	interests?: [];

	avatar?: string;
	location?: string;
	followers?: string;
	following?: string;
	isActive?: boolean;
	isOnline?: boolean;

	createdAt?: string;
	updatedAt?: string;
}

// const user? = {
// 	name: "Alex Johnson",
// 	username: "@alexjohnson",
// 	avatar: "https://images.unsplash.com/photo-1715029005043-e88d219a3c48?w=300",
// 	bio: "Full-stack developer passionate about building tools that make developers' lives easier. Open source enthusiast. Coffee addict. ☕️",
// 	location: "San Francisco, CA",
// 	website: "alexjohnson.dev",
// 	github: "alexjohnson",
// 	followers: 2543,
// 	following: 892,
// 	joined: "January 2023",
// 	skills: [
// 		"React",
// 		"TypeScript",
// 		"Node.js",
// 		"Python",
// 		"Docker",
// 		"AWS",
// 		"PostgreSQL",
// 		"GraphQL",
// 	],
// 	interests: ["Web Development", "Open Source", "DevOps", "AI/ML"],
// 	stats: {
// 		stars: 1234,
// 		forks: 567,
// 		projects: 42,
// 	},
// };

const PROJECTS = [
	{
		id: 1,
		name: "DevTools Pro",
		description:
			"A comprehensive suite of developer tools for modern web development",
		stars: 456,
		forks: 89,
		language: "TypeScript",
		color: "#007BFF",
	},
	{
		id: 2,
		name: "API Builder",
		description:
			"No-code API builder with automatic documentation generation",
		stars: 234,
		forks: 45,
		language: "Node.js",
		color: "#8A2BE2",
	},
	{
		id: 3,
		name: "Component Library",
		description:
			"React component library with 100+ customizable components",
		stars: 789,
		forks: 123,
		language: "React",
		color: "#6C63FF",
	},
];

export function ProfilePage() {
	const { user } = useAuth();

	return (
		<div className="min-h-screen p-6 max-w-6xl mx-auto">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className="h-48 bg-linear-to-r from-[#007BFF] to-[#8A2BE2] rounded-3xl mb-8 relative overflow-hidden"
			>
				<div className="absolute inset-0 opacity-20">
					<div className="absolute top-10 left-10 text-6xl text-white/30">
						{"<>"}
					</div>
					<div className="absolute bottom-10 right-10 text-6xl text-white/30">
						{"</>"}
					</div>
				</div>
			</motion.div>
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.1 }}
				className="glass rounded-3xl p-8 -mt-24 relative z-10 mb-8"
			>
				<div className="flex flex-col md:flex-row gap-6 items-start">
					<Avatar className="w-32 h-32 border-4 border-[#007BFF] shadow-xl">
						<AvatarImage src={user?.avatar} alt={user?.username} />
						<AvatarFallback>{user?.username[0]}</AvatarFallback>
					</Avatar>

					<div className="flex-1">
						<div className="flex items-start justify-between mb-4">
							<div>
								<h1 className="text-3xl text-white mb-1">
									{user?.username}
								</h1>
								<p className="text-gray-400">
									{user?.username}
								</p>
							</div>
							<div className="flex gap-3">
								<Button
									variant="outline"
									className="border-white/20 text-white bg-[#181819]"
								>
									Share Profile
								</Button>
								<Button className="bg-linear-to-r from-[#007BFF] to-[#8A2BE2]">
									Edit Profile
								</Button>
							</div>
						</div>

						<p className="text-gray-300 mb-6 max-w-2xl">
							{user?.bio}
						</p>

						<div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-6">
							<div className="flex items-center gap-2">
								<MapPin className="w-4 h-4" />
								{user?.location}
							</div>
							<div className="flex items-center gap-2">
								<LinkIcon className="w-4 h-4" />
								<a
									href={`${user?.portfolio}`}
									className="text-[#007BFF] hover:underline"
								>
									{user?.portfolio}
								</a>
							</div>
							<div className="flex items-center gap-2">
								<Github className="w-4 h-4" />
								<a
									href={`https://github.com/${user?.github}`}
									className="text-[#007BFF] hover:underline"
								>
									{user?.github}
								</a>
							</div>
							<div className="flex items-center gap-2">
								<Calendar className="w-4 h-4" />
								Joined {user?.createdAt?.split("T")[0]}
							</div>
						</div>

						<div className="flex gap-6">
							<div>
								<span className="text-white">
									{user?.followers ?? "100"}
								</span>{" "}
								<span className="text-gray-400">Followers</span>
							</div>
							<div>
								<span className="text-white">
									{user?.following ?? "85"}
								</span>{" "}
								<span className="text-gray-400">Following</span>
							</div>
						</div>
					</div>
				</div>
			</motion.div>
			<div className="grid md:grid-cols-3 gap-6 mb-8">
				{[
					{
						icon: Star,
						label: "Total Stars",
						value: 20,
						color: "#FFD700",
					},
					{
						icon: GitFork,
						label: "Total Forks",
						value: 30,
						color: "#007BFF",
					},
					{
						icon: Users,
						label: "Projects",
						value: 40,
						color: "#8A2BE2",
					},
				].map((stat, index) => (
					<motion.div
						key={stat.label}
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.2 + index * 0.1 }}
					>
						<Card className="glass border-white/10 p-6">
							<div className="flex items-center gap-4">
								<div
									className="w-12 h-12 rounded-xl flex items-center justify-center"
									style={{
										backgroundColor: `${stat.color}20`,
									}}
								>
									<stat.icon
										className="w-6 h-6"
										style={{ color: stat.color }}
									/>
								</div>
								<div>
									<div className="text-2xl text-white">
										{stat.value}
									</div>
									<div className="text-sm text-gray-400">
										{stat.label}
									</div>
								</div>
							</div>
						</Card>
					</motion.div>
				))}
			</div>
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.4 }}
			>
				<Tabs defaultValue="skills" className="space-y-6">
					<TabsList className="bg-white/5 border 6 border-white/10">
						<TabsTrigger
							value="skills"
							className="data-[state=active]:bg-[#007BFF]  text-white"
						>
							Skills
						</TabsTrigger>
						<TabsTrigger
							value="projects"
							className="data-[state=active]:bg-[#007BFF]  text-white"
						>
							Projects
						</TabsTrigger>
						<TabsTrigger
							value="activity"
							className="data-[state=active]:bg-[#007BFF]  text-white"
						>
							Activity
						</TabsTrigger>
					</TabsList>

					<TabsContent value="skills" className="space-y-6">
						<Card className="glass border-white/10 p-6">
							<h3 className="text-xl text-white mb-4">
								Technical Skills
							</h3>
							<div className="flex flex-wrap gap-3">
								{user?.skills &&
									user?.skills.map((skill) => (
										<Badge
											key={skill}
											className="bg-linear-to-r from-[#007BFF]/20 to-[#8A2BE2]/20 border border-[#007BFF]/30 px-4 py-2"
										>
											{skill}
										</Badge>
									))}
							</div>
						</Card>

						<Card className="glass border-white/10 p-6">
							<h3 className="text-xl text-white mb-4">
								Interests
							</h3>
							<div className="flex flex-wrap gap-3">
								{[
									"Web Development",
									"Open Source",
									"DevOps",
									"AI/ML",
								].map((interest) => (
									<Badge
										key={interest}
										variant="outline"
										className="border-white/20 px-4 text-white py-2"
									>
										{interest}
									</Badge>
								))}
							</div>
						</Card>
					</TabsContent>

					<TabsContent value="projects" className="space-y-6">
						{PROJECTS.map((project, index) => (
							<motion.div
								key={project.id}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: index * 0.1 }}
							>
								<Card className="glass border-white/10 p-6 hover:border-[#007BFF]/50 transition-colors">
									<div className="flex items-start justify-between mb-4">
										<div className="flex-1">
											<h3 className="text-xl text-white mb-2">
												{project.name}
											</h3>
											<p className="text-gray-400 mb-4">
												{project.description}
											</p>
											<div className="flex items-center gap-6 text-sm text-gray-400">
												<div className="flex items-center gap-2">
													<div
														className="w-3 h-3 rounded-full"
														style={{
															backgroundColor:
																project.color,
														}}
													/>
													{project.language}
												</div>
												<div className="flex items-center gap-1">
													<Star className="w-4 h-4" />
													{project.stars}
												</div>
												<div className="flex items-center gap-1">
													<GitFork className="w-4 h-4" />
													{project.forks}
												</div>
											</div>
										</div>
										<Button
											variant="outline"
											className="border-white/20 text-white bg-[#181819]"
										>
											View Project
										</Button>
									</div>
								</Card>
							</motion.div>
						))}
					</TabsContent>

					<TabsContent value="activity">
						<Card className="glass border-white/10 p-12 text-center">
							<Calendar className="w-16 h-16 text-[#007BFF] mx-auto mb-4" />
							<p className="text-gray-400">
								Activity timeline will appear here
							</p>
						</Card>
					</TabsContent>
				</Tabs>
			</motion.div>
		</div>
	);
}
