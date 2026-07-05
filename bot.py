import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from dotenv import load_dotenv
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime

load_dotenv()

app = Flask(__name__)
CORS(app)

# ============================================================
#  ПОДКЛЮЧЕНИЕ К БАЗЕ ДАННЫХ
# ============================================================

DATABASE_URL = os.getenv('DATABASE_URL')
BOT_TOKEN = os.getenv('BOT_TOKEN')
TELEGRAM_API_URL = f'https://api.telegram.org/bot{BOT_TOKEN}'

def get_db_connection():
    """Подключение к PostgreSQL"""
    conn = psycopg2.connect(DATABASE_URL)
    return conn

# ============================================================
#  СОЗДАНИЕ ТАБЛИЦ
# ============================================================

def init_db():
    """Создаёт таблицы, если их нет"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Таблица пользователей
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            user_id BIGINT PRIMARY KEY,
            username TEXT,
            first_name TEXT,
            last_name TEXT,
            balance INTEGER DEFAULT 1000,
            total_games INTEGER DEFAULT 0,
            wins INTEGER DEFAULT 0,
            gifts INTEGER DEFAULT 0,
            is_premium BOOLEAN DEFAULT FALSE,
            badge TEXT DEFAULT '🏅',
            status TEXT DEFAULT '🟢 В сети',
            joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Таблица достижений
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS achievements (
            id SERIAL PRIMARY KEY,
            user_id BIGINT,
            achievement_id TEXT,
            unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (user_id)
        )
    ''')
    
    # Таблица покупок
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS purchases (
            id SERIAL PRIMARY KEY,
            user_id BIGINT,
            item_id TEXT,
            category TEXT,
            price INTEGER,
            purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (user_id)
        )
    ''')
    
    # Таблица истории игр
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS game_history (
            id SERIAL PRIMARY KEY,
            user_id BIGINT,
            game_type TEXT,
            bet INTEGER,
            win_amount INTEGER,
            multiplier REAL,
            result TEXT,
            played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (user_id)
        )
    ''')
    
    # Таблица NFT коллекции
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS nft_collection (
            id SERIAL PRIMARY KEY,
            user_id BIGINT,
            nft_id TEXT,
            nft_title TEXT,
            nft_rarity TEXT,
            nft_price INTEGER,
            nft_icon TEXT,
            bought_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (user_id)
        )
    ''')
    
    conn.commit()
    conn.close()
    print('✅ Таблицы созданы/проверены')

# ============================================================
#  API: ПОЛЬЗОВАТЕЛИ
# ============================================================

@app.route('/api/user/<int:user_id>', methods=['GET'])
def get_user(user_id):
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute('SELECT * FROM users WHERE user_id = %s', (user_id,))
    user = cursor.fetchone()
    conn.close()
    
    if user:
        return jsonify({'ok': True, 'user': user})
    return jsonify({'ok': False, 'error': 'User not found'}), 404

@app.route('/api/user/<int:user_id>', methods=['POST'])
def create_or_update_user(user_id):
    data = request.json
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO users (user_id, username, first_name, last_name, balance)
        VALUES (%s, %s, %s, %s, %s)
        ON CONFLICT (user_id) DO UPDATE SET
            username = EXCLUDED.username,
            first_name = EXCLUDED.first_name,
            last_name = EXCLUDED.last_name
    ''', (user_id, data.get('username'), data.get('first_name'), data.get('last_name'), 1000))
    
    conn.commit()
    conn.close()
    return jsonify({'ok': True, 'message': 'User created/updated'})

# ============================================================
#  API: БАЛАНС
# ============================================================

@app.route('/api/balance/<int:user_id>', methods=['GET'])
def get_balance(user_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT balance FROM users WHERE user_id = %s', (user_id,))
    result = cursor.fetchone()
    conn.close()
    return jsonify({'balance': result[0] if result else 0})

@app.route('/api/balance/<int:user_id>', methods=['POST'])
def update_balance(user_id):
    data = request.json
    new_balance = data.get('balance', 0)
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE users SET balance = %s WHERE user_id = %s
    ''', (new_balance, user_id))
    conn.commit()
    conn.close()
    return jsonify({'balance': new_balance})

# ============================================================
#  API: ИСТОРИЯ ИГР
# ============================================================

@app.route('/api/history/<int:user_id>', methods=['GET'])
def get_history(user_id):
    limit = request.args.get('limit', 20, type=int)
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute('''
        SELECT game_type, bet, win_amount, multiplier, result, played_at
        FROM game_history 
        WHERE user_id = %s
        ORDER BY played_at DESC
        LIMIT %s
    ''', (user_id, limit))
    result = cursor.fetchall()
    conn.close()
    return jsonify(result)

@app.route('/api/history', methods=['POST'])
def add_history():
    data = request.json
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO game_history (user_id, game_type, bet, win_amount, multiplier, result)
        VALUES (%s, %s, %s, %s, %s, %s)
    ''', (data['user_id'], data['game_type'], data['bet'], 
          data['win_amount'], data['multiplier'], data['result']))
    conn.commit()
    conn.close()
    return jsonify({'ok': True})

# ============================================================
#  API: ДОСТИЖЕНИЯ
# ============================================================

@app.route('/api/achievements/<int:user_id>', methods=['GET'])
def get_achievements(user_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT achievement_id FROM achievements WHERE user_id = %s
    ''', (user_id,))
    result = cursor.fetchall()
    conn.close()
    return jsonify([row[0] for row in result])

@app.route('/api/achievements', methods=['POST'])
def add_achievement():
    data = request.json
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO achievements (user_id, achievement_id)
        VALUES (%s, %s)
        ON CONFLICT DO NOTHING
    ''', (data['user_id'], data['achievement_id']))
    conn.commit()
    conn.close()
    return jsonify({'ok': True})

# ============================================================
#  API: NFT КОЛЛЕКЦИЯ
# ============================================================

@app.route('/api/nft/<int:user_id>', methods=['GET'])
def get_nft_collection(user_id):
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute('''
        SELECT nft_id, nft_title, nft_rarity, nft_price, nft_icon, bought_at
        FROM nft_collection 
        WHERE user_id = %s
        ORDER BY bought_at DESC
    ''', (user_id,))
    result = cursor.fetchall()
    conn.close()
    return jsonify(result)

@app.route('/api/nft', methods=['POST'])
def add_nft():
    data = request.json
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO nft_collection (user_id, nft_id, nft_title, nft_rarity, nft_price, nft_icon)
        VALUES (%s, %s, %s, %s, %s, %s)
    ''', (data['user_id'], data['nft_id'], data['nft_title'], 
          data['nft_rarity'], data['nft_price'], data['nft_icon']))
    conn.commit()
    conn.close()
    return jsonify({'ok': True})

# ============================================================
#  TELEGRAM WEBHOOK
# ============================================================

@app.route('/webhook', methods=['POST'])
def webhook():
    data = request.json
    print(f'📩 Получено обновление: {data}')
    return jsonify({'ok': True})

# ============================================================
#  ГЛАВНАЯ СТРАНИЦА
# ============================================================

@app.route('/')
def home():
    return jsonify({
        'status': 'GiftArcade bot is running!',
        'database': 'PostgreSQL connected',
        'tables': ['users', 'achievements', 'purchases', 'game_history', 'nft_collection']
    })

# ============================================================
#  ЗАПУСК
# ============================================================

if __name__ == '__main__':
    init_db()
    print('🤖 GiftArcade Bot is running!')
    print('🗄️ PostgreSQL connected!')
    app.run(host='0.0.0.0', port=5000)
