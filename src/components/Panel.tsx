import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface PanelProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export const Panel: React.FC<PanelProps> = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-black/50 border-4 border-green-900/50 rounded-lg overflow-hidden shadow-xl shadow-green-900/30">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-green-900/10 transition-colors"
      >
        <h2 className="text-xl font-bold font-mono text-green-400">{title}</h2>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-green-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-green-400" />
        )}
      </button>
      {isOpen && <div className="p-4">{children}</div>}
    </div>
  );
};