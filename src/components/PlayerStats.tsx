import React from 'react';
import { Player } from '../types';
import { Wallet, Shield, Ghost, Award, Bitcoin, Brain, Cpu, User, LogOut, Mail, Server, Skull } from 'lucide-react';

interface PlayerStatsProps {
  player: Player;
  onLogout: () => void;
}

// Helper function to get XP requirement for the player's current level
const getExpRequiredForLevel = (level: number): number => {
  if (level >= 75) return 40000;
  if (level >= 60) return 25000;
  if (level >= 40) return 10000;
  return 2200; // Base experience requirement - changed from 5000 to 2200
};

const PlayerStats: React.FC<PlayerStatsProps> = ({ player, onLogout }) => {
  // Find the active loadout if any
  const activeLoadout = player.loadouts.find(loadout => loadout.active);
  
  // Get the XP requirement for the player's current level
  const requiredXP = getExpRequiredForLevel(player.level);
  
  return (
    <div className="bg-black/50 border-2 sm:border-4 border-green-900/50 rounded-lg p-3 sm:p-4 backdrop-blur-sm shadow-xl shadow-green-900/30">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <User className="text-green-400" />
              <span className="text-green-400 font-mono text-lg">
                {player.username || 'Anonymous'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="text-yellow-400" />
              <span className="text-green-400 font-mono">
                Level {player.level} ({player.experience}/{requiredXP} XP)
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Wallet className="text-green-400" />
              <span className="text-green-400 font-mono">
                <span className="text-xs mr-1">Credits</span>${player.credits.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Bitcoin className="text-yellow-400" />
              <span className="text-yellow-400 font-mono">
                <span className="text-xs mr-1">Torcoin</span>{player.torcoins}
              </span>
            </div>
            {player.wraithcoins > 0 && (
              <div className="flex items-center gap-2">
                <Skull className="w-4 h-4 text-purple-400" />
                <span className="text-purple-400 font-mono">
                  <span className="text-xs mr-1">WraithCoin</span>{player.wraithcoins}
                </span>
              </div>
            )}
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-3 py-1 border-2 border-red-500 rounded hover:bg-red-900/30 text-red-400 font-mono text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-400" />
              <span className="text-green-400 font-mono">Corp: {player.reputation.corporate}</span>
            </div>
            <div className="flex items-center gap-2">
              <Ghost className="w-4 h-4 text-green-400" />
              <span className="text-green-400 font-mono">Underground: {player.reputation.underground}</span>
            </div>
          </div>
          <div className="flex items-center gap-4 justify-end">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-400" />
              <span className="text-green-400 font-mono">Dec: {player.skills.decryption}</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-red-400" />
              <span className="text-green-400 font-mono">Fwall: {player.skills.firewall}</span>
            </div>
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-400" />
              <span className="text-green-400 font-mono">Spoof: {player.skills.spoofing}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-purple-400" />
              <span className="text-green-400 font-mono">Social: {player.skills.social}</span>
            </div>
          </div>
        </div>
      </div>
      
      {activeLoadout && (
        <div className="mt-4">
          <div className="text-sm text-green-600 font-mono mb-2">Active Loadout</div>
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-purple-400" />
            <span className="text-green-400 font-mono text-xs">
              {player.loadouts.length > 0 ? `${activeLoadout ? 'Active Rig Ready' : 'No Active Loadout'}` : 'No Loadouts Available'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export { PlayerStats };