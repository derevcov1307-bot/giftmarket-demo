// ============================================================
//  ИГРА: PLINKO (как на скриншоте Rabbits)
// ============================================================
let plinkoRisk = 'low';
let plinkoRows = 10;

function renderPlinko() {
    return `
        <div class="game-page-container">
            <div class="game-title">🎲 Plinko</div>
            <div class="game-subtitle">Шарик падает в ячейки с множителями</div>
            
            <!-- Верхний ряд с множителями -->
            <div class="plinko-multipliers">
                ${[22, 5, 2, 1.4, 0.6, 0.4, 0.6, 1.4, 2, 5, 22].map(x => `
                    <div class="plinko-multiplier ${x >= 5 ? 'high' : x >= 2 ? 'medium' : 'low'}">
                        ${x}x
                    </div>
                `).join('')}
            </div>
            
            <!-- Игровое поле -->
            <div class="game-area" id="plinkoArea">
                <div style="display:grid;grid-template-columns:repeat(11,1fr);gap:6px;max-width:340px;margin:0 auto;">
                    ${[22, 5, 2, 1.4, 0.6, 0.4, 0.6, 1.4, 2, 5, 22].map((x, i) => `
                        <div class="plinko-cell" data-index="${i}" data-mult="${x}" 
                             style="background:${x >= 5 ? 'rgba(255,107,107,0.15)' : x >= 2 ? 'rgba(255,215,0,0.1)' : 'rgba(255,255,255,0.03)'};
                                    border-radius:8px;padding:10px 0;font-size:13px;font-weight:${x >= 5 ? '700' : '500'};
                                    color:${x >= 5 ? '#ff6b6b' : x >= 2 ? '#ffd93d' : 'var(--text-secondary)'};
                                    border:1px solid ${x >= 5 ? 'rgba(255,107,107,0.2)' : 'var(--border-color)'};
                                    transition:all 0.3s;">
                            ${x}x
                        </div>
                    `).join('')}
                </div>
                
                <!-- Результат -->
                <div style="margin-top:16px;">
                    <div class="result-display" id="plinkoResult">🎯</div>
                    <div style="font-size:13px;color:var(--text-secondary);" id="plinkoInfo">Сделай ставку и брось шарик</div>
                </div>
            </div>
            
            <!-- Управление -->
            <div class="plinko-controls">
                <div class="plinko-control-group">
                    <label>Ставка</label>
                    <div class="plinko-bet-control">
                        <button onclick="App.adjustPlinkoBet(-10)">−</button>
                        <input type="number" id="plinkoBet" value="50" min="1" step="1">
                        <button onclick="App.adjustPlinkoBet(10)">+</button>
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
            
            <!-- Уровень риска -->
            <div class="plinko-risk">
                <span>Уровень риска</span>
                <div class="plinko-risk-buttons">
                    <button class="plinko-risk-btn active" data-risk="low" onclick="App.setPlinkoRisk('low')">Низкий</button>
                    <button class="plinko-risk-btn" data-risk="medium" onclick="App.setPlinkoRisk('medium')">Средний</button>
                    <button class="plinko-risk-btn" data-risk="high" onclick="App.setPlinkoRisk('high')">Высокий</button>
                </div>
            </div>
            
            <!-- Кнопки -->
            <div class="plinko-actions">
                <button class="plinko-play-btn" onclick="App.playPlinko()" id="plinkoBtn">
                    🚀 Бросить
                </button>
                <button class="plinko-refill-btn" onclick="App.addBalance(500)">
                    💰 Пополнить
                </button>
            </div>
            
            <div class="game-history" id="plinkoHistory"></div>
        </div>
    `;
}

