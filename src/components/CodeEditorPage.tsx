import { type ChangeEvent, useState, useEffect, useRef } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { Card } from "./ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Skeleton } from "./ui/skeleton";
import Editor from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { MonacoBinding } from "y-monaco";
import { io, type Socket } from "socket.io-client";
import { useAuth } from "../hooks/useAuth";
import { getApi, postApi } from "../utils/api";
import { monacoChangesToOtJson } from "../utils/monacoOt";
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
import {
  type Collaborator,
  type ICollabRoomResponse,
  type IUser,
  type IBaseResponse,
} from "../utils/types";
import { displayField, displayInitials } from "../utils/display";

function hashColor(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = id.charCodeAt(i) + ((h << 5) - h);
  const hue = Math.abs(h) % 360;
  return `hsl(${hue} 70% 55%)`;
}

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

export function CodeEditorPage() {
  const { user } = useAuth();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const lastCollabKickNavigationKeyRef = useRef<string | null>(null);
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
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [invitedFriends, setInvitedFriends] = useState<Set<string>>(new Set());
  const [matchedConnections, setMatchedConnections] = useState<IUser[]>([]);
  const [connectionsLoading, setConnectionsLoading] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [collabRoomId, setCollabRoomId] = useState<string | null>(null);
  const [yjsStatus, setYjsStatus] = useState<
    "offline" | "connecting" | "synced"
  >("offline");
  const [editorSurfaceReady, setEditorSurfaceReady] = useState(false);
  const monacoEditorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(
    null,
  );
  const monacoInstanceRef = useRef<typeof monaco | null>(null);
  const ydocRef = useRef<Y.Doc | null>(null);
  const providerRef = useRef<WebsocketProvider | null>(null);
  const bindingRef = useRef<MonacoBinding | null>(null);
  const [canEdit, setCanEdit] = useState(true);
  const socketRef = useRef<Socket | null>(null);
  const otRevisionRef = useRef(0);
  const docLenBeforeOtRef = useRef(0);
  const otEmitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sessionCollabRef = useRef<ICollabRoomResponse | null>(null);
  const monacoOtDisposableRef = useRef<{ dispose: () => void } | null>(null);

  const apiBase =
    import.meta.env.VITE_API_BASE_URL ?? "https://devtinder-be-1.onrender.com";
  const sessionLink =
    typeof window !== "undefined" && collabRoomId
      ? `${window.location.origin}/code-editor?room=${collabRoomId}`
      : "";

  useEffect(() => {
    if (!inviteDialogOpen || !user?._id) {
      return;
    }
    let cancelled = false;
    setConnectionsLoading(true);
    void getApi<IUser[]>("/connection/matches")
      .then((list) => {
        if (!cancelled) setMatchedConnections(list ?? []);
      })
      .catch(() => {
        if (!cancelled) setMatchedConnections([]);
      })
      .finally(() => {
        if (!cancelled) setConnectionsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [inviteDialogOpen, user?._id]);

  /** Join link / invite notification should flip Live Collaboration on (each navigation keyed once). */
  useEffect(() => {
    const roomQs = searchParams.get("room");
    const inviteOpen =
      (location.state as { openCollaboration?: boolean } | null)
        ?.openCollaboration === true;
    if (!roomQs?.length && !inviteOpen) return;
    const k = location.key;
    if (lastCollabKickNavigationKeyRef.current === k) return;
    lastCollabKickNavigationKeyRef.current = k;
    setCollaborationEnabled(true);
  }, [location.key, location.state, searchParams]);

  useEffect(() => {
    if (!collaborationEnabled) {
      socketRef.current?.removeAllListeners();
      socketRef.current?.disconnect();
      socketRef.current = null;
      providerRef.current?.disconnect();
      providerRef.current = null;
      ydocRef.current?.destroy();
      ydocRef.current = null;
      bindingRef.current?.destroy();
      bindingRef.current = null;
      monacoEditorRef.current?.updateOptions?.({ readOnly: false });
      setCanEdit(true);
      setActiveCollaborators([]);
      setCollabRoomId(null);
      setYjsStatus("offline");
      setEditorSurfaceReady(false);
      sessionCollabRef.current = null;
      otRevisionRef.current = 0;
      if (otEmitTimerRef.current) {
        clearTimeout(otEmitTimerRef.current);
        otEmitTimerRef.current = null;
      }
      monacoOtDisposableRef.current?.dispose();
      monacoOtDisposableRef.current = null;
      return;
    }

    let cancelled = false;

    const run = async () => {
      setYjsStatus("connecting");
      try {
        let session: ICollabRoomResponse;
        const roomFromUrl = searchParams.get("room");

        if (roomFromUrl) {
          const meta = await getApi<
            | { exists: false }
            | (ICollabRoomResponse & {
                exists: true;
                createdAt: string;
                memberCount: number;
                otRevision: number;
              })
          >(`/collaboration/rooms/${roomFromUrl}`);

          if (!meta.exists) {
            toast.error("Session not found or server was restarted.");
            const next = new URLSearchParams(searchParams);
            next.delete("room");
            setSearchParams(next, { replace: true });
            session = await postApi<{ initialDocument?: string }, ICollabRoomResponse>(
              "/collaboration/rooms",
              { initialDocument: code },
            );
          } else {
            session = {
              roomId: meta.roomId,
              yjsWsUrl: meta.yjsWsUrl,
              yjsDocName: meta.yjsDocName,
              codeEditorSocketPath: meta.codeEditorSocketPath,
            };
            otRevisionRef.current = meta.otRevision ?? 0;
          }
        } else {
          session = await postApi<{ initialDocument?: string }, ICollabRoomResponse>(
            "/collaboration/rooms",
            { initialDocument: code },
          );
        }

        if (cancelled) return;

        sessionCollabRef.current = session;
        setCollabRoomId(session.roomId);
        const next = new URLSearchParams(searchParams);
        next.set("room", session.roomId);
        setSearchParams(next, { replace: true });

        const s = io(`${apiBase}/code-editor`, {
          transports: ["websocket", "polling"],
          autoConnect: true,
        });
        socketRef.current = s;

        s.on("connect", () => {
          s.emit("join-room", {
            roomId: session.roomId,
            userId: getLocalUserId(),
            userName: user?.username ?? getLocalUserName(),
          });
        });

        s.on(
          "collab-handshake",
          (h: { otRevision: number; otDocument: string }) => {
            otRevisionRef.current = h.otRevision;
          },
        );

        s.on("permission-update", ({ editors }: { editors: string[] }) => {
          const myId = getLocalUserId();
          const allowed = editors.length === 0 || editors.includes(myId);
          setCanEdit(allowed);
          monacoEditorRef.current?.updateOptions({ readOnly: !allowed });
        });

        s.on(
          "presence",
          ({ users }: { users: { userId: string; userName: string }[] }) => {
            const myId = getLocalUserId();
            setActiveCollaborators(
              users
                .filter((u) => u.userId !== myId)
                .map((u) => ({
                  id: u.userId,
                  name: u.userName,
                  avatar: "",
                  color: hashColor(u.userId),
                  isTyping: false,
                  cursorPosition: 0,
                })),
            );
          },
        );

        s.on("ot-ack", (p: { revision: number }) => {
          otRevisionRef.current = p.revision;
        });

        s.on("collab-error", (err: { message?: string }) => {
          toast.error(err?.message ?? "Collaboration error");
        });

        const ydoc = new Y.Doc();
        ydocRef.current = ydoc;

        const yjsUrlRaw =
          session.yjsWsUrl.indexOf("://") === -1
            ? `ws://${session.yjsWsUrl}`
            : session.yjsWsUrl;
        const yjsHttpUrl = yjsUrlRaw.startsWith("ws://")
          ? `http://${yjsUrlRaw.slice("ws://".length)}`
          : yjsUrlRaw.startsWith("wss://")
            ? `https://${yjsUrlRaw.slice("wss://".length)}`
            : yjsUrlRaw;

        const provider = new WebsocketProvider(
          yjsHttpUrl,
          session.yjsDocName,
          ydoc,
          { connect: true },
        );
        providerRef.current = provider;

        provider.awareness.setLocalStateField("user", {
          id: getLocalUserId(),
          name: user?.username ?? getLocalUserName(),
        });

        provider.on("status", (ev: { status: string }) => {
          if (ev.status === "disconnected") setYjsStatus("connecting");
          if (ev.status === "connected") {
            window.setTimeout(() => {
              setYjsStatus((prev) => (prev === "connecting" ? "synced" : prev));
            }, 500);
          }
        });

        provider.on("sync", (isSynced: boolean) => {
          if (isSynced) setYjsStatus("synced");
        });

        if (!cancelled && monacoEditorRef.current && monacoInstanceRef.current) {
          handleMonacoMount(monacoEditorRef.current, monacoInstanceRef.current);
        }
      } catch (e) {
        console.error(e);
        toast.error("Could not start collaboration session");
        setCollaborationEnabled(false);
        setYjsStatus("offline");
      }
    };

    void run();

    return () => {
      cancelled = true;
      socketRef.current?.removeAllListeners();
      socketRef.current?.disconnect();
      socketRef.current = null;
      providerRef.current?.disconnect();
      providerRef.current = null;
      ydocRef.current?.destroy();
      ydocRef.current = null;
      bindingRef.current?.destroy();
      bindingRef.current = null;
      if (otEmitTimerRef.current) {
        clearTimeout(otEmitTimerRef.current);
        otEmitTimerRef.current = null;
      }
      monacoOtDisposableRef.current?.dispose();
      monacoOtDisposableRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- session bootstrap only when toggling collaboration
  }, [collaborationEnabled]);

  function getLocalUserId() {
    if (user?._id) return user._id;
    const stored =
      typeof window !== "undefined"
        ? window.localStorage.getItem("devtinder_user_id")
        : null;
    if (stored) return stored;
    const id = `user-${Math.random().toString(36).slice(2, 9)}`;
    try {
      window.localStorage.setItem("devtinder_user_id", id);
    } catch {
      /* localStorage may be unavailable */
    }
    return id;
  }
  function getLocalUserName() {
    if (user?.username) return user.username;
    const stored =
      typeof window !== "undefined"
        ? window.localStorage.getItem("devtinder_user_name")
        : null;
    if (stored) return stored;
    const name = "You";
    try {
      window.localStorage.setItem("devtinder_user_name", name);
    } catch {
      /* localStorage may be unavailable */
    }
    return name;
  }

  function handleMonacoMount(
    editor: monaco.editor.IStandaloneCodeEditor,
    monacoNs: typeof monaco,
  ) {
    monacoEditorRef.current = editor;
    monacoInstanceRef.current = monacoNs;
    setEditorSurfaceReady(true);

    let model = editor.getModel();
    if (!model) {
      model = monacoNs.editor.createModel(code, language);
      editor.setModel(model);
    }

    monacoOtDisposableRef.current?.dispose();
    monacoOtDisposableRef.current = null;

    if (ydocRef.current && providerRef.current) {
      const yText = ydocRef.current.getText("monaco");
      if (bindingRef.current) {
        try {
          bindingRef.current.destroy();
        } catch {
          /* noop */
        }
        bindingRef.current = null;
      }

      const binding = new MonacoBinding(
        yText,
        model,
        new Set([editor]),
        providerRef.current.awareness,
      );
      bindingRef.current = binding;

      if (yText.length === 0) {
        ydocRef.current.transact(() => {
          yText.insert(0, code || STARTER_CODE[language]);
        });
      }

      editor.updateOptions({ readOnly: !canEdit });

      docLenBeforeOtRef.current = model.getValueLength();
      monacoOtDisposableRef.current = editor.onDidChangeModelContent(
        (e: monaco.editor.IModelContentChangedEvent) => {
          const beforeLen = docLenBeforeOtRef.current;
          docLenBeforeOtRef.current = model.getValueLength();
          const op = monacoChangesToOtJson(e, beforeLen);
          if (!op || !socketRef.current || !sessionCollabRef.current) return;
          if (otEmitTimerRef.current) clearTimeout(otEmitTimerRef.current);
          otEmitTimerRef.current = setTimeout(() => {
            socketRef.current?.emit("ot-submit", {
              roomId: sessionCollabRef.current!.roomId,
              revision: otRevisionRef.current,
              op,
            });
          }, 150);
        },
      );
    }

    if (!collaborationEnabled) {
      editor.onDidChangeModelContent(() => {
        setCode(editor.getValue());
      });
    }
  }

  const monacoLanguageForTab = (lang: keyof typeof STARTER_CODE) =>
    lang === "javascript"
      ? "javascript"
      : lang === "json"
        ? "json"
        : lang;

  const handleLanguageChange = (lang: string) => {
    const newLang = lang as keyof typeof STARTER_CODE;
    setLanguage(newLang);
    setOutput("");
    setError("");

    if (collaborationEnabled && monacoEditorRef.current && monacoInstanceRef.current) {
      const editor = monacoEditorRef.current;
      const ms = monacoInstanceRef.current;
      const model = editor.getModel();
      if (!model) {
        return;
      }
      ms.editor.setModelLanguage(model, monacoLanguageForTab(newLang));
      setCode(editor.getValue());
      try {
        providerRef.current?.awareness?.setLocalStateField?.(
          "monacoLanguage",
          newLang,
        );
      } catch {
        /* noop */
      }
      return;
    }

    setCode(STARTER_CODE[newLang]);
    if (monacoInstanceRef.current && monacoEditorRef.current) {
      const monacoNs = monacoInstanceRef.current;
      const editor = monacoEditorRef.current;
      const oldModel = editor.getModel();
      const lid = monacoLanguageForTab(newLang);
      const nextModel = monacoNs.editor.createModel(
        STARTER_CODE[newLang],
        lid,
      );
      editor.setModel(nextModel);
      oldModel?.dispose();
    }
  };

  const handleCodeChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setCode(e.target.value);
  };

  const runCode = () => {
    setIsRunning(true);
    setError("");
    setOutput("");
    try {
      if (language === "javascript") {
        const logs: string[] = [];
        const originalLog = console.log;
        console.log = (...args: unknown[]) => {
          logs.push(
            args
              .map((a) =>
                typeof a === "object" && a !== null
                  ? JSON.stringify(a, null, 2)
                  : String(a),
              )
              .join(" "),
          );
          originalLog(...args);
        };
        try {
          const editorValue =
            collaborationEnabled && monacoEditorRef.current
              ? monacoEditorRef.current.getValue()
              : code;
          const result = new Function(editorValue)();
          if (result !== undefined) logs.push(`→ ${result}`);
        } finally {
          console.log = originalLog;
        }
        setOutput(
          logs.length > 0
            ? logs.join("\n")
            : "Code executed successfully (no output)",
        );
      } else if (language === "json") {
        const editorValue =
          collaborationEnabled && monacoEditorRef.current
            ? monacoEditorRef.current.getValue()
            : code;
        const parsed = JSON.parse(editorValue);
        setOutput(JSON.stringify(parsed, null, 2));
      } else if (language === "html" || language === "css") {
        setOutput("Preview updated in the preview pane →");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsRunning(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setOutput("Code copied to clipboard!");
  };

  const copySessionLink = () => {
    if (!sessionLink) {
      toast.error("Session is not ready yet.");
      return;
    }
    navigator.clipboard.writeText(sessionLink);
    setCopiedLink(true);
    toast.success("Session link copied to clipboard!");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const inviteFriend = async (receiverId: string, friendDisplayName: string) => {
    if (!collabRoomId) {
      toast.error("Session is not ready yet.");
      return;
    }
    if (!user?._id) {
      toast.error("Sign in to send invites.");
      return;
    }
    try {
      await postApi<{ roomId: string; receiverId: string }, IBaseResponse>(
        "/collaboration/invite",
        {
          roomId: String(collabRoomId).trim(),
          receiverId: String(receiverId).trim(),
        },
      );
      setInvitedFriends((prev) => new Set(prev).add(receiverId));
      toast.success(
        `Invite sent — ${friendDisplayName} will see it under Notifications (same session link applies).`,
      );
    } catch {
      /* interceptor */
    }
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
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-[#007BFF]/20 text-[#007BFF] border border-[#007BFF]/30">
                <FileCode className="w-3 h-3 mr-1" />
                {language.toUpperCase()}
              </Badge>
              {collaborationEnabled && (
                <>
                  <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs">
                    CRDT · Yjs
                  </Badge>
                  <Badge className="bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs">
                    OT · server
                  </Badge>
                </>
              )}
            </div>
          </div>
          <Card className="glass border-white/10 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    id="collaboration"
                    checked={collaborationEnabled}
                    onCheckedChange={setCollaborationEnabled}
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
                      {activeCollaborators.length + 1} active
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
                        Invite your DevTinder connections to join this coding
                        session
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 mt-4">
                      <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                        <div className="flex items-center gap-2 mb-2">
                          <Link2 className="w-4 h-4 text-[#007BFF]" />
                          <span className="text-sm">Share Session Link</span>
                        </div>
                        <div className="flex gap-2">
                          <Input
                            value={
                              sessionLink ||
                              (collaborationEnabled
                                ? "Preparing share link…"
                                : "Enable Live Collaboration first")
                            }
                            readOnly
                            className="bg-[#0A0A0A] border-white/10 text-gray-300 text-sm"
                          />
                          <Button
                            onClick={copySessionLink}
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
                          {connectionsLoading ? (
                            <div className="space-y-2">
                              <Skeleton className="h-14 w-full bg-white/5" />
                              <Skeleton className="h-14 w-full bg-white/5" />
                            </div>
                          ) : matchedConnections.length === 0 ? (
                            <p className="text-sm text-gray-500 px-2 py-4 rounded-xl border border-dashed border-white/10 bg-white/[0.02]">
                              You don&apos;t have any matches yet. When you both swipe right (and accept), they appear here — then Invite sends an in‑app notification with this session&apos;s join link baked in.
                            </p>
                          ) : (
                            matchedConnections.map((conn) => {
                              const receiverId = (
                                typeof conn._id === "string"
                                  ? conn._id
                                  : String(conn._id ?? "")
                              ).trim();
                              const name = displayField(
                                conn.username,
                                displayField(conn.email, "Member"),
                              );
                              const rawUser = displayField(conn.username);
                              const handle = rawUser
                                ? `@${rawUser.replace(/^@+/, "")}`
                                : displayField(conn.email, "");
                              const avatarUrl = displayField(conn.avatar);

                              const isInvited = invitedFriends.has(receiverId);
                              const isActive = activeCollaborators.some(
                                (c) => String(c.id) === String(receiverId),
                              );

                              return (
                              <motion.div
                                key={receiverId}
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
                                      {avatarUrl ? (
                                        <AvatarImage src={avatarUrl} alt={name} />
                                      ) : null}
                                      <AvatarFallback>
                                        {displayInitials(conn.username ?? conn.email)}
                                      </AvatarFallback>
                                    </Avatar>
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm text-white">
                                        {name}
                                      </span>
                                      {isActive && (
                                        <Badge className="bg-green-500/20 text-green-500 border-green-500/30 text-xs px-1.5 py-0">
                                          In session
                                        </Badge>
                                      )}
                                    </div>
                                    {handle ? (
                                      <span className="text-xs text-gray-400">
                                        {handle}
                                      </span>
                                    ) : null}
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    void inviteFriend(receiverId, name)
                                  }
                                  disabled={isInvited || isActive}
                                  className={
                                    isInvited || isActive
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
                            })
                          )}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-white/10">
                        <p className="text-xs text-gray-400">
                          Tip: Invites appear under Notifications — tap one to open
                          this session in the code editor with Live Collaboration enabled.
                          You can always share the link above manually too.
                        </p>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="flex items-center gap-2">
                {collaborationEnabled && (
                  <AnimatePresence>
                    {activeCollaborators.map((collab, index) => (
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
                            borderColor: collab.color,
                          }}
                        >
                          <AvatarImage src={collab.avatar} alt={collab.name} />
                          <AvatarFallback>{collab.name[0]}</AvatarFallback>
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
                              backgroundColor: collab.color,
                            }}
                          >
                            <motion.div
                              animate={{
                                scale: [1, 1.2, 1],
                              }}
                              transition={{
                                repeat: Infinity,
                                duration: 1,
                              }}
                              className="w-full h-full rounded-full"
                              style={{
                                backgroundColor: collab.color,
                              }}
                            />
                          </motion.div>
                        )}
                      </motion.div>
                    ))}
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
                              opacity: [1, 0.5, 1],
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
                                backgroundColor: collab.color,
                              }}
                            />
                            <div
                              className="w-1 h-1 rounded-full"
                              style={{
                                backgroundColor: collab.color,
                              }}
                            />
                            <div
                              className="w-1 h-1 rounded-full"
                              style={{
                                backgroundColor: collab.color,
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
                    <div className="relative rounded-md" style={{ height: 420 }}>
                      {collaborationEnabled &&
                        (!editorSurfaceReady || yjsStatus !== "synced") && (
                          <div className="absolute inset-0 z-10 flex flex-col gap-2 rounded-md border border-white/10 bg-[#0A0A0A]/95 p-4">
                            <Skeleton className="h-3 w-2/3 bg-white/10" />
                            <Skeleton className="h-3 w-full bg-white/10" />
                            <Skeleton className="min-h-[320px] flex-1 w-full bg-white/10" />
                            <p className="text-center text-xs text-gray-400">
                              Loading editor and syncing CRDT (Yjs)…
                            </p>
                          </div>
                        )}
                      <Editor
                        height="420px"
                        loading={
                          <Skeleton className="h-[420px] w-full rounded-md bg-white/10" />
                        }
                        defaultLanguage={
                          language === "javascript"
                            ? "javascript"
                            : language === "json"
                              ? "json"
                              : language
                        }
                        defaultValue={code}
                        onMount={handleMonacoMount}
                        options={{
                          fontSize: 13,
                          minimap: { enabled: false },
                          automaticLayout: true,
                          scrollBeyondLastLine: false,
                        }}
                      />
                    </div>
                  )}{" "}
                </div>

                {collaborationEnabled && activeCollaborators.length > 0 && (
                  <div className="absolute top-0 left-0 pointer-events-none">
                    {activeCollaborators.map((collab) => (
                      <motion.div
                        key={collab.id}
                        className="absolute"
                        animate={{
                          top: `${
                            Math.floor(collab.cursorPosition / 50) * 20
                          }px`,
                          left: `${(collab.cursorPosition % 50) * 8}px`,
                        }}
                        transition={{
                          duration: 0.3,
                        }}
                      >
                        <div
                          className="w-0.5 h-5"
                          style={{
                            backgroundColor: collab.color,
                          }}
                        />
                        <div
                          className="text-xs px-2 py-0.5 rounded mt-1 whitespace-nowrap"
                          style={{
                            backgroundColor: collab.color,
                            color: "white",
                          }}
                        >
                          {collab.name}
                        </div>
                      </motion.div>
                    ))}
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
                    {output || "Run your code to see output here..."}
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
                    The buffer is merged with{" "}
                    <span className="text-emerald-400">Yjs (CRDT)</span> over the
                    y-websocket server. Edits are also validated through an{" "}
                    <span className="text-amber-300">operational transformation</span>{" "}
                    pipeline on the API for ordering and history.
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
                      <li>• Use console.log() to print output</li>
                      <li>• Return values will be displayed automatically</li>
                      <li>• Errors will be caught and displayed above</li>
                    </>
                  )}
                  {language === "html" && (
                    <>
                      <li>• Preview updates automatically</li>
                      <li>• Full HTML5 support with inline styles</li>
                      <li>• Scripts are sandboxed for security</li>
                    </>
                  )}
                  {language === "css" && (
                    <>
                      <li>• Styles are applied to a preview template</li>
                      <li>• Use .card class for the main container</li>
                      <li>• Preview updates in real-time</li>
                    </>
                  )}
                  {language === "json" && (
                    <>
                      <li>• JSON will be validated and formatted</li>
                      <li>• Invalid JSON will show an error</li>
                      <li>• Use proper quotes and syntax</li>
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
            <h3 className="text-xl text-white mb-4">Quick Snippets</h3>
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
                    <span className="text-white text-sm">{snippet.title}</span>
                    <Badge
                      variant="outline"
                      className="text-xs text-white border-white/20"
                    >
                      {snippet.lang}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-400">{snippet.description}</p>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
