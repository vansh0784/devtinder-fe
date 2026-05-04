import { useCallback, useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Code2, ChevronRight, ChevronLeft, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "./ui/progress";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getApi, patchApi } from "../utils/api";
import { useAuth } from "../hooks/useAuth";
import type { IBaseResponse, IUser } from "../utils/types";

const SKILLS = [
  "React",
  "TypeScript",
  "Node.js",
  "Python",
  "Go",
  "Rust",
  "Vue",
  "Angular",
  "Next.js",
  "GraphQL",
  "Docker",
  "Kubernetes",
  "AWS",
  "Azure",
  "GCP",
  "MongoDB",
  "PostgreSQL",
  "Redis",
  "TailwindCSS",
  "React Native",
  "Flutter",
  "Swift",
  "Kotlin",
  "Java",
];

const INTERESTS = [
  "Web Development",
  "Mobile Apps",
  "AI/ML",
  "DevOps",
  "Cloud Computing",
  "Blockchain",
  "Cybersecurity",
  "Game Development",
  "IoT",
  "Data Science",
  "AR/VR",
  "Backend Development",
  "Frontend Development",
  "Full Stack",
];

const PROJECT_TYPES = [
  "Open Source",
  "Startup",
  "Freelance",
  "Learning Project",
  "Hackathon",
  "Enterprise",
  "Side Project",
  "Research",
  "Portfolio",
  "SaaS",
];

type OnboardingUpdateBody = {
  skills?: string[];
  interests?: string[];
  projectTypes?: string[];
};

