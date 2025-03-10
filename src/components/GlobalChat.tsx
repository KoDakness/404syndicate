import React, { useEffect, useRef, useState } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { playChatSound } from '../lib/sounds';

interface GlobalChatProps {
  messages: string[];
  onSendMessage: (message: string) => void;
}

export const GlobalChat: React.FC<GlobalChatProps> = ({ messages, onSendMessage }) => {
  const chatRef = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState('');
  const [prevMessageCount, setPrevMessageCount] = useState(0);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
    
    // Play sound if new message arrived (but not for initial load)
    if (prevMessageCount > 0 && messages.length > prevMessageCount) {
      // Only play sound for messages from others (not your own messages)
      const latestMessage = messages[messages.length - 1];
      if (!latestMessage.includes(': ') || !latestMessage.startsWith('SYSTEM:')) {
        playChatSound();
      }
    }
    
    setPrevMessageCount(messages.length);
  }, [messages, prevMessageCount]);

  const handleSendMessage = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const renderMessage = (msg: string) => {
    // Check if it's a system message
    if (msg.startsWith('SYSTEM:')) {
      // Handle special system messages differently
      if (msg.includes('just found a torcoin') || 
          msg.includes('bought a') || 
          msg.includes('found a wraithcoin') ||
          msg.includes('earned')) {
        return <div className="text-yellow-400 font-mono text-xs sm:text-sm">{msg}</div>;
      }
      // Regular system message
      return <div className="text-blue-400 font-mono text-xs sm:text-sm">{msg}</div>;
    }
    
    // Regular chat message
    const parts = msg.split(': ');
    if (parts.length >= 2) {
      const username = parts[0];
      const content = parts.slice(1).join(': ');
      return (
        <div className="text-green-400 font-mono text-xs sm:text-sm">
          <span className="text-blue-400">{username}: </span>
          <span>{content}</span>
        </div>
      );
    }
    
    // Fallback for messages that don't follow the expected format
    return <div className="text-green-400 font-mono text-xs sm:text-sm">{msg}</div>;
  };

  return (
    <div className="relative">
      <div className="bg-black/90 border-2 sm:border-4 border-green-900/50 rounded-lg p-3 sm:p-6 h-[400px] lg:h-[600px] flex flex-col shadow-xl shadow-green-900/30">
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare className="w-4 h-4 text-green-400" />
          <h2 className="text-green-400 font-mono text-sm">Global Network</h2>
        </div>
        
        <div 
          className="flex-1 overflow-y-auto scrollbar-hide mb-3"
          ref={chatRef}
        >
          {messages.map((message, index) => (
            <div key={index} className="mb-1 sm:mb-2 leading-relaxed">
              {renderMessage(message)}
            </div>
          ))}
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