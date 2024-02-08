import requests

data = {
    "like_genres": ["pop", "rock"],
    "like_artists": ["Ed Sheeran", "The Beatles"]
}

response = requests.post("http://127.0.0.1:5000/recommend", json=data)
print(response.json())