export function OnboardingPage() {
  const onNavigate = useNavigate();
  const { user, setUser, authReady } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  useEffect(() => {
    if (!authReady) return;
    if (!user) {
      onNavigate("/auth", { replace: true });
    }
  }, [authReady, user, onNavigate]);

  useEffect(() => {
    if (!authReady || !user) return;
    setSelectedSkills((prev) =>
      prev.length ? prev : [...(user.skills ?? [])],
    );
    setSelectedInterests((prev) =>
      prev.length ? prev : [...(user.interests ?? [])],
    );
    setSelectedProjects((prev) =>
      prev.length ? prev : [...(user.projectTypes ?? [])],
    );
  }, [authReady, user]);

  const toggleSelection = (
    item: string,
    list: string[],
    setList: (list: string[]) => void,
  ) => {
    if (list.includes(item)) setList(list.filter((i) => i !== item));
    else setList([...list, item]);
  };

  const persistAndGoHome = useCallback(async () => {
    if (!user?._id) {
      toast.error("You need to be signed in to save your profile.");
      onNavigate("/auth");
      return;
    }

    const body: OnboardingUpdateBody = {
      skills: selectedSkills,
      interests: selectedInterests,
      projectTypes: selectedProjects,
    };

    setSubmitting(true);
    try {
      await patchApi<OnboardingUpdateBody, IBaseResponse>(
        "/user/update",
        body,
      );
      const refreshed = await getApi<IUser>("/user/profile");
      setUser(refreshed);
      toast.success("Your profile preferences are saved.");
      onNavigate("/home");
    } catch {
      /* toast handled by interceptor */
    } finally {
      setSubmitting(false);
    }
  }, [
    user?._id,
    selectedSkills,
    selectedInterests,
    selectedProjects,
    setUser,
    onNavigate,
  ]);

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
      return;
    }
    if (selectedSkills.length === 0 || selectedInterests.length === 0) {
      toast.message(
        "Pick at least one skill and one interest before finishing—or use Skip.",
      );
      return;
    }
    void persistAndGoHome();
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSkip = () => {
    onNavigate("/home");
  };

  if (!authReady) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#121212] via-[#1C1C1E] to-[#121212] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#007BFF] animate-spin" aria-hidden />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-linear-to-br from-[#121212] via-[#1C1C1E] to-[#121212] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl"
      >
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Code2 className="w-8 h-8 text-[#007BFF]" />
            <span className="text-xl gradient-text">DevTinder</span>
          </div>
          <h2 className="text-2xl text-white mb-2">Complete Your Profile</h2>
          <p className="text-gray-400">
            Help us find the perfect collaborators for you
          </p>
        </div>
        <div className="mb-8">
          <div className="flex justify-between mb-2 text-sm text-gray-400">
            <span>
              Step {step} of {totalSteps}
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        <div className="glass rounded-3xl p-8 mb-6">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-xl text-white mb-2">Select Your Skills</h3>
                <p className="text-gray-400 mb-6">
                  Choose the technologies you're proficient in
                </p>
                <div className="flex flex-wrap gap-3">
                  {SKILLS.map((skill) => (
                    <Badge
                      key={skill}
                      variant={
                        selectedSkills.includes(skill) ? "default" : "outline"
                      }
                      className={`cursor-pointer px-4 py-2 transition-all text-white ${
                        selectedSkills.includes(skill)
                          ? "bg-linear-to-r from-[#007BFF] to-[#8A2BE2] border-0"
                          : "border-white/20 hover:border-[#007BFF]"
                      }`}
                      onClick={() =>
                        toggleSelection(skill, selectedSkills, setSelectedSkills)
                      }
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
                {selectedSkills.length > 0 && (
                  <p className="text-sm text-[#007BFF] mt-4">
                    {selectedSkills.length} skill
                    {selectedSkills.length !== 1 ? "s" : ""} selected
                  </p>
                )}
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-xl text-white mb-2">Choose Your Interests</h3>
                <p className="text-gray-400 mb-6">
                  What areas of development excite you?
                </p>
                <div className="flex flex-wrap gap-3">
                  {INTERESTS.map((interest) => (
                    <Badge
                      key={interest}
                      variant={
                        selectedInterests.includes(interest)
                          ? "default"
                          : "outline"
                      }
                      className={`cursor-pointer text-white px-4 py-2 transition-all ${
                        selectedInterests.includes(interest)
                          ? "bg-linear-to-r from-[#007BFF] to-[#8A2BE2] border-0"
                          : "border-white/20 hover:border-[#007BFF]"
                      }`}
                      onClick={() =>
                        toggleSelection(
                          interest,
                          selectedInterests,
                          setSelectedInterests,
                        )
                      }
                    >
                      {interest}
                    </Badge>
                  ))}
                </div>
                {selectedInterests.length > 0 && (
                  <p className="text-sm text-[#007BFF] mt-4">
                    {selectedInterests.length} interest
                    {selectedInterests.length !== 1 ? "s" : ""} selected
                  </p>
                )}
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-xl text-white mb-2">Project Types</h3>
                <p className="text-gray-400 mb-6">
                  What kind of projects do you want to work on?
                </p>
                <div className="flex flex-wrap gap-3">
                  {PROJECT_TYPES.map((project) => (
                    <Badge
                      key={project}
                      variant={
                        selectedProjects.includes(project) ? "default" : "outline"
                      }
                      className={`text-white cursor-pointer px-4 py-2 transition-all ${
                        selectedProjects.includes(project)
                          ? "bg-linear-to-r from-[#007BFF] to-[#8A2BE2] border-0"
                          : "border-white/20 hover:border-[#007BFF]"
                      }`}
                      onClick={() =>
                        toggleSelection(
                          project,
                          selectedProjects,
                          setSelectedProjects,
                        )
                      }
                    >
                      {project}
                    </Badge>
                  ))}
                </div>
                {selectedProjects.length > 0 && (
                  <p className="text-sm text-[#007BFF] mt-4">
                    {selectedProjects.length} project type
                    {selectedProjects.length !== 1 ? "s" : ""} selected
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="flex justify-between gap-4">
          <Button
            variant="outline"
            className="border-white/20 bg-[#19191a] text-gray-200 hover:text-white hover:bg-white/10"
            onClick={handleBack}
            disabled={step === 1 || submitting}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button
            className="bg-linear-to-r from-[#007BFF] to-[#8A2BE2] hover:opacity-90"
            onClick={handleNext}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving…
              </>
            ) : step === totalSteps ? (
              "Get Started"
            ) : (
              <>
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>

        <div className="text-center mt-6">
          <button
            type="button"
            className="text-gray-400 text-sm hover:text-white disabled:opacity-40"
            onClick={() => handleSkip()}
            disabled={submitting}
          >
            Skip for now →
          </button>
        </div>
      </motion.div>
    </div>
  );
}
