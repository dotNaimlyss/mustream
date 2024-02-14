import ssl
import pandas as pd
import torch
import torch.nn as nn
from pymongo import MongoClient
import torch.optim as optim
from bson import ObjectId

connection_string = "mongodb+srv://thurein:yZvltzHCExQyT4Mw@cluster1.gd9wruo.mongodb.net/?retryWrites=true&w=majority"
client = MongoClient(connection_string,  ssl=True, ssl_cert_reqs=ssl.CERT_NONE)
db = client['MustreamDatabase']
collection = db['tracks']
data = collection.find()

spotify_songs_df = pd.DataFrame(data)

# Create mapping for songs
genre_to_idx = {genre: idx for idx, genre in enumerate(spotify_songs_df['playlist_subgenre'].unique())}
artist_to_idx = {artist: idx for idx, artist in enumerate(spotify_songs_df['track_artist'].unique())}
track_to_idx = {track: idx for idx, track in enumerate(spotify_songs_df['track_name'].unique())}
idx_to_track = {idx: track for track, idx in track_to_idx.items()}



class SongRecommender(nn.Module):
    def __init__(self, num_songs, num_genres, num_artists, embedding_size):
        super(SongRecommender, self).__init__()
        self.song_embedding = nn.Embedding(num_songs, embedding_size)
        self.genre_embedding = nn.Embedding(num_genres, embedding_size)
        self.artist_embedding = nn.Embedding(num_artists, embedding_size)
        # The linear layer should match the combined size of all embeddings
        self.fc = nn.Linear(embedding_size * 3, 1)

    def forward(self, genre_indices, artist_indices, song_indices):
        genre_embed = self.genre_embedding(genre_indices).mean(dim=0, keepdim=True)
        artist_embed = self.artist_embedding(artist_indices).mean(dim=0, keepdim=True)
        song_embed = self.song_embedding(song_indices)

        # Ensure all tensors have the same number of dimensions
        if genre_embed.ndim == 1:
            genre_embed = genre_embed.unsqueeze(0)
        if artist_embed.ndim == 1:
            artist_embed = artist_embed.unsqueeze(0)
        if song_embed.ndim == 1:
            song_embed = song_embed.unsqueeze(0)

        # Expand genre and artist embeddings to match the number of songs
        genre_embed = genre_embed.expand_as(song_embed)
        artist_embed = artist_embed.expand_as(song_embed)

        # Concatenate embeddings along the feature dimension
        combined = torch.cat((genre_embed, artist_embed, song_embed), dim=1)
        scores = self.fc(combined).squeeze()
        return scores


def recommend_songs(user_like_genres, user_like_artists, top_k=10):
    # Initialize and load the model
    num_songs = len(track_to_idx)
    num_genres = len(genre_to_idx)
    num_artists = len(artist_to_idx)
    embedding_size = 50  # Example size

    model = SongRecommender(num_songs, num_genres, num_artists, embedding_size)
    model_path = 'mustream_recommender_model.pth'
    torch.save(model.state_dict(), model_path)
    # Define a simple training loop
    criterion = nn.MSELoss()
    optimizer = optim.Adam(model.parameters(), lr=0.001)

    # Dummy training loop
    for epoch in range(10):  # Example: 5 epochs
        # Dummy data: Random genre, artist, and song indices with random target scores
        genre_indices = torch.randint(0, num_genres, (100,))
        artist_indices = torch.randint(0, num_artists, (100,))
        song_indices = torch.randint(0, num_songs, (100,))
        target_scores = torch.rand(100)

        optimizer.zero_grad()
        outputs = model(genre_indices, artist_indices, song_indices)
        loss = criterion(outputs, target_scores)
        loss.backward()
        optimizer.step()

        print(f'Epoch [{epoch+1}/10], Loss: {loss.item():.4f}')

    # Set model to evaluation mode
    model.eval()

    # Process user preferences
    genre_indices = torch.tensor([genre_to_idx.get(genre, -1) for genre in user_like_genres if genre in genre_to_idx], dtype=torch.long)
    artist_indices = torch.tensor([artist_to_idx.get(artist, -1) for artist in user_like_artists if artist in artist_to_idx], dtype=torch.long)


    song_indices = torch.arange(num_songs)
    with torch.no_grad():
        scores = model(genre_indices, artist_indices, song_indices)

    _, top_song_indices = torch.topk(scores, k=top_k)

    recommended_songs = []  
    for idx in top_song_indices.tolist():  # Convert tensor to list of integers
        try:
            song_details = spotify_songs_df.loc[spotify_songs_df['track_name'] == idx_to_track[idx]].to_dict('records')[0]
            recommended_songs.append(song_details)
        except IndexError as e:
            print(f"No details found for index: {idx}, Error: {e}")
            
    def serialize_doc(doc):
        if isinstance(doc, dict):
            for key, value in doc.items():
                if isinstance(value, ObjectId):
                    doc[key] = str(value)  # Convert ObjectId to string
                elif isinstance(value, dict) or isinstance(value, list):
                    doc[key] = serialize_doc(value)  # Recurse into sub-docs or lists
        elif isinstance(doc, list):
            doc = [serialize_doc(item) for item in doc]  # Recurse into list items
        return doc

# In your recommend_songs function, before returning:
    recommended_songs = serialize_doc(recommended_songs)

    return recommended_songs


# Example user preferences
# like_genres = ['pop rock','electro pop']
# like_artists = ['eminem']
# recommendedsongs = recommend_songs(like_genres, like_artists)
# print(recommendedsongs)

import torch
import torch.onnx

# Load the pre-trained PyTorch model
model = torch.load('mustream-recommender.pth')
model.eval()

# Create dummy input matching the model input size, for example:
dummy_input = torch.randn(1, 3, 224, 224)  # Adjust the size as necessary

# Export the model
torch.onnx.export(model, dummy_input, "mustream-recommender.onnx", export_params=True, opset_version=10)
