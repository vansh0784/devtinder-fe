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

			return user;
		} catch (err) {
			console.error("PROFILE FETCH ERROR:", err);
			return null;
		}
	};

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
		<div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-linear-to-br from-[#121212] via-[#1C1C1E] to-[#121212] p-6">
			<div className="absolute inset-0 overflow-hidden">
				<div className="absolute top-20 left-20 h-64 w-64 rounded-full bg-[#007BFF] opacity-10 blur-3xl" />
				<div className="absolute right-20 bottom-20 h-96 w-96 rounded-full bg-[#8A2BE2] opacity-10 blur-3xl" />
				<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-mono text-[200px] text-white/10 opacity-5">
					{"{ }"}
				</div>
			</div>

			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6 }}
				className="relative z-10 w-full max-w-md"
			>
				<div className="mb-8 text-center">
					<div className="mb-2 flex items-center justify-center gap-2">
						<Code2 className="h-10 w-10 text-[#007BFF]" />
						<span className="text-2xl gradient-text">
							DevTinder
						</span>
					</div>
					<p className="text-gray-400">Connect. Collaborate. Code.</p>
				</div>

				<div className="rounded-3xl p-8 shadow-2xl glass">
					<Tabs defaultValue="login" className="w-full">
						{/* --- TAB LIST --- */}
						<TabsList className="mb-8 grid w-full grid-cols-2 bg-white/5">
							<TabsTrigger
								value="login"
								className="from-[#007BFF] to-[#8A2BE2] text-white data-[state=active]:bg-linear-to-br"
							>
								Login
							</TabsTrigger>
							<TabsTrigger
								value="signup"
								className="from-[#007BFF] to-[#8A2BE2] text-white data-[state=active]:bg-linear-to-br"
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
										className="border border-white/10 bg-white/5 text-white placeholder:text-gray-500"
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
										className="border border-white/10 bg-white/5 text-white placeholder:text-gray-500"
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
							<div className="mt-4 grid grid-cols-2 gap-4">
								<Button
									variant="outline"
									className="border border-white/10 bg-white/5 text-white hover:bg-white/10"
									onClick={handleAuth}
								>
									Google
								</Button>
								<Button
									variant="outline"
									className="border border-white/10 bg-white/5 text-white hover:bg-white/10"
									onClick={handleAuth}
								>
									<Github className="mr-2 h-5 w-5" />
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
										className="border border-white/10 bg-white/5 text-white placeholder:text-gray-500"
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
										className="border border-white/10 bg-white/5 text-white placeholder:text-gray-500"
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
										className="border border-white/10 bg-white/5 text-white placeholder:text-gray-500"
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

				<div className="mt-6 text-center">
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
