import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, MessageSquare, Terminal, Briefcase, Store, Brain, Eye, Volume2, GitBranch, Award } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { playSound } from '../lib/sounds';
import type { Player } from '../types';

interface TutorialProps {
  player: Player;
  onComplete: () => void;
  onUpdatePlayer: (updates: Partial<Player>) => void;
  isAdmin?: boolean;
  onOpenPanel?: (panel: string | null) => void;
}

interface TutorialStep {
  title: string;
  content: string;
  highlight: string;
  panel?: string;
  icon: React.ReactNode;
}

const tutorialSteps: TutorialStep[] = [
  {
    title: 'Welcome to 404 Syndicate!',
    content: 'Welcome to the world of digital espionage, hacker. You\'ve just joined the elite 404 Syndicate network. I\'ll be your guide through this digital underworld.',
    highlight: '.player-stats',
    icon: <GitBranch className="w-5 h-5 text-green-400" />
  },
  {
    title: 'Your Hacker Profile',
    content: 'This panel shows your current level, reputation, credits, and special currencies. As you complete contracts, you\'ll gain experience and resources.',
    highlight: '.player-stats',
    icon: <Award className="w-5 h-5 text-green-400" />
  },
  {
    title: 'The Terminal',
    content: 'The terminal displays your mission progress and important system messages. Keep an eye on it for vital information during your operations.',
    highlight: '.terminal-panel',
    icon: <Terminal className="w-5 h-5 text-green-400" />
  },
  {
    title: 'Global Network',
    content: 'Connect with other hackers through the encrypted Global Network. Share information and see when others find valuable resources.',
    highlight: '.chat-panel',
    icon: <MessageSquare className="w-5 h-5 text-green-400" />
  },
  {
    title: 'Available Contracts',
    content: 'These are your hacking contracts. Each has different difficulty levels, requirements, and rewards. You can run up to 3 contracts simultaneously.',
    highlight: '.contracts-panel',
    icon: <Briefcase className="w-5 h-5 text-green-400" />
  },
  {
    title: 'Equipment Shop',
    content: 'Upgrade your hacking capabilities with advanced equipment. Better gear unlocks more powerful abilities and increases your success rate.',
    highlight: '[data-panel="equipment"]',
    panel: 'equipment',
    icon: <Store className="w-5 h-5 text-green-400" />
  },
  {
    title: 'Skills Development',
    content: 'Level up your hacking skills to take on more challenging and rewarding contracts. Each skill point enhances different aspects of your operations.',
    highlight: '[data-panel="skills"]',
    panel: 'skills',
    icon: <Brain className="w-5 h-5 text-green-400" />
  },
  {
    title: 'Special Events',
    content: 'High-risk, high-reward events appear periodically. These unique challenges test your skills but offer exclusive rewards you can\'t get elsewhere.',
    highlight: '[data-panel="events"]',
    panel: 'events',
    icon: <Eye className="w-5 h-5 text-green-400" />
  },
  {
    title: 'Settings & Preferences',
    content: 'Customize your experience through the Settings panel. Adjust sounds, music, and visual preferences to enhance your hacking operations.',
    highlight: '[data-panel="settings"]',
    panel: 'settings',
    icon: <Volume2 className="w-5 h-5 text-green-400" />
  },
  {
    title: 'Ready to Hack',
    content: 'You\'re all set! Start with beginner contracts to build your reputation and credits. As you level up, more advanced opportunities will emerge. Good luck, hacker.',
    highlight: '.contracts-panel',
    icon: <GitBranch className="w-5 h-5 text-green-400" />
  }
];

export const Tutorial: React.FC<TutorialProps> = ({ 
  player, 
  onComplete, 
  onUpdatePlayer, 
  isAdmin,
  onOpenPanel 
}) => {
  const [currentStep, setCurrentStep] = useState(player.tutorial_step || 0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Highlight current element
    const element = document.querySelector(tutorialSteps[currentStep].highlight);
    
    if (element) {
      // Add highlight to element
      element.classList.add('relative', 'z-[46]');
      element.style.boxShadow = '0 0 0 2px rgba(74, 222, 128, 0.8), 0 0 30px rgba(74, 222, 128, 0.4)';
      element.style.transition = 'all 300ms ease-in-out';
      
      // Scroll into view with offset for toolbar
      const rect = element.getBoundingClientRect();
      const toolbarHeight = 200; // Approximate height of toolbar when expanded
      const offset = window.innerHeight - toolbarHeight;
      
      window.scrollTo({
        top: rect.top + window.scrollY - offset/2,
        behavior: 'smooth'
      });
      
      // Open panel if specified
      if (tutorialSteps[currentStep].panel) {
        onOpenPanel?.(tutorialSteps[currentStep].panel);
      }
      
      return () => {
        element.classList.remove('relative', 'z-[46]');
        element.style.boxShadow = '';
      };
    }
  }, [currentStep, onOpenPanel]);

  const handleNext = async () => {
    if (currentStep < tutorialSteps.length - 1) {
      const nextStep = currentStep + 1;
      playSound('click');
      setCurrentStep(nextStep);
      
      // Update database
      if (!isAdmin) {
        await supabase
          .from('players')
          .update({ tutorial_step: nextStep })
          .eq('id', player.id);
      }
      
      onUpdatePlayer({ tutorial_step: nextStep });
    } else {
      // Complete tutorial
      setIsVisible(false);
      playSound('complete');
      
      if (!isAdmin) {
        await supabase
          .from('players')
          .update({ 
            tutorial_completed: true,
            tutorial_step: tutorialSteps.length 
          })
          .eq('id', player.id);
      }
      
      onUpdatePlayer({ 
        tutorial_completed: true,
        tutorial_step: tutorialSteps.length 
      });
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      playSound('click');
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = async () => {
    setIsVisible(false);
    playSound('click');
    
    if (!isAdmin) {
      await supabase
        .from('players')
        .update({ 
          tutorial_completed: true,
          tutorial_step: tutorialSteps.length 
        })
        .eq('id', player.id);
    }
    
    onUpdatePlayer({ 
      tutorial_completed: true,
      tutorial_step: tutorialSteps.length 
    });
    onComplete();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-32 left-1/2 -translate-x-1/2 z-[60] w-full max-w-lg">
      <div className="bg-black/95 border-2 border-green-500 rounded-lg p-6 mx-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {tutorialSteps[currentStep].icon}
            <h3 className="text-green-400 font-mono text-lg">
              {tutorialSteps[currentStep].title}
            </h3>
          </div>
          <button
            onClick={handleSkip}
            className="text-green-600 hover:text-green-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <p className="text-green-400 font-mono mb-6">
          {tutorialSteps[currentStep].content}
        </p>
        
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className={`flex items-center gap-1 px-3 py-1 rounded border font-mono
              ${currentStep === 0
                ? 'border-green-900 text-green-900 cursor-not-allowed'
                : 'border-green-500 text-green-400 hover:bg-green-900/30'
              }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
          
          <div className="flex items-center gap-1 text-green-600 font-mono">
            {currentStep + 1} / {tutorialSteps.length}
          </div>
          
          <button
            onClick={handleNext}
            className="flex items-center gap-1 px-3 py-1 rounded border border-green-500 text-green-400 font-mono hover:bg-green-900/30"
          >
            {currentStep === tutorialSteps.length - 1 ? 'Complete' : 'Next'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};