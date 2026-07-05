// ============================================================
//  ИГРА: PLINKO (TON)
// ============================================================
let plinkoRisk = 'low';
let plinkoRows = 10;
let isPlaying = false;

function renderPlinko() {
    return `
        <div class="game-page-container">
            <div class="game-title">🎲 Plinko</div>
            <div class="game-subtitle">Ставка в TON · Множители до 22x</div>
            
            <div class="plinko-multipliers">
                ${[22, 5, 2, 1.4, 0.6, 0.4, 0.6, 1.4, 2, 5, 22].map(x => `
                    <div class="plinko-multiplier ${x >= 5 ? 'high' : x >= 2 ? 'medium' : 'low'}">${x}x</div>
                `).join('')}
            </div>
            
            <div class="game-area" id="plinkoArea">
                <div class="plinko-grid" id="plinkoGrid">
                    ${[22, 5, 2, 1.4, 0.6, 0.4, 0.6, 1.4, 2, 5, 22].map((x, i) => `
                        <div class="plinko-cell" data-index="${i}" data-mult="${x}" 
                             style="background:${x >= 5 ? 'rgba(255,107,107,0.12)' : x >= 2 ? 'rgba(255,215,0,0.08)' : 'rgba(255,255,255,0.02)'};
                                    border-radius:8px;padding:10px 0;font-size:13px;font-weight:${x >= 5 ? '700' : '500'};
                                    color:${x >= 5 ? '#ff6b6b' : x >= 2 ? '#ffd93d' : 'var(--text-secondary)'};
                                    border:1px solid ${x >= 5 ? 'rgba(255,107,107,0.15)' : 'var(--border-color)'};">
                            ${x}x
                        </div>
                    `).join('')}
                </div>
                
                <div class="plinko-ball" id="plinkoBall" style="display:none;">🔴</div>
                
                <div style="margin-top:12px;">
                    <div class="result-display" id="plinkoResult">🎯</div>
                    <div style="font-size:13px;color:var(--text-secondary);" id="plinkoInfo">Сделай ставку и брось шарик</div>
                </div>
            </div>
            
            <div class="plinko-controls">
                <div class="plinko-control-group">
                    <label>Ставка (TON)</label>
                    <div class="plinko-bet-control">
                        <button onclick="App.adjustPlinkoBet(-0.1)">−</button>
                        <input type="number" id="plinkoBet" placeholder="Ставка" value="0.1" min="0.01" step="0.01">
                        <button onclick="App.adjustPlinkoBet(0.1)">+</button>
                    </div>
                </div>
                
                <div class="plinko-control-group">
                    <label>Ряды</label>
                    <div class="plinko-bet-control">
                        <button onclick="App.adjustPlinkoRows(-1)">−</button>
                        <input type="number" id="plinkoRows" value="10" min="5" max="16" step="1">
                        <button onclick="App.adjustPlinkoRows(1)">+</button>
                    </div>
                </div>
            </div>
            
            <div class="plinko-risk">
                <span>Уровень риска</span>
                <div class="plinko-risk-buttons">
                    <button class="plinko-risk-btn active" data-risk="low" onclick="App.setPlinkoRisk('low')">Низкий</button>
                    <button class="plinko-risk-btn" data-risk="medium" onclick="App.setPlinkoRisk('medium')">Средний</button>
                    <button class="plinko-risk-btn" data-risk="high" onclick="App.setPlinkoRisk('high')">Высокий</button>
                </div>
            </div>
            
            <div class="plinko-actions">
                <button class="plinko-play-btn" onclick="App.playPlinko()" id="plinkoBtn">🚀 Бросить</button>
            </div>
            
            <div class="quick-bets">
                ${[0.05, 0.1, 0.5, 1, 5].map(v => 
                    `<button onclick="document.getElementById('plinkoBet').value='${v}'">${v} TON</button>`
                ).join('')}
            </div>
            
            <div class="game-history" id="plinkoHistory"></div>
        </div>
    `;
}

function adjustPlinkoBet(amount) {
    const input = document.getElementById('plinkoBet');
    let value = parseFloat(input.value) || 0.1;
    value = Math.max(0.01, Math.round((value + amount) * 100) / 100);
    input.value = value;
}

function adjustPlinkoRows(amount) {
    const input = document.getElementById('plinkoRows');
    let value = parseInt(input.value) || 10;
    value = Math.max(5, Math.min(16, value + amount));
    input.value = value;
}

function setPlinkoRisk(risk) {
    plinkoRisk = risk;
    document.querySelectorAll('.plinko-risk-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.risk === risk);
    });
}

