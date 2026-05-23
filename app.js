/* ===== POLE Motorsport — app.js ===== */

// Global Error Boundary to help catch and debug any client-side issues
window.addEventListener('error', function(e) {
    console.error("Global Error Captured:", e.message, "at", e.filename, ":", e.lineno);
    const debugDiv = document.createElement('div');
    debugDiv.style.position = 'fixed';
    debugDiv.style.bottom = '0';
    debugDiv.style.left = '0';
    debugDiv.style.right = '0';
    debugDiv.style.background = '#e10600';
    debugDiv.style.color = '#fff';
    debugDiv.style.padding = '12px';
    debugDiv.style.zIndex = '99999';
    debugDiv.style.fontSize = '12px';
    debugDiv.style.fontFamily = 'monospace';
    debugDiv.style.borderTop = '3px solid #fff';
    debugDiv.innerHTML = `<strong>Error de Aplicación:</strong> ${e.message} <br> <em>${e.filename} (Línea ${e.lineno})</em>`;
    document.body.appendChild(debugDiv);
});

/* ---- Static / Configuration Data ---- */
const CATEGORIAS = ['F1', 'WEC', 'WRC', 'TC', 'INDYCAR', 'NASCAR'];

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

/* ===== Global State ===== */
const STATE = {
    categories: {
        F1: null,
        WEC: null,
        WRC: null,
        TC: null,
        INDYCAR: null,
        NASCAR: null
    },
    loading: false
};

let currentCat = 'F1';
let currentPage = 'home'; // 'home' | 'categoria'

/* ===================== INIT ===================== */
document.addEventListener('DOMContentLoaded', () => {
    buildNav();
    buildSidebar();
    buildMobileDrawer();
    setupEvents();
    showPage('home');
    loadAllData();
});

/* ===================== API SERVICE ===================== */
async function fetchCategoryData(cat) {
    const key = cat.toUpperCase();
    if (STATE.categories[key]) {
        return STATE.categories[key];
    }
    const catId = cat.toLowerCase();
    const url = `https://vueltadeinstalacion.vercel.app/api/${catId}`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        STATE.categories[key] = data;
        return data;
    } catch (e) {
        console.error(`Error fetching data for ${cat}:`, e);
        return null;
    }
}

async function loadAllData() {
    STATE.loading = true;
    showLoadingState(true);

    let loadedAny = false;
    let settledCount = 0;

    const promises = CATEGORIAS.map(async (cat) => {
        try {
            const data = await fetchCategoryData(cat);
            if (data) {
                loadedAny = true;
                // Render incrementally as each category returns its data!
                buildHomePage();
                if (currentPage === 'categoria' && currentCat === cat) {
                    buildCategoryPage(cat);
                }
            }
        } catch (e) {
            console.error(`Error in background load for ${cat}:`, e);
        } finally {
            settledCount++;
            if (settledCount === CATEGORIAS.length) {
                STATE.loading = false;
                if (!loadedAny) {
                    // If absolutely everything failed, display clean fallback messages
                    buildHomePage();
                    if (currentPage === 'categoria') {
                        buildCategoryPage(currentCat);
                    }
                }
            }
        }
    });
}

