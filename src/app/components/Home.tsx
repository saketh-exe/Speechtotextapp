import { useState, useRef } from "react";
import { Mic, Lock } from "lucide-react";

interface Transcription {
  id: string;
  title: string;
  text: string;
  date: string;
}

// Mock data for recent transcriptions
const recentTranscriptions: Transcription[] = [
  {
    id: "1",
    title: "Meeting Notes",
    text: "Discussed project timeline and deliverables for Q1. Key decisions: Launch date moved to March 15th...",
    date: "2 hours ago",
  },
  {
    id: "2",
    title: "Grocery List",
    text: "Milk, eggs, bread, chicken, vegetables, fruits, and yogurt for the week ahead...",
    date: "5 hours ago",
  },
  {
    id: "3",
    title: "Voice Memo",
    text: "Remember to call dentist on Monday morning to reschedule appointment. Also need to pick up prescription...",
    date: "Yesterday",
  },
  {
    id: "4",
    title: "Lecture Notes",
    text: "Professor covered chapter 5 on quantum mechanics. Important concepts: wave-particle duality, uncertainty principle...",
    date: "Yesterday",
  },
  {
    id: "5",
    title: "Ideas for Blog",
    text: "Write about latest AI developments, focus on speech recognition improvements and practical applications...",
    date: "2 days ago",
  },
  {
    id: "6",
    title: "Team Discussion",
    text: "Brainstorming session for new product features. Team suggested improvements to user interface and onboarding...",
    date: "3 days ago",
  },
];

export function Home() {
  const [isRecording, setIsRecording] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [dragY, setDragY] = useState(0);
  const startYRef = useRef(0);

  const handleMouseDown = (
    e: React.MouseEvent | React.TouchEvent,
  ) => {
    if ("touches" in e) {
      startYRef.current = e.touches[0].clientY;
    } else {
      startYRef.current = e.clientY;
    }
    setIsRecording(true);
    setDragY(0);
  };

  const handleMouseMove = (
    e: React.MouseEvent | React.TouchEvent,
  ) => {
    if (!isRecording || isLocked) return;

    let currentY: number;
    if ("touches" in e) {
      currentY = e.touches[0].clientY;
    } else {
      currentY = e.clientY;
    }

    const deltaY = startYRef.current - currentY;
    setDragY(Math.max(0, deltaY));

    // Lock if dragged up more than 100px
    if (deltaY > 100) {
      setIsLocked(true);
    }
  };

  const handleMouseUp = () => {
    if (!isLocked) {
      setIsRecording(false);
    }
    setDragY(0);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    setIsLocked(false);
  };

  return (
    <div className="flex flex-col h-full overflow-x-hidden">
      {/* Main Recording Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="text-center mb-12">
          <h1 className="mb-2">Voice Transcription</h1>
          <p className="text-muted-foreground">
            {isRecording
              ? isLocked
                ? "Recording... (Tap to stop)"
                : "Hold to record or swipe up to lock"
              : "Hold microphone to start recording"}
          </p>
        </div>

        <div
          className="relative"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchMove={handleMouseMove}
          onTouchEnd={handleMouseUp}
        >
          {/* Swipe up indicator */}
          {isRecording && !isLocked && (
            <div
              className="absolute -top-24 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
              style={{ opacity: Math.min(dragY / 100, 1) }}
            >
              <Lock className="w-8 h-8 text-accent" />
              <span className="text-sm text-accent">
                Release to lock
              </span>
            </div>
          )}

          <button
            onMouseDown={handleMouseDown}
            onTouchStart={handleMouseDown}
            onClick={isLocked ? handleStopRecording : undefined}
            className={`relative w-48 h-48 rounded-full flex items-center justify-center transition-all shadow-lg ${
              isRecording
                ? "bg-accent scale-110"
                : "bg-accent/10"
            }`}
            style={{
              transform:
                isRecording && !isLocked
                  ? `translateY(-${dragY}px) scale(1.1)`
                  : undefined,
            }}
          >
            <Mic
              className={`w-16 h-16 ${isRecording ? "text-white" : "text-accent"}`}
            />

            {/* Pulse animation when recording */}
            {isRecording && (
              <>
                <div className="absolute inset-0 rounded-full bg-accent animate-ping opacity-30" />
                <div className="absolute inset-0 rounded-full bg-accent animate-pulse opacity-20" />
              </>
            )}
          </button>
        </div>

        {isRecording && (
          <div className="mt-8 text-center">
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-muted-foreground">
                Recording in progress...
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Recent Transcriptions */}
      <div className="bg-muted/30 p-6 rounded-t-3xl">
        <h3 className="mb-4">Recent Transcriptions</h3>
        <div className="flex flex-wrap gap-3">
          {recentTranscriptions.map((transcription) => (
            <div
              key={transcription.id}
              className="bg-card p-3 rounded-full border border-border cursor-pointer hover:border-accent/50 transition-colors w-[calc(50%-0.375rem)]"
            >
              <div className="flex items-center justify-between">
                <h4 className="truncate flex-1 text-sm">
                  {transcription.title}
                </h4>
                <span className="text-xs text-muted-foreground ml-2 shrink-0">
                  {transcription.date}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}