// ============================================================
//  ИГРА: PLINKO (ТОЧНО КАК НА СКРИНШОТЕ RABBITS)
// ============================================================
let plinkoRisk = 'low';
let plinkoRows = 10;
let isPlaying = false;

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
            
            <!-- Игровое поле с анимацией -->
            <div class="game-area" id="plinkoArea">
                <div class="plinko-grid" id="plinkoGrid">
                    ${[22, 5, 2, 1.4, 0.6, 0.4, 0.6, 1.4, 2, 5, 22].map((x, i) => `
                        <div class="plinko-cell" data-index="${i}" data-mult="${x}" 
                             style="background:${x >= 5 ? 'rgba(255,107,107,0.12)' : x >= 2 ? 'rgba(255,215,0,0.08)' : 'rgba(255,255,255,0.02)'};
                                    border-radius:8px;padding:10px 0;font-size:13px;font-weight:${x >= 5 ? '700' : '500'};
                                    color:${x >= 5 ? '#ff6b6b' : x >= 2 ? '#ffd93d' : 'var(--text-secondary)'};
                                    border:1px solid ${x >= 5 ? 'rgba(255,107,107,0.15)' : 'var(--border-color)'};
                                    transition:all 0.3s;">
                            ${x}x
                        </div>
                    `).join('')}
                </div>
                
                <!-- Шарик (анимированный) -->
                <div class="plinko-ball" id="plinkoBall" style="display:none;">🔴</div>
                
                <!-- Результат -->
                <div style="margin-top:12px;">
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
            
            <!-- Только кнопка "Бросить" (без Пополнить) -->
            <div class="plinko-actions">
                <button class="plinko-play-btn" onclick="App.playPlinko()" id="plinkoBtn">
                    🚀 Бросить
                </button>
            </div>
            
            <div class="game-history" id="plinkoHistory"></div>
        </div>
    `;
}

// ============================================================
//  ДОПОЛНИТЕЛЬНЫЕ МЕТОДЫ
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
//  ОСНОВНАЯ ЛОГИКА PLINKO С АНИМАЦИЕЙ
// ============================================================
function playPlinko(app) {
    if (isPlaying) return;
    
    const bet = parseInt(document.getElementById('plinkoBet').value) || 10;
    const rows = parseInt(document.getElementById('plinkoRows').value) || 10;
    const btn = document.getElementById('plinkoBtn');
    const ball = document.getElementById('plinkoBall');
    const grid = document.getElementById('plinkoGrid');
    
    if (bet > app.balance) {
        app.showNotification('❌', 'Недостаточно звёзд', 'Пополните баланс');
        return;
    }
    
    if (bet < 1) {
        app.showNotification('⚠️', 'Минимальная ставка', '1 ⭐');
        return;
    }
    
    isPlaying = true;
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
    
    // Выбор ячейки (шанс ~15-20%)
    let index;
    const rand = Math.random();
    if (rand < 0.20) {
        const winIndices = multipliers.map((v, i) => v >= 2 ? i : -1).filter(i => i !== -1);
        index = winIndices[Math.floor(Math.random() * winIndices.length)];
    } else if (rand < 0.50) {
        index = Math.floor(multipliers.length / 2);
    } else {
        const loseIndices = multipliers.map((v, i) => v < 1 ? i : -1).filter(i => i !== -1);
        index = loseIndices[Math.floor(Math.random() * loseIndices.length)];
        if (index === undefined) index = 0;
    }
    
    const multiplier = multipliers[index] || 0.4;
    const winAmount = Math.floor(bet * multiplier);
    const profit = winAmount - bet;
    
    // --- АНИМАЦИЯ ПАДЕНИЯ ШАРИКА ---
    const cells = document.querySelectorAll('.plinko-cell');
    const gridRect = grid?.getBoundingClientRect();
    
    // Показываем шарик
    ball.style.display = 'block';
    ball.style.position = 'absolute';
    ball.style.fontSize = '28px';
    ball.style.transition = 'all 0.1s ease';
    ball.style.zIndex = '10';
    ball.style.textShadow = '0 0 20px rgba(255,107,107,0.5)';
    
    // Начальная позиция (сверху по центру)
    const startX = 50; // % от ширины поля
    const startY = 10; // % от высоты поля
    
    // Симуляция падения по ячейкам
    const steps = 20;
    let currentStep = 0;
    let currentX = startX;
    let currentY = startY;
    
    const ballAnimation = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;
        
        // Движение вниз с небольшим отклонением влево/вправо
        const deviation = (Math.random() - 0.5) * 15;
        const targetX = 10 + (index / (multipliers.length - 1)) * 80 + deviation;
        const targetY = 10 + progress * 75;
        
        currentX += (targetX - currentX) * 0.3;
        currentY += (targetY - currentY) * 0.3;
        
        ball.style.left = currentX + '%';
        ball.style.top = currentY + '%';
        
        // Подсветка ячейки при прохождении
        const cellIndex = Math.round((currentX - 10) / 80 * (multipliers.length - 1));
        if (cellIndex >= 0 && cellIndex < cells.length) {
            cells.forEach((cell, i) => {
                if (i === cellIndex) {
                    cell.style.background = 'rgba(255,107,107,0.15)';
                    cell.style.transform = 'scale(1.05)';
                } else {
                    cell.style.background = '';
                    cell.style.transform = 'scale(1)';
                }
            });
        }
        
        if (currentStep >= steps) {
            clearInterval(ballAnimation);
            
            // Финальная позиция
            const finalX = 10 + (index / (multipliers.length - 1)) * 80;
            const finalY = 85;
            ball.style.left = finalX + '%';
            ball.style.top = finalY + '%';
            ball.style.transition = 'all 0.2s ease';
            
            // --- ПОПАДАНИЕ ---
            setTimeout(() => {
                // Подсветка финальной ячейки
                cells.forEach((cell, i) => {
                    if (i === index) {
                        cell.style.transform = 'scale(1.3)';
                        cell.style.background = multiplier >= 2 ? 'rgba(78,205,196,0.3)' : 'rgba(255,107,107,0.2)';
                        cell.style.borderColor = multiplier >= 2 ? '#4ecdc4' : '#ff6b6b';
                        cell.style.boxShadow = '0 0 30px rgba(255,107,107,0.2)';
                    } else {
                        cell.style.transform = 'scale(1)';
                        cell.style.background = '';
                        cell.style.borderColor = '';
                        cell.style.boxShadow = '';
                    }
                });
                
                // Взрыв/попадание
                ball.style.fontSize = '40px';
                ball.style.transition = 'all 0.2s ease';
                ball.style.textShadow = multiplier >= 2 
                    ? '0 0 40px rgba(78,205,196,0.8)' 
                    : '0 0 40px rgba(255,107,107,0.8)';
                
                // Обновляем баланс
                app.balance -= bet;
                app.totalGames++;
                app.playedGames.add('plinko');
                
                const result = document.getElementById('plinkoResult');
                const info = document.getElementById('plinkoInfo');
                const history = document.getElementById('plinkoHistory');
                
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
                
                // Скрываем шарик
                setTimeout(() => {
                    ball.style.display = 'none';
                    ball.style.fontSize = '28px';
                    ball.style.textShadow = '0 0 20px rgba(255,107,107,0.5)';
                    
                    // Сбрасываем подсветку ячеек
                    cells.forEach(cell => {
                        cell.style.transform = 'scale(1)';
                        cell.style.background = '';
                        cell.style.borderColor = '';
                        cell.style.boxShadow = '';
                    });
                }, 600);
                
                btn.disabled = false;
                btn.textContent = '🚀 Бросить';
                isPlaying = false;
                
                updateUI(app);
                checkAchievements(app);
                
                if (history.children.length > 20) history.removeChild(history.firstChild);
            }, 300);
        }
    }, 120);
}
