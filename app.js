/* ===== POLE Motorsport — app.js ===== */

window.addEventListener('error', function(e) {
    console.error("Global Error Captured:", e.message, "at", e.filename, ":", e.lineno);
});

/* ---- Static Data & API Configuration ---- */
const CATEGORIAS = ['F1', 'WEC', 'WRC', 'TC', 'INDYCAR', 'NASCAR'];

// Imágenes de contingencia (se usan solo si la API no manda imagen de noticia)
const FEATURED_IMAGES = {};
CATEGORIAS.forEach(cat => {
    FEATURED_IMAGES[cat] = `img/${cat.toLowerCase()}-destacado.jpg`;
});
FEATURED_IMAGES.HOME = 'img/home-destacado.jpg';

// Colores de acento
const CAT_COLORS = {
    F1: '#e10600',
    WEC: '#0070c0',
    WRC: '#007a3d',
    TC: '#f5a623',
    INDYCAR: '#00aeef',
    NASCAR: '#f5c518'
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

let currentPage = 'home';
let currentCat = 'F1';

// Controladores de fecha
let currentHomeMonth = new Date().getMonth();
let currentHomeYear = new Date().getFullYear();
let currentCalMonth = new Date().getMonth();
let currentCalYear = new Date().getFullYear();

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
    if (STATE.categories[key]) return STATE.categories[key];
    
    try {
        const res = await fetch(`https://vueltadeinstalacion.vercel.app/api/${cat.toLowerCase()}`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        STATE.categories[key] = data;
        return data;
    } catch (e) {
        console.warn(`Aviso: Error cargando datos para ${cat}. Verificá que la ruta exista en tu API.`, e);
        return null;
    }
}

async function loadAllData() {
    STATE.loading = true;
    showLoadingState(true);
    let settledCount = 0;

    CATEGORIAS.forEach(async (cat) => {
        try {
            const data = await fetchCategoryData(cat);
            if (data) {
                buildHomePage();
                buildGeneralPages();
                if (currentPage === 'categoria' && currentCat === cat) {
                    buildCategoryPage(cat);
                }
            }
        } finally {
            settledCount++;
            if (settledCount === CATEGORIAS.length) {
                STATE.loading = false;
            }
        }
    });
}

function showLoadingState(isLoading) {
    if (!isLoading) return;
    const loaderHTML = `<div class="loader" style="text-align: center; padding: 20px; color: var(--text-secondary);">Cargando datos...</div>`;
    const elementIds = ['eventos-list', 'noticias-home-grid', 'calendario-page-list'];
    elementIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = loaderHTML;
    });
}

/* ===================== CORE UI BUILDERS ===================== */

// --- 1. HOME PAGE ---
function buildHomePage() {
    let featuredNews = null;
    let featuredCat = 'F1';
    
    for (let cat of CATEGORIAS) {
        if (STATE.categories[cat] && STATE.categories[cat].news && STATE.categories[cat].news.length > 0) {
            featuredNews = STATE.categories[cat].news[0];
            featuredCat = cat;
            break;
        }
    }
    
    const fi = document.getElementById('home-featured');
    if (fi && featuredNews) {
        // Usamos la imagen de la noticia o el fallback
        const mainImg = featuredNews.image || FEATURED_IMAGES[featuredCat];
        fi.innerHTML = `
            <img src="${mainImg}" alt="Destacado" onerror="this.src='${FEATURED_IMAGES.HOME}'; this.onerror=null;">
            <div class="featured-overlay">
                <span class="featured-cat" style="color: ${CAT_COLORS[featuredCat] || 'var(--accent)'}">${featuredCat}</span>
                <h2 class="featured-title">${featuredNews.title}</h2>
            </div>`;
            
        fi.onclick = () => {
            if(featuredNews.link) window.open(featuredNews.link, '_blank');
        };
    }

    const homeNews = [];
    CATEGORIAS.forEach(cat => {
        if (STATE.categories[cat] && STATE.categories[cat].news && STATE.categories[cat].news.length > 0) {
            let n = STATE.categories[cat].news[0];
            // Integramos n.image provisto por la API
            homeNews.push({ cat: cat, title: n.title, link: n.link, source: n.source, img: n.image || FEATURED_IMAGES[cat] });
        }
    });

    const ng = document.getElementById('noticias-home-grid');
    if (ng) {
        ng.innerHTML = '';
        homeNews.forEach(n => ng.appendChild(createNewsCard(n)));
    }

    renderHomeEventsList();
}