// ============================================================
//  ДОПОЛНИТЕЛЬНЫЕ МЕТОДЫ ДЛЯ PLINKO
// ============================================================
function adjustPlinkoBet(amount) {
    const input = document.getElementById('plinkoBet');
    let value = parseInt(input.value) || 50;
    value = Math.max(1, value + amount);
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

// ============================================================
//  ОСНОВНАЯ ЛОГИКА PLINKO
// ============================================================
function playPlinko(app) {
    const bet = parseInt(document.getElementById('plinkoBet').value) || 10;
    const btn = document.getElementById('plinkoBtn');
    
    if (bet > app.balance) {
        app.showNotification('❌', 'Недостаточно звёзд', 'Пополните баланс');
        return;
    }
    
    if (bet < 1) {
        app.showNotification('⚠️', 'Минимальная ставка', '1 ⭐');
        return;
    }
    
    btn.disabled = true;
    btn.textContent = '⏳ ...';
    
    // Множители в зависимости от уровня риска
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
    
    // Шанс на выигрыш ~15-20%
    let index;
    const rand = Math.random();
    
    if (rand < 0.20) { // 20% — выигрыш
        const winIndices = multipliers
            .map((v, i) => v >= 2 ? i : -1)
            .filter(i => i !== -1);
        index = winIndices[Math.floor(Math.random() * winIndices.length)];
    } else if (rand < 0.50) { // 30% — возврат
        index = multipliers.findIndex(v => v >= 0.9 && v <= 1.1);
        if (index === -1) index = Math.floor(multipliers.length / 2);
    } else { // 50% — проигрыш
        const loseIndices = multipliers
            .map((v, i) => v < 1 ? i : -1)
            .filter(i => i !== -1);
        index = loseIndices[Math.floor(Math.random() * loseIndices.length)];
        if (index === undefined) index = 0;
    }
    
    const multiplier = multipliers[index] || 0.4;
    const winAmount = Math.floor(bet * multiplier);
    const profit = winAmount - bet;
    
    // Подсветка ячейки
    const cells = document.querySelectorAll('.plinko-cell');
    cells.forEach((cell, i) => {
        cell.style.transform = 'scale(1)';
        cell.style.background = '';
        cell.style.borderColor = '';
        setTimeout(() => {
            if (i === index) {
                cell.style.transform = 'scale(1.3)';
                cell.style.background = multiplier >= 2 ? 'rgba(78,205,196,0.3)' : 'rgba(255,107,107,0.2)';
                cell.style.borderColor = multiplier >= 2 ? '#4ecdc4' : '#ff6b6b';
            }
        }, i * 30);
    });
    
    // Обновляем баланс
    app.balance -= bet;
    app.totalGames++;
    app.playedGames.add('plinko');
    
    const result = document.getElementById('plinkoResult');
    const info = document.getElementById('plinkoInfo');
    const history = document.getElementById('plinkoHistory');
    
    setTimeout(() => {
        if (profit > 0) {
            app.balance += winAmount;
            app.wins++;
            result.textContent = `🎉 +${profit}⭐`;
            result.className = 'result-display win';
            info.textContent = `Множитель: ${multiplier}x | Выигрыш: ${winAmount}⭐`;
            info.style.color = '#4ecdc4';
            history.innerHTML += `<span class="win">+${profit}</span>`;
            app.showNotification('🎉', `Выигрыш!`, `${profit}⭐ (${multiplier}x)`);
        } else if (winAmount === bet) {
            app.balance += winAmount;
            result.textContent = `🔄 0⭐`;
            result.className = 'result-display';
            info.textContent = `Возврат ставки (${multiplier}x)`;
            info.style.color = 'var(--text-secondary)';
            history.innerHTML += `<span>±0</span>`;
        } else {
            result.textContent = `😔 -${bet}⭐`;
            result.className = 'result-display lose';
            info.textContent = `Проигрыш (${multiplier}x)`;
            info.style.color = '#ff6b6b';
            history.innerHTML += `<span class="lose">-${bet}</span>`;
        }
        
        btn.disabled = false;
        btn.textContent = '🚀 Бросить';
        
        updateUI(app);
        checkAchievements(app);
        
        setTimeout(() => {
            cells.forEach(cell => {
                cell.style.transform = 'scale(1)';
                cell.style.background = '';
                cell.style.borderColor = '';
            });
        }, 800);
        
        if (history.children.length > 20) history.removeChild(history.firstChild);
    }, 600);
}
