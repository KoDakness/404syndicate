import React, { useState, useEffect } from 'react';
import { Player, Equipment, EquipmentLoadout } from '../types';
import { Server, Clapperboard as Motherboard, Cpu, Brain, HardDrive, Cpu as Gpu, Power, AlertCircle, Skull } from 'lucide-react';

interface LoadoutManagerProps {
  player: Player;
  equipment: Equipment[];
  onActivateLoadout: (loadoutId: string) => void;
  onInstallComponent: (loadoutId: string, slot: string, componentId: string) => void;
  onUninstallComponent: (loadoutId: string, slot: string) => void;
  onDeleteLoadout: (loadoutId: string) => void;
}

export const LoadoutManager: React.FC<LoadoutManagerProps> = ({
  player,
  equipment,
  onActivateLoadout,
  onInstallComponent,
  onUninstallComponent,
  onDeleteLoadout,
}) => {
  const [selectedLoadout, setSelectedLoadout] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [showComponentModal, setShowComponentModal] = useState<boolean>(false);
  const [equipmentCache, setEquipmentCache] = useState<Record<string, Equipment>>({});

  // Build a complete equipment cache on load and when equipment/inventory changes
  useEffect(() => {
    const cache: Record<string, Equipment> = {};
    
    // Add all available equipment to cache
    equipment.forEach(item => {
      cache[item.id] = item;
    });
    
    // Add player inventory items to cache
    player.inventory.bases.forEach(item => {
      cache[item.id] = item;
    });
    
    player.inventory.motherboards.forEach(item => {
      cache[item.id] = item;
    });
    
    player.inventory.components.forEach(item => {
      cache[item.id] = item;
    });
    
    setEquipmentCache(cache);
  }, [equipment, player.inventory]);

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

  const getEquipment = (id: string): Equipment | undefined => {
    // First check cache
    if (equipmentCache[id]) return equipmentCache[id];
    
    // Then check inventory
    const base = player.inventory.bases.find(b => b.id === id);
    if (base) return base;
    
    const motherboard = player.inventory.motherboards.find(m => m.id === id);
    if (motherboard) return motherboard;
    
    const component = player.inventory.components.find(c => c.id === id);
    if (component) return component;
    
    // Finally check available equipment
    return equipment.find(e => e.id === id);
  };

  const calculateLoadoutStats = (loadout: EquipmentLoadout) => {
    const base = getEquipment(loadout.baseId);
    const motherboard = getEquipment(loadout.motherboardId);
    
    // Start with base stats if available
    const stats = base?.stats ? { ...base.stats } : {};
    
    // Add motherboard stats
    if (motherboard?.stats) {
      Object.entries(motherboard.stats).forEach(([stat, value]) => {
        stats[stat] = (stats[stat] || 0) + value;
      });
    }
    
    // Add component stats
    Object.values(loadout.installedComponents).forEach(componentId => {
      const component = getEquipment(componentId);
      if (component?.stats) {
        Object.entries(component.stats).forEach(([stat, value]) => {
          stats[stat] = (stats[stat] || 0) + value;
        });
      }
    });
    
    return stats;
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

  const getStatColor = (value: number) => {
    if (value > 0) return 'text-green-400';
    if (value < 0) return 'text-red-400';
    return 'text-yellow-400';
  };

  const getAllSpecialEffects = (loadout: EquipmentLoadout) => {
    const effects: { name: string; description: string; effect: string }[] = [];
    
    // Get base effects
    const base = getEquipment(loadout.baseId);
    if (base?.specialEffects) {
      effects.push(...base.specialEffects);
    }
    
    // Get motherboard effects
    const motherboard = getEquipment(loadout.motherboardId);
    if (motherboard?.specialEffects) {
      effects.push(...motherboard.specialEffects);
    }
    
    // Get component effects
    Object.values(loadout.installedComponents).forEach(componentId => {
      const component = getEquipment(componentId);
      if (component?.specialEffects) {
        effects.push(...component.specialEffects);
      }
    });
    
    return effects;
  };

  const handleInstallComponent = (componentId: string) => {
    if (selectedLoadout && selectedSlot) {
      onInstallComponent(selectedLoadout, selectedSlot, componentId);
      setSelectedSlot(null);
      setShowComponentModal(false);
    }
  };

  const getAvailableComponents = () => {
    if (!selectedLoadout) return [];
    
    // Get all component IDs currently installed in any loadout
    const installedComponentIds = player.loadouts.flatMap(loadout => 
      Object.values(loadout.installedComponents)
    );
    
    // Return components that are not already installed in any loadout
    return player.inventory.components.filter(component => 
      !installedComponentIds.includes(component.id)
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-green-400 font-bold font-mono">Equipment Loadouts</h3>
        <span className="text-sm text-green-600 font-mono">
          {player.loadouts.length}/2 Loadouts
        </span>
      </div>
      
      {player.loadouts.length === 0 ? (
        <div className="bg-black/50 border-4 border-green-900/50 rounded-lg p-6 text-center">
          <p className="text-green-600 font-mono">You have no loadouts. Create one from your inventory.</p>
        </div>
      ) : (
        <div className="grid gap-6 max-h-[600px] overflow-y-auto pr-2 scrollbar-hide">
          {player.loadouts.map(loadout => {
            const base = getEquipment(loadout.baseId);
            const motherboard = getEquipment(loadout.motherboardId);
            const stats = calculateLoadoutStats(loadout);
            const specialEffects = getAllSpecialEffects(loadout);
            
            return (
              <div 
                key={loadout.id}
                className={`bg-black/50 border-4 ${
                  loadout.active 
                    ? 'border-green-500' 
                    : 'border-green-900/50'
                } rounded-lg p-6`}
              >
                <div className="flex items-start justify-between mb-6">
                  <div>
                    {(!base || !motherboard) ? (
                      <div className="flex items-center gap-2 mb-4 bg-yellow-900/20 p-3 rounded border border-yellow-500">
                        <AlertCircle className="w-5 h-5 text-yellow-400" />
                        <p className="text-yellow-400 font-mono text-sm">
                          Equipment data not found. Try refreshing the page.
                        </p>
                      </div>
                    ) : null}
                  
                    <div className="flex items-center gap-2 mb-2">
                      <Server className="w-5 h-5 text-purple-400" />
                      <h4 className="text-purple-400 font-bold font-mono">
                        {base?.name || 'Unknown Base'}
                      </h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <Motherboard className="w-5 h-5 text-yellow-400" />
                      <h5 className="text-yellow-400 font-mono">
                        {motherboard?.name || 'Unknown Motherboard'}
                      </h5>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {!loadout.active && (
                      <button
                        onClick={() => onActivateLoadout(loadout.id)}
                        className="px-3 py-1 border-2 border-green-500 rounded text-green-400 font-mono text-sm hover:bg-green-900/30"
                      >
                        <Power className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => onDeleteLoadout(loadout.id)}
                      className="px-3 py-1 border-2 border-red-500 rounded text-red-400 font-mono text-sm hover:bg-red-900/30"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Loadout Stats */}
                {stats && Object.keys(stats).length > 0 && (
                  <div className="mb-6">
                    <h5 className="text-green-400 font-mono mb-2">Stat Bonuses</h5>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(stats).map(([stat, value]) => (
                        <div key={stat} className="flex items-center justify-between">
                          <span className="text-green-600 font-mono capitalize">{stat}</span>
                          <span className={`${getStatColor(value)} font-mono`}>
                            {value > 0 ? `+${value}` : value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Special Effects */}
                {specialEffects.length > 0 && (
                  <div className="mb-6">
                    <h5 className="text-purple-400 font-mono mb-2">Special Effects</h5>
                    <div className="space-y-2">
                      {specialEffects.map((effect, index) => (
                        <div key={index} className="bg-purple-900/20 p-2 rounded border border-purple-900">
                          <div className="flex justify-between">
                            <span className="text-purple-300 font-mono text-sm">{effect.name}</span>
                          </div>
                          <div className="text-green-400 text-xs font-mono mt-1">
                            {getEffectDescription(effect.effect)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <h5 className="text-green-400 font-mono">Installed Components</h5>
                  <div className="grid grid-cols-2 gap-4">
                    {motherboard && Array.from({ length: motherboard.slotCount || 4 }).map((_, i) => {
                      const slot = `slot${i + 1}`;
                      const componentId = loadout.installedComponents[slot];
                      const component = componentId ? getEquipment(componentId) : null;

                      return (
                        <div
                          key={slot}
                          className="bg-black/50 border-2 border-green-900/50 rounded p-3"
                        >
                          {component ? (
                            <div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  {component.componentType && getComponentIcon(component.componentType)}
                                  <span className="text-green-400 font-mono text-sm">
                                    {component.name || 'Unknown Component'}
                                  </span>
                                </div>
                                <button
                                  onClick={() => onUninstallComponent(loadout.id, slot)}
                                  className="text-red-400 hover:text-red-300 text-xs"
                                >
                                  Remove
                                </button>
                              </div>
                              {component.specialEffects && component.specialEffects[0] && (
                                <div className="mt-1 text-xs text-purple-300 font-mono">
                                  {component.specialEffects[0].name}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center justify-between">
                              <span className="text-green-600 font-mono text-sm">Empty Slot</span>
                              <button
                                onClick={() => {
                                  setSelectedLoadout(loadout.id);
                                  setSelectedSlot(slot);
                                  setShowComponentModal(true);
                                }}
                                className="text-green-400 hover:text-green-300"
                              >
                                Install
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {loadout.active && (
                  <div className="mt-4 bg-green-900/20 p-2 rounded border border-green-500">
                    <p className="text-green-400 font-mono text-sm text-center">
                      This loadout is currently active
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Component selection modal */}
      {showComponentModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-black/90 border-4 border-green-500 rounded-lg p-6 max-w-lg w-full">
            <h3 className="text-green-400 font-bold font-mono mb-4">Install Component</h3>
            <p className="text-green-600 font-mono mb-4">
              Select a component to install in this slot:
            </p>
            
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 mb-6 scrollbar-hide">
              {getAvailableComponents().length > 0 ? (
                getAvailableComponents().map(component => (
                  <button
                    key={component.id}
                    onClick={() => handleInstallComponent(component.id)}
                    className="w-full flex flex-col bg-black/30 border border-green-900 rounded p-3 hover:bg-green-900/20 hover:border-green-500 transition-colors text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getComponentIcon(component.componentType)}
                        <span className="text-green-400 font-mono text-sm">{component.name}</span>
                      </div>
                      <span className="text-green-600 font-mono text-xs capitalize">{component.componentType}</span>
                    </div>
                    
                    {component.specialEffects && component.specialEffects[0] && (
                      <div className="mt-2 text-xs">
                        <span className="text-purple-300 font-mono">{component.specialEffects[0].name}:</span> 
                        <span className="text-green-400 font-mono ml-1">{getEffectDescription(component.specialEffects[0].effect)}</span>
                      </div>
                    )}
                    
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {Object.entries(component.stats).map(([stat, value]) => (
                        <div key={stat} className="flex items-center justify-between">
                          <span className="text-green-600 font-mono text-xs capitalize">{stat}</span>
                          <span className={`${getStatColor(value)} font-mono text-xs`}>
                            {value > 0 ? `+${value}` : value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </button>
                ))
              ) : (
                <p className="text-yellow-400 font-mono text-center py-4">
                  No available components to install. Purchase components or uninstall from other loadouts.
                </p>
              )}
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setSelectedSlot(null);
                  setShowComponentModal(false);
                }}
                className="px-4 py-2 border-2 border-red-500 rounded text-red-400 font-mono hover:bg-red-900/30"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};