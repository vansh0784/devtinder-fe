import { Button } from "./ui/button";
import { Code2, Home } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export function NotFoundPage() {
	const onNavigate = useNavigate();
	return (
		<div className="min-h-screen bg-linear-to-br from-[#121212] via-[#1C1C1E] to-[#121212] flex items-center justify-center p-6 relative overflow-hidden">
			<div className="absolute inset-0 overflow-hidden opacity-20">
				<div className="absolute top-1/4 left-1/4 text-9xl text-white/10 font-mono">
					404
				</div>
				<div className="absolute bottom-1/4 right-1/4 text-6xl text-white/10">
					{"</>"}
				</div>
			</div>

			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className="text-center relative z-10 max-w-2xl"
			>
				<motion.div
					initial={{ scale: 0 }}
					animate={{ scale: 1 }}
					transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
					className="mb-8"
				>
					<div className="w-32 h-32 mx-auto bg-linear-to-br from-[#007BFF] to-[#8A2BE2] rounded-3xl flex items-center justify-center relative">
						<Code2 className="w-16 h-16 text-white" />
						<div className="absolute inset-0 bg-linear-to-br from-[#007BFF] to-[#8A2BE2] opacity-50 blur-2xl" />
					</div>
				</motion.div>
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.3 }}
					className="mb-6"
				>
					<h1 className="text-8xl mb-4">
						<span className="gradient-text">404</span>
					</h1>
					<h2 className="text-3xl text-white mb-4">Page Not Found</h2>
					<p className="text-xl text-gray-400 mb-2">
						Oops! This page seems to have a bug...
					</p>
					<p className="text-gray-500">
						The page you're looking for doesn't exist or has been
						moved.
					</p>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4 }}
					className="glass rounded-2xl p-6 mb-8 text-left"
				>
					<pre className="text-sm">
						<code className="text-gray-400">
							<span className="text-[#8A2BE2]">const</span>{" "}
							<span className="text-[#007BFF]">error</span> ={" "}
							{"{\n"}
							{"  "}status:{" "}
							<span className="text-yellow-500">404</span>,{"\n"}
							{"  "}message:{" "}
							<span className="text-green-400">
								"Page not found"
							</span>
							,{"\n"}
							{"  "}suggestion:{" "}
							<span className="text-green-400">
								"Try going back home"
							</span>
							{"\n"}
							{"}"};
						</code>
					</pre>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.5 }}
					className="flex flex-col sm:flex-row gap-4 justify-center"
				>
					<Button
						size="lg"
						className="bg-linear-to-r from-[#007BFF] to-[#8A2BE2] hover:opacity-90"
						onClick={() => onNavigate("/home")}
					>
						<Home className="w-5 h-5 mr-2" />
						Go Home
					</Button>
					<Button
						size="lg"
						variant="outline"
						className="border-white/20 text-white bg-white/10"
						onClick={() => window.history.back()}
					>
						Go Back
					</Button>
				</motion.div>

				<motion.p
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.6 }}
					className="mt-8 text-sm text-gray-500"
				></motion.p>
			</motion.div>
		</div>
	);
}