function renderHomeEventsList() {
    const allEvents = getAllEventsParsed();
    const eventosMes = allEvents.filter(e => e.dateObj && e.dateObj.getMonth() === currentHomeMonth && e.dateObj.getFullYear() === currentHomeYear);
    
    const mesNombre = new Date(currentHomeYear, currentHomeMonth, 1).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
    
    const monthLabel = document.getElementById('home-ev-month');
    if (monthLabel) monthLabel.textContent = mesNombre;

    const list = document.getElementById('eventos-list');
    if (!list) return;
    
    if (eventosMes.length === 0) {
        list.innerHTML = `<div style="text-align:center; padding:20px; color:var(--text-secondary);">No hay eventos programados en ${mesNombre.split(' ')[0]}.</div>`;
    } else {
        renderEventosUI(list, eventosMes);
    }
}

// --- 2. PAGINAS GENERALES ---
function buildGeneralPages() {
    const notCont = document.getElementById('noticias-page-container');
    if (notCont) {
        notCont.innerHTML = '';
        CATEGORIAS.forEach(cat => {
            const data = STATE.categories[cat];
            if (data && data.news && data.news.length > 0) {
                const group = document.createElement('div');
                group.className = 'category-news-group';
                
                const header = document.createElement('div');
                header.className = 'category-news-header';
                header.innerHTML = `<h2 class="category-news-title" style="color: ${CAT_COLORS[cat] || 'var(--accent)'}">${catFullName(cat)}</h2>`;
                
                const wrapper = document.createElement('div');
                wrapper.className = 'news-carousel-wrapper';
                
                const prevBtn = document.createElement('button');
                prevBtn.className = 'carousel-btn prev';
                prevBtn.innerHTML = '◄';
                
                const nextBtn = document.createElement('button');
                nextBtn.className = 'carousel-btn next';
                nextBtn.innerHTML = '►';
                
                const track = document.createElement('div');
                track.className = 'carousel-track';
                
                data.news.forEach(n => {
                    // Integramos n.image provisto por la API en el carrusel
                    track.appendChild(createNewsCard({ cat: cat, title: n.title, link: n.link, source: n.source, img: n.image || FEATURED_IMAGES[cat] }));
                });
                
                prevBtn.onclick = () => track.scrollBy({ left: -320, behavior: 'smooth' });
                nextBtn.onclick = () => track.scrollBy({ left: 320, behavior: 'smooth' });
                
                wrapper.appendChild(prevBtn);
                wrapper.appendChild(track);
                wrapper.appendChild(nextBtn);
                
                group.appendChild(header);
                group.appendChild(wrapper);
                notCont.appendChild(group);
            }
        });
    }

    renderFullCalendar();
}

