// ============================================================
//  ИГРА: CRASH
// ============================================================
let crashRunning = false;
let crashMultiplier = 1;
let crashInterval = null;

function renderCrash() {
    return `
        <div class="game-page-container">
            <div class="game-title">📈 Crash</div>
            <div class="game-subtitle">Забери выигрыш до падения</div>
            <div class="game-area">
                <div class="result-display" id="crashMultiplier">1.00x</div>
                <div style="font-size:13px;color:var(--text-secondary);" id="crashStatus">Нажмите "Старт"</div>
                <div class="game-actions" style="margin-top:8px;">
                    <button class="primary" id="crashBtn" onclick="App.crashAction()" disabled>🚀 Забрать</button>
                    <button onclick="App.startCrash()">🔄 Старт</button>
                </div>
            </div>
            <div class="bet-controls">
                <input type="number" id="crashBet" placeholder="Ставка" value="10" min="1">
            </div>
            <div class="quick-bets">
                ${[10,25,50,100].map(v => 
                    `<button onclick="document.getElementById('crashBet').value='${v}'">${v}⭐</button>`
                ).join('')}
            </div>
            <div class="game-history" id="crashHistory"></div>
        </div>
    `;
}

function startCrash(app) {
    if (crashRunning) return;
    
    const bet = parseInt(document.getElementById('crashBet').value) || 10;
    if (bet > app.balance) {
        app.showNotification('❌', 'Недостаточно звёзд', 'Пополните баланс');
        return;
    }
    
    app.balance -= bet;
    app.totalGames++;
    app.playedGames.add('crash');
    crashRunning = true;
    crashMultiplier = 1;
    
    document.getElementById('crashMultiplier').textContent = '1.00x';
    document.getElementById('crashMultiplier').className = 'result-display';
    document.getElementById('crashStatus').textContent = '⚡ Растёт...';
    document.getElementById('crashBtn').disabled = false;
    document.getElementById('crashBtn').textContent = '💎 Забрать';
    
    const maxMultiplier = 1 + Math.random() * 9;
    let current = 1;
    const step = 0.01 + Math.random() * 0.03;
    
    if (crashInterval) clearInterval(crashInterval);
    
    crashInterval = setInterval(() => {
        current += step;
        crashMultiplier = Math.round(current * 100) / 100;
        document.getElementById('crashMultiplier').textContent = crashMultiplier.toFixed(2) + 'x';
        
        if (crashMultiplier >= maxMultiplier) {
            crashGame(app);
        }
    }, 80);
}

function crashAction(app) {
    if (!crashRunning) return;
    crashGame(app);
}

function crashGame(app) {
    if (crashInterval) {
        clearInterval(crashInterval);
        crashInterval = null;
    }
    
    crashRunning = false;
    const bet = parseInt(document.getElementById('crashBet').value) || 10;
    const winAmount = Math.floor(bet * crashMultiplier);
    
    document.getElementById('crashStatus').textContent = '💥 Краш!';
    document.getElementById('crashBtn').disabled = true;
    document.getElementById('crashBtn').textContent = '❌ Закончено';
    
    const history = document.getElementById('crashHistory');
    
    if (winAmount > bet) {
        app.balance += winAmount;
        app.wins++;
        document.getElementById('crashMultiplier').className = 'result-display win';
        history.innerHTML += '<span class="win">+' + winAmount + '</span>';
    } else {
        document.getElementById('crashMultiplier').className = 'result-display lose';
        history.innerHTML += '<span class="lose">-' + bet + '</span>';
    }
    
    updateUI(app);
    checkAchievements(app);
    
    if (history.children.length > 20) history.removeChild(history.firstChild);
}
