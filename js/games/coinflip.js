// ============================================================
//  ИГРА: COIN FLIP (TON)
// ============================================================
let coinFlipLock = false;

function renderCoinFlip() {
    return `
        <div class="game-page-container">
            <div class="game-title">🪙 Coin Flip</div>
            <div class="game-subtitle">Ставка в TON · Орёл или решка — удвой ставку (комиссия 5%)</div>
            
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
                <input type="number" id="coinBet" placeholder="Ставка" value="0.1" min="0.01" step="0.01">
                <button onclick="App.coinFlip('heads')" class="random-btn">🦅 Орёл</button>
                <button onclick="App.coinFlip('tails')" class="random-btn">🪙 Решка</button>
            </div>
            <div class="quick-bets">
                ${[0.05, 0.1, 0.5, 1, 5].map(v => 
                    `<button onclick="document.getElementById('coinBet').value='${v}'">${v} TON</button>`
                ).join('')}
            </div>
            <div class="game-history" id="coinHistory"></div>
        </div>
    `;
}

function coinFlip(app, choice) {
    if (coinFlipLock) return;
    
    const bet = parseFloat(document.getElementById('coinBet').value) || 0.1;
    const headsBtn = document.getElementById('coinHeads');
    const tailsBtn = document.getElementById('coinTails');
    const coin = document.getElementById('coinResult');
    
    if (bet < 0.01) {
        app.showNotification('⚠️', 'Минимальная ставка', '0.01 TON');
        return;
    }
    
    if (bet > app.balance) {
        app.showNotification('❌', 'Недостаточно TON', 'Пополните баланс');
        return;
    }
    
    coinFlipLock = true;
    headsBtn.disabled = true;
    tailsBtn.disabled = true;
    
    const result = Math.random() < 0.5 ? 'heads' : 'tails';
    const win = result === choice;
    
    const commission = Math.round(bet * 0.05 * 100) / 100;
    const netBet = Math.round((bet - commission) * 100) / 100;
    
    app.balance = Math.round((app.balance - bet) * 100) / 100;
    app.totalGames++;
    app.playedGames.add('coinflip');
    
    const info = document.getElementById('coinInfo');
    const history = document.getElementById('coinHistory');
    
    coin.style.animation = 'none';
    setTimeout(() => {
        coin.style.animation = 'coinFlip 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
    }, 10);
    
    setTimeout(() => {
        if (win) {
            const winAmount = Math.round(netBet * 2 * 100) / 100;
            app.balance = Math.round((app.balance + winAmount) * 100) / 100;
            app.wins++;
            
            coin.style.animation = 'none';
            coin.className = 'coin win';
            coin.innerHTML = result === 'heads' 
                ? '<div class="coin-front" style="transform:rotateY(0deg);">🦅</div><div class="coin-back" style="transform:rotateY(180deg);">🪙</div>'
                : '<div class="coin-front" style="transform:rotateY(0deg);">🪙</div><div class="coin-back" style="transform:rotateY(180deg);">🦅</div>';
            
            info.textContent = `🎉 Выигрыш: ${winAmount.toFixed(2)} TON (комиссия ${commission.toFixed(2)} TON)`;
            info.style.color = '#4ecdc4';
            history.innerHTML += `<span class="win">+${(winAmount - bet).toFixed(2)}</span>`;
            app.showNotification('🎉', `Победа!`, `${winAmount.toFixed(2)} TON (${result === 'heads' ? 'Орёл' : 'Решка'})`);
            app.saveGameResult('coinflip', bet, winAmount, 2, 'win');
        } else {
            coin.style.animation = 'none';
            coin.className = 'coin lose';
            coin.innerHTML = result === 'heads' 
                ? '<div class="coin-front" style="transform:rotateY(0deg);">🦅</div><div class="coin-back" style="transform:rotateY(180deg);">🪙</div>'
                : '<div class="coin-front" style="transform:rotateY(0deg);">🪙</div><div class="coin-back" style="transform:rotateY(180deg);">🦅</div>';
            
            info.textContent = `😔 Проигрыш (комиссия ${commission.toFixed(2)} TON)`;
            info.style.color = '#ff6b6b';
            history.innerHTML += `<span class="lose">-${bet.toFixed(2)}</span>`;
            app.saveGameResult('coinflip', bet, 0, 0, 'lose');
        }
        
        headsBtn.disabled = false;
        tailsBtn.disabled = false;
        coinFlipLock = false;
        app.updateUI();
        
        if (history.children.length > 20) history.removeChild(history.firstChild);
        
        setTimeout(() => {
            coin.className = 'coin';
        }, 1000);
    }, 900);
}
