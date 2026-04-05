

// ============================================================
//  ABEAARS - Main SPA Router + Premium Netflix-Style UI
// ============================================================

const API_BASE = "http://127.0.0.1:8000"|| "http://localhost:8001"; // Backend API base URL

const ROUTES = {
    home: renderHome, browse: renderBrowse, discover: renderDiscover,
    sentiment: renderSentiment, predict: renderPredict, about: renderAbout
};

// Genre → gradient color map for poster banners
const GENRE_GRADIENT = {
    'Crime':    'linear-gradient(135deg,#1a1a2e,#16213e,#0f3460)',
    'Action':   'linear-gradient(135deg,#200122,#6f0000)',
    'Horror':   'linear-gradient(135deg,#0d0d0d,#1a0000,#400000)',
    'Romance':  'linear-gradient(135deg,#0f0c29,#302b63,#24243e)',
    'Comedy':   'linear-gradient(135deg,#1a1a00,#2d2d00,#4a3800)',
    'Sci-Fi':   'linear-gradient(135deg,#0a0a1a,#0d1b2a,#1b262c)',
    'Fantasy':  'linear-gradient(135deg,#1a0533,#2d1b69,#11998e)',
    'Drama':    'linear-gradient(135deg,#1c1c1c,#2d2d2d,#3e1f1f)',
    'Historical':'linear-gradient(135deg,#1a1000,#2d1f00,#4a3000)',
    'Sports':   'linear-gradient(135deg,#0a1628,#1e3a5f,#0f2c5a)',
    'Animation':'linear-gradient(135deg,#0d1117,#1b2838,#0f2044)',
    'Thriller': 'linear-gradient(135deg,#1a001a,#2d002d,#3d0033)',
    'Biography':'linear-gradient(135deg,#1a1400,#2d2200,#3d3000)',
};


function getPosterGradient(genres) {
    const g = genres.split(' ')[0];
    return GENRE_GRADIENT[g] || 'linear-gradient(135deg,#1a1a2e,#16213e)';
}

const TYPE_CONFIG = {
    movie:  { icon:'🎬', label:'Movie',      color:'#7928CA', bg:'rgba(121,40,202,0.15)', border:'rgba(121,40,202,0.4)' },
    series: { icon:'📺', label:'Web Series', color:'#E50914', bg:'rgba(229,9,20,0.1)',   border:'rgba(229,9,20,0.35)' },
    show:   { icon:'📡', label:'TV Show',    color:'#00A8E6', bg:'rgba(0,168,230,0.1)',   border:'rgba(0,168,230,0.35)' },
};

