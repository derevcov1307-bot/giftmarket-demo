// ============================================================
//  ИГРА: PLINKO
// ============================================================
function renderPlinko() {
    return `
        <div class="game-page-container">
            <div class="game-title">🎲 Plinko</div>
            <div class="game-subtitle">Шарик падает в ячейки с множителями</div>
            <div class="game-area">
                <div style="display:grid;grid-template-columns:repeat(8,1fr);gap:4px;max-width:280px;margin:0 auto;">
                    ${[0.5,1,2,5,10,5,2,1].map(x => 
                        `<div style="background:var(--bg-card);border-radius:4px;padding:6px 0;font-size:11px;color:var(--text-secondary);">${x}x</div>`
                    ).join('')}
                </div>
                <div class="result-display" id="plinkoResult">🎯</div>
            </div>
            <div class="bet-controls">
                <input type="number" id="plinkoBet" placeholder="Ставка" value="10" min="1">
                <button onclick="App.playPlinko()">Бросить</button>
            </div>
            <div class="quick-bets">
                ${[10,25,50,100].map(v => 
                    `<button onclick="document.getElementById('plinkoBet').value='${v}'">${v}⭐</button>`
                ).join('')}
            </div>
            <div class="game-history" id="plinkoHistory"></div>
        </div>
    `;
}

function playPlinko(app) {
    const bet = parseInt(document.getElementById('plinkoBet').value) || 10;
    if (bet > app.balance) {
        app.showNotification('❌', 'Недостаточно звёзд', 'Пополните баланс');
        return;
    }
    
    const multipliers = [0.5, 1, 2, 5, 10, 5, 2, 1];
    const index = Math.floor(Math.random() * multipliers.length);
    const multiplier = multipliers[index];
    const win = Math.floor(bet * multiplier);
    
    app.balance -= bet;
    app.totalGames++;
    app.playedGames.add('plinko');
    
    const result = document.getElementById('plinkoResult');
    const history = document.getElementById('plinkoHistory');
    
    if (win > bet) {
        app.balance += win;
        app.wins++;
        result.textContent = '🎉 +' + win + '⭐';
        result.className = 'result-display win';
        history.innerHTML += '<span class="win">+' + win + '</span>';
    } else {
        result.textContent = '😔 -' + bet + '⭐';
        result.className = 'result-display lose';
        history.innerHTML += '<span class="lose">-' + bet + '</span>';
    }
    
    updateUI(app);
    checkAchievements(app);
    
    if (history.children.length > 20) history.removeChild(history.firstChild);
}