function renderFullCalendar() {
    const allEvents = getAllEventsParsed();
    const mesNombre = new Date(currentCalYear, currentCalMonth, 1).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
    
    const titleEl = document.getElementById('cal-page-month');
    if (titleEl) titleEl.textContent = mesNombre;

    const eventosMes = allEvents.filter(e => e.dateObj && e.dateObj.getMonth() === currentCalMonth && e.dateObj.getFullYear() === currentCalYear);

    const grid = document.getElementById('cal-page-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const daysInMonth = new Date(currentCalYear, currentCalMonth + 1, 0).getDate();
    const firstDayIndex = new Date(currentCalYear, currentCalMonth, 1).getDay();
    const startOffset = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

    for (let i = 0; i < startOffset; i++) {
        grid.innerHTML += `<div class="cal-cell empty"></div>`;
    }

    const hoy = new Date();
    
    for (let d = 1; d <= daysInMonth; d++) {
        const isToday = (d === hoy.getDate() && currentCalMonth === hoy.getMonth() && currentCalYear === hoy.getFullYear());
        const dayEvents = eventosMes.filter(e => e.dateObj && e.dateObj.getDate() === d);
        
        let raceIndicatorHtml = '';
        if (dayEvents.length > 0) {
            dayEvents.forEach(ev => {
                raceIndicatorHtml += `<div class="cal-race-indicator" style="background-color: ${CAT_COLORS[ev.cat] || 'var(--accent)'}">${ev.cat}</div>`;
            });
        }

        let cellClass = `cal-cell ${dayEvents.length > 0 ? 'has-race' : ''} ${isToday ? 'today' : ''}`;
        
        const cell = document.createElement('div');
        cell.className = cellClass;
        cell.innerHTML = `<span class="day-num">${d}</span>${raceIndicatorHtml}`;
        
        cell.onclick = () => {
            
            const yaSeleccionado = cell.classList.contains('selected-day');

            
            document.querySelectorAll('.cal-cell').forEach(c => c.classList.remove('selected-day'));
            
            if (yaSeleccionado) {
                
                renderCalendarFilteredList(eventosMes, null);
            } else {
                
                cell.classList.add('selected-day');
                renderCalendarFilteredList(eventosMes, d);
            }
        };

        grid.appendChild(cell);
    }
    
    renderCalendarFilteredList(eventosMes, null);
}

function renderCalendarFilteredList(eventosMes, selectedDay) {
    const list = document.getElementById('calendario-page-list');
    const headerTitle = document.getElementById('cal-list-title');
    
    let filtered = eventosMes;
    if (selectedDay !== null) {
        filtered = eventosMes.filter(e => e.dateObj && e.dateObj.getDate() === selectedDay);
        if (headerTitle) headerTitle.textContent = `Carreras del ${selectedDay}`;
    } else {
        if (headerTitle) headerTitle.textContent = `Próximas Carreras`;
    }
    
    if (list) {
        if (filtered.length === 0) {
            list.innerHTML = `<div style="padding:10px; color:var(--text-secondary);">Sin carreras en este día.</div>`;
        } else {
            renderEventosUI(list, filtered);
        }
    }
}


/* ===================== PARSERS Y FORMATEADORES ===================== */

function cleanRaceName(name) {
    if (!name) return "Carrera";
    let clean = name.replace(/_/g, ' ').replace(/-/g, ' ');
    return clean.charAt(0).toUpperCase() + clean.slice(1);
}

function parseDateLocal(dateStr, defaultYear = new Date().getFullYear()) {
    if (!dateStr) return null;
    let str = String(dateStr).trim();
    
    if (str.includes('T') || str.match(/^\d{4}-\d{2}-\d{2}/)) {
        str = str.split('T')[0];
        const parts = str.split('-');
        if (parts.length >= 3) {
            return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        }
    }

    const meses = {
        'ene': 0, 'feb': 1, 'mar': 2, 'abr': 3, 'may': 4, 'jun': 5,
        'jul': 6, 'ago': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dic': 11
    };

    const parts = str.split('-');
    let targetDate = parts[parts.length - 1].trim().toLowerCase(); 
    
    const match = targetDate.match(/(\d+)\s+([a-z]+)/);
    if (match) {
        const day = parseInt(match[1], 10);
        const monthStr = match[2].substring(0, 3);
        const month = meses[monthStr];
        if (month !== undefined) {
            return new Date(defaultYear, month, day);
        }
    }
    
    const parsed = new Date(str);
    return isNaN(parsed.getTime()) ? null : parsed;
}

function getAllEventsParsed() {
    const allEvents = [];
    
    CATEGORIAS.forEach(cat => {
        const data = STATE.categories[cat];
        if (data && data.calendar) {
            data.calendar.forEach(r => {
                let dateObj = null;
                let rawDate = r.dates || r.startDate || r.date || r.fecha || r.raceDate || r.start; 
                
                if (rawDate) {
                    dateObj = parseDateLocal(rawDate);
                }
                
                allEvents.push({
                    cat: cat,
                    name: cleanRaceName(r.race || r.name),
                    desc: `${cat} • ${r.status || 'Programada'}`,
                    time: formatRaceDate(r),
                    dateObj: dateObj
                });
            });
        }
    });
    
    allEvents.sort((a, b) => {
        if (a.dateObj && b.dateObj) return a.dateObj - b.dateObj;
        return 1;
    });
    
    return allEvents;
}

function renderEventosUI(container, eventos) {
    container.innerHTML = '';
    eventos.forEach(e => {
        const div = document.createElement('div');
        div.className = 'evento-item';
        
        let dateString = e.time;
        if (e.dateObj) {
            dateString = `${e.dateObj.getDate()} de ${e.dateObj.toLocaleDateString('es-AR', {month:'long'})}`;
        }
        
        div.innerHTML = `
            <div class="e-bullet" style="background: ${CAT_COLORS[e.cat] || 'var(--accent)'};"></div>
            <div class="e-info">
                <div class="e-name">${e.name}</div>
                <div class="e-desc">${e.desc}</div>
            </div>
            <div class="e-time" style="text-transform: capitalize;">${dateString}</div>`;
            
        container.appendChild(div);
    });
}

function createNewsCard(n) {
    const card = document.createElement('div');
    card.className = 'news-card';
    
    card.innerHTML = `
        <div class="news-card-img">
            <img src="${n.img}" alt="Noticia ${n.cat}" onerror="this.src='${FEATURED_IMAGES.HOME}'; this.onerror=null;">
        </div>
        <div class="news-card-body">
            <div class="news-card-cat" style="color: ${CAT_COLORS[n.cat] || 'var(--accent)'};">${n.cat}</div>
            <div class="news-card-title">${n.title}</div>
            <div class="news-card-source" style="font-size: 0.75rem; color: var(--text-muted); margin-top: auto; padding-top: 8px;">
                Fuente: ${n.source || 'Motorsport'}
            </div>
        </div>`;
        
    card.addEventListener('click', () => {
        if (n.link) window.open(n.link, '_blank');
    });
    
    return card;
}

function formatRaceDate(item) {
    if (item.dates) return item.dates; 
    
    let rawDateStr = item.startDate || item.date || item.fecha || item.raceDate || item.start;
    if (rawDateStr) {
        const start = parseDateLocal(rawDateStr);
        let endRawDateStr = item.endDate || item.end;
        const end = endRawDateStr ? parseDateLocal(endRawDateStr) : null;
        
        if (!start) return rawDateStr;
        const options = { day: 'numeric', month: 'short' };
        
        if (end) return `${start.getDate()} - ${end.toLocaleDateString('es-AR', options)}`;
        return start.toLocaleDateString('es-AR', options);
    }
    return '';
}

function catFullName(cat) {
    const names = { F1: 'Formula 1', WEC: 'FIA WEC', WRC: 'WRC', TC: 'Turismo Carretera', INDYCAR: 'IndyCar', NASCAR: 'NASCAR' };
    return names[cat] || cat;
}

/* ===================== CATEGORY PAGE ===================== */
async function buildCategoryPage(cat) {
    currentCat = cat;
    
    const title = document.getElementById('cat-page-title');
    if (title) title.textContent = catFullName(cat);

    const data = await fetchCategoryData(cat);
    if (!data) return;

    // APLICAMOS LA LECTURA DEL LOGO DIRECTO DESDE LA API
    const logoEl = document.getElementById('cat-logo');
    if (logoEl) {
        if (data.logo) {
            // Inyectamos el SVG/IMG que manda tu JSON
            logoEl.innerHTML = `<img src="${data.logo}" alt="Logo ${cat}">`;
        } else {
            // Plan B por si alguna categoría falla y no manda "logo"
            logoEl.innerHTML = cat;
            logoEl.style.color = CAT_COLORS[cat] || '#e10600';
            logoEl.style.background = 'var(--bg-card)';
            logoEl.style.border = '1px solid var(--border)';
        }
    }

    const tbody = document.getElementById('tabla-body');
    if (tbody) {
        tbody.innerHTML = '';
        let list = [];
        
        if (data.standings && data.standings.drivers) {
            list = data.standings.drivers;
        } else if (Array.isArray(data.standings)) {
            list = data.standings;
        }
        
        list.forEach(r => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="pos" style="text-align:center">${r.pos}</td>
                <td class="corredor">${r.driver || r.team || ''}</td>
                <td class="pts">${r.points || '0'}</td>`;
            tbody.appendChild(tr);
        });
    }

    const calList = document.getElementById('cat-cal-list');
    if (calList && data.calendar) {
        let calHTML = ''; // Creamos un string temporal para almacenar el HTML
        
        data.calendar.forEach((r, i) => {
            // Utilizamos tu propia función para obtener la fecha formateada
            const dateString = formatRaceDate(r);
            
            calHTML += `
                <div class="cal-item">
                    <div class="cal-num">${i + 1}</div>
                    <div class="cal-info">
                        <div class="cal-name">${cleanRaceName(r.race || r.name)}</div>
                        <div class="cal-desc">${r.status || 'Programada'}</div>
                    </div>
                    <div class="cal-time" style="text-transform: capitalize; text-align: right;">
                        ${dateString}
                    </div>
                </div>`;
        });
        
        // Hacemos una única inserción en el DOM
        calList.innerHTML = calHTML; 
    }

    const notList = document.getElementById('cat-noticias-list');
    if (notList && data.news) {
        notList.innerHTML = '';
        data.news.forEach(n => {
            const newsImg = n.image || FEATURED_IMAGES[cat];
            notList.innerHTML += `
                <div class="noticia-list-item" onclick="window.open('${n.link}', '_blank')">
                    <div class="n-img">
                        <img src="${newsImg}" alt="${n.title}" onerror="this.src='${FEATURED_IMAGES.HOME}'; this.onerror=null;">
                    </div>
                    <div class="n-info">
                        <div class="n-title">${n.title}</div>
                        <div class="n-source" style="font-size:0.75rem; color:var(--text-muted)">${n.source || 'Motorsport'}</div>
                    </div>
                </div>`;
        });
    }
}

/* ===================== NAVIGATION & EVENTS ===================== */
function showPage(page) {
    if (!page) return;
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    
    const targetPage = document.getElementById(`page-${page}`);
    if (targetPage) {
        targetPage.classList.add('active');
        currentPage = page;
        updateActiveLinks(page);
    }
}

function navigateToCat(cat) {
    // Al forzar la compilacion de categoria, se leerá el logo.
    buildCategoryPage(cat);
    showPage('categoria');
    setActiveTab('clasificacion');
}

function updateActiveLinks(page) {
    const selectors = '#nav-links a[data-page], #sidebar a[data-page], #mobile-drawer a[data-page]';
    document.querySelectorAll(selectors).forEach(a => {
        a.classList.toggle('active', a.dataset.page === page);
    });
}

function setActiveTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tabId));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.toggle('active', p.id === `tab-${tabId}`));
}

function buildNav() {
    const dropdown = document.getElementById('cat-dropdown-menu');
    CATEGORIAS.forEach(cat => {
        const a = document.createElement('a'); a.href = '#'; a.textContent = cat;
        a.addEventListener('click', e => { e.preventDefault(); navigateToCat(cat); });
        if (dropdown) dropdown.appendChild(a);
    });
}

function buildSidebar() {
    const sb = document.getElementById('sidebar-links');
    CATEGORIAS.forEach(cat => {
        const a = document.createElement('a'); a.href = '#'; a.textContent = cat;
        a.addEventListener('click', e => { e.preventDefault(); navigateToCat(cat); });
        if (sb) sb.appendChild(a);
    });
}

function buildMobileDrawer() {
    const dl = document.getElementById('drawer-cat-links');
    CATEGORIAS.forEach(cat => {
        const a = document.createElement('a'); a.href = '#'; a.textContent = cat;
        a.addEventListener('click', e => { e.preventDefault(); navigateToCat(cat); closeDrawer(); });
        if (dl) dl.appendChild(a);
    });
}

function setupEvents() {
    const btnMenu = document.getElementById('btn-menu');
    const drawer = document.getElementById('mobile-drawer');
    const overlay = document.getElementById('overlay');

    if (btnMenu) {
        btnMenu.addEventListener('click', () => {
            const open = drawer.classList.toggle('open');
            btnMenu.classList.toggle('open', open);
            overlay.classList.toggle('show', open);
        });
    }
    
    if (overlay) overlay.addEventListener('click', closeDrawer);

    document.querySelectorAll('a[data-page]').forEach(el => {
        el.addEventListener('click', e => {
            e.preventDefault();
            showPage(el.dataset.page);
            closeDrawer();
        });
    });

    const dropdown = document.querySelector('.dropdown');
    const dropdownBtn = document.getElementById('cat-dropdown-btn');
    
    if (dropdownBtn) {
        dropdownBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('open');
        });
    }
    document.addEventListener('click', () => { if (dropdown) dropdown.classList.remove('open'); });

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => setActiveTab(btn.dataset.tab));
    });

    const homePrev = document.getElementById('home-ev-prev');
    if (homePrev) homePrev.addEventListener('click', () => {
        currentHomeMonth--; if (currentHomeMonth < 0) { currentHomeMonth = 11; currentHomeYear--; } renderHomeEventsList();
    });
    
    const homeNext = document.getElementById('home-ev-next');
    if (homeNext) homeNext.addEventListener('click', () => {
        currentHomeMonth++; if (currentHomeMonth > 11) { currentHomeMonth = 0; currentHomeYear++; } renderHomeEventsList();
    });

    const calPrev = document.getElementById('cal-page-prev');
    if (calPrev) calPrev.addEventListener('click', () => {
        currentCalMonth--; if (currentCalMonth < 0) { currentCalMonth = 11; currentCalYear--; } renderFullCalendar();
    });
    
    const calNext = document.getElementById('cal-page-next');
    if (calNext) calNext.addEventListener('click', () => {
        currentCalMonth++; if (currentCalMonth > 11) { currentCalMonth = 0; currentCalYear++; } renderFullCalendar();
    });
}

function closeDrawer() {
    const drawer = document.getElementById('mobile-drawer');
    const btnMenu = document.getElementById('btn-menu');
    const overlay = document.getElementById('overlay');
    if (drawer) drawer.classList.remove('open');
    if (btnMenu) btnMenu.classList.remove('open');
    if (overlay) overlay.classList.remove('show');
}