import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Volume1, Music2, Music3, Music4, MessageSquare, BellOff, Bell, Monitor, Eye } from 'lucide-react';
import { 
  getVolume, 
  getMusicVolume, 
  setVolume, 
  setMusicVolume, 
  toggleMute, 
  toggleMusic, 
  isSoundMuted, 
  getMusicMutedState,
  getChatSoundsEnabled,
  setChatSoundsEnabled
} from '../lib/sounds';

interface SettingsPanelProps {
  onClose: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ onClose }) => {
  const [volume, setVolumeState] = useState(getVolume());
  const [musicVolume, setMusicVolumeState] = useState(getMusicVolume());
  const [muted, setMuted] = useState(isSoundMuted());
  const [musicMuted, setMusicMuted] = useState(getMusicMutedState());
  const [chatSoundsEnabled, setChatSoundsEnabledState] = useState(getChatSoundsEnabled());
  const [theme, setTheme] = useState<string>('default');
  const [textSize, setTextSize] = useState<string>('normal');

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolumeState(newVolume);
    setVolume(newVolume);
  };

  const handleMusicVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setMusicVolumeState(newVolume);
    setMusicVolume(newVolume);
  };

  const handleToggleMute = () => {
    const newMuted = toggleMute();
    setMuted(newMuted);
  };

  const handleToggleMusic = () => {
    const newMusicMuted = toggleMusic();
    setMusicMuted(newMusicMuted);
  };

  const handleToggleChatSounds = () => {
    const newValue = !chatSoundsEnabled;
    setChatSoundsEnabledState(newValue);
    setChatSoundsEnabled(newValue);
  };

  // Save settings to localStorage for preferences
  useEffect(() => {
    const saveSettings = () => {
      localStorage.setItem('hacker-settings', JSON.stringify({
        volume,
        musicVolume,
        muted,
        musicMuted,
        chatSoundsEnabled,
        theme,
        textSize
      }));
    };
    
    saveSettings();
  }, [volume, musicVolume, muted, musicMuted, chatSoundsEnabled, theme, textSize]);

  // Load settings from localStorage on component mount
  useEffect(() => {
    const loadSettings = () => {
      const savedSettings = localStorage.getItem('hacker-settings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        // Only update UI states, not the actual audio settings which are managed elsewhere
        setTheme(settings.theme || 'default');
        setTextSize(settings.textSize || 'normal');
      }
    };
    
    loadSettings();
  }, []);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold font-mono text-green-400 mb-4 flex items-center justify-between">
        <span>Settings</span>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Sound Settings */}
        <div className="bg-black/50 border-4 border-green-900/50 rounded-lg p-6">
          <h3 className="text-green-400 font-bold font-mono mb-4">Sound Settings</h3>
          
          <div className="space-y-6">
            {/* Effects Volume */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-green-400 font-mono flex items-center gap-2">
                  {muted ? (
                    <VolumeX className="w-5 h-5" />
                  ) : volume <= 0.5 ? (
                    <Volume1 className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                  Effects Volume
                </label>
                <button
                  onClick={handleToggleMute}
                  className="px-3 py-1 rounded border border-green-900 text-green-400 hover:border-green-500 font-mono text-sm"
                >
                  {muted ? 'Unmute' : 'Mute'}
                </button>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                disabled={muted}
                className="w-full accent-green-500"
              />
            </div>
            
            {/* Music Volume */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-green-400 font-mono flex items-center gap-2">
                  {musicMuted ? (
                    <Music4 className="w-5 h-5" />
                  ) : musicVolume <= 0.5 ? (
                    <Music2 className="w-5 h-5" />
                  ) : (
                    <Music3 className="w-5 h-5" />
                  )}
                  Music Volume
                </label>
                <button
                  onClick={handleToggleMusic}
                  className="px-3 py-1 rounded border border-green-900 text-green-400 hover:border-green-500 font-mono text-sm"
                >
                  {musicMuted ? 'Enable' : 'Disable'}
                </button>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={musicVolume}
                onChange={handleMusicVolumeChange}
                disabled={musicMuted}
                className="w-full accent-green-500"
              />
            </div>
            
            {/* Chat Sound Notifications */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-green-400 font-mono flex items-center gap-2">
                  {chatSoundsEnabled ? (
                    <Bell className="w-5 h-5" />
                  ) : (
                    <BellOff className="w-5 h-5" />
                  )}
                  Chat Notifications
                </label>
                <button
                  onClick={handleToggleChatSounds}
                  className="px-3 py-1 rounded border border-green-900 text-green-400 hover:border-green-500 font-mono text-sm"
                >
                  {chatSoundsEnabled ? 'Disable' : 'Enable'}
                </button>
              </div>
              <div className="text-green-600 text-sm font-mono">
                Play sounds when new chat messages arrive
              </div>
            </div>
          </div>
        </div>

        {/* Display Settings */}
        <div className="bg-black/50 border-4 border-green-900/50 rounded-lg p-6">
          <h3 className="text-green-400 font-bold font-mono mb-4">Display Settings</h3>
          
          <div className="space-y-6">
            {/* Theme Selection */}
            <div className="space-y-2">
              <label className="text-green-400 font-mono flex items-center gap-2">
                <Monitor className="w-5 h-5" />
                Theme
              </label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="w-full bg-black/50 border-2 border-green-900 rounded py-2 px-3 text-green-400 font-mono focus:outline-none focus:border-green-500"
              >
                <option value="default">Default (Green)</option>
                <option value="cyberpunk">Cyberpunk (Yellow)</option>
                <option value="synthwave">Synthwave (Purple)</option>
                <option value="terminal">Terminal (Amber)</option>
              </select>
              <div className="text-green-600 text-sm font-mono">
                Changes will apply after restart
              </div>
            </div>
            
            {/* Text Size */}
            <div className="space-y-2">
              <label className="text-green-400 font-mono flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Text Size
              </label>
              <select
                value={textSize}
                onChange={(e) => setTextSize(e.target.value)}
                className="w-full bg-black/50 border-2 border-green-900 rounded py-2 px-3 text-green-400 font-mono focus:outline-none focus:border-green-500"
              >
                <option value="small">Small</option>
                <option value="normal">Normal</option>
                <option value="large">Large</option>
              </select>
              <div className="text-green-600 text-sm font-mono">
                Changes will apply after restart
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-black/50 border-4 border-green-900/50 rounded-lg p-6">
        <h3 className="text-green-400 font-bold font-mono mb-4">Keyboard Shortcuts</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex justify-between">
            <span className="text-green-400 font-mono">Toggle Admin Panel</span>
            <span className="bg-black/80 px-2 py-1 rounded text-green-600 font-mono">Ctrl + Shift + A</span>
          </div>
          <div className="flex justify-between">
            <span className="text-green-400 font-mono">Send Chat Message</span>
            <span className="bg-black/80 px-2 py-1 rounded text-green-600 font-mono">Enter</span>
          </div>
          <div className="flex justify-between">
            <span className="text-green-400 font-mono">Toggle Settings</span>
            <span className="bg-black/80 px-2 py-1 rounded text-green-600 font-mono">Esc</span>
          </div>
        </div>
      </div>
      
      <div className="text-center text-green-600 font-mono text-sm">
        Settings are automatically saved and will persist between sessions
      </div>
    </div>
  );
};

export default SettingsPanel;