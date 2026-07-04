// ============================================================
//  ИГРА: COIN FLIP (с комиссией 5%)
// ============================================================
function renderCoinFlip() {
    return `
        <div class="game-page-container">
            <div class="game-title">🪙 Coin Flip</div>
            <div class="game-subtitle">Угадай сторону — выигрывай! (комиссия 5%)</div>
            
            <div class="game-area" id="coinArea">
                <div style="font-size:80px;margin:8px 0;transition:transform 0.6s;" id="coinResult">🪙</div>
                <div style="font-size:14px;color:var(--text-secondary);" id="coinInfo">Выбери сторону и сделай ставку</div>
                <div class="game-actions" style="margin-top:8px;">
                    <button onclick="App.coinFlip('heads')" id="coinHeads" style="font-size:20px;padding:8px 24px;">🦅 Орёл</button>
                    <button onclick="App.coinFlip('tails')" id="coinTails" style="font-size:20px;padding:8px 24px;">🪙 Решка</button>
                </div>
            </div>
            
            <div class="bet-controls">
                <input type="number" id="coinBet" placeholder="Ставка" value="10" min="1">
                <button onclick="App.coinFlip('random')">🎲 Случайно</button>
            </div>
            <div class="quick-bets">
                ${[5, 10, 25, 50, 100].map(v => 
                    `<button onclick="document.getElementById('coinBet').value='${v}'">${v}⭐</button>`
                ).join('')}
            </div>
            <div class="game-history" id="coinHistory"></div>
        </div>
    `;
}

function coinFlip(app, choice) {
    const bet = parseInt(document.getElementById('coinBet').value) || 10;
    const headsBtn = document.getElementById('coinHeads');
    const tailsBtn = document.getElementById('coinTails');
    
    if (bet > app.balance) {
        app.showNotification('❌', 'Недостаточно звёзд', 'Пополните баланс');
        return;
    }
    
    if (bet < 1) {
        app.showNotification('⚠️', 'Минимальная ставка', '1 ⭐');
        return;
    }
    
    // Блокируем кнопки
    headsBtn.disabled = true;
    tailsBtn.disabled = true;
    
    // Результат (честный рандом)
    const result = Math.random() < 0.5 ? 'heads' : 'tails';
    const win = result === choice || choice === 'random';
    
    // Комиссия 5% (как в казино)
    const commission = Math.floor(bet * 0.05);
    const netBet = bet - commission;
    
    app.balance -= bet;
    app.totalGames++;
    app.playedGames.add('coinflip');
    
    const display = document.getElementById('coinResult');
    const info = document.getElementById('coinInfo');
    const history = document.getElementById('coinHistory');
    
    // Анимация вращения монеты
    display.style.transform = 'rotate(0deg)';
    setTimeout(() => {
        display.style.transform = 'rotate(720deg)';
    }, 50);
    
    setTimeout(() => {
        if (win) {
            const winAmount = netBet * 2;
            app.balance += winAmount;
            app.wins++;
            display.textContent = result === 'heads' ? '🦅' : '🪙';
            display.style.transform = 'rotate(0deg)';
            display.className = 'result-display win';
            info.textContent = `🎉 Выигрыш: ${winAmount}⭐ (комиссия ${commission}⭐)`;
            info.style.color = '#4ecdc4';
            history.innerHTML += `<span class="win">+${winAmount - bet}</span>`;
            app.showNotification('🎉', `Победа!`, `${winAmount}⭐ (${result === 'heads' ? 'Орёл' : 'Решка'})`);
        } else {
            display.textContent = result === 'heads' ? '🦅' : '🪙';
            display.style.transform = 'rotate(0deg)';
            display.className = 'result-display lose';
            info.textContent = `😔 Проигрыш (комиссия ${commission}⭐)`;
            info.style.color = '#ff6b6b';
            history.innerHTML += `<span class="lose">-${bet}</span>`;
        }
        
        // Разблокируем кнопки
        headsBtn.disabled = false;
        tailsBtn.disabled = false;
        
        updateUI(app);
        checkAchievements(app);
        
        if (history.children.length > 20) history.removeChild(history.firstChild);
    }, 600);
}
