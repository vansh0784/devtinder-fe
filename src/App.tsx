import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import  ProtectedRoute  from "./utils/ProtectedRoutes";
import { AppLayout } from "./components/AppLayout";
import { HomePage } from "./components/HomePage";
import { ProfilePage } from "./components/ProfilePage";
import { MatchPage } from "./components/MatchPage";
import { ChatPage } from "./components/ChatPage";
import { CodeEditorPage } from "./components/CodeEditorPage";
import { ProjectRoom } from "./components/ProjectRoom";
import { NotificationsPage } from "./components/NotificationsPage";
import { SettingsPage } from "./components/SettingsPage";
import { LandingPage } from "./components/LandingPage";
import { AuthPage } from "./components/AuthPage";
import { OnboardingPage } from "./components/OnboardingPage";
import { NotFoundPage } from "./components/NotFoundPage";
import { Toaster } from "./components/ui/sonner";
import { AuthProvider } from "./context/AuthProvider";

export default function App() {
  return (
    <AuthProvider>
    <Router>
      
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route
          element={
              <AppLayout />
          }
        >
          <Route path="/home" element={<HomePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/match" element={<MatchPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/code-editor" element={<CodeEditorPage />} />
          <Route path="/project" element={<ProjectRoom />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      <Toaster position="top-right" theme="dark" />
      
    </Router>
    </AuthProvider>
    
  );
}
