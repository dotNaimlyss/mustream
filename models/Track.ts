import mongoose, { Schema, Document } from "mongoose";

// Define TypeScript interface for the Song document
export interface ITrack extends Document {
  _id: mongoose.Schema.Types.ObjectId;
  track_id: string;
  track_name: string;
  track_artist: string;
  track_popularity: number;
  track_album_id: string;
  track_album_name: string;
  track_album_release_date: Date;
  playlist_name: string;
  playlist_id: string;
  playlist_genre: string;
  playlist_subgenre: string;
  danceability: number;
  energy: number;
  key: number;
  loudness: number;
  mode: number;
  speechiness: number;
  acousticness: number;
  instrumentalness: number;
  liveness: number;
  valence: number;
  tempo: number;
  duration_ms: number;
}

// Create the schema for the Track model
const trackSchema = new Schema<ITrack>({
  track_id: { type: String },
  track_name: { type: String },
  track_artist: { type: String },
  track_popularity: { type: Number },
  track_album_id: { type: String },
  track_album_name: { type: String },
  track_album_release_date: { type: Date },
  playlist_name: { type: String },
  playlist_id: { type: String },
  playlist_genre: { type: String },
  playlist_subgenre: { type: String },
  danceability: { type: Number },
  energy: { type: Number },
  key: { type: Number },
  loudness: { type: Number },
  mode: { type: Number },
  speechiness: { type: Number },
  acousticness: { type: Number },
  instrumentalness: { type: Number },
  liveness: { type: Number },
  valence: { type: Number },
  tempo: { type: Number },
  duration_ms: { type: Number },
});
trackSchema.index({ track_name: "text" });
// Compile the model from the schema
// Here, we explicitly set the collection name to 'tracks'
const Track = mongoose.models.Track || mongoose.model<ITrack>('Track', trackSchema);

export default Track;

