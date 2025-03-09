import React, { useState, useEffect } from 'react';
import { Equipment, Player } from '../types';
import { Cpu, Shield, Brain, Code, Bitcoin, HardDrive, Cpu as Gpu, Clapperboard as Motherboard, Server, Store, Package, Boxes, LayoutList, Skull } from 'lucide-react';
import { LoadoutManager } from './LoadoutManager';

interface EquipmentShopProps {
  equipment: Equipment[];
  onPurchase: (id: string) => void;
  onEquipLoadout: (loadoutId: string) => void;
  onCreateLoadout: (baseId: string, motherboardId: string) => void;
  onInstallComponent: (loadoutId: string, slot: string, componentId: string) => void;
  onUninstallComponent: (loadoutId: string, slot: string) => void;
  onDeleteLoadout: (loadoutId: string) => void;
  playerCredits: number;
  playerTorcoins: number;
  player: Player;
}

type TabType = 'shop' | 'inventory';

export const EquipmentShop: React.FC<EquipmentShopProps> = ({
  equipment,
  onPurchase,
  onEquipLoadout,
  onCreateLoadout,
  onInstallComponent,
  onUninstallComponent,
  onDeleteLoadout,
  playerCredits,
  playerTorcoins,
  player,
}) => {
  const [selectedBase, setSelectedBase] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('shop');
  const [selectedMotherboard, setSelectedMotherboard] = useState<string | null>(null);
  const [showCreateLoadoutModal, setShowCreateLoadoutModal] = useState<boolean>(false);
  const [displayedEquipment, setDisplayedEquipment] = useState<Equipment[]>([]);
  const [equipmentFilter, setEquipmentFilter] = useState<string>('all');

  useEffect(() => {
    // Filter equipment based on selected filter
    if (equipmentFilter === 'all') {
      setDisplayedEquipment(equipment);
    } else {
      setDisplayedEquipment(equipment.filter(item => {
        if (equipmentFilter === 'base') return item.type === 'base';
        if (equipmentFilter === 'motherboard') return item.type === 'motherboard';
        if (equipmentFilter === 'component') return item.type === 'component';
        if (equipmentFilter === 'cpu') return item.type === 'component' && item.componentType === 'cpu';
        if (equipmentFilter === 'ram') return item.type === 'component' && item.componentType === 'ram';
        if (equipmentFilter === 'storage') return item.type === 'component' && item.componentType === 'storage';
        if (equipmentFilter === 'gpu') return item.type === 'component' && item.componentType === 'gpu';
        return true;
      }));
    }
  }, [equipment, equipmentFilter]);

  const getComponentIcon = (type: Equipment['componentType']) => {
    switch (type) {
      case 'cpu':
        return <Cpu className="w-4 h-4 text-blue-400" />;
      case 'ram':
        return <Brain className="w-4 h-4 text-purple-400" />;
      case 'storage':
        return <HardDrive className="w-4 h-4 text-green-400" />;
      case 'gpu':
        return <Gpu className="w-4 h-4 text-red-400" />;
      default:
        return null;
    }
  };

  const getEquipmentIcon = (type: Equipment['type'], componentType?: Equipment['componentType']) => {
    switch (type) {
      case 'base':
        return <Server className="w-5 h-5 text-purple-400" />;
      case 'motherboard':
        return <Motherboard className="w-5 h-5 text-yellow-400" />;
      case 'component':
        switch (componentType) {
          case 'cpu':
        return <Cpu className="w-5 h-5 text-blue-400" />;
          case 'ram':
        return <Brain className="w-5 h-5 text-purple-400" />;
          case 'storage':
            return <HardDrive className="w-5 h-5 text-green-400" />;
          case 'gpu':
            return <Gpu className="w-5 h-5 text-red-400" />;
          default:
            return <Code className="w-5 h-5 text-gray-400" />;
        }
    }
  };

  const isOwned = (id: string) => 
    player.inventory.bases?.some(e => e.id === id) ||
    player.inventory.motherboards?.some(e => e.id === id) ||
    player.inventory.components?.some(e => e.id === id) ||
    false;

  const isEquipped = (id: string) =>
    player.loadouts.some(l => 
      l.baseId === id || 
      l.motherboardId === id || 
      Object.values(l.installedComponents).includes(id)
    );

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

  const getStatColor = (value: number) => {
    if (value > 0) return 'text-green-400';
    if (value < 0) return 'text-red-400';
    return 'text-yellow-400';
  };

  const getEffectDescription = (effect: string) => {
    switch (effect) {
      case 'completion_time_boost':
        return 'Completes contracts 15% faster';
      case 'max_contracts_boost':
        return 'Allows running 1 additional contract at a time';
      case 'credit_boost':
        return 'Earn 20% more credits from completed contracts';
      case 'torcoin_chance_boost':
        return '5% extra chance to earn Torcoins from contracts';
      case 'exp_boost':
        return 'Earn 10% more XP from completed contracts';
      case 'hard_contract_boost':
        return 'Double chance to get hard (high-paying) contracts when refreshing';
      case 'easy_contracts':
        return 'All contracts will be easy difficulty but reward 50% credits';
      case 'multi_boost':
        return 'Complete contracts 15% faster, earn 20% more credits, and 5% higher Torcoin chance';
      case 'dual_contract':
        return 'Allows running 2 additional contracts at a time';
      case 'master_of_all':
        return 'Earn 10% more XP, 20% more credits, double chance for hard contracts';
      case 'dual_boost':
        return 'Earn 30% more credits and 20% more XP from contracts';
      case 'advanced_torcoin_boost':
        return '10% chance to earn Torcoins from completed contracts';
      case 'advanced_completion_boost':
        return 'Completes contracts 25% faster';
      case 'wraithcoin_chance_boost':
        return '1% chance to earn the ultra-rare WraithCoin from contracts';
      default:
        return 'Unknown effect';
    }
  };

  const handleCreateLoadout = () => {
    if (selectedBase && selectedMotherboard) {
      onCreateLoadout(selectedBase, selectedMotherboard);
      setSelectedBase(null);
      setSelectedMotherboard(null);
      setShowCreateLoadoutModal(false);
    }
  };

  const canCreateLoadout = player.loadouts.length < 2;

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('shop')}
          className={`flex items-center gap-2 px-4 py-2 rounded border-2 font-mono ${
            activeTab === 'shop'
              ? 'border-green-500 bg-green-900/30 text-green-400'
              : 'border-green-900/50 text-green-600 hover:border-green-500 hover:text-green-400'
          }`}
        >
          <Store className="w-4 h-4" />
          Shop
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex items-center gap-2 px-4 py-2 rounded border-2 font-mono ${
            activeTab === 'inventory'
              ? 'border-green-500 bg-green-900/30 text-green-400'
              : 'border-green-900/50 text-green-600 hover:border-green-500 hover:text-green-400'
          }`}
        >
          <Package className="w-4 h-4" />
          Inventory & Loadouts
        </button>
      </div>

      {/* Shop Tab */}
      {activeTab === 'shop' && (
        <div className="grid grid-cols-1 gap-8">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-green-400 font-bold font-mono">Black Market Tech Shop</h3>
              
              {/* Equipment Filter */}
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => setEquipmentFilter('all')}
                  className={`px-2 py-1 text-xs rounded font-mono ${
                    equipmentFilter === 'all' 
                      ? 'bg-green-900/30 border border-green-500 text-green-400' 
                      : 'border border-green-900/50 text-green-600 hover:border-green-500'
                  }`}
                >
                  All
                </button>
                <button 
                  onClick={() => setEquipmentFilter('base')}
                  className={`px-2 py-1 text-xs rounded font-mono ${
                    equipmentFilter === 'base' 
                      ? 'bg-green-900/30 border border-green-500 text-green-400' 
                      : 'border border-green-900/50 text-green-600 hover:border-green-500'
                  }`}
                >
                  Bases
                </button>
                <button 
                  onClick={() => setEquipmentFilter('motherboard')}
                  className={`px-2 py-1 text-xs rounded font-mono ${
                    equipmentFilter === 'motherboard' 
                      ? 'bg-green-900/30 border border-green-500 text-green-400' 
                      : 'border border-green-900/50 text-green-600 hover:border-green-500'
                  }`}
                >
                  Motherboards
                </button>
                <button 
                  onClick={() => setEquipmentFilter('component')}
                  className={`px-2 py-1 text-xs rounded font-mono ${
                    equipmentFilter === 'component' 
                      ? 'bg-green-900/30 border border-green-500 text-green-400' 
                      : 'border border-green-900/50 text-green-600 hover:border-green-500'
                  }`}
                >
                  Components
                </button>
              </div>
            </div>
            
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 pb-4">
              {displayedEquipment.map((item) => (
                <div
                  key={item.id}
                  className={`bg-black/50 border-4 ${
                    selectedBase === item.id 
                      ? 'border-purple-500' 
                      : 'border-green-900/50'
                  } rounded-lg p-4 hover:bg-green-900/10 transition-colors backdrop-blur-sm shadow-xl shadow-green-900/30 cursor-pointer`}
                  onClick={() => setSelectedBase(selectedBase === item.id ? null : item.id)}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getEquipmentIcon(item.type, item.componentType)}
                      <h3 className={`font-bold font-mono ${getRarityColor(item.rarity)}`}>{item.name}</h3>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded border ${getRarityColor(item.rarity)} font-mono uppercase`}>
                      {item.rarity}
                    </span>
                  </div>
              
                  <p className="text-green-600 text-sm mb-2 font-mono">
                    {item.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {Object.entries(item.stats).map(([stat, value]) => (
                      <div key={stat} className="flex items-center justify-between">
                        <span className="text-green-400 capitalize">{stat}</span>
                        <span className={`${getStatColor(value)}`}>
                          {value > 0 ? `+${value}` : value}
                        </span>
                      </div>
                    ))}
                  </div>

                  {item.specialEffects.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-purple-400 font-mono text-sm mb-2">Special Effects</h4>
                      <ul className="space-y-2">
                        {item.specialEffects.map((effect, i) => (
                          <li key={i} className="bg-purple-900/20 p-2 rounded border border-purple-900">
                            <div className="text-purple-300 text-sm font-mono font-bold">
                              {effect.name}
                            </div>
                            <div className="text-purple-300 text-xs font-mono mt-1">
                              {effect.description}
                            </div>
                            <div className="text-green-400 text-xs font-mono mt-1">
                              {getEffectDescription(effect.effect)}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

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
                      onClick={(e) => {
                        e.stopPropagation();
                        onPurchase(item.id);
                      }}
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
        </div>
      )}

      {/* Combined Inventory & Loadouts View */}
      {activeTab === 'inventory' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-black/50 border-4 border-green-900/50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-green-400 font-bold font-mono">Your Inventory</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-green-600 font-mono">{player.loadouts.length}/2 Loadouts</span>
                <button
                  onClick={() => setShowCreateLoadoutModal(true)}
                  disabled={!canCreateLoadout}
                  className={`flex items-center gap-2 px-3 py-1 border-2 rounded text-sm transition-colors ${
                    canCreateLoadout
                      ? 'bg-green-900/30 border-green-500 text-green-400 hover:bg-green-900/50'
                      : 'border-gray-500 text-gray-500 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <LayoutList className="w-4 h-4" />
                  Create Loadout
                </button>
              </div>
            </div>
          
          {/* Base Systems */}
          <div className="mb-6">
            <h4 className="text-green-600 font-mono text-sm mb-2">Base Systems ({(player.inventory.bases || []).length})</h4>
            <div className="space-y-2">
              {(player.inventory.bases || []).length > 0 ? (
                (player.inventory.bases || []).map(item => (
                  <div key={item.id} className="bg-black/30 border border-green-900 rounded p-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Server className="w-4 h-4 text-purple-400" />
                        <span className="text-green-400 font-mono text-sm">{item.name}</span>
                      </div>
                      <span className={`text-xs ${getRarityColor(item.rarity)} font-mono`}>
                        {item.rarity.toUpperCase()}
                      </span>
                    </div>
                    {item.specialEffects && item.specialEffects[0] && (
                      <div className="mt-1 text-xs text-purple-300 font-mono">
                        {item.specialEffects[0].name}: {getEffectDescription(item.specialEffects[0].effect)}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-green-600 font-mono text-sm text-center py-2">
                  No base systems in inventory
                </div>
              )}
            </div>
          </div>
          
          {/* Motherboards */}
          <div className="mb-6">
            <h4 className="text-green-600 font-mono text-sm mb-2">Motherboards ({(player.inventory.motherboards || []).length})</h4>
            <div className="space-y-2">
              {(player.inventory.motherboards || []).length > 0 ? (
                (player.inventory.motherboards || []).map(item => (
                  <div key={item.id} className="bg-black/30 border border-green-900 rounded p-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Motherboard className="w-4 h-4 text-yellow-400" />
                        <span className="text-green-400 font-mono text-sm">{item.name}</span>
                      </div>
                      <span className={`text-xs ${getRarityColor(item.rarity)} font-mono`}>
                        {item.rarity.toUpperCase()}
                      </span>
                    </div>
                    {item.specialEffects && item.specialEffects[0] && (
                      <div className="mt-1 text-xs text-purple-300 font-mono">
                        {item.specialEffects[0].name}: {getEffectDescription(item.specialEffects[0].effect)}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-green-600 font-mono text-sm text-center py-2">
                  No motherboards in inventory
                </div>
              )}
            </div>
          </div>
          
          {/* Components */}
          <div>
            <h4 className="text-green-600 font-mono text-sm mb-2">Components ({(player.inventory.components || []).length})</h4>
            <div className="space-y-2">
              {(player.inventory.components || []).length > 0 ? (
                (player.inventory.components || []).map(item => (
                  <div key={item.id} className="bg-black/30 border border-green-900 rounded p-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getComponentIcon(item.componentType)}
                        <span className="text-green-400 font-mono text-sm">{item.name}</span>
                      </div>
                      <span className={`text-xs ${getRarityColor(item.rarity)} font-mono`}>
                        {item.rarity.toUpperCase()}
                      </span>
                    </div>
                    {item.specialEffects && item.specialEffects[0] && (
                      <div className="mt-1 text-xs text-purple-300 font-mono">
                        {item.specialEffects[0].name}: {getEffectDescription(item.specialEffects[0].effect)}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-green-600 font-mono text-sm text-center py-2">
                  No components in inventory
                </div>
              )}
            </div>
          </div>
          </div>
          
          <div>
            <LoadoutManager
              player={player}
              equipment={equipment}
              onActivateLoadout={onEquipLoadout}
              onInstallComponent={onInstallComponent}
              onUninstallComponent={onUninstallComponent}
              onDeleteLoadout={onDeleteLoadout}
            />
          </div>
        </div>
      )}

      {/* Create Loadout Modal */}
      {showCreateLoadoutModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-black/90 border-4 border-green-500 rounded-lg p-6 max-w-lg w-full">
            <h3 className="text-green-400 font-bold font-mono mb-4">Create New Loadout</h3>
            {player.loadouts.length >= 2 ? (
              <div className="text-center mb-6">
                <p className="text-yellow-400 font-mono mb-2">Maximum number of loadouts reached (2)</p>
                <p className="text-green-600 font-mono">Please delete an existing loadout before creating a new one.</p>
              </div>
            ) : (
              <>
                <p className="text-green-600 font-mono mb-4">
                  Select one base system and one motherboard to create a new loadout. You can add up to 3 components after creating the loadout.
                </p>
                
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="text-green-400 font-mono text-sm mb-2">Select Base System:</h4>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                      {(player.inventory.bases || []).length > 0 ? (
                        (player.inventory.bases || []).map(base => (
                          <button
                            key={base.id}
                            onClick={() => setSelectedBase(base.id)}
                            className={`w-full flex items-center gap-2 px-3 py-2 rounded text-left ${
                              selectedBase === base.id
                                ? 'bg-green-900/30 border-2 border-green-500 text-green-400'
                                : 'border-2 border-green-900/50 text-green-600 hover:border-green-500 hover:text-green-400'
                            }`}
                          >
                            <Server className="w-4 h-4 text-purple-400 flex-shrink-0" />
                            <span className="font-mono text-sm truncate">{base.name}</span>
                          </button>
                        ))
                      ) : (
                        <div className="text-yellow-400 font-mono text-sm text-center py-4">
                          No base systems available. Purchase from the shop first.
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-green-400 font-mono text-sm mb-2">Select Motherboard:</h4>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                      {(player.inventory.motherboards || []).length > 0 ? (
                        (player.inventory.motherboards || []).map(mb => (
                          <button
                            key={mb.id}
                            onClick={() => setSelectedMotherboard(mb.id)}
                            className={`w-full flex items-center gap-2 px-3 py-2 rounded text-left ${
                              selectedMotherboard === mb.id
                                ? 'bg-green-900/30 border-2 border-green-500 text-green-400'
                                : 'border-2 border-green-900/50 text-green-600 hover:border-green-500 hover:text-green-400'
                            }`}
                          >
                            <Motherboard className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                            <span className="font-mono text-sm truncate">{mb.name}</span>
                          </button>
                        ))
                      ) : (
                        <div className="text-yellow-400 font-mono text-sm text-center py-4">
                          No motherboards available. Purchase from the shop first.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
            
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowCreateLoadoutModal(false);
                  setSelectedBase(null);
                  setSelectedMotherboard(null);
                }}
                className="px-4 py-2 border-2 border-red-500 rounded text-red-400 font-mono hover:bg-red-900/30"
              >
                Cancel
              </button>
              {player.loadouts.length < 2 && (
                <button
                  onClick={handleCreateLoadout}
                  disabled={!selectedBase || !selectedMotherboard}
                  className={`px-4 py-2 border-2 rounded font-mono ${
                    selectedBase && selectedMotherboard
                      ? 'border-green-500 text-green-400 hover:bg-green-900/30'
                      : 'border-gray-500 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Create Loadout
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {selectedBase && selectedMotherboard && !showCreateLoadoutModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-black/90 border-4 border-green-500 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-green-400 font-bold font-mono mb-4">Create New Loadout</h3>
            {player.loadouts.length >= 2 ? (
              <div className="text-center mb-6">
                <p className="text-yellow-400 font-mono mb-2">Maximum number of loadouts reached (2)</p>
                <p className="text-green-600 font-mono">Please delete an existing loadout before creating a new one.</p>
              </div>
            ) : (
              <p className="text-green-600 font-mono mb-6">
                Create a new loadout with the selected base system and motherboard?
              </p>
            )}
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setSelectedBase(null);
                  setSelectedMotherboard(null);
                }}
                className="px-4 py-2 border-2 border-red-500 rounded text-red-400 font-mono hover:bg-red-900/30"
              >
                Cancel
              </button>
              {player.loadouts.length < 2 && (
                <button
                  onClick={() => {
                    onCreateLoadout(selectedBase, selectedMotherboard);
                    setSelectedBase(null);
                    setSelectedMotherboard(null);
                  }}
                  className="px-4 py-2 border-2 border-green-500 rounded text-green-400 font-mono hover:bg-green-900/30"
                >
                  Create Loadout
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};