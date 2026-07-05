// ============================================================
//  ГЛАВНОЕ ПРИЛОЖЕНИЕ (App) — NFT
// ============================================================
const App = {
    // СОСТОЯНИЕ
    user: { name: 'Игрок', status: '🟢 В сети', badge: '🏅' },
    telegramUser: null,
    balance: 1000,
    totalGames: 0,
    wins: 0,
    gifts: 0,
    darkTheme: true,
    currentBg: 'dark',
    playedGames: new Set(),
    achievements: ACHIEVEMENTS_DATA,
    purchasedBadges: [],
    isPremium: false,
    boosters: { x2: 0, x3: 0 },
    
    // ИГРЫ
    games: [
        { 
            id: 'plinko', 
            title: 'Plinko', 
            desc: 'Шарик в ячейки с множителями', 
            icon: 'https://rabbits.gift/assets/plinko2.webp',
            status: '🔥' 
        },
        { 
            id: 'coinflip', 
            title: 'Coin Flip', 
            desc: 'Орёл или решка — удвой ставку', 
            icon: 'https://rabbits.gift/assets/coin.webp',
            status: '' 
        },
        { 
            id: 'crash', 
            title: 'Crash', 
            desc: 'Забери выигрыш до падения', 
            icon: 'https://cdn-icons-png.flaticon.com/512/10417/10417074.png',
            status: '🔥' 
        }
    ],
    
    // ТОВАРЫ МАГАЗИНА
    shopItems: {
        stars: [
            { id: 's1', title: '100 звёзд', desc: 'Для ставок и покупок', icon: '⭐', price: 1, amount: 100 },
            { id: 's2', title: '500 звёзд', desc: 'Для ставок и покупок', icon: '⭐', price: 5, amount: 500, tag: '🔥' },
            { id: 's3', title: '1000 звёзд', desc: 'Для ставок и покупок', icon: '⭐', price: 10, amount: 1000 },
            { id: 's4', title: '5000 звёзд', desc: 'Для ставок и покупок', icon: '⭐', price: 40, amount: 5000, tag: '🔥' },
            { id: 's5', title: '10000 звёзд', desc: 'Для ставок и покупок', icon: '⭐', price: 75, amount: 10000, tag: '🔥' }
        ],
        bonus: [
            { id: 'b1', title: 'x2 Бустер', desc: 'Удваивает выигрыш в 5 играх', icon: '⚡', price: 15, amount: 1, tag: '🔥' },
            { id: 'b2', title: 'x3 Бустер', desc: 'Утраивает выигрыш в 3 играх', icon: '💫', price: 25, amount: 1 },
            { id: 'b3', title: 'Счастливый билет', desc: '+50% к удаче в следующей игре', icon: '🍀', price: 10, amount: 1 }
        ],
        badges: [
            { id: 'bg1', title: 'Кибер-панк', desc: 'Эксклюзивный бейдж', icon: '🤖', price: 20, tag: '🔥' },
            { id: 'bg2', title: 'Космонавт', desc: 'Эксклюзивный бейдж', icon: '🚀', price: 15 },
            { id: 'bg3', title: 'Маг', desc: 'Эксклюзивный бейдж', icon: '🧙', price: 25, tag: '🔥' }
        ],
        premium: [
            { id: 'p1', title: 'Премиум 1 мес', desc: 'x2 бонус ко всем выигрышам', icon: '👑', price: 50, tag: '🔥' },
            { id: 'p2', title: 'Премиум 3 мес', desc: 'x2 бонус + эксклюзивный бейдж', icon: '👑', price: 120, tag: '🔥' }
        ],
        gifts: [
            { id: 'g1', title: '💎 Алмаз', desc: 'Блестящий подарок', icon: '💎', price: 10 },
            { id: 'g2', title: '🌹 Роза', desc: 'Красивый цветок', icon: '🌹', price: 5 },
            { id: 'g3', title: '🎂 Торт', desc: 'Сладкий подарок', icon: '🎂', price: 8 },
            { id: 'g4', title: '🎈 Воздушный шар', desc: 'Праздничный подарок', icon: '🎈', price: 3 },
            { id: 'g5', title: '⭐ Золотая звезда', desc: 'Особый подарок', icon: '⭐', price: 15 },
            { id: 'g6', title: '🎁 Подарочная коробка', desc: 'Сюрприз внутри!', icon: '🎁', price: 20 }
        ],
        cases: [
            { 
                id: 'c1', 
                title: '📦 Обычный кейс', 
                desc: 'Призы: x1, x2, x5', 
                icon: 'https://cdn-icons-png.flaticon.com/512/10417/10417118.png',
                price: 10, 
                rewards: [1, 2, 5] 
            },
            { 
                id: 'c2', 
                title: '🎁 Редкий кейс', 
                desc: 'Призы: x5, x10, x25', 
                icon: 'https://cdn-icons-png.flaticon.com/512/10417/10417085.png',
                price: 30, 
                rewards: [5, 10, 25], 
                tag: '🔥' 
            },
            { 
                id: 'c3', 
                title: '💎 Легендарный кейс', 
                desc: 'Призы: x25, x50, x100', 
                icon: 'https://cdn-icons-png.flaticon.com/512/10417/10417074.png',
                price: 80, 
                rewards: [25, 50, 100], 
                tag: '🔥' 
            }
        ],
        nft: [
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
        ]
    },
    
    currentShopTab: 'stars',
    
    // ============================================================
    //  АВТОРИЗАЦИЯ
    // ============================================================
    authViaTelegram() {
        try {
            const tg = window.Telegram.WebApp;
            tg.expand();
            const user = tg.initDataUnsafe?.user || {
                id: 123456,
                first_name: 'Игрок',
                last_name: '',
                username: 'player',
                photo_url: null
            };
            
            this.telegramUser = user;
            this.user.name = user.first_name + (user.last_name ? ' ' + user.last_name : '');
            document.getElementById('welcomeName').textContent = '👋 Привет, ' + this.user.name + '!';
            
            if (user.photo_url) {
                document.getElementById('userAvatar').innerHTML = 
                    `<img src="${user.photo_url}" alt="avatar" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
            }
            
            document.getElementById('authOverlay').classList.remove('show');
            this.showNotification('✅', 'Добро пожаловать!', 'Вы вошли через Telegram');
            this.updateUI();
            playSound('bonus');
            
        } catch (e) {
            this.telegramUser = {
                id: 123456,
                first_name: 'Демо',
                last_name: 'Игрок',
                username: 'demo_player',
                photo_url: null
            };
            this.user.name = 'Демо Игрок';
            document.getElementById('welcomeName').textContent = '👋 Привет, ' + this.user.name + '!';
            document.getElementById('authOverlay').classList.remove('show');
            this.showNotification('ℹ️', 'Демо-режим', 'Telegram WebApp не обнаружен');
            this.updateUI();
        }
    },
    
    // ============================================================
    //  ЕЖЕДНЕВНЫЙ БОНУС
    // ============================================================
    getDailyBonus() {
        const today = new Date().toDateString();
        const lastBonus = localStorage.getItem('lastBonus');
        const bonusAmount = 100;
        
        if (lastBonus !== today) {
            this.balance += bonusAmount;
            localStorage.setItem('lastBonus', today);
            this.showNotification('🎁', 'Ежедневный бонус!', `+${bonusAmount}⭐`);
            playSound('bonus');
            this.updateUI();
            return true;
        } else {
            this.showNotification('⏳', 'Уже получали', 'Воз
