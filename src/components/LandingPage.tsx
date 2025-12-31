import { Button } from "./ui/button";
import {
	Code2,
	Users,
	Rocket,
	Zap,
	Globe,
	Target,
	Heart,
	Trophy,
} from "lucide-react";
import { motion } from "framer-motion";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useNavigate } from "react-router-dom";

export function LandingPage() {
	const onNavigate = useNavigate();
	const scrollToSection = (sectionId: string) => {
		const element = document.getElementById(sectionId);
		if (element) {
			element.scrollIntoView({ behavior: "smooth", block: "start" });
		}
	};

	return (
		<div className="min-h-screen overflow-hidden bg-linear-to-br from-[#121212] via-[#1C1C1E] to-[#121212] text-white">
			<nav className="glass fixed top-0 right-0 left-0 z-50">
				<div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
					<div
						className="flex cursor-pointer items-center gap-2"
						onClick={() =>
							window.scrollTo({ top: 0, behavior: "smooth" })
						}
					>
						<Code2 className="h-8 w-8 text-[#007BFF]" />
						<span className="gradient-text text-xl">DevTinder</span>
					</div>
					<div className="flex items-center gap-4">
						<Button
							variant="ghost"
							className="text-white  hover:text-[#007BFF]"
							onClick={() => scrollToSection("features")}
						>
							Features
						</Button>
						<Button
							variant="ghost"
							className="text-white hover:text-[#007BFF]"
							onClick={() => scrollToSection("about")}
						>
							About
						</Button>
						<Button
							variant="outline"
							className="border border-[#007BFF] bg-[#19191a] text-[#007BFF] hover:text-white"
							onClick={() => onNavigate("/auth")}
						>
							Sign In
						</Button>
					</div>
				</div>
			</nav>
			<section className="relative px-6 pt-32 pb-20">
				<div className="mx-auto max-w-7xl">
					<div className="grid items-center gap-12 lg:grid-cols-2">
						<motion.div
							initial={{ opacity: 0, x: -50 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.6 }}
						>
							<div className="glass-light mb-4 inline-block rounded-full px-4 py-2">
								<span className="text-sm text-[#007BFF]">
									🚀 Connect with 10,000+ developers
								</span>
							</div>
							<h1 className="mb-6 text-5xl lg:text-7xl">
								<span className="gradient-text">Connect.</span>{" "}
								<span className="gradient-text">
									Collaborate.
								</span>{" "}
								<span className="gradient-text">Code.</span>
							</h1>
							<p className="mb-8 max-w-xl text-xl text-gray-400">
								The ultimate social platform for developers to
								find collaborators, share projects, and build
								the future together.
							</p>
							<div className="flex flex-wrap gap-4">
								<Button
									size="lg"
									className="bg-linear-to-r from-[#007BFF] to-[#8A2BE2] px-8 text-white hover:opacity-90"
									onClick={() => onNavigate("auth")}
								>
									Join Now
								</Button>
								<Button
									size="lg"
									variant="outline"
									className="border border-white/20 bg-[#19191a] text-white hover:bg-white/10"
									onClick={() => onNavigate("home")}
								>
									Explore
								</Button>
							</div>

							<div className="mt-12 flex items-center gap-8">
								<div>
									<div className="gradient-text text-3xl">
										10K+
									</div>
									<div className="text-sm text-gray-400">
										Developers
									</div>
								</div>
								<div className="h-12 w-px bg-white/20" />
								<div>
									<div className="gradient-text text-3xl">
										5K+
									</div>
									<div className="text-sm text-gray-400">
										Projects
									</div>
								</div>
								<div className="h-12 w-px bg-white/20" />
								<div>
									<div className="gradient-text text-3xl">
										50+
									</div>
									<div className="text-sm text-gray-400">
										Countries
									</div>
								</div>
							</div>
						</motion.div>

						<motion.div
							initial={{ opacity: 0, x: 50 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.6, delay: 0.2 }}
							className="relative"
						>
							<div className="absolute inset-0 rounded-full bg-linear-to-r from-[#007BFF] to-[#8A2BE2] opacity-20 blur-3xl" />
							<div className="glass relative rounded-3xl p-8">
								<div className="aspect-square overflow-hidden rounded-2xl">
									<ImageWithFallback
										src="https://images.unsplash.com/photo-1566915896913-549d796d2166?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXZlbG9wZXIlMjBjb2RpbmclMjB3b3Jrc3BhY2V8ZW58MXx8fHwxNzYyMTcyOTU5fDA&ixlib=rb-4.1.0&q=80&w=1080"
										alt="Developer workspace"
										className="h-full w-full object-cover"
									/>
								</div>
								<div className="glass absolute -top-4 -right-4 rounded-2xl p-4 shadow-xl">
									<Code2 className="h-8 w-8 text-[#007BFF]" />
								</div>
								<div className="glass absolute -bottom-4 -left-4 rounded-2xl p-4 shadow-xl">
									<Rocket className="h-8 w-8 text-[#8A2BE2]" />
								</div>
							</div>
						</motion.div>
					</div>
				</div>
				<div className="absolute top-40 left-10 opacity-30">
					<div className="text-[#007BFF]">&lt;/&gt;</div>
				</div>
				<div className="absolute right-20 bottom-40 opacity-30">
					<div className="text-[#8A2BE2]">{"{ }"}</div>
				</div>
			</section>
			<section id="features" className="scroll-mt-20 px-6 py-20">
				<div className="mx-auto max-w-7xl">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6 }}
						viewport={{ once: true }}
						className="mb-16 text-center"
					>
						<h2 className="mb-4 text-4xl">
							Why Developers Love DevTinder
						</h2>
						<p className="text-xl text-gray-400">
							Everything you need to connect and collaborate
						</p>
					</motion.div>

					<div className="grid gap-8 md:grid-cols-3">
						{[
							{
								icon: Users,
								title: "Smart Matching",
								description:
									"Swipe to find developers with complementary skills and shared interests",
								color: "#007BFF",
							},
							{
								icon: Zap,
								title: "Real-time Collaboration",
								description:
									"Work together on projects with integrated chat and task management",
								color: "#8A2BE2",
							},
							{
								icon: Globe,
								title: "Global Network",
								description:
									"Connect with talented developers from around the world",
								color: "#6C63FF",
							},
						].map((feature, index) => (
							<motion.div
								key={index}
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								transition={{
									duration: 0.6,
									delay: index * 0.1,
								}}
								viewport={{ once: true }}
								className="glass group cursor-pointer rounded-2xl p-8 transition-transform hover:scale-105"
							>
								<div
									className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl"
									style={{
										backgroundColor: `${feature.color}20`,
									}}
								>
									<feature.icon
										className="h-6 w-6"
										style={{ color: feature.color }}
									/>
								</div>
								<h3 className="mb-3 text-xl">
									{feature.title}
								</h3>
								<p className="text-gray-400">
									{feature.description}
								</p>
							</motion.div>
						))}
					</div>
				</div>
			</section>
			<section
				id="about"
				className="scroll-mt-20 bg-linear-to-b from-transparent to-[#0A0A0A]/50 px-6 py-20"
			>
				<div className="mx-auto max-w-7xl">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6 }}
						viewport={{ once: true }}
						className="mb-16 text-center"
					>
						<h2 className="mb-4 text-4xl">About DevTinder</h2>
						<p className="mx-auto max-w-3xl text-xl text-gray-400">
							We're on a mission to revolutionize how developers
							connect, collaborate, and create amazing projects
							together
						</p>
					</motion.div>

					<div className="mb-16 grid gap-8 md:grid-cols-3">
						{[
							{
								icon: Target,
								title: "Our Mission",
								description:
									"Connecting developers worldwide to foster collaboration and innovation in the tech community",
								color: "#007BFF",
							},
							{
								icon: Heart,
								title: "Our Values",
								description:
									"Open collaboration, continuous learning, and building meaningful connections in tech",
								color: "#8A2BE2",
							},
							{
								icon: Trophy,
								title: "Our Vision",
								description:
									"Creating the most vibrant developer community where great ideas turn into reality",
								color: "#6C63FF",
							},
						].map((item, index) => (
							<motion.div
								key={index}
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								transition={{
									duration: 0.6,
									delay: index * 0.1,
								}}
								viewport={{ once: true }}
								className="glass rounded-2xl p-8 text-center"
							>
								<div
									className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl"
									style={{
										backgroundColor: `${item.color}20`,
									}}
								>
									<item.icon
										className="h-8 w-8"
										style={{ color: item.color }}
									/>
								</div>
								<h3 className="mb-3 text-xl">{item.title}</h3>
								<p className="text-gray-400">
									{item.description}
								</p>
							</motion.div>
						))}
					</div>

					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6 }}
						viewport={{ once: true }}
						className="glass rounded-3xl p-12 text-center"
					>
						<h3 className="mb-6 text-3xl">
							Built by Developers, for Developers
						</h3>
						<p className="mx-auto mb-8 max-w-3xl text-lg text-gray-400">
							DevTinder was created by a team of passionate
							developers who understand the challenges of finding
							the right collaborators. We combined the best
							aspects of professional networking, open-source
							collaboration, and modern matchmaking to create a
							platform that makes it easy to find your perfect
							development partner.
						</p>
						<div className="flex flex-wrap justify-center gap-6">
							<div className="text-center">
								<div className="gradient-text mb-1 text-2xl">
									2025
								</div>
								<div className="text-sm text-gray-400">
									Founded
								</div>
							</div>
							<div className="hidden h-12 w-px bg-white/20 sm:block" />
							<div className="text-center">
								<div className="gradient-text mb-1 text-2xl">
									50+
								</div>
								<div className="text-sm text-gray-400">
									Countries
								</div>
							</div>
							<div className="hidden h-12 w-px bg-white/20 sm:block" />
							<div className="text-center">
								<div className="gradient-text mb-1 text-2xl">
									10K+
								</div>
								<div className="text-sm text-gray-400">
									Active Users
								</div>
							</div>
							<div className="hidden h-12 w-px bg-white/20 sm:block" />
							<div className="text-center">
								<div className="gradient-text mb-1 text-2xl">
									5K+
								</div>
								<div className="text-sm text-gray-400">
									Projects Created
								</div>
							</div>
						</div>
					</motion.div>
				</div>
			</section>
			<section className="px-6 py-20">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
					viewport={{ once: true }}
					className="glass relative mx-auto max-w-4xl overflow-hidden rounded-3xl p-12 text-center"
				>
					<div className="absolute inset-0 bg-linear-to-r from-[#007BFF]/20 to-[#8A2BE2]/20" />
					<div className="relative z-10">
						<h2 className="mb-4 text-4xl">
							Ready to start building together?
						</h2>
						<p className="mb-8 text-xl text-gray-400">
							Join thousands of developers already collaborating
							on DevTinder
						</p>
						<Button
							size="lg"
							className="bg-linear-to-r from-[#007BFF] to-[#8A2BE2] px-12 text-white hover:opacity-90"
							onClick={() => onNavigate("auth")}
						>
							Get Started - It's Free
						</Button>
					</div>
				</motion.div>
			</section>
			<footer className="border-t border-white/10 px-6 py-12">
				<div className="mx-auto max-w-7xl text-center text-gray-400">
					<div className="mb-4 flex items-center justify-center gap-2">
						<Code2 className="h-6 w-6 text-[#007BFF]" />
						<span className="gradient-text">DevTinder</span>
					</div>
					<p>
						© 2025 DevTinder. Built for developers, by developers.
					</p>
				</div>
			</footer>
		</div>
	);
}
