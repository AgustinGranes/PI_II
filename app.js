/* ===== POLE Motorsport — app.js ===== */

/* ---- Static data ---- */
const CATEGORIAS = ['F1', 'WEC', 'WRC', 'TC', 'INDYCAR', 'NASCAR'];

const EVENTOS = [
    { name: 'Carrera 1', desc: 'Descripción', time: '20:00hs' },
    { name: 'Carrera 2', desc: 'Descripción', time: '20:00hs' },
    { name: 'Carrera 3', desc: 'Descripción', time: '20:00hs' },
    { name: 'Carrera 4', desc: 'Descripción', time: '20:00hs' },
    { name: 'Carrera 5', desc: 'Descripción', time: '20:00hs' },
    { name: 'Carrera 6', desc: 'Descripción', time: '20:00hs' },
    { name: 'Carrera 7', desc: 'Descripción', time: '20:00hs' },
];

const NOTICIAS = [
    {
        cat: 'Formula 1',
        title: 'La Fórmula 1 cambia el reglamento tras los primeros Grandes Premios',
        img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Red_Bull_Racing_RB16B_front_2021.jpg/1280px-Red_Bull_Racing_RB16B_front_2021.jpg',
    },
    {
        cat: 'MotoGP',
        title: 'Marc Márquez habla sobre su relación con el dinero: "Mi carre..."',
        img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Marc_Marquez_2019_Sepang_1.jpg/1280px-Marc_Marquez_2019_Sepang_1.jpg',
    },
    {
        cat: 'WRC',
        title: 'Dani Sordo está ilusionado con su regreso al WRC en Canarias',
        img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Hyundai_i20_WRC_-_Sébastien_Loeb_-_Rally_Italia_Sardegna_2022.jpg/1280px-Hyundai_i20_WRC_-_Sébastien_Loeb_-_Rally_Italia_Sardegna_2022.jpg',
    },
];

const CLASIFICACION = [
    { pos: 1, corredor: 'Verstappen', pts: 25, pts2: 10 },
    { pos: 2, corredor: 'Leclerc', pts: 23, pts2: 9 },
    { pos: 3, corredor: 'Hamilton', pts: 19, pts2: 6 },
    { pos: 4, corredor: 'Norris', pts: 19, pts2: 5 },
    { pos: 5, corredor: 'Piastri', pts: 17, pts2: 9 },
    { pos: 6, corredor: 'Russell', pts: 16, pts2: 8 },
    { pos: 7, corredor: 'Sainz', pts: 15, pts2: 10 },
    { pos: 8, corredor: 'Alonso', pts: 12, pts2: 4 },
    { pos: 9, corredor: 'Pérez', pts: 9, pts2: 2 },
    { pos: 10, corredor: 'Gasly', pts: 5, pts2: 10 },
];

const CAL_RACES = [
    { name: 'Carrera 1', desc: 'Descripción', time: '20:00hs' },
    { name: 'Carrera 2', desc: 'Descripción', time: '20:00hs' },
    { name: 'Carrera 3', desc: 'Descripción', time: '20:00hs' },
    { name: 'Carrera 4', desc: 'Descripción', time: '20:00hs' },
    { name: 'Carrera 5', desc: 'Descripción', time: '20:00hs' },
    { name: 'Carrera 6', desc: 'Descripción', time: '20:00hs' },
    { name: 'Carrera 7', desc: 'Descripción', time: '20:00hs' },
];

const CAT_NOTICIAS = [
    { title: 'Noticia 1', desc: 'Descripción', date: 'Fecha' },
    { title: 'Noticia 2', desc: 'Descripción', date: 'Fecha' },
    { title: 'Noticia 3', desc: 'Descripción', date: 'Fecha' },
    { title: 'Noticia 4', desc: 'Descripción', date: 'Fecha' },
    { title: 'Noticia 5', desc: 'Descripción', date: 'Fecha' },
    { title: 'Noticia 6', desc: 'Descripción', date: 'Fecha' },
    { title: 'Noticia 7', desc: 'Descripción', date: 'Fecha' },
];

const FEATURED_IMAGES = {
    F1: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Red_Bull_Racing_RB16B_front_2021.jpg/1280px-Red_Bull_Racing_RB16B_front_2021.jpg',
    WEC: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/24h_du_Mans_2014_%2814310853497%29.jpg/1280px-24h_du_Mans_2014_%2814310853497%29.jpg',
    WRC: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Hyundai_i20_WRC_-_Sébastien_Loeb_-_Rally_Italia_Sardegna_2022.jpg/1280px-Hyundai_i20_WRC_-_Sébastien_Loeb_-_Rally_Italia_Sardegna_2022.jpg',
    TC: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/WTCC_2012_round_in_Zandvoort_2.jpg/1280px-WTCC_2012_round_in_Zandvoort_2.jpg',
    INDYCAR: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Will_Power_2015_Indianapolis_500.jpg/1280px-Will_Power_2015_Indianapolis_500.jpg',
    NASCAR: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/NASCAR_Sprint_Cup_Series_Daytona_500_2012.jpg/1280px-NASCAR_Sprint_Cup_Series_Daytona_500_2012.jpg',
    HOME: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Red_Bull_Racing_RB16B_front_2021.jpg/1280px-Red_Bull_Racing_RB16B_front_2021.jpg',
};

