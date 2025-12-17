import { Home, Save, MessageCircle } from "lucide-react";

interface BottomNavProps {
  activeTab: "home" | "saves" | "chatbot";
  onTabChange: (tab: "home" | "saves" | "chatbot") => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="border-t border-border bg-card flex items-center justify-around h-16">
      <button
        onClick={() => onTabChange("home")}
        className={`flex flex-col items-center justify-center gap-1 px-4 py-2 transition-colors cursor-pointer ${
          activeTab === "home" ? "text-accent" : "text-muted-foreground"
        }`}
      >
        <Home className="w-6 h-6" />
        <span className="text-xs">Home</span>
      </button>
      
      <button
        onClick={() => onTabChange("saves")}
        className={`flex flex-col items-center justify-center gap-1 px-4 py-2 transition-colors cursor-pointer ${
          activeTab === "saves" ? "text-accent" : "text-muted-foreground"
        }`}
      >
        <Save className="w-6 h-6" />
        <span className="text-xs">Saves</span>
      </button>
      
      <button
        onClick={() => onTabChange("chatbot")}
        className={`flex flex-col items-center justify-center gap-1 px-4 py-2 transition-colors cursor-pointer ${
          activeTab === "chatbot" ? "text-accent" : "text-muted-foreground"
        }`}
      >
        <MessageCircle className="w-6 h-6" />
        <span className="text-xs">Chatbot</span>
      </button>
    </nav>
  );
}
