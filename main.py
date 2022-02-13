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

    def __repr__(self):
        return '<User %r>' % self.username

@app.route('/')
@login_required
def index():
    return render_template('index.html', 
        level=current_user.current_level,
        username=current_user.username,
        scoreboard=getTopTen()   
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

@app.route('/checkword', methods=['POST'])
@login_required
def checkword():
    user_level = current_user.current_level
    random.seed(user_level)
    word = random.choice(words)
    usr_word = request.form['word']
    if word == word:
        return 'OK'
    if word not in words:
        return 'NEMA'

    snd = ""
    for i, letter in enumerate(word):
        if letter == word[i]:
            snd += "!" # correct letter
        else:
            if letter in word:
                snd += "?" # wrong position
            else:
                snd += "-" # wrong letter
    return snd

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
    app.run(debug=True)