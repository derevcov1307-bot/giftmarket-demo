# ============================================================
#  БЭКЕНД ДЛЯ GIFTARCADE (backend.py)
#  Обработка Telegram Gifts через Bot API
# ============================================================

from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
import json
import sqlite3
from datetime import datetime
from dotenv import load_dotenv

# Загружаем переменные из .env
load_dotenv()

app = Flask(__name__)
CORS(app)

# ============================================================
#  КОНФИГУРАЦИЯ
# ============================================================

BOT_TOKEN = os.getenv('BOT_TOKEN')
TELEGRAM_API_URL = f'https://api.telegram.org/bot{BOT_TOKEN}'
DB_PATH = 'giftarcade.db'

# ============================================================
#  ПРОВЕРКА ТОКЕНА
# ============================================================

if not BOT_TOKEN:
    print('❌ ОШИБКА: BOT_TOKEN не найден!')
    print('📝 Создай файл .env и добавь: BOT_TOKEN=твой_токен')
    print('📝 Или укажи токен в коде: BOT_TOKEN = "твой_токен"')
    exit(1)

print(f'✅ Токен загружен: {BOT_TOKEN[:10]}...')

# ============================================================
#  ИНИЦИАЛИЗАЦИЯ БАЗЫ ДАННЫХ
# ============================================================

