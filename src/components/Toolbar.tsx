import React, { useState } from 'react';
import { Store, Brain, AlertCircle, Trophy, Key, Settings, Users } from 'lucide-react';
import { Panel } from './Panel';
import { EquipmentShop } from './EquipmentShop';
import { SkillTree } from './SkillTree';
import { Leaderboard } from './Leaderboard';
import { EventPanel } from './EventPanel';
import CrackingGames from './CrackingGames';
import SettingsPanel from './SettingsPanel';
import AdminManagement from './AdminManagement';
import { playSound } from '../lib/sounds';
import type { Equipment, Player } from '../types';

interface ToolbarProps {
  equipment: Equipment[];
  onPurchase: (id: string) => void;
  onEquip: (id: string) => void;
  onUnequip: (id: string) => void;
  activePanel: string | null;
  onPanelChange: (panel: string | null) => void;
  eventKey: number;
  isAdmin: boolean;
  playerCredits: number;
  playerTorcoins: number;
  player: Player;
  onUpgradeSkill: (skill: keyof Player['skills']) => void;
  onEventReward: (torcoins: number) => void;
  onCreateLoadout: (baseId: string, motherboardId: string) => void;
  onEquipLoadout: (loadoutId: string) => void;
  onInstallComponent: (loadoutId: string, slot: string, componentId: string) => void;
  onUninstallComponent: (loadoutId: string, slot: string) => void;
  onDeleteLoadout: (loadoutId: string) => void;
  onUpdatePlayer: (updates: Partial<Player>) => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  equipment,
  onPurchase,
  onEquip,
  activePanel,
  onPanelChange,
  onUnequip,
  eventKey,
  isAdmin,
  playerCredits,
  playerTorcoins,
  player,
  onUpgradeSkill,
  onEventReward,
  onCreateLoadout,
  onEquipLoadout,
  onInstallComponent,
  onUninstallComponent,
  onDeleteLoadout,
  onUpdatePlayer,
}) => {  
  const togglePanel = (panelId: string) => {
    playSound('click');
    onPanelChange(activePanel === panelId ? null : panelId);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/90 border-t-4 border-green-900/50 z-40">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-center flex-nowrap p-2">
          <button
            onClick={() => togglePanel('equipment')}
            className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 rounded border-2 whitespace-nowrap text-sm sm:text-base ${
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
            className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 rounded border-2 whitespace-nowrap text-sm sm:text-base ${
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
            className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 rounded border-2 whitespace-nowrap text-sm sm:text-base ${
              activePanel === 'events' 
                ? 'bg-green-900/30 border-green-400' 
                : 'border-green-900/50 hover:border-green-400'
            }`}
          >
            <AlertCircle className="w-5 h-5" />
            <span className="font-mono">Events</span>
          </button>
          <button
            onClick={() => togglePanel('cracking')}
            className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 rounded border-2 whitespace-nowrap text-sm sm:text-base ${
              activePanel === 'cracking' 
                ? 'bg-green-900/30 border-green-400' 
                : 'border-green-900/50 hover:border-green-400'
            }`}
          >
            <Key className="w-5 h-5" />
            <span className="font-mono">Cracking</span>
          </button>
          <button
            onClick={() => togglePanel('leaderboard')}
            className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 rounded border-2 whitespace-nowrap text-sm sm:text-base ${
              activePanel === 'leaderboard' 
                ? 'bg-green-900/30 border-green-400' 
                : 'border-green-900/50 hover:border-green-400'
            }`}
          >
            <Trophy className="w-5 h-5" />
            <span className="font-mono">Leaderboard</span>
          </button>
          {isAdmin && (
            <button
              onClick={() => togglePanel('admin')}
              className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 rounded border-2 whitespace-nowrap text-sm sm:text-base ${
                activePanel === 'admin' 
                  ? 'bg-green-900/30 border-green-400' 
                  : 'border-green-900/50 hover:border-green-400'
              }`}
            >
              <Users className="w-5 h-5" />
              <span className="font-mono">Admins</span>
            </button>
          )}
          <button
            onClick={() => togglePanel('settings')}
            className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 rounded border-2 whitespace-nowrap text-sm sm:text-base ${
              activePanel === 'settings' 
                ? 'bg-green-900/30 border-green-400' 
                : 'border-green-900/50 hover:border-green-400'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="font-mono">Settings</span>
          </button>
        </div>
        
        {activePanel && (
          <div className="border-t-2 border-green-900/50 p-4 relative">
            {activePanel === 'equipment' && (
              <EquipmentShop
                equipment={equipment}
                onPurchase={onPurchase}
                onEquipLoadout={onEquipLoadout}
                onCreateLoadout={onCreateLoadout}
                onInstallComponent={onInstallComponent}
                onUninstallComponent={onUninstallComponent}
                onDeleteLoadout={onDeleteLoadout}
                playerCredits={playerCredits}
                playerTorcoins={playerTorcoins}
                player={player}
                onUpdatePlayer={onUpdatePlayer}
              />
            )}
            {activePanel === 'skills' && (
              <SkillTree
                player={player}
                onUpgradeSkill={onUpgradeSkill}
              />
            )}
            {activePanel === 'events' && (
              <EventPanel 
                key={eventKey} 
                isAdmin={isAdmin} 
                onReward={(torcoins) => {
                  onEventReward(torcoins);
                }}
              />
            )}
            {activePanel === 'leaderboard' && (
              <Leaderboard />
            )}
            {activePanel === 'cracking' && (
              <CrackingGames onReward={onEventReward} />
            )}
            {activePanel === 'settings' && (
              <SettingsPanel onClose={() => onPanelChange(null)} />
            )}
            {activePanel === 'admin' && isAdmin && (
              <AdminManagement playerIsAdmin={isAdmin} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};