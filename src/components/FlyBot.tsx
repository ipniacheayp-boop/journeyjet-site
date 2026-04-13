import { useState, useEffect, useRef } from "react";
import { X, MessageCircle, Loader2, Send, Plane, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import flyBotLogo from "@/assets/flybot-logo.png";

interface FlightResult {
  id: string;
  airline: string;
  airlineCode: string;
  departure: string;
  arrival: string;
  departureAirport: string;
  arrivalAirport: string;
  duration: string;
  stops: number;
  price: number;
  currency: string;
  cabin: string;
}

interface Message {
  role: "user" | "bot";
  content: string;
  flights?: FlightResult[];
  searchParams?: { originLocationCode: string; destinationLocationCode: string; departureDate: string };
}

const QUICK_SUGGESTIONS = [
  { label: "✈️ Find flights", message: "Help me find a flight" },
  { label: "💰 Cheap flights", message: "What are the cheapest flights this week?" },
  { label: "🧳 Baggage rules", message: "What are the standard baggage allowance rules?" },
  { label: "🌍 Popular destinations", message: "What are the most popular travel destinations right now?" },
  { label: "📋 Visa info", message: "Tell me about visa requirements for international travel" },
];

function formatTime(isoStr: string) {
  if (!isoStr) return "--:--";
  try {
    const d = new Date(isoStr);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
  } catch {
    return "--:--";
  }
}

function formatDate(isoStr: string) {
  if (!isoStr) return "";
  try {
    const d = new Date(isoStr);
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

function FlightCard({ flight }: { flight: FlightResult }) {
  const stopsLabel = flight.stops === 0 ? "Direct" : `${flight.stops} stop${flight.stops > 1 ? "s" : ""}`;

  return (
    <div className="bg-background border rounded-xl p-3 mb-2 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Plane className="w-4 h-4 text-primary" />
          </div>
          <span className="font-semibold text-sm">{flight.airline}</span>
        </div>
        <span className="text-lg font-bold text-primary">${flight.price.toLocaleString()}</span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <div className="text-center">
          <p className="font-bold text-base">{formatTime(flight.departure)}</p>
          <p className="text-muted-foreground text-xs">{flight.departureAirport}</p>
        </div>
        <div className="flex-1 mx-3 flex flex-col items-center">
          <p className="text-xs text-muted-foreground">{flight.duration}</p>
          <div className="w-full flex items-center gap-1">
            <div className="h-px flex-1 bg-border" />
            <ArrowRight className="w-3 h-3 text-muted-foreground" />
          </div>
          <p className="text-xs text-muted-foreground">{stopsLabel}</p>
        </div>
        <div className="text-center">
          <p className="font-bold text-base">{formatTime(flight.arrival)}</p>
          <p className="text-muted-foreground text-xs">{flight.arrivalAirport}</p>
        </div>
      </div>
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-muted-foreground capitalize">{flight.cabin?.toLowerCase()}</span>
        <a
          href={`/search-results?from=${flight.departureAirport}&to=${flight.arrivalAirport}`}
          className="text-xs text-primary font-semibold hover:underline"
        >
          Book Now →
        </a>
      </div>
    </div>
  );
}

const FlyBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      content:
        "Hey there! 👋 I'm FlyBot, your Triplie.com travel assistant. I can search real flights, answer travel questions, and help you book your trip. What can I help you with?",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const chatRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (chatRef.current && !chatRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (overrideMessage?: string) => {
    const userMessage = overrideMessage || inputValue.trim();
    if (!userMessage || isLoading) return;

    setInputValue("");
    setShowSuggestions(false);
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/flybot-chat`;

      const allMessages = [...messages, { role: "user", content: userMessage }];

      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: allMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (response.status === 429) {
        toast({ title: "Rate limit", description: "Too many requests. Please wait a moment.", variant: "destructive" });
        return;
      }
      if (response.status === 402) {
        toast({
          title: "Service unavailable",
          description: "AI service temporarily unavailable.",
          variant: "destructive",
        });
        return;
      }
      if (!response.ok || !response.body) throw new Error("Failed to get response");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let assistantMessage = "";
      let flightResults: FlightResult[] = [];
      let searchParams: any = null;
      let botMessageAdded = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);

            // Check for flight results special event
            if (parsed.type === "flight_results") {
              flightResults = parsed.flights || [];
              searchParams = parsed.searchParams || null;
              continue;
            }

            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantMessage += content;
              if (!botMessageAdded) {
                botMessageAdded = true;
                setMessages((prev) => [
                  ...prev,
                  { role: "bot", content: assistantMessage, flights: flightResults, searchParams },
                ]);
              } else {
                setMessages((prev) => {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1] = {
                    role: "bot",
                    content: assistantMessage,
                    flights: flightResults,
                    searchParams,
                  };
                  return newMessages;
                });
              }
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // If we got flights but no text yet, add the message
      if (flightResults.length > 0 && !botMessageAdded) {
        setMessages((prev) => [
          ...prev,
          {
            role: "bot",
            content: assistantMessage || "Here are the flights I found:",
            flights: flightResults,
            searchParams,
          },
        ]);
      }
    } catch (error) {
      console.error("FlyBot error:", error);
      toast({ title: "Error", description: "Failed to send message. Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div ref={chatRef} className="fixed bottom-6 right-6 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="h-[70px] w-[70px] rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 bg-transparent border-0 p-0 cursor-pointer"
        >
          <img
            src={flyBotLogo}
            alt="FlyBot"
            title="FlyBot — Tripile travel assistant for flights and bookings"
            className="h-full w-full object-contain"
          />
        </button>
      ) : (
        <Card className="w-[400px] h-[600px] shadow-2xl animate-scale-in flex flex-col md:w-[400px] sm:w-[calc(100%-48px)]">
          {/* Header */}
          <CardHeader className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-t-lg pb-3 pt-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Plane className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base">FlyBot</CardTitle>
                  <p className="text-xs text-primary-foreground/80 flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-green-400 inline-block" /> Online
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 text-primary-foreground"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>

          {/* Messages */}
          <CardContent className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((msg, idx) => (
              <div key={idx}>
                <div className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                      msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
                {/* Flight results cards */}
                {msg.flights && msg.flights.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground px-1 flex items-center gap-1">
                      <Plane className="w-3 h-3" /> {msg.flights.length} flight{msg.flights.length > 1 ? "s" : ""} found
                    </p>
                    {msg.flights.map((flight) => (
                      <FlightCard key={flight.id} flight={flight} />
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted text-foreground rounded-2xl px-4 py-3 flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">Searching...</span>
                </div>
              </div>
            )}

            {/* Quick suggestions */}
            {showSuggestions && messages.length <= 1 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {QUICK_SUGGESTIONS.map((s) => (
                  <button
                    key={s.label}
                    onClick={() => handleSendMessage(s.message)}
                    className="text-xs px-3 py-1.5 rounded-full border bg-background hover:bg-accent transition-colors text-foreground"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </CardContent>

          {/* Input */}
          <div className="p-3 border-t bg-muted/30">
            <div className="flex gap-2">
              <Textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask about flights, hotels, travel tips..."
                className="min-h-[44px] max-h-[100px] resize-none text-sm"
                rows={1}
              />
              <Button
                onClick={() => handleSendMessage()}
                size="icon"
                className="h-11 w-11 shrink-0"
                disabled={isLoading || !inputValue.trim()}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground text-center mt-1.5">Powered by Triplie.com</p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default FlyBot;
