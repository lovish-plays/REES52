'use client';

import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Cpu, Bot, Sparkles, BookOpen, Video, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { askAelosAiAction } from "@/app/actions/chatbot";

type Message = {
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
  actions?: Array<{ label: string; link: string; isExternal?: boolean }>;
};

const SUGGESTIONS = [
  "Who is AELOS?",
  "Arduino Uno R3 Kit",
  "How to unlock Ebooks?",
  "Tell me about Drone kits",
];

export default function AelosChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "bot",
      text: "Greetings, Maker! I am AELOS, your humanoid robotic companion. Ask me anything about Arduino, robotics kits, sensors, or navigating your Infinity Learning Hub!",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const getBotResponse = (input: string): Omit<Message, "sender" | "timestamp"> => {
    const q = input.toLowerCase();

    if (q.includes("aelos") || q.includes("humanoid") || q.includes("who are you")) {
      return {
        text: "I am AELOS, a advanced educational humanoid robot sold by REES52! I feature 17 high-performance servo motors enabling humanoid movement like walking, dancing, and martial arts. I am designed to teach programming, kinematic structures, and visual coding.",
        actions: [
          { label: "View Humanoid Catalog", link: "https://rees52.com", isExternal: true }
        ]
      };
    }

    if (q.includes("arduino") || q.includes("uno") || q.includes("microcontroller")) {
      return {
        text: "The Arduino Uno R3 is the perfect starting board for embedded programming. You can wire LEDs, read analog sensors, and control motors. Check out our 'Getting Started with Arduino Uno R3' ebook and video tutorials here in the portal!",
        actions: [
          { label: "Go to Ebooks", link: "/?type=ebooks" },
          { label: "Get Uno Hardware Kit", link: "https://rees52.com/microcontroller/123-rees52-uno-r3-starter-kit.html", isExternal: true }
        ]
      };
    }

    if (q.includes("sensor") || q.includes("ultimate") || q.includes("37")) {
      return {
        text: "Our 37-in-1 Ultimate Sensor Kit contains modules for temperature (DHT11), sound, motion, infrared tracking, and ultrasonics. Perfect for building automated logic circuits and IoT dashboards.",
        actions: [
          { label: "Sensor Store Catalog", link: "https://rees52.com/sensors/789-rees52-ultimate-sensor-kit.html", isExternal: true }
        ]
      };
    }

    if (q.includes("drone") || q.includes("quadcopter") || q.includes("flight") || q.includes("f450")) {
      return {
        text: "The REES52 F450 DIY Drone Builder Kit is perfect for drone racing and flight control engineering. It features brushless motors, ESC electronic speed controllers, and standard APM/Pixhawk compatibility.",
        actions: [
          { label: "Get Drone Builder Kit", link: "https://rees52.com/drones/101-rees52-f450-drone-diy-kit.html", isExternal: true }
        ]
      };
    }

    if (q.includes("ebook") || q.includes("read") || q.includes("unlock") || q.includes("pdf")) {
      return {
        text: "To unlock Ebooks, click on any ebook card, read the syllabus, and select 'Unlock Ebook'. It will instantly be added to your profile library in the 'My Stuff' section for online reading.",
        actions: [
          { label: "Browse Ebooks", link: "/?type=ebooks" }
        ]
      };
    }

    if (q.includes("video") || q.includes("enroll") || q.includes("watch") || q.includes("lecture")) {
      return {
        text: "All video lectures on Infinity Learning Hub are free! Tap 'Enroll in Lecture' in the card details view, and you can watch it anytime. Your active lectures are saved in your 'My Learning' dashboard.",
        actions: [
          { label: "Browse Lectures", link: "/?type=videos" }
        ]
      };
    }

    if (q.includes("hello") || q.includes("hi") || q.includes("hey") || q.includes("greetings")) {
      return {
        text: "Hello human creator! I am AELOS, your cybernetic teaching companion. Ask me anything about robotics kits, Arduino coding, sensors, or how to navigate our learning hub!"
      };
    }

    if (q.includes("help") || q.includes("support") || q.includes("email") || q.includes("contact")) {
      return {
        text: "I'm on it! You can contact the REES52 official support team at support@rees52.com for catalog requests or hardware troubleshooting. Let me know if I can guide you to any portal section instead!"
      };
    }

    // Default Fallback
    return {
      text: "That sounds like an amazing engineering project! I recommend checking out our 'Arduino Uno R3 Starter Kit' or launching one of our free Live Masterclass webinars to dive deeper.",
      actions: [
        { label: "View Live Webinars", link: "/?type=live" },
        { label: "Visit REES52 Store", link: "https://rees52.com", isExternal: true }
      ]
    };
  };

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    // Add user message
    setMessages((prev) => [
      ...prev,
      { sender: "user", text, timestamp: new Date() },
    ]);
    setInputValue("");
    setIsTyping(true);

    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "chatbot_interaction", {
        message_length: text.length,
        query: text,
      });
    }

    try {
      // Format chat history for Gemini API (user / model parts)
      const chatHistory = messages.map(m => ({
        role: (m.sender === "user" ? "user" as const : "model" as const),
        parts: m.text
      }));

      const res = await askAelosAiAction(text, chatHistory);
      if (res.success && res.text) {
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: res.text!,
            timestamp: new Date(),
          },
        ]);
        setIsTyping(false);
        return;
      }
    } catch (err) {
      console.warn("Gemini API connection error, running local fallback:", err);
    }

    // Fallback to local offline context response
    setTimeout(() => {
      const response = getBotResponse(text);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: response.text,
          actions: response.actions,
          timestamp: new Date(),
        },
      ]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-gradient-to-br from-cyan-600 to-blue-600 text-white rounded-full flex items-center justify-center shadow-2xl premium-bot-btn cursor-pointer border border-cyan-400/40 group"
        aria-label="Aelos AI Chatbot"
      >
        <span className="absolute -inset-1.5 rounded-full bg-cyan-500/20 animate-ping opacity-75 pointer-events-none"></span>
        <Bot className="w-7 h-7 transition-transform duration-300 premium-bot-icon" />
      </button>

      {/* Chat Window Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-40 w-[380px] max-w-[calc(100vw-2rem)] h-[520px] bg-[#F7F4EB]/95 border border-slate-200 shadow-2xl rounded-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 fade-in duration-300 backdrop-blur-xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-cyan-600/90 to-blue-600/90 text-white px-4 py-3.5 flex items-center justify-between border-b border-cyan-500/25">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center border border-white/20">
                <Cpu className="w-4.5 h-4.5 text-cyan-200 animate-pulse" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-xs font-black tracking-wider uppercase">AELOS AI COMPANION</span>
                <span className="text-[9px] text-cyan-200 font-bold uppercase tracking-wider flex items-center gap-1">
                  <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                  Active robot core
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white rounded-lg p-1.5 hover:bg-white/10 transition-all duration-300 hover:rotate-90 hover:scale-110 cursor-pointer"
              aria-label="Close chat"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Messages list */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-900/5"
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex flex-col max-w-[85%] ${
                  msg.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"
                }`}
              >
                <div
                  className={`rounded-2xl px-4 py-2.5 text-xs shadow-sm ${
                    msg.sender === "user"
                      ? "bg-cyan-600 text-white font-medium rounded-br-none"
                      : "bg-white text-slate-800 border border-slate-200/80 rounded-bl-none font-medium leading-relaxed"
                  }`}
                >
                  {msg.text}
                </div>

                {/* Mapped Action CTAs */}
                {msg.sender === "bot" && msg.actions && msg.actions.length > 0 && (
                  <div className="mt-2 flex flex-col gap-1.5 w-full">
                    {msg.actions.map((act, i) => (
                      act.isExternal ? (
                        <a
                          key={i}
                          href={act.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-white/70 border border-cyan-500/20 text-cyan-750 font-black text-[9px] uppercase tracking-widest rounded-lg flex items-center justify-between hover:bg-white hover:border-cyan-500/40 transition-colors shadow-sm"
                        >
                          <span>{act.label}</span>
                          <ExternalLink className="w-3 h-3 text-cyan-600" />
                        </a>
                      ) : (
                        <button
                          key={i}
                          onClick={() => {
                            setIsOpen(false);
                            window.location.href = act.link;
                          }}
                          className="px-3 py-1.5 bg-white/70 border border-cyan-500/20 text-cyan-750 font-black text-[9px] uppercase tracking-widest rounded-lg flex items-center justify-between hover:bg-white hover:border-cyan-500/40 transition-colors shadow-sm cursor-pointer"
                        >
                          <span>{act.label}</span>
                          <Sparkles className="w-3 h-3 text-cyan-600" />
                        </button>
                      )
                    ))}
                  </div>
                )}

                <span className="text-[8px] text-slate-500 mt-1 uppercase font-bold px-1">
                  {msg.timestamp.toLocaleTimeString(undefined, {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-1.5 bg-white border border-slate-200/60 rounded-2xl rounded-bl-none px-4 py-3 max-w-[80px] shadow-sm">
                <span className="h-1.5 w-1.5 bg-cyan-600 rounded-full animate-bounce"></span>
                <span className="h-1.5 w-1.5 bg-cyan-600 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="h-1.5 w-1.5 bg-cyan-600 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            )}
          </div>

          {/* Quick suggestions */}
          <div className="px-4 py-2 border-t border-slate-200/60 bg-white/50 overflow-x-auto flex gap-2 no-scrollbar">
            {SUGGESTIONS.map((sug, i) => (
              <button
                key={i}
                onClick={() => handleSend(sug)}
                className="flex-shrink-0 px-3 py-1 border border-slate-200/90 bg-white text-slate-700 text-[9px] font-extrabold uppercase tracking-wider rounded-full transition-all cursor-pointer shadow-sm premium-suggestion-pill"
              >
                {sug}
              </button>
            ))}
          </div>

          {/* Form input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(inputValue);
            }}
            className="p-3 bg-white border-t border-slate-250/70 flex gap-2 items-center"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask Aelos a question..."
              className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-850 placeholder:text-slate-500 focus:outline-none transition-all premium-input-pulse"
            />
            <Button
              type="submit"
              size="icon"
              variant="primary"
              className="rounded-xl w-9.5 h-9.5 glass-btn-primary flex items-center justify-center cursor-pointer shadow-md premium-btn-shimmer"
              disabled={!inputValue.trim()}
              aria-label="Send message"
            >
              <Send className="w-4 h-4 text-white" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
