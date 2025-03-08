import React from 'react';
import { Equipment } from '../types';
import { Cpu, Shield, Brain, Code, Bitcoin } from 'lucide-react';

interface EquipmentShopProps {
  equipment: Equipment[];
  onPurchase: (id: string) => void;
  onEquip: (id: string) => void;
  onUnequip: (id: string) => void;
  playerCredits: number;
  playerTorcoins: number;
  playerEquipment: {
    equipped: Equipment[];
    inventory: Equipment[];
  };
}

export const EquipmentShop: React.FC<EquipmentShopProps> = ({
  equipment,
  onPurchase,
  onEquip,
  onUnequip,
  playerCredits,
  playerTorcoins,
  playerEquipment,
}) => {
  const getEquipmentIcon = (type: Equipment['type']) => {
    switch (type) {
      case 'processor':
        return <Cpu className="w-5 h-5 text-blue-400" />;
      case 'memory':
        return <Brain className="w-5 h-5 text-purple-400" />;
      case 'security':
        return <Shield className="w-5 h-5 text-red-400" />;
      case 'software':
        return <Code className="w-5 h-5 text-green-400" />;
    }
  };

  const isOwned = (id: string) => 
    playerEquipment?.inventory?.some(e => e.id === id) || 
    playerEquipment?.equipped?.some(e => e.id === id);

  const isEquipped = (id: string) => 
    playerEquipment?.equipped?.some(e => e.id === id);

  const getRarityColor = (rarity: Equipment['rarity']) => {
    switch (rarity) {
      case 'common':
        return 'text-gray-400';
      case 'rare':
        return 'text-blue-400';
      case 'legendary':
        return 'text-purple-400';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-4">
        <h3 className="text-green-400 font-bold font-mono mb-4">Available Equipment</h3>
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
          {equipment.map((item) => (
            <div
              key={item.id}
              className="bg-black/50 border-4 border-green-900/50 rounded-lg p-4 hover:bg-green-900/10 transition-colors backdrop-blur-sm shadow-xl shadow-green-900/30">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getEquipmentIcon(item.type)}
                  <h3 className={`font-bold font-mono ${getRarityColor(item.rarity)}`}>{item.name}</h3>
                </div>
                <span className="text-sm text-green-400 font-mono">
                  Lvl {item.level}
                </span>
              </div>
          
              <p className="text-green-600 text-sm mb-4 font-mono">
                {Object.entries(item.effects).map(([key, value]) => {
                  if (typeof value === 'object') {
                    return Object.entries(value).map(([skill, boost]) => 
                      `+${boost} ${skill}`
                    ).join(', ');
                  }
                  return `+${value} ${key.replace('_', ' ')}`;
                }).join(' | ')}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-green-400 font-mono">
                    ${item.cost.toLocaleString()}
                  </div>
                  {item.torcoinCost && (
                    <div className="flex items-center gap-1 text-yellow-400 font-mono">
                      <Bitcoin className="w-4 h-4" />
                      {item.torcoinCost}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => onPurchase(item.id)}
                  disabled={
                    isOwned(item.id) ||
                    playerCredits < item.cost ||
                    (item.torcoinCost && playerTorcoins < item.torcoinCost)
                  }
                  className={`px-4 py-2 rounded border-2 border-green-500 bg-black/50 text-green-400 text-sm font-mono
                    ${(isOwned(item.id) || playerCredits < item.cost || (item.torcoinCost && playerTorcoins < item.torcoinCost))
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:bg-green-900/30'}`}
                >
                  {isOwned(item.id) ? 'Owned' : 'Purchase'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <h3 className="text-green-400 font-bold font-mono mb-4">
            Equipped ({playerEquipment?.equipped?.length || 0}/5)
          </h3>
          <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
            {playerEquipment?.equipped?.map((item) => (
              <div key={item.id} className="bg-black/50 border-2 border-green-400 rounded-lg p-2 flex justify-between items-center">
                <span className="font-mono text-sm">{item.name}</span>
                <button
                  onClick={() => onUnequip(item.id)}
                  className="px-2 py-1 rounded border border-green-500 text-xs font-mono hover:bg-green-900/30"
                >
                  Unequip
                </button>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-green-400 font-bold font-mono mb-4">
            Inventory ({playerEquipment?.inventory?.length || 0}/5)
          </h3>
          <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
            {playerEquipment?.inventory?.map((item) => (
              <div key={item.id} className="bg-black/50 border-2 border-green-900/50 rounded-lg p-2 flex justify-between items-center">
                <span className="font-mono text-sm">{item.name}</span>
                <button
                  onClick={() => onEquip(item.id)}
                  disabled={playerEquipment?.equipped?.length >= 5}
                  className={`px-2 py-1 rounded border border-green-500 text-xs font-mono
                    ${playerEquipment?.equipped?.length >= 5 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-900/30'}`}
                >
                  Equip
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};