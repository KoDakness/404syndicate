import React, { useState, useEffect } from 'react';
import { AlertCircle, Timer, Lock, Unlock, RefreshCw, Ghost, Cpu, Shield } from 'lucide-react';
import { availableEvents } from '../data/events';
import { supabase } from '../lib/supabase';
import { playSound } from '../lib/sounds';
import type { RandomEvent } from '../types';

const SYMBOLS = ['@', '#', '%', '&', '*', '$'];

interface EventPanelProps {
  onComplete?: (success: boolean) => void;
  isAdmin?: boolean;
  onReset?: () => void;
  onReward?: (torcoins: number) => void;
}

const GhostEvent = availableEvents[0];
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
      scrambledWord: 'MCIRACE',
    },
    solution: {
      sequence: '',
      ip: '172.16.0.42',
      word: 'ICECREAM',
    },
    attempts: 0,
    maxAttempts: 10,
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

const EventPanel: React.FC<EventPanelProps> = ({ onComplete, isAdmin, onReset, onReward }) => {
  const [events] = useState<RandomEvent[]>([GhostEvent, IcebreakerEvent]);
  const [selectedEvent, setSelectedEvent] = useState<RandomEvent | null>(null);
  const [currentPhase, setCurrentPhase] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(() => {
    const stored = localStorage.getItem('icebreaker_lockout');
    return stored ? parseInt(stored) : null;
  });
  const [ghostLockedUntil, setGhostLockedUntil] = useState<number | null>(() => {
    const stored = localStorage.getItem('ghost_lockout');
    return stored ? parseInt(stored) : null;
  });
  const [message, setMessage] = useState<string>('');
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  
  // Icebreaker game state
  const [userSequence, setUserSequence] = useState<string>('');
  const [selectedIP, setSelectedIP] = useState<string>('');
  const [userWord, setUserWord] = useState<string>('');

  // Game state
  const [selectedCoordinate, setSelectedCoordinate] = useState<string>('');
  const [codeSnippets, setCodeSnippets] = useState<string[]>([]);
  const [selectedRoutes, setSelectedRoutes] = useState<string[]>([]);

  // Log current lockout status on mount for debugging
  useEffect(() => {
    console.log("Current lockout status:");
    console.log("Icebreaker locked until:", lockedUntil ? new Date(lockedUntil).toLocaleString() : "Not locked");
    console.log("Ghost locked until:", ghostLockedUntil ? new Date(ghostLockedUntil).toLocaleString() : "Not locked");
  }, []);

  const handleSymbolClick = (symbol: string) => {
    if (userSequence.length < 6) {
      setUserSequence(prev => prev + symbol);
    }
  };

  const checkSequence = () => {
    const correctSequence = selectedEvent?.puzzle?.data.sequence.join('');
    if (userSequence === correctSequence) {
      setCurrentPhase(1);
      setMessage('Sequence accepted! Now select the safe proxy route.');
    } else {
      setUserSequence('');
      setMessage('Incorrect sequence. The pattern resets.');
      if (selectedEvent?.puzzle) {
        selectedEvent.puzzle.attempts++;
        if (selectedEvent.puzzle.attempts >= selectedEvent.puzzle.maxAttempts) {
          setGameStatus('lost');
          handleLockout();
          onComplete?.(false);
        }
      }
    }
  };

  const checkIP = () => {
    if (selectedEvent?.puzzle?.solution.ip === selectedIP) {
      setCurrentPhase(2);
      setMessage('Proxy route established! Final challenge: unscramble the access word.');
    } else {
      setMessage('Invalid proxy route detected!');
      if (selectedEvent?.puzzle) {
        selectedEvent.puzzle.attempts++;
        if (selectedEvent.puzzle.attempts >= selectedEvent.puzzle.maxAttempts) {
          setGameStatus('lost');
          handleLockout();
          onComplete?.(false);
        }
      }
    }
  };

  const checkWord = () => {
    if (selectedEvent?.puzzle?.solution.word.toUpperCase() === userWord.toUpperCase().trim()) {
      setGameStatus('won');
      setMessage('Access granted! ICE system bypassed successfully.');
      playSound('eventComplete');
      // Award torcoins and complete event
      const torcoins = selectedEvent.effects.rewards?.torcoins || 0;
      onReward?.(torcoins);
      onComplete?.(true);
      // Lock the event for 7 days
      handleLockout();
    } else {
      setMessage('Incorrect access word!');
      if (selectedEvent?.puzzle) {
        selectedEvent.puzzle.attempts++;
        if (selectedEvent.puzzle.attempts >= selectedEvent.puzzle.maxAttempts) {
          setGameStatus('lost');
          handleLockout();
          onComplete?.(false);
        }
      }
    }
  };

  const selectEvent = (event: RandomEvent) => {
    // Double-check if the event is locked before selecting it
    if (event.id === 'icebreaker_001' && lockedUntil && Date.now() < lockedUntil) {
      console.log("Icebreaker event is locked, cannot select.");
      return;
    }
    
    if (event.id === 'ghost_in_machine_001' && ghostLockedUntil && Date.now() < ghostLockedUntil) {
      console.log("Ghost event is locked, cannot select.");
      return;
    }
    
    setSelectedEvent(event);
    setTimeLeft(event.puzzle?.timeLimit || 0);
    if (event.id === 'ghost_in_machine_001') {
      setCodeSnippets([...event.puzzle!.data.codeSnippets]);
    }
    setUserSequence('');
    setSelectedIP('');
    setUserWord('');
    setCurrentPhase(0);
    setGameStatus('playing');
    setMessage('');
    
    console.log(`Selected event: ${event.id}`);
  };

  // Check for weekly lockout
  const handleLockout = () => {
    if (!selectedEvent) return;
    
    // Set lockout for 7 days (in milliseconds)
    const lockoutTime = Date.now() + (7 * 24 * 60 * 60 * 1000);
    
    if (selectedEvent.id === 'icebreaker_001') {
      setLockedUntil(lockoutTime);
      localStorage.setItem('icebreaker_lockout', lockoutTime.toString());
      console.log(`Icebreaker event locked until: ${new Date(lockoutTime).toLocaleString()}`);
    } else if (selectedEvent.id === 'ghost_in_machine_001') {
      setGhostLockedUntil(lockoutTime);
      localStorage.setItem('ghost_lockout', lockoutTime.toString());
      console.log(`Ghost event locked until: ${new Date(lockoutTime).toLocaleString()}`);
    }
  };

  const handleReset = () => {
    if (isAdmin) {
      console.log("Admin reset: Clearing all lockouts");
      setLockedUntil(null);
      setGhostLockedUntil(null);
      localStorage.removeItem('icebreaker_lockout');
      localStorage.removeItem('ghost_lockout');
      setSelectedEvent(null);
      setCurrentPhase(0);
      setMessage('');
      setGameStatus('playing');
      setSelectedCoordinate('');
      setSelectedRoutes([]);
      onReset?.();
    }
  };

  // Admin reset handler
  useEffect(() => {
    if (isAdmin) {
      console.log("Admin mode detected, providing reset capability");
    }
  }, [isAdmin]);

  // Timer effect for event countdown
  useEffect(() => {
    if (gameStatus !== 'playing' || !selectedEvent) return;
    
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
  }, [gameStatus, selectedEvent]);

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  const checkCoordinate = () => {
    if (!selectedEvent?.puzzle) return;
    
    const invalidCoord = selectedEvent.puzzle.data.coordinates.find(c => !c.valid);
    if (selectedCoordinate === `${invalidCoord?.x},${invalidCoord?.y}`) {
      setCurrentPhase(1);
      setMessage('Invalid coordinate identified! SPECTRE\'s location confirmed.');
    } else {
      setMessage('Wrong coordinate. The AI is still hidden.');
      selectedEvent.puzzle.attempts++;
      if (selectedEvent.puzzle.attempts >= selectedEvent.puzzle.maxAttempts) {
        setGameStatus('lost');
        handleLockout();
        onComplete?.(false);
      }
    }
  };

  const handleCodeSnippetClick = (snippet: string) => {
    if (codeSnippets.includes(snippet)) {
      setCodeSnippets(prev => prev.filter(s => s !== snippet));
      setSelectedRoutes(prev => [...prev, snippet]);
    } else {
      setCodeSnippets(prev => [...prev, snippet]);
      setSelectedRoutes(prev => prev.filter(s => s !== snippet));
    }
  };

  const checkCodeOrder = () => {
    if (!selectedEvent?.puzzle) return;
    
    const solution = selectedEvent.puzzle.solution.codeOrder;
    if (JSON.stringify(selectedRoutes) === JSON.stringify(solution)) {
      setCurrentPhase(2);
      setMessage('Code chain validated! Preparing to shut down escape routes...');
    } else {
      setMessage('Invalid code chain. SPECTRE is adapting...');
      selectedEvent.puzzle.attempts++;
      if (selectedEvent.puzzle.attempts >= selectedEvent.puzzle.maxAttempts) {
        setGameStatus('lost');
        handleLockout();
        onComplete?.(false);
      }
    }
  };

  const handleRouteSelect = (routeId: string) => {
    if (selectedRoutes.includes(routeId)) {
      setSelectedRoutes(prev => prev.filter(id => id !== routeId));
    } else {
      setSelectedRoutes(prev => [...prev, routeId]);
    }
  };

  const checkRouteSequence = () => {
    if (!selectedEvent?.puzzle) return;
    
    const solution = selectedEvent.puzzle.solution.routeSequence;
    if (JSON.stringify(selectedRoutes) === JSON.stringify(solution)) {
      setGameStatus('won');
      setMessage('SPECTRE successfully contained! The AI has been neutralized.');
      // Award torcoins for event completion
      if (selectedEvent.effects.rewards?.torcoins) {
        onReward?.(selectedEvent.effects.rewards.torcoins);
      }
      handleLockout();
      onComplete?.(true);
    } else {
      setMessage('Incorrect sequence! SPECTRE is escaping...');
      selectedEvent.puzzle.attempts++;
      if (selectedEvent.puzzle.attempts >= selectedEvent.puzzle.maxAttempts) {
        setGameStatus('lost');
        handleLockout();
        onComplete?.(false);
      }
    }
  };

  // Function to check if an event is currently locked
  const isEventLocked = (eventId: string) => {
    if (eventId === 'icebreaker_001') {
      return lockedUntil !== null && Date.now() < lockedUntil;
    } else if (eventId === 'ghost_in_machine_001') {
      return ghostLockedUntil !== null && Date.now() < ghostLockedUntil;
    }
    return false;
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {!selectedEvent ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.map(event => {
            const isLocked = isEventLocked(event.id);
            const lockoutTime = event.id === 'icebreaker_001' ? lockedUntil : ghostLockedUntil;
            
            return (
              <div
                key={event.id}
                className={`bg-black/50 border-4 ${
                  event.id === 'icebreaker_001' ? 'border-red-900/50' : 'border-purple-900/50'
                } rounded-lg p-6 relative ${
                  !isLocked ? 'cursor-pointer hover:bg-green-900/10' : 'opacity-50'
                }`}
                onClick={() => !isLocked && selectEvent(event)}
              >
                <div className="flex items-center gap-2 mb-4">
                  {event.id === 'icebreaker_001' ? (
                    <AlertCircle className="w-6 h-6 text-red-400" />
                  ) : (
                    <Ghost className="w-6 h-6 text-purple-400" />
                  )}
                  <h3 className={`font-bold font-mono text-xl ${
                    event.id === 'icebreaker_001' ? 'text-red-400' : 'text-purple-400'
                  }`}>
                    {event.name}
                  </h3>
                </div>
                <p className="text-green-400 font-mono mb-4">{event.description}</p>
                {isLocked && (
                  <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center rounded-lg">
                    <div className="text-center">
                      <Lock className="w-8 h-8 text-red-400 mx-auto mb-2" />
                      <p className="text-red-400 font-mono">
                        Available in {Math.ceil((lockoutTime! - Date.now()) / (24 * 60 * 60 * 1000))} days
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
      <div className="bg-black/50 border-4 border-red-900/50 rounded-lg p-6">
        <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
          <h3 className="text-red-400 font-bold font-mono text-xl flex items-center gap-2">
            <AlertCircle className="w-6 h-6" />
            {selectedEvent.name}
          </h3>
          <div className="flex items-center gap-4">
            {isAdmin && (
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
        
        <p className="text-green-400 font-mono mb-6">{selectedEvent.description}</p>
        
        {isEventLocked(selectedEvent.id) ? (
          <div className="text-center p-6 rounded-lg border-2 border-red-500">
            <h4 className="text-xl font-bold font-mono mb-4 text-red-400">System Locked</h4>
            <p className="font-mono text-red-400">
              ICE defense system activated. Try again in {Math.ceil((
                selectedEvent.id === 'icebreaker_001'
                  ? (lockedUntil! - Date.now())
                  : (ghostLockedUntil! - Date.now())
              ) / (24 * 60 * 60 * 1000))} days.
            </p>
          </div>
        ) : gameStatus === 'playing' && (
          <div className="space-y-8">
            {currentPhase === 0 && (
              selectedEvent.id === 'ghost_in_machine_001' ? (
              <div className="space-y-4">
                <div className="text-green-400 font-mono">
                  Locate SPECTRE's position. Find the invalid coordinate:
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {selectedEvent?.puzzle?.data.coordinates.map((coord, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedCoordinate(`${coord.x},${coord.y}`)}
                      className={`w-full py-2 px-4 rounded font-mono ${
                        selectedCoordinate === `${coord.x},${coord.y}`
                          ? 'border-2 border-yellow-500 bg-yellow-900/30 text-yellow-400'
                          : 'border-2 border-green-500 hover:bg-green-900/30 text-green-400'
                      }`}
                    >
                      {coord.x}, {coord.y}
                    </button>
                  ))}
                </div>
                <button
                  onClick={checkCoordinate}
                  disabled={!selectedCoordinate}
                  className={`w-full py-2 rounded font-mono ${
                    selectedCoordinate
                      ? 'border-2 border-green-500 hover:bg-green-900/30 text-green-400'
                      : 'border-2 border-gray-500 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Submit Coordinate
                </button>
              </div>
              ) : (
                // Original Icebreaker event phase 0
                <div className="space-y-4">
                  <div className="text-green-400 font-mono">
                    Decipher the sequence pattern:
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    {selectedEvent.puzzle?.data.sequence.slice(0, -1).map((symbol, i) => (
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
              )
            )}
            
            {currentPhase === 1 && (
              selectedEvent.id === 'ghost_in_machine_001' ? (
              <div className="space-y-4">
                <div className="text-green-400 font-mono">
                  Trap SPECTRE in a logic loop. Arrange the code in the correct order:
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-green-600 mb-2">Available Operations:</div>
                    <div className="space-y-2">
                      {codeSnippets.map((snippet, i) => (
                        <button
                          key={i}
                          onClick={() => handleCodeSnippetClick(snippet)}
                          className="w-full py-2 px-4 rounded font-mono border-2 border-green-500 hover:bg-green-900/30 text-green-400"
                        >
                          {snippet}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-green-600 mb-2">Code Chain:</div>
                    <div className="space-y-2">
                      {selectedRoutes.map((snippet, i) => (
                        <button
                          key={i}
                          onClick={() => handleCodeSnippetClick(snippet)}
                          className="w-full py-2 px-4 rounded font-mono border-2 border-yellow-500 bg-yellow-900/30 text-yellow-400"
                        >
                          {snippet}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <button
                  onClick={checkCodeOrder}
                  disabled={selectedRoutes.length !== 4}
                  className={`w-full py-2 rounded font-mono ${
                    selectedRoutes.length === 4
                      ? 'border-2 border-green-500 hover:bg-green-900/30 text-green-400'
                      : 'border-2 border-gray-500 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Execute Code Chain
                </button>
              </div>
              ) : (
                // Original Icebreaker event phase 1
                <div className="space-y-4">
                  <div className="text-green-400 font-mono">
                    Select the secure proxy route:
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {selectedEvent.puzzle?.data.ips.map(ip => (
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
              )
            )}
            
            {currentPhase === 2 && (
              selectedEvent.id === 'ghost_in_machine_001' ? (
              <div className="space-y-4">
                <div className="text-green-400 font-mono">
                  Choose the correct sequence to shut down SPECTRE's escape routes:
                </div>
                <div className="grid grid-cols-1 gap-2 mb-4">
                  {selectedEvent?.puzzle?.data.escapeRoutes.map(route => (
                    <button
                      key={route.id}
                      onClick={() => handleRouteSelect(route.id)}
                      className={`w-full py-2 px-4 rounded font-mono ${
                        selectedRoutes.includes(route.id)
                          ? 'border-2 border-yellow-500 bg-yellow-900/30 text-yellow-400'
                          : 'border-2 border-green-500 hover:bg-green-900/30 text-green-400'
                      }`}
                    >
                      {route.name} - {route.type === 'slow' ? 'Slows AI' : route.type === 'block' ? 'Blocks Path' : 'Memory Overload'}
                    </button>
                  ))}
                </div>
                <button
                  onClick={checkRouteSequence}
                  disabled={selectedRoutes.length !== 3}
                  className={`w-full py-2 rounded font-mono ${
                    selectedRoutes.length === 3
                      ? 'border-2 border-green-500 hover:bg-green-900/30 text-green-400'
                      : 'border-2 border-gray-500 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Execute Containment Protocol
                </button>
              </div>
              ) : (
                // Original Icebreaker event phase 2
                <div className="space-y-4">
                  <div className="text-green-400 font-mono">
                    Unscramble the access word: <span className="text-yellow-400">{selectedEvent.puzzle?.data.scrambledWord}</span>
                  </div>
                  <input
                    type="text"
                    value={userWord}
                    onChange={(e) => setUserWord(e.target.value)}
                    maxLength={8}
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
              )
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
            <p className="font-mono">{message}{gameStatus === 'lost' && ' System will be locked for 7 days.'}</p>
            {gameStatus === 'won' && (
              <div className="mt-6 space-y-2 text-left">
                <div className="text-yellow-400 font-mono">Rewards:</div>
                <div className="space-y-1 font-mono">
                  {selectedEvent?.id === 'ghost_in_machine_001' ? (
                    <>
                      <div>• SPECTRE Hunter v1.0 Software</div>
                      <div>• 8 Torcoins</div>
                      <div>• +5 Underground Reputation</div>
                      <div>• +2000 Experience</div>
                    </>
                  ) : (
                    <>
                      <div>• ICEbreaker v1.0 Software</div>
                      <div>• 5 Torcoins</div>
                      <div>• +3 Underground Reputation</div>
                    </>
                  )}
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
        {gameStatus === 'won' && (
          <div className="mt-4 text-green-400 font-mono text-sm">
            Event will be available again in 7 days.
          </div>
        )}
      </div>
      )}
    </div>
  );
};


export { EventPanel }