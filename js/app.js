// ============================================================
//  ГЛАВНОЕ ПРИЛОЖЕНИЕ (App) — TON + NFT + МАРКЕТ
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
    currentFilter: 'all',
    walletAddress: null,
    walletConnected: false,
    
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
        ],
        market: [
            { 
                id: 'm1', 
                title: '🎨 Космический кот', 
                rarity: 'rare',
                icon: 'https://cdn-icons-png.flaticon.com/512/10417/10417118.png',
                price: 50,
                model: 'Космический кот',
                backdrop: 'Галактика',
                number: '#0427'
            },
            { 
                id: 'm2', 
                title: '💎 Алмазный дракон', 
                rarity: 'legendary',
                icon: 'https://cdn-icons-png.flaticon.com/512/10417/10417085.png',
                price: 150,
                model: 'Алмазный дракон',
                backdrop: 'Золотой',
                number: '#0001'
            },
            { 
                id: 'm3', 
                title: '🌌 Галактика', 
                rarity: 'epic',
                icon: 'https://cdn-icons-png.flaticon.com/512/10417/10417074.png',
                price: 80,
                model: 'Галактика',
                backdrop: 'Космос',
                number: '#0159'
            },
            { 
                id: 'm4', 
                title: '🔥 Огненный феникс', 
                rarity: 'epic',
                icon: 'https://cdn-icons-png.flaticon.com/512/10417/10417118.png',
                price: 120,
                model: 'Огненный феникс',
                backdrop: 'Пламя',
                number: '#0082'
            },
            { 
                id: 'm5', 
                title: '🌊 Водный дракон', 
                rarity: 'rare',
                icon: 'https://cdn-icons-png.flaticon.com/512/10417/10417085.png',
                price: 60,
                model: 'Водный дракон',
                backdrop: 'Океан',
                number: '#0317'
            },
            { 
                id: 'm6', 
                title: '⚡ Молниеносный тигр', 
                rarity: 'legendary',
                icon: 'https://cdn-icons-png.flaticon.com/512/10417/10417074.png',
                price: 200,
                model: 'Молниеносный тигр',
                backdrop: 'Гроза',
                number: '#0007'
            }
        ],
        ton: [
            { 
                id: 'ton1', 
                title: '💎 1 TON', 
                desc: '1 TON = 100 ⭐', 
                icon: '💎', 
                price: 1,
                tonAmount: 1,
                starsAmount: 100,
                tag: '🔥'
            },
            { 
                id: 'ton2', 
                title: '💎 5 TON', 
                desc: '5 TON = 550 ⭐ (бонус 10%)', 
                icon: '💎', 
                price: 5,
                tonAmount: 5,
                starsAmount: 550,
                tag: '🔥'
            },
            { 
                id: 'ton3', 
                title: '💎 10 TON', 
                desc: '10 TON = 1200 ⭐ (бонус 20%)', 
                icon: '💎', 
                price: 10,
                tonAmount: 10,
                starsAmount: 1200,
                tag: '🔥'
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
            this.showNotification('⏳', 'Уже получали', 'Возвращайтесь завтра!');
            return false;
        }
    },
    
    canGetBonus() {
        const today = new Date().toDateString();
        const lastBonus = localStorage.getItem('lastBonus');
        return lastBonus !== today;
    },
    
    // ============================================================
    //  МАГАЗИН
    // ============================================================
    switchShopTab(tab) {
        this.currentShopTab = tab;
        document.querySelectorAll('.shop-tab').forEach(t => {
            t.classList.toggle('active', t.dataset.tab === tab);
        });
        if (tab === 'market') {
            this.renderMarket();
        } else {
            this.renderShopItems(tab);
        }
        playSound('click');
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
        
        let recipientInput = '';
        if (tab === 'gifts') {
            recipientInput = `
                <div style="display:flex;gap:8px;margin-bottom:12px;align-items:center;">
                    <div class="gift-recipient" style="flex:1;margin-bottom:0;">
                        <label>👤 Получатель (Telegram ID)</label>
                        <input type="text" id="giftRecipient" placeholder="Введите Telegram ID получателя">
                    </div>
                    <button onclick="App.refreshGifts()" style="padding:8px 14px;border-radius:10px;border:1px solid var(--border-color);background:var(--bg-card);color:var(--text-primary);cursor:pointer;font-size:13px;margin-top:16px;transition:var(--transition-bounce);white-space:nowrap;">
                        <i data-lucide="refresh-cw" style="width:16px;height:16px;display:inline-block;vertical-align:middle;"></i>
                    </button>
                </div>
            `;
        }
        
        grid.innerHTML = recipientInput + items.map(item => {
            // Определяем, что показывать в иконке
            let iconHtml = '';
            if (tab === 'cases') {
                iconHtml = `
                    <div class="case-preview">
                        <img src="${item.icon}" alt="${item.title}" loading="lazy">
                    </div>
                `;
            } else if (tab === 'nft') {
                iconHtml = `
                    <div class="nft-preview">
                        <img src="${item.icon}" alt="${item.title}" loading="lazy">
                    </div>
                `;
            } else if (tab === 'ton') {
                iconHtml = `<div class="shop-icon">💎</div>`;
            } else {
                iconHtml = `<div class="shop-icon">${item.icon}</div>`;
            }
            
            const isTon = tab === 'ton';
            
            return `
                <div class="shop-item ${tab === 'gifts' ? 'gift-item' : ''}" onclick="${isTon ? '' : `App.buyItem('${tab}', '${item.id}')`}">
                    ${iconHtml}
                    <div class="shop-info">
                        <div class="shop-title">${item.title}</div>
                        <div class="shop-desc">${item.desc}</div>
                        <div class="shop-price">${item.price} ⭐</div>
                    </div>
                    ${item.tag ? `<span class="shop-tag hot">${item.tag}</span>` : ''}
                    <button class="shop-btn" ${isOwned(item) || (isTon && !App.walletConnected) ? 'disabled' : ''} onclick="${isTon ? `App.buyTon(item)` : ''}">
                        ${isOwned(item) ? '✅ Куплено' : tab === 'gifts' ? '📤 Отправить' : tab === 'cases' ? '🎲 Открыть' : tab === 'nft' ? '🎨 Купить NFT' : isTon ? (!App.walletConnected ? '🔒 Подключите кошелёк' : '💳 Оплатить TON') : 'Купить'}
                    </button>
                </div>
            `;
        }).join('');
        
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    },
    
    buyItem(category, itemId) {
        const item = this.shopItems[category]?.find(i => i.id === itemId);
        if (!item) return;
        
        // Кейсы
        if (category === 'cases') {
            this.openCase(category, itemId);
            return;
        }
        
        // NFT
        if (category === 'nft') {
            this.buyNft(item);
            return;
        }
        
        // Подарки
        if (category === 'gifts') {
            const recipient = document.getElementById('giftRecipient')?.value.trim();
            if (!recipient) {
                this.showNotification('⚠️', 'Укажите получателя', 'Введите Telegram ID пользователя');
                return;
            }
            if (this.balance < item.price) {
                this.showNotification('❌', 'Недостаточно звёзд', 'Пополните баланс в магазине');
                return;
            }
            this.sendGift(item, recipient);
            return;
        }
        
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
        
        if (confirm(`Купить "${item.title}" за ${item.price}⭐? (ДЕМО)`)) {
            this.processPurchase(category, itemId, item);
        }
    },
    
    // ============================================================
    //  КЕЙСЫ
    // ============================================================
    openCase(category, itemId) {
        const item = this.shopItems[category]?.find(i => i.id === itemId);
        if (!item) return;
        
        if (this.balance < item.price) {
            this.showNotification('❌', 'Недостаточно звёзд', 'Пополните баланс');
            return;
        }
        
        this.balance -= item.price;
        const reward = item.rewards[Math.floor(Math.random() * item.rewards.length)];
        this.balance += reward;
        this.totalGames++;
        this.showNotification('🎉', 'Кейс открыт!', `Вы выиграли: +${reward}⭐`);
        playSound('win');
        this.updateUI();
        this.renderShopItems(this.currentShopTab);
    },
    
    // ============================================================
    //  ПОКУПКА NFT
    // ============================================================
    buyNft(item) {
        if (this.balance < item.price) {
            this.showNotification('❌', 'Недостаточно звёзд', 'Пополните баланс');
            return;
        }
        
        this.balance -= item.price;
        this.showNotification('🎨', 'NFT куплен!', `${item.title} добавлен в коллекцию`);
        playSound('bonus');
        this.updateUI();
        this.renderShopItems(this.currentShopTab);
    },
    
    // ============================================================
    //  NFT КОЛЛЕКЦИЯ
    // ============================================================
    showNftCollection() {
        this.showPage('nft');
        this.renderNftCollection();
    },
    
    renderNftCollection() {
        const container = document.getElementById('nftCollection');
        const empty = document.getElementById('nftEmpty');
        if (!container) return;
        
        const collection = JSON.parse(localStorage.getItem('nftCollection') || '[]');
        const allNft = this.shopItems.market || [];
        const userNft = allNft.filter(item => collection.includes(item.id));
        
        if (userNft.length === 0) {
            container.innerHTML = '';
            if (empty) empty.style.display = 'block';
            return;
        }
        
        if (empty) empty.style.display = 'none';
        container.innerHTML = userNft.map(nft => `
            <div class="nft-card">
                <div class="nft-image">
                    <img src="${nft.icon}" alt="${nft.title}">
                </div>
                <div class="nft-name">${nft.title}</div>
                <div class="nft-price">⭐ ${nft.price}</div>
                <div class="nft-badges">
                    <span class="nft-badge nft">NFT</span>
                    <span class="nft-badge ${nft.rarity}">${nft.rarity.toUpperCase()}</span>
                </div>
            </div>
        `).join('');
    },
    
    // ============================================================
    //  МАРКЕТ NFT
    // ============================================================
    filterMarket(filter) {
        this.currentFilter = filter;
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        this.renderMarket();
    },
    
    renderMarket() {
        const grid = document.getElementById('marketGrid');
        if (!grid) return;
        
        const items = this.shopItems.market || [];
        const filtered = this.currentFilter === 'all' 
            ? items 
            : items.filter(item => item.rarity === this.currentFilter);
        
        const collection = JSON.parse(localStorage.getItem('nftCollection') || '[]');
        
        grid.innerHTML = filtered.map(item => `
            <div class="market-card">
                <div class="nft-image">
                    <img src="${item.icon}" alt="${item.title}">
                </div>
                <div class="nft-name">${item.title}</div>
                <div class="nft-price">⭐ ${item.price}</div>
                <span class="nft-rarity ${item.rarity}">${item.rarity.toUpperCase()}</span>
                <div class="nft-id">${item.number}</div>
                <button class="buy-btn" onclick="App.buyMarketNft('${item.id}')" ${collection.includes(item.id) ? 'disabled' : ''}>
                    ${collection.includes(item.id) ? '✅ В коллекции' : 'Купить'}
                </button>
            </div>
        `).join('');
    },
    
    buyMarketNft(itemId) {
        const item = this.shopItems.market.find(i => i.id === itemId);
        if (!item) return;
        
        if (this.balance < item.price) {
            this.showNotification('❌', 'Недостаточно звёзд', 'Пополните баланс');
            return;
        }
        
        const collection = JSON.parse(localStorage.getItem('nftCollection') || '[]');
        if (collection.includes(itemId)) {
            this.showNotification('⚠️', 'Уже есть', 'Этот NFT уже в вашей коллекции');
            return;
        }
        
        this.balance -= item.price;
        collection.push(itemId);
        localStorage.setItem('nftCollection', JSON.stringify(collection));
        
        this.showNotification('🎨', 'NFT куплен!', `${item.title} добавлен в коллекцию`);
        playSound('bonus');
        this.updateUI();
        this.renderMarket();
        this.renderNftCollection();
    },
    
    // ============================================================
    //  TON КОШЕЛЁК
    // ============================================================
    async connectWallet() {
        try {
            if (this.walletConnected) {
                this.showNotification('ℹ️', 'Кошелёк уже подключён', this.walletAddress);
                return;
            }
            
            // В реальном приложении здесь будет TON Connect
            const address = 'EQD' + Math.random().toString(36).substring(2, 10) + '...';
            
            this.walletAddress = address;
            this.walletConnected = true;
            
            document.getElementById('walletStatus').textContent = '✅ Подключён';
            document.getElementById('walletAddress').textContent = address.slice(0, 6) + '...' + address.slice(-4);
            
            this.showNotification('✅', 'Кошелёк подключён!', address.slice(0, 6) + '...' + address.slice(-4));
            playSound('bonus');
            
            localStorage.setItem('walletAddress', address);
            localStorage.setItem('walletConnected', 'true');
            
            this.renderShopItems(this.currentShopTab);
            
        } catch (error) {
            console.error('Ошибка подключения кошелька:', error);
            this.showNotification('❌', 'Ошибка подключения', 'Попробуйте позже');
        }
    },
    
    disconnectWallet() {
        this.walletAddress = null;
        this.walletConnected = false;
        
        document.getElementById('walletStatus').textContent = 'Не подключён';
        document.getElementById('walletAddress').textContent = '→';
        
        localStorage.removeItem('walletAddress');
        localStorage.removeItem('walletConnected');
        
        this.showNotification('ℹ️', 'Кошелёк отключён', '');
        this.renderShopItems(this.currentShopTab);
    },
    
    loadWallet() {
        const address = localStorage.getItem('walletAddress');
        const connected = localStorage.getItem('walletConnected') === 'true';
        
        if (address && connected) {
            this.walletAddress = address;
            this.walletConnected = true;
            
            document.getElementById('walletStatus').textContent = '✅ Подключён';
            document.getElementById('walletAddress').textContent = address.slice(0, 6) + '...' + address.slice(-4);
        }
    },
    
    // ============================================================
    //  ПОПОЛНЕНИЕ В TON
    // ============================================================
    buyTon(item) {
        if (!this.walletConnected) {
            this.showNotification('⚠️', 'Подключите кошелёк', 'Сначала подключите TON кошелёк в настройках');
            return;
        }
        
        this.showNotification('💎', 'Оплата TON', `Отправьте ${item.tonAmount} TON на адрес:`);
        this.showNotification('📋', 'Адрес', this.walletAddress);
        this.showNotification('⏳', 'Ожидание...', 'После оплаты баланс пополнится автоматически');
        
        // Демо-пополнение
        setTimeout(() => {
            this.balance += item.starsAmount;
            this.showNotification('🎉', 'Пополнение успешно!', `+${item.starsAmount}⭐`);
            playSound('bonus');
            this.updateUI();
            this.renderShopItems(this.currentShopTab);
        }, 3000);
    },
    
    // ============================================================
    //  ОТПРАВКА ПОДАРКА
    // ============================================================
    async sendGift(item, recipient) {
        if (this.balance < item.price) {
            this.showNotification('❌', 'Недостаточно звёзд', 'Пополните баланс');
            return;
        }
        
        const user_id = this.telegramUser?.id || 123456;
        
        try {
            const response = await fetch('http://localhost:5000/api/gifts/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: user_id,
                    gift_id: item.id,
                    recipient_id: parseInt(recipient),
                    text: `🎁 Подарок от ${this.user.name}!`
                })
            });
            
            const data = await response.json();
            
            if (data.ok) {
                this.balance = data.new_balance;
                this.gifts++;
                this.showNotification('🎁', 'Подарок отправлен!', `Пользователю ${recipient}`);
                playSound('bonus');
                this.updateUI();
                this.renderShopItems(this.currentShopTab);
            } else {
                this.showNotification('❌', 'Ошибка', data.error || 'Не удалось отправить подарок');
            }
        } catch (error) {
            console.error('Ошибка отправки подарка:', error);
            if (this.balance >= item.price) {
                this.balance -= item.price;
                this.gifts++;
                this.showNotification('🎁', 'Подарок отправлен (ДЕМО)', `Пользователю ${recipient}`);
                playSound('bonus');
                this.updateUI();
                this.renderShopItems(this.currentShopTab);
            }
        }
    },
    
    // ============================================================
    //  ПОЛУЧЕНИЕ ПОДАРКОВ ИЗ TELEGRAM
    // ============================================================
    async fetchTelegramGifts() {
        try {
            const response = await fetch('http://localhost:5000/api/gifts/available');
            const data = await response.json();
            
            if (data.ok && data.gifts.length > 0) {
                const telegramGifts = data.gifts.map(g => ({
                    id: g.id,
                    title: g.title || '🎁 Подарок',
                    desc: `Осталось: ${g.remaining_count || 0} из ${g.total_count || 0}`,
                    icon: g.title || '🎁',
                    price: g.price || 10,
                    tag: g.remaining_count < 10 ? '🔥' : ''
                }));
                
                this.shopItems.gifts = telegramGifts;
                this.renderShopItems(this.currentShopTab);
                return true;
            }
            return false;
        } catch (error) {
            console.log('ℹ️ Бэкенд не доступен, используем демо-подарки');
            return false;
        }
    },
    
    async refreshGifts() {
        this.showNotification('🔄', 'Обновление...', 'Загружаем список подарков');
        await this.fetchTelegramGifts();
        this.showNotification('✅', 'Готово!', 'Список подарков обновлён');
    },
    
    // ============================================================
    //  ОБРАБОТКА ПОКУПКИ
    // ============================================================
    processPurchase(category, itemId, item) {
        if (this.balance < item.price) {
            this.showNotification('❌', 'Недостаточно звёзд', 'Пополните баланс в магазине');
            return;
        }
        
        this.balance -= item.price;
        playSound('click');
        
        switch(category) {
            case 'stars':
                this.balance += item.amount;
                this.showNotification('🎉', `+${item.amount}⭐`, 'Баланс пополнен!');
                playSound('bonus');
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
        const map = { home: 0, shop: 1, market: 2, games: 3, profile: 4 };
        if (map[page] !== undefined) {
            const items = document.querySelectorAll('.nav-item');
            if (items[map[page]]) items[map[page]].classList.add('active');
        }
        
        if (page === 'shop') {
            this.renderShopItems(this.currentShopTab);
        }
        if (page === 'market') {
            this.renderMarket();
        }
        
        if (typeof lucide !== 'undefined') {
            setTimeout(() => lucide.createIcons(), 50);
        }
    },
    
    goHome() { this.showPage('home'); },
    openProfileModal() { openProfileModal(this); },
    saveProfile() { saveProfile(this); },
    openStatusModal() { openStatusModal(this); },
    setStatus(status) { setStatus(this, status); },
    closeModal(id) { closeModal(id); },
    showAbout() { showAbout(); },
    addBalance(amount) { 
        addBalance(this, amount);
        playSound('bonus');
    },
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
                <div class="left">
                    <div class="game-icon-wrapper">
                        <img src="${g.icon}" alt="${g.title}" loading="lazy">
                    </div>
                    <div class="info">
                        <div class="title">${g.title}</div>
                        <div class="desc">${g.desc}</div>
                    </div>
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
        playSound('click');
        
        if (typeof lucide !== 'undefined') {
            setTimeout(() => lucide.createIcons(), 100);
        }
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
        this.loadWallet();
        this.renderGames();
        renderAchievements(this);
        this.renderShopItems('stars');
        updateUI(this);
        
        if (window.Telegram && window.Telegram.WebApp) {
            setTimeout(() => this.authViaTelegram(), 500);
        } else {
            document.getElementById('authOverlay').classList.add('show');
        }
        
        setTimeout(() => {
            this.fetchTelegramGifts();
        }, 1000);
        
        if (typeof lucide !== 'undefined') {
            setTimeout(() => lucide.createIcons(), 200);
        }
        
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
                playSound('click');
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
        
        console.log('🎮 GiftArcade v2.6 — TON + NFT + Маркет!');
        console.log('🛒 Категории: Звёзды, Бонусы, Бейджи, Премиум, Подарки, Кейсы, NFT, Маркет, TON');
        console.log('💎 Пополнение в TON: 1 TON = 100⭐, 5 TON = 550⭐, 10 TON = 1200⭐');
        console.log('🔗 TON Кошелёк: подключение в настройках');
    }
};

// ============================================================
//  ЗАПУСК
// ============================================================
document.addEventListener('DOMContentLoaded', () => App.init());
