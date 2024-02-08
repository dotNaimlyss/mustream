export {};

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady?: () => void;
    Spotify?: SpotifyWebPlaybackSDK;
  }
}

export interface SpotifyWebPlaybackSDK {
  Player: SpotifyPlayerConstructor;
}

export interface SpotifyPlayerConstructor {
  new (options: SpotifyPlayerInit): SpotifyPlayerInstance;
}

export interface SpotifyPlayerInit {
  name: string;
  getOAuthToken: (cb: (token: string) => void) => void;
  volume?: number;
}

export interface SpotifyPlayerInstance {
  connect(): Promise<boolean>;
  addListener(eventType: SpotifyPlayerEventType, callback: (object: any) => void): void;
  removeListener(eventType: SpotifyPlayerEventType, callback?: (object: any) => void): void;
  togglePlay(): Promise<void>;
  nextTrack(): Promise<void>;
  previousTrack(): Promise<void>;
  disconnect(): Promise<void>;
  pause(): Promise<boolean>;
  play(): Promise<boolean>;
  setVolume(volume: number): Promise<void>;
  getVolume(): Promise<number | null>;
  seek(position_ms: number): Promise<void>;
  resume(): Promise<boolean>;
  getCurrentState(): Promise<SpotifyPlaybackState | null>;
  // Extend with additional methods from the Spotify Web Playback SDK as needed.
}

// Define the SpotifyPlaybackState type based on what the Spotify SDK documentation states it includes.
export interface SpotifyPlaybackState {
  context: {
    uri: string; // The URI of the context (e.g., album, playlist) the player is currently playing from.
    metadata: object; // Additional context metadata.
  };
  disallows: { // Actions that are currently disallowed.
    pausing: boolean;
    skipping_prev: boolean;
    // Add more as needed based on the Spotify Web Playback SDK documentation.
  };
  paused: boolean; // Whether the player is currently paused.
  position: number; // The current playback position in milliseconds.
  duration: number;
  repeat_mode: number; // The current repeat mode.
  shuffle: boolean; // Whether shuffle is currently on.
  track_window: { // Information about the current track and next/previous tracks in the queue.
    current_track: SpotifyTrack; // The currently playing track.
    next_tracks: SpotifyTrack[]; // The next tracks in the queue.
    previous_tracks: SpotifyTrack[]; // The previous tracks in the queue.
  };
  // Add more fields as needed based on the Spotify Web Playback SDK documentation.
}

export interface SpotifyTrack {
  id: string; // The Spotify ID of the track.
  uri: string; // The Spotify URI of the track.
  name: string; // The name of the track.
  album: {
    uri: string;
    name: string;
    images: { url: string }[]; // Album artwork images.
  };
  artists: { uri: string; name: string }[]; // The track's artists.
  // Add more fields as needed based on the Spotify Web Playback SDK documentation.
}

// Example of how you might type the events
type SpotifyPlayerEventType = 'ready' | 'not_ready' | 'player_state_changed' | string;
