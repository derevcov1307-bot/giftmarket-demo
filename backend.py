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

app = Flask(__name__)
CORS(app)

# ============================================================
#  КОНФИГУРАЦИЯ
# ============================================================

BOT_TOKEN = os.getenv('BOT_TOKEN', '')  # Токен твоего бота
TELEGRAM_API_URL = f'https://api.telegram.org/bot{BOT_TOKEN}'
DB_PATH = 'giftarcade.db'

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
        # Форматируем ответ для фронтенда
        formatted_gifts = []
        for gift in gifts:
            formatted_gifts.append({
                'id': gift.get('id'),
                'title': gift.get('sticker', {}).get('emoji', '🎁'),
                'desc': gift.get('sticker', {}).get('set_name', 'Подарок'),
                'price': gift.get('star_count', 10),
                'total_count': gift.get('total_count'),
                'remaining_count': gift.get('remaining_count')
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
    if not user_balance:
        conn.close()
        return jsonify({'ok': False, 'error': 'Пользователь не найден'}), 404
    
    # Получаем стоимость подарка
    gift_result = send_request('getAvailableGifts')
    gift_price = 10  # Значение по умолчанию
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
#  API: ПРОВЕРКА ОТПРАВКИ ПОДАРКА
# ============================================================

@app.route('/api/gifts/check/<string:gift_id>', methods=['GET'])
def check_gift(gift_id):
    """Проверяет, можно ли отправить подарок пользователю"""
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({'ok': False, 'error': 'Не указан user_id'}), 400
    
    result = send_request('checkCanSendGift', {
        'user_id': user_id,
        'gift_id': gift_id
    })
    
    if result and result.get('ok'):
        return jsonify({'ok': True, 'can_send': result.get('result', False)})
    
    return jsonify({'ok': False, 'error': 'Ошибка проверки'}), 500

# ============================================================
#  API: СТАТИСТИКА ПОДАРКОВ
# ============================================================

@app.route('/api/gifts/stats', methods=['GET'])
def get_gift_stats():
    """Получает статистику по подаркам пользователя"""
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({'ok': False, 'error': 'Не указан user_id'}), 400
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Количество отправленных подарков
    cursor.execute('''
        SELECT COUNT(*) FROM game_history 
        WHERE user_id = ? AND game_type = 'gift'
    ''', (user_id,))
    sent_count = cursor.fetchone()[0]
    
    # Количество полученных подарков
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
#  ЗАПУСК
# ============================================================

if __name__ == '__main__':
    # Проверяем, что токен установлен
    if not BOT_TOKEN:
        print('❌ Ошибка: BOT_TOKEN не найден!')
        print('Установи переменную окружения BOT_TOKEN')
        print('Или укажи токен в коде')
        exit(1)
    
    print('🎮 GiftArcade Backend запущен!')
    print(f'🤖 Бот: {BOT_TOKEN[:10]}...')
    print('📡 Сервер слушает порт 5000')
    print('🔄 Доступные эндпоинты:')
    print('  GET  /api/gifts/available - список подарков')
    print('  POST /api/gifts/send     - отправить подарок')
    print('  GET  /api/gifts/check    - проверить отправку')
    print('  GET  /api/gifts/stats    - статистика')
    app.run(host='0.0.0.0', port=5000, debug=True)
