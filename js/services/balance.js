// ============================================================
//  УПРАВЛЕНИЕ БАЛАНСОМ
// ============================================================
function addBalance(app, amount) {
    app.balance += amount;
    updateUI(app);
    checkAchievements(app);
    app.showNotification('💰', '+' + amount + '⭐', 'Баланс пополнен');
}

function resetBalance(app) {
    if (confirm('Сбросить прогресс?')) {
        app.balance = 1000;
        app.totalGames = 0;
        app.wins = 0;
        app.gifts = 0;
        app.playedGames.clear();
        app.achievements.forEach(a => a.unlocked = false);
        updateUI(app);
        checkAchievements(app);
        app.showNotification('🔄', 'Сброс выполнен', 'Баланс и прогресс сброшены');
    }
}

function showBalance(app) {
    app.showNotification('💰', 'Баланс: ' + app.balance + '⭐', 'Побед: ' + app.wins + ' | Игр: ' + app.totalGames);
}

function updateUI(app) {
    document.getElementById('userBalance').textContent = app.balance;
    document.getElementById('winsCount').textContent = app.wins;
    document.getElementById('totalGames').textContent = app.totalGames;
    document.getElementById('giftsCount').textContent = app.gifts;
    document.getElementById('userName').textContent = app.user.name;
    document.getElementById('userSub').textContent = app.user.status;
    document.getElementById('profileBadge').textContent = app.user.badge;
    document.getElementById('statusDisplay').textContent = app.user.status;
}
