import React from 'react';
import { Player } from '../types';
import { Terminal as TerminalIcon, Coins, Award, Brain, RefreshCw, Timer, AlertCircle } from 'lucide-react';

interface AdminPanelProps {
  player: Player;
  onUpdatePlayer: (updates: Partial<Player>) => void;
  onRefreshContracts: () => void;
  onUpdateSpeed: (multiplier: number) => void;
  onResetEvent?: () => void;
  timeMultiplier: number;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  player,
  onUpdatePlayer,
  onRefreshContracts,
  onUpdateSpeed,
  onResetEvent,
  timeMultiplier
}) => {
  const addCredits = (amount: number) => {
    onUpdatePlayer({ credits: player.credits + amount });
  };

  const setLevel = (level: number) => {
    onUpdatePlayer({ level });
  };

  const addSkillPoints = (points: number) => {
    onUpdatePlayer({
      skills: {
        ...player.skills,
        skillPoints: player.skills.skillPoints + points
      }
    });
  };

  const maxSkills = () => {
    onUpdatePlayer({
      skills: {
        decryption: 99,
        firewall: 99,
        spoofing: 99,
        skillPoints: player.skills.skillPoints
      }
    });
  };

  return (
    <div className="fixed top-4 right-4 bg-red-900/90 border-2 border-red-500 rounded-lg p-4 z-50 w-64">
      <div className="text-red-400 font-bold font-mono mb-4 flex items-center gap-2">
        <TerminalIcon className="w-4 h-4" />
        Admin Controls
      </div>
      
      <div className="space-y-4">
        <div>
          <div className="text-red-400 font-mono text-sm mb-2 flex items-center gap-2">
            <Coins className="w-4 h-4" />
            Credits
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => addCredits(10000)}
              className="flex-1 px-2 py-1 bg-red-950 border border-red-500 rounded text-xs font-mono hover:bg-red-900"
            >
              +10k
            </button>
            <button
              onClick={() => addCredits(100000)}
              className="flex-1 px-2 py-1 bg-red-950 border border-red-500 rounded text-xs font-mono hover:bg-red-900"
            >
              +100k
            </button>
          </div>
        </div>

        <div>
          <div className="text-red-400 font-mono text-sm mb-2 flex items-center gap-2">
            <Award className="w-4 h-4" />
            Level
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setLevel(5)}
              className="flex-1 px-2 py-1 bg-red-950 border border-red-500 rounded text-xs font-mono hover:bg-red-900"
            >
              Level 5
            </button>
            <button
              onClick={() => setLevel(10)}
              className="flex-1 px-2 py-1 bg-red-950 border border-red-500 rounded text-xs font-mono hover:bg-red-900"
            >
              Level 10
            </button>
          </div>
        </div>

        <div>
          <div className="text-red-400 font-mono text-sm mb-2 flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Skills
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => addSkillPoints(5)}
              className="flex-1 px-2 py-1 bg-red-950 border border-red-500 rounded text-xs font-mono hover:bg-red-900"
            >
              +5 Points
            </button>
            <button
              onClick={() => maxSkills()}
              className="flex-1 px-2 py-1 bg-red-950 border border-red-500 rounded text-xs font-mono hover:bg-red-900"
            >
              Max All
            </button>
          </div>
        </div>
        
        <div>
          <div className="text-red-400 font-mono text-sm mb-2 flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Contracts
          </div>
          <button
            onClick={onRefreshContracts}
            className="w-full px-2 py-1 bg-red-950 border border-red-500 rounded text-xs font-mono hover:bg-red-900"
          >
            Refresh All Contracts
          </button>
        </div>
        
        <div>
          <div className="text-red-400 font-mono text-sm mb-2 flex items-center gap-2">
            <Timer className="w-4 h-4" />
            Contract Speed
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => onUpdateSpeed(1)}
              className={`px-2 py-1 bg-red-950 border border-red-500 rounded text-xs font-mono hover:bg-red-900
                ${timeMultiplier === 1 ? 'bg-red-900' : ''}`}
            >
              1x
            </button>
            <button
              onClick={() => onUpdateSpeed(10)}
              className={`px-2 py-1 bg-red-950 border border-red-500 rounded text-xs font-mono hover:bg-red-900
                ${timeMultiplier === 10 ? 'bg-red-900' : ''}`}
            >
              10x
            </button>
            <button
              onClick={() => onUpdateSpeed(100)}
              className={`px-2 py-1 bg-red-950 border border-red-500 rounded text-xs font-mono hover:bg-red-900
                ${timeMultiplier === 100 ? 'bg-red-900' : ''}`}
            >
              100x
            </button>
          </div>
        </div>
        
        <div>
          <div className="text-red-400 font-mono text-sm mb-2 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Event Controls
          </div>
          <button
            onClick={onResetEvent}
            className="w-full px-2 py-1 bg-red-950 border border-red-500 rounded text-xs font-mono hover:bg-red-900"
          >
            Reset Event Lockout
          </button>
        </div>
      </div>
    </div>
  );
};