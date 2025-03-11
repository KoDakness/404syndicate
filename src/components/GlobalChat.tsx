import React, { useEffect, useRef, useState } from 'react';
import { MessageSquare, Send, RefreshCw } from 'lucide-react';
import { playChatSound } from '../lib/sounds';
import { supabase } from '../lib/supabase';

interface GlobalChatProps {
  messages: string[];
  onSendMessage: (message: string) => void;
}

interface ChatMessage {
  id: string;
  username: string;
  content: string;
  type: 'user' | 'system';
  created_at: string;
}

export const GlobalChat: React.FC<GlobalChatProps> = ({ messages, onSendMessage }) => {
  const chatRef = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connecting');
  const [subscriptionRetries, setSubscriptionRetries] = useState(0);

  // Fetch existing messages and subscribe to new ones
  useEffect(() => {
    let subscription: any;
    let mounted = true;

    const setupRealtimeSubscription = async () => {
      try {
        // Set up the real-time subscription
        setConnectionStatus('connecting');
        
        // Create a channel with a unique name to avoid conflicts
        const channelName = `realtime-chat-${Date.now()}`;
        
        subscription = supabase
          .channel(channelName)
          .on('postgres_changes', { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'chat_messages' 
          }, (payload) => {
            if (!mounted) return;
            
            const newMessage = payload.new as ChatMessage;
            console.log('Received new message:', newMessage);
            
            setChatMessages(prev => [...prev, newMessage]);
            
            // Play sound for new messages from others
            if (newMessage.type === 'user') {
              playChatSound();
            }
          })
          .subscribe((status) => {
            console.log('Subscription status:', status);
            
            if (status === 'SUBSCRIBED') {
              setConnectionStatus('connected');
            } else if (status === 'CHANNEL_ERROR') {
              setConnectionStatus('disconnected');
              
              // Try to reconnect after a delay
              setTimeout(() => {
                if (mounted) {
                  setSubscriptionRetries(prev => prev + 1);
                  if (subscription) {
                    supabase.removeChannel(subscription);
                  }
                  setupRealtimeSubscription();
                }
              }, 5000); // 5 second delay before reconnecting
            }
          });
      } catch (error) {
        console.error('Error setting up real-time subscription:', error);
        setConnectionStatus('disconnected');
      }
    };

    const fetchMessages = async () => {
      setIsLoading(true);
      try {
        // Get most recent messages (limit 50)
        const { data, error } = await supabase
          .from('chat_messages')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);
          
        if (error) throw error;
        
        if (mounted) {
          // Reverse to show oldest first
          setChatMessages(data ? [...data].reverse() : []);
        }
      } catch (error) {
        console.error('Error fetching chat messages:', error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }

      // Set up real-time subscription after fetching messages
      setupRealtimeSubscription();
    };

    fetchMessages();

    // Clean up on unmount
    return () => {
      mounted = false;
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [subscriptionRetries]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleRefreshChat = async () => {
    setIsLoading(true);
    try {
      // Get most recent messages (limit 50)
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
        
      if (error) throw error;
      
      // Reverse to show oldest first
      setChatMessages(data ? [...data].reverse() : []);
    } catch (error) {
      console.error('Error refreshing chat messages:', error);
    } finally {
      setIsLoading(false);
    }
    
    // Force reconnect by incrementing retry counter
    setSubscriptionRetries(prev => prev + 1);
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    try {
      // Get current username from local player state
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      // Get player info to get username
      const { data: playerData } = await supabase
        .from('players')
        .select('username')
        .eq('id', user.id)
        .single();
        
      if (!playerData) return;
      
      // Insert message into database
      const { error } = await supabase
        .from('chat_messages')
        .insert([
          {
            username: playerData.username,
            content: message,
            type: 'user'
          }
        ]);
        
      if (error) throw error;
      
      // Clear input
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const renderMessage = (msg: ChatMessage) => {
    // Handle system messages
    if (msg.type === 'system') {
      // Handle special system messages differently
      if (msg.content.includes('just found a torcoin') || 
          msg.content.includes('bought a') || 
          msg.content.includes('found a wraithcoin') ||
          msg.content.includes('earned')) {
        return <div className="text-yellow-400 font-mono text-xs sm:text-sm">{`SYSTEM: ${msg.content}`}</div>;
      }
      // Regular system message
      return <div className="text-blue-400 font-mono text-xs sm:text-sm">{`SYSTEM: ${msg.content}`}</div>;
    }
    
    // User message
    return (
      <div className="text-green-400 font-mono text-xs sm:text-sm">
        <span className="text-blue-400">{msg.username}: </span>
        <span>{msg.content}</span>
      </div>
    );
  };

  return (
    <div className="relative">
      <div className="bg-black/90 border-2 sm:border-4 border-green-900/50 rounded-lg p-3 sm:p-6 h-[400px] lg:h-[600px] flex flex-col shadow-xl shadow-green-900/30">
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare className="w-4 h-4 text-green-400" />
          <h2 className="text-green-400 font-mono text-sm flex items-center justify-between w-full">
            <span>Global Network</span>
            <div className="flex items-center gap-2">
              <span className={`text-xs ${
                connectionStatus === 'connected' ? 'text-green-400' :
                connectionStatus === 'connecting' ? 'text-yellow-400' :
                'text-red-400'
              }`}>
                {connectionStatus === 'connected' ? 'Connected' :
                 connectionStatus === 'connecting' ? 'Connecting...' :
                 'Disconnected'}
              </span>
              <button 
                onClick={handleRefreshChat}
                className="text-green-600 hover:text-green-400"
                title="Refresh chat"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </h2>
        </div>
        
        <div 
          className="flex-1 overflow-y-auto scrollbar-hide mb-3"
          ref={chatRef}
        >
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-green-600 font-mono text-sm">Connecting to global network...</p>
            </div>
          ) : chatMessages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-green-600 font-mono text-sm">No messages yet. Be the first to write something!</p>
            </div>
          ) : (
            chatMessages.map((msg) => (
              <div key={msg.id} className="mb-1 sm:mb-2 leading-relaxed">
                {renderMessage(msg)}
              </div>
            ))
          )}
        </div>
        
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Enter message..."
            className="flex-1 bg-black/50 border-2 border-green-900 rounded py-2 px-3 text-green-400 font-mono text-xs sm:text-sm focus:outline-none focus:border-green-500"
          />
          <button
            onClick={handleSendMessage}
            className="bg-green-900/30 border-2 border-green-500 rounded px-3 text-green-400 hover:bg-green-900/50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};