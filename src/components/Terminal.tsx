import React from 'react';
import { Volume2, VolumeX, Volume1, Music2, Music3, Music4, SkipForward, SkipBack } from 'lucide-react';
import { playSound, setVolume, toggleMute, toggleMusic, setMusicVolume, startBackgroundMusic, playNextTrack, playPreviousTrack } from '../lib/sounds';

interface TerminalProps {
  messages: string[];
}

export const Terminal: React.FC<TerminalProps> = ({ messages }) => {
  const terminalRef = React.useRef<HTMLDivElement>(null);
  const [isMuted, setIsMuted] = React.useState(false);
  const [isMusicMuted, setIsMusicMuted] = React.useState(false);
  const [volume, setVolumeState] = React.useState(0.5);
  const [musicVolume, setMusicVolumeState] = React.useState(0.3);

  React.useEffect(() => {
    startBackgroundMusic();
  }, []);

  React.useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [messages]);
  
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolumeState(newVolume);
    setVolume(newVolume);
  };

  const handleMuteToggle = () => {
    const newMutedState = toggleMute();
    setIsMuted(newMutedState);
  };
  
  const handleMusicMuteToggle = () => {
    const newMutedState = toggleMusic();
    setIsMusicMuted(newMutedState);
  };

  const handleMusicVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setMusicVolumeState(newVolume);
    setMusicVolume(newVolume);
  };

  return (
    <div className="relative">
      <div className="bg-black/90 border-2 sm:border-4 border-green-900/50 rounded-lg p-3 sm:p-6 font-mono text-xs sm:text-sm h-[400px] lg:h-[600px] overflow-y-auto scrollbar-hide shadow-xl shadow-green-900/30" ref={terminalRef}>
        {messages.map((message, index) => (
          <div key={index} className="text-green-400 mb-1 sm:mb-2 leading-relaxed whitespace-pre-wrap">
            <span className="text-blue-400">{'>'}</span> {message}
          </div>
        ))}
        <div className="text-green-400 animate-pulse mt-1 sm:mt-2">
          <span className="text-blue-400">{'>'}</span> _ 
        </div>
      </div>
      
      <div className="absolute bottom-4 right-4 flex items-center gap-4 bg-black/80 px-4 py-2 rounded-lg border border-green-900">
        <div className="flex items-center gap-2">
          <button onClick={handleMusicMuteToggle} className="text-green-400 hover:text-green-300 transition-colors">
            {isMusicMuted ? <Music4 className="w-5 h-5" /> : musicVolume <= 0.5 ? <Music2 className="w-5 h-5" /> : <Music3 className="w-5 h-5" />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={musicVolume}
            onChange={handleMusicVolumeChange}
            className="w-24 accent-green-500"
          />
        </div>
        
        <div className="w-px h-6 bg-green-900/50" />
        
        <button onClick={handleMuteToggle} className="text-green-400 hover:text-green-300 transition-colors">
          {isMuted ? <VolumeX className="w-5 h-5" /> : volume <= 0.5 ? <Volume1 className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
        
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={handleVolumeChange}
          className="w-24 accent-green-500"
        />
        
        <button onClick={playPreviousTrack} className="text-green-400 hover:text-green-300">
          <SkipBack className="w-5 h-5" />
        </button>
        
        <button onClick={playNextTrack} className="text-green-400 hover:text-green-300">
          <SkipForward className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
