import React from 'react';
import { Player } from '../types';
import { Wallet, Shield, Ghost, Award, Bitcoin, Lock, Brain, Cpu, User, LogOut, Mail } from 'lucide-react';

interface PlayerStatsProps {
  player: Player;
  onLogout: () => void;
}

const PlayerStats: React.FC<PlayerStatsProps> = ({ player, onLogout }) => {
  return (
    <div className="bg-black/50 border-2 sm:border-4 border-green-900/50 rounded-lg p-3 sm:p-4 backdrop-blur-sm shadow-xl shadow-green-900/30">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <User className="text-green-400" />
              <span className="text-green-400 font-mono text-lg">
                {player.username}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="text-yellow-400" />
              <span className="text-green-400 font-mono">
                Level {player.level} ({player.experience}/1000 XP)
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Wallet className="text-green-400" />
              <span className="text-green-400 font-mono">
                ${player.credits.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Bitcoin className="text-yellow-400" />
              <span className="text-yellow-400 font-mono">
                {player.torcoins}
              </span>
            </div>
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
      {player.equipment.equipped.length > 0 && (
        <div className="mt-4">
          <div className="text-sm text-green-600 font-mono mb-2">Installed Equipment</div>
          <div className="flex flex-wrap gap-2">
            {player.equipment.equipped.map((eq) => (
              <div key={eq.id} className="bg-black/50 border-2 border-green-900/50 rounded px-2 py-1 text-xs font-mono">
                {eq.name}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export { PlayerStats };