const CAT_COLORS = {
    F1: '#e10600', WEC: '#0070c0', WRC: '#007a3d', TC: '#f5a623',
    INDYCAR: '#00aeef', NASCAR: '#f5c518',
};

let currentCat = 'F1';
let currentPage = 'home'; // 'home' | 'categoria'

/* ===================== INIT ===================== */
document.addEventListener('DOMContentLoaded', () => {
    buildNav();
    buildSidebar();
    buildMobileDrawer();
    buildHomePage();
    buildCategoryPage(currentCat);
    showPage('home');
    setupEvents();
});

/* ===================== NAV ===================== */
function buildNav() {
    const dropdown = document.getElementById('cat-dropdown-menu');
    if (!dropdown) return;
    CATEGORIAS.forEach(cat => {
        const a = document.createElement('a');
        a.href = '#';
        a.textContent = cat;
        a.addEventListener('click', e => { e.preventDefault(); navigateToCat(cat); });
        dropdown.appendChild(a);
    });
}

function buildSidebar() {
    const sb = document.getElementById('sidebar-links');
    if (!sb) return;
    CATEGORIAS.forEach(cat => {
        const a = document.createElement('a');
        a.href = '#';
        a.textContent = cat;
        a.id = `sb-${cat}`;
        a.addEventListener('click', e => { e.preventDefault(); navigateToCat(cat); });
        sb.appendChild(a);
    });
}

function buildMobileDrawer() {
    const dl = document.getElementById('drawer-cat-links');
    if (!dl) return;
    CATEGORIAS.forEach(cat => {
        const a = document.createElement('a');
        a.href = '#';
        a.textContent = cat;
        a.addEventListener('click', e => { e.preventDefault(); navigateToCat(cat); closeDrawer(); });
        dl.appendChild(a);
    });
}

/* ===================== HOME PAGE ===================== */
function buildHomePage() {
    // Featured image
    const fi = document.getElementById('home-featured');
    if (fi) {
        fi.innerHTML = `<img src="${FEATURED_IMAGES.HOME}" alt="Destacado" onerror="this.parentElement.classList.add('img-placeholder')">`;
    }

    // Eventos
    renderEventos(document.getElementById('eventos-list'), EVENTOS.slice(0, 3));

    // Noticias home
    const ng = document.getElementById('noticias-home-grid');
    if (!ng) return;
    NOTICIAS.forEach(n => {
        ng.appendChild(createNewsCard(n));
    });
}

function renderEventos(container, eventos) {
    if (!container) return;
    container.innerHTML = '';
    eventos.forEach(e => {
        const div = document.createElement('div');
        div.className = 'evento-item';
        div.innerHTML = `
      <div class="e-bullet"></div>
      <div class="e-info">
        <div class="e-name">${e.name}</div>
        <div class="e-desc">${e.desc}</div>
      </div>
      <div class="e-time">${e.time}</div>`;
        container.appendChild(div);
    });
}

function createNewsCard(n) {
    const card = document.createElement('div');
    card.className = 'news-card';
    card.innerHTML = `
    <div class="news-card-img">
      <img src="${n.img}" alt="${n.title}" loading="lazy" onerror="this.style.display='none'">
    </div>
    <div class="news-card-body">
      <div class="news-card-cat">${n.cat}</div>
      <div class="news-card-title">${n.title}</div>
    </div>`;
    return card;
}

