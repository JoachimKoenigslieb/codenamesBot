from dotenv import load_dotenv
from flask import Flask, send_file, request, render_template, jsonify
import random
import json

import mlbackend

load_dotenv()

app = Flask(__name__)

word_list = mlbackend.get_wordlist()
model = mlbackend.get_model()

def build_new_state(clicks, old_state):
    clicks_ind = [f'{click[0]}{click[1]}' for click in clicks]
    new_state = {ind: state if ind not in clicks_ind else {'word': state['word'], 'owner': 'red'} for ind, state in old_state.items()}
    new_state['hint'] = random.choice(['hvad', 'fuck', 'er', 'et', 'hyl', 'hint'])
    return new_state

def select_hint(positives, negatives, model=model, ):
    #use the model to generate a hint. 
    words_selected = random.sample(positives, 2)
    words = [model.word_vec(word) for word in words_selected]
    print(f'trying to find a hint for {words_selected}')
    selected_hints = model.most_similar(positive=[words[0] + words[1]], negative=negatives, topn=5)
    print(f'hints found..: {selected_hints}')
    return selected_hints[0][0]
    
@app.route('/')
def index():
    return render_template('codenames.html')

@app.route('/new-game')
def new_game():
    game = [random.choice(word_list) for _ in range(25)]
    game = [[game[i + 5*j] for i in range(5)] for j in range(5)] #reshape list
    random_sample = random.sample([[i,j] for i in range(5) for j in range(5)], k=16)
    red, blue, kill = random_sample[0:8], random_sample[8: 15], random_sample[15]
    red_words, blue_words, kill_word = [game[i][j] for i,j in red], [game[i][j] for i,j in blue], [game[kill[0]][kill[1]]]
    # print(game)
    # print('red', red, len(red))
    # print('blue', blue, len(blue))
    # print(kill_word)

    return jsonify({'game': game, 'red': red, 'blue': blue, 'killWord': kill, 'hint': select_hint(red_words, blue_words + kill_word)})

@app.route('/make-move', methods = ['POST'])
def make_move():
    game_state = request.json
    
    game, clicked = game_state['game'], game_state['clicked']

    print(game)

    new_state = build_new_state(clicked, game)

    return new_state