function navigate(page) {
    const app = document.getElementById('app');
    const fn = ROUTES[page] || renderHome;
    app.innerHTML = '';
    const container = document.createElement('div');
    container.className = 'page';
    app.appendChild(container);
    fn(container);
    document.querySelectorAll('.nav-link').forEach(l => l.classList.toggle('active', l.dataset.page === page));
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function handleRouting() {
    const hash = location.hash.replace('#', '') || 'home';
    navigate(hash);
}

window.addEventListener('hashchange', handleRouting);
window.addEventListener('DOMContentLoaded', () => {
    handleRouting();
    document.getElementById('nav-toggle').addEventListener('click', () => {
        document.getElementById('nav-links').classList.toggle('open');
    });
    document.addEventListener('click', e => {
        const link = e.target.closest('[data-page]');
        if (link) {
            e.preventDefault();
            location.hash = '#' + link.dataset.page;
            document.getElementById('nav-links').classList.remove('open');
        }
    });
});

// ============================================================
//   POSTER CARD HTML (Premium Netflix-style card)
// ============================================================
function posterCardHTML(movie) {
    const m = getMovieWithMeta(movie);
    const tc = TYPE_CONFIG[m.type] || TYPE_CONFIG.movie;
    const platformFirst = m.platforms[0];
    const pCfg = PLATFORMS[platformFirst?.n] || { color:'#888', label: platformFirst?.n || '—' };
    const hasRating = m.rating !== '—';
    const gradient = getPosterGradient(m.genres);
    const initial = m.title.charAt(0).toUpperCase();
    const secondWord = m.title.split(' ')[1]?.charAt(0) || '';
    const yearStr = m.year !== '—' ? m.year : '';

    // Check static MOVIE_POSTERS map first (from posters.js), then fallback to backend
    const staticPoster = (typeof MOVIE_POSTERS !== 'undefined' && MOVIE_POSTERS[m.title]) || null;
    const posterSrc = staticPoster ? staticPoster : `http://127.0.0.1:8000/poster?title=${encodeURIComponent(m.title)}`;

    return `<div class="poster-card" data-title="${m.title.replace(/"/g, '&quot;')}">
        <div class="poster-banner" style="background:${gradient}; position: relative; overflow: hidden;">
            <img class="poster-img-real" src="${posterSrc}" loading="lazy"
                 onload="this.style.opacity='1'; this.nextElementSibling.style.display='none';"
                 onerror="this.style.display='none';" alt="${m.title}">
            <div class="poster-initial">${initial}${secondWord}</div>
            <div class="poster-type-badge" style="background:${tc.bg};color:${tc.color};border:1px solid ${tc.border};">${tc.icon} ${tc.label}</div>
            ${m.type !== 'movie' && m.seasons ? `<div class="poster-seasons">${m.seasons} Seasons</div>` : ''}
            <div class="poster-overlay">
                <button class="poster-play-btn" onclick="event.stopPropagation();window.open('${m.trailerURL}','_blank')"><i class="fas fa-play"></i> Trailer</button>
                <button class="poster-info-btn" onclick="event.stopPropagation();openMovieModal(getMovieWithMeta(MOVIES_DB.find(x=>x.title==='${m.title.replace(/'/g,"\\'")}')))" title="More Info"><i class="fas fa-info"></i></button>
            </div>
        </div>
        <div class="poster-body">
            <div class="poster-title">${m.title}</div>
            <div class="poster-sub">${yearStr ? yearStr + ' · ' : ''}${m.genres.split(' ').slice(0,2).join(' · ')}</div>
            <div class="poster-footer">
                ${hasRating ? `<span class="poster-rating"><i class="fas fa-star"></i> ${m.rating}</span>` : ''}
                <span class="poster-platform" style="color:${pCfg.color};">${pCfg.label}</span>
            </div>
        </div>
    </div>`;
}

function addPosterListeners(container) {
    container.querySelectorAll('.poster-card').forEach(card => {
        card.addEventListener('click', () => {
            const dbMovie = MOVIES_DB.find(m => m.title === card.dataset.title);
            if (dbMovie) openMovieModal(getMovieWithMeta(dbMovie));
        });
    });
}

// Renders up to MAX_RENDER=18000+ cards at a time to keep 18k item DB fast
  function displayMovies(movies, containerId) {
    const grid = document.getElementById(containerId);
    if (!grid) return;

    const PAGE_SIZE = 100;
    let currentIndex = 0;

    // 🔥 IMPORTANT: FULL RESET (this fixes duplicate button)
    grid.innerHTML = "";

    if (movies.length === 0) {
        grid.innerHTML = `<div class="empty-state"><p>No results found</p></div>`;
        return;
    }

    function renderChunk() {
    const slice = movies.slice(currentIndex, currentIndex + PAGE_SIZE);

    const html = slice.map(m => posterCardHTML(m)).join('');

    // 🔥 FIX: insert BEFORE button (not after)
    const existingBtn = grid.querySelector(".load-more-btn");

    if (existingBtn) {
        existingBtn.insertAdjacentHTML("beforebegin", html);
    } else {
        grid.insertAdjacentHTML("beforeend", html);
    }

    addPosterListeners(grid);
    currentIndex += PAGE_SIZE;
}
    // First render
    renderChunk();

    // ✅ Only ONE button allowed
    if (movies.length > PAGE_SIZE) {
        const btn = document.createElement("button");
        btn.textContent = "Load More";
        btn.className = "btn-primary load-more-btn";
        btn.style.gridColumn = "1 / -1";
        btn.style.margin = "20px auto";

        btn.onclick = () => {
            renderChunk();
            if (currentIndex >= movies.length) {
                btn.remove();
            }
        };

        grid.appendChild(btn);
    }
}

// ============================================================
//  HOME PAGE — Netflix-style horizontal rows
// ============================================================
function renderHome(container) {
    const total = MOVIES_DB.length;
    const movies = MOVIES_DB.filter(m => m.type === 'movie');
    const series = MOVIES_DB.filter(m => m.type === 'series');
    const langs  = [...new Set(MOVIES_DB.map(m => m.lang))].length;

    container.innerHTML = `
    <section class="hero">
        <div class="hero-badge animate-pulse"><i class="fas fa-robot"></i> Powered by BERT Deep Learning · TF-IDF · RandomForest AI</div>
        <h1>The <span class="gradient-text">AI Entertainment</span><br>Universe</h1>
        <p>Discover Movies, Web Series & TV Shows. Find where to stream them, watch trailers, get AI recommendations — all in one place.</p>
        <div class="hero-cta">
            <a href="#browse" data-page="browse" class="btn-primary"><i class="fas fa-th-large"></i> Browse All Content</a>
            <a href="#discover" data-page="discover" class="btn-secondary"><i class="fas fa-wand-magic-sparkles"></i> AI Picks</a>
        </div>
        <div class="stats-row">
            <div class="stat-item"><div class="stat-number">${total}+</div><div class="stat-label">Titles</div></div>
            <div class="stat-item"><div class="stat-number">${movies.length}</div><div class="stat-label">Movies</div></div>
            <div class="stat-item"><div class="stat-number">${series.length}</div><div class="stat-label">Series</div></div>
            <div class="stat-item"><div class="stat-number">${langs}</div><div class="stat-label">Languages</div></div>
            <div class="stat-item"><div class="stat-number">10+</div><div class="stat-label">Platforms</div></div>
        </div>
    </section>

    <div class="home-rows">

        <div class="content-row">
            <div class="row-header">
                <h2>Trending Indian Web Series</h2>
                <a href="#browse" data-page="browse" class="row-link">View All →</a>
            </div>
            <div class="row-scroll" id="row-indian-series"></div>
        </div>

        <div class="content-row">
            <div class="row-header">
                <h2>Top International Shows</h2>
                <a href="#browse" data-page="browse" class="row-link">View All →</a>
            </div>
            <div class="row-scroll" id="row-intl-series"></div>
        </div>

        <div class="content-row">
            <div class="row-header">
                <h2>Bollywood & Hindi Films</h2>
                <a href="#browse" data-page="browse" class="row-link">View All →</a>
            </div>
            <div class="row-scroll" id="row-bollywood"></div>
        </div>

        <div class="content-row">
            <div class="row-header">
                <h2>South Indian Blockbusters</h2>
                <a href="#browse" data-page="browse" class="row-link">View All →</a>
            </div>
            <div class="row-scroll" id="row-south"></div>
        </div>

        <div class="content-row">
            <div class="row-header">
                <h2>Hollywood Classics & Modern Hits</h2>
                <a href="#browse" data-page="browse" class="row-link">View All →</a>
            </div>
            <div class="row-scroll" id="row-hollywood"></div>
        </div>

        <div class="content-row">
            <div class="row-header">
                <h2>Korean & Asian Cinema</h2>
                <a href="#browse" data-page="browse" class="row-link">View All →</a>
            </div>
            <div class="row-scroll" id="row-korean"></div>
        </div>

    </div>`;

    // Fill rows
    const indianSeries = MOVIES_DB.filter(m => m.type === 'series' && m.country === 'India').slice(0, 12);
    const intlSeries   = MOVIES_DB.filter(m => m.type === 'series' && m.country !== 'India').slice(0, 12);
    const bollywood    = MOVIES_DB.filter(m => m.type === 'movie' && m.lang === 'Hindi').slice(0, 12);
    const south        = MOVIES_DB.filter(m => m.type === 'movie' && ['Telugu','Tamil','Malayalam','Kannada'].includes(m.lang)).slice(0, 12);
    const hollywood    = MOVIES_DB.filter(m => m.type === 'movie' && m.country === 'USA').slice(0, 12);
    const korean       = MOVIES_DB.filter(m => ['Korean','Japanese','Mandarin'].includes(m.lang)).slice(0, 12);

    const rows = [
        ['row-indian-series', indianSeries],
        ['row-intl-series', intlSeries],
        ['row-bollywood', bollywood],
        ['row-south', south],
        ['row-hollywood', hollywood],
        ['row-korean', korean],
    ];

    rows.forEach(([id, data]) => {
        const el = container.querySelector(`#${id}`);
        if (el && data.length) {
            el.innerHTML = data.map(m => posterCardHTML(m)).join('');
            addPosterListeners(el);
        }
    });
}

// ============================================================
//  BROWSE PAGE — Enhanced with type filter chips
// ============================================================
function renderBrowse(container) {
    const languages  = [...new Set(MOVIES_DB.map(m => m.lang))].sort();
    const platforms  = [...new Set(MOVIES_DB.map(m => {
        const meta = MOVIE_META[m.title];
        return meta?.platforms?.map(p => p.n) || [];
    }).flat())].sort();

    container.innerHTML = `
    <div class="page-section browse-page">
        <div class="browse-hero">
            <div class="browse-hero-text">
                <h1><span class="gradient-text">Browse</span> All Content</h1>
                <p>${MOVIES_DB.length.toLocaleString()}+ Movies, Web Series &amp; TV Shows across 10+ streaming platforms</p>
            </div>
        </div>

        <!-- Content Type Pills -->
        <div class="type-pill-row">
            <button class="type-pill active" data-type="all">
                <i class="fas fa-th-large"></i> All
                <span class="pill-badge">${MOVIES_DB.length.toLocaleString()}</span>
            </button>
            <button class="type-pill" data-type="movie">
                <i class="fas fa-film"></i> Movies
                <span class="pill-badge">${MOVIES_DB.filter(m=>m.type==='movie').length.toLocaleString()}</span>
            </button>
            <button class="type-pill" data-type="series">
                <i class="fas fa-tv"></i> Web Series
                <span class="pill-badge">${MOVIES_DB.filter(m=>m.type==='series').length.toLocaleString()}</span>
            </button>
            <button class="type-pill" data-type="show">
                <i class="fas fa-satellite-dish"></i> TV Shows
                <span class="pill-badge">${MOVIES_DB.filter(m=>m.type==='show').length.toLocaleString()}</span>
            </button>
        </div>

        <!-- Search + Filters -->
        <div class="browse-controls glass-filter">
            <div class="browse-search-wrap">
                <i class="fas fa-search browse-search-icon"></i>
                <input type="text" id="browse-search" class="browse-search-input" placeholder="Search by title, genre, overview, director...">
                <button class="browse-search-clear" id="browse-clear" style="display:none;" title="Clear">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="browse-filter-row">
                <div class="filter-group">
                    <label class="filter-label"><i class="fas fa-globe-asia"></i> Language</label>
                    <select class="filter-select-v2" id="filter-lang">
                        <option value="">All Languages</option>
                        ${languages.map(l=>`<option>${l}</option>`).join('')}
                    </select>
                </div>
                <div class="filter-group">
                    <label class="filter-label"><i class="fas fa-play-circle"></i> Platform</label>
                    <select class="filter-select-v2" id="filter-platform">
                        <option value="">All Platforms</option>
                        ${platforms.map(p=>`<option>${p}</option>`).join('')}
                    </select>
                </div>
                <div class="filter-group">
                    <label class="filter-label"><i class="fas fa-sort-amount-down"></i> Sort By</label>
                    <select class="filter-select-v2" id="filter-sort">
                        <option value="default">Recommended</option>
                        <option value="rating">Highest Rated</option>
                        <option value="year_new">Newest First</option>
                        <option value="year_old">Oldest First</option>
                    </select>
                </div>
            </div>
        </div>

        <div class="browse-results-bar">
            <p class="movies-count" id="movies-count"></p>
        </div>
        <div class="poster-grid" id="browse-grid"></div>
    </div>`

    let currentType = 'all';

    container.querySelectorAll('.type-pill').forEach(chip => {
        chip.addEventListener('click', () => {
            container.querySelectorAll('.type-pill').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            currentType = chip.dataset.type;
            applyFilters();
        });
    });

    // Search clear button
    const searchInput = container.querySelector('#browse-search');
    const clearBtn = container.querySelector('#browse-clear');
    if (searchInput && clearBtn) {
        searchInput.addEventListener('input', () => {
            clearBtn.style.display = searchInput.value ? 'flex' : 'none';
        });
        clearBtn.addEventListener('click', () => {
            searchInput.value = '';
            clearBtn.style.display = 'none';
            applyFilters();
        });
    }

    function applyFilters() {
        const q        = container.querySelector('#browse-search').value.toLowerCase();
        const lang     = container.querySelector('#filter-lang').value;
        const platform = container.querySelector('#filter-platform').value;
        const sort     = container.querySelector('#filter-sort').value;

        let filtered = MOVIES_DB.map(getMovieWithMeta).filter(m => {
            const matchType = currentType === 'all' || m.type === currentType;
            const matchQ = !q || m.title.toLowerCase().includes(q) || m.overview.toLowerCase().includes(q) || m.genres.toLowerCase().includes(q) || (m.director||'').toLowerCase().includes(q);
            const matchL = !lang || m.lang === lang;
            const matchP = !platform || m.platforms.some(p => p.n === platform);
            return matchType && matchQ && matchL && matchP;
        });

        if (sort === 'rating') filtered.sort((a,b) => (parseFloat(b.rating)||0) - (parseFloat(a.rating)||0));
        else if (sort === 'year_new') filtered.sort((a,b) => (parseInt(b.year)||0) - (parseInt(a.year)||0));
        else if (sort === 'year_old') filtered.sort((a,b) => (parseInt(a.year)||0) - (parseInt(b.year)||0));

        container.querySelector('#movies-count').textContent = `${filtered.length} titles found`;
        displayMovies(filtered, 'browse-grid');
    }

    ['#browse-search','#filter-lang','#filter-platform','#filter-sort'].forEach(sel => {
        container.querySelector(sel).addEventListener('input', applyFilters);
        container.querySelector(sel).addEventListener('change', applyFilters);
    });
    applyFilters();
}

// ============================================================
//  DISCOVER (AI Recommendations) PAGE
// ============================================================
function renderDiscover(container) {
    container.innerHTML = `
    <div class="tools-page">
        <div class="page-title-block"><h1>🎬 AI Content Recommendations</h1><p>Get 6 similar titles — movies or series — with streaming platform info and trailer links</p></div>
        <div class="glass-card">
            <div class="card-header"><i class="fas fa-wand-magic-sparkles accent-icon"></i><h2>Smart Discovery</h2></div>
            <p class="section-desc">TF-IDF Vector Search · 18,700+ Content Database · Search by <strong>movie title</strong> or <strong>genre</strong></p>
            <div class="modern-input">
                <i class="fas fa-search input-icon"></i>
                <input type="text" id="movie-search" placeholder="Enter a movie title or genre (e.g. Action, Horror)..." onkeydown="if(event.key==='Enter')getRecommendations()">
                <button class="btn-primary" onclick="getRecommendations()"><span>Discover</span> <i class="fas fa-arrow-right"></i></button>
            </div>
            <div style="margin-top:1rem;">
                <p style="font-size:0.72rem;color:var(--text-secondary);text-transform:uppercase;letter-spacing:1px;margin-bottom:0.6rem;">🎬 Popular Titles</p>
                <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-bottom:0.9rem;">
                    ${['RRR','Breaking Bad','Scam 1992 The Harshad Mehta Story','Inception','Mirzapur','Parasite','3 Idiots','Game of Thrones'].map(t =>
                        `<button class="quick-tag-btn" onclick="document.getElementById('movie-search').value='${t}';getRecommendations()">${t}</button>`
                    ).join('')}
                </div>
                <p style="font-size:0.72rem;color:var(--text-secondary);text-transform:uppercase;letter-spacing:1px;margin-bottom:0.6rem;">🎭 Browse by Genre</p>
                <div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
                    ${['Action','Thriller','Drama','Comedy','Horror','Sci-Fi','Romance','Crime','Mystery','Animation','Biography','History','Sports','Fantasy','Documentary'].map(g =>
                        `<button class="quick-tag-btn genre-tag-btn" onclick="document.getElementById('movie-search').value='${g}';getRecommendations()">
                            <i class="fas fa-tag" style="font-size:0.65rem;"></i> ${g}</button>`
                    ).join('')}
                </div>
            </div>
            <div id="recommendation-results" class="results-container"></div>
        </div>
        <div class="glass-card info-card">
            <h3><i class="fas fa-circle-info" style="color:var(--accent1);"></i> How it works</h3>
            <p>Our AI uses <strong>TF-IDF + Cosine Similarity</strong> — a content-based filtering algorithm that finds the most thematically similar titles based on genres, plot, and language. You can search by <strong>movie/series name</strong> or by <strong>genre</strong> to discover top-rated content in that category.</p>
        </div>
    </div>`;
}

// ============================================================
//  SENTIMENT AI PAGE
// ============================================================
function renderSentiment(container) {
    container.innerHTML = `
    <div class="tools-page">
        <div class="page-title-block"><h1>🧠 Deep Learning Sentiment Analysis</h1><p>Analyze reviews using multilingual BERT from HuggingFace</p></div>
        <div class="glass-card">
            <div class="card-header"><i class="fas fa-brain accent-icon"></i><h2>Review Analyzer</h2></div>
            <p class="section-desc">BERT Transformer · Works in Hindi, Tamil, English, Korean, Spanish, and more</p>
            <div class="modern-input" style="flex-direction:column;align-items:stretch;">
                <div style="display:flex;align-items:flex-start;padding:0.4rem;">
                    <i class="fas fa-comment-dots input-icon" style="margin-top:0.8rem;"></i>
                    <textarea id="review-text" rows="4" style="background:none;border:none;outline:none;color:white;font-family:inherit;font-size:1.05rem;padding:0.8rem 0;flex:1;resize:vertical;" placeholder="Write a movie or series review in any language..."></textarea>
                </div>
                <div style="padding:0 0.5rem 0.5rem;">
                    <button class="btn-primary" onclick="analyzeSentiment()"><i class="fas fa-microchip"></i> Analyze with BERT</button>
                </div>
            </div>
            <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-top:1rem;">
                <span style="color:var(--text-secondary);font-size:0.82rem;align-self:center;">Try a sample:</span>
                ${[
                    ['Positive','Mirzapur is an absolute masterpiece! The writing, performances, and tension are all top-notch. Completely gripping from start to finish.'],
                    ['Mixed','Breaking Bad is well-crafted but the pacing in season 2 is quite slow. The overall story is brilliant despite the lull.'],
                    ['Negative','Terrible writing, boring plot, and the acting is atrocious. Complete waste of 8 episodes.']
                ].map(([l,t]) => `<button class="quick-tag-btn" onclick="document.getElementById('review-text').value=\`${t}\`;analyzeSentiment()">${l}</button>`).join('')}
            </div>
            <div id="sentiment-results" class="results-container"></div>
        </div>
        <div class="glass-card info-card">
            <h3><i class="fas fa-circle-info" style="color:var(--accent1);"></i> About the Model</h3>
            <p>This uses <strong>BERT (Bidirectional Encoder Representations from Transformers)</strong> — a pre-trained deep learning model from HuggingFace. It reads the full context of a review bidirectionally and outputs a 1–5 star rating with a confidence percentage.</p>
        </div>
    </div>`;
}

// ============================================================
//  POPULARITY PREDICT PAGE
// ============================================================
function renderPredict(container) {
    container.innerHTML = `
    <div class="tools-page">
        <div class="page-title-block"><h1>📊 Box Office Popularity AI</h1><p>Predict a movie's global popularity score using our ML model</p></div>
        <div class="glass-card">
            <div class="card-header"><i class="fas fa-chart-line accent-icon"></i><h2>Popularity Predictor</h2></div>
            <p class="section-desc">RandomForest Regression Model · Predicts TMDB Popularity Scale (0–100)</p>
            <div class="form-grid">
                <div><label class="input-label"><i class="fas fa-dollar-sign"></i> Budget (Millions USD)</label><div class="icon-input"><i class="fas fa-dollar-sign"></i><input type="number" id="budget-input" value="100" min="0"></div></div>
                <div><label class="input-label"><i class="fas fa-clock"></i> Runtime (Minutes)</label><div class="icon-input"><i class="fas fa-clock"></i><input type="number" id="runtime-input" value="120" min="1"></div></div>
                <div><label class="input-label"><i class="fas fa-tags"></i> Number of Genres</label><div class="icon-input"><i class="fas fa-tags"></i><input type="number" id="genres-input" value="3" min="1" max="8"></div></div>
            </div>
            <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-top:1.5rem;">
                <span style="color:var(--text-secondary);font-size:0.82rem;align-self:center;">Presets:</span>
                ${[['Indie Film','5,90,1'],['Mid-Budget','50,110,2'],['Blockbuster','200,145,3'],['Epic','300,180,4']].map(([l,v]) => {
                    const [b,r,g] = v.split(',');
                    return `<button class="quick-tag-btn" onclick="document.getElementById('budget-input').value=${b};document.getElementById('runtime-input').value=${r};document.getElementById('genres-input').value=${g};predictPopularity()">${l}</button>`;
                }).join('')}
            </div>
            <button onclick="predictPopularity()" class="btn-primary" style="width:100%;justify-content:center;margin-top:2rem;padding:1.1rem;font-size:1.15rem;">
                <i class="fas fa-globe"></i> Predict Global Popularity Score
            </button>
            <div id="popularity-results" class="results-container"></div>
        </div>
        <div class="glass-card info-card">
            <h3><i class="fas fa-circle-info" style="color:var(--accent1);"></i> How it works</h3>
            <p>Our <strong>RandomForest Regression</strong> model was trained on movie production features — budget, runtime, and genre count — and outputs a predicted TMDB-style popularity score. Score ≥ 80 = Blockbuster, ≥ 60 = Hit, ≥ 40 = Average, ≤ 40 = Limited Release.</p>
        </div>
    </div>`;
}

// ============================================================
//  ABOUT PAGE
// ============================================================
function renderAbout(container) {
    const total = MOVIES_DB.length;
    const movies = MOVIES_DB.filter(m=>m.type==='movie').length;
    const series = MOVIES_DB.filter(m=>m.type==='series').length;

    container.innerHTML = `
    <div class="page-section">
        <div class="page-title-block"><h1>About <span class="gradient-text">ABEAARS</span></h1><p>AI-Based Entertainment Analytics &amp; Recommendation System — Problem Domain 4</p></div>
        <div class="stats-row" style="margin-bottom:3rem;">
            <div class="stat-item"><div class="stat-number">${total}+</div><div class="stat-label">Total Titles</div></div>
            <div class="stat-item"><div class="stat-number">${movies}</div><div class="stat-label">Movies</div></div>
            <div class="stat-item"><div class="stat-number">${series}</div><div class="stat-label">Web Series</div></div>
            <div class="stat-item"><div class="stat-number">10+</div><div class="stat-label">OTT Platforms</div></div>
            <div class="stat-item"><div class="stat-number">3</div><div class="stat-label">AI Models</div></div>
        </div>
        <div class="about-grid">
            <div class="about-card"><div class="about-card-icon">🎬</div><h3>Movie Recommendations</h3><p>TF-IDF + Cosine Similarity content-based filtering. Finds the 6 most similar titles from 350+ database using genre, plot, and language vectors.</p><ul class="tech-list"><li class="tech-badge">TF-IDF</li><li class="tech-badge">Cosine Similarity</li><li class="tech-badge">Scikit-Learn</li></ul></div>
            <div class="about-card"><div class="about-card-icon">🧠</div><h3>Deep Learning Sentiment</h3><p>HuggingFace BERT Transformer model. Truly multilingual — understands context in Hindi, Tamil, English, Korean, Spanish and more.</p><ul class="tech-list"><li class="tech-badge">BERT</li><li class="tech-badge">HuggingFace</li><li class="tech-badge">PyTorch</li></ul></div>
            <div class="about-card"><div class="about-card-icon">📊</div><h3>Popularity Prediction</h3><p>RandomForest Regression trained on production features — budget, runtime, genre count — to predict TMDB popularity scores.</p><ul class="tech-list"><li class="tech-badge">RandomForest</li><li class="tech-badge">Scikit-Learn</li><li class="tech-badge">Pandas</li></ul></div>
            <div class="about-card"><div class="about-card-icon">📺</div><h3>OTT Platform Data</h3><p>Streaming availability for Netflix, Prime Video, Disney+ Hotstar, JioCinema, HBO Max, ZEE5, SonyLIV, Crunchyroll, Apple TV+, MUBI, Voot, Shemaroo.</p><ul class="tech-list"><li class="tech-badge">Netflix</li><li class="tech-badge">Prime Video</li><li class="tech-badge">HBO Max</li><li class="tech-badge">Hotstar</li></ul></div>
            <div class="about-card"><div class="about-card-icon">⚡</div><h3>Backend API</h3><p>FastAPI with Uvicorn ASGI server. 3 REST endpoints with CORS enabled. Model loading cached at startup for fast responses.</p><ul class="tech-list"><li class="tech-badge">FastAPI</li><li class="tech-badge">Python 3.9+</li><li class="tech-badge">Uvicorn</li></ul></div>
            <div class="about-card"><div class="about-card-icon">🌐</div><h3>Frontend SPA</h3><p>6-page Single Page Application with hash-based routing. Netflix-style horizontal rows, poster cards, modal detail popups.</p><ul class="tech-list"><li class="tech-badge">HTML5</li><li class="tech-badge">CSS3</li><li class="tech-badge">Vanilla JS</li></ul></div>
        </div>
    </div>`;
}

// ============================================================
//   MOVIE CARD HTML (legacy compact style for recommendation results)
// ============================================================
function movieCardHTML(movie) {
    const tc = TYPE_CONFIG[movie.type] || TYPE_CONFIG.movie;
    const platforms = (movie.platforms || []).slice(0,3);
    const platformBadges = platforms.map(p => {
        const cfg = PLATFORMS[p.n] || { color:'#555', label: p.n };
        return `<span class="platform-badge" style="background:${cfg.color}22;color:${cfg.color};border-color:${cfg.color}44;">${cfg.label}</span>`;
    }).join('');

    return `<div class="movie-card" data-title="${movie.title}" style="cursor:pointer;">
        <div class="movie-card-header">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:0.5rem;">
                <div class="movie-title">${movie.title}</div>
                <span style="font-size:0.72rem;background:${tc.bg};color:${tc.color};border:1px solid ${tc.border};padding:0.15rem 0.5rem;border-radius:4px;white-space:nowrap;">${tc.icon} ${tc.label}</span>
            </div>
            <div class="movie-genres">${movie.genres.split(' ').slice(0,3).join(' · ')}</div>
            ${movie.year !== '—' ? `<div style="font-size:0.75rem;color:var(--text-secondary);margin-top:0.2rem;">${movie.year}${movie.director ? ' · Dir: '+movie.director : ''}</div>` : ''}
        </div>
        <div class="movie-overview">${movie.overview}</div>
        <div class="movie-card-footer">
            <div class="platform-badges-row">${platformBadges}</div>
            <div style="display:flex;gap:0.5rem;margin-top:0.7rem;">
                <button class="trailer-btn" data-title="${movie.title}" onclick="event.stopPropagation();">▶ Trailer</button>
                <button class="movie-recommend-btn" data-movie="${movie.title}" onclick="event.stopPropagation();">Similar →</button>
            </div>
        </div>
    </div>`;
}

function addCardListeners(container) {
    container.querySelectorAll('.movie-card').forEach(card => {
        card.addEventListener('click', () => {
            const dbMovie = MOVIES_DB.find(m => m.title === card.dataset.title);
            if (dbMovie) openMovieModal(getMovieWithMeta(dbMovie));
        });
    });
    container.querySelectorAll('.trailer-btn').forEach(btn => {
        btn.addEventListener('click', () => window.open(trailerURL(btn.dataset.title), '_blank'));
    });
    container.querySelectorAll('.movie-recommend-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            location.hash = '#discover';
            setTimeout(() => {
                const inp = document.getElementById('movie-search');
                if (inp) { inp.value = btn.dataset.movie; getRecommendations(); }
            }, 300);
        });
    });
}

