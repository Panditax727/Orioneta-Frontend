import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./features/auth/components/LoginPage";
import RegisterPage from "./features/auth/components/RegisterPage";
import ChatLayout from "./features/chat/components/ChatLayout";
import { SettingsPage } from "./features/settings";
import { ThemeMarket } from "./features/themes";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/chat" element={<ChatLayout />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/themes" element={<ThemeMarket />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
