// ============================================================
//  ИГРА: CRASH (с улучшенным визуалом)
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
                <!-- График -->
                <div class="crash-chart" id="crashChart">
                    <canvas id="crashCanvas" width="280" height="140"></canvas>
                </div>
                
                <!-- Множитель -->
                <div style="font-size:48px;font-weight:700;margin:4px 0;transition:color 0.3s;" id="crashMultiplier">1.00x</div>
                
                <!-- Прогресс-бар -->
                <div style="height:4px;background:var(--bg-card);border-radius:4px;max-width:200px;margin:6px auto;overflow:hidden;">
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
    
    if (bet < 1) {
        app.showNotification('⚠️', 'Минимальная ставка', '1 ⭐');
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
    const canvas = document.getElementById('crashCanvas');
    const ctx = canvas?.getContext('2d');
    
    display.textContent = '1.00x';
    display.className = 'result-display';
    display.style.color = 'var(--text-primary)';
    progress.style.width = '0%';
    status.textContent = '⚡ Растёт... Забери вовремя!';
    status.style.color = 'var(--text-secondary)';
    btn.disabled = false;
    btn.textContent = '💎 Забрать';
    startBtn.disabled = true;
    btn.style.background = 'var(--gradient)';
    btn.style.opacity = '1';
    
    // Очищаем график
    if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    
    // Шанс на выигрыш >2x ~10%
    const rand = Math.random();
    let maxMultiplier;
    if (rand < 0.10) {
        maxMultiplier = 2 + Math.random() * 8;
    } else if (rand < 0.50) {
        maxMultiplier = 1.5 + Math.random() * 0.5;
    } else {
        maxMultiplier = 1.1 + Math.random() * 0.4;
    }
    
    let current = 1;
    const step = 0.02 + Math.random() * 0.04;
    let history = [1];
    const startTime = Date.now();
    
    if (crashInterval) clearInterval(crashInterval);
    
    crashInterval = setInterval(() => {
        current += step;
        crashMultiplier = Math.round(current * 100) / 100;
        display.textContent = crashMultiplier.toFixed(2) + 'x';
        
        // Прогресс
        const progressPercent = Math.min((crashMultiplier / 10) * 100, 100);
        progress.style.width = progressPercent + '%';
        
        // Цвет множителя
        if (crashMultiplier > 5) {
            display.style.color = '#ff6b6b';
            progress.style.background = 'linear-gradient(135deg, #ff6b6b, #ff3366)';
        } else if (crashMultiplier > 3) {
            display.style.color = '#ffd93d';
            progress.style.background = 'linear-gradient(135deg, #ffd93d, #ff6b6b)';
        } else {
            display.style.color = 'var(--text-primary)';
            progress.style.background = 'var(--gradient)';
        }
        
        // График
        if (ctx) {
            history.push(crashMultiplier);
            if (history.length > 60) history.shift();
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Сетка
            ctx.strokeStyle = 'rgba(255,255,255,0.05)';
            ctx.lineWidth = 0.5;
            for (let i = 0; i < 5; i++) {
                const y = (i / 4) * canvas.height;
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
                ctx.stroke();
            }
            
            // График
            const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0, 'rgba(78,205,196,0.3)');
            gradient.addColorStop(1, 'rgba(78,205,196,0)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.moveTo(0, canvas.height);
            for (let i = 0; i < history.length; i++) {
                const x = (i / (history.length - 1)) * canvas.width;
                const y = canvas.height - (history[i] / 10) * canvas.height;
                ctx.lineTo(x, y);
            }
            ctx.lineTo(canvas.width, canvas.height);
            ctx.closePath();
            ctx.fill();
            
            ctx.strokeStyle = crashMultiplier > 3 ? '#ff6b6b' : '#4ecdc4';
            ctx.lineWidth = 2;
            ctx.shadowColor = crashMultiplier > 3 ? 'rgba(255,107,107,0.3)' : 'rgba(78,205,196,0.3)';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            for (let i = 0; i < history.length; i++) {
                const x = (i / (history.length - 1)) * canvas.width;
                const y = canvas.height - (history[i] / 10) * canvas.height;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
            ctx.shadowBlur = 0;
        }
        
        if (crashMultiplier >= maxMultiplier) {
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
        const winAmount = Math.floor(crashBet * crashMultiplier);
        app.balance += winAmount;
        app.wins++;
        display.className = 'result-display win';
        display.style.color = '#4ecdc4';
        status.textContent = `✅ Забрано! Выигрыш: ${winAmount}⭐ (${crashMultiplier.toFixed(2)}x)`;
        status.style.color = '#4ecdc4';
        history.innerHTML += `<span class="win">+${winAmount - crashBet}</span>`;
        app.showNotification('🎉', `Забрано!`, `${winAmount}⭐ (${crashMultiplier.toFixed(2)}x)`);
        btn.style.background = '#4ecdc4';
        btn.textContent = '✅ Забрано!';
    } else {
        display.className = 'result-display lose';
        display.style.color = '#ff6b6b';
        status.textContent = `💥 Краш! (${crashMultiplier.toFixed(2)}x)`;
        status.style.color = '#ff6b6b';
        history.innerHTML += `<span class="lose">-${crashBet}</span>`;
        btn.style.background = '#ff6b6b';
        btn.textContent = '💥 Краш!';
    }
    
    btn.disabled = true;
    btn.style.opacity = '0.6';
    startBtn.disabled = false;
    
    updateUI(app);
    checkAchievements(app);
    
    if (history.children.length > 20) history.removeChild(history.firstChild);
}
