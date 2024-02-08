import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { ITrack } from "../models/Track";

export interface Song {
  track_name: string;
  track_artist: string;
}

// Updated User interface to include recommendations
export interface User {
  _id?: string;
  username?: string | 'anonymous';
  password?: string;
  like_genres: string[];
  like_artists: string[];
  recommendations?: Song[] | ITrack[];
  searched_songs?: string[];
  spotify_token?: string;
}

interface UserState {
  user: User | null;
}

const initialState: UserState = {
  user: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    setLikeGenres: (state, action: PayloadAction<string[]>) => {
      if (state.user) {
        state.user.like_genres = action.payload;
      }
    },
    setLikeArtists: (state, action: PayloadAction<string[]>) => {
      if (state.user) {
        state.user.like_artists = action.payload;
      }
    },
    setRecommendations: (state, action: PayloadAction<Song[] | ITrack[]>) => {
      if (state.user) {
        state.user.recommendations = action.payload; // Store recommendations within user
      }
    },
    setSearchSongs: (state, action: PayloadAction<string[]>) => {
      if (state.user) {
        state.user.searched_songs = action.payload; // Store recommendations within user
      }
    },
    setSpotifyToken: (state, action: PayloadAction<string>) => {
      if (state.user) {
        state.user.spotify_token = action.payload; // Store recommendations within user
      }
    },
    logoutUser: (state) => {
      state.user = null;
    },
  },
});

export const { setUser, setLikeGenres, setLikeArtists, setRecommendations, logoutUser,setSearchSongs } = userSlice.actions;
export default userSlice.reducer;
