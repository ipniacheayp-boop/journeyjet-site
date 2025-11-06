import { useState, useEffect, useRef } from "react";
import { X, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import flybotLogo from "@/assets/flybot-logo.png";

const FlyBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "bot",
      content: "Hey there! 👋 I'm FlyBot — here to help you explore this site. What can I do for you today?",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (chatRef.current && !chatRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    setMessages((prev) => [
      ...prev,
      { role: "user", content: inputValue },
      {
        role: "bot",
        content: "Thanks for your message! I'm here to help you navigate the site. Feel free to ask me anything about flights, hotels, or travel deals!",
      },
    ]);
    setInputValue("");
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
            src={flybotLogo} 
            alt="FlyBot" 
            className="h-full w-full object-contain"
          />
        </button>
      ) : (
        <Card className="w-[380px] h-[550px] shadow-2xl animate-scale-in flex flex-col">
          <CardHeader className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-t-lg pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                  <MessageCircle className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-lg">FlyBot</CardTitle>
                  <p className="text-xs text-primary-foreground/90">
                    Always here to help
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

          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                </div>
              </div>
            ))}
          </CardContent>

          <div className="p-4 border-t bg-muted/30">
            <div className="flex gap-2">
              <Textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="min-h-[44px] max-h-[120px] resize-none"
                rows={1}
              />
              <Button onClick={handleSendMessage} size="icon" className="h-11 w-11">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M22 2L11 13" />
                  <path d="M22 2L15 22L11 13L2 9L22 2Z" />
                </svg>
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default FlyBot;
