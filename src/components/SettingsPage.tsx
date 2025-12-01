import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
	User,
	Bell,
	Shield,
	Moon,
	Sun,
	Github,
	Trash2,
} from "lucide-react";
import { motion } from "framer-motion";


// interface IUpdateUser {
//   firstname?: string;
//   lastname?: string;
//   username?: string;
//   email?: string;
//   bio?: string;
//   image?: File;
// }


export function SettingsPage() {
	const [darkMode, setDarkMode] = useState(true);
	const [notifications, setNotifications] = useState({
		matches: true,
		messages: true,
		comments: true,
		followers: false,
	});

	return (
		<div className="min-h-screen p-6 max-w-4xl mx-auto">
			<div className="mb-8">
				<h1 className="text-3xl text-white mb-2">Settings</h1>
				<p className="text-gray-400">
					Manage your account and preferences
				</p>
			</div>
			<Tabs defaultValue="profile" className="space-y-6">
				<TabsList className="bg-white/5 border border-white/10">
					<TabsTrigger
						value="profile"
						className="data-[state=active]:bg-[#007BFF] text-white"
					>
						<User className="w-4 h-4 mr-2" />
						Profile
					</TabsTrigger>
					<TabsTrigger
						value="notifications"
						className="data-[state=active]:bg-[#007BFF] text-white"
					>
						<Bell className="w-4 h-4 mr-2" />
						Notifications
					</TabsTrigger>
					<TabsTrigger
						value="privacy"
						className="data-[state=active]:bg-[#007BFF] text-white"
					>
						<Shield className="w-4 h-4 mr-2" />
						Privacy
					</TabsTrigger>
				</TabsList>
				<TabsContent value="profile" className="space-y-6">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
					>
						<Card className="glass border-white/10 p-6">
							<h3 className="text-xl text-white mb-6">
								Profile Information
							</h3>
							<div className="flex items-center gap-6 mb-8">
								<Avatar className="w-24 h-24 border-4 border-[#007BFF]">
									<AvatarImage
										src="https://images.unsplash.com/photo-1715029005043-e88d219a3c48?w=200"
										alt="Profile"
									/>
									<AvatarFallback>AJ</AvatarFallback>
								</Avatar>
								<div>
									<Button className="bg-linear-to-r from-[#007BFF] to-[#8A2BE2] mb-2">
										Change Avatar
									</Button>
									<p className="text-sm text-gray-400">
										JPG, PNG or GIF (max. 2MB)
									</p>
								</div>
							</div>
							<div className="space-y-4 text-white">
								<div className="grid md:grid-cols-2 gap-4 ">
									<div className="space-y-2">
										<Label htmlFor="firstName">
											First Name
										</Label>
										<Input
											id="firstName"
											defaultValue="Alex"
											className="bg-white/5 border-white/10 text-white"
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="lastName">
											Last Name
										</Label>
										<Input
											id="lastName"
											defaultValue="Johnson"
											className="bg-white/5 border-white/10 text-white"
										/>
									</div>
								</div>

								<div className="space-y-2">
									<Label htmlFor="username">Username</Label>
									<Input
										id="username"
										defaultValue="@alexjohnson"
										className="bg-white/5 border-white/10 text-white"
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="email">Email</Label>
									<Input
										id="email"
										type="email"
										defaultValue="alex@devtinder.com"
										className="bg-white/5 border-white/10 text-white"
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="bio">Bio</Label>
									<textarea
										id="bio"
										rows={4}
										defaultValue="Full-stack developer passionate about building tools that make developers' lives easier."
										className="w-full rounded-xl bg-white/5 border border-white/10 text-white p-3 resize-none"
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="location">Location</Label>
									<Input
										id="location"
										defaultValue="San Francisco, CA"
										className="bg-white/5 border-white/10 text-white"
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="website">Website</Label>
									<Input
										id="website"
										defaultValue="alexjohnson.dev"
										className="bg-white/5 border-white/10 text-white"
									/>
								</div>
							</div>

							<div className="flex justify-end gap-3 mt-6">
								<Button
									variant="outline"
									className="border-white/20 bg-[#2f2f30] text-white"
								>
									Cancel
								</Button>
								<Button className="bg-linear-to-r from-[#007BFF] to-[#8A2BE2]">
									Save Changes
								</Button>
							</div>
						</Card>
					</motion.div>
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.1 }}
					>
						<Card className="glass border-white/10 p-6">
							<h3 className="text-xl text-white mb-6">
								Connected Accounts
							</h3>
							<div className="space-y-4">
								<div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
									<div className="flex items-center gap-3">
										<div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
											<Github className="w-6 h-6 text-black" />
										</div>
										<div>
											<p className="text-white">GitHub</p>
											<p className="text-sm text-gray-400">
												@alexjohnson
											</p>
										</div>
									</div>
									<Button
										variant="outline"
										className="border-white/20 bg-[#2f2f30] text-white"
									>
										Disconnect
									</Button>
								</div>

								<div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
									<div className="flex items-center gap-3">
										<div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
											<svg
												className="w-6 h-6"
												viewBox="0 0 24 24"
											>
												<path
													fill="#4285F4"
													d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
												/>
												<path
													fill="#34A853"
													d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
												/>
												<path
													fill="#FBBC05"
													d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
												/>
												<path
													fill="#EA4335"
													d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
												/>
											</svg>
										</div>
										<div>
											<p className="text-white">Google</p>
											<p className="text-sm text-gray-400">
												alex@gmail.com
											</p>
										</div>
									</div>
									<Button
										variant="outline"
										className="border-white/20 bg-[#2f2f30] text-white"
									>
										Disconnect
									</Button>
								</div>
							</div>
						</Card>
					</motion.div>
				</TabsContent>
				<TabsContent value="notifications" className="space-y-6">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
					>
						<Card className="glass border-white/10 p-6">
							<h3 className="text-xl text-white mb-6">
								Notification Preferences
							</h3>
							<div className="space-y-6">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-white">
											New Matches
										</p>
										<p className="text-sm text-gray-400">
											Get notified when someone matches
											with you
										</p>
									</div>
									<Switch
										checked={notifications.matches}
										onCheckedChange={(checked) =>
											setNotifications({
												...notifications,
												matches: checked,
											})
										}
									/>
								</div>

								<div className="flex items-center justify-between">
									<div>
										<p className="text-white">Messages</p>
										<p className="text-sm text-gray-400">
											Get notified about new messages
										</p>
									</div>
									<Switch
										checked={notifications.messages}
										onCheckedChange={(checked) =>
											setNotifications({
												...notifications,
												messages: checked,
											})
										}
									/>
								</div>

								<div className="flex items-center justify-between">
									<div>
										<p className="text-white">Comments</p>
										<p className="text-sm text-gray-400">
											Get notified when someone comments
											on your posts
										</p>
									</div>
									<Switch
										checked={notifications.comments}
										onCheckedChange={(checked) =>
											setNotifications({
												...notifications,
												comments: checked,
											})
										}
									/>
								</div>

								<div className="flex items-center justify-between">
									<div>
										<p className="text-white">
											New Followers
										</p>
										<p className="text-sm text-gray-400">
											Get notified when someone follows
											you
										</p>
									</div>
									<Switch
										checked={notifications.followers}
										onCheckedChange={(checked) =>
											setNotifications({
												...notifications,
												followers: checked,
											})
										}
									/>
								</div>
							</div>
						</Card>
					</motion.div>
				</TabsContent>
				<TabsContent value="privacy" className="space-y-6">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
					>
						<Card className="glass border-white/10 p-6">
							<h3 className="text-xl text-white mb-6">
								Privacy & Security
							</h3>
							<div className="space-y-6">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-white">
											Private Profile
										</p>
										<p className="text-sm text-gray-400">
											Only people you follow can see your
											profile
										</p>
									</div>
									<Switch />
								</div>

								<div className="flex items-center justify-between">
									<div>
										<p className="text-white">
											Show Online Status
										</p>
										<p className="text-sm text-gray-400">
											Let others see when you're online
										</p>
									</div>
									<Switch defaultChecked />
								</div>

								<div className="flex items-center justify-between">
									<div>
										<p className="text-white">
											Show GitHub Activity
										</p>
										<p className="text-sm text-gray-400">
											Display your GitHub contributions
										</p>
									</div>
									<Switch defaultChecked />
								</div>

								<div className="pt-6 border-t border-white/10">
									<Button
										variant="destructive"
										className="bg-red-500/20 text-red-400 border border-red-500/30"
									>
										<Trash2 className="w-4 h-4 mr-2" />
										Delete Account
									</Button>
								</div>
							</div>
						</Card>
					</motion.div>
				</TabsContent>
				<TabsContent value="appearance" className="space-y-6">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
					>
						<Card className="glass border-white/10 p-6">
							<h3 className="text-xl text-white mb-6">
								Theme Preferences
							</h3>
							<div className="space-y-6">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-white">Dark Mode</p>
										<p className="text-sm text-gray-400">
											Use dark theme across the app
										</p>
									</div>
									<div className="flex items-center gap-3">
										<Sun className="w-4 h-4 text-gray-400" />
										<Switch
											checked={darkMode}
											onCheckedChange={setDarkMode}
										/>
										<Moon className="w-4 h-4 text-[#007BFF]" />
									</div>
								</div>
							</div>
						</Card>
					</motion.div>
				</TabsContent>
			</Tabs>
		</div>
	);
}
