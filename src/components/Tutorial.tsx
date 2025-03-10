import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';
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
}

const tutorialSteps: TutorialStep[] = [
  {
    title: 'Welcome to 404 Syndicate!',
    content: 'You\'ve just joined an elite network of hackers. Let\'s get you started with the basics.',
    highlight: '.player-stats'
  },
  {
    title: 'Your Stats',
    content: 'This panel shows your current level, credits, and reputation. Watch these grow as you complete contracts!',
    highlight: '.player-stats'
  },
  {
    title: 'Available Contracts',
    content: 'These are your available hacking contracts. Each has different difficulty levels and rewards.',
    highlight: '.contracts-panel'
  },
  {
    title: 'Terminal',
    content: 'The terminal shows your progress and important messages. Keep an eye on it during contracts!',
    highlight: '.terminal-panel'
  },
  {
    title: 'Equipment Shop',
    content: 'Upgrade your hacking capabilities with new equipment. Better gear means better rewards!',
    highlight: '[data-panel="equipment"]',
    panel: 'equipment'
  },
  {
    title: 'Skills',
    content: 'Level up your hacking skills to take on more challenging contracts.',
    highlight: '[data-panel="skills"]',
    panel: 'skills'
  },
  {
    title: 'Events',
    content: 'Special hacking events appear here. They\'re challenging but offer unique rewards!',
    highlight: '[data-panel="events"]',
    panel: 'events'
  },
  {
    title: 'Ready to Hack',
    content: 'You\'re all set! Start with some easy contracts to build up your reputation and credits.',
    highlight: '.contracts-panel'
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
      const rect = element.getBoundingClientRect();
      
      // Add highlight to element
      element.classList.add('relative', 'z-[46]');
      element.style.boxShadow = '0 0 0 2px rgba(74, 222, 128, 0.8), 0 0 30px rgba(74, 222, 128, 0.4)';
      element.style.transition = 'all 300ms ease-in-out';
      
      // Scroll into view with offset for toolbar
      const toolbarHeight = 200; // Approximate height of toolbar when expanded
      const offset = window.innerHeight - toolbarHeight;
      
      window.scrollTo({
        top: rect.top + window.scrollY - offset/2,
        behavior: 'smooth'
      });
      
      // Open panel if specified
      if (tutorialSteps[currentStep].panel) {
        onOpenPanel?.(tutorialSteps[currentStep].panel);
      } else {
        onOpenPanel?.(null);
      }
      
      return () => {
        element.classList.remove('relative', 'z-[46]');
        element.style.boxShadow = '';
      };
    }
  }, [currentStep]);

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
          <h3 className="text-green-400 font-mono text-lg">
            {tutorialSteps[currentStep].title}
          </h3>
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