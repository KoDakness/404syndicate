import React, { useState } from 'react';
import { Player } from '../types';
import { Terminal as TerminalIcon, Coins, Award, Brain, RefreshCw, Timer, AlertCircle, Bitcoin, Skull } from 'lucide-react';

interface AdminPanelProps {
  player: Player;
  onUpdatePlayer: (updates: Partial<Player>) => void;
  onRefreshContracts: () => void;
  onUpdateSpeed: (multiplier: number) => void;
  onResetEvent?: () => void;
  onResetTutorial?: () => void;
  timeMultiplier: number;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  player,
  onUpdatePlayer,
  onRefreshContracts,
  onUpdateSpeed,
  onResetEvent: handleEventReset,
  onResetTutorial: handleTutorialReset,
  timeMultiplier
}) => {
  const [experienceValue, setExperienceValue] = useState<string>(player.experience.toString());
  const [levelValue, setLevelValue] = useState<string>(player.level.toString());

  const addCredits = (amount: number) => {
    onUpdatePlayer({ credits: player.credits + amount });
  };

  const addTorcoins = (amount: number) => {
    onUpdatePlayer({ torcoins: player.torcoins + amount });
  };

  const addWraithcoins = (amount: number) => {
    onUpdatePlayer({ wraithcoins: player.wraithcoins + amount });
  };

  const setLevel = (level: number) => {
    onUpdatePlayer({ level });
    setLevelValue(level.toString());
  };

  const setExperience = (experience: number) => {
    onUpdatePlayer({ experience });
    setExperienceValue(experience.toString());
  };

  const handleExperienceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setExperienceValue(value);
  };

  const handleLevelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLevelValue(value);
  };

  const handleExperienceSubmit = () => {
    const experience = parseInt(experienceValue);
    if (!isNaN(experience) && experience >= 0) {
      setExperience(experience);
    }
  };

  const handleLevelSubmit = () => {
    const level = parseInt(levelValue);
    if (!isNaN(level) && level > 0) {
      setLevel(level);
    }
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
        social: 99,
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
            <Bitcoin className="w-4 h-4" />
            Torcoins
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => addTorcoins(1)}
              className="flex-1 px-2 py-1 bg-red-950 border border-red-500 rounded text-xs font-mono hover:bg-red-900"
            >
              +1
            </button>
            <button
              onClick={() => addTorcoins(5)}
              className="flex-1 px-2 py-1 bg-red-950 border border-red-500 rounded text-xs font-mono hover:bg-red-900"
            >
              +5
            </button>
            <button
              onClick={() => addTorcoins(10)}
              className="flex-1 px-2 py-1 bg-red-950 border border-red-500 rounded text-xs font-mono hover:bg-red-900"
            >
              +10
            </button>
          </div>
        </div>

        <div>
          <div className="text-red-400 font-mono text-sm mb-2 flex items-center gap-2">
            <Skull className="w-4 h-4" />
            Wraithcoins
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => addWraithcoins(1)}
              className="flex-1 px-2 py-1 bg-red-950 border border-red-500 rounded text-xs font-mono hover:bg-red-900"
            >
              +1
            </button>
            <button
              onClick={() => addWraithcoins(5)}
              className="flex-1 px-2 py-1 bg-red-950 border border-red-500 rounded text-xs font-mono hover:bg-red-900"
            >
              +5
            </button>
          </div>
        </div>

        {/* Direct Experience Edit */}
        <div>
          <div className="text-red-400 font-mono text-sm mb-2 flex items-center gap-2">
            <Award className="w-5 h-5" />
            Experience
          </div>
          <div className="flex gap-2">
            <input
              type="number"
              min="0"
              value={experienceValue}
              onChange={handleExperienceChange}
              className="flex-1 px-2 py-1 bg-red-950 border border-red-500 rounded text-xs font-mono"
            />
            <button
              onClick={handleExperienceSubmit}
              className="px-2 py-1 bg-red-950 border border-red-500 rounded text-xs font-mono hover:bg-red-900"
            >
              Set
            </button>
          </div>
        </div>

        {/* Direct Level Edit */}
        <div>
          <div className="text-red-400 font-mono text-sm mb-2 flex items-center gap-2">
            <Award className="w-5 h-5" />
            Level
          </div>
          <div className="flex gap-2">
            <input
              type="number"
              min="1"
              value={levelValue}
              onChange={handleLevelChange}
              className="flex-1 px-2 py-1 bg-red-950 border border-red-500 rounded text-xs font-mono"
            />
            <button
              onClick={handleLevelSubmit}
              className="px-2 py-1 bg-red-950 border border-red-500 rounded text-xs font-mono hover:bg-red-900"
            >
              Set
            </button>
          </div>
        </div>

        <div>
          <div className="text-red-400 font-mono text-sm mb-2 flex items-center gap-2">
            <Award className="w-4 h-4" />
            Level Presets
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
            onClick={handleEventReset}
            className="w-full px-2 py-1 bg-red-950 border border-red-500 rounded text-xs font-mono hover:bg-red-900"
          >
            Reset Event Lockout
          </button>
        </div>
        
        <div>
          <div className="text-red-400 font-mono text-sm mb-2 flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Tutorial Controls
          </div>
          <button
            onClick={handleTutorialReset}
            className="w-full px-2 py-1 bg-red-950 border border-red-500 rounded text-xs font-mono hover:bg-red-900"
          >
            Reset Tutorial
          </button>
        </div>
      </div>
    </div>
  );
};