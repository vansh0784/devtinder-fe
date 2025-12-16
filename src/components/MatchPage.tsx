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
import axios from "axios";
import { swipeRight, swipeLeft } from "../api/api.connection";

const DEVELOPERS = [
	{
		id: "1", // later replace with Mongo _id
		name: "Emma Wilson",
		username: "@emmawilson",
		avatar:
			"https://images.unsplash.com/photo-1715029005043-e88d219a3c48?w=400",
		bio: "Frontend architect with a passion for creating beautiful, accessible user experiences",
		location: "New York, NY",
		skills: ["React", "TypeScript", "TailwindCSS", "Next.js", "Figma"],
		interests: ["UI/UX Design", "Web Accessibility", "Open Source"],
		githubStars: 2340,
		projects: 28,
		gradient: "from-[#FF6B6B] to-[#FFE66D]",
	},
];

export function MatchPage() {
	const [currentIndex, setCurrentIndex] = useState(0);
	const [matches, setMatches] = useState<string[]>([]);
	const [passes, setPasses] = useState<string[]>([]);
	const [isSwiping, setIsSwiping] = useState(false);

	const currentDev = DEVELOPERS[currentIndex];

	const x = useMotionValue(0);
	const rotate = useTransform(x, [-200, 200], [-25, 25]);
	const opacity = useTransform(
		x,
		[-200, -100, 0, 100, 200],
		[0, 1, 1, 1, 0]
	);

	// =========================
	// DRAG END
	// =========================
	const handleDragEnd = (
		_: MouseEvent | TouchEvent | PointerEvent,
		info: PanInfo
	) => {
		if (Math.abs(info.offset.x) > 100 && !isSwiping) {
			if (info.offset.x > 0) {
				handleLike();
			} else {
				handlePass();
			}
		}
	};

	// =========================
	// RIGHT SWIPE
	// =========================
	const handleLike = async () => {
		if (!currentDev || isSwiping) return;

		try {
			setIsSwiping(true);

			const res = await swipeRight(currentDev.id);

			if (res?.data?.message?.includes("Match")) {
				alert("🎉 It's a Match!");
			}

			setMatches((prev) => [...prev, currentDev.id]);
			nextCard();
		} catch (err: unknown) {
	console.error("SWIPE ERROR:", err);

	if (axios.isAxiosError(err)) {
		console.error("STATUS:", err.response?.status);
		console.error("DATA:", err.response?.data);
		console.error("HEADERS:", err.response?.headers);

		alert(
			err.response?.data?.message ||
			`Request failed with status ${err.response?.status}`
		);
	} else {
		alert("Unknown error occurred");
	}
}
finally {
			setIsSwiping(false);
		}
	};

	// =========================
	// LEFT SWIPE
	// =========================
	const handlePass = async () => {
		if (!currentDev || isSwiping) return;

		try {
			setIsSwiping(true);

			await swipeLeft(currentDev.id);
			setPasses((prev) => [...prev, currentDev.id]);
			nextCard();
		} catch (err: unknown) {
	console.error("SWIPE ERROR:", err);

	if (axios.isAxiosError(err)) {
		console.error("STATUS:", err.response?.status);
		console.error("DATA:", err.response?.data);
		console.error("HEADERS:", err.response?.headers);

		alert(
			err.response?.data?.message ||
			`Request failed with status ${err.response?.status}`
		);
	} else {
		alert("Unknown error occurred");
	}
}
finally {
			setIsSwiping(false);
		}
	};

	// =========================
	// NEXT CARD
	// =========================
	const nextCard = () => {
		setTimeout(() => {
			setCurrentIndex((prev) => prev + 1);
			x.set(0);
		}, 250);
	};

	// =========================
	// END STATE
	// =========================
	if (currentIndex >= DEVELOPERS.length) {
		return (
			<div className="flex min-h-screen items-center justify-center p-6">
				<div className="text-center">
					<h2 className="mb-4 text-3xl text-white">
						No More Profiles
					</h2>
					<div className="flex justify-center gap-8">
						<div>
							<div className="text-2xl text-white">
								{matches.length}
							</div>
							<div className="text-sm text-gray-400">Liked</div>
						</div>
						<div>
							<div className="text-2xl text-white">
								{passes.length}
							</div>
							<div className="text-sm text-gray-400">Passed</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	// =========================
	// MAIN UI
	// =========================
	return (
		<div className="flex min-h-screen items-center justify-center p-6">
			<div className="w-full max-w-md">
				<div className="mb-8 text-center">
					<h1 className="mb-2 text-3xl text-white">
						Find Your Match
					</h1>
					<p className="text-gray-400">
						Swipe right to connect, left to pass
					</p>
				</div>

				<div className="relative flex h-[600px] items-center justify-center">
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
									animate={{ scale: 1, opacity: 1 }}
									exit={{ scale: 0.9, opacity: 0 }}
								>
									<div className="overflow-hidden rounded-xl border border-white/10 bg-[#1C1C1E] shadow-2xl">
										<div
											className={`h-40 bg-linear-to-r${dev.gradient} relative`}
										>
											<div className="absolute inset-0 flex items-center justify-center opacity-20">
												<Code2 className="h-32 w-32 text-white" />
											</div>
										</div>

										<div className="relative -mt-16 px-6">
											<Avatar className="mx-auto h-32 w-32 border-4 border-[#1C1C1E] shadow-2xl">
												<AvatarImage src={dev.avatar} />
												<AvatarFallback>
													{dev.name[0]}
												</AvatarFallback>
											</Avatar>
										</div>

										<div className="p-6 pt-4">
											<h2 className="mb-1 text-center text-2xl text-white">
												{dev.name}
											</h2>
											<p className="mb-4 text-center text-gray-400">
												{dev.username}
											</p>

											<p className="mb-4 text-center text-gray-300">
												{dev.bio}
											</p>

											<div className="mb-4 flex justify-center gap-4 text-sm text-gray-400">
												<div className="flex items-center gap-1">
													<MapPin className="h-4 w-4" />
													{dev.location}
												</div>
												<div className="flex items-center gap-1">
													<Star className="h-4 w-4 text-yellow-500" />
													{dev.githubStars}
												</div>
											</div>

											<div className="flex flex-wrap justify-center gap-2">
												{dev.skills.map((skill) => (
													<Badge key={skill}>
														{skill}
													</Badge>
												))}
											</div>
										</div>
									</div>
								</motion.div>
							)
						)}
					</AnimatePresence>
				</div>

				<div className="mt-8 flex justify-center gap-6">
					<button
						onClick={handlePass}
						disabled={isSwiping}
						className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-red-500"
					>
						<X className="h-8 w-8 text-red-500" />
					</button>

					<button
						onClick={handleLike}
						disabled={isSwiping}
						className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-[#007BFF] to-[#8A2BE2]"
					>
						<Heart className="h-10 w-10 text-white" />
					</button>
				</div>
			</div>
		</div>
	);
}
