// ============================================================
//  ИГРА: PLINKO (с визуалом и шансом ~15%)
// ============================================================
function renderPlinko() {
    return `
        <div class="game-page-container">
            <div class="game-title">🎲 Plinko</div>
            <div class="game-subtitle">Шарик падает в ячейки с множителями</div>
            
            <div class="game-area" id="plinkoArea">
                <!-- Поле с множителями -->
                <div style="display:grid;grid-template-columns:repeat(8,1fr);gap:4px;max-width:300px;margin:0 auto;position:relative;">
                    ${[0.5, 1, 2, 5, 10, 5, 2, 1].map((x, i) => `
                        <div class="plinko-cell" data-index="${i}" data-mult="${x}" 
                             style="background:${x >= 5 ? 'rgba(255,107,107,0.2)' : x >= 2 ? 'rgba(255,215,0,0.15)' : 'rgba(255,255,255,0.05)'};
                                    border-radius:6px;padding:10px 0;font-size:13px;font-weight:${x >= 5 ? '700' : '500'};
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
            
            <div class="bet-controls">
                <input type="number" id="plinkoBet" placeholder="Ставка" value="10" min="1">
                <button onclick="App.playPlinko()" id="plinkoBtn">🚀 Бросить</button>
            </div>
            <div class="quick-bets">
                ${[5, 10, 25, 50, 100].map(v => 
                    `<button onclick="document.getElementById('plinkoBet').value='${v}'">${v}⭐</button>`
                ).join('')}
            </div>
            <div class="game-history" id="plinkoHistory"></div>
        </div>
    `;
}

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
    
    // Блокируем кнопку
    btn.disabled = true;
    btn.textContent = '⏳ ...';
    
    // Множители (0.5x, 1x, 2x, 5x, 10x, 5x, 2x, 1x)
    const multipliers = [0.5, 1, 2, 5, 10, 5, 2, 1];
    
    // **ШАНС НА ВЫИГРЫШ ~15%** (выигрыш > ставки)
    // Используем взвешенный рандом: 85% шанс на проигрыш или маленький выигрыш
    let index;
    const rand = Math.random();
    
    if (rand < 0.15) { // 15% — выигрыш
        // Выигрышные ячейки (2x, 5x, 10x)
        const winCells = [2, 3, 4, 6];
        index = winCells[Math.floor(Math.random() * winCells.length)];
    } else if (rand < 0.50) { // 35% — возврат ставки (1x)
        index = 1;
    } else { // 50% — проигрыш (0.5x)
        index = 0;
    }
    
    const multiplier = multipliers[index];
    const winAmount = Math.floor(bet * multiplier);
    const profit = winAmount - bet;
    
    // Эмуляция анимации
    const cells = document.querySelectorAll('.plinko-cell');
    cells.forEach((cell, i) => {
        cell.style.transform = 'scale(1)';
        cell.style.background = 'var(--bg-card)';
        setTimeout(() => {
            if (i === index) {
                cell.style.transform = 'scale(1.2)';
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
    
    // Показываем результат с задержкой (эмуляция анимации)
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
        
        // Разблокируем кнопку
        btn.disabled = false;
        btn.textContent = '🚀 Бросить';
        
        // Обновляем UI
        updateUI(app);
        checkAchievements(app);
        
        // Очищаем подсветку ячеек
        setTimeout(() => {
            cells.forEach(cell => {
                cell.style.transform = 'scale(1)';
                cell.style.background = '';
                cell.style.borderColor = '';
            });
        }, 800);
        
        // Ограничиваем историю
        if (history.children.length > 20) history.removeChild(history.firstChild);
    }, 600);
}