function showLoadingState(isLoading) {
    if (!isLoading) return;
    
    const eventosList = document.getElementById('eventos-list');
    const newsGrid = document.getElementById('noticias-home-grid');
    const tbody = document.getElementById('tabla-body');
    const calList = document.getElementById('cat-cal-list');
    const notList = document.getElementById('cat-noticias-list');

    const loaderHTML = `<div class="loader" style="text-align: center; padding: 20px; color: var(--text-secondary); font-size: 0.9rem;">Cargando datos en vivo...</div>`;
    if (eventosList) eventosList.innerHTML = loaderHTML;
    if (newsGrid) newsGrid.innerHTML = loaderHTML;
    if (tbody) tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-secondary); padding: 20px;">Cargando clasificación...</td></tr>`;
    if (calList) calList.innerHTML = loaderHTML;
    if (notList) notList.innerHTML = loaderHTML;
}

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
        fi.innerHTML = `<img src="${FEATURED_IMAGES.HOME}" alt="Destacado" onerror="this.parentElement && this.parentElement.classList.add('img-placeholder')">`;
    }

    // 1. Unified news list from all loaded categories
    const allNews = [];
    CATEGORIAS.forEach(cat => {
        const data = STATE.categories[cat];
        if (data && data.news && Array.isArray(data.news)) {
            data.news.forEach(n => {
                allNews.push({
                    cat: cat,
                    title: n.title,
                    link: n.link,
                    source: n.source
                });
            });
        }
    });

    const ng = document.getElementById('noticias-home-grid');
    if (ng) {
        ng.innerHTML = '';
        if (allNews.length === 0) {
            if (STATE.loading) {
                ng.innerHTML = `<div class="loader" style="text-align: center; padding: 20px; color: var(--text-secondary); font-size: 0.9rem; width: 100%;">Cargando últimas noticias...</div>`;
            } else {
                ng.innerHTML = `<div style="text-align: center; padding: 20px; color: var(--text-secondary); width: 100%;">No hay noticias disponibles en este momento.</div>`;
            }
        } else {
            allNews.slice(0, 9).forEach(n => {
                ng.appendChild(createNewsCard(n));
            });
        }
    }

    // 2. Unified upcoming events from all loaded categories
    const allEvents = [];
    CATEGORIAS.forEach(cat => {
        const data = STATE.categories[cat];
        if (data && data.calendar && Array.isArray(data.calendar)) {
            const upcoming = data.calendar.filter(r => r.status === 'Upcoming' || r.status === 'Next' || r.status === 'Live');
            upcoming.forEach(r => {
                allEvents.push({
                    cat: cat,
                    name: r.race,
                    desc: `${cat} • ${r.status === 'Live' ? 'EN VIVO' : 'Próxima carrera'}`,
                    time: formatRaceDate(r),
                    dateObj: r.startDate ? new Date(r.startDate) : null
                });
            });
        }
    });

    // Sort events by date if available
    allEvents.sort((a, b) => {
        if (a.dateObj && b.dateObj) return a.dateObj - b.dateObj;
        if (a.dateObj) return -1;
        if (b.dateObj) return 1;
        return 0;
    });

    const eventosList = document.getElementById('eventos-list');
    if (eventosList) {
        if (allEvents.length === 0) {
            if (STATE.loading) {
                eventosList.innerHTML = `<div class="loader" style="text-align: center; padding: 20px; color: var(--text-secondary); font-size: 0.9rem;">Cargando próximos eventos...</div>`;
            } else {
                // Fallback: show finished races
                const fallbackEvents = [];
                CATEGORIAS.forEach(cat => {
                    const data = STATE.categories[cat];
                    if (data && data.calendar && Array.isArray(data.calendar)) {
                        const finished = data.calendar.filter(r => r.status === 'Finished');
                        finished.slice(-1).forEach(r => {
                            fallbackEvents.push({
                                cat: cat,
                                name: r.race,
                                desc: `${cat} • Finalizado`,
                                time: formatRaceDate(r)
                            });
                        });
                    }
                });

                if (fallbackEvents.length === 0) {
                    eventosList.innerHTML = `<div style="text-align: center; padding: 20px; color: var(--text-secondary);">No hay eventos programados.</div>`;
                } else {
                    renderEventos(eventosList, fallbackEvents);
                }
            }
        } else {
            renderEventos(eventosList, allEvents.slice(0, 6));
        }
    }
}

