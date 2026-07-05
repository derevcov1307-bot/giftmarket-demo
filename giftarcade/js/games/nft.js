// ============================================================
//  NFT-ПОДАРКИ (nft.js)
// ============================================================

// Список доступных NFT-подарков
const NFT_ITEMS = [
    { 
        id: 'nft1', 
        title: '🎨 Космический кот', 
        desc: 'Редкий NFT-подарок', 
        icon: 'https://cdn-icons-png.flaticon.com/512/10417/10417118.png',
        price: 50,
        tag: '🔥'
    },
    { 
        id: 'nft2', 
        title: '💎 Алмазный дракон', 
        desc: 'Легендарный NFT-подарок', 
        icon: 'https://cdn-icons-png.flaticon.com/512/10417/10417085.png',
        price: 150,
        tag: '🔥'
    },
    { 
        id: 'nft3', 
        title: '🌌 Галактика', 
        desc: 'Уникальный NFT-подарок', 
        icon: 'https://cdn-icons-png.flaticon.com/512/10417/10417074.png',
        price: 80
    },
    { 
        id: 'nft4', 
        title: '🔥 Огненный феникс', 
        desc: 'Эксклюзивный NFT-подарок', 
        icon: 'https://cdn-icons-png.flaticon.com/512/10417/10417118.png',
        price: 120,
        tag: '🔥'
    },
    { 
        id: 'nft5', 
        title: '🌊 Водный дракон', 
        desc: 'Уникальный NFT-подарок', 
        icon: 'https://cdn-icons-png.flaticon.com/512/10417/10417085.png',
        price: 60
    }
];

// Функция для отправки NFT-подарка
async function sendNft(app, item) {
    if (app.balance < item.price) {
        app.showNotification('❌', 'Недостаточно звёзд', 'Пополните баланс');
        return false;
    }
    
    const user_id = app.telegramUser?.id || 123456;
    
    try {
        const response = await fetch('http://localhost:5000/api/nft/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: user_id,
                gift_id: item.id,
                recipient_id: user_id,
                text: `🎨 NFT-подарок: ${item.title} от GiftArcade!`
            })
        });
        
        const data = await response.json();
        
        if (data.ok) {
            app.balance = data.new_balance;
            app.gifts++;
            app.showNotification('🎨', 'NFT подарок отправлен!', `${item.title} теперь в вашей коллекции`);
            playSound('bonus');
            app.updateUI();
            return true;
        } else {
            app.showNotification('❌', 'Ошибка', data.error || 'Не удалось отправить NFT');
            return false;
        }
    } catch (error) {
        console.error('Ошибка отправки NFT:', error);
        // Демо-режим
        if (app.balance >= item.price) {
            app.balance -= item.price;
            app.gifts++;
            app.showNotification('🎨', 'NFT куплен (ДЕМО)!', `${item.title} добавлен в коллекцию`);
            playSound('bonus');
            app.updateUI();
            return true;
        }
        return false;
    }
}

// Функция для получения NFT-коллекции пользователя
function getUserNftCollection() {
    // В реальном приложении — запрос к бэкенду
    // Пока возвращаем демо-данные
    return [
        { id: 'nft1', title: '🎨 Космический кот', icon: 'https://cdn-icons-png.flaticon.com/512/10417/10417118.png', price: 50 },
        { id: 'nft3', title: '🌌 Галактика', icon: 'https://cdn-icons-png.flaticon.com/512/10417/10417074.png', price: 80 }
    ];
}
