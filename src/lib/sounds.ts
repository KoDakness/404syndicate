// Sound URLs - using placeholder sounds that are freely available
const SOUND_URLS = {
  click: '/sounds/click.mp3',
  complete: '/sounds/complete.mp3',
  eventComplete: '/sounds/event-complete.mp3',
  torcoin: '/sounds/torcoin.mp3'
};

// Cyberpunk-style background music
const BACKGROUND_MUSIC_URL = '/sounds/background.mp3';

let globalVolume = 0.5;
let isMuted = false;
let musicVolume = 0.3;
let isMusicMuted = false;

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

export const setVolume = (volume: number) => {
  globalVolume = volume;
  Object.values(sounds).forEach(sound => {
    sound.volume = volume;
  });
};

export const toggleMute = () => {
  isMuted = !isMuted;
  return isMuted;
};

export const toggleMusic = () => {
  isMusicMuted = !isMusicMuted;
  if (isMusicMuted) {
    backgroundMusic.pause();
  } else {
    backgroundMusic.play().catch(() => {});
  }
  return isMusicMuted;
};

export const setMusicVolume = (volume: number) => {
  musicVolume = volume;
  backgroundMusic.volume = volume;
};

export const startBackgroundMusic = () => {
  if (!isMusicMuted) {
    backgroundMusic.play().catch(() => {});
  }
};