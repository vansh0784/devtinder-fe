import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { FaTelegramPlane } from "react-icons/fa";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Code2,
  ExternalLink,
  TrendingUp,
  Briefcase,
  Send,
  ImageIcon,
  Check,
  ChevronDown,
} from "lucide-react";
import { motion } from "framer-motion";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { getApi, postApi, postFormDataApi } from "../utils/api";
import {
  type IComment,
  type IPost,
  type IBaseResponse,
  type IUser,
} from "../utils/types";
import { useAuth } from "../hooks/useAuth";

function getAuthorId(post: IPost): string {
  const a = post.author;
  if (typeof a === "string") return a;
  if (a && typeof a === "object" && "_id" in a && a._id) return String(a._id);
  return "";
}

function authorDisplayName(post: IPost): string {
  const a = post.author;
  if (
    typeof a === "object" &&
    a &&
    "username" in a &&
    typeof a.username === "string" &&
    a.username
  )
    return a.username;
  if (post.authorName) return post.authorName;
  if (post.authorUsername) return post.authorUsername.replace(/^@/, "");
  return "Developer";
}

function authorHandle(post: IPost): string {
  const raw = post.authorUsername || authorDisplayName(post);
  const s = raw.replace(/^@/, "");
  return `@${s}`;
}

function avatarSrc(post: IPost): string {
  const a = post.author;
  if (
    typeof a === "object" &&
    a &&
    typeof a.avatar === "string" &&
    a.avatar
  )
    return a.avatar;
  return post.authorAvatar || "";
}

