import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { Card } from "./ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import Editor from "@monaco-editor/react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { MonacoBinding } from "y-monaco";
import { io } from "socket.io-client";
import {
	Play,
	Download,
	Copy,
	Trash2,
	Code2,
	FileCode,
	Terminal,
	AlertCircle,
	CheckCircle2,
	Users,
	UserPlus,
	Wifi,
	WifiOff,
	Link2,
	Send,
	Check,
} from "lucide-react";
import { Badge } from "./ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Alert, AlertDescription } from "./ui/alert";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { toast } from "sonner";

const STARTER_CODE = {
	javascript: `// JavaScript Playground
function greet(name) {
  return \`Hello, \${name}! Welcome to DevTinder.\`;
}

console.log(greet("Developer"));

// Try your code here
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
console.log("Doubled:", doubled);`,

	html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DevTinder Preview</title>
  <style>
    body {
      font-family: Inter, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      margin: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🚀 Welcome to DevTinder Code Editor</h1>
    <p>Edit this HTML and see the results instantly!</p>
  </div>
</body>
</html>`,

	css: `/* CSS Playground */
body {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-family: 'Inter', sans-serif;
  padding: 40px;
  margin: 0;
}

.card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 30px;
  max-width: 500px;
  margin: 0 auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}`,

	json: `{
  "name": "DevTinder Project",
  "version": "1.0.0",
  "description": "A collaborative coding platform",
  "author": "Your Name",
  "skills": ["React", "TypeScript", "Node.js"],
  "interests": ["Web Development", "Open Source"],
  "project": {
    "status": "active",
    "collaborators": 5,
    "stars": 120
  }
}`,
};

interface Collaborator {
	id: string;
	name: string;
	avatar: string;
	color: string;
	isTyping: boolean;
	cursorPosition: number;
}

const MOCK_COLLABORATORS: Collaborator[] = [
	{
		id: "user-2",
		name: "Sarah Chen",
		avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
		color: "#007BFF",
		isTyping: false,
		cursorPosition: 0,
	},
	{
		id: "user-3",
		name: "Alex Kumar",
		avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
		color: "#8A2BE2",
		isTyping: false,
		cursorPosition: 0,
	},
];

interface Friend {
	id: string;
	name: string;
	username: string;
	avatar: string;
	status: "online" | "offline";
	matchScore: number;
}

const MOCK_FRIENDS: Friend[] = [
	{
		id: "friend-1",
		name: "Emma Wilson",
		username: "@emmacodes",
		avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100",
		status: "online",
		matchScore: 95,
	},
	{
		id: "friend-2",
		name: "Marcus Johnson",
		username: "@marcusdev",
		avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100",
		status: "online",
		matchScore: 88,
	},
	{
		id: "friend-3",
		name: "Lisa Park",
		username: "@lisabuilds",
		avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
		status: "offline",
		matchScore: 92,
	},
	{
		id: "friend-4",
		name: "David Martinez",
		username: "@davecodes",
		avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100",
		status: "online",
		matchScore: 85,
	},
	{
		id: "friend-5",
		name: "Sophia Lee",
		username: "@sophiatech",
		avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100",
		status: "offline",
		matchScore: 90,
	},
];

export function CodeEditorPage() {
	const [language, setLanguage] =
		useState<keyof typeof STARTER_CODE>("javascript");
	const [code, setCode] = useState(STARTER_CODE.javascript);
	const [output, setOutput] = useState("");
	const [error, setError] = useState("");
	const [isRunning, setIsRunning] = useState(false);
	const [collaborationEnabled, setCollaborationEnabled] = useState(false);
	const [activeCollaborators, setActiveCollaborators] = useState<
		Collaborator[]
	>([]);
	const [_, setCursorPosition] = useState(0);
	const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
	const [invitedFriends, setInvitedFriends] = useState<Set<string>>(
		new Set()
	);
	const [copiedLink, setCopiedLink] = useState(false);
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	const monacoEditorRef = useRef<any>(null);
	const monacoInstanceRef = useRef<any>(null);
	const ydocRef = useRef<Y.Doc | null>(null);
	const providerRef = useRef<WebsocketProvider | null>(null);
	const bindingRef = useRef<MonacoBinding | null>(null);
	const [canEdit, setCanEdit] = useState(false);

	const socketRef = useRef<any>(null);

	const sessionLink = "https://devtinder.dev/code/session/abc123xyz";
	const permissionSocketUrl = (import.meta.env.NEXT_PUBLIC_PERMISSION_SOCKET_URL) || "http://localhost:4000"; // change in prod
	const ywsUrl = (import.meta.env.NEXT_PUBLIC_YWS_URL) || "ws://localhost:1234"; // change in prod

	useEffect(() => {
		if (collaborationEnabled) {
			// Simulate Sarah joining after 1 second
			const timer1 = setTimeout(() => {
				setActiveCollaborators((prev) => [
					...prev,
					MOCK_COLLABORATORS[0],
				]);
			}, 1000);

			// Simulate Alex joining after 3 seconds
			const timer2 = setTimeout(() => {
				setActiveCollaborators((prev) => [
					...prev,
					MOCK_COLLABORATORS[1],
				]);
			}, 3000);

			return () => {
				clearTimeout(timer1);
				clearTimeout(timer2);
			};
		} else {
			setActiveCollaborators([]);
		}
	}, [collaborationEnabled]);

	// Simulate typing from collaborators
	useEffect(() => {
		if (!collaborationEnabled || activeCollaborators.length === 0) return;

		const interval = setInterval(() => {
			setActiveCollaborators((prev) =>
				prev.map((collab) => ({
					...collab,
					isTyping: Math.random() > 0.7,
					cursorPosition: Math.floor(Math.random() * code.length),
				}))
			);
		}, 3000);

		return () => clearInterval(interval);
	}, [collaborationEnabled, activeCollaborators.length, code.length]);

	// Simulate collaborative edits
	useEffect(() => {
		if (!collaborationEnabled || activeCollaborators.length === 0) return;

		const simulateEdit = setInterval(() => {
			// Randomly simulate an edit from a collaborator
			if (Math.random() > 0.85) {
				const collaborator =
					activeCollaborators[
						Math.floor(Math.random() * activeCollaborators.length)
					];
				const comments = [
					`\n// ${collaborator.name}: Great work!`,
					`\n// ${collaborator.name}: Consider optimizing this`,
					`\n// ${collaborator.name}: Nice implementation!`,
				];
				const comment =
					comments[Math.floor(Math.random() * comments.length)];

				setCode((prev) => {
					const lines = prev.split("\n");
					const randomLine = Math.floor(Math.random() * lines.length);
					lines.splice(randomLine, 0, comment);
					return lines.join("\n");
				});
			}
		}, 8000);

		return () => clearInterval(simulateEdit);
	}, [collaborationEnabled, activeCollaborators]);

	useEffect(() => {
		// when collaboration toggled on -> connect to permission socket and Yjs provider
		if (!collaborationEnabled) {
			// disconnect if present
			socketRef.current?.disconnect?.();
			providerRef.current?.disconnect?.();
			ydocRef.current?.destroy?.();
			ydocRef.current = null;
			providerRef.current = null;
			bindingRef.current = null;
			monacoEditorRef.current && monacoEditorRef.current.updateOptions({ readOnly: false }); // solo mode editable
			setCanEdit(false);
			return;
		}

		// connect to permission socket (Socket.IO)
		// NOTE: pass token in query if you use JWT auth: { query: { token: yourToken } }
		socketRef.current = io(permissionSocketUrl, { autoConnect: true });

		socketRef.current.on("connect", () => {
			// join room (use your real roomId in production)
			socketRef.current.emit("join-room", { roomId: "session-abc123xyz" });
		});
		socketRef.current.on("permission-update", ({ editors }: { editors: string[] }) => {
			// if your user id is included, allow edits. Here we use a simple client id fallback
			const myId = getLocalUserId();
			const allowed = editors.includes(myId);
			setCanEdit(allowed);
			// update monaco readOnly if mounted
			if (monacoEditorRef.current) monacoEditorRef.current.updateOptions({ readOnly: !allowed });
		});
		socketRef.current.on("presence", ({ users }: any) => {
			// you can merge presence with your activeCollaborators UI
			// For demo we do nothing here (your simulated collaborators remain)
			console.debug("presence", users);
		});
		socketRef.current.on("edit-request", (data: any) => {
			// owner receives an edit-request notification
			toast(`${data.from?.name || "Someone"} requested edit access`);
		});
		socketRef.current.on("permission-error", (msg: string) => {
			toast.error(msg);
		});

		// create Yjs doc + provider
		const ydoc = new Y.Doc();
		ydocRef.current = ydoc;

		// token param: if you have JWT, append it so y-websocket server can verify permissions
		const tokenParam = ""; // e.g. `?token=${encodeURIComponent(yourJwt)}`
		const provider = new WebsocketProvider(`${ywsUrl}${tokenParam}`, `doc-session-abc123xyz`, ydoc, {
			// optional awareness handling
		});
		providerRef.current = provider;

		// set local presence (used by awareness)
		provider.awareness.setLocalStateField("user", {
			id: getLocalUserId(),
			name: getLocalUserName(),
		});

		// if Monaco mounted already -> bind below in "onEditorMount"
		// but if editor is already mounted we can create binding immediately.
		// We'll create binding in onEditorMount to ensure proper model.

		// cleanup when component unmounts or collaboration disabled
		return () => {
			socketRef.current?.disconnect?.();
			providerRef.current?.disconnect?.();
			ydocRef.current?.destroy?.();
			ydocRef.current = null;
			bindingRef.current = null;
		};
	}, [collaborationEnabled]);

	function getLocalUserId() {
		// If you have auth, use the real user id. For demo, use localStorage fallback.
		const stored = typeof window !== "undefined" ? window.localStorage.getItem("devtinder_user_id") : null;
		if (stored) return stored;
		const id = `user-${Math.random().toString(36).slice(2, 9)}`;
		try { window.localStorage.setItem("devtinder_user_id", id); } catch {}
		return id;
	}
	function getLocalUserName() {
		const stored = typeof window !== "undefined" ? window.localStorage.getItem("devtinder_user_name") : null;
		if (stored) return stored;
		const name = "You";
		try { window.localStorage.setItem("devtinder_user_name", name); } catch {}
		return name;
	}

	function handleMonacoMount(editor: any, monaco: any) {
		monacoEditorRef.current = editor;
		monacoInstanceRef.current = monaco;

		// ensure a model exists
		let model = editor.getModel();
		if (!model) {
			model = monaco.editor.createModel(code, language);
			editor.setModel(model);
		}

		// if Yjs provider exists, bind Monaco to Yjs
		if (ydocRef.current && providerRef.current) {
			const yText = ydocRef.current.getText("monaco");
			// If there is an existing binding, destroy it first
			if (bindingRef.current) {
				try { bindingRef.current.destroy(); } catch {}
				bindingRef.current = null;
			}

			// MonacoBinding expects the Monaco model instance (monaco model), editor set(s) and awareness
			const binding = new MonacoBinding(yText, model, new Set([editor]), providerRef.current.awareness);
			bindingRef.current = binding;

			// initialize local content if empty (so first join shows initial code)
			if (yText.length === 0) {
				// seed with current code
				ydocRef.current.transact(() => {
					yText.insert(0, code || STARTER_CODE[language]);
				});
			}

			// set editor readOnly depending on permission (canEdit)
			editor.updateOptions({ readOnly: !canEdit });

			// react to awareness changes (presence/cursor updates)
			providerRef.current.awareness.on("change", (changes: any) => {
				// you can read current awareness states:
				const states = Array.from(providerRef.current!.awareness.getStates().entries()).map(([clientId, state]) => state);
				// merge awareness into your activeCollaborators UI if desired
				// (left as an exercise — you already have a simulated UI)
			});
		}

		// handle local change events when collaboration is NOT enabled: update `code` state for run, preview etc
		if (!collaborationEnabled) {
			editor.onDidChangeModelContent(() => {
				setCode(editor.getValue());
			});
		}
	}


	const handleLanguageChange = (lang: string) => {
		const newLang = lang as keyof typeof STARTER_CODE;
		setLanguage(newLang);
		setCode(STARTER_CODE[newLang]);
		setOutput("");
		setError("");
		// update Monaco model if present
		if (monacoInstanceRef.current && monacoEditorRef.current) {
			const monaco = monacoInstanceRef.current;
			const model = monaco.editor.createModel(STARTER_CODE[newLang], newLang === "javascript" ? "javascript" : newLang);
			monacoEditorRef.current.setModel(model);
		}
	};

	const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setCode(e.target.value);
		setCursorPosition(e.target.selectionStart);
	};

	const runCode = () => {
		setIsRunning(true);
		setError("");
		setOutput("");
		try {
			if (language === "javascript") {
				const logs: string[] = [];
				const originalLog = console.log;
				console.log = (...args: any[]) => {
					logs.push(args.map(a => typeof a === "object" ? JSON.stringify(a, null, 2) : String(a)).join(" "));
					originalLog(...args);
				};
				try {
					const editorValue = collaborationEnabled && monacoEditorRef.current ? monacoEditorRef.current.getValue() : code;
					const result = new Function(editorValue)();
					if (result !== undefined) logs.push(`→ ${result}`);
				} finally {
					console.log = originalLog;
				}
				setOutput(logs.length > 0 ? logs.join("\n") : "Code executed successfully (no output)");
			} else if (language === "json") {
				const editorValue = collaborationEnabled && monacoEditorRef.current ? monacoEditorRef.current.getValue() : code;
				const parsed = JSON.parse(editorValue);
				setOutput(JSON.stringify(parsed, null, 2));
			} else if (language === "html" || language === "css") {
				setOutput("Preview updated in the preview pane →");
			}
		} catch (err: any) {
			setError(err.message || "An error occurred");
		} finally {
			setIsRunning(false);
		}
	};

	const copyCode = () => {
		navigator.clipboard.writeText(code);
		setOutput("Code copied to clipboard!");
	};

	const copySessionLink = () => {
		navigator.clipboard.writeText(sessionLink);
		setCopiedLink(true);
		toast.success("Session link copied to clipboard!");
		setTimeout(() => setCopiedLink(false), 2000);
	};

	const inviteFriend = (friendId: string, friendName: string) => {
		setInvitedFriends((prev) => new Set(prev).add(friendId));
		toast.success(`Invitation sent to ${friendName}!`);
	};

	const clearCode = () => {
		setCode("");
		setOutput("");
		setError("");
	};

	const downloadCode = () => {
		const extensions = {
			javascript: "js",
			html: "html",
			css: "css",
			json: "json",
		};

		const blob = new Blob([code], { type: "text/plain" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `devtinder-code.${extensions[language]}`;
		a.click();
		URL.revokeObjectURL(url);
	};

	const getPreviewContent = () => {
		if (language === "html") {
			return code;
		} else if (language === "css") {
			return `
        <!DOCTYPE html>
        <html>
          <head>
            <style>${code}</style>
          </head>
          <body>
            <div class="card">
              <h1>CSS Preview</h1>
              <p>Your styles are applied to this page</p>
            </div>
          </body>
        </html>
      `;
		}
		return "";
	};

	return (
		<div className="min-h-screen p-6">
			<div className="max-w-7xl mx-auto">
				<motion.div
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					className="mb-8"
				>
					<div className="flex items-center justify-between mb-4">
						<div className="flex items-center gap-3">
							<div className="w-12 h-12 rounded-xl bg-linear-to-r from-[#007BFF] to-[#8A2BE2] flex items-center justify-center">
								<Code2 className="w-6 h-6 text-white" />
							</div>
							<div>
								<h1 className="text-3xl text-white">
									Collaborative Code Editor
								</h1>
								<p className="text-gray-400">
									Write, run, and collaborate in real-time
								</p>
							</div>
						</div>
						<Badge className="bg-[#007BFF]/20 text-[#007BFF] border border-[#007BFF]/30">
							<FileCode className="w-3 h-3 mr-1" />
							{language.toUpperCase()}
						</Badge>
					</div>
					<Card className="glass border-white/10 p-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-4">
								<div className="flex items-center gap-2">
									<Switch
										id="collaboration"
										checked={collaborationEnabled}
										onCheckedChange={
											setCollaborationEnabled
										}
									/>
									<Label
										htmlFor="collaboration"
										className="text-white cursor-pointer"
									>
										<div className="flex items-center gap-2">
											{collaborationEnabled ? (
												<Wifi className="w-4 h-4 text-green-500" />
											) : (
												<WifiOff className="w-4 h-4 text-gray-500" />
											)}
											<span>
												{collaborationEnabled
													? "Live Collaboration"
													: "Solo Mode"}
											</span>
										</div>
									</Label>
								</div>

								{collaborationEnabled && (
									<motion.div
										initial={{ opacity: 0, scale: 0.9 }}
										animate={{ opacity: 1, scale: 1 }}
										className="flex items-center gap-2"
									>
										<Users className="w-4 h-4 text-[#007BFF]" />
										<span className="text-sm text-gray-400">
											{activeCollaborators.length + 1}{" "}
											active
										</span>
									</motion.div>
								)}
								<Dialog
									open={inviteDialogOpen}
									onOpenChange={setInviteDialogOpen}
								>
									<DialogTrigger asChild>
										<Button
											size="sm"
											className="bg-linear-to-r from-[#007BFF] to-[#8A2BE2] hover:opacity-90"
										>
											<UserPlus className="w-4 h-4 mr-2" />
											Invite Friend
										</Button>
									</DialogTrigger>
									<DialogContent className="bg-[#1C1C1E] border-white/10 text-white max-w-md">
										<DialogHeader>
											<DialogTitle className="text-xl">
												Invite to Collaborate
											</DialogTitle>
											<DialogDescription className="text-gray-400">
												Invite your DevTinder
												connections to join this coding
												session
											</DialogDescription>
										</DialogHeader>

										<div className="space-y-4 mt-4">

											<div className="p-4 bg-white/5 rounded-xl border border-white/10">
												<div className="flex items-center gap-2 mb-2">
													<Link2 className="w-4 h-4 text-[#007BFF]" />
													<span className="text-sm">
														Share Session Link
													</span>
												</div>
												<div className="flex gap-2">
													<Input
														value={sessionLink}
														readOnly
														className="bg-[#0A0A0A] border-white/10 text-gray-300 text-sm"
													/>
													<Button
														onClick={
															copySessionLink
														}
														size="sm"
														variant="outline"
														className="border-white/20 hover:bg-white/10"
													>
														{copiedLink ? (
															<Check className="w-4 h-4 text-green-500" />
														) : (
															<Copy className="w-4 h-4" />
														)}
													</Button>
												</div>
											</div>
											<div>
												<h4 className="text-sm text-gray-400 mb-3 flex items-center gap-2">
													<Users className="w-4 h-4" />
													Your Connections
												</h4>
												<div className="space-y-2 max-h-64 overflow-y-auto">
													{MOCK_FRIENDS.map(
														(friend) => {
															const isInvited =
																invitedFriends.has(
																	friend.id
																);
															const isActive =
																activeCollaborators.some(
																	(c) =>
																		c.name ===
																		friend.name
																);

															return (
																<motion.div
																	key={
																		friend.id
																	}
																	initial={{
																		opacity: 0,
																		y: 10,
																	}}
																	animate={{
																		opacity: 1,
																		y: 0,
																	}}
																	className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10 hover:border-[#007BFF]/50 transition-colors"
																>
																	<div className="flex items-center gap-3">
																		<div className="relative">
																			<Avatar className="w-10 h-10">
																				<AvatarImage
																					src={
																						friend.avatar
																					}
																					alt={
																						friend.name
																					}
																				/>
																				<AvatarFallback>
																					{
																						friend
																							.name[0]
																					}
																				</AvatarFallback>
																			</Avatar>
																			<div
																				className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#1C1C1E] ${
																					friend.status ===
																					"online"
																						? "bg-green-500"
																						: "bg-gray-500"
																				}`}
																			/>
																		</div>
																		<div>
																			<div className="flex items-center gap-2">
																				<span className="text-sm text-white">
																					{
																						friend.name
																					}
																				</span>
																				{isActive && (
																					<Badge className="bg-green-500/20 text-green-500 border-green-500/30 text-xs px-1.5 py-0">
																						Active
																					</Badge>
																				)}
																			</div>
																			<span className="text-xs text-gray-400">
																				{
																					friend.username
																				}
																			</span>
																		</div>
																	</div>
																	<Button
																		size="sm"
																		onClick={() =>
																			inviteFriend(
																				friend.id,
																				friend.name
																			)
																		}
																		disabled={
																			isInvited ||
																			isActive
																		}
																		className={
																			isInvited ||
																			isActive
																				? "bg-green-500/20 text-green-500 border border-green-500/30 hover:bg-green-500/20"
																				: "bg-[#007BFF] hover:bg-[#007BFF]/80"
																		}
																	>
																		{isActive ? (
																			<>
																				<Check className="w-3 h-3 mr-1" />
																				Joined
																			</>
																		) : isInvited ? (
																			<>
																				<Check className="w-3 h-3 mr-1" />
																				Invited
																			</>
																		) : (
																			<>
																				<Send className="w-3 h-3 mr-1" />
																				Invite
																			</>
																		)}
																	</Button>
																</motion.div>
															);
														}
													)}
												</div>
											</div>

											<div className="pt-2 border-t border-white/10">
												<p className="text-xs text-gray-400">
													💡 Tip: Friends will receive
													a notification and can join
													with one click
												</p>
											</div>
										</div>
									</DialogContent>
								</Dialog>
							</div>
							<div className="flex items-center gap-2">
								{collaborationEnabled && (
									<AnimatePresence>
										{activeCollaborators.map(
											(collab, index) => (
												<motion.div
													key={collab.id}
													initial={{
														opacity: 0,
														x: -20,
													}}
													animate={{
														opacity: 1,
														x: 0,
													}}
													exit={{ opacity: 0, x: 20 }}
													transition={{
														delay: index * 0.1,
													}}
													className="relative"
												>
													<Avatar
														className="w-8 h-8 border-2"
														style={{
															borderColor:
																collab.color,
														}}
													>
														<AvatarImage
															src={collab.avatar}
															alt={collab.name}
														/>
														<AvatarFallback>
															{collab.name[0]}
														</AvatarFallback>
													</Avatar>
													{collab.isTyping && (
														<motion.div
															initial={{
																scale: 0,
															}}
															animate={{
																scale: 1,
															}}
															className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full"
															style={{
																backgroundColor:
																	collab.color,
															}}
														>
															<motion.div
																animate={{
																	scale: [
																		1, 1.2,
																		1,
																	],
																}}
																transition={{
																	repeat: Infinity,
																	duration: 1,
																}}
																className="w-full h-full rounded-full"
																style={{
																	backgroundColor:
																		collab.color,
																}}
															/>
														</motion.div>
													)}
												</motion.div>
											)
										)}
									</AnimatePresence>
								)}

								<Avatar className="w-8 h-8 border-2 border-green-500">
									<AvatarFallback className="bg-green-500/20 text-green-500">
										You
									</AvatarFallback>
								</Avatar>
							</div>
						</div>
						{collaborationEnabled &&
							activeCollaborators.some((c) => c.isTyping) && (
								<motion.div
									initial={{ opacity: 0, height: 0 }}
									animate={{ opacity: 1, height: "auto" }}
									exit={{ opacity: 0, height: 0 }}
									className="mt-3 pt-3 border-t border-white/10"
								>
									<div className="flex flex-wrap gap-2">
										{activeCollaborators
											.filter((c) => c.isTyping)
											.map((collab) => (
												<motion.div
													key={collab.id}
													initial={{
														opacity: 0,
														y: -10,
													}}
													animate={{
														opacity: 1,
														y: 0,
													}}
													className="flex items-center gap-2 px-3 py-1 rounded-full"
													style={{
														backgroundColor: `${collab.color}20`,
														border: `1px solid ${collab.color}40`,
													}}
												>
													<span
														className="text-xs"
														style={{
															color: collab.color,
														}}
													>
														{collab.name} is typing
													</span>
													<motion.div
														animate={{
															opacity: [
																1, 0.5, 1,
															],
														}}
														transition={{
															repeat: Infinity,
															duration: 1,
														}}
														className="flex gap-1"
													>
														<div
															className="w-1 h-1 rounded-full"
															style={{
																backgroundColor:
																	collab.color,
															}}
														/>
														<div
															className="w-1 h-1 rounded-full"
															style={{
																backgroundColor:
																	collab.color,
															}}
														/>
														<div
															className="w-1 h-1 rounded-full"
															style={{
																backgroundColor:
																	collab.color,
															}}
														/>
													</motion.div>
												</motion.div>
											))}
									</div>
								</motion.div>
							)}
					</Card>
				</motion.div>

				<div className="grid lg:grid-cols-2 gap-6">
					<motion.div
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: 0.1 }}
					>
						<Card className="glass border-white/10 p-6">
							<div className="flex items-center justify-between mb-4">
								<div className="flex items-center gap-2">
									<Terminal className="w-5 h-5 text-[#007BFF]" />
									<span className="text-white">Editor</span>
								</div>
								<Tabs
									value={language}
									onValueChange={handleLanguageChange}
									className="w-auto"
								>
									<TabsList className="bg-white/5">
										<TabsTrigger
											value="javascript"
											className="data-[state=active]:bg-[#007BFF] text-white"
										>
											JS
										</TabsTrigger>
										<TabsTrigger
											value="html"
											className="data-[state=active]:bg-[#007BFF] text-white"
										>
											HTML
										</TabsTrigger>
										<TabsTrigger
											value="css"
											className="data-[state=active]:bg-[#007BFF] text-white"
										>
											CSS
										</TabsTrigger>
										<TabsTrigger
											value="json"
											className="data-[state=active]:bg-[#007BFF] text-white"
										>
											JSON
										</TabsTrigger>
									</TabsList>
								</Tabs>
							</div>

							<div className="relative">
								<div className="relative">
								{!collaborationEnabled ? (
									<Textarea
										value={code}
										onChange={handleCodeChange}
										className="min-h-[400px] font-mono text-sm bg-[#0A0A0A] border-white/10 text-white resize-none"
										placeholder="Start coding..."
										spellCheck={false}
									/>
								) : (
									<div style={{ height: 420 }}>
										<Editor
											height="420px"
											defaultLanguage={language === "javascript" ? "javascript" : language === "json" ? "json" : language}
											defaultValue={code}
											onMount={handleMonacoMount}
											options={{
												fontSize: 13,
												minimap: { enabled: false },
												automaticLayout: true,
												scrollBeyondLastLine: false
											}}
										/>
									</div>
								)} </div>

								{collaborationEnabled &&
									activeCollaborators.length > 0 && (
										<div className="absolute top-0 left-0 pointer-events-none">
											{activeCollaborators.map(
												(collab) => (
													<motion.div
														key={collab.id}
														className="absolute"
														animate={{
															top: `${
																Math.floor(
																	collab.cursorPosition /
																		50
																) * 20
															}px`,
															left: `${
																(collab.cursorPosition %
																	50) *
																8
															}px`,
														}}
														transition={{
															duration: 0.3,
														}}
													>
														<div
															className="w-0.5 h-5"
															style={{
																backgroundColor:
																	collab.color,
															}}
														/>
														<div
															className="text-xs px-2 py-0.5 rounded mt-1 whitespace-nowrap"
															style={{
																backgroundColor:
																	collab.color,
																color: "white",
															}}
														>
															{collab.name}
														</div>
													</motion.div>
												)
											)}
										</div>
									)}
							</div>

							<div className="flex flex-wrap gap-2 mt-4">
								<Button
									onClick={runCode}
									disabled={isRunning}
									className="bg-linear-to-r from-[#007BFF] to-[#8A2BE2] hover:opacity-90"
								>
									<Play className="w-4 h-4 mr-2" />
									{isRunning ? "Running..." : "Run Code"}
								</Button>
								<Button
									onClick={copyCode}
									variant="outline"
									className="border-white/20 text-white bg-white/10"
								>
									<Copy className="w-4 h-4 mr-2" />
									Copy
								</Button>
								<Button
									onClick={downloadCode}
									variant="outline"
									className="border-white/20 text-white bg-white/10"
								>
									<Download className="w-4 h-4 mr-2" />
									Download
								</Button>
								<Button
									onClick={clearCode}
									variant="outline"
									className="border-red-500/50 text-red-500 hover:none bg-red-500/10"
								>
									<Trash2 className="w-4 h-4 mr-2" />
									Clear
								</Button>
							</div>
						</Card>
					</motion.div>
					<motion.div
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: 0.2 }}
					>
						<Card className="glass border-white/10 p-6">
							<div className="flex items-center gap-2 mb-4">
								<Terminal className="w-5 h-5 text-[#8A2BE2]" />
								<span className="text-white">
									{language === "html" || language === "css"
										? "Preview"
										: "Output"}
								</span>
							</div>

							{error && (
								<Alert className="mb-4 bg-red-500/10 border-red-500/50">
									<AlertCircle className="w-4 h-4 text-red-500" />
									<AlertDescription className="text-red-400">
										{error}
									</AlertDescription>
								</Alert>
							)}

							{output &&
								!error &&
								language !== "html" &&
								language !== "css" && (
									<Alert className="mb-4 bg-green-500/10 border-green-500/50">
										<CheckCircle2 className="w-4 h-4 text-green-200" />
										<AlertDescription className="text-green-400">
											Execution completed
										</AlertDescription>
									</Alert>
								)}

							{language === "html" || language === "css" ? (
								<div
									className="bg-white rounded-xl overflow-hidden border-2 border-white/10"
									style={{ height: "500px" }}
								>
									<iframe
										srcDoc={getPreviewContent()}
										title="Preview"
										className="w-full h-full"
										sandbox="allow-scripts"
									/>
								</div>
							) : (
								<div className="bg-[#0A0A0A] rounded-xl p-4 min-h-[400px] border border-white/10">
									<pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap warp-break-word">
										{output ||
											"Run your code to see output here..."}
									</pre>
								</div>
							)}
							{collaborationEnabled && (
								<div className="mt-4 p-4 bg-[#007BFF]/10 rounded-xl border border-[#007BFF]/30">
									<h4 className="text-sm text-[#007BFF] mb-2 flex items-center gap-2">
										<Users className="w-4 h-4" />
										Collaboration Active
									</h4>
									<p className="text-xs text-gray-400">
										Changes are synced in real-time with all
										collaborators. You can see their cursors
										and edits as they type.
									</p>
								</div>
							)}
							<div className="mt-4 p-4 bg-[#8A2BE2]/10 rounded-xl border border-[#8A2BE2]/30">
								<h4 className="text-sm text-[#8A2BE2] mb-2 flex items-center gap-2">
									<AlertCircle className="w-4 h-4" />
									Tips
								</h4>
								<ul className="text-xs text-gray-400 space-y-1">
									{language === "javascript" && (
										<>
											<li>
												• Use console.log() to print
												output
											</li>
											<li>
												• Return values will be
												displayed automatically
											</li>
											<li>
												• Errors will be caught and
												displayed above
											</li>
										</>
									)}
									{language === "html" && (
										<>
											<li>
												• Preview updates automatically
											</li>
											<li>
												• Full HTML5 support with inline
												styles
											</li>
											<li>
												• Scripts are sandboxed for
												security
											</li>
										</>
									)}
									{language === "css" && (
										<>
											<li>
												• Styles are applied to a
												preview template
											</li>
											<li>
												• Use .card class for the main
												container
											</li>
											<li>
												• Preview updates in real-time
											</li>
										</>
									)}
									{language === "json" && (
										<>
											<li>
												• JSON will be validated and
												formatted
											</li>
											<li>
												• Invalid JSON will show an
												error
											</li>
											<li>
												• Use proper quotes and syntax
											</li>
										</>
									)}
								</ul>
							</div>
						</Card>
					</motion.div>
				</div>
				
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3 }}
					className="mt-6"
				>
					<Card className="glass border-white/10 p-6">
						<h3 className="text-xl text-white mb-4">
							Quick Snippets
						</h3>
						<div className="grid md:grid-cols-3 gap-4">
							{[
								{
									title: "Array Methods",
									lang: "javascript",
									code: "[1,2,3].map(x => x * 2)",
									description: "Common array operations",
								},
								{
									title: "Async/Await",
									lang: "javascript",
									code: "async function fetchData() {\n  const response = await fetch(url);\n  return response.json();\n}",
									description: "Handle async operations",
								},
								{
									title: "Flexbox Layout",
									lang: "css",
									code: ".container {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}",
									description: "Center content with flexbox",
								},
							].map((snippet, index) => (
								<div
									key={index}
									className="p-4 bg-white/5 rounded-xl border border-white/10 hover:border-[#007BFF]/50 transition-colors cursor-pointer"
									onClick={() => {
										if (snippet.lang === language) {
											setCode(snippet.code);
										}
									}}
								>
									<div className="flex items-center justify-between mb-2">
										<span className="text-white text-sm">
											{snippet.title}
										</span>
										<Badge
											variant="outline"
											className="text-xs text-white border-white/20"
										>
											{snippet.lang}
										</Badge>
									</div>
									<p className="text-xs text-gray-400">
										{snippet.description}
									</p>
								</div>
							))}
						</div>
					</Card>
				</motion.div>
			</div>
		</div>
	);
}
