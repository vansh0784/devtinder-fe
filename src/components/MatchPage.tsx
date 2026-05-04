import { useEffect, useMemo, useState } from "react";
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
import type { IUser, IBaseResponse } from "../utils/types";
import { getApi, postApi } from "../utils/api";
import { toast } from "sonner";
import { useAuth } from "../hooks/useAuth";
import { displayField, displayInitials } from "../utils/display";

export function MatchPage() {
  const { user } = useAuth();

  const [allUser, setAllUser] = useState<IUser[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matches, setMatches] = useState<string[]>([]);
  const [passes, setPasses] = useState<string[]>([]);
  const [devsLoaded, setDevsLoaded] = useState(false);

  useEffect(() => {
    getApi<IUser[]>("/devs")
      .then((res) => setAllUser([...res].reverse()))
      .catch((err) => {
        console.error(err);
        setAllUser([]);
      })
      .finally(() => setDevsLoaded(true));
  }, []);

  const feed = useMemo(() => {
    if (!user?._id) return [];
    return allUser.filter((d) => String(d._id) !== String(user._id));
  }, [allUser, user?._id]);

  useEffect(() => {
    setCurrentIndex(0);
  }, [user?._id]);

  useEffect(() => {
    setCurrentIndex((i) =>
      feed.length === 0 ? 0 : Math.min(i, feed.length - 1),
    );
  }, [feed.length]);

  const currentDev = feed[currentIndex];
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  const handleDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    if (Math.abs(info.offset.x) > 100) {
      if (info.offset.x > 0) {
        handleLike();
      } else {
        handlePass();
      }
    }
  };

  const nextCard = () => {
    setTimeout(() => {
      setCurrentIndex((i) => {
        if (i < feed.length - 1) {
          x.set(0);
          return i + 1;
        }
        return i;
      });
    }, 300);
  };

  const handleLike = () => {
    if (!currentDev?._id || !user?._id) return;

    const receiverId = currentDev._id;
    setMatches((m) => [...m, receiverId]);
    nextCard();

    postApi<{ recieverId: string }, IBaseResponse>(`/connection/right`, {
      recieverId: receiverId,
    })
      .then((res) => {
        if (res.statusCode === 200) {
          toast.success(res.message ?? "Sent");
        }
      })
      .catch(() => toast.error("Request failed, Please try later"));
  };

  const handlePass = () => {
    if (!currentDev?._id) return;
    const recieverId = currentDev._id;
    setPasses((p) => [...p, recieverId]);
    nextCard();

    postApi<{ recieverId: string }, IBaseResponse>(`/connection/left`, {
      recieverId,
    }).catch(() => toast.error("Request failed, Please try later"));
  };

  if (!devsLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-gray-400">
        Loading developers…
      </div>
    );
  }

  if (!user?._id) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center text-gray-400 max-w-md mx-auto">
        Sign in from the auth page to view and swipe on developer matches.
      </div>
    );
  }

  if (allUser.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center text-gray-400">
        No developers to show right now.
      </div>
    );
  }

  if (feed.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center text-gray-400">
        No other developers to show right now.
      </div>
    );
  }

  const noMoreCards = currentIndex >= feed.length;

  if (noMoreCards) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-24 h-24 bg-linear-to-r from-[#007BFF] to-[#8A2BE2] rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl text-white mb-4">No More Matches!</h2>
          <p className="text-gray-400 mb-8">
            You've reviewed all available developers. Check back later for more!
          </p>
          <div className="glass rounded-2xl p-6 inline-block">
            <p className="text-[#007BFF] mb-2">Your Stats</p>
            <div className="flex gap-8">
              <div>
                <div className="text-2xl text-white">{matches.length}</div>
                <div className="text-sm text-gray-400">Liked</div>
              </div>
              <div>
                <div className="text-2xl text-white">{passes.length}</div>
                <div className="text-sm text-gray-400">Passed</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl text-white mb-2">Find Your Match</h1>
          <p className="text-gray-400">Swipe right to connect, left to pass</p>
        </div>
        <div className="relative h-[600px] flex items-center justify-center">
          <AnimatePresence>
            {feed.slice(currentIndex, currentIndex + 2).map((dev, index) => {
              const unameClean = displayField(dev?.username).replace(/^@+/, "");
              const devName = unameClean || "Developer";
              const devBio = displayField(dev?.bio);
              const devLocation = displayField(dev?.location);
              const avatarUrl = displayField(dev?.avatar);
              return (
              <motion.div
                key={dev?._id}
                style={{
                  x: index === 0 ? x : 0,
                  rotate: index === 0 ? rotate : 0,
                  opacity: index === 0 ? opacity : 1,
                  zIndex: index === 0 ? 20 : 10,
                  scale: index === 0 ? 1 : 0.95,
                }}
                drag={index === 0 ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={index === 0 ? handleDragEnd : undefined}
                className="absolute w-full"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{
                  scale: index === 0 ? 1 : 0.95,
                  opacity: 1,
                }}
                exit={{ scale: 0.9, opacity: 0 }}
              >
                <div
                  className="rounded-xl border border-white/10 overflow-hidden shadow-2xl"
                  style={{
                    backgroundColor: "#1C1C1E",
                    opacity: 1,
                  }}
                >
                  <div
                    className={`h-40 bg-linear-to-r from-[#8A2BE2] to-[#FF1493] relative`}
                  >
                    <div className="absolute inset-0 flex items-center justify-center opacity-20">
                      <Code2 className="w-32 h-32 text-white" />
                    </div>
                  </div>
                  <div className="relative -mt-16 px-6">
                    <Avatar className="w-32 h-32 border-4 border-[#1C1C1E] mx-auto shadow-2xl">
                      {avatarUrl ? (
                        <AvatarImage src={avatarUrl} alt={devName} />
                      ) : null}
                      <AvatarFallback>
                        {displayInitials(dev?.username)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="p-6 pt-4 bg-[#1C1C1E]">
                    <div className="text-center mb-6">
                      <h2 className="text-2xl text-white mb-1">
                        {devName}
                      </h2>
                      {unameClean ? (
                        <p className="text-gray-400 mb-4">@{unameClean}</p>
                      ) : null}
                      <p className="text-gray-300 mb-4">
                        {devBio || "No bio yet."}
                      </p>

                      <div className="flex items-center justify-center gap-4 text-sm text-gray-400 mb-4">
                        {devLocation ? (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {devLocation}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 opacity-70">
                            <MapPin className="w-4 h-4" />
                            —
                          </span>
                        )}
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          {2200}
                        </div>
                      </div>
                    </div>
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Zap className="w-4 h-4 text-[#007BFF]" />
                        <span className="text-sm text-gray-400">Skills</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {dev?.skills &&
                          dev?.skills.map((skill) => {
                            const s = displayField(skill);
                            if (!s) return null;
                            return (
                            <Badge
                              key={skill}
                              className="bg-[#007BFF]/20 border border-[#007BFF]/30"
                            >
                              {s}
                            </Badge>
                            );
                          })}
                      </div>
                    </div>
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Heart className="w-4 h-4 text-[#8A2BE2]" />
                        <span className="text-sm text-gray-400">Interests</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {dev?.interests &&
                          dev?.interests.map((interest, i) => {
                            const lab = displayField(String(interest));
                            if (!lab)
                              return null;
                            return (
                            <Badge
                              key={`${lab}-${i}`}
                              variant="outline"
                              className="border-white/20 text-white"
                            >
                              {lab}
                            </Badge>
                            );
                          })}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                      <div className="text-center">
                        <div className="text-xl text-white">{3320}</div>
                        <div className="text-sm text-gray-400">
                          GitHub Stars
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
            })}
          </AnimatePresence>
        </div>
        <div className="flex justify-center gap-6 mt-8">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePass}
            className="w-16 h-16 rounded-full bg-white/10 border-2 border-red-500 flex items-center justify-center hover:bg-red-500/20 transition-colors"
          >
            <X className="w-8 h-8 text-red-500" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLike}
            className="w-20 h-20 rounded-full bg-linear-to-r from-[#007BFF] to-[#8A2BE2] flex items-center justify-center shadow-xl shadow-[#007BFF]/50"
          >
            <Heart className="w-10 h-10 text-white" />
          </motion.button>
        </div>
        <div className="text-center mt-6 text-gray-400 text-sm">
          {currentIndex + 1} / {feed.length}
        </div>
      </div>
    </div>
  );
}
