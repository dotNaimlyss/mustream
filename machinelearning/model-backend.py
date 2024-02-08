from flask import Flask, request, jsonify
from flask_cors import CORS
from recommender import recommend_songs

app = Flask(__name__)
CORS(app)
@app.route('/recommend', methods=['POST'])
def recommend():
    try:
        data = request.json
        user_like_genres = data.get('like_genres', [])
        user_like_artists = data.get('like_artists', [])
        recommended_songs = recommend_songs(user_like_genres, user_like_artists)
        return jsonify(recommended_songs)
    except Exception as e:
        app.logger.error('An error occurred: %s', str(e))
        return jsonify({'error': 'Internal Server Error', 'message': str(e)}), 500

@app.route('/', methods=['GET'])
def welcome():
    return "Welcome from home page."

if __name__ == '__main__':
    app.run(debug=True, port=4000)
