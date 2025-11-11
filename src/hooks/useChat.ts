import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_type: 'user' | 'agent' | 'system';
  message: string;
  is_read: boolean;
  created_at: string;
}

interface ChatConversation {
  id: string;
  user_id: string;
  agent_id: string | null;
  status: string;
  subject: string | null;
  created_at: string;
  updated_at: string;
}

export const useChat = () => {
  const { user } = useAuth();
  const [conversation, setConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Start or resume conversation
  const startChat = useCallback(async (subject?: string) => {
    if (!user) {
      toast.error('Please log in to start a chat');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('chat-start', {
        body: { subject },
      });

      if (error) throw error;

      if (data?.conversation) {
        setConversation(data.conversation);
        await loadMessages(data.conversation.id);
      }
    } catch (error) {
      console.error('Error starting chat:', error);
      toast.error('Failed to start chat');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Load messages for a conversation
  const loadMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setMessages((data || []) as ChatMessage[]);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load messages');
    }
  };

  // Send a message
  const sendMessage = async (messageText: string) => {
    if (!user || !conversation) {
      toast.error('No active conversation');
      return;
    }

    if (!messageText.trim()) {
      return;
    }

    setIsSending(true);
    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversation.id,
          sender_id: user.id,
          sender_type: 'user',
          message: messageText.trim(),
        });

      if (error) throw error;

      // Message will be added via realtime subscription
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  // Close conversation
  const closeChat = async () => {
    if (!conversation) return;

    try {
      const { error } = await supabase
        .from('chat_conversations')
        .update({ 
          status: 'closed',
          closed_at: new Date().toISOString()
        })
        .eq('id', conversation.id);

      if (error) throw error;

      setConversation(null);
      setMessages([]);
      toast.success('Chat closed');
    } catch (error) {
      console.error('Error closing chat:', error);
      toast.error('Failed to close chat');
    }
  };

  // Set up realtime subscription for messages
  useEffect(() => {
    if (!conversation) return;

    console.log('Setting up realtime subscription for conversation:', conversation.id);

    const channel = supabase
      .channel(`chat-messages-${conversation.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `conversation_id=eq.${conversation.id}`,
        },
        (payload) => {
          console.log('New message received:', payload);
          setMessages((prev) => [...prev, payload.new as ChatMessage]);
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    return () => {
      console.log('Cleaning up realtime subscription');
      supabase.removeChannel(channel);
    };
  }, [conversation]);

  return {
    conversation,
    messages,
    isLoading,
    isSending,
    startChat,
    sendMessage,
    closeChat,
  };
};
