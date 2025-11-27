import { useState } from "react";
import { Card } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
	Users,
	MessageCircle,
	CheckCircle2,
	Circle,
	Clock,
	MoreVertical,
	Plus,
} from "lucide-react";
import { motion } from "framer-motion";

const PROJECT_DATA = {
	name: "DevTinder Mobile App",
	description: "Building the mobile version of DevTinder",
	members: [
		{
			id: 1,
			name: "Alex Johnson",
			avatar: "https://images.unsplash.com/photo-1715029005043-e88d219a3c48?w=100",
			role: "Lead",
		},
		{
			id: 2,
			name: "Emma Wilson",
			avatar: "https://images.unsplash.com/photo-1715029005043-e88d219a3c48?w=100",
			role: "Developer",
		},
		{
			id: 3,
			name: "Marcus Chen",
			avatar: "https://images.unsplash.com/photo-1715029005043-e88d219a3c48?w=100",
			role: "Developer",
		},
	],
};

const TASKS = {
	todo: [
		{
			id: 1,
			title: "Design authentication flow",
			assignee: "Emma Wilson",
			priority: "high",
		},
		{
			id: 2,
			title: "Set up Firebase backend",
			assignee: "Marcus Chen",
			priority: "high",
		},
		{
			id: 3,
			title: "Create component library",
			assignee: "Alex Johnson",
			priority: "medium",
		},
	],
	inProgress: [
		{
			id: 4,
			title: "Implement swipe mechanism",
			assignee: "Emma Wilson",
			priority: "high",
		},
		{
			id: 5,
			title: "Build chat interface",
			assignee: "Marcus Chen",
			priority: "medium",
		},
	],
	done: [
		{
			id: 6,
			title: "Project setup",
			assignee: "Alex Johnson",
			priority: "high",
		},
		{
			id: 7,
			title: "Initial design mockups",
			assignee: "Emma Wilson",
			priority: "medium",
		},
	],
};

const CHAT_MESSAGES = [
	{
		id: 1,
		sender: "Emma Wilson",
		message: "Just pushed the auth flow designs!",
		time: "10:30 AM",
	},
	{
		id: 2,
		sender: "Marcus Chen",
		message: "Firebase setup is complete 🚀",
		time: "11:15 AM",
	},
	{
		id: 3,
		sender: "Alex Johnson",
		message: "Great work everyone! Let's sync up tomorrow.",
		time: "2:45 PM",
	},
];

