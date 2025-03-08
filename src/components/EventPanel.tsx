import React, { useState, useEffect } from 'react';
import { AlertCircle, Timer, Lock, Unlock, RefreshCw } from 'lucide-react';
import type { RandomEvent } from '../types';

interface EventPanelProps {
  onComplete?: (success: boolean) => void;
  isAdmin?: boolean;
  onReset?: () => void;
}

const SYMBOLS = ['@', '#', '%', '&', '*', '$'];

const IcebreakerEvent: RandomEvent = {
  id: 'icebreaker_001',
  type: 'challenge',
  name: 'ICEBREAKER CHALLENGE 🔥',
  description: 'Break into an abandoned corporate black-site server protected by ICE.',
  status: 'active',
  duration: 300000, // 5 minutes
  puzzle: {
    type: 'sequence',
    data: {
      sequence: Array.from({ length: 6 }, () => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]),
      ips: [
        '192.168.42.42',
        '10.0.13.37',
        '172.16.0.42',
        '192.168.1.1',
        '10.0.0.42',
      ],
      scrambledWord: 'RVEHAC',
    },
    solution: {
      sequence: '',
      ip: '172.16.0.42',
      word: 'ARCHIVE',
    },
    attempts: 0,
    maxAttempts: 5,
    timeLimit: 240000, // 4 minutes
  },
  effects: {
    rewards: {
      software: {
        id: 'ice_breaker_v1',
        name: 'ICEbreaker v1.0',
        type: 'software',
        rarity: 'rare',
        level: 3,
        cost: 250000,
        effects: {
          skill_boost: {
            decryption: 2,
            firewall: 1,
          }
        }
      },
      torcoins: 5,
      reputation: 3,
    }
  }
};

