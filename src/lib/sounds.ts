// Sound URLs
const SOUND_URLS = {
  click: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
  complete: 'https://assets.mixkit.co/active_storage/sfx/2017/2017-preview.mp3',
  eventComplete: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
  torcoin: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3',
  chatMessage: '/sounds/chat-message.mp3' // New chat message sound
};

// Playlist of background music tracks
const BACKGROUND_MUSIC_PLAYLIST = [
  '/sounds/background1.mp3',
  '/sounds/background2.mp3',
  '/sounds/background3.mp3',
  '/sounds/background4.mp3'
];

let globalVolume = 0.5;
let isMuted = false;
let musicVolume = 0.3;
let isMusicMuted = false;
let chatSoundsEnabled = true; // New setting for chat sounds

// Background music setup
let currentTrackIndex = 0;
let backgroundMusic: HTMLAudioElement | null = new Audio(BACKGROUND_MUSIC_PLAYLIST[currentTrackIndex]);
backgroundMusic.loop = false; // We'll handle looping manually
backgroundMusic.volume = musicVolume;

// When a track ends, move to the next one
backgroundMusic.addEventListener('ended', () => {
  playNextTrack();
});

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
  Object.values(sounds).forEach((sound) => {
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
    backgroundMusic?.pause();
  } else {
    backgroundMusic?.play().catch(() => {});
  }
  return isMusicMuted;
};

export const getMusicMutedState = () => isMusicMuted;

export const setMusicVolume = (volume: number) => {
  musicVolume = volume;
  if (backgroundMusic) {
    backgroundMusic.volume = volume;
  }
};

export const getMusicVolume = () => musicVolume;

// Play next track in the playlist
export const playNextTrack = () => {
  currentTrackIndex = (currentTrackIndex + 1) % BACKGROUND_MUSIC_PLAYLIST.length;
  if (backgroundMusic) {
    backgroundMusic.src = BACKGROUND_MUSIC_PLAYLIST[currentTrackIndex];
    backgroundMusic.play().catch(() => {});
  }
};

// Play previous track
export const playPreviousTrack = () => {
  currentTrackIndex =
    (currentTrackIndex - 1 + BACKGROUND_MUSIC_PLAYLIST.length) % BACKGROUND_MUSIC_PLAYLIST.length;
  if (backgroundMusic) {
    backgroundMusic.src = BACKGROUND_MUSIC_PLAYLIST[currentTrackIndex];
    backgroundMusic.play().catch(() => {});
  }
};

// Start playing background music from the current track
export const startBackgroundMusic = () => {
  if (!isMusicMuted && backgroundMusic) {
    // Select a random track from the playlist
    currentTrackIndex = Math.floor(Math.random() * BACKGROUND_MUSIC_PLAYLIST.length);
    backgroundMusic.src = BACKGROUND_MUSIC_PLAYLIST[currentTrackIndex];
    backgroundMusic.play().catch(() => {});
  }
};

// Restart playlist from the first track
export const restartPlaylist = () => {
  currentTrackIndex = 0;
  if (backgroundMusic) {
    backgroundMusic.src = BACKGROUND_MUSIC_PLAYLIST[currentTrackIndex];
    backgroundMusic.play().catch(() => {});
  }
};