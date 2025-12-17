import { useState } from "react";
import { Search, FileText } from "lucide-react";

interface Transcription {
  id: string;
  title: string;
  text: string;
  date: string;
  duration: string;
}

// Mock data for all transcriptions
const allTranscriptions: Transcription[] = [
  {
    id: "1",
    title: "Meeting Notes",
    text: "Discussed project timeline and deliverables for Q1. Key decisions: Launch date moved to March 15th, budget approved for additional resources, team expansion planned for February. Action items assigned to each department head.",
    date: "Dec 17, 2024",
    duration: "5:32"
  },
  {
    id: "2",
    title: "Grocery List",
    text: "Milk, eggs, bread, chicken, vegetables, fruits, and yogurt for the week ahead. Don't forget organic produce and whole grain items.",
    date: "Dec 17, 2024",
    duration: "1:15"
  },
  {
    id: "3",
    title: "Voice Memo",
    text: "Remember to call dentist on Monday morning to reschedule appointment. Also need to pick up prescription at pharmacy before 6 PM. Update insurance information online.",
    date: "Dec 16, 2024",
    duration: "2:08"
  },
  {
    id: "4",
    title: "Lecture Notes",
    text: "Professor covered chapter 5 on quantum mechanics. Important concepts: wave-particle duality, uncertainty principle, quantum entanglement. Quiz scheduled for next week covering chapters 4-6.",
    date: "Dec 16, 2024",
    duration: "45:20"
  },
  {
    id: "5",
    title: "Ideas for Blog",
    text: "Write about latest AI developments, focus on speech recognition improvements and practical applications in daily life. Include examples of voice assistants and transcription tools.",
    date: "Dec 15, 2024",
    duration: "3:42"
  },
  {
    id: "6",
    title: "Team Discussion",
    text: "Brainstorming session for new product features. Team suggested improvements to user interface and onboarding process. Consider mobile-first design and accessibility features.",
    date: "Dec 14, 2024",
    duration: "28:15"
  },
  {
    id: "7",
    title: "Recipe Instructions",
    text: "Pasta carbonara recipe: Cook pasta al dente, fry bacon until crispy, mix eggs with parmesan, combine everything off heat. Season with black pepper and serve immediately.",
    date: "Dec 13, 2024",
    duration: "4:22"
  },
  {
    id: "8",
    title: "Book Summary",
    text: "Finished reading chapter 8 of productivity book. Key takeaways: time blocking, priority matrix, elimination of non-essential tasks. Apply these techniques starting next week.",
    date: "Dec 12, 2024",
    duration: "6:18"
  },
  {
    id: "9",
    title: "Travel Plans",
    text: "Trip to San Francisco next month. Check flights, book hotel in downtown area, reserve rental car. Visit Golden Gate Bridge, Alcatraz, and Fisherman's Wharf.",
    date: "Dec 11, 2024",
    duration: "3:55"
  },
  {
    id: "10",
    title: "Workout Routine",
    text: "Monday: Upper body strength training. Tuesday: Cardio and core. Wednesday: Legs and glutes. Thursday: Rest day. Friday: Full body circuit. Saturday: Yoga and stretching.",
    date: "Dec 10, 2024",
    duration: "2:40"
  }
];

export function Saves() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTranscriptions = allTranscriptions.filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header with Search */}
      <div className="p-6 pb-4 border-b border-border">
        <h2 className="mb-4">All Transcriptions</h2>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search transcriptions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-muted/30 border border-border rounded-xl focus:outline-none focus:border-accent/50 transition-colors"
          />
        </div>
      </div>

      {/* Transcriptions List */}
      <div className="flex-1 overflow-y-auto p-6">
        {filteredTranscriptions.length > 0 ? (
          <div className="space-y-3">
            {filteredTranscriptions.map((transcription) => (
              <div
                key={transcription.id}
                className="bg-card p-4 rounded-xl border border-border cursor-pointer hover:border-accent/50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-accent/10 rounded-lg mt-1">
                    <FileText className="w-5 h-5 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="flex-1">{transcription.title}</h4>
                      <span className="text-xs text-muted-foreground ml-2">{transcription.duration}</span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {transcription.text}
                    </p>
                    <span className="text-xs text-muted-foreground">{transcription.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <FileText className="w-16 h-16 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No transcriptions found</p>
            <p className="text-sm text-muted-foreground mt-2">Try adjusting your search</p>
          </div>
        )}
      </div>
    </div>
  );
}
