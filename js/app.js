// ============================================================
//  ГЛАВНОЕ ПРИЛОЖЕНИЕ (App) — TON ЭКОНОМИКА
// ============================================================
const App = {
    // СОСТОЯНИЕ
    user: { name: 'Игрок', status: '🟢 В сети', badge: '🏅' },
    telegramUser: null,
    balance: 0, // Баланс в TON (начинается с 0)
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
    currentFilter: 'all',
    walletAddress: null,
    walletConnected: false,
    user_id: null,
    
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
    
    // ТОВАРЫ МАГАЗИНА (в TON)
    shopItems: {
        bonus: [
            { id: 'b1', title: 'x2 Бустер', desc: 'Удваивает выигрыш в 5 играх', icon: '⚡', price: 0.5, amount: 1, tag: '🔥' },
            { id: 'b2', title: 'x3 Бустер', desc: 'Утраивает выигрыш в 3 играх', icon: '💫', price: 1, amount: 1 },
            { id: 'b3', title: 'Счастливый билет', desc: '+50% к удаче в следующей игре', icon: '🍀', price: 0.3, amount: 1 }
        ],
        badges: [
            { id: 'bg1', title: 'Кибер-панк', desc: 'Эксклюзивный бейдж', icon: '🤖', price: 0.7, tag: '🔥' },
            { id: 'bg2', title: 'Космонавт', desc: 'Эксклюзивный бейдж', icon: '🚀', price: 0.5 },
            { id: 'bg3', title: 'Маг', desc: 'Эксклюзивный бейдж', icon: '🧙', price: 1, tag: '🔥' }
        ],
        premium: [
            { id: 'p1', title: 'Премиум 1 мес', desc: 'x2 бонус ко всем выигрышам', icon: '👑', price: 2, tag: '🔥' },
            { id: 'p2', title: 'Премиум 3 мес', desc: 'x2 бонус + эксклюзивный бейдж', icon: '👑', price: 5, tag: '🔥' }
        ],
        market: [
            { 
                id: 'm1', 
                title: '🎨 Космический кот', 
                rarity: 'rare',
                icon: 'https://cdn-icons-png.flaticon.com/512/10417/10417118.png',
                price: 2,
                model: 'Космический кот',
                backdrop: 'Галактика',
                number: '#0427'
            },
            { 
                id: 'm2', 
                title: '💎 Алмазный дракон', 
                rarity: 'legendary',
                icon: 'https://cdn-icons-png.flaticon.com/512/10417/10417085.png',
                price: 6,
                model: 'Алмазный дракон',
                backdrop: 'Золотой',
                number: '#0001'
            },
            { 
                id: 'm3', 
                title: '🌌 Галактика', 
                rarity: 'epic',
                icon: 'https://cdn-icons-png.flaticon.com/512/10417/10417074.png',
                price: 3.5,
                model: 'Галактика',
                backdrop: 'Космос',
                number: '#0159'
            },
            { 
                id: 'm4', 
                title: '🔥 Огненный феникс', 
                rarity: 'epic',
                icon: 'https://cdn-icons-png.flaticon.com/512/10417/10417118.png',
                price: 4.5,
                model: 'Огненный феникс',
                backdrop: 'Пламя',
                number: '#0082'
            },
            { 
                id: 'm5', 
                title: '🌊 Водный дракон', 
                rarity: 'rare',
                icon: 'https://cdn-icons-png.flaticon.com/512/10417/10417085.png',
                price: 2.5,
                model: 'Водный дракон',
                backdrop: 'Океан',
                number: '#0317'
            },
            { 
                id: 'm6', 
                title: '⚡ Молниеносный тигр', 
                rarity: 'legendary',
                icon: 'https://cdn-icons-png.flaticon.com/512/10417/10417074.png',
                price: 8,
                model: 'Молниеносный тигр',
                backdrop: 'Гроза',
                number: '#0007'
            }
        ]
    },
    
    currentShopTab: 'bonus',
    
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
            this.user_id = user.id;
            this.user.name = user.first_name + (user.last_name ? ' ' + user.last_name : '');
            document.getElementById('welcomeName').textContent = '👋 Привет, ' + this.user.name + '!';
            
            if (user.photo_url) {
                document.getElementById('userAvatar').innerHTML = 
                    `<img src="${user.photo_url}" alt="avatar" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
            }
            
            document.getElementById('authOverlay').classList.remove('show');
            this.showNotification('✅', 'Добро пожаловать!', 'Вы вошли через Telegram');
            this.loadUserData();
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
            this.user_id = 123456;
            this.user.name = 'Демо Игрок';
            document.getElementById('welcomeName').textContent = '👋 Привет, ' + this.user.name + '!';
            document.getElementById('authOverlay').classList.remove('show');
            this.showNotification('ℹ️', 'Демо-режим', 'Telegram WebApp не обнаружен');
            this.loadUserData();
            this.updateUI();
        }
    },
    
    // ============================================================
    //  ЗАГРУЗКА ДАННЫХ С БЭКЕНДА
    // ============================================================
    async loadUserData() {
        try {
            const response = await fetch(`https://giftmarket-demo.onrender.com/api/user/${this.user_id}`);
            const data = await response.json();
            
            if (data.ok) {
                this.balance = data.user.balance / 100; // Переводим из копеек в TON
                this.totalGames = data.user.total_games;
                this.wins = data.user.wins;
                this.gifts = data.user.gifts;
                this.isPremium = data.user.is_premium;
                this.user.badge = data.user.badge;
                this.user.status = data.user.status;
            } else {
                // Создаём пользователя
                await this.createUser();
            }
        } catch (error) {
            console.log('ℹ️ Бэкенд не доступен, используем локальные данные');
            this.balance = 1; // 1 TON для демо
        }
        this.updateUI();
    },
    
    async createUser() {
        try {
            await fetch(`https://giftmarket-demo.onrender.com/api/user/${this.user_id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: this.telegramUser?.username || '',
                    first_name: this.telegramUser?.first_name || '',
                    last_name: this.telegramUser?.last_name || ''
                })
            });
            this.balance = 0;
        } catch (error) {
            console.log('ℹ️ Ошибка создания пользователя');
        }
    },
    
    // ============================================================
    //  БАЛАНС
    // ============================================================
    async addBalance(amount) {
        try {
            const response = await fetch('https://giftmarket-demo.onrender.com/api/balance/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: this.user_id,
                    amount: Math.round(amount * 100) // Переводим в копейки
                })
            });
            const data = await response.json();
            this.balance = data.balance / 100;
            this.showNotification('💎', `+${amount} TON`, 'Баланс пополнен');
            playSound('bonus');
            this.updateUI();
        } catch (error) {
            this.showNotification('❌', 'Ошибка', 'Не удалось обновить баланс');
        }
    },
    
    // ============================================================
    //  ПОКУПКА
    // ============================================================
    buyItem(category, itemId) {
        const item = this.shopItems[category]?.find(i => i.id === itemId);
        if (!item) return;
        
        if (this.balance < item.price) {
            this.showNotification('❌', 'Недостаточно TON', 'Пополните баланс');
            return;
        }
        
        this.balance -= item.price;
        this.showNotification('🎉', 'Покупка успешна!', `${item.title} куплен`);
        playSound('bonus');
        this.updateUI();
        this.renderShopItems(this.currentShopTab);
        this.savePurchase(item);
    },
    
    async savePurchase(item) {
        try {
            await fetch('https://giftmarket-demo.onrender.com/api/purchase', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: this.user_id,
                    item_id: item.id,
                    category: this.currentShopTab,
                    price: Math.round(item.price * 100)
                })
            });
        } catch (error) {
            console.log('ℹ️ Ошибка сохранения покупки');
        }
    },
    
    // ============================================================
    //  ОБНОВЛЕНИЕ UI
    // ============================================================
    updateUI() {
        document.getElementById('userBalance').textContent = this.balance.toFixed(2);
        document.getElementById('winsCount').textContent = this.wins;
        document.getElementById('totalGames').textContent = this.totalGames;
        document.getElementById('giftsCount').textContent = this.gifts;
        document.getElementById('userName').textContent = this.user.name;
        document.getElementById('userSub').textContent = this.user.status;
        document.getElementById('profileBadge').textContent = this.user.badge;
        document.getElementById('statusDisplay').textContent = this.user.status;
    },
    
    // ============================================================
    //  ОСТАЛЬНЫЕ МЕТОДЫ
    // ============================================================
    showNotification(icon, title, desc) { showNotification(icon, title, desc); },
    toggleTheme() { toggleTheme(this); },
    setBg(bg) { setBg(this, bg); },
    showNftCollection() { this.showPage('nft'); this.renderNftCollection(); },
    filterMarket(filter) { this.currentFilter = filter; this.renderMarket(); },
    openCase(category, itemId) { /* Логика кейсов */ },
    playPlinko() { playPlinko(this); },
    coinFlip(choice) { coinFlip(this, choice); },
    startCrash() { startCrash(this); },
    crashAction() { crashAction(this); },
    
    // ============================================================
    //  ИНИЦИАЛИЗАЦИЯ
    // ============================================================
    init() {
        loadTheme(this);
        loadBg(this);
        this.renderGames();
        renderAchievements(this);
        this.renderShopItems('bonus');
        this.updateUI();
        
        if (window.Telegram && window.Telegram.WebApp) {
            setTimeout(() => this.authViaTelegram(), 500);
        } else {
            document.getElementById('authOverlay').classList.add('show');
        }
        
        // Навигация
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', function() {
                const page = this.dataset.page;
                App.showPage(page);
                document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
                this.classList.add('active');
                playSound('click');
            });
        });
        
        console.log('🎮 GiftArcade v3.0 — TON Экономика!');
        console.log('💎 Валюта: TON');
    }
};

// ============================================================
//  ЗАПУСК
// ============================================================
document.addEventListener('DOMContentLoaded', () => App.init());
