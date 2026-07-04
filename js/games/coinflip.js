// ============================================================
//  ИГРА: COIN FLIP
// ============================================================
function renderCoinFlip() {
    return `
        <div class="game-page-container">
            <div class="game-title">🪙 Coin Flip</div>
            <div class="game-subtitle">Орёл или решка — удвой ставку</div>
            <div class="game-area">
                <div class="game-emoji" id="coinResult">🪙</div>
                <div class="game-actions">
                    <button onclick="App.coinFlip('heads')">🦅 Орёл</button>
                    <button onclick="App.coinFlip('tails')">🪙 Решка</button>
                    <button class="primary" onclick="App.coinFlip('random')">🎲 Случайно</button>
                </div>
            </div>
            <div class="bet-controls">
                <input type="number" id="coinBet" placeholder="Ставка" value="10" min="1">
                <button onclick="App.coinFlip('random')">Кинуть</button>
            </div>
            <div class="quick-bets">
                ${[10,25,50,100].map(v => 
                    `<button onclick="document.getElementById('coinBet').value='${v}'">${v}⭐</button>`
                ).join('')}
            </div>
            <div class="game-history" id="coinHistory"></div>
        </div>
    `;
}

function coinFlip(app, choice) {
    const bet = parseInt(document.getElementById('coinBet').value) || 10;
    if (bet > app.balance) {
        app.showNotification('❌', 'Недостаточно звёзд', 'Пополните баланс');
        return;
    }
    
    const result = Math.random() < 0.5 ? 'heads' : 'tails';
    const win = result === choice || choice === 'random';
    
    app.balance -= bet;
    app.totalGames++;
    app.playedGames.add('coinflip');
    
    const display = document.getElementById('coinResult');
    const history = document.getElementById('coinHistory');
    
    if (win) {
        const winAmount = bet * 2;
        app.balance += winAmount;
        app.wins++;
        display.textContent = result === 'heads' ? '🦅' : '🪙';
        history.innerHTML += '<span class="win">+' + winAmount + '</span>';
    } else {
        display.textContent = result === 'heads' ? '🦅' : '🪙';
        history.innerHTML += '<span class="lose">-' + bet + '</span>';
    }
    
    updateUI(app);
    checkAchievements(app);
    
    if (history.children.length > 20) history.removeChild(history.firstChild);
}
