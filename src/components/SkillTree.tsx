import React from 'react';
import { Lock, Unlock, Mail } from 'lucide-react';
import type { Player } from '../types';

interface SkillTreeProps {
  player: Player;
  onUpgradeSkill: (skill: keyof Player['skills']) => void;
}

export const SkillTree: React.FC<SkillTreeProps> = ({ player, onUpgradeSkill }) => {
  const skills = [
    {
      id: 'decryption',
      name: 'Decryption',
      description: 'Break through encrypted systems and data',
      level: player.skills.decryption,
      maxLevel: 99,
    },
    {
      id: 'firewall',
      name: 'Firewall',
      description: 'Defend against intrusion detection systems',
      level: player.skills.firewall,
      maxLevel: 99,
    },
    {
      id: 'spoofing',
      name: 'Spoofing',
      description: 'Mask your digital footprint',
      level: player.skills.spoofing,
      maxLevel: 99,
    },
    {
      id: 'social',
      name: 'Social Engineering',
      description: 'Manipulate people through deception and psychology',
      level: player.skills.social,
      maxLevel: 99,
    },
  ];

  return (
    <div className="grid gap-8">
      <div className="text-center mb-4">
        <span className="text-green-400 font-mono">
          Available Skill Points: {player.skills.skillPoints}
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {skills.map((skill) => (
          <div
            key={skill.id}
            className="bg-black/50 border-4 border-green-900/50 rounded-lg p-4 relative"
          >
            <h3 className="text-green-400 font-bold font-mono mb-2">{skill.name}</h3>
            <p className="text-green-600 text-sm mb-4 font-mono">{skill.description}</p>
            
            <div className="flex items-center justify-between mb-2">
              <div className="flex-1 bg-green-900/30 h-2 rounded-full mr-4">
                <div
                  className="bg-green-400 h-full rounded-full"
                  style={{ width: `${(skill.level / skill.maxLevel) * 100}%` }}
                />
              </div>
              <span className="text-green-400 font-mono min-w-[4rem] text-right">
                {skill.level}/{skill.maxLevel}
              </span>
            </div>

            <button
              onClick={() => onUpgradeSkill(skill.id as keyof Player['skills'])}
              disabled={player.skills.skillPoints === 0 || skill.level >= skill.maxLevel}
              className={`w-full px-4 py-2 rounded border-2 flex items-center justify-center gap-2
                ${player.skills.skillPoints > 0 && skill.level < skill.maxLevel
                  ? 'border-green-400 hover:bg-green-900/30'
                  : 'border-green-900/50 opacity-50 cursor-not-allowed'}`}
            >
              {skill.level >= skill.maxLevel ? (
                <>
                  <Lock className="w-4 h-4" />
                  <span className="font-mono">Maxed</span>
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4" />
                  <span className="font-mono">Upgrade</span>
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};