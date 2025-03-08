import React from 'react';
import { Trophy, Bitcoin, Award } from 'lucide-react';

// Generate 100 mock hackers
const mockLeaderboard = Array.from({ length: 100 }, (_, i) => ({
  id: (i + 1).toString(),
  name: [
    'Cyber', 'Data', 'Neon', 'Ghost', 'Shadow', 'Quantum', 'Binary', 'Neural',
    'Crypto', 'Pixel', 'Vector', 'Zero', 'Matrix', 'Code', 'Net', 'Void'
  ][Math.floor(Math.random() * 16)] + [
    'Ninja', 'Hunter', 'Runner', 'Phantom', 'Reaper', 'Wraith', 'Spectre',
    'Knight', 'Master', 'Blade', 'Smith', 'Walker', 'Stalker', 'Shade', 'Drift'
  ][Math.floor(Math.random() * 15)],
  level: Math.floor(Math.random() * 50) + 50, // Level 50-99
  credits: Math.floor(Math.random() * 2000000) + 500000, // 500k-2.5M credits
  torcoins: Math.floor(Math.random() * 50) + 1, // 1-50 torcoins
})).sort((a, b) => {
  // First sort by torcoins (highest first)
  if (b.torcoins !== a.torcoins) {
    return b.torcoins - a.torcoins;
  }
  // Then by level if torcoins are equal
  if (b.level !== a.level) {
    return b.level - a.level;
  }
  // Finally by credits if both torcoins and level are equal
  return b.credits - a.credits;
});

export const Leaderboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="h-[600px] flex flex-col">
          <h3 className="text-green-400 font-bold font-mono mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Top Hackers
          </h3>
          <div className="space-y-2 overflow-y-auto flex-1 pr-2 scrollbar-hide">
            {mockLeaderboard.map((player, index) => (
              <div
                key={player.id}
                className="bg-black/50 border-2 border-green-900/50 rounded-lg p-3 flex items-center justify-between hover:bg-green-900/10 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="text-lg font-bold font-mono text-green-500 w-8">
                    {index + 1}
                  </span>
                  <div>
                    <div className="font-mono text-green-400">{player.name}</div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm text-yellow-400 font-mono flex items-center gap-1">
                        <Bitcoin className="w-3 h-3" /> {player.torcoins}
                      </span>
                      <span className="text-sm text-green-600 font-mono flex items-center gap-1">
                        <Award className="w-3 h-3" /> {player.level}
                      </span>
                      <span className="text-sm text-green-600 font-mono">
                        ${player.credits.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-green-400 font-bold font-mono mb-4">Statistics</h3>
          <div className="bg-black/50 border-2 border-green-900/50 rounded-lg p-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-green-600 font-mono">Total Players</span>
                <span className="text-green-400 font-mono">1,337</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-600 font-mono">Active Hackers</span>
                <span className="text-green-400 font-mono">421</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-600 font-mono">Contracts Completed</span>
                <span className="text-green-400 font-mono">13,370</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-600 font-mono">Total Torcoins</span>
                <span className="text-yellow-400 font-mono">892</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};