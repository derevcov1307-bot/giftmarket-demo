// ============================================================
//  ИГРА: CRASH (шанс на выигрыш >2x ~10%)
// ============================================================
let crashRunning = false;
let crashMultiplier = 1;
let crashInterval = null;
let crashBet = 0;
let crashHasCashed = false;

function renderCrash() {
    return `
        <div class="game-page-container">
            <div class="game-title">📈 Crash</div>
            <div class="game-subtitle">Забери выигрыш до падения! (шанс на x2 ~10%)</div>
            
            <div class="game-area" id="crashArea">
                <div style="font-size:48px;font-weight:700;margin:8px 0;transition:color 0.3s;" id="crashMultiplier">1.00x</div>
                <div style="height:4px;background:var(--bg-card);border-radius:4px;max-width:200px;margin:8px auto;overflow:hidden;">
                    <div style="height:100%;width:0%;background:var(--gradient);border-radius:4px;transition:width 0.2s;" id="crashProgress"></div>
                </div>
                <div style="font-size:14px;color:var(--text-secondary);" id="crashStatus">Нажми "Старт" чтобы начать раунд</div>
                <div class="game-actions" style="margin-top:8px;">
                    <button class="primary" id="crashBtn" onclick="App.crashAction()" disabled>🚀 Забрать</button>
                    <button onclick="App.startCrash()" id="crashStartBtn">🔄 Старт</button>
                </div>
            </div>
            
            <div class="bet-controls">
                <input type="number" id="crashBet" placeholder="Ставка" value="10" min="1">
            </div>
            <div class="quick-bets">
                ${[5, 10, 25, 50, 100].map(v => 
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
    
    crashBet = bet;
    crashHasCashed = false;
    
    app.balance -= bet;
    app.totalGames++;
    app.playedGames.add('crash');
    crashRunning = true;
    crashMultiplier = 1;
    
    const display = document.getElementById('crashMultiplier');
    const progress = document.getElementById('crashProgress');
    const status = document.getElementById('crashStatus');
    const btn = document.getElementById('crashBtn');
    const startBtn = document.getElementById('crashStartBtn');
    
    display.textContent = '1.00x';
    display.className = 'result-display';
    progress.style.width = '0%';
    status.textContent = '⚡ Растёт... Забери вовремя!';
    btn.disabled = false;
    btn.textContent = '💎 Забрать';
    startBtn.disabled = true;
    
    // **ШАНС НА ВЫИГРЫШ >2x ~10%**
    // Максимальный множитель: 50% шанс на 1.1x-1.5x, 40% на 1.5x-2x, 10% на 2x-10x
    const crashPoint = 1 + Math.random() * (Math.random() < 0.1 ? 9 : Math.random() < 0.5 ? 0.5 : 1);
    let current = 1;
    const step = 0.02 + Math.random() * 0.05;
    
    if (crashInterval) clearInterval(crashInterval);
    
    crashInterval = setInterval(() => {
        current += step;
        crashMultiplier = Math.round(current * 100) / 100;
        display.textContent = crashMultiplier.toFixed(2) + 'x';
        progress.style.width = Math.min((crashMultiplier / 10) * 100, 100) + '%';
        
        // Меняем цвет при высоком множителе
        if (crashMultiplier > 3) {
            display.style.color = '#ffd93d';
        } else if (crashMultiplier > 5) {
            display.style.color = '#ff6b6b';
        } else {
            display.style.color = 'var(--text-primary)';
        }
        
        if (crashMultiplier >= crashPoint) {
            crashGame(app);
        }
    }, 80);
}

function crashAction(app) {
    if (!crashRunning || crashHasCashed) return;
    crashHasCashed = true;
    crashGame(app, true);
}

function crashGame(app, cashed = false) {
    if (crashInterval) {
        clearInterval(crashInterval);
        crashInterval = null;
    }
    
    crashRunning = false;
    const btn = document.getElementById('crashBtn');
    const startBtn = document.getElementById('crashStartBtn');
    const status = document.getElementById('crashStatus');
    const display = document.getElementById('crashMultiplier');
    const history = document.getElementById('crashHistory');
    
    if (cashed) {
        // Игрок забрал выигрыш
        const winAmount = Math.floor(crashBet * crashMultiplier);
        app.balance += winAmount;
        app.wins++;
        display.className = 'result-display win';
        status.textContent = `✅ Забрано! Выигрыш: ${winAmount}⭐ (${crashMultiplier.toFixed(2)}x)`;
        status.style.color = '#4ecdc4';
        history.innerHTML += `<span class="win">+${winAmount - crashBet}</span>`;
        app.showNotification('🎉', `Забрано!`, `${winAmount}⭐ (${crashMultiplier.toFixed(2)}x)`);
    } else {
        // Краш
        display.className = 'result-display lose';
        status.textContent = `💥 Краш! (${crashMultiplier.toFixed(2)}x)`;
        status.style.color = '#ff6b6b';
        history.innerHTML += `<span class="lose">-${crashBet}</span>`;
    }
    
    btn.disabled = true;
    btn.textContent = '❌ Закончено';
    startBtn.disabled = false;
    
    updateUI(app);
    checkAchievements(app);
    
    if (history.children.length > 20) history.removeChild(history.firstChild);
}
