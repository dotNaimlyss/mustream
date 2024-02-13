// models/User.js
import Track from "./Track";
import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";

interface IUser extends Document {
  _id: mongoose.Schema.Types.ObjectId;
  username: string;
  password: string;
  liked_genres: string[];
  liked_artists: string[];
  searched_songs: string[];
  recommended_songs: string[];
}

const UserSchema: Schema = new Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    default: mongoose.Types.ObjectId,
    auto: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  like_genres: {
    type: Array,
  },
  like_artists: {
    type: Array,
  },
  searched_songs: [
    {
      type: Schema.Types.ObjectId,
      ref: Track,
    },
  ],
  recommended_songs: [
    {
      type: Schema.Types.ObjectId,
      ref: Track,
    },
  ],
});

UserSchema.pre("save", async function (next) {
  if (this.isModified("password") || this.isNew) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
export default User;