function renderEventos(container, eventos) {
    if (!container) return;
    container.innerHTML = '';
    eventos.forEach(e => {
        const div = document.createElement('div');
        div.className = 'evento-item';
        div.innerHTML = `
      <div class="e-bullet" style="background: ${CAT_COLORS[e.cat] || 'var(--accent)'};"></div>
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
    card.style.cursor = 'pointer';
    card.innerHTML = `
    <div class="news-card-body">
      <div class="news-card-cat" style="color: ${CAT_COLORS[n.cat] || 'var(--accent)'};">${n.cat}</div>
      <div class="news-card-title">${n.title}</div>
      ${n.source ? `<div class="news-card-source" style="font-size: 0.75rem; color: var(--text-muted); margin-top: 8px;">Fuente: ${n.source}</div>` : ''}
    </div>`;
    card.addEventListener('click', () => {
        if (n.link) window.open(n.link, '_blank');
    });
    return card;
}

/* ===================== CATEGORY PAGE ===================== */
async function buildCategoryPage(cat) {
    currentCat = cat;

    const tbody = document.getElementById('tabla-body');
    const calList = document.getElementById('cat-cal-list');
    const notList = document.getElementById('cat-noticias-list');

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
        catImg.innerHTML = `<img src="${FEATURED_IMAGES[cat] || FEATURED_IMAGES.HOME}" alt="${cat}" onerror="this.parentElement && this.parentElement.classList.add('img-placeholder')">`;
    }

    // Show loaders immediately if not already cached
    const key = cat.toUpperCase();
    if (!STATE.categories[key]) {
        const loaderHTML = `<div class="loader" style="text-align: center; padding: 20px; color: var(--text-secondary); font-size: 0.9rem;">Cargando ${cat}...</div>`;
        if (tbody) tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-secondary); padding: 20px;">Cargando clasificación de ${cat}...</td></tr>`;
        if (calList) calList.innerHTML = loaderHTML;
        if (notList) notList.innerHTML = loaderHTML;
    }

    // Fetch the data and await it!
    const data = await fetchCategoryData(cat);

    if (!data) {
        if (tbody) tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--accent); padding: 20px;">Error al cargar la clasificación.</td></tr>`;
        if (calList) calList.innerHTML = `<div style="text-align: center; padding: 20px; color: var(--accent);">Error al cargar el calendario.</div>`;
        if (notList) notList.innerHTML = `<div style="text-align: center; padding: 20px; color: var(--accent);">Error al cargar las noticias.</div>`;
        return;
    }

    // Render Standings
    renderStandingsTable(data.standings);

    // Render Calendar
    renderCategoryCalendar(data.calendar);

    // Render News
    renderCategoryNews(data.news);
}

function renderStandingsTable(standings) {
    const thead = document.querySelector('.tabla-clasificacion thead');
    const tbody = document.getElementById('tabla-body');
    if (!tbody || !thead) return;

    tbody.innerHTML = '';

    if (!standings) {
        thead.innerHTML = `<tr><th class="num">#</th><th>Clasificación</th><th style="text-align:right">Pts</th></tr>`;
        tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; color: var(--text-muted); padding: 20px;">Clasificación no disponible en esta categoría.</td></tr>`;
        return;
    }

    let list = [];
    let hasTeam = false;

    if (Array.isArray(standings)) {
        list = standings;
    } else if (standings && standings.drivers) {
        list = standings.drivers;
    } else if (standings && standings.constructors) {
        list = standings.constructors;
    }

    if (list.length === 0) {
        thead.innerHTML = `<tr><th class="num">#</th><th>Clasificación</th><th style="text-align:right">Pts</th></tr>`;
        tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; color: var(--text-muted); padding: 20px;">No hay clasificaciones cargadas.</td></tr>`;
        return;
    }

    hasTeam = list.some(item => item.team);

    if (hasTeam) {
        thead.innerHTML = `
            <tr>
                <th class="num">#</th>
                <th>Piloto</th>
                <th>Equipo</th>
                <th style="text-align:right">Pts</th>
            </tr>`;
    } else {
        thead.innerHTML = `
            <tr>
                <th class="num">#</th>
                <th>Piloto / Equipo</th>
                <th style="text-align:right">Pts</th>
            </tr>`;
    }

    list.forEach(r => {
        const tr = document.createElement('tr');
        const pos = parseInt(r.pos) || 1;
        const posClass = pos === 1 ? 'pos pos-1' : pos === 2 ? 'pos pos-2' : pos === 3 ? 'pos pos-3' : 'pos';

        if (hasTeam) {
            tr.innerHTML = `
                <td class="${posClass}">${r.pos}</td>
                <td class="corredor">${r.driver || r.team || ''}</td>
                <td style="color: var(--text-secondary);">${r.team || ''}</td>
                <td class="pts">${r.points || '0'}</td>`;
        } else {
            tr.innerHTML = `
                <td class="${posClass}">${r.pos}</td>
                <td class="corredor">${r.driver || r.team || ''}</td>
                <td class="pts">${r.points || '0'}</td>`;
        }
        tbody.appendChild(tr);
    });
}

