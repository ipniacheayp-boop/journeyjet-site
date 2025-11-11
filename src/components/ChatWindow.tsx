import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { X, Send, User, MessageCircle } from 'lucide-react';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

interface ChatWindowProps {
  onClose: () => void;
}

const ChatWindow = ({ onClose }: ChatWindowProps) => {
  const { user } = useAuth();
  const { conversation, messages, isLoading, isSending, startChat, sendMessage, closeChat } = useChat();
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Start chat when component mounts
  useEffect(() => {
    if (user && !conversation) {
      startChat('Customer Support Request');
    }
  }, [user, conversation, startChat]);

  const handleSend = async () => {
    if (!inputValue.trim() || isSending) return;

    await sendMessage(inputValue);
    setInputValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClose = async () => {
    if (conversation) {
      await closeChat();
    }
    onClose();
  };

  if (!user) {
    return (
      <Card className="fixed bottom-28 right-8 w-96 h-[500px] shadow-2xl z-50 flex flex-col">
        <div className="bg-gradient-to-r from-support-sky to-blue-600 p-4 text-white flex justify-between items-center rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold">Live Chat</h3>
              <p className="text-xs opacity-90">Please log in to chat</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 rounded-full p-2 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 p-4 flex items-center justify-center text-center text-muted-foreground">
          <div>
            <p className="mb-4">Please log in to start chatting with our support team</p>
            <Button onClick={() => window.location.href = '/login'}>
              Log In
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="fixed bottom-28 right-8 w-96 h-[500px] shadow-2xl z-50 flex flex-col overflow-hidden border-2 border-support-sky/20 rounded-2xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-support-sky to-blue-600 p-4 text-white flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <MessageCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold">Live Chat</h3>
            <p className="text-xs opacity-90">
              {conversation?.agent_id ? 'Agent connected' : 'Waiting for agent...'}
            </p>
          </div>
        </div>
        <button onClick={handleClose} className="hover:bg-white/20 rounded-full p-2 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 bg-gray-50 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-muted-foreground">
              <div className="animate-pulse mb-2">Starting chat...</div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    msg.sender_type === 'user'
                      ? 'bg-support-sky text-white'
                      : msg.sender_type === 'system'
                      ? 'bg-gray-200 text-gray-700 text-sm italic'
                      : 'bg-white text-gray-900 shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {msg.sender_type !== 'user' && (
                      <div className="w-6 h-6 rounded-full bg-support-green/10 flex items-center justify-center flex-shrink-0 mt-1">
                        <User className="w-4 h-4 text-support-green" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="break-words">{msg.message}</p>
                      <p
                        className={`text-xs mt-1 ${
                          msg.sender_type === 'user' ? 'text-white/70' : 'text-gray-500'
                        }`}
                      >
                        {format(new Date(msg.created_at), 'HH:mm')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={!conversation || isSending}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={!conversation || isSending || !inputValue.trim()}
            className="bg-support-sky hover:bg-support-sky/90"
            size="icon"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Press Enter to send, Shift + Enter for new line
        </p>
      </div>
    </Card>
  );
};

export default ChatWindow;
