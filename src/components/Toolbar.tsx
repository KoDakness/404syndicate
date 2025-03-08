import React, { useState } from 'react';
import { Store, Brain, AlertCircle, Trophy } from 'lucide-react';
import { Panel } from './Panel';
import { EquipmentShop } from './EquipmentShop';
import { SkillTree } from './SkillTree';
import { Leaderboard } from './Leaderboard';
import { EventPanel } from './EventPanel';
import type { Equipment, Player } from '../types';

interface ToolbarProps {
  equipment: Equipment[];
  onPurchase: (id: string) => void;
  onEquip: (id: string) => void;
  onUnequip: (id: string) => void;
  eventKey: number;
  isAdmin: boolean;
  playerCredits: number;
  playerTorcoins: number;
  player: Player;
  onUpgradeSkill: (skill: keyof Player['skills']) => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  equipment,
  onPurchase,
  onEquip,
  onUnequip,
  eventKey,
  isAdmin,
  playerCredits,
  playerTorcoins,
  player,
  onUpgradeSkill,
}) => {
  const [activePanel, setActivePanel] = useState<string | null>(null);

  const togglePanel = (panelId: string) => {
    setActivePanel(activePanel === panelId ? null : panelId);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/90 border-t-4 border-green-900/50">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-center gap-4 p-2">
          <button
            onClick={() => togglePanel('equipment')}
            className={`flex items-center gap-2 px-4 py-2 rounded border-2 ${
              activePanel === 'equipment' 
                ? 'bg-green-900/30 border-green-400' 
                : 'border-green-900/50 hover:border-green-400'
            }`}
          >
            <Store className="w-5 h-5" />
            <span className="font-mono">Equipment</span>
          </button>
          <button
            onClick={() => togglePanel('skills')}
            className={`flex items-center gap-2 px-4 py-2 rounded border-2 ${
              activePanel === 'skills' 
                ? 'bg-green-900/30 border-green-400' 
                : 'border-green-900/50 hover:border-green-400'
            }`}
          >
            <Brain className="w-5 h-5" />
            <span className="font-mono">Skills</span>
            {player.skills.skillPoints > 0 && (
              <span className="bg-green-400 text-black text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {player.skills.skillPoints}
              </span>
            )}
          </button>
          <button
            onClick={() => togglePanel('events')}
            data-panel="events"
            className={`flex items-center gap-2 px-4 py-2 rounded border-2 ${
              activePanel === 'events' 
                ? 'bg-green-900/30 border-green-400' 
                : 'border-green-900/50 hover:border-green-400'
            }`}
          >
            <AlertCircle className="w-5 h-5" />
            <span className="font-mono">Events</span>
          </button>
          <button
            onClick={() => togglePanel('leaderboard')}
            className={`flex items-center gap-2 px-4 py-2 rounded border-2 ${
              activePanel === 'leaderboard' 
                ? 'bg-green-900/30 border-green-400' 
                : 'border-green-900/50 hover:border-green-400'
            }`}
          >
            <Trophy className="w-5 h-5" />
            <span className="font-mono">Leaderboard</span>
          </button>
        </div>
        
        {activePanel && (
          <div className="border-t-2 border-green-900/50 p-4">
            {activePanel === 'equipment' && (
              <EquipmentShop
                equipment={equipment}
                onPurchase={onPurchase}
                onEquip={onEquip}
                onUnequip={onUnequip}
                playerCredits={playerCredits}
                playerTorcoins={playerTorcoins}
                playerEquipment={player.equipment}
              />
            )}
            {activePanel === 'skills' && (
              <SkillTree
                player={player}
                onUpgradeSkill={onUpgradeSkill}
              />
            )}
            {activePanel === 'events' && (
              <EventPanel key={eventKey} isAdmin={isAdmin} />
            )}
            {activePanel === 'leaderboard' && (
              <Leaderboard />
            )}
          </div>
        )}
      </div>
    </div>
  );
};