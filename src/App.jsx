import { BrowserRouter, Routes, Route } from "react-router-dom";
import OAuthCallbackPage from "./features/auth/components/OAuthCallbackPage";
import ProtectedRoute from "./features/auth/components/ProtectedRoute";
import LoginPage from "./features/auth/components/LoginPage";
import RegisterPage from "./features/auth/components/RegisterPage";
import ForgotPassword from "./features/auth/components/ForgotPassword";
import VerifyCode from "./features/auth/components/VerifyCode";
import ResetPassword from "./features/auth/components/ResetPassword";
import ChatLayout from "./features/chat/components/ChatLayout";
import ChannelsPage from "./features/channels/components/Channels";
import PrivacyDataPage from "./features/legal/components/PrivacyDataPage";
import { SettingsPage } from "./features/settings";
import { MarketPage } from "./features/market";
import { StudioPage } from "./features/studio";
import ProfilePage from "./features/profile/ProfilePage";
import NotFoundPage from "./shared/components/NotFoundPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-code" element={<VerifyCode />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/privacidad" element={<PrivacyDataPage />} />
        <Route path="/auth/oauth2/callback" element={<OAuthCallbackPage />} />
        <Route path="/auth/oauth2/error" element={<OAuthCallbackPage />} />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <ChatLayout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/channels"
          element={
            <ProtectedRoute>
              <ChannelsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/themes"
          element={
            <ProtectedRoute>
              <MarketPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/market"
          element={
            <ProtectedRoute>
              <MarketPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/studio"
          element={
            <ProtectedRoute>
              <StudioPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/:userId"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>

  );
}

export default App;
