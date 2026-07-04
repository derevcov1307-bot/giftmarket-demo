// ============================================================
//  ИГРА: COIN FLIP (с улучшенным визуалом)
// ============================================================
let coinFlipLock = false;

function renderCoinFlip() {
    return `
        <div class="game-page-container">
            <div class="game-title">🪙 Coin Flip</div>
            <div class="game-subtitle">Орёл или решка — удвой ставку (комиссия 5%)</div>
            
            <div class="game-area" id="coinArea">
                <div class="coin-container" id="coinContainer">
                    <div class="coin" id="coinResult">
                        <div class="coin-front">🪙</div>
                        <div class="coin-back">🦅</div>
                    </div>
                </div>
                <div style="font-size:14px;color:var(--text-secondary);margin-top:8px;" id="coinInfo">Выбери сторону и сделай ставку</div>
                <div class="game-actions" style="margin-top:12px;">
                    <button class="coin-btn heads" onclick="App.coinFlip('heads')" id="coinHeads">
                        <span class="coin-btn-icon">🦅</span> Орёл
                    </button>
                    <button class="coin-btn tails" onclick="App.coinFlip('tails')" id="coinTails">
                        <span class="coin-btn-icon">🪙</span> Решка
                    </button>
                </div>
            </div>
            
            <div class="bet-controls">
                <input type="number" id="coinBet" placeholder="Ставка" value="10" min="1">
                <button onclick="App.coinFlip('random')" class="random-btn">🎲 Случайно</button>
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
    if (coinFlipLock) return;
    
    const bet = parseInt(document.getElementById('coinBet').value) || 10;
    const headsBtn = document.getElementById('coinHeads');
    const tailsBtn = document.getElementById('coinTails');
    const coin = document.getElementById('coinResult');
    
    if (bet > app.balance) {
        app.showNotification('❌', 'Недостаточно звёзд', 'Пополните баланс');
        return;
    }
    
    if (bet < 1) {
        app.showNotification('⚠️', 'Минимальная ставка', '1 ⭐');
        return;
    }
    
    coinFlipLock = true;
    headsBtn.disabled = true;
    tailsBtn.disabled = true;
    
    // Результат
    const result = Math.random() < 0.5 ? 'heads' : 'tails';
    const win = result === choice || choice === 'random';
    
    // Комиссия 5%
    const commission = Math.floor(bet * 0.05);
    const netBet = bet - commission;
    
    app.balance -= bet;
    app.totalGames++;
    app.playedGames.add('coinflip');
    
    const info = document.getElementById('coinInfo');
    const history = document.getElementById('coinHistory');
    
    // Анимация вращения
    coin.style.animation = 'none';
    setTimeout(() => {
        coin.style.animation = 'coinFlip 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
    }, 10);
    
    setTimeout(() => {
        if (win) {
            const winAmount = netBet * 2;
            app.balance += winAmount;
            app.wins++;
            
            coin.style.animation = 'none';
            coin.className = 'coin win';
            coin.innerHTML = result === 'heads' 
                ? '<div class="coin-front" style="transform:rotateY(0deg);">🦅</div><div class="coin-back" style="transform:rotateY(180deg);">🪙</div>'
                : '<div class="coin-front" style="transform:rotateY(0deg);">🪙</div><div class="coin-back" style="transform:rotateY(180deg);">🦅</div>';
            
            info.textContent = `🎉 Выигрыш: ${winAmount}⭐ (комиссия ${commission}⭐)`;
            info.style.color = '#4ecdc4';
            history.innerHTML += `<span class="win">+${winAmount - bet}</span>`;
            app.showNotification('🎉', `Победа!`, `${winAmount}⭐ (${result === 'heads' ? 'Орёл' : 'Решка'})`);
        } else {
            coin.style.animation = 'none';
            coin.className = 'coin lose';
            coin.innerHTML = result === 'heads' 
                ? '<div class="coin-front" style="transform:rotateY(0deg);">🦅</div><div class="coin-back" style="transform:rotateY(180deg);">🪙</div>'
                : '<div class="coin-front" style="transform:rotateY(0deg);">🪙</div><div class="coin-back" style="transform:rotateY(180deg);">🦅</div>';
            
            info.textContent = `😔 Проигрыш (комиссия ${commission}⭐)`;
            info.style.color = '#ff6b6b';
            history.innerHTML += `<span class="lose">-${bet}</span>`;
        }
        
        headsBtn.disabled = false;
        tailsBtn.disabled = false;
        coinFlipLock = false;
        
        updateUI(app);
        checkAchievements(app);
        
        if (history.children.length > 20) history.removeChild(history.firstChild);
        
        // Сброс анимации
        setTimeout(() => {
            coin.className = 'coin';
        }, 1000);
    }, 900);
}
