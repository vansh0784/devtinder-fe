import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
	Home,
	Heart,
	MessageCircle,
	User,
	Bell,
	Settings,
	Code2,
} from "lucide-react";
import { useNotifications } from "../context/NotificationContext";

export function AppLayout() {
	const navigate = useNavigate();
	const location = useLocation();
	const { notifications } = useNotifications();
	const currentPath = location.pathname.replace("/", "") || "home";

	const navItems = [
		{ id: "home", icon: Home, label: "Feed" },
		{ id: "match", icon: Heart, label: "Match" },
		{ id: "chat", icon: MessageCircle, label: "Chats" },
		{ id: "code-editor", icon: Code2, label: "Code Editor" },
		{ id: "profile", icon: User, label: "Profile" },
	];

	return (
		<div className="min-h-screen bg-[#121212] flex">
			<motion.aside
				initial={{ x: -100, opacity: 0 }}
				animate={{ x: 0, opacity: 1 }}
				className="fixed left-0 top-0 h-full w-20 glass border-r border-white/10 flex flex-col items-center py-6 z-50"
			>
				<button
					onClick={() => navigate("/home")}
					className="mb-8 p-3 rounded-xl bg-linear-to-br from-[#007BFF] to-[#8A2BE2] hover:scale-110 transition-transform"
				>
					<span className="text-xl">{"</>"}</span>
				</button>
				<nav className="flex-1 flex flex-col gap-4">
					{navItems.map((item) => (
						<button
							key={item.id}
							onClick={() => navigate(`/${item.id}`)}
							className={`relative p-3 rounded-xl transition-all group ${currentPath === item.id
									? "bg-[#007BFF] text-white"
									: "text-gray-400 hover:text-white hover:bg-white/10"
								}`}
						>
							<item.icon className="w-6 h-6" />
							{currentPath === item.id && (
								<motion.div
									layoutId="activeNav"
									className="absolute inset-0 bg-[#007BFF] rounded-xl -z-10"
									transition={{
										type: "spring",
										bounce: 0.2,
										duration: 0.6,
									}}
								/>
							)}
							<span className="absolute left-full ml-4 px-3 py-1 bg-[#1C1C1E] rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
								{item.label}
							</span>
						</button>
					))}
				</nav>
				<div className="flex flex-col gap-4">
					<button
						onClick={() => navigate("/notifications")}
						className={`relative p-3 rounded-xl transition-all ${currentPath === "notifications"
								? "bg-[#007BFF] text-white"
								: "text-gray-400 hover:text-white hover:bg-white/10"
							}`}
					>
						<Bell className="w-6 h-6" />
						{notifications.length > 0 && (
							<span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs">
								{notifications.length}
							</span>
						)}

					</button>
					<button
						onClick={() => navigate("/settings")}
						className={`p-3 rounded-xl transition-all ${currentPath === "settings"
								? "bg-[#007BFF] text-white"
								: "text-gray-400 hover:text-white hover:bg-white/10"
							}`}
					>
						<Settings className="w-6 h-6" />
					</button>
				</div>
			</motion.aside>
			<main className="flex-1 ml-20">
				<Outlet />
			</main>
		</div>
	);
}