const EventPanel: React.FC<EventPanelProps> = ({ onComplete, isAdmin, onReset }) => {
  const [event] = useState<RandomEvent>(IcebreakerEvent);
  const [currentPhase, setCurrentPhase] = useState<number>(0);
  const [userSequence, setUserSequence] = useState<string>('');
  const [selectedIP, setSelectedIP] = useState<string>('');
  const [userWord, setUserWord] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(event.puzzle?.timeLimit || 0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(() => {
    const stored = localStorage.getItem('icebreaker_lockout');
    return stored ? parseInt(stored) : null;
  });
  const [message, setMessage] = useState<string>('');
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');

  const handleLockout = () => {
    const lockoutTime = Date.now() + (12 * 60 * 60 * 1000); // 12 hours
    setLockedUntil(lockoutTime);
    localStorage.setItem('icebreaker_lockout', lockoutTime.toString());
  };

  const handleReset = () => {
    setLockedUntil(null);
    localStorage.removeItem('icebreaker_lockout');
    onReset?.();
  };

  useEffect(() => {
    if (gameStatus !== 'playing') return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          setGameStatus('lost');
          setMessage("Time's up! The ICE has locked you out.");
          handleLockout();
          onComplete?.(false);
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStatus]);

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  const handleSymbolClick = (symbol: string) => {
    if (userSequence.length < 6) {
      setUserSequence(prev => prev + symbol);
    }
  };

  const checkSequence = () => {
    const correctSequence = event.puzzle?.data.sequence.join('');
    if (userSequence === correctSequence) {
      setCurrentPhase(1);
      setMessage('Sequence accepted! Now select the safe proxy route.');
    } else {
      setUserSequence('');
      setMessage('Incorrect sequence. The pattern resets.');
      event.puzzle!.attempts++;
      if (event.puzzle!.attempts >= event.puzzle!.maxAttempts) {
        setGameStatus('lost');
        handleLockout();
        onComplete?.(false);
      }
    }
  };

  const checkIP = () => {
    if (selectedIP === event.puzzle?.solution.ip) {
      setCurrentPhase(2);
      setMessage('Proxy route established! Final challenge: unscramble the access word.');
    } else {
      setMessage('Invalid proxy route detected!');
      event.puzzle!.attempts++;
      if (event.puzzle!.attempts >= event.puzzle!.maxAttempts) {
        setGameStatus('lost');
        handleLockout();
        onComplete?.(false);
      }
    }
  };

  const checkWord = () => {
    if (userWord.toUpperCase() === event.puzzle?.solution.word) {
      setGameStatus('won');
      setMessage('Access granted! ICE system bypassed successfully.');
      onComplete?.(true);
    } else {
      setMessage('Incorrect access word!');
      event.puzzle!.attempts++;
      if (event.puzzle!.attempts >= event.puzzle!.maxAttempts) {
        setGameStatus('lost');
        handleLockout();
        onComplete?.(false);
      }
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="bg-black/50 border-4 border-red-900/50 rounded-lg p-6">
        <div className="flex items-center justify-between gap-4 mb-4">
          <h3 className="text-red-400 font-bold font-mono text-xl flex items-center gap-2">
            <AlertCircle className="w-6 h-6" />
            {event.name}
          </h3>
          <div className="flex items-center gap-4">
            {isAdmin && lockedUntil && (
              <button
                onClick={handleReset}
                className="px-3 py-1 border-2 border-red-500 rounded hover:bg-red-900/30 text-red-400 font-mono text-sm"
              >
                Reset Lockout
              </button>
            )}
            <div className="flex items-center gap-2 text-yellow-400 font-mono">
            <Timer className="w-5 h-5" />
            {formatTime(timeLeft)}
            </div>
          </div>
        </div>
        
        <p className="text-green-400 font-mono mb-6">{event.description}</p>
        
        {lockedUntil && Date.now() < lockedUntil ? (
          <div className="text-center p-6 rounded-lg border-2 border-red-500">
            <h4 className="text-xl font-bold font-mono mb-4 text-red-400">System Locked</h4>
            <p className="font-mono text-red-400">
              ICE defense system activated. Try again in {Math.ceil((lockedUntil - Date.now()) / (60 * 60 * 1000))} hours.
            </p>
          </div>
        ) : gameStatus === 'playing' && (
          <div className="space-y-8">
            {currentPhase === 0 && (
              <div className="space-y-4">
                <div className="text-green-400 font-mono">
                  Decipher the sequence pattern:
                </div>
                <div className="flex items-center gap-2 mb-4">
                  {event.puzzle?.data.sequence.slice(0, -1).map((symbol, i) => (
                    <div key={i} className="w-10 h-10 flex items-center justify-center border-2 border-green-500 rounded bg-black/50 text-green-400 font-mono">
                      {symbol}
                    </div>
                  ))}
                  <div className="w-10 h-10 flex items-center justify-center border-2 border-yellow-500 rounded bg-black/50 text-yellow-400 font-mono">
                    ?
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex-1 bg-black/50 border-2 border-green-500 rounded h-10 flex items-center px-3 font-mono text-green-400">
                    {userSequence}
                  </div>
                  <button
                    onClick={() => setUserSequence('')}
                    className="px-3 py-2 border-2 border-red-500 rounded hover:bg-red-900/30"
                  >
                    <RefreshCw className="w-5 h-5 text-red-400" />
                  </button>
                </div>
                <div className="grid grid-cols-6 gap-2">
                  {SYMBOLS.map(symbol => (
                    <button
                      key={symbol}
                      onClick={() => handleSymbolClick(symbol)}
                      className="w-full py-2 border-2 border-green-500 rounded hover:bg-green-900/30 text-green-400 font-mono"
                    >
                      {symbol}
                    </button>
                  ))}
                </div>
                <button
                  onClick={checkSequence}
                  disabled={userSequence.length !== 6}
                  className={`w-full py-2 rounded font-mono ${
                    userSequence.length === 6
                      ? 'border-2 border-green-500 hover:bg-green-900/30 text-green-400'
                      : 'border-2 border-gray-500 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Submit Sequence
                </button>
              </div>
            )}
            
            {currentPhase === 1 && (
              <div className="space-y-4">
                <div className="text-green-400 font-mono">
                  Select the secure proxy route:
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {event.puzzle?.data.ips.map(ip => (
                    <button
                      key={ip}
                      onClick={() => setSelectedIP(ip)}
                      className={`w-full py-2 px-4 rounded font-mono ${
                        selectedIP === ip
                          ? 'border-2 border-yellow-500 bg-yellow-900/30 text-yellow-400'
                          : 'border-2 border-green-500 hover:bg-green-900/30 text-green-400'
                      }`}
                    >
                      {ip}
                    </button>
                  ))}
                </div>
                <button
                  onClick={checkIP}
                  disabled={!selectedIP}
                  className={`w-full py-2 rounded font-mono ${
                    selectedIP
                      ? 'border-2 border-green-500 hover:bg-green-900/30 text-green-400'
                      : 'border-2 border-gray-500 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Connect via Proxy
                </button>
              </div>
            )}
            
            {currentPhase === 2 && (
              <div className="space-y-4">
                <div className="text-green-400 font-mono">
                  Unscramble the access word: <span className="text-yellow-400">{event.puzzle?.data.scrambledWord}</span>
                </div>
                <input
                  type="text"
                  value={userWord}
                  onChange={(e) => setUserWord(e.target.value)}
                  maxLength={6}
                  className="w-full bg-black/50 border-2 border-green-500 rounded py-2 px-4 text-green-400 font-mono focus:outline-none focus:border-yellow-500"
                  placeholder="Enter the unscrambled word..."
                />
                <button
                  onClick={checkWord}
                  disabled={!userWord}
                  className={`w-full py-2 rounded font-mono ${
                    userWord
                      ? 'border-2 border-green-500 hover:bg-green-900/30 text-green-400'
                      : 'border-2 border-gray-500 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Submit Access Word
                </button>
              </div>
            )}
          </div>
        )}
        
        {gameStatus !== 'playing' && (
          <div className={`text-center p-6 rounded-lg border-2 ${
            gameStatus === 'won'
              ? 'border-green-500 text-green-400'
              : 'border-red-500 text-red-400'
          }`}>
            <h4 className="text-xl font-bold font-mono mb-4">
              {gameStatus === 'won' ? 'Mission Accomplished' : 'Mission Failed'}
            </h4>
            <p className="font-mono">{message}{gameStatus === 'lost' && !lockedUntil && ' System will be locked for 12 hours.'}</p>
            {gameStatus === 'won' && (
              <div className="mt-6 space-y-2 text-left">
                <div className="text-yellow-400 font-mono">Rewards:</div>
                <div className="space-y-1 font-mono">
                  <div>• ICEbreaker v1.0 Software</div>
                  <div>• 5 Torcoins</div>
                  <div>• +3 Underground Reputation</div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {message && (
          <div className="mt-4 text-yellow-400 font-mono text-sm">
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export { EventPanel }