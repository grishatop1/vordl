from flask import Flask
from flask import render_template
from flask import request

from flask_login import UserMixin
from flask_login import LoginManager
from flask_login import login_required
from flask_login import login_user
from flask_login import current_user

from flask_sqlalchemy import SQLAlchemy

import os
import json
import random

from matplotlib.style import use

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.secret_key = os.urandom(12)
db = SQLAlchemy(app)

with open("words.json", "r") as f:
    words = json.load(f)

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(25), unique=True, nullable=False)
    password = db.Column(db.String(50), nullable=False)
    current_level = db.Column(db.Integer, default=1)
    current_score = db.Column(db.Integer, default=0)

    def __repr__(self):
        return '<User %r>' % self.username

class GameTable(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    level = db.Column(db.Integer, nullable=False)
    data = db.Column(db.String(1000), nullable=False)

@app.template_filter('to_json')
def to_json(value):
    return json.dumps(value)

@app.route('/')
@login_required
def index():
    user_table = GameTable.query.filter_by(
        user_id=current_user.id
        ).filter_by(level=current_user.current_level).first()
    if user_table:
        table = user_table.data
    else:
        table = "[]"
    return render_template('index.html', 
        level=current_user.current_level,
        username=current_user.username,
        scoreboard=getTopTen(),
        table=table,
        score=current_user.current_score
    )

@app.route('/login', methods=['POST', 'GET'])
def login():
    if request.method == "POST":
        username = request.form['username']
        password = request.form['password']

        user = User.query.filter_by(username=username).first()
        if not user or user.password != password:
            return "invalid"

        login_user(user, remember=True)
        return "success"
    else:
        return render_template('login.html')

@app.route('/register', methods=['POST', 'GET'])
def register():
    if request.method == "POST":
        username = request.form['username']
        password = request.form['password']
        user = User.query.filter_by(username=username).first()
        if user:
            return "username_taken"

        new_user = User(username=username, password=password)
        db.session.add(new_user)
        db.session.commit()

        login_user(new_user, remember=True)

        return "success"
    else:
        return render_template('register.html')

@app.route('/checkWord', methods=['POST'])
@login_required
def checkword():
    user_level = current_user.current_level

    table = GameTable.query.filter_by(user_id=current_user.id, level=user_level).first()
    if not table:
        new_table = GameTable(user_id=current_user.id, level=user_level, data="[]")
        db.session.add(new_table)
        db.session.commit()
    
    table = GameTable.query.filter_by(user_id=current_user.id, level=user_level).first()
    data = json.loads(table.data)

    if len(data) > 6:
        return "DENIED"

    random.seed(user_level)
    secret_word = random.choice(words)
    usr_word = request.form['word']

    print(f"""
        user level: {user_level}
        secret word: {secret_word}
        user word: {usr_word}
    """)

    if usr_word == secret_word:
        current_user.current_level += 1

        if (len(data) == 0 or len(data) == 1):
            current_user.current_score += 30
            print("got full score")
        elif (len(data) == 2):
            current_user.current_score += 20
            print("got score for 3")
        elif (len(data) < 6):
            current_user.current_score += 10
            print("got other score")

        db.session.commit()
        return '!!!!!'
    if not usr_word in words:
        return 'NEMA'

    letter_count = {}
    #for each letter
    for letter in secret_word:
        #try to up its count
        try: letter_count[letter]+=1
        #if there's no count, start at 1
        except: letter_count[letter]=1
    #make a copy of the letter count for the green counting
    #difference is, here we only count when we find a green
    green_count = dict(letter_count)

    snd = []
    for i, letter in enumerate(usr_word):
        if letter == secret_word[i]:
            snd.append("!") # correct letter
            #down the count of that letter
            green_count[letter] -= 1

            #if there's still some of this letter to be found
            if letter_count[letter]:
                #one found, mark it off
                letter_count[letter]-=1

        elif letter in secret_word:
            snd.append("?") # wrong position

            #if there's still some of this letter to be found
            if letter_count[letter]:
                #one found, mark it off
                letter_count[letter]-=1
            #if there's zero remaining
            else:
                #change the false yellow to a grey
                snd[i]="-"
        else:
            snd.append("-") # wrong letter
        
    #make a copy of snd to work on while looping through snd
    snd_copy = list(snd)
    #for each mark in snd
    for s in snd:
        #if that letter in our guess is in the correct word
        if usr_word[snd.index(s)] in green_count:
            #and we guessed all there is of that mark's letter
            if green_count[usr_word[snd.index(s)]] == 0:
                #if the mark is a yellow
                if s == "?":
                    #set it to grey
                    snd_copy[snd.index(s)] = "-"
                #i used nested ifs to limit width of code
                #and increase readability


    data.append([usr_word, "".join(snd_copy)])
    table.data = json.dumps(data)
    db.session.commit()

    return "".join(snd_copy)

def getTopTen():
    users = User.query.order_by(User.current_level.desc()).limit(10).all()
    rank_list = []
    for user in users:
        rank_list.append({
            "username": user.username,
            "level": user.current_level
        })
    return rank_list

login_manager = LoginManager()
login_manager.login_view = 'login'
login_manager.init_app(app)

@login_manager.user_loader
def load_user(user_id):
    # since the user_id is just the primary key of our user table, use it in the query for the user
    return User.query.get(int(user_id))

if __name__ == '__main__':
    db.create_all()
    app.run(host="0.0.0.0", debug=True)