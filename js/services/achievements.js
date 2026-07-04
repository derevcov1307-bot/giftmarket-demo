// ============================================================
//  ДОСТИЖЕНИЯ
// ============================================================
const ACHIEVEMENTS_DATA = [
    { id: 'first_game', name: 'Первый шаг', icon: '🎯', unlocked: false, progress: 0, max: 1 },
    { id: 'win_10', name: 'Победитель', icon: '🏆', unlocked: false, progress: 0, max: 10 },
    { id: 'win_50', name: 'Легенда', icon: '👑', unlocked: false, progress: 0, max: 50 },
    { id: 'balance_5000', name: 'Богач', icon: '💰', unlocked: false, progress: 0, max: 5000 },
    { id: 'games_100', name: 'Ветеран', icon: '🎮', unlocked: false, progress: 0, max: 100 },
    { id: 'all_games', name: 'Мастер', icon: '🌟', unlocked: false, progress: 0, max: 3 }
];

function checkAchievements(app) {
    if (app.totalGames >= 1) unlockAchievement('first_game', app);
    if (app.wins >= 10) unlockAchievement('win_10', app);
    if (app.wins >= 50) unlockAchievement('win_50', app);
    if (app.balance >= 5000) unlockAchievement('balance_5000', app);
    if (app.totalGames >= 100) unlockAchievement('games_100', app);
    if (app.playedGames.size >= 3) unlockAchievement('all_games', app);
    
    app.achievements.forEach(a => {
        if (a.id === 'balance_5000') a.progress = Math.min(app.balance, a.max);
        if (a.id === 'win_10' || a.id === 'win_50') a.progress = Math.min(app.wins, a.max);
        if (a.id === 'games_100') a.progress = Math.min(app.totalGames, a.max);
        if (a.id === 'all_games') a.progress = app.playedGames.size;
        if (a.id === 'first_game') a.progress = Math.min(app.totalGames, 1);
    });
    
    renderAchievements(app);
}

function unlockAchievement(id, app) {
    const a = app.achievements.find(x => x.id === id);
    if (a && !a.unlocked) {
        a.unlocked = true;
        app.showNotification(a.icon, '🏆 Достижение: ' + a.name, 'Разблокировано!');
    }
}

function renderAchievements(app) {
    const container = document.getElementById('achievementsList');
    if (!container) return;
    
    const unlocked = app.achievements.filter(a => a.unlocked).length;
    document.getElementById('achieveCount').textContent = unlocked + '/' + app.achievements.length;
    
    container.innerHTML = app.achievements.map(a => {
        return '<div class="achievement-item ' + (a.unlocked ? '' : 'locked') + '">' +
            '<span class="icon">' + a.icon + '</span>' +
            '<div class="name">' + a.name + '</div>' +
            (!a.unlocked ? '<div class="progress-bar"><div class="fill" style="width:' + ((a.progress/a.max)*100) + '%"></div></div>' : '') +
        '</div>';
    }).join('');
}
