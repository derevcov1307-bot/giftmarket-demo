// ============================================================
//  ГЛАВНОЕ ПРИЛОЖЕНИЕ (App)
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
        { id: 'plinko', title: 'Plinko', desc: 'Шарик в ячейки с множителями', icon: '🎲', status: '🔥' },
        { id: 'coinflip', title: 'Coin Flip', desc: 'Орёл или решка — удвой ставку', icon: '🪙', status: '' },
        { id: 'crash', title: 'Crash', desc: 'Забери выигрыш до падения', icon: '📈', status: '🔥' }
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
    //  МАГАЗИН
    // ============================================================
    switchShopTab(tab) {
        this.currentShopTab = tab;
        document.querySelectorAll('.shop-tab').forEach(t => {
            t.classList.toggle('active', t.dataset.tab === tab);
        });
        this.renderShopItems(tab);
    },
    
    renderShopItems(tab) {
        const grid = document.getElementById('shopGrid');
        if (!grid) return;
        
        const items = this.shopItems[tab] || [];
        const isOwned = (item) => {
            if (tab === 'badges') return this.purchasedBadges.includes(item.id);
            if (tab === 'premium') return this.isPremium && item.id === 'p1';
            return false;
        };
        
        grid.innerHTML = items.map(item => `
            <div class="shop-item" onclick="App.buyItem('${tab}', '${item.id}')">
                <div class="shop-icon">${item.icon}</div>
                <div class="shop-info">
                    <div class="shop-title">${item.title}</div>
                    <div class="shop-desc">${item.desc}</div>
                    <div class="shop-price">${item.price} ⭐</div>
                </div>
                ${item.tag ? `<span class="shop-tag hot">${item.tag}</span>` : ''}
                <button class="shop-btn" ${isOwned(item) ? 'disabled' : ''}>
                    ${isOwned(item) ? '✅ Куплено' : 'Купить'}
                </button>
            </div>
        `).join('');
    },
    
    buyItem(category, itemId) {
        const item = this.shopItems[category]?.find(i => i.id === itemId);
        if (!item) return;
        
        // Проверяем, есть ли Telegram WebApp
        if (window.Telegram && window.Telegram.WebApp) {
            try {
                const tg = window.Telegram.WebApp;
                tg.openInvoice({
                    title: item.title,
                    description: item.desc,
                    payload: JSON.stringify({ 
                        itemId: item.id, 
                        category: category,
                        amount: item.amount || 0 
                    }),
                    provider_token: '',
                    currency: 'XTR',
                    prices: [{ label: item.title, amount: item.price }]
                });
                this.showNotification('💫', 'Запрос отправлен', 'Ожидайте подтверждение');
                return;
            } catch (e) {}
        }
        
        // Демо-режим
        if (confirm(`Купить "${item.title}" за ${item.price}⭐? (ДЕМО)`)) {
            this.processPurchase(category, itemId, item);
        }
    },
    
    processPurchase(category, itemId, item) {
        // Проверяем баланс
        if (this.balance < item.price) {
            this.showNotification('❌', 'Недостаточно звёзд', 'Пополните баланс в магазине');
            return;
        }
        
        this.balance -= item.price;
        
        switch(category) {
            case 'stars':
                this.balance += item.amount;
                this.showNotification('🎉', `+${item.amount}⭐`, 'Баланс пополнен!');
                break;
            case 'bonus':
                if (item.id === 'b1') this.boosters.x2 += item.amount || 1;
                if (item.id === 'b2') this.boosters.x3 += item.amount || 1;
                if (item.id === 'b3') this.showNotification('🍀', 'Счастливый билет!', '+50% к удаче');
                this.showNotification('🎁', `Куплен: ${item.title}`, 'Бонус активирован!');
                break;
            case 'badges':
                if (!this.purchasedBadges.includes(itemId)) {
                    this.purchasedBadges.push(itemId);
                    this.showNotification('🏅', `Получен бейдж: ${item.title}`, 'Теперь он в твоём профиле!');
                }
                break;
            case 'premium':
                this.isPremium = true;
                this.showNotification('👑', 'Премиум активирован!', 'x2 бонус ко всем выигрышам');
                break;
        }
        
        this.updateUI();
        this.renderShopItems(this.currentShopTab);
    },
    
    // ============================================================
    //  МЕТОДЫ
    // ============================================================
    showNotification(icon, title, desc) { showNotification(icon, title, desc); },
    toggleTheme() { toggleTheme(this); },
    setBg(bg) { setBg(this, bg); },
    
    showPage(page) {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        const target = document.getElementById(`page-${page}`);
        if (target) target.classList.add('active');
        
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        const map = { home: 0, shop: 1, games: 2, profile: 3 };
        if (map[page] !== undefined) {
            const items = document.querySelectorAll('.nav-item');
            if (items[map[page]]) items[map[page]].classList.add('active');
        }
        
        // Обновляем магазин при открытии
        if (page === 'shop') {
            this.renderShopItems(this.currentShopTab);
        }
    },
    
    goHome() { this.showPage('home'); },
    openProfileModal() { openProfileModal(this); },
    saveProfile() { saveProfile(this); },
    openStatusModal() { openStatusModal(this); },
    setStatus(status) { setStatus(this, status); },
    closeModal(id) { closeModal(id); },
    showAbout() { showAbout(); },
    addBalance(amount) { addBalance(this, amount); },
    resetBalance() { resetBalance(this); },
    showBalance() { showBalance(this); },
    openBgModal() { openBgModal(); },
    
    // ============================================================
    //  ИГРЫ
    // ============================================================
    renderGames() {
        const list = document.getElementById('gamesList');
        if (!list) return;
        list.innerHTML = this.games.map(g => `
            <div class="settings-item" onclick="App.openGame('${g.id}')" style="cursor:pointer;">
                <div class="left"><span class="icon">${g.icon}</span>
                    <div class="info"><div class="title">${g.title}</div><div class="desc">${g.desc}</div></div>
                </div>
                <div class="right">${g.status} →</div>
            </div>
        `).join('');
    },
    
    openGame(gameId) {
        const game = this.games.find(g => g.id === gameId);
        if (!game) return;
        const content = document.getElementById('gameContent');
        if (!content) return;
        switch(gameId) {
            case 'plinko': content.innerHTML = renderPlinko(); break;
            case 'coinflip': content.innerHTML = renderCoinFlip(); break;
            case 'crash': content.innerHTML = renderCrash(); break;
        }
        this.showPage('game');
    },
    
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
        this.renderShopItems('stars');
        updateUI(this);
        
        if (window.Telegram && window.Telegram.WebApp) {
            setTimeout(() => this.authViaTelegram(), 500);
        } else {
            document.getElementById('authOverlay').classList.add('show');
        }
        
        // Эмуляция игры
        let emuCount = 0;
        const emuInterval = setInterval(() => {
            if (emuCount < 30) {
                this.totalGames++;
                if (Math.random() > 0.5) this.wins++;
                this.playedGames.add(['plinko','coinflip','crash'][Math.floor(Math.random() * 3)]);
                if (emuCount % 5 === 0) this.gifts++;
                updateUI(this);
                checkAchievements(this);
                emuCount++;
            } else {
                clearInterval(emuInterval);
            }
        }, 700);
        
        // Онлайн
        setInterval(() => {
            const el = document.getElementById('onlinePlayers');
            const current = parseInt(el.textContent.replace(/,/g, ''));
            el.textContent = Math.max(100, current + Math.floor(Math.random() * 20) - 5).toLocaleString();
        }, 4000);
        
        // Навигация
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', function() {
                const page = this.dataset.page;
                App.showPage(page);
                document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
                this.classList.add('active');
            });
        });
        
        // Закрытие модалок
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal-overlay.show').forEach(m => m.classList.remove('show'));
            }
        });
        
        document.querySelectorAll('.modal-overlay').forEach(m => {
            m.addEventListener('click', function(e) {
                if (e.target === this) this.classList.remove('show');
            });
        });
        
        console.log('🎮 GiftArcade v2.4 — С магазином!');
        console.log('🛒 Категории: Звёзды, Бонусы, Бейджи, Премиум');
    }
};

// ============================================================
//  ЗАПУСК
// ============================================================
document.addEventListener('DOMContentLoaded', () => App.init());