// ============================================================
//   MOVIE DETAIL MODAL
// ============================================================
function openMovieModal(movie) {
    document.getElementById('movie-modal')?.remove();

    const tc = TYPE_CONFIG[movie.type] || TYPE_CONFIG.movie;
    const platforms = movie.platforms || [];
    const watchBtns = platforms.map(p => {
        const cfg = PLATFORMS[p.n] || { color:'#555', label:p.n };
        const isFree = p.t === 'free';
        const url = PLATFORM_URL[p.n] ? PLATFORM_URL[p.n](movie.title) : '#';
        return `<a href="${url}" target="_blank" class="watch-btn" style="background:${cfg.color}22;border:1px solid ${cfg.color}55;color:${cfg.color};">
            <i class="fas fa-play"></i> Watch on ${cfg.label}
            ${isFree ? '<span class="free-tag">FREE</span>' : '<span style="margin-left:auto;font-size:0.7rem;opacity:0.7;">Subscription</span>'}
        </a>`;
    }).join('');

    const starsHTML = movie.rating !== '—'
        ? Array.from({length:5}).map((_,i) => `<i class="fas fa-star" style="color:${i < Math.round(movie.rating/2) ? '#FFD700':'#333'};"></i>`).join('')
        : '';

    const extraInfo = movie.type !== 'movie' && movie.seasons
        ? `<span class="modal-badge" style="background:rgba(255,255,255,0.08);">${movie.seasons} Seasons · ${movie.episodes} Episodes</span>` : '';

    const posterUrl = (typeof MOVIE_POSTERS !== 'undefined' && MOVIE_POSTERS[movie.title]) ? MOVIE_POSTERS[movie.title] : null;

    const modal = document.createElement('div');
    modal.id = 'movie-modal';
    modal.innerHTML = `
    <div class="modal-overlay" id="modal-overlay">
        <div class="modal-box">
            <button class="modal-close" id="modal-close"><i class="fas fa-xmark"></i></button>
            <div class="modal-poster-header" style="${posterUrl ? `background: url('${posterUrl}') center/top/cover;` : `background:${getPosterGradient(movie.genres)};`}">
                ${!posterUrl ? `<div class="modal-poster-initial">${movie.title.charAt(0)}</div>` : ''}
                <div class="modal-poster-type" style="background:${tc.bg};color:${tc.color};border:1px solid ${tc.border};">${tc.icon} ${tc.label}</div>
            </div>
            <div class="modal-content">
                <h2 class="modal-title">${movie.title}</h2>
                <div class="modal-meta-row">
                    <span class="modal-badge" style="background:rgba(255,255,255,0.06);">${movie.year}</span>
                    ${movie.rating !== '—' ? `<span class="modal-badge" style="background:rgba(255,215,0,0.1);color:#FFD700;">${starsHTML} ${movie.rating}/10</span>` : ''}
                    <span class="modal-badge" style="background:rgba(255,255,255,0.06);">${movie.lang} · ${movie.country}</span>
                    ${extraInfo}
                </div>
                ${movie.director && movie.director !== 'Unknown' ? `<p style="color:var(--text-secondary);font-size:0.85rem;margin-bottom:1rem;"><i class="fas fa-user-tie" style="color:var(--accent1);"></i> Directed by <strong style="color:white;">${movie.director}</strong></p>` : ''}
                <div class="modal-genres">${movie.genres.split(' ').map(g=>`<span class="genre-tag">${g}</span>`).join('')}</div>
                <p class="modal-overview">${movie.overview}</p>
                <div class="modal-section">
                    <h3><i class="fab fa-youtube" style="color:#FF0000;"></i> Official Trailer</h3>
                    <a href="${movie.trailerURL}" target="_blank" class="trailer-big-btn"><i class="fab fa-youtube"></i> Watch Trailer on YouTube</a>
                </div>
                <div class="modal-section">
                    <h3><i class="fas fa-tv" style="color:var(--accent1);"></i> Where to Watch</h3>
                    <div class="watch-btns-grid">${watchBtns || '<p style="color:var(--text-secondary)">Platform info unavailable</p>'}</div>
                    <p style="color:var(--text-secondary);font-size:0.75rem;margin-top:0.8rem;"><i class="fas fa-info-circle"></i> Availability may vary by region. Links open platform search for this title.</p>
                </div>
                <div class="modal-footer">
                    <button class="btn-primary" onclick="event.stopPropagation();location.hash='#discover';document.getElementById('movie-modal').remove();setTimeout(()=>{let i=document.getElementById('movie-search');if(i){i.value='${movie.title.replace(/'/g,"\\'")}';getRecommendations();}},300);">
                        <i class="fas fa-wand-magic-sparkles"></i> Find Similar Titles
                    </button>
                </div>
            </div>
        </div>
    </div>`;

    document.body.appendChild(modal);
    requestAnimationFrame(() => modal.classList.add('modal-open'));

    const close = () => { modal.classList.remove('modal-open'); setTimeout(() => modal.remove(), 300); };
    document.getElementById('modal-close').addEventListener('click', close);
    document.getElementById('modal-overlay').addEventListener('click', e => { if (e.target.id === 'modal-overlay') close(); });
    document.addEventListener('keydown', function esc(e) { if (e.key==='Escape') { close(); document.removeEventListener('keydown', esc); }});
}

