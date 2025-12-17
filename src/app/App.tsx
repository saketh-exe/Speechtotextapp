import { useState } from "react";
import { Home } from "./components/Home";
import { Saves } from "./components/Saves";
import { Chatbot } from "./components/Chatbot";
import { BottomNav } from "./components/BottomNav";

export default function App() {
  const [activeTab, setActiveTab] = useState<"home" | "saves" | "chatbot">("home");

  return (
    <div className="size-full flex flex-col bg-background max-w-md mx-auto">
      <div className="flex-1 overflow-y-auto">
        {activeTab === "home" && <Home />}
        {activeTab === "saves" && <Saves />}
        {activeTab === "chatbot" && <Chatbot />}
      </div>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
