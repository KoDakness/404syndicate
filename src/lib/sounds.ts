// Sound URLs - using placeholder sounds that are freely available
const SOUND_URLS = {
  click: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
  complete: 'https://assets.mixkit.co/active_storage/sfx/2017/2017-preview.mp3',
  eventComplete: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
  torcoin: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3',
  chatMessage: '/sounds/chat-message.mp3' // New chat message sound
};

// Cyberpunk-style background music
const BACKGROUND_MUSIC_URL = '/sounds/background.mp3';

let globalVolume = 0.5;
let isMuted = false;
let musicVolume = 0.3;
let isMusicMuted = false;
let chatSoundsEnabled = true; // New setting for chat sounds

// Background music setup
const backgroundMusic = new Audio(BACKGROUND_MUSIC_URL);
backgroundMusic.loop = true;
backgroundMusic.volume = musicVolume;

// Pre-load sounds
const sounds: { [key: string]: HTMLAudioElement } = {};

Object.entries(SOUND_URLS).forEach(([key, url]) => {
  sounds[key] = new Audio(url);
  sounds[key].volume = globalVolume;
});

export const playSound = (soundName: keyof typeof SOUND_URLS) => {
  if (isMuted) return;
  
  const sound = sounds[soundName];
  if (sound) {
    sound.currentTime = 0; // Reset to start
    sound.play().catch(() => {}); // Ignore autoplay restrictions
  }
};

export const playChatSound = () => {
  if (isMuted || !chatSoundsEnabled) return;
  playSound('chatMessage');
};

export const setChatSoundsEnabled = (enabled: boolean) => {
  chatSoundsEnabled = enabled;
};

export const getChatSoundsEnabled = () => chatSoundsEnabled;

export const setVolume = (volume: number) => {
  globalVolume = volume;
  Object.values(sounds).forEach(sound => {
    sound.volume = volume;
  });
};

export const getVolume = () => globalVolume;

export const toggleMute = () => {
  isMuted = !isMuted;
  return isMuted;
};

export const isSoundMuted = () => isMuted;

export const toggleMusic = () => {
  isMusicMuted = !isMusicMuted;
  if (isMusicMuted) {
    backgroundMusic.pause();
  } else {
    backgroundMusic.play().catch(() => {});
  }
  return isMusicMuted;
};

export const getMusicMutedState = () => isMusicMuted;

export const setMusicVolume = (volume: number) => {
  musicVolume = volume;
  backgroundMusic.volume = volume;
};

export const getMusicVolume = () => musicVolume;

export const startBackgroundMusic = () => {
  if (!isMusicMuted) {
    backgroundMusic.play().catch(() => {});
  }
};