/* ===================== CATEGORY PAGE ===================== */
function buildCategoryPage(cat) {
    currentCat = cat;

    // Header
    const title = document.getElementById('cat-page-title');
    if (title) title.textContent = catFullName(cat);

    const logoEl = document.getElementById('cat-logo');
    if (logoEl) {
        logoEl.textContent = cat;
        logoEl.style.color = CAT_COLORS[cat] || '#e10600';
    }

    // Featured cat image
    const catImg = document.getElementById('cat-featured');
    if (catImg) {
        catImg.innerHTML = `<img src="${FEATURED_IMAGES[cat] || FEATURED_IMAGES.HOME}" alt="${cat}" onerror="this.parentElement.classList.add('img-placeholder')">`;
    }

    // Clasificacion
    const tbody = document.getElementById('tabla-body');
    if (tbody) {
        tbody.innerHTML = '';
        CLASIFICACION.forEach(r => {
            const tr = document.createElement('tr');
            const posClass = r.pos === 1 ? 'pos pos-1' : r.pos === 2 ? 'pos pos-2' : r.pos === 3 ? 'pos pos-3' : 'pos';
            tr.innerHTML = `
        <td class="${posClass}">${r.pos}</td>
        <td class="corredor">${r.corredor}</td>
        <td class="pts">${r.pts}</td>
        <td class="pts-sec">${r.pts2}</td>`;
            tbody.appendChild(tr);
        });
    }

    // Calendario (cat)
    const calList = document.getElementById('cat-cal-list');
    if (calList) {
        calList.innerHTML = '';
        CAL_RACES.forEach((r, i) => {
            const div = document.createElement('div');
            div.className = 'cal-item';
            div.innerHTML = `
        <div class="cal-num">${i + 1}</div>
        <div class="cal-info">
          <div class="cal-name">${r.name}</div>
          <div class="cal-desc">${r.desc}</div>
        </div>
        <div class="cal-time">${r.time}</div>`;
            calList.appendChild(div);
        });
    }

    // Noticias (cat)
    const notList = document.getElementById('cat-noticias-list');
    if (notList) {
        notList.innerHTML = '';
        CAT_NOTICIAS.forEach(n => {
            const div = document.createElement('div');
            div.className = 'noticia-list-item';
            div.innerHTML = `
        <div class="n-info">
          <div class="n-title">${n.title}</div>
          <div class="n-desc">${n.desc}</div>
        </div>
        <div class="n-date">${n.date}</div>`;
            notList.appendChild(div);
        });
    }
}

function catFullName(cat) {
    const names = {
        F1: 'Formula 1', WEC: 'WEC', WRC: 'WRC',
        TC: 'Turismo Carretera', INDYCAR: 'IndyCar', NASCAR: 'NASCAR',
    };
    return names[cat] || cat;
}

/* ===================== NAVIGATION ===================== */
function showPage(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(`page-${page}`)?.classList.add('active');
    currentPage = page;
    updateActiveLinks(page);
}

function navigateToCat(cat) {
    buildCategoryPage(cat);
    showPage('categoria');
    // reset tabs on medium
    setActiveTab('clasificacion');
}

function navigateHome() {
    showPage('home');
}

function updateActiveLinks(page) {
    // nav-links
    document.querySelectorAll('#nav-links a').forEach(a => {
        a.classList.toggle('active', a.dataset.page === page);
    });
    // sidebar
    document.querySelectorAll('#sidebar a').forEach(a => {
        a.classList.toggle('active', a.dataset.page === page);
    });
    // drawer
    document.querySelectorAll('#mobile-drawer a[data-page]').forEach(a => {
        a.classList.toggle('active', a.dataset.page === page);
    });
}

/* ===================== TABS ===================== */
function setActiveTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.tab === tabId);
    });
    document.querySelectorAll('.tab-panel').forEach(p => {
        p.classList.toggle('active', p.id === `tab-${tabId}`);
    });
}

/* ===================== EVENTS SETUP ===================== */
function setupEvents() {
    // Hamburger
    const btnMenu = document.getElementById('btn-menu');
    const drawer = document.getElementById('mobile-drawer');
    const overlay = document.getElementById('overlay');

    btnMenu?.addEventListener('click', () => {
        const open = drawer.classList.toggle('open');
        btnMenu.classList.toggle('open', open);
        overlay.classList.toggle('show', open);
    });
    overlay?.addEventListener('click', closeDrawer);

    // Nav home link
    document.querySelectorAll('[data-page="home"]').forEach(el => {
        el.addEventListener('click', e => { e.preventDefault(); navigateHome(); closeDrawer(); });
    });

    // Dropdown toggle
    const dropdown = document.querySelector('.dropdown');
    const dropBtn = document.getElementById('cat-dropdown-btn');
    dropBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('open');
    });
    document.addEventListener('click', () => dropdown?.classList.remove('open'));

    // Tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => setActiveTab(btn.dataset.tab));
    });

    // Day nav (static, cosmetic)
    document.querySelectorAll('.day-nav button').forEach(btn => {
        btn.addEventListener('click', () => {
            const label = btn.parentElement.querySelector('.day-label');
            if (!label) return;
            if (label.textContent === 'Hoy') label.textContent = 'Mañana';
            else label.textContent = 'Hoy';
        });
    });
}

function closeDrawer() {
    document.getElementById('mobile-drawer')?.classList.remove('open');
    document.getElementById('btn-menu')?.classList.remove('open');
    document.getElementById('overlay')?.classList.remove('show');
}