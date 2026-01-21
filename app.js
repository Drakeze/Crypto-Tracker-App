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

// Fetch coins from backend
async function fetchCoins() {
    const allCoins = [];
    
    for (let page = 1; page <= 6; page++) {
        els.status.textContent = `Fetching page ${page} of 6...`;
        
        const res = await fetch(`/api/coins?page=${page}&per_page=50`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        
        const data = await res.json();
        allCoins.push(...data);
        
        await new Promise(r => setTimeout(r, 500)); // Rate limit
    }
    
    return allCoins;
}

// Load and render
async function load() {
    showLoading();
    
    try {
        coins = await fetchCoins();
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

// Sort coins
function sortCoins(coins) {
    const sorted = [...coins];
    
    switch (currentSort) {
        case 'market_cap_desc':
            return sorted.sort((a, b) => b.market_cap - a.market_cap);
        case 'market_cap_asc':
            return sorted.sort((a, b) => a.market_cap - b.market_cap);
        case 'price_desc':
            return sorted.sort((a, b) => b.current_price - a.current_price);
        case 'price_asc':
            return sorted.sort((a, b) => a.current_price - b.current_price);
        case 'change_desc':
            return sorted.sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h);
        case 'change_asc':
            return sorted.sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h);
        default:
            return sorted;
    }
}

// Create card HTML
function createCard(coin) {
    const change = coin.price_change_percentage_24h || 0;
    const isFav = favorites.has(coin.id);
    
    return `
        <div class="card">
            <div class="card-header">
                <img src="${coin.image}" alt="${coin.name}">
                <div class="card-info">
                    <div class="card-name">${coin.name}</div>
                    <div class="card-symbol">${coin.symbol}</div>
                </div>
                <button class="fav-btn ${isFav ? 'active' : ''}" data-id="${coin.id}">♥</button>
            </div>
            <div class="card-stats">
                <div class="stat">
                    <span class="stat-label">Price</span>
                    <span class="stat-value">${formatPrice(coin.current_price)}</span>
                </div>
                <div class="stat">
                    <span class="stat-label">24h Change</span>
                    <span class="stat-value ${change >= 0 ? 'positive' : 'negative'}">${change.toFixed(2)}%</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Market Cap</span>
                    <span class="stat-value">${formatLarge(coin.market_cap)}</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Volume</span>
                    <span class="stat-value">${formatLarge(coin.total_volume)}</span>
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

els.refreshBtn.addEventListener('click', load);
els.retryBtn.addEventListener('click', load);

// Start
load();
