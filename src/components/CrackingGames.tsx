import React, { useState } from 'react';
import { Lock, RefreshCw } from 'lucide-react';
import { playSound } from '../lib/sounds';

interface CrackingGamesProps {
  onReward?: (torcoins: number) => void;
}

const PASSWORDS = [
  { hint: 'R3_ aG _n', answer: 'R3d_Drag0n' },
  { hint: 'P@_sw_rd1', answer: 'P@ssw0rd1' },
  { hint: 'D4_kl_ _der', answer: 'D4rkL0rd3r' },
  { hint: 'H_ _kM_St_r3000', answer: 'H@ckM@st3r3000' },
  { hint: 'S3cr_ C _e', answer: 'S3cr3tC0d3' },
  { hint: 'N_ ght _lK3r', answer: 'N1ghtSt@lK3r' },
  { hint: 'Z_ r0D _nce', answer: 'Z3r0D4nc3' },
  { hint: 'P_ nt3g _n', answer: 'P3nt3g0n' },
  { hint: 'L_ k3rB _lt', answer: 'L@z3rB0lt' },
  { hint: '5h_ ow _r', answer: '5h@d0wW@rr' },
  { hint: 'F_ l3H _t', answer: 'F1l3Hunt' },
  { hint: 'B_ n_ryD _th', answer: 'B1n@ryD3@th' },
  { hint: 'C0d_ 3R _t', answer: 'C0d3R3s3t' },
  { hint: 'D_ m0nK _l', answer: 'D3m0nK1ll' },
  { hint: 'X-9_ hK _n', answer: 'X-97hKr@k' }
];

interface GameState {
  hint: string;
  answer: string;
  current: string;
  attempts: number;
  maxAttempts: number;
  completed: boolean;
  message: string;
}

const CrackingGames: React.FC<CrackingGamesProps> = ({ onReward }) => {
  const [game, setGame] = useState<GameState>({
    hint: '',
    answer: '',
    current: '',
    attempts: 0,
    maxAttempts: 5,
    completed: false,
    message: 'Click New Game to start',
    torcoinChance: 0
  });

  const initializeGame = () => {
    const selected = PASSWORDS[Math.floor(Math.random() * PASSWORDS.length)];
    setGame({
      hint: selected.hint,
      answer: selected.answer,
      current: '',
      attempts: 0,
      maxAttempts: 5,
      completed: false,
      message: 'Enter the password using the hint above',
      torcoinChance: 0
    });
  };

  const handleGuess = () => {
    if (game.completed || game.attempts >= game.maxAttempts) return;
    
    playSound('click');
    
    if (game.current.trim().toLowerCase() === game.answer.toLowerCase()) {
      setGame(prev => ({
        ...prev,
        completed: true,
        message: 'Password cracked! System breached!'
      }));
      playSound('complete');
      
      // Show credit reward message
      const creditReward = 5000;
      setGame(prev => ({
        ...prev,
        message: `Password cracked! System breached!\nEarned ${creditReward.toLocaleString()} credits!`
      }));
      
      // 5% chance for torcoin reward
      const chance = Math.random();
      setGame(prev => ({
        ...prev,
        torcoinChance: chance
      }));
      
      if (chance < 0.05) {
        playSound('torcoin');
        onReward?.(1); // 1 torcoin + credits
      } else {
        onReward?.(0); // Just credits
      }
    } else {
      setGame(prev => ({
        ...prev,
        current: '',
        attempts: prev.attempts + 1,
        message: prev.attempts + 1 >= prev.maxAttempts 
          ? 'System locked. Maximum attempts reached.'
          : `Incorrect password. ${prev.maxAttempts - (prev.attempts + 1)} attempts remaining`
      }));
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold font-mono text-green-400">Password Cracker</h2>
        <button
          onClick={initializeGame}
          className="flex items-center gap-2 px-3 py-1 border border-green-500 rounded hover:bg-green-900/30 text-green-400 text-sm font-mono"
        >
          <RefreshCw className="w-4 h-4" />
          New Game
        </button>
      </div>

      <div className="bg-black/50 border-2 border-green-900/50 rounded-lg p-6">
        {game.hint ? (
          <>
            <div className="text-center mb-8">
              <div className="font-mono text-2xl mb-4 flex items-center justify-center gap-2">
                <Lock className="w-6 h-6 text-yellow-400" />
                <span className="text-yellow-400">{game.hint}</span>
              </div>
              <p className="text-green-600 text-sm font-mono">
                Hint: Use special characters (@, 0, 3, etc.) to replace letters
              </p>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                value={game.current}
                onChange={(e) => setGame(prev => ({ ...prev, current: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && handleGuess()}
                className="w-full bg-black/50 border-2 border-green-900 rounded py-2 px-4 text-center text-green-400 font-mono focus:outline-none focus:border-green-400"
                placeholder="Enter password..."
                disabled={game.completed || game.attempts >= game.maxAttempts}
              />
              
              <button
                onClick={handleGuess}
                disabled={!game.current || game.completed || game.attempts >= game.maxAttempts}
                className={`w-full py-2 rounded font-mono ${
                  !game.current || game.completed || game.attempts >= game.maxAttempts
                    ? 'border-2 border-gray-500 text-gray-500 cursor-not-allowed'
                    : 'border-2 border-green-500 hover:bg-green-900/30 text-green-400'
                }`}
              >
                Submit
              </button>
            </div>

            <div className="mt-4 text-center font-mono whitespace-pre-line">
              <p className={`text-sm ${
                game.completed ? 'text-green-400' :
                game.attempts >= game.maxAttempts ? 'text-red-400' :
                'text-yellow-400'
              }`}>
                {game.message}
                {game.completed && (
                  <div className="text-yellow-400 text-xs mt-2 animate-pulse">
                    {game.torcoinChance < 0.05 ? '+1 Torcoin!' : ''}
                  </div>
                )}
              </p>
            </div>
          </>
        ) : (
          <div className="text-center text-green-600 font-mono">
            Click New Game to start cracking
          </div>
        )}
      </div>
    </div>
  );
};

export default CrackingGames;