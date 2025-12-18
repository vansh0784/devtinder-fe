import { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { X, Heart, Star, MapPin, Code2 } from "lucide-react";
import {
	motion,
	useMotionValue,
	useTransform,
	AnimatePresence,
	type PanInfo,
} from "framer-motion";
import axios from "axios";
import { postApi } from "../utils/api"; // ✅ USE EXISTING API SETUP

// =========================
// INLINE API FUNCTIONS
// =========================
const swipeRight = async (receiverId: string) => {
	return await postApi<null, { statusCode: number; message: string }>(
		`/connection/right/${receiverId}`,
		null
	);
};

const swipeLeft = async (receiverId: string) => {
	return await postApi<null, { statusCode: number; message: string }>(
		`/connection/left/${receiverId}`,
		null
	);
};

// ⚠️ TEMP DATA — MUST BE REAL MONGO IDS
const DEVELOPERS = [
	{
		id: "66c9d21a9f3b4c8d1a4e1234", // 👈 REAL MongoDB _id
		name: "Emma Wilson",
		username: "@emmawilson",
		avatar:
			"https://images.unsplash.com/photo-1715029005043-e88d219a3c48?w=400",
		bio: "Frontend architect with a passion for creating beautiful, accessible user experiences",
		location: "New York, NY",
		skills: ["React", "TypeScript", "TailwindCSS", "Next.js", "Figma"],
		githubStars: 2340,
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

			if (res?.message?.includes("Match")) {
				alert("🎉 It's a Match!");
			}

			setMatches((prev) => [...prev, currentDev.id]);
			nextCard();
		} catch (err: unknown) {
			console.error("SWIPE ERROR:", err);

			if (axios.isAxiosError(err)) {
				alert(
					err.response?.data?.message ||
						`Request failed (${err.response?.status})`
				);
			} else {
				alert("Unknown error occurred");
			}
		} finally {
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
				alert(
					err.response?.data?.message ||
						`Request failed (${err.response?.status})`
				);
			} else {
				alert("Unknown error occurred");
			}
		} finally {
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
					<div className="flex gap-8 justify-center">
						<div>
							<div className="text-2xl text-white">
								{matches.length}
							</div>
							<div className="text-gray-400 text-sm">
								Liked
							</div>
						</div>
						<div>
							<div className="text-2xl text-white">
								{passes.length}
							</div>
							<div className="text-gray-400 text-sm">
								Passed
							</div>
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
						<motion.div
							key={currentDev.id}
							style={{ x, rotate, opacity }}
							drag="x"
							dragConstraints={{ left: 0, right: 0 }}
							onDragEnd={handleDragEnd}
							className="absolute w-full"
						>
							<div className="overflow-hidden rounded-xl border border-white/10 bg-[#1C1C1E] shadow-2xl">
								<div
									className={`h-40 bg-linear-to-r${currentDev.gradient} relative`}
								>
									<div className="absolute inset-0 flex items-center justify-center opacity-20">
										<Code2 className="h-32 w-32 text-white" />
									</div>
								</div>

								<div className="relative -mt-16 px-6">
									<Avatar className="mx-auto h-32 w-32 border-4 border-[#1C1C1E] shadow-2xl">
										<AvatarImage src={currentDev.avatar} />
										<AvatarFallback>
											{currentDev.name[0]}
										</AvatarFallback>
									</Avatar>
								</div>

								<div className="p-6 pt-4 text-center">
									<h2 className="text-2xl text-white">
										{currentDev.name}
									</h2>
									<p className="mb-4 text-gray-400">
										{currentDev.username}
									</p>
									<p className="mb-4 text-gray-300">
										{currentDev.bio}
									</p>

									<div className="flex justify-center gap-4 text-sm text-gray-400">
										<div className="flex items-center gap-1">
											<MapPin className="h-4 w-4" />
											{currentDev.location}
										</div>
										<div className="flex items-center gap-1">
											<Star className="h-4 w-4 text-yellow-500" />
											{currentDev.githubStars}
										</div>
									</div>

									<div className="mt-4 flex flex-wrap justify-center gap-2">
										{currentDev.skills.map((skill) => (
											<Badge key={skill}>{skill}</Badge>
										))}
									</div>
								</div>
							</div>
						</motion.div>
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