def init_db():
    """Создаёт таблицы, если их нет"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Таблица пользователей
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            user_id INTEGER PRIMARY KEY,
            username TEXT,
            first_name TEXT,
            last_name TEXT,
            balance INTEGER DEFAULT 1000,
            total_games INTEGER DEFAULT 0,
            wins INTEGER DEFAULT 0,
            gifts INTEGER DEFAULT 0,
            is_premium BOOLEAN DEFAULT 0,
            badge TEXT DEFAULT '🏅',
            status TEXT DEFAULT '🟢 В сети',
            joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Таблица истории игр
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS game_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            game_type TEXT,
            bet INTEGER,
            win_amount INTEGER,
            multiplier REAL,
            result TEXT,
            played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()
    print('✅ База данных инициализирована')

# ============================================================
#  РАБОТА С БОТОМ
# ============================================================

def send_request(method, params=None):
    """Отправляет запрос к Telegram Bot API"""
    url = f'{TELEGRAM_API_URL}/{method}'
    try:
        response = requests.post(url, json=params or {}, timeout=10)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f'❌ Ошибка запроса к Telegram API: {e}')
        return {'ok': False, 'error': str(e)}

# ============================================================
#  API: ПОЛУЧИТЬ СПИСОК ПОДАРКОВ
# ============================================================

@app.route('/api/gifts/available', methods=['GET'])
def get_available_gifts():
    """Получает список доступных подарков из Telegram"""
    result = send_request('getAvailableGifts')
    
    if result and result.get('ok'):
        gifts = result.get('result', {}).get('gifts', [])
        formatted_gifts = []
        for gift in gifts:
            formatted_gifts.append({
                'id': gift.get('id'),
                'title': gift.get('sticker', {}).get('emoji', '🎁'),
                'desc': gift.get('sticker', {}).get('set_name', 'Подарок'),
                'price': gift.get('star_count', 10),
                'total_count': gift.get('total_count', 0),
                'remaining_count': gift.get('remaining_count', 0)
            })
        return jsonify({'ok': True, 'gifts': formatted_gifts})
    
    return jsonify({'ok': False, 'error': 'Не удалось получить список подарков'}), 500

# ============================================================
#  API: ОТПРАВИТЬ ПОДАРОК
# ============================================================

@app.route('/api/gifts/send', methods=['POST'])
def send_gift():
    """Отправляет подарок пользователю"""
    data = request.json
    user_id = data.get('user_id')
    gift_id = data.get('gift_id')
    recipient_id = data.get('recipient_id')
    text = data.get('text', '🎁 Поздравляю! Подарок от GiftArcade!')
    pay_for_upgrade = data.get('pay_for_upgrade', False)
    
    if not all([user_id, gift_id, recipient_id]):
        return jsonify({'ok': False, 'error': 'Не все параметры указаны'}), 400
    
    # 1. Проверяем баланс пользователя
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('SELECT balance FROM users WHERE user_id = ?', (user_id,))
    user_balance = cursor.fetchone()
    
    # Если пользователь не найден — создаём
    if not user_balance:
        cursor.execute('''
            INSERT INTO users (user_id, balance) VALUES (?, 1000)
        ''', (user_id,))
        conn.commit()
        user_balance = (1000,)
    
    # Получаем стоимость подарка
    gift_result = send_request('getAvailableGifts')
    gift_price = 10
    if gift_result and gift_result.get('ok'):
        gifts = gift_result.get('result', {}).get('gifts', [])
        for gift in gifts:
            if gift.get('id') == gift_id:
                gift_price = gift.get('star_count', 10)
                break
    
    if user_balance[0] < gift_price:
        conn.close()
        return jsonify({'ok': False, 'error': 'Недостаточно звёзд'}), 400
    
    # 2. Отправляем подарок через Telegram API
    params = {
        'user_id': recipient_id,
        'gift_id': gift_id,
        'text': text,
        'pay_for_upgrade': pay_for_upgrade
    }
    
    result = send_request('sendGift', params)
    
    if result and result.get('ok'):
        # 3. Списываем звёзды с баланса
        new_balance = user_balance[0] - gift_price
        cursor.execute('''
            UPDATE users 
            SET balance = ?, updated_at = CURRENT_TIMESTAMP
            WHERE user_id = ?
        ''', (new_balance, user_id))
        conn.commit()
        conn.close()
        
        return jsonify({
            'ok': True,
            'message': f'Подарок успешно отправлен пользователю {recipient_id}',
            'new_balance': new_balance,
            'gift_id': gift_id
        })
    
    conn.close()
    return jsonify({'ok': False, 'error': 'Не удалось отправить подарок'}), 500

# ============================================================
#  API: СТАТИСТИКА
# ============================================================

@app.route('/api/gifts/stats', methods=['GET'])
def get_gift_stats():
    """Получает статистику по подаркам пользователя"""
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({'ok': False, 'error': 'Не указан user_id'}), 400
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT COUNT(*) FROM game_history 
        WHERE user_id = ? AND game_type = 'gift'
    ''', (user_id,))
    sent_count = cursor.fetchone()[0]
    
    cursor.execute('''
        SELECT COUNT(*) FROM game_history 
        WHERE user_id = ? AND game_type = 'received_gift'
    ''', (user_id,))
    received_count = cursor.fetchone()[0]
    
    conn.close()
    
    return jsonify({
        'ok': True,
        'sent': sent_count,
        'received': received_count
    })

# ============================================================
#  API: ИНФОРМАЦИЯ О БОТЕ
# ============================================================

@app.route('/api/bot/info', methods=['GET'])
def get_bot_info():
    """Получает информацию о боте"""
    result = send_request('getMe')
    if result and result.get('ok'):
        return jsonify({
            'ok': True,
            'bot': result.get('result', {})
        })
    return jsonify({'ok': False, 'error': 'Не удалось получить информацию о боте'}), 500

# ============================================================
#  ЗАПУСК
# ============================================================

if __name__ == '__main__':
    init_db()
    print('🎮 GiftArcade Backend запущен!')
    print(f'🤖 Бот: {BOT_TOKEN[:10]}...')
    print('📡 Сервер слушает порт 5000')
    print('')
    print('🔄 Доступные эндпоинты:')
    print('  GET  /api/gifts/available  - список подарков')
    print('  POST /api/gifts/send       - отправить подарок')
    print('  GET  /api/gifts/stats      - статистика')
    print('  GET  /api/bot/info         - информация о боте')
    print('')
    print('🚀 Запуск сервера...')
    app.run(host='0.0.0.0', port=5000, debug=True)
