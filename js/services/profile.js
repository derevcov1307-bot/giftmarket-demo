// ============================================================
//  ПРОФИЛЬ
// ============================================================
function openProfileModal(app) {
    document.getElementById('editName').value = app.user.name;
    document.getElementById('editStatus').value = app.user.status;
    document.getElementById('editBadge').value = app.user.badge;
    document.getElementById('profileModal').classList.add('show');
}

function saveProfile(app) {
    app.user.name = document.getElementById('editName').value || 'Игрок';
    app.user.status = document.getElementById('editStatus').value;
    app.user.badge = document.getElementById('editBadge').value;
    updateUI(app);
    closeModal('profileModal');
    showNotification('✅', 'Профиль обновлён', 'Изменения сохранены');
}

function openStatusModal(app) {
    document.getElementById('statusModal').classList.add('show');
}

function setStatus(app, status) {
    app.user.status = status;
    updateUI(app);
    closeModal('statusModal');
}

function showAbout() {
    showNotification('📖', 'GiftArcade v2.2', 'Игровая платформа с выводом звёзд. Играй, выигрывай, получай подарки!');
}
