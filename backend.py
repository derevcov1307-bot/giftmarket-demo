import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

BOT_TOKEN = os.getenv('BOT_TOKEN')
TELEGRAM_API_URL = f'https://api.telegram.org/bot{BOT_TOKEN}'

@app.route('/')
def home():
    return jsonify({'status': 'GiftArcade bot is running!'})

@app.route('/webhook', methods=['POST'])
def webhook():
    data = request.json
    print(f'📩 Получено обновление: {data}')
    return jsonify({'ok': True})

if __name__ == '__main__':
    print('🤖 Bot is running!')
    app.run(host='0.0.0.0', port=5000)
