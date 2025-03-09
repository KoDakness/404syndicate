import React, { useState, useEffect } from 'react';
import { Trophy, Bitcoin, Award, Skull } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface LeaderboardPlayer {
  id: string;
  username: string;
  level: number;
  credits: number;
  torcoins: number;
  wraithcoins: number;
}

export const Leaderboard: React.FC = () => {
  const [players, setPlayers] = useState<LeaderboardPlayer[]>([]);
  const [stats, setStats] = useState({
    totalPlayers: 0,
    activePlayers: 0,
    contractsCompleted: 0,
    totalTorcoins: 0,
    totalWraithcoins: 0
  });

  useEffect(() => {
    const fetchLeaderboard = async () => {
      // Fetch top players sorted by wraithcoins, torcoins, level, and credits
      const { data: leaderboardData, error: leaderboardError } = await supabase
        .from('players')
        .select('id, username, level, credits, torcoins, wraithcoins')
        .order('wraithcoins', { ascending: false })
        .order('torcoins', { ascending: false })
        .order('level', { ascending: false })
        .order('credits', { ascending: false })
        .limit(100);

      if (leaderboardError) {
        console.error('Error fetching leaderboard:', leaderboardError);
        return;
      }

      setPlayers(leaderboardData || []);

      // Fetch statistics
      const { count: totalPlayers } = await supabase
        .from('players')
        .select('id', { count: 'exact', head: true });

      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const { count: activePlayers } = await supabase
        .from('players')
        .select('id', { count: 'exact', head: true })
        .gt('updated_at', oneWeekAgo.toISOString());

      const { count: contractsCompleted } = await supabase
        .from('player_jobs')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'completed');

      const { data: currencyData } = await supabase
        .from('players')
        .select('torcoins, wraithcoins');

      const totalTorcoins = currencyData?.reduce((sum, player) => sum + (player.torcoins || 0), 0) || 0;
      const totalWraithcoins = currencyData?.reduce((sum, player) => sum + (player.wraithcoins || 0), 0) || 0;

      setStats({
        totalPlayers: totalPlayers || 0,
        activePlayers: activePlayers || 0,
        contractsCompleted: contractsCompleted || 0,
        totalTorcoins,
        totalWraithcoins
      });
    };

    fetchLeaderboard();

    // Refresh leaderboard every 5 minutes
    const interval = setInterval(fetchLeaderboard, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="h-[600px] flex flex-col">
          <h3 className="text-green-400 font-bold font-mono mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Top Hackers
          </h3>
          <div className="space-y-2 overflow-y-auto flex-1 pr-2 scrollbar-hide">
            {players.map((player, index) => (
              <div
                key={player.id}
                className="bg-black/50 border-2 border-green-900/50 rounded-lg p-3 flex items-center justify-between hover:bg-green-900/10 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="text-lg font-bold font-mono text-green-500 w-8">
                    {index + 1}
                  </span>
                  <div>
                    <div className="font-mono text-green-400">{player.username}</div>
                    <div className="flex items-center gap-3 mt-1">
                      {player.wraithcoins > 0 && (
                        <span className="text-sm text-purple-400 font-mono flex items-center gap-1">
                          <Skull className="w-3 h-3" /> {player.wraithcoins}
                        </span>
                      )}
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
                <span className="text-green-400 font-mono">{stats.totalPlayers.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-600 font-mono">Active Hackers</span>
                <span className="text-green-400 font-mono">{stats.activePlayers.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-600 font-mono">Contracts Completed</span>
                <span className="text-green-400 font-mono">{stats.contractsCompleted.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-600 font-mono">Total Torcoins</span>
                <span className="text-yellow-400 font-mono">{stats.totalTorcoins.toLocaleString()}</span>
              </div>
              {stats.totalWraithcoins > 0 && (
                <div className="flex justify-between">
                  <span className="text-green-600 font-mono">Total WraithCoins</span>
                  <span className="text-purple-400 font-mono">{stats.totalWraithcoins.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};