function projectHref(link: string): string {
  const t = link.trim();
  if (!t) return "#";
  if (/^https?:\/\//i.test(t)) return t;
  return `https://${t}`;
}

function formatRelative(iso?: string): string {
  if (!iso) return "Just now";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Just now";
  const sec = (Date.now() - d.getTime()) / 1000;
  if (sec < 60) return "Just now";
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
  if (sec < 604800) return `${Math.floor(sec / 86400)}d ago`;
  return d.toLocaleDateString();
}

function commentAuthorLabel(c: IComment): string {
  const u = c.user;
  if (typeof u === "object" && u && typeof u.username === "string")
    return u.username || "Someone";
  return "Someone";
}

function postLikedByUser(post: IPost, user: IUser | null): boolean {
  if (!user?._id) return false;
  return Boolean(
    post.likes?.some((id) => String(id) === String(user._id)),
  );
}

function EmptyFeedPlaceholder({ tab }: { tab: string }) {
  const hints: Record<string, string> = {
    trending: "When people start posting and liking, trending picks will appear here.",
    recent: "No posts yet. Say hi with your first update above.",
    network: "Posts from people you arenâ€™t viewing as yourself appear here.",
  };
  return (
    <div className="glass rounded-2xl p-12 text-center">
      <Code2 className="w-16 h-16 text-[#007BFF] mx-auto mb-4" />
      <p className="text-gray-400">{hints[tab] ?? "Nothing to show yet."}</p>
    </div>
  );
}

interface FeedPostCardProps {
  post: IPost;
  index: number;
  user: IUser | null;
  hiredUsers: string[];
  bookmarkedPostIds: string[];
  commentsOpen: boolean;
  commentDraft: string;
  submittingComment: boolean;
  liking: boolean;
  onProfile: () => void;
  onHire: () => void;
  onToggleBookmark: () => void;
  onToggleLike: () => void;
  onToggleComments: () => void;
  onDraftChange: (v: string) => void;
  onSubmitComment: () => void;
  onShare: () => void;
}

function FeedPostCard({
  post,
  index,
  user,
  hiredUsers,
  bookmarkedPostIds,
  commentsOpen,
  commentDraft,
  submittingComment,
  liking,
  onProfile,
  onHire,
  onToggleBookmark,
  onToggleLike,
  onToggleComments,
  onDraftChange,
  onSubmitComment,
  onShare,
}: FeedPostCardProps) {
  const liked = postLikedByUser(post, user);
  const bookmarks = bookmarkedPostIds.includes(post._id);
  const authorId = getAuthorId(post);
  const name = authorDisplayName(post);
  const handle = authorHandle(post);
  const imgs = Array.isArray(post.images) ? post.images : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
    >
      <Card className="glass border-white/10 p-6 hover:border-[#007BFF]/50 transition-colors overflow-hidden">
        <div className="flex flex-col gap-5">
          <div className="flex items-start justify-between gap-4">
            <button
              type="button"
              className="flex items-center gap-3 text-left rounded-lg focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#007BFF]/60"
              onClick={onProfile}
            >
              <Avatar className="w-12 h-12 border-2 border-[#007BFF] shrink-0">
                <AvatarImage src={avatarSrc(post)} alt={name} />
                <AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-white font-medium">{name}</span>
                  {post.authorVerified && (
                    <div className="w-4 h-4 bg-[#007BFF] rounded-full flex items-center justify-center">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                <span className="text-sm text-gray-400">
                  {handle} Â· {formatRelative(post.createdAt)}
                </span>
              </div>
            </button>
            <div className="flex flex-wrap gap-2 justify-end shrink-0">
              {user?._id && authorId !== user._id && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-[#FFF] bg-[#1e1e1e]"
                  >
                    Follow
                  </Button>
                  <Button
                    size="sm"
                    onClick={onHire}
                    disabled={hiredUsers.includes(post._id)}
                    className={
                      hiredUsers.includes(post._id)
                        ? "bg-green-500/20 text-green-500 border border-green-500/30 hover:bg-green-500/20"
                        : "bg-linear-to-r from-[#007BFF] to-[#8A2BE2] hover:opacity-90"
                    }
                  >
                    {hiredUsers.includes(post._id) ? (
                      <>
                        <Check className="w-4 h-4 mr-1" />
                        Contacted
                      </>
                    ) : (
                      <>
                        <Briefcase className="w-4 h-4 mr-1" />
                        Hire
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>

          {post.text ? (
            <p className="text-white whitespace-pre-wrap leading-relaxed">
              {post.text}
            </p>
          ) : null}

          {post.code?.trim() ? (
            <div className="bg-black/50 rounded-xl p-4 border border-white/10 overflow-x-auto">
              <pre className="text-sm text-green-400 font-mono">
                <code>{post.code}</code>
              </pre>
            </div>
          ) : null}

          {imgs.length > 0 ? (
            <div
              className={
                imgs.length > 1
                  ? "grid grid-cols-2 gap-2 rounded-xl overflow-hidden"
                  : "rounded-xl overflow-hidden"
              }
            >
              {imgs.map((src) => (
                <div key={src} className="relative bg-black/30 min-h-48">
                  <ImageWithFallback
                    src={src}
                    alt="Post"
                    className="w-full h-64 object-cover"
                  />
                </div>
              ))}
            </div>
          ) : null}

          {post.projectLink?.trim() ? (
            <a
              href={projectHref(post.projectLink)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[#007BFF] hover:underline text-sm inline-flex items-center"
            >
              <ExternalLink className="w-4 h-4 shrink-0" />
              {post.projectLink}
            </a>
          ) : null}

          {(post.tags?.length ?? 0) > 0 ? (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="border-white/20 text-gray-300"
                >
                  #{tag.replace(/^#/, "")}
                </Badge>
              ))}
            </div>
          ) : null}

          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
              <motion.button
                type="button"
                disabled={liking || !user?._id}
                title={user?._id ? "Like" : "Sign in to like"}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.95 }}
                onClick={onToggleLike}
                className={`flex items-center gap-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                  liked ? "text-red-500" : "text-gray-400 hover:text-red-500"
                }`}
              >
                <Heart
                  className={`w-5 h-5 ${liked ? "fill-current" : ""}`}
                />
                <span>{post.likes?.length ?? 0}</span>
              </motion.button>
              <button
                type="button"
                onClick={onToggleComments}
                className="flex items-center gap-2 text-gray-400 hover:text-[#007BFF] transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                <span>{post.comments?.length ?? 0}</span>
              </button>
              <button
                type="button"
                onClick={onShare}
                className="flex items-center gap-2 text-gray-400 hover:text-[#007BFF] transition-colors"
              >
                <Share2 className="w-5 h-5" />
                <span>{post.shares ?? 0}</span>
              </button>
            </div>
            <motion.button
              type="button"
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.95 }}
              onClick={onToggleBookmark}
              className={`transition-colors ${
                bookmarks
                  ? "text-[#007BFF]"
                  : "text-gray-400 hover:text-[#007BFF]"
              }`}
              aria-label="Bookmark"
            >
              <Bookmark
                className={`w-5 h-5 ${bookmarks ? "fill-current" : ""}`}
              />
            </motion.button>
          </div>

          {commentsOpen ? (
            <div className="rounded-xl border border-white/10 bg-black/25 p-4 space-y-3">
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Comments
              </p>
              <ul className="max-h-52 overflow-y-auto space-y-3 pr-1">
                {(post.comments ?? []).length === 0 ? (
                  <li className="text-sm text-gray-500">No comments yet.</li>
                ) : (
                  (post.comments ?? []).map((c, i) => (
                    <li key={`${post._id}-c-${i}-${String(c.createdAt ?? i)}`}>
                      <div className="text-sm">
                        <span className="text-[#007BFF] font-medium mr-2">
                          {commentAuthorLabel(c)}
                        </span>
                        <span className="text-gray-300">{c.text}</span>
                        {c.createdAt ? (
                          <span className="text-gray-500 text-xs ml-2 tabular-nums">
                            Â· {formatRelative(c.createdAt)}
                          </span>
                        ) : null}
                      </div>
                    </li>
                  ))
                )}
              </ul>
              {!user?._id ? (
                <p className="text-xs text-gray-500">Sign in to comment.</p>
              ) : (
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    value={commentDraft}
                    onChange={(e) => onDraftChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        void onSubmitComment();
                      }
                    }}
                    placeholder="Write a commentâ€¦"
                    className="bg-[#0A0A0A] border-white/15 text-white"
                  />
                  <Button
                    type="button"
                    size="sm"
                    disabled={
                      submittingComment || !commentDraft.trim()
                    }
                    onClick={onSubmitComment}
                    className="bg-linear-to-r from-[#007BFF] to-[#8A2BE2] shrink-0"
                  >
                    <Send className="w-4 h-4 sm:mr-1" />
                    <span className="hidden sm:inline">Reply</span>
                  </Button>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </Card>
    </motion.div>
  );
}

export function HomePage() {
  const onNavigate = useNavigate();
  const { user } = useAuth();

  const [composerText, setComposerText] = useState("");
  const [composerCode, setComposerCode] = useState("");
  const [composerLink, setComposerLink] = useState("");
  const [composerTags, setComposerTags] = useState("");
  const [composerImage, setComposerImage] = useState<File | null>(null);
  const [composerMoreOpen, setComposerMoreOpen] = useState(false);
  const [creatingPost, setCreatingPost] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);

  const [feedPosts, setFeedPosts] = useState<IPost[]>([]);
  const [loadingFeed, setLoadingFeed] = useState(true);

  const [bookmarkedPostIds, setBookmarkedPostIds] = useState<string[]>([]);
  const [hiredUsers, setHiredUsers] = useState<string[]>([]);
  const [hireDialogOpen, setHireDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<IPost | null>(null);
  const [customMessage, setCustomMessage] = useState("");

  const [commentsOpenFor, setCommentsOpenFor] = useState<
    Record<string, boolean>
  >({});
  const [commentDrafts, setCommentDrafts] = useState<
    Record<string, string>
  >({});
  const [commentSending, setCommentSending] = useState<
    Record<string, boolean>
  >({});
  const [likingIds, setLikingIds] = useState<Record<string, boolean>>({});

  const loadPosts = useCallback(async () => {
    setLoadingFeed(true);
    try {
      const res = await getApi<IPost[]>(`/posts?page=1&size=40`);
      setFeedPosts(Array.isArray(res) ? res : []);
    } catch {
      setFeedPosts([]);
    } finally {
      setLoadingFeed(false);
    }
  }, []);

  useEffect(() => {
    void loadPosts();
  }, [loadPosts]);

  const trendingPosts = useMemo(
    () =>
      [...feedPosts].sort(
        (a, b) => (b.likes?.length ?? 0) - (a.likes?.length ?? 0),
      ),
    [feedPosts],
  );

  const recentPosts = useMemo(() => {
    return [...feedPosts].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [feedPosts]);

  const networkPosts = useMemo(() => {
    if (!user?._id) return [];
    return feedPosts.filter((p) => getAuthorId(p) !== user._id);
  }, [feedPosts, user?._id]);

  const canSubmitComposer = Boolean(
    composerText.trim() ||
      composerCode.trim() ||
      composerLink.trim() ||
      composerImage,
  );

  const openHireDialog = (post: IPost) => {
    const body = post.text?.trim() ?? "";
    const snippet = body.slice(0, 50);
    const suffix = body.length > 50 ? "…" : "";
    setSelectedUser(post);
    setCustomMessage(
      `Hi ${authorDisplayName(post)},

I came across your profile on DevTinder and I'm impressed by your work, especially your recent post about "${snippet}${suffix}".

I have an exciting opportunity that I think would be a great fit for your skills. Would you be interested in discussing a potential collaboration or position?

Looking forward to connecting!

Best regards`,
    );
    setHireDialogOpen(true);
  };

  const sendHireMessage = () => {
    if (!selectedUser) return;
    setHiredUsers((prev) => [...prev, selectedUser._id]);
    setHireDialogOpen(false);
    toast.success(`Hire request sent to ${authorDisplayName(selectedUser)}.`, {
      description:
        "They'll receive your message and can respond via chat.",
    });
    setSelectedUser(null);
    setCustomMessage("");
  };

  const handleCreatePost = async () => {
    if (!user?._id) {
      toast.message("Sign in to create a post.");
      return;
    }
    if (!canSubmitComposer || creatingPost) return;
    setCreatingPost(true);
    try {
      const fd = new FormData();
      const t = composerText.trim();
      if (t) fd.append("text", t);
      const c = composerCode.trim();
      if (c) fd.append("code", c);
      const l = composerLink.trim();
      if (l) fd.append("projectLink", l);
      const tg = composerTags.trim();
      if (tg) fd.append("tags", tg);
      if (composerImage) fd.append("image", composerImage);
      await postFormDataApi<IBaseResponse>("/posts", fd);
      toast.success("Your post is live.");
      setComposerText("");
      setComposerCode("");
      setComposerLink("");
      setComposerTags("");
      setComposerImage(null);
      if (imageInputRef.current) imageInputRef.current.value = "";
      await loadPosts();
    } finally {
      setCreatingPost(false);
    }
  };

  const toggleCommentSection = (postId: string) => {
    setCommentsOpenFor((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const handleSubmitComment = async (postId: string) => {
    const draft = commentDrafts[postId]?.trim();
    if (!draft || commentSending[postId]) return;
    setCommentSending((s) => ({ ...s, [postId]: true }));
    try {
      await postApi<{ comment: string }, IBaseResponse>(
        `/posts/${postId}/comment`,
        { comment: draft },
      );
      setCommentDrafts((d) => ({ ...d, [postId]: "" }));
      await loadPosts();
    } finally {
      setCommentSending((s) => ({ ...s, [postId]: false }));
    }
  };

  const handleToggleLike = async (postId: string) => {
    if (!user?._id || likingIds[postId]) return;
    setLikingIds((m) => ({ ...m, [postId]: true }));
    try {
      await postApi<object, IBaseResponse>(`/posts/${postId}/like`, {});
      await loadPosts();
    } finally {
      setLikingIds((m) => ({ ...m, [postId]: false }));
    }
  };

  const toggleBookmark = (postId: string) => {
    setBookmarkedPostIds((prev) =>
      prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId],
    );
  };

  const handleSharePost = async (post: IPost) => {
    const url = `${window.location.origin}/home?post=${post._id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied.");
    } catch {
      toast.error("Could not copy link.");
    }
  };

  const renderFeedTab = (list: IPost[], tabKey: string) => {
    if (loadingFeed) {
      return (
        <div className="glass rounded-2xl p-12 text-center text-gray-400">
          Loading feed…
        </div>
      );
    }
    if (!list.length) {
      return <EmptyFeedPlaceholder tab={tabKey} />;
    }
    return (
      <div className="space-y-6">
        {list.map((post, index) => (
          <FeedPostCard
            key={post._id}
            post={post}
            index={index}
            user={user}
            hiredUsers={hiredUsers}
            bookmarkedPostIds={bookmarkedPostIds}
            commentsOpen={Boolean(commentsOpenFor[post._id])}
            commentDraft={commentDrafts[post._id] ?? ""}
            submittingComment={Boolean(commentSending[post._id])}
            liking={Boolean(likingIds[post._id])}
            onProfile={() => {
              const aid = getAuthorId(post);
              if (aid) void onNavigate(`/user/detail/${aid}`);
            }}
            onHire={() => openHireDialog(post)}
            onToggleBookmark={() => toggleBookmark(post._id)}
            onToggleLike={() => void handleToggleLike(post._id)}
            onToggleComments={() => toggleCommentSection(post._id)}
            onDraftChange={(v) =>
              setCommentDrafts((d) => ({ ...d, [post._id]: v }))
            }
            onSubmitComment={() => void handleSubmitComment(post._id)}
            onShare={() => void handleSharePost(post)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl text-white mb-2">Developer Feed</h1>
        <p className="text-gray-400">
          Discover projects and connect with developers.
          {!loadingFeed && feedPosts.length > 0 ? (
            <span className="text-emerald-400/90">
              {" "}
              Showing {feedPosts.length} post{feedPosts.length === 1 ? "" : "s"}.
            </span>
          ) : null}
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        <Card className="glass border-white/10 p-4 hover:border-[#007BFF]/50 transition-colors">
          <div className="flex items-start gap-3">
            <Avatar className="w-10 h-10 border-2 border-[#007BFF] shrink-0">
              <AvatarImage
                src={user?.avatar ?? undefined}
                alt={user?.username ?? "You"}
              />
              <AvatarFallback>You</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 space-y-3">
              <Textarea
                value={composerText}
                onChange={(e) => setComposerText(e.target.value)}
                placeholder="What's on your mind? Share builds, snippets, or ideas…"
                className="min-h-22 bg-[#0A0A0A] border-white/10 text-white resize-none"
              />

              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  setComposerImage(f ?? null);
                }}
              />

              <Collapsible
                open={composerMoreOpen}
                onOpenChange={setComposerMoreOpen}
              >
                <CollapsibleTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full justify-between border-white/15 text-gray-300 hover:bg-white/5"
                  >
                    <span>Code · link · tags</span>
                    <ChevronDown
                      className={`w-4 h-4 shrink-0 transition-transform ${composerMoreOpen ? "rotate-180" : ""}`}
                    />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-3 pt-3 data-[state=closed]:animate-none">
                  <Textarea
                    value={composerCode}
                    onChange={(e) => setComposerCode(e.target.value)}
                    placeholder="Optional code snippet"
                    className="min-h-24 bg-[#0A0A0A] border-white/10 text-green-400 font-mono text-sm resize-y"
                  />
                  <Input
                    value={composerLink}
                    onChange={(e) => setComposerLink(e.target.value)}
                    placeholder="Project or repo URL (optional)"
                    className="bg-[#0A0A0A] border-white/10 text-white"
                  />
                  <Input
                    value={composerTags}
                    onChange={(e) => setComposerTags(e.target.value)}
                    placeholder="Tags: react, node, typescript"
                    className="bg-[#0A0A0A] border-white/10 text-white"
                  />
                </CollapsibleContent>
              </Collapsible>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="text-gray-400 hover:text-[#007BFF] hover:bg-[#007BFF]/10"
                    onClick={() => imageInputRef.current?.click()}
                  >
                    <ImageIcon className="w-4 h-4 mr-1" />
                    {composerImage ? composerImage.name : "Image"}
                  </Button>
                  {composerImage ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="text-xs text-gray-500"
                      onClick={() => {
                        setComposerImage(null);
                        if (imageInputRef.current)
                          imageInputRef.current.value = "";
                      }}
                    >
                      Remove
                    </Button>
                  ) : null}
                </div>
                <Button
                  size="sm"
                  disabled={!canSubmitComposer || creatingPost}
                  onClick={() => void handleCreatePost()}
                  className="bg-linear-to-r from-[#007BFF] to-[#8A2BE2] hover:opacity-90 disabled:opacity-50"
                >
                  <FaTelegramPlane className="mr-2" />
                  {creatingPost ? "Posting…" : "Post"}
                </Button>
              </div>
              <p className="text-[11px] text-gray-500">
                Posts need text, code, a link, and/or an image. Tags can be comma-separated.
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      <Tabs defaultValue="trending" className="mb-8">
        <TabsList className="bg-white/5 border border-white/10 flex-wrap">
          <TabsTrigger
            value="trending"
            className="data-[state=active]:bg-[#007BFF] text-white gap-2"
          >
            <TrendingUp className="w-4 h-4 shrink-0" />
            Trending
          </TabsTrigger>
          <TabsTrigger
            value="recent"
            className="data-[state=active]:bg-[#007BFF] text-white"
          >
            Recent
          </TabsTrigger>
          <TabsTrigger
            value="network"
            className="data-[state=active]:bg-[#007BFF] text-white"
          >
            My Network
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trending" className="mt-6">
          {renderFeedTab(trendingPosts, "trending")}
        </TabsContent>
        <TabsContent value="recent" className="mt-6">
          {renderFeedTab(recentPosts, "recent")}
        </TabsContent>
        <TabsContent value="network" className="mt-6">
          {renderFeedTab(networkPosts, "network")}
        </TabsContent>
      </Tabs>

      <Dialog open={hireDialogOpen} onOpenChange={setHireDialogOpen}>
        <DialogContent className="bg-[#1C1C1E] border-white/10 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-linear-to-r from-[#007BFF] to-[#8A2BE2] flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              Send Hire Request
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {selectedUser ? (
                <div className="flex items-center gap-3 mt-3 p-3 bg-white/5 rounded-xl border border-white/10 flex-wrap">
                  <Avatar className="w-10 h-10 border-2 border-[#007BFF]">
                    <AvatarImage
                      src={avatarSrc(selectedUser)}
                      alt={authorDisplayName(selectedUser)}
                    />
                    <AvatarFallback>
                      {authorHandle(selectedUser)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-white">
                        {authorDisplayName(selectedUser)}
                      </span>
                      {selectedUser.authorVerified && (
                        <div className="w-3 h-3 bg-[#007BFF] rounded-full flex items-center justify-center">
                          <svg
                            className="w-2 h-2 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-gray-400">
                      {authorHandle(selectedUser)}
                    </span>
                  </div>
                  <div className="ml-auto flex flex-wrap gap-1">
                    {(selectedUser.tags ?? []).slice(0, 3).map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="border-white/20 text-gray-300 text-xs"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : null}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="hire-message" className="text-white mb-2 block">
                Your Message
              </Label>
              <Textarea
                id="hire-message"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="min-h-[200px] bg-[#0A0A0A] border-white/10 text-white resize-none"
                placeholder="Write your hire request message..."
              />
              <p className="text-xs text-gray-400 mt-2">
                Tip: Mention specific skills or projects that stood out—it often improves replies.
              </p>
            </div>

            <div className="p-4 bg-[#007BFF]/10 rounded-xl border border-[#007BFF]/30">
              <h4 className="text-sm text-[#007BFF] mb-2 flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                What happens next?
              </h4>
              <ul className="text-xs text-gray-400 space-y-1.5">
                <li className="flex items-start gap-2">
                  <span className="text-[#007BFF] mt-0.5">•</span>
                  <span>
                    Your message is drafted for{" "}
                    {selectedUser
                      ? authorDisplayName(selectedUser)
                      : "this developer"}
                    ’s inbox.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#007BFF] mt-0.5">•</span>
                  <span>They receive a notification about your hire request.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#007BFF] mt-0.5">•</span>
                  <span>If interested, they can reply via chat.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#007BFF] mt-0.5">•</span>
                  <span>You&apos;ll hear back when they respond.</span>
                </li>
              </ul>
            </div>
          </div>

          <DialogFooter className="flex gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => setHireDialogOpen(false)}
              className="border-white/20 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={sendHireMessage}
              disabled={!customMessage.trim()}
              className="bg-linear-to-r from-[#007BFF] to-[#8A2BE2] hover:opacity-90"
            >
              <Send className="w-4 h-4 mr-2" />
              Send Hire Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
