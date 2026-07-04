// ============================================================
//  ТЕМА И ФОН
// ============================================================
function toggleTheme(app) {
    app.darkTheme = !app.darkTheme;
    document.documentElement.setAttribute('data-theme', app.darkTheme ? 'dark' : 'light');
    document.getElementById('themeBtn').textContent = app.darkTheme ? '🌙' : '☀️';
    document.getElementById('themeToggle').classList.toggle('active', app.darkTheme);
    localStorage.setItem('theme', app.darkTheme ? 'dark' : 'light');
}

function loadTheme(app) {
    const saved = localStorage.getItem('theme');
    if (saved === 'light') {
        app.darkTheme = false;
        document.documentElement.setAttribute('data-theme', 'light');
        document.getElementById('themeBtn').textContent = '☀️';
        document.getElementById('themeToggle').classList.remove('active');
    }
}

function setBg(app, bg) {
    app.currentBg = bg;
    document.querySelectorAll('.bg-option').forEach(el => {
        el.classList.toggle('active', el.dataset.bg === bg);
    });
    document.querySelectorAll('.bg-option-btn').forEach(el => {
        el.classList.toggle('active', el.dataset.bg === bg);
    });
    localStorage.setItem('bg', bg);
    
    const names = { dark: 'Тёмный', gradient: 'Градиент', particles: 'Частицы' };
    document.getElementById('bgDisplay').textContent = names[bg] || 'Тёмный';
    
    if (bg === 'particles') generateParticles();
    closeModal('bgModal');
}

function generateParticles() {
    const container = document.getElementById('particlesBg');
    if (!container) return;
    container.innerHTML = '';
    for (let i = 0; i < 30; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        const size = 2 + Math.random() * 6;
        p.style.width = size + 'px';
        p.style.height = size + 'px';
        p.style.left = Math.random() * 100 + '%';
        p.style.animationDuration = 10 + Math.random() * 20 + 's';
        p.style.animationDelay = Math.random() * 20 + 's';
        p.style.opacity = 0.1 + Math.random() * 0.3;
        container.appendChild(p);
    }
}

function loadBg(app) {
    const saved = localStorage.getItem('bg') || 'dark';
    setBg(app, saved);
}

function openBgModal() {
    document.getElementById('bgModal').classList.add('show');
}
