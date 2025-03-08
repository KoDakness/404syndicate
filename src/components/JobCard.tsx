import React from 'react';
import { Job } from '../types';
import { Shield, Cpu, Ghost } from 'lucide-react';

interface JobCardProps {
  job: Job;
  onAccept: (job: Job) => void;
  disabled: boolean;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onAccept, disabled }) => {
  const getFactionIcon = (faction: Job['faction']) => {
    switch (faction) {
      case 'corporate':
        return <Shield className="w-5 h-5 text-blue-400" />;
      case 'underground':
        return <Ghost className="w-5 h-5 text-red-400" />;
      case 'freelance':
        return <Cpu className="w-5 h-5 text-green-400" />;
    }
  };

  const getDifficultyColor = (difficulty: Job['difficulty']) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-900/50 text-green-400 border-green-500';
      case 'medium':
        return 'bg-yellow-900/50 text-yellow-400 border-yellow-500';
      case 'hard':
        return 'bg-red-900/50 text-red-400 border-red-500';
    }
  };

  return (
    <div className="bg-black/50 border-2 sm:border-4 border-green-900/50 rounded-lg p-3 sm:p-4 hover:bg-green-900/10 transition-colors backdrop-blur-sm shadow-xl shadow-green-900/30">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {getFactionIcon(job.faction)}
          <h3 className="text-green-400 font-bold font-mono text-sm sm:text-base">{job.name}</h3>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded border ${getDifficultyColor(job.difficulty)} font-mono`}>
          {job.difficulty.toUpperCase()}
        </span>
      </div>
      <p className="text-green-600 text-xs sm:text-sm mb-3 sm:mb-4 font-mono">{job.description}</p>
      <div className="flex items-center justify-between">
        <div className="text-green-400 font-mono text-sm sm:text-base">
          ${job.reward.toLocaleString()}
        </div>
        <div className="flex items-center gap-2">
          {job.status === 'in-progress' && (
            <div className="text-xs font-mono text-yellow-400">{job.progress}%</div>
          )}
          <button
            onClick={() => onAccept(job)}
            disabled={disabled}
            className={`px-3 py-1 rounded border-2 border-green-500 bg-black/50 text-green-400 text-xs font-mono
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-900/30'}`}
          >
            {job.status === 'completed' ? 'Completed' : 'Accept'}
          </button>
        </div>
      </div>
    </div>
  );
};