// ============================================================
//   API FUNCTIONS
// ============================================================
async function getRecommendations() {
    const query = (document.getElementById("movie-search")?.value || "").trim();
    const resultsDiv = document.getElementById("recommendation-results");
    if (!resultsDiv) return;
    if (!query) { resultsDiv.innerHTML = errBox("Please enter a movie title or genre (e.g. Action, Horror, Drama)."); return; }
    resultsDiv.innerHTML = loadingHTML("Finding similar content...");

    // Detect if the query is a genre keyword
    const KNOWN_GENRES = ["action","thriller","drama","comedy","horror","sci-fi","romance","crime",
                          "mystery","animation","biography","history","sports","fantasy","documentary",
                          "adventure","musical","family","war","western","superhero","psychological",
                          "suspense","noir","political","satire","crime"];
    const lowerQuery = query.trim().toLowerCase(); const isGenreSearch = KNOWN_GENRES.includes(lowerQuery) &&
                          !MOVIES_DB.some(m => m.title.toLowerCase() === query.toLowerCase());

    if (isGenreSearch) {
        const genreKey = query.toLowerCase();
        const matched = MOVIES_DB
            .map(m => getMovieWithMeta(m))
            .filter(m => {
    const g = m.genres.toLowerCase();

// normalize separators
const normalized = g.replace(/[,|/-]/g, " ");

return (
    normalized.includes(genreKey) ||
    normalized.split(" ").includes(genreKey) ||
    (genreKey === "history" && normalized.includes("historical")) ||
    (genreKey === "sci-fi" && (normalized.includes("science fiction") || normalized.includes("sci fi")))
);
})
            .sort((a, b) => (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0))
            .slice(0, 12);

        if (!matched.length) {
            resultsDiv.innerHTML = errBox(`No titles found for "<strong>${query}</strong>". Try: Action, Drama, Thriller, Comedy, Horror, Sci-Fi, Crime.`);
            return;
        }

        const genreHeader = `<div class="info-pill"><i class="fas fa-tag" style="color:var(--accent1);"></i> Top <strong>${matched.length}</strong> <em>${query}</em> titles &mdash; sorted by rating</div>`;
        const cards = matched.map((m, i) => {
            const tc = TYPE_CONFIG[m.type] || TYPE_CONFIG.movie;
            const badges = (m.platforms || []).slice(0, 2).map(p => {
                const cfg = PLATFORMS[p.n] || { color: "#555", label: p.n };
                return `<span class="platform-badge" style="background:${cfg.color}22;color:${cfg.color};border-color:${cfg.color}44;">${cfg.label}</span>`;
            }).join("");
            return `<div class="recommendation-card" data-title="${m.title}" style="animation-delay:${i * 0.06}s">
                <div class="rec-card-left"><div class="rec-num">${i + 1}</div></div>
                <div class="rec-card-center">
                    <div style="display:flex;align-items:center;gap:0.5rem;">
                        <div class="rec-title">${m.title}</div>
                        <span style="font-size:0.68rem;background:${tc.bg};color:${tc.color};border:1px solid ${tc.border};padding:0.1rem 0.4rem;border-radius:3px;">${tc.icon}</span>
                    </div>
                    <div style="font-size:0.78rem;color:var(--text-secondary);">${m.genres.split(" ").slice(0,3).join(" · ")} · ${m.year}</div>
                    <div class="platform-badges-row" style="margin-top:0.5rem;">${badges}</div>
                </div>
                <div class="rec-card-right">
                    ${m.rating !== "\u2014" ? `<span style="color:#FFD700;font-size:0.82rem;"><i class="fas fa-star"></i> ${m.rating}</span>` : ""}
                    <a href="${m.trailerURL}" target="_blank" class="trailer-btn" onclick="event.stopPropagation();">&#9654; Trailer</a>
                </div>
            </div>`;
        }).join("");
        resultsDiv.innerHTML = genreHeader + cards;
        resultsDiv.querySelectorAll(".recommendation-card").forEach(card => {
            card.addEventListener("click", () => {
                const dbMovie = MOVIES_DB.find(m => m.title === card.dataset.title);
                if (dbMovie) openMovieModal(getMovieWithMeta(dbMovie));
            });
        });
        return;
    }

    // Normal title search via backend TF-IDF
    try {
        const res  = await fetch(`${API_BASE}/recommend?movie_title=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (data.error || !data.recommendations?.length) {
    // 🔥 fallback to frontend DB
    const fallback = MOVIES_DB
        .filter(m => {
    const t = m.title.toLowerCase();
    const q = query.toLowerCase();
    return t.includes(q) || q.includes(t);
})
        .slice(0, 6);

    if (fallback.length) {
        resultsDiv.innerHTML = `<div class="info-pill">Showing results from local database</div>` +
            fallback.map(movieCardHTML).join('');
        addCardListeners(resultsDiv);
        return;
    }

    resultsDiv.innerHTML = errBox(`No AI match for "<strong>${query}</strong>"`);
    return;
}
        if (data.recommendations?.length) {
            const matchedInfo = data.matched ? `<div class="info-pill"><i class="fas fa-check-circle" style="color:var(--success-color);"></i> Matched: <strong>${data.matched}</strong></div>` : "";
            const recCards = data.recommendations.map((title, i) => {
                const dbMovie = MOVIES_DB.find(m => m.title === title);
                if (!dbMovie) return `<div class="recommendation-card" style="animation-delay:${i*0.08}s"><div class="rec-card-left"><div class="rec-num">${i+1}</div></div><div class="rec-card-center"><div class="rec-title">${title}</div></div></div>`;
                const m = getMovieWithMeta(dbMovie);
                const tc = TYPE_CONFIG[m.type] || TYPE_CONFIG.movie;
                const badges = (m.platforms||[]).slice(0,2).map(p => {
                    const cfg = PLATFORMS[p.n] || {color:"#555",label:p.n};
                    return `<span class="platform-badge" style="background:${cfg.color}22;color:${cfg.color};border-color:${cfg.color}44;">${cfg.label}</span>`;
                }).join("");
                return `<div class="recommendation-card" data-title="${title}" style="animation-delay:${i*0.08}s">
                    <div class="rec-card-left"><div class="rec-num">${i+1}</div></div>
                    <div class="rec-card-center">
                        <div style="display:flex;align-items:center;gap:0.5rem;">
                            <div class="rec-title">${title}</div>
                            <span style="font-size:0.68rem;background:${tc.bg};color:${tc.color};border:1px solid ${tc.border};padding:0.1rem 0.4rem;border-radius:3px;">${tc.icon}</span>
                        </div>
                        <div style="font-size:0.78rem;color:var(--text-secondary);">${m.genres.split(" ").slice(0,3).join(" · ")} · ${m.year} · ${m.director}</div>
                        <div class="platform-badges-row" style="margin-top:0.5rem;">${badges}</div>
                    </div>
                    <div class="rec-card-right">
                        ${m.rating !== "\u2014" ? `<span style="color:#FFD700;font-size:0.82rem;"><i class="fas fa-star"></i> ${m.rating}</span>` : ""}
                        <a href="${m.trailerURL}" target="_blank" class="trailer-btn" onclick="event.stopPropagation();">&#9654; Trailer</a>
                    </div>
                </div>`;
            }).join("");
            resultsDiv.innerHTML = matchedInfo + recCards;
            resultsDiv.querySelectorAll(".recommendation-card").forEach(card => {
                card.addEventListener("click", () => {
                    const dbMovie = MOVIES_DB.find(m => m.title === card.dataset.title);
                    if (dbMovie) openMovieModal(getMovieWithMeta(dbMovie));
                });
            });
        } else {
            resultsDiv.innerHTML = errBox(`No AI match for "<strong>${query}</strong>". Try a genre: <em>Action, Drama, Horror, Sci-Fi</em>`);
        }
    } catch (err) {
    console.warn("Backend offline, using local DB");

    const fallback = MOVIES_DB
        .filter(m => {
            const t = m.title.toLowerCase();
            const q = query.toLowerCase();
            return t.includes(q) || q.includes(t);
        })
        .slice(0, 6);

    if (fallback.length) {
        resultsDiv.innerHTML =
            `<div class="info-pill">⚡ Offline Mode: Showing local results</div>` +
            fallback.map(movieCardHTML).join('');

        addCardListeners(resultsDiv);
    } else {
        resultsDiv.innerHTML = errBox("No results found (offline mode)");
    }
} }

async function analyzeSentiment() {
    const text = document.getElementById("review-text")?.value;
    const resultsDiv = document.getElementById("sentiment-results");
    if (!resultsDiv) return;
    if (!text) { resultsDiv.innerHTML = errBox('Please write a review.'); return; }
    resultsDiv.innerHTML = loadingHTML('BERT model analyzing...');
    try {
        const res  = await fetch(`${API_BASE}/sentiment`, { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({text}) });
        const data = await res.json();
        if (data.error) { resultsDiv.innerHTML = errBox(data.error); return; }
        const pos = data.sentiment === 'Positive';
        const starsHTML = Array.from({length:5}).map((_,i) => `<span style="color:${i<data.stars?'#FFD700':'#555'};font-size:1.4rem;">★</span>`).join('');
        const pct = Math.round(data.deep_learning_score * 100);
        resultsDiv.innerHTML = `<div class="sentiment-box ${pos?'positive':'negative'}">
            <h3 style="color:${pos?'var(--success-color)':'var(--danger-color)'};margin-bottom:0.6rem;"><i class="fas ${pos?'fa-smile-beam':'fa-frown-open'}"></i> ${data.sentiment} Review</h3>
            <div class="stars-row">${starsHTML}</div>
            <div class="progress-bar-wrap"><div class="progress-bar-fill" style="width:${pct}%"></div></div>
            <p style="color:var(--text-secondary);font-size:0.9rem;"><i class="fas fa-robot"></i> Confidence: <strong>${pct}%</strong> · <i class="fas fa-star"></i> ${data.stars}/5 Stars</p>
        </div>`;
    } catch { resultsDiv.innerHTML = errBox('Backend offline. Start the API server first.'); }
}

async function predictPopularity() {
    const budget_m   = parseFloat(document.getElementById("budget-input")?.value);
    const runtime    = parseInt(document.getElementById("runtime-input")?.value);
    const num_genres = parseInt(document.getElementById("genres-input")?.value);
    const resultsDiv = document.getElementById("popularity-results");
    if (!resultsDiv) return;
    if (isNaN(budget_m)||isNaN(runtime)||isNaN(num_genres)) { resultsDiv.innerHTML = errBox('Enter valid numbers.'); return; }
    resultsDiv.innerHTML = loadingHTML('Running ML model...');
    try {
        const res  = await fetch(`${API_BASE}/predict`, { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({budget_m, runtime, num_genres}) });
        const data = await res.json();
        if (data.error) { resultsDiv.innerHTML = errBox(data.error); return; }
        const score = data.popularity;
        const tier  = score>=80?{label:'🏆 Blockbuster',color:'var(--success-color)'}:score>=60?{label:'⭐ Hit',color:'#FFD700'}:score>=40?{label:'📽 Average',color:'var(--accent2)'}:{label:'🎬 Limited Release',color:'var(--text-secondary)'};
        resultsDiv.innerHTML = `<div class="popularity-box">
            <p style="text-transform:uppercase;letter-spacing:1px;color:var(--text-secondary);font-size:0.85rem;">Predicted Popularity Score</p>
            <div class="pop-score">${score}</div>
            <div class="progress-bar-wrap"><div class="progress-bar-fill" id="pop-bar" style="width:0%"></div></div>
            <p style="margin-top:0.5rem;"><span style="background:${tier.color}22;color:${tier.color};border:1px solid ${tier.color}44;padding:0.2rem 0.8rem;border-radius:4px;font-size:0.85rem;">${tier.label}</span></p>
        </div>`;
        requestAnimationFrame(() => { document.getElementById('pop-bar').style.width = Math.min(score,100)+'%'; });
    } catch { resultsDiv.innerHTML = errBox('Backend offline. Start the API server first.'); }
}

function loadingHTML(msg) { return `<div class="loading-spin"><i class="fas fa-spinner fa-spin fa-2x"></i><p>${msg}</p></div>`; }
function errBox(msg) { return `<div class="sentiment-box negative" style="border-left-color:var(--danger-color);"><i class="fas fa-circle-exclamation"></i> ${msg}</div>`; }