function renderCategoryCalendar(calendar) {
    const calList = document.getElementById('cat-cal-list');
    if (!calList) return;
    calList.innerHTML = '';

    if (!calendar || !Array.isArray(calendar) || calendar.length === 0) {
        calList.innerHTML = `<div style="text-align: center; padding: 20px; color: var(--text-muted);">No hay carreras programadas en esta categoría.</div>`;
        return;
    }

    calendar.forEach((r, i) => {
        const div = document.createElement('div');
        div.className = 'cal-item';

        let statusText = r.status === 'Finished' ? 'Finalizado' : r.status === 'Live' ? 'EN VIVO' : 'Próximamente';
        if (r.winner) {
            statusText += ` • Ganador: ${r.winner}`;
        }

        div.innerHTML = `
            <div class="cal-num">${r.round || (i + 1)}</div>
            <div class="cal-info">
              <div class="cal-name">${r.race}</div>
              <div class="cal-desc">${statusText}</div>
            </div>
            <div class="cal-time">${formatRaceDate(r)}</div>`;
        calList.appendChild(div);
    });
}

function renderCategoryNews(news) {
    const notList = document.getElementById('cat-noticias-list');
    if (!notList) return;
    notList.innerHTML = '';

    if (!news || !Array.isArray(news) || news.length === 0) {
        notList.innerHTML = `<div style="text-align: center; padding: 20px; color: var(--text-muted);">No hay noticias disponibles en esta categoría.</div>`;
        return;
    }

    news.forEach(n => {
        const div = document.createElement('div');
        div.className = 'noticia-list-item';
        div.style.cursor = 'pointer';
        div.innerHTML = `
            <div class="n-info">
              <div class="n-title" style="font-weight: 600;">${n.title}</div>
              <div class="n-desc" style="font-size: 0.78rem; color: var(--text-muted); margin-top: 4px;">Fuente: ${n.source || 'Motorsport'}</div>
            </div>
            <div class="n-date" style="font-size: 0.78rem; color: var(--text-secondary);">Leer ↗</div>`;
        div.addEventListener('click', () => {
            if (n.link) window.open(n.link, '_blank');
        });
        notList.appendChild(div);
    });
}

function formatRaceDate(item) {
    if (item.dates) return item.dates;
    if (item.startDate) {
        const start = new Date(item.startDate);
        const end = item.endDate ? new Date(item.endDate) : null;
        if (isNaN(start.getTime())) return item.startDate;

        const options = { day: 'numeric', month: 'short' };
        const startFormatted = start.toLocaleDateString('es-AR', options);
        if (end && !isNaN(end.getTime()) && start.getMonth() === end.getMonth()) {
            return `${start.getDate()} - ${end.getDate()} ${start.toLocaleDateString('es-AR', { month: 'short' })}`;
        } else if (end && !isNaN(end.getTime())) {
            return `${startFormatted} - ${end.toLocaleDateString('es-AR', options)}`;
        }
        return startFormatted;
    }
    return '';
}

function catFullName(cat) {
    const names = {
        F1: 'Formula 1', WEC: 'FIA WEC', WRC: 'WRC',
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
    setActiveTab('clasificacion');
}

function navigateHome() {
    showPage('home');
}

function updateActiveLinks(page) {
    document.querySelectorAll('#nav-links a').forEach(a => {
        a.classList.toggle('active', a.dataset.page === page);
    });
    document.querySelectorAll('#sidebar a').forEach(a => {
        a.classList.toggle('active', a.dataset.page === page);
    });
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

    // Wired general links to navigate home & scroll
    document.querySelectorAll('a').forEach(a => {
        if (a.textContent.includes('Calendario')) {
            a.addEventListener('click', e => {
                e.preventDefault();
                navigateHome();
                closeDrawer();
                document.querySelector('.eventos-box')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            });
        }
        if (a.textContent.includes('Noticias')) {
            a.addEventListener('click', e => {
                e.preventDefault();
                navigateHome();
                closeDrawer();
                document.querySelector('.noticias-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        }
    });
}

function closeDrawer() {
    document.getElementById('mobile-drawer')?.classList.remove('open');
    document.getElementById('btn-menu')?.classList.remove('open');
    document.getElementById('overlay')?.classList.remove('show');
}