import React, { useEffect, useState } from 'react';
import { Job } from '../types';
import { Shield, Cpu, Ghost, Mail, Brain, Lock, AlertCircle } from 'lucide-react';
import { playSound } from '../lib/sounds';

interface JobCardProps {
  job: Job;
  onAccept: (job: Job, forcedAccept?: boolean) => void;
  disabled: boolean;
  playerSkills?: {
    decryption: number;
    firewall: number;
    spoofing: number;
    social: number;
  };
}

export const JobCard: React.FC<JobCardProps> = ({ job, onAccept, disabled, playerSkills }) => {
  // For real-time timer updates
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [progress, setProgress] = useState<number>(job.progress || 0);

  // Update timer and progress in real-time
  useEffect(() => {
    if (job.status !== 'in-progress' || !job.startTime) return;
    
    const updateTimer = () => {
      const elapsed = Date.now() - job.startTime!;
      const remaining = Math.max(0, job.duration - elapsed);
      setTimeLeft(remaining);
      
      // Also update progress display
      const newProgress = Math.min(100, Math.floor((elapsed / job.duration) * 100));
      setProgress(newProgress);
    };
    
    // Initial update
    updateTimer();
    
    // Set up interval for updates
    const timer = setInterval(updateTimer, 500); // Update twice per second
    
    return () => clearInterval(timer);
  }, [job.status, job.startTime, job.duration]);

  // Update progress when job.progress changes
  useEffect(() => {
    setProgress(job.progress || 0);
  }, [job.progress]);

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

  // Check if player meets all skill requirements
  const meetsRequirements = !playerSkills || !job.skillRequirements 
    ? true 
    : Object.entries(job.skillRequirements).every(
        ([skill, level]) => playerSkills[skill as keyof typeof playerSkills] >= level
      );

  const getSkillIcon = (skill: string) => {
    switch (skill) {
      case 'decryption':
        return <Brain className="w-4 h-4 text-purple-400" />;
      case 'firewall':
        return <Shield className="w-4 h-4 text-red-400" />;
      case 'spoofing':
        return <Cpu className="w-4 h-4 text-blue-400" />;
      case 'social':
        return <Mail className="w-4 h-4 text-green-400" />;
      default:
        return null;
    }
  };

  const formatTime = (milliseconds: number): string => {
    const seconds = Math.ceil(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
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
      <p className="text-green-600 text-xs sm:text-base mb-2 sm:mb-4 font-mono min-h-[3rem] line-clamp-2">{job.description}</p>
      
      {/* Skills Requirements Section */}
      {job.skillRequirements && Object.keys(job.skillRequirements).length > 0 && (
        <div className="mb-2 sm:mb-4 bg-black/30 p-2 rounded border border-green-900">
          <div className="text-green-600 text-xs font-mono mb-1">Required Skills:</div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            {Object.entries(job.skillRequirements).map(([skill, level]) => {
              const playerLevel = playerSkills ? playerSkills[skill as keyof typeof playerSkills] : 0;
              const meetsSkill = playerLevel >= level;
              
              return (
                <div 
                  key={skill} 
                  className={`flex items-center justify-between ${meetsSkill ? 'text-green-400' : 'text-red-400'}`}
                >
                  <div className="flex items-center gap-1">
                    {getSkillIcon(skill)}
                    <span className="font-mono text-xs capitalize">{skill}</span>
                  </div>
                  <div className="font-mono text-xs">
                    {playerSkills ? `${playerLevel}/` : ''}{level}
                    {!meetsSkill && <Lock className="inline ml-1 w-3 h-3" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <div className="text-green-400 font-mono text-base sm:text-lg">
            ${(job?.reward || 0).toLocaleString()}
          </div>
          {!meetsRequirements && (
            <div className="text-yellow-400 font-mono text-xs">
              -50% if forced
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {job.status === 'in-progress' && (
            <div className="flex items-center gap-2">
              <div className="relative w-24 h-2 bg-black/50 rounded overflow-hidden border border-green-900">
                <div 
                  className="absolute inset-y-0 left-0 bg-yellow-400 transition-all duration-100"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-base font-mono text-yellow-400 font-bold min-w-[3ch]">
                {progress}%
              </span>
              <div className="text-sm font-mono text-green-600">
                {timeLeft > 0 && formatTime(timeLeft)}
              </div>
            </div>
          )}
          {job.status !== 'in-progress' && !meetsRequirements ? (
            <div className="flex flex-col gap-1">
              <button
                onClick={() => {
                  playSound('click');
                  onAccept(job);
                }}
                disabled={disabled}
                className={`px-3 py-1 rounded border-2 border-red-500 bg-black/50 text-red-400 text-xs font-mono
                  ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-900/30'}`}
              >
                Requirements Not Met
              </button>
              <button
                onClick={() => {
                  playSound('click');
                  onAccept(job, true);
                }}
                disabled={disabled}
                className={`px-3 py-1 rounded border-2 border-yellow-500 bg-black/50 text-yellow-400 text-xs font-mono
                  ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-yellow-900/30'}`}
              >
                Force Accept (-50%)
              </button>
            </div>
          ) : job.status !== 'in-progress' && (
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
          )}
        </div>
      </div>
    </div>
  );
};