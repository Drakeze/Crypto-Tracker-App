// CryptoTracker App
let coins = [];
let favorites = new Set(JSON.parse(localStorage.getItem('favorites') || '[]'));
let currentSort = 'market_cap_desc';
let showFavsOnly = false;

const els = {
    grid: document.getElementById('grid'),
    loading: document.getElementById('loading'),
    error: document.getElementById('error'),
    empty: document.getElementById('empty'),
    errorMsg: document.getElementById('errorMsg'),
    status: document.getElementById('status'),
    count: document.getElementById('count'),
    lastUpdate: document.getElementById('lastUpdate'),
    sortSelect: document.getElementById('sortSelect'),
    showFavs: document.getElementById('showFavs'),
    refreshBtn: document.getElementById('refreshBtn'),
    retryBtn: document.getElementById('retryBtn')
};

// Fetch normalized coin data from backend.
async function fetchCoins({ forceRefresh = false } = {}) {
    const refreshFlag = forceRefresh ? '&refresh=1' : '';
    const res = await fetch(`/api/coins?vs_currency=usd${refreshFlag}`);

    let json;
    try {
        json = await res.json();
    } catch {
        throw new Error(`Invalid JSON response (HTTP ${res.status})`);
    }

    if (!res.ok) {
        throw new Error(json?.details || json?.error || `HTTP ${res.status}`);
    }

    if (!Array.isArray(json?.data)) {
        throw new Error('Unexpected API shape: missing data array');
    }

    els.status.textContent = `Loaded from ${json.source || 'server'} (${json.count} coins)`;
    return json.data;
}

// Load and render
async function load({ forceRefresh = false } = {}) {
    showLoading();

    try {
        coins = await fetchCoins({ forceRefresh });
        els.lastUpdate.textContent = new Date().toLocaleString();
        render();
        showGrid();
    } catch (error) {
        showError(error.message);
    }
}

// Render coins
function render() {
    let filtered = showFavsOnly ? coins.filter(c => favorites.has(c.id)) : coins;
    let sorted = sortCoins(filtered);

    els.count.textContent = `${sorted.length} coins`;

    if (!sorted.length && showFavsOnly) {
        showEmpty();
        return;
    }

    els.grid.innerHTML = sorted.map(createCard).join('');

    // Add event listeners
    document.querySelectorAll('.fav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            if (favorites.has(id)) {
                favorites.delete(id);
            } else {
                favorites.add(id);
            }
            localStorage.setItem('favorites', JSON.stringify([...favorites]));
            render();
        });
    });
}

function sortCoins(coins) {
    const sorted = [...coins];

    switch (currentSort) {
        case 'market_cap_desc':
            return sorted.sort((a, b) => b.marketCap - a.marketCap);
        case 'market_cap_asc':
            return sorted.sort((a, b) => a.marketCap - b.marketCap);
        case 'price_desc':
            return sorted.sort((a, b) => b.price - a.price);
        case 'price_asc':
            return sorted.sort((a, b) => a.price - b.price);
        case 'change_desc':
            return sorted.sort((a, b) => b.change24h - a.change24h);
        case 'change_asc':
            return sorted.sort((a, b) => a.change24h - b.change24h);
        default:
            return sorted;
    }
}

function createCard(coin) {
    const change = coin.change24h ?? 0;
    const isFav = favorites.has(coin.id);

    return `
        <div class="card">
            <div class="card-header">
                <img src="${coin.image}" alt="${coin.name}">
                <div class="card-info">
                    <div class="card-name">${coin.name}</div>
                    <div class="card-symbol">${coin.symbol.toUpperCase()}</div>
                </div>
                <button class="fav-btn ${isFav ? 'active' : ''}" data-id="${coin.id}">♥</button>
            </div>
            <div class="card-stats">
                <div class="stat">
                    <span class="stat-label">Price</span>
                    <span class="stat-value">${formatPrice(coin.price)}</span>
                </div>
                <div class="stat">
                    <span class="stat-label">24h Change</span>
                    <span class="stat-value ${change >= 0 ? 'positive' : 'negative'}">
                        ${change.toFixed(2)}%
                    </span>
                </div>
                <div class="stat">
                    <span class="stat-label">Market Cap</span>
                    <span class="stat-value">${formatLarge(coin.marketCap)}</span>
                </div>
            </div>
        </div>
    `;
}

// Format price
function formatPrice(price) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: price >= 1 ? 2 : 6
    }).format(price);
}

// Format large numbers
function formatLarge(num) {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    return `$${num.toFixed(2)}`;
}

// UI states
function showLoading() {
    els.loading.classList.remove('hidden');
    els.grid.classList.add('hidden');
    els.error.classList.add('hidden');
    els.empty.classList.add('hidden');
    els.status.textContent = 'Loading crypto market data...';
}

function showGrid() {
    els.loading.classList.add('hidden');
    els.grid.classList.remove('hidden');
    els.error.classList.add('hidden');
    els.empty.classList.add('hidden');
}

function showError(msg) {
    els.loading.classList.add('hidden');
    els.grid.classList.add('hidden');
    els.error.classList.remove('hidden');
    els.empty.classList.add('hidden');
    els.errorMsg.textContent = `Error: ${msg}`;
    els.status.textContent = 'Unable to load live data';
}

function showEmpty() {
    els.loading.classList.add('hidden');
    els.grid.classList.add('hidden');
    els.error.classList.add('hidden');
    els.empty.classList.remove('hidden');
}

// Event listeners
els.sortSelect.addEventListener('change', (e) => {
    currentSort = e.target.value;
    render();
});

els.showFavs.addEventListener('change', (e) => {
    showFavsOnly = e.target.checked;
    render();
});

els.refreshBtn.addEventListener('click', () => load({ forceRefresh: true }));
els.retryBtn.addEventListener('click', () => load({ forceRefresh: true }));

// Start
load();
