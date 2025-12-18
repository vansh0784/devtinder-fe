import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Code2, Github } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { postApi, getApi } from "../utils/api";
import { socket } from "../utils/socket";
import { useAuth } from "../hooks/useAuth";
import { useAuth0 } from "@auth0/auth0-react";

interface IUser {
	_id: string;
	username: string;
	email: string;
}

interface ILoginResponse {
	statusCode: number;
	message: string;
	access_token?: string;
}

interface ICreateRequest {
	username: string;
	email: string;
	password: string;
}

interface IAuth0 {
	email: string | undefined;
	username: string | undefined;
	avatar: string | undefined;

}

interface ILoginRequest {
	email: string;
	password: string;
}

export function AuthPage() {
	const onNavigate = useNavigate();
	const { setUser } = useAuth();
	const { loginWithRedirect, isAuthenticated, user, isLoading } = useAuth0();

	const [loginData, setLoginData] = useState<ILoginRequest>({
		email: "",
		password: "",
	});

	const [signupData, setSignupData] = useState<ICreateRequest>({
		username: "",
		email: "",
		password: "",
	});

	const fetchUserProfile = async () => {
		try {
			const res = await getApi<IUser>("/user/profile");
			setUser(res);

			// Join chat room
			// if (user) {
			// 	const userId = user?._id;
			// 	const roomId = `global_chat`;
			// 	socket.emit("join_room", { roomId, userId });
			// 	console.log("Joined global_chat room");
			// }

			return user;
		} catch (err) {
			console.error("PROFILE FETCH ERROR:", err);
			return null;
		}
	};

	// --- HANDLERS ---
	// const handleLogin = async () => {
	//   try {
	//     console.log("🔐 LOGIN REQUEST:", loginData);
	//     const res = await postApi<ILoginRequest, ILoginResponse>("/user/login", loginData);
	//     console.log("✅ LOGIN RESPONSE:", res);

	//     if (saveToken(res)) {
	//       // Fetch user profile using saved token
	//       await fetchUserProfile();
	//       onNavigate("/home");
	//     }
	//   } catch (err) {
	//     console.error("❌ LOGIN ERROR:", err);
	//   }
	// };
	const handleLogin = async () => {
		try {
			await postApi<ILoginRequest, ILoginResponse>(
				"/user/login",
				loginData
			);
			onNavigate("/home");
			fetchUserProfile();
		} catch (err) {
			console.error(" LOGIN ERROR:", err);
		}
	};

	const handleRegister = async () => {
		try {
			await postApi<ICreateRequest, ILoginResponse>(
				"/user/register",
				signupData
			);
			onNavigate("/auth");
		} catch (err) {
			console.error(" REGISTER ERROR:", err);
		}
	};

	const handleAuth = async () => {
		try {
			await loginWithRedirect();
		} catch (err) {
			console.error("Auth0 login failed", err);
		}
	};

	//   useEffect(() => {
	//   if (isAuthenticated && user) {
	//     console.log("✅ Auth0 user logged in:", user);

	//     // TEMP: Just navigate user forward
	//     onNavigate("/home");
	//   }
	// }, [isAuthenticated, user]);

	useEffect(() => {
		const handleAuth0Login = async () => {
			if (!isAuthenticated || !user) return;

			try {
				const res = await postApi<IAuth0, ILoginResponse>(
					"/user/auth/google",
					{
						email: user.email,
						username: user.name,
						avatar: user.picture,
					}
				);

				console.log("BACKEND AUTH0 RESPONSE:", res);
			} catch (err) {
				console.error("Auth0 backend login failed", err);
			}
		};

		handleAuth0Login();
	}, [isAuthenticated, user]);

	// --- RENDER ---
	return (
		<div className="min-h-screen bg-linear-to-br from-[#121212] via-[#1C1C1E] to-[#121212] flex items-center justify-center p-6 relative overflow-hidden">
			<div className="absolute inset-0 overflow-hidden">
				<div className="absolute top-20 left-20 w-64 h-64 bg-[#007BFF] opacity-10 blur-3xl rounded-full" />
				<div className="absolute bottom-20 right-20 w-96 h-96 bg-[#8A2BE2] opacity-10 blur-3xl rounded-full" />
				<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[200px] opacity-5 text-white/10 font-mono">
					{"{ }"}
				</div>
			</div>

			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6 }}
				className="w-full max-w-md relative z-10"
			>
				<div className="text-center mb-8">
					<div className="flex items-center justify-center gap-2 mb-2">
						<Code2 className="w-10 h-10 text-[#007BFF]" />
						<span className="text-2xl gradient-text">
							DevTinder
						</span>
					</div>
					<p className="text-gray-400">Connect. Collaborate. Code.</p>
				</div>

				<div className="glass rounded-3xl p-8 shadow-2xl">
					<Tabs defaultValue="login" className="w-full">
						{/* --- TAB LIST --- */}
						<TabsList className="grid w-full grid-cols-2 mb-8 bg-white/5">
							<TabsTrigger
								value="login"
								className="data-[state=active]:bg-linear-to-br from-[#007BFF] to-[#8A2BE2] text-white"
							>
								Login
							</TabsTrigger>
							<TabsTrigger
								value="signup"
								className="data-[state=active]:bg-linear-to-br from-[#007BFF] to-[#8A2BE2] text-white"
							>
								Sign Up
							</TabsTrigger>
						</TabsList>

						{/* --- LOGIN TAB --- */}
						<TabsContent
							value="login"
							className="space-y-6 text-white"
						>
							<div className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="login-email">Email</Label>
									<Input
										id="login-email"
										type="email"
										placeholder="developer@devtinder.com"
										value={loginData.email}
										onChange={(e) =>
											setLoginData({
												...loginData,
												email: e.target.value,
											})
										}
										className="bg-white/5 border-white/10 border text-white placeholder:text-gray-500"
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="login-password">
										Password
									</Label>
									<Input
										id="login-password"
										type="password"
										placeholder="••••••••"
										value={loginData.password}
										onChange={(e) =>
											setLoginData({
												...loginData,
												password: e.target.value,
											})
										}
										className="bg-white/5 border-white/10 border text-white placeholder:text-gray-500"
									/>
								</div>

								<div className="flex items-center justify-between text-sm">
									<label className="flex items-center gap-2 text-gray-400">
										<input
											type="checkbox"
											className="rounded"
										/>{" "}
										Remember me
									</label>
									<button className="text-[#007BFF] hover:underline">
										Forgot password?
									</button>
								</div>
							</div>

							<Button
								className="w-full bg-linear-to-br from-[#007BFF] to-[#8A2BE2] hover:opacity-90"
								onClick={handleLogin}
							>
								Sign In
							</Button>

							{/* Social login */}
							<div className="grid grid-cols-2 gap-4 mt-4">
								<Button
									variant="outline"
									className="border-white/10 border text-white bg-white/5 hover:bg-white/10"
									onClick={handleAuth}
								>
									Google
								</Button>
								<Button
									variant="outline"
									className="border-white/10 border text-white bg-white/5 hover:bg-white/10"
									onClick={handleAuth}
								>
									<Github className="w-5 h-5 mr-2" />
									GitHub
								</Button>
							</div>
						</TabsContent>

						{/* --- SIGNUP TAB --- */}
						<TabsContent
							value="signup"
							className="space-y-6 text-white"
						>
							<div className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="signup-name">
										Full Name
									</Label>
									<Input
										id="signup-name"
										type="text"
										placeholder="John Doe"
										value={signupData.username}
										onChange={(e) =>
											setSignupData({
												...signupData,
												username: e.target.value,
											})
										}
										className="bg-white/5 border-white/10 border text-white placeholder:text-gray-500"
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="signup-email">Email</Label>
									<Input
										id="signup-email"
										type="email"
										placeholder="developer@devtinder.com"
										value={signupData.email}
										onChange={(e) =>
											setSignupData({
												...signupData,
												email: e.target.value,
											})
										}
										className="bg-white/5 border-white/10 border text-white placeholder:text-gray-500"
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="signup-password">
										Password
									</Label>
									<Input
										id="signup-password"
										type="password"
										placeholder="••••••••"
										value={signupData.password}
										onChange={(e) =>
											setSignupData({
												...signupData,
												password: e.target.value,
											})
										}
										className="bg-white/5 border-white/10 border text-white placeholder:text-gray-500"
									/>
								</div>
							</div>

							<Button
								className="w-full bg-linear-to-br from-[#007BFF] to-[#8A2BE2] hover:opacity-90"
								onClick={handleRegister}
							>
								Create Account
							</Button>
						</TabsContent>
					</Tabs>
				</div>

				<div className="text-center mt-6">
					<button
						className="text-gray-400 hover:text-white"
						onClick={() => onNavigate("landing")}
					>
						← Back to Home
					</button>
				</div>
			</motion.div>
		</div>
	);
}
