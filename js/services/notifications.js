// ============================================================
//  УВЕДОМЛЕНИЯ
// ============================================================
let notifTimeout = null;

function showNotification(icon, title, desc) {
    const container = document.getElementById('notifContainer');
    if (!container) return;
    
    const notif = document.createElement('div');
    notif.className = 'notification';
    notif.innerHTML = 
        '<span class="icon">' + icon + '</span>' +
        '<div class="content"><div class="title">' + title + '</div><div class="desc">' + desc + '</div></div>' +
        '<button class="close-btn" onclick="this.parentElement.remove()">✕</button>';
    container.appendChild(notif);
    
    if (notifTimeout) clearTimeout(notifTimeout);
    notifTimeout = setTimeout(() => {
        notif.classList.add('out');
        setTimeout(() => notif.remove(), 400);
    }, 4000);
}

function closeModal(id) {
    document.getElementById(id).classList.remove('show');
}