export function ProjectRoom() {
	const [newTask, setNewTask] = useState("");
	const [newMessage, setNewMessage] = useState("");

	const getPriorityColor = (priority: string) => {
		switch (priority) {
			case "high":
				return "bg-red-500/20 text-red-400 border-red-500/30";
			case "medium":
				return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
			case "low":
				return "bg-green-500/20 text-green-400 border-green-500/30";
			default:
				return "bg-gray-500/20 text-gray-400 border-gray-500/30";
		}
	};

	return (
		<div className="min-h-screen p-6">
			<div className="max-w-7xl mx-auto">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="mb-8"
				>
					<div className="glass rounded-3xl p-6 border border-white/10">
						<div className="flex items-start justify-between mb-4">
							<div className="flex-1">
								<h1 className="text-3xl text-white mb-2">
									{PROJECT_DATA.name}
								</h1>
								<p className="text-gray-400">
									{PROJECT_DATA.description}
								</p>
							</div>
							<Button className="bg-linear-to-r from-[#007BFF] to-[#8A2BE2]">
								<Plus className="w-4 h-4 mr-2" />
								Invite Member
							</Button>
						</div>
						<div className="flex items-center gap-4">
							<div className="flex items-center gap-2 text-gray-400">
								<Users className="w-4 h-4" />
								<span className="text-sm">Team Members:</span>
							</div>
							<div className="flex -space-x-2">
								{PROJECT_DATA.members.map((member) => (
									<Avatar
										key={member.id}
										className="w-8 h-8 border-2 border-[#121212]"
									>
										<AvatarImage
											src={member.avatar}
											alt={member.name}
										/>
										<AvatarFallback>
											{member.name[0]}
										</AvatarFallback>
									</Avatar>
								))}
							</div>
							<span className="text-sm text-gray-400">
								{PROJECT_DATA.members.length} members
							</span>
						</div>
					</div>
				</motion.div>
				<div className="grid lg:grid-cols-3 gap-6">
					<div className="lg:col-span-2">
						<Tabs defaultValue="board" className="space-y-6">
							<TabsList className="bg-white/5 border border-white/10">
								<TabsTrigger
									value="board"
									className="data-[state=active]:bg-[#007BFF]"
								>
									Board
								</TabsTrigger>
								<TabsTrigger
									value="list"
									className="data-[state=active]:bg-[#007BFF]"
								>
									List View
								</TabsTrigger>
							</TabsList>

							<TabsContent value="board">
								<div className="grid md:grid-cols-3 gap-4">
									<div className="space-y-4">
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-2">
												<Circle className="w-4 h-4 text-gray-400" />
												<h3 className="text-white">
													To Do
												</h3>
												<Badge
													variant="outline"
													className="border-white/20"
												>
													{TASKS.todo.length}
												</Badge>
											</div>
											<Button
												size="sm"
												variant="ghost"
												className="text-gray-400 hover:text-white"
											>
												<Plus className="w-4 h-4" />
											</Button>
										</div>
										<div className="space-y-3">
											{TASKS.todo.map((task, index) => (
												<motion.div
													key={task.id}
													initial={{
														opacity: 0,
														y: 10,
													}}
													animate={{
														opacity: 1,
														y: 0,
													}}
													transition={{
														delay: index * 0.1,
													}}
												>
													<Card className="glass border-white/10 p-4 hover:border-[#007BFF]/50 transition-colors cursor-pointer">
														<div className="flex items-start justify-between mb-3">
															<h4 className="text-white text-sm">
																{task.title}
															</h4>
															<Button
																size="sm"
																variant="ghost"
																className="h-6 w-6 p-0 text-gray-400"
															>
																<MoreVertical className="w-4 h-4" />
															</Button>
														</div>
														<div className="flex items-center justify-between">
															<Badge
																className={getPriorityColor(
																	task.priority
																)}
															>
																{task.priority}
															</Badge>
															<Avatar className="w-6 h-6">
																<AvatarFallback className="text-xs">
																	{task.assignee
																		.split(
																			" "
																		)
																		.map(
																			(
																				n
																			) =>
																				n[0]
																		)
																		.join(
																			""
																		)}
																</AvatarFallback>
															</Avatar>
														</div>
													</Card>
												</motion.div>
											))}
										</div>
									</div>
									<div className="space-y-4">
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-2">
												<Clock className="w-4 h-4 text-[#007BFF]" />
												<h3 className="text-white">
													In Progress
												</h3>
												<Badge
													variant="outline"
													className="border-white/20"
												>
													{TASKS.inProgress.length}
												</Badge>
											</div>
											<Button
												size="sm"
												variant="ghost"
												className="text-gray-400 hover:text-white"
											>
												<Plus className="w-4 h-4" />
											</Button>
										</div>
										<div className="space-y-3">
											{TASKS.inProgress.map(
												(task, index) => (
													<motion.div
														key={task.id}
														initial={{
															opacity: 0,
															y: 10,
														}}
														animate={{
															opacity: 1,
															y: 0,
														}}
														transition={{
															delay: index * 0.1,
														}}
													>
														<Card className="glass border-[#007BFF]/30 p-4 hover:border-[#007BFF] transition-colors cursor-pointer">
															<div className="flex items-start justify-between mb-3">
																<h4 className="text-white text-sm">
																	{task.title}
																</h4>
																<Button
																	size="sm"
																	variant="ghost"
																	className="h-6 w-6 p-0 text-gray-400"
																>
																	<MoreVertical className="w-4 h-4" />
																</Button>
															</div>
															<div className="flex items-center justify-between">
																<Badge
																	className={getPriorityColor(
																		task.priority
																	)}
																>
																	{
																		task.priority
																	}
																</Badge>
																<Avatar className="w-6 h-6">
																	<AvatarFallback className="text-xs">
																		{task.assignee
																			.split(
																				" "
																			)
																			.map(
																				(
																					n
																				) =>
																					n[0]
																			)
																			.join(
																				""
																			)}
																	</AvatarFallback>
																</Avatar>
															</div>
														</Card>
													</motion.div>
												)
											)}
										</div>
									</div>
									<div className="space-y-4">
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-2">
												<CheckCircle2 className="w-4 h-4 text-green-500" />
												<h3 className="text-white">
													Done
												</h3>
												<Badge
													variant="outline"
													className="border-white/20"
												>
													{TASKS.done.length}
												</Badge>
											</div>
											<Button
												size="sm"
												variant="ghost"
												className="text-gray-400 hover:text-white"
											>
												<Plus className="w-4 h-4" />
											</Button>
										</div>
										<div className="space-y-3">
											{TASKS.done.map((task, index) => (
												<motion.div
													key={task.id}
													initial={{
														opacity: 0,
														y: 10,
													}}
													animate={{
														opacity: 1,
														y: 0,
													}}
													transition={{
														delay: index * 0.1,
													}}
												>
													<Card className="glass border-white/10 p-4 opacity-75 hover:opacity-100 transition-opacity cursor-pointer">
														<div className="flex items-start justify-between mb-3">
															<h4 className="text-white text-sm line-through">
																{task.title}
															</h4>
															<Button
																size="sm"
																variant="ghost"
																className="h-6 w-6 p-0 text-gray-400"
															>
																<MoreVertical className="w-4 h-4" />
															</Button>
														</div>
														<div className="flex items-center justify-between">
															<Badge
																className={getPriorityColor(
																	task.priority
																)}
															>
																{task.priority}
															</Badge>
															<Avatar className="w-6 h-6">
																<AvatarFallback className="text-xs">
																	{task.assignee
																		.split(
																			" "
																		)
																		.map(
																			(
																				n
																			) =>
																				n[0]
																		)
																		.join(
																			""
																		)}
																</AvatarFallback>
															</Avatar>
														</div>
													</Card>
												</motion.div>
											))}
										</div>
									</div>
								</div>
							</TabsContent>

							<TabsContent value="list">
								<Card className="glass border-white/10 p-12 text-center">
									<p className="text-gray-400">
										List view coming soon
									</p>
								</Card>
							</TabsContent>
						</Tabs>
					</div>
					<div className="lg:col-span-1">
						<Card className="glass border-white/10 p-6 h-[600px] flex flex-col">
							<div className="flex items-center gap-2 mb-6">
								<MessageCircle className="w-5 h-5 text-[#007BFF]" />
								<h3 className="text-white">Team Chat</h3>
							</div>

							<div className="flex-1 space-y-4 overflow-y-auto mb-4">
								{CHAT_MESSAGES.map((msg) => (
									<div key={msg.id} className="space-y-1">
										<div className="flex items-center gap-2">
											<span className="text-sm text-[#007BFF]">
												{msg.sender}
											</span>
											<span className="text-xs text-gray-500">
												{msg.time}
											</span>
										</div>
										<p className="text-sm text-gray-300">
											{msg.message}
										</p>
									</div>
								))}
							</div>

							<div className="flex gap-2">
								<Input
									value={newMessage}
									onChange={(e) =>
										setNewMessage(e.target.value)
									}
									placeholder="Type a message..."
									className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
								/>
								<Button size="icon" className="bg-[#007BFF]">
									<MessageCircle className="w-4 h-4" />
								</Button>
							</div>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
}
