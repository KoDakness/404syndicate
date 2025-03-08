import React from 'react';
import { Job } from '../types';
import { Shield, Cpu, Ghost, Mail } from 'lucide-react';
import { playSound } from '../lib/sounds';

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
        return job?.type === 'social' 
          ? <Mail className="w-5 h-5 text-purple-400" />
          : <Ghost className="w-5 h-5 text-red-400" />;
      case 'freelance':
        return <Cpu className="w-5 h-5 text-green-400" />;
      case 'social':
        return <Mail className="w-5 h-5 text-purple-400" />;
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
    <div className="bg-black/50 border-2 sm:border-4 border-green-900/50 rounded-lg p-4 sm:p-6 hover:bg-green-900/10 transition-colors backdrop-blur-sm shadow-xl shadow-green-900/30">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {job?.faction && getFactionIcon(job.faction)}
          <h3 className="text-green-400 font-bold font-mono text-sm sm:text-lg truncate flex-1">{job.name}</h3>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded border ${getDifficultyColor(job.difficulty)} font-mono`}>
          {job?.difficulty?.toUpperCase() || 'UNKNOWN'}
        </span>
      </div>
      <p className="text-green-600 text-xs sm:text-base mb-4 sm:mb-6 font-mono min-h-[3rem] line-clamp-2">{job.description}</p>
      <div className="flex items-center justify-between">
        <div className="text-green-400 font-mono text-base sm:text-lg">
          ${(job?.reward || 0).toLocaleString()}
        </div>
        <div className="flex items-center gap-2">
          {job.status === 'in-progress' && (
            <div className="flex items-center gap-2">
              <div className="relative w-24 h-2 bg-black/50 rounded overflow-hidden border border-green-900">
                <div 
                  className="absolute inset-y-0 left-0 bg-yellow-400 transition-all duration-100"
                  style={{ width: `${job?.progress || 0}%` }}
                />
              </div>
              <span className="text-base font-mono text-yellow-400 font-bold min-w-[3ch]">
                {job?.progress || 0}%
              </span>
              <div className="text-sm font-mono text-green-600">
                {job?.startTime && (
                  `${Math.ceil((job.duration - (Date.now() - job.startTime)) / 1000)}s`
                )}
              </div>
            </div>
          )}
          <button
            onClick={() => {
              playSound('click');
              onAccept(job);
            }}
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