// ============================================================
//  ГЛАВНОЕ ПРИЛОЖЕНИЕ (App)
// ============================================================
const App = {
    // СОСТОЯНИЕ
    user: { name: 'Игрок', status: '🟢 В сети', badge: '🏅' },
    balance: 1000,
    totalGames: 0,
    wins: 0,
    gifts: 0,
    darkTheme: true,
    currentBg: 'dark',
    playedGames: new Set(),
    achievements: ACHIEVEMENTS_DATA,
    
    // ИГРЫ
    games: [
        { id: 'plinko', title: 'Plinko', desc: 'Шарик в ячейки с множителями', icon: '🎲', status: '🔥' },
        { id: 'coinflip', title: 'Coin Flip', desc: 'Орёл или решка — удвой ставку', icon: '🪙', status: '' },
        { id: 'crash', title: 'Crash', desc: 'Забери выигрыш до падения', icon: '📈', status: '🔥' }
    ],
    
    // ============================================================
    //  МЕТОДЫ
    // ============================================================
    showNotification(icon, title, desc) {
        showNotification(icon, title, desc);
    },
    
    toggleTheme() {
        toggleTheme(this);
    },
    
    setBg(bg) {
        setBg(this, bg);
    },
    
    showPage(page) {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        const target = document.getElementById(`page-${page}`);
        if (target) target.classList.add('active');
        
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        const map = { home: 0, profile: 2 };
        if (map[page] !== undefined) {
            document.querySelectorAll('.nav-item')[map[page]].classList.add('active');
        }
    },
    
    goHome() {
        this.showPage('home');
    },
    
    openProfileModal() {
        openProfileModal(this);
    },
    
    saveProfile() {
        saveProfile(this);
    },
    
    openStatusModal() {
        openStatusModal(this);
    },
    
    setStatus(status) {
        setStatus(this, status);
    },
    
    closeModal(id) {
        closeModal(id);
    },
    
    showAbout() {
        showAbout();
    },
    
    addBalance(amount) {
        addBalance(this, amount);
    },
    
    resetBalance() {
        resetBalance(this);
    },
    
    showBalance() {
        showBalance(this);
    },
    
    openBgModal() {
        openBgModal();
    },
    
    // ============================================================
    //  ИГРЫ
    // ============================================================
    renderGames() {
        const list = document.getElementById('gamesList');
        if (!list) return;
        
        list.innerHTML = this.games.map(g => `
            <div class="settings-item" onclick="App.openGame('${g.id}')" style="cursor:pointer;">
                <div class="left">
                    <span class="icon">${g.icon}</span>
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
            case 'plinko':
                content.innerHTML = renderPlinko();
                break;
            case 'coinflip':
                content.innerHTML = renderCoinFlip();
                break;
            case 'crash':
                content.innerHTML = renderCrash();
                break;
        }
        
        this.showPage('game');
    },
    
    playPlinko() {
        playPlinko(this);
    },
    
    coinFlip(choice) {
        coinFlip(this, choice);
    },
    
    startCrash() {
        startCrash(this);
    },
    
    crashAction() {
        crashAction(this);
    },
    
    // ============================================================
    //  ИНИЦИАЛИЗАЦИЯ
    // ============================================================
    init() {
        loadTheme(this);
        loadBg(this);
        this.renderGames();
        renderAchievements(this);
        updateUI(this);
        
        // Эмуляция игры для демонстрации достижений
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
        
        console.log('🎮 GiftArcade v2.2 — Полноценное приложение!');
        console.log('📂 Структура: css/, js/, images/');
        console.log('🎮 Игры: Plinko, Coin Flip, Crash');
        console.log('🏆 Достижения: 6 штук');
        console.log('🎨 Фоны: 3 варианта');
    }
};

// ============================================================
//  ЗАПУСК
// ============================================================
document.addEventListener('DOMContentLoaded', () => App.init());
