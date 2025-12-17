import { useState, useRef, useEffect } from "react";
import { Send, Bot, User } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

// Mock responses based on transcripts
const mockResponses: { [key: string]: string } = {
  "meeting": "Based on your recent meeting notes, the project launch is scheduled for March 15th with an approved budget for additional resources. The team expansion is planned for February.",
  "grocery": "From your grocery list transcription, you mentioned needing milk, eggs, bread, chicken, vegetables, fruits, and yogurt. You also noted to get organic produce and whole grain items.",
  "appointment": "According to your voice memo, you need to call the dentist on Monday morning to reschedule your appointment and pick up a prescription before 6 PM.",
  "lecture": "Your lecture notes cover quantum mechanics chapter 5, including wave-particle duality, uncertainty principle, and quantum entanglement. There's a quiz next week covering chapters 4-6.",
  "travel": "Your travel plans include a trip to San Francisco next month. You want to visit Golden Gate Bridge, Alcatraz, and Fisherman's Wharf. Remember to check flights, book a downtown hotel, and reserve a rental car.",
  "workout": "Your workout routine is: Monday - Upper body, Tuesday - Cardio and core, Wednesday - Legs and glutes, Thursday - Rest, Friday - Full body circuit, Saturday - Yoga and stretching.",
  "default": "I can help you search through your transcriptions. Try asking about meetings, groceries, appointments, lectures, travel plans, or workouts."
};

function getBotResponse(userMessage: string): string {
  const lowerMessage = userMessage.toLowerCase();
  
  if (lowerMessage.includes("meeting") || lowerMessage.includes("project")) {
    return mockResponses.meeting;
  } else if (lowerMessage.includes("grocery") || lowerMessage.includes("food") || lowerMessage.includes("shop")) {
    return mockResponses.grocery;
  } else if (lowerMessage.includes("appointment") || lowerMessage.includes("dentist") || lowerMessage.includes("doctor")) {
    return mockResponses.appointment;
  } else if (lowerMessage.includes("lecture") || lowerMessage.includes("quantum") || lowerMessage.includes("study")) {
    return mockResponses.lecture;
  } else if (lowerMessage.includes("travel") || lowerMessage.includes("trip") || lowerMessage.includes("san francisco")) {
    return mockResponses.travel;
  } else if (lowerMessage.includes("workout") || lowerMessage.includes("exercise") || lowerMessage.includes("fitness")) {
    return mockResponses.workout;
  }
  
  return mockResponses.default;
}

export function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hi! I can help you find information from your transcriptions. What would you like to know?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    // Simulate bot response with delay
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: getBotResponse(inputValue),
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, botMessage]);
    }, 500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent/10 rounded-full">
            <Bot className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h2>Transcript Assistant</h2>
            <p className="text-sm text-muted-foreground">Ask me about your transcriptions</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
          >
            <div
              className={`p-2 rounded-full shrink-0 ${
                message.role === "user" 
                  ? "bg-accent text-accent-foreground" 
                  : "bg-muted"
              }`}
            >
              {message.role === "user" ? (
                <User className="w-5 h-5" />
              ) : (
                <Bot className="w-5 h-5 text-accent" />
              )}
            </div>
            <div
              className={`flex-1 p-4 rounded-2xl ${
                message.role === "user"
                  ? "bg-accent text-accent-foreground ml-12"
                  : "bg-muted mr-12"
              }`}
            >
              <p className="text-sm">{message.content}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-6 pt-4 border-t border-border">
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Ask about your transcriptions..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 px-4 py-3 bg-muted/30 border border-border rounded-xl focus:outline-none focus:border-accent/50 transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className="p-3 bg-accent text-accent-foreground rounded-xl hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
