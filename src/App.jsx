import { BrowserRouter, Routes, Route } from "react-router-dom";
import OAuthCallbackPage from "./features/auth/components/OAuthCallbackPage";
import ProtectedRoute from "./features/auth/components/ProtectedRoute";
import LoginPage from "./features/auth/components/LoginPage";
import RegisterPage from "./features/auth/components/RegisterPage";
import ChatLayout from "./features/chat/components/ChatLayout";
import ChannelsPage from "./features/channels/components/Channels";
import PrivacyDataPage from "./features/legal/components/PrivacyDataPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
