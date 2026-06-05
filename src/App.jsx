import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./features/auth/components/LoginPage";
import RegisterPage from "./features/auth/components/RegisterPage";
import ChatLayout from "./features/chat/components/ChatLayout";
import ChannelsPage from "./features/channels/components/Channels";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/chat" element={<ChatLayout />} />
        <Route path="/channels" element={<ChannelsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