function playPlinko(app) {
    if (isPlaying) return;
    
    const bet = parseFloat(document.getElementById('plinkoBet').value) || 0.1;
    const btn = document.getElementById('plinkoBtn');
    const ball = document.getElementById('plinkoBall');
    const grid = document.getElementById('plinkoGrid');
    
    if (bet < 0.01) {
        app.showNotification('⚠️', 'Минимальная ставка', '0.01 TON');
        return;
    }
    
    if (bet > app.balance) {
        app.showNotification('❌', 'Недостаточно TON', 'Пополните баланс');
        return;
    }
    
    isPlaying = true;
    btn.disabled = true;
    btn.textContent = '⏳ ...';
    
    let multipliers;
    switch(plinkoRisk) {
        case 'low':
            multipliers = [0.4, 0.6, 1, 1.4, 2, 2.5, 2, 1.4, 1, 0.6, 0.4];
            break;
        case 'medium':
            multipliers = [0.4, 0.6, 1.4, 2, 5, 5, 5, 2, 1.4, 0.6, 0.4];
            break;
        case 'high':
        default:
            multipliers = [0.4, 0.6, 2, 5, 10, 22, 10, 5, 2, 0.6, 0.4];
            break;
    }
    
    let index;
    const rand = Math.random();
    if (rand < 0.20) {
        const winIndices = multipliers.map((v, i) => v >= 2 ? i : -1).filter(i => i !== -1);
        index = winIndices[Math.floor(Math.random() * winIndices.length)];
    } else if (rand < 0.50) {
        index = Math.floor(multipliers.length / 2);
    } else {
        const loseIndices = multipliers.map((v, i) => v < 1 ? i : -1).filter(i => i !== -1);
        index = loseIndices[Math.floor(Math.random() * loseIndices.length)] || 0;
    }
    
    const multiplier = multipliers[index];
    const winAmount = Math.round(bet * multiplier * 100) / 100;
    const profit = Math.round((winAmount - bet) * 100) / 100;
    
    // Анимация
    const cells = document.querySelectorAll('.plinko-cell');
    ball.style.display = 'block';
    ball.style.position = 'absolute';
    ball.style.fontSize = '28px';
    ball.style.transition = 'all 0.1s ease';
    ball.style.zIndex = '10';
    ball.style.left = '50%';
    ball.style.top = '0%';
    ball.style.transform = 'translateX(-50%)';
    
    const steps = 20;
    let currentStep = 0;
    
    const ballAnimation = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;
        const targetX = 10 + (index / (multipliers.length - 1)) * 80;
        const targetY = 10 + progress * 75;
        ball.style.left = targetX + '%';
        ball.style.top = targetY + '%';
        
        if (currentStep >= steps) {
            clearInterval(ballAnimation);
            
            // Финал
            setTimeout(() => {
                cells.forEach((cell, i) => {
                    if (i === index) {
                        cell.style.transform = 'scale(1.3)';
                        cell.style.background = multiplier >= 2 ? 'rgba(78,205,196,0.3)' : 'rgba(255,107,107,0.2)';
                        cell.style.borderColor = multiplier >= 2 ? '#4ecdc4' : '#ff6b6b';
                    }
                });
                
                // Результат
                app.balance = Math.round((app.balance - bet) * 100) / 100;
                app.totalGames++;
                app.playedGames.add('plinko');
                
                const result = document.getElementById('plinkoResult');
                const info = document.getElementById('plinkoInfo');
                const history = document.getElementById('plinkoHistory');
                
                if (profit > 0) {
                    app.balance = Math.round((app.balance + winAmount) * 100) / 100;
                    app.wins++;
                    result.textContent = `🎉 +${profit.toFixed(2)} TON`;
                    result.className = 'result-display win';
                    info.textContent = `Множитель: ${multiplier}x | Выигрыш: ${winAmount.toFixed(2)} TON`;
                    info.style.color = '#4ecdc4';
                    history.innerHTML += `<span class="win">+${profit.toFixed(2)}</span>`;
                    app.showNotification('🎉', `Выигрыш!`, `${profit.toFixed(2)} TON (${multiplier}x)`);
                    app.saveGameResult('plinko', bet, winAmount, multiplier, 'win');
                } else if (winAmount === bet) {
                    app.balance = Math.round((app.balance + winAmount) * 100) / 100;
                    result.textContent = `🔄 0 TON`;
                    result.className = 'result-display';
                    info.textContent = `Возврат ставки (${multiplier}x)`;
                    info.style.color = 'var(--text-secondary)';
                    history.innerHTML += `<span>0</span>`;
                    app.saveGameResult('plinko', bet, 0, multiplier, 'draw');
                } else {
                    result.textContent = `😔 -${bet.toFixed(2)} TON`;
                    result.className = 'result-display lose';
                    info.textContent = `Проигрыш (${multiplier}x)`;
                    info.style.color = '#ff6b6b';
                    history.innerHTML += `<span class="lose">-${bet.toFixed(2)}</span>`;
                    app.saveGameResult('plinko', bet, 0, multiplier, 'lose');
                }
                
                setTimeout(() => {
                    ball.style.display = 'none';
                    cells.forEach(cell => {
                        cell.style.transform = 'scale(1)';
                        cell.style.background = '';
                        cell.style.borderColor = '';
                    });
                }, 600);
                
                btn.disabled = false;
                btn.textContent = '🚀 Бросить';
                isPlaying = false;
                app.updateUI();
                
                if (history.children.length > 20) history.removeChild(history.firstChild);
            }, 300);
        }
    }, 120);
}
