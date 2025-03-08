import React from 'react';
import { Terminal as TerminalIcon, Cpu, Shield, Ghost } from 'lucide-react';

interface TerminalProps {
  messages: string[];
}

export const Terminal: React.FC<TerminalProps> = ({ messages }) => {
  const terminalRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="bg-black/90 border-4 border-green-900/50 rounded-lg p-6 font-mono text-sm h-[600px] overflow-y-auto scrollbar-hide shadow-xl shadow-green-900/30" ref={terminalRef}>
      {messages.map((message, index) => (
        <div key={index} className="text-green-400 mb-2 leading-relaxed whitespace-pre-wrap">
          <span className="text-blue-400">{'>'}</span> {message}
        </div>
      ))}
      <div className="text-green-400 animate-pulse mt-2">
        <span className="text-blue-400">{'>'}</span> _
      </div>
    </div>
  );
};