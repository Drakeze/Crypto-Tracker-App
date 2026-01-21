/**
 * CryptoTracker - Top 300 Cryptocurrencies
 * Fetches and displays cryptocurrency data from CoinGecko API
 */

// ==========================
// API CONFIGURATION
// ==========================
const API_CONFIG = {
    baseUrl: 'https://api.coingecko.com/api/v3/coins/markets',
    vsCurrency: 'usd',
    pages: Array.from({ length: 6 }, (_, i) => ({
        page: i + 1,
        perPage: 50
    })),
    retryDelay: 60000,
    maxRetries: 3
};

// ==========================
// DOM ELEMENTS
// ==========================
const elements = {
    coinsGrid: document.getElementById('coins-grid'),
    loadingContainer: document.getElementById('loading-container'),
    loadingStatus: document.getElementById('loading-status'),
    errorContainer: document.getElementById('error-container'),
    errorMessage: document.getElementById('error-message'),
    emptyState: document.getElementById('empty-state'),
    refreshBtn: document.getElementById('refresh-btn'),
    retryBtn: document.getElementById('retry-btn'),
    sortSelect: document.getElementById('sort-select'),
    showLikedOnly: document.getElementById('show-liked-only'),
    coinCount: document.getElementById('coin-count'),
    lastUpdated: document.getElementById('last-updated')
};

// ==========================
// APPLICATION STATE
// ==========================
const state = {
    coins: [],
    likedCoins: new Set(),
    currentSort: 'market_cap_desc',
    showLikedOnly: false,
    isLoading: false,
    currentPage: 1,
    coinsPerPage: 50
};

// ==========================
// INITIALIZATION
// ==========================
document.addEventListener('DOMContentLoaded', init);

function init() {
    loadLikedCoins();
    setupEventListeners();
    fetchAllCoins();
}

// ==========================
// LOCAL STORAGE
// ==========================
function loadLikedCoins() {
    try {
        const saved = localStorage.getItem('likedCoins');
        if (saved) state.likedCoins = new Set(JSON.parse(saved));
    } catch {
        state.likedCoins = new Set();
    }
}

function saveLikedCoins() {
    localStorage.setItem('likedCoins', JSON.stringify([...state.likedCoins]));
}

// ==========================
// EVENT LISTENERS
// ==========================
function setupEventListeners() {
    elements.refreshBtn.addEventListener('click', handleRefresh);
    elements.retryBtn.addEventListener('click', handleRefresh);
    elements.sortSelect.addEventListener('change', handleSortChange);
    elements.showLikedOnly.addEventListener('change', handleFilterChange);
}

function handleSortChange(e) {
    state.currentSort = e.target.value;
    state.currentPage = 1;
    renderCoins();
}

function handleFilterChange(e) {
    state.showLikedOnly = e.target.checked;
    state.currentPage = 1;
    renderCoins();
}

function handleRefresh() {
    if (state.isLoading) return;
    state.currentPage = 1;
    elements.refreshBtn.classList.add('loading');
    elements.refreshBtn.disabled = true;
    fetchAllCoins();
}

// ==========================
// API HELPERS
// ==========================
function buildApiUrl(page, perPage) {
    const params = new URLSearchParams({
        vs_currency: API_CONFIG.vsCurrency,
        per_page: perPage,
        page,
        order: 'market_cap_desc',
        sparkline: false
    });
    return `${API_CONFIG.baseUrl}?${params}`;
}

async function fetchWithRetry(url, retries = API_CONFIG.maxRetries) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const res = await fetch(url);

            if (res.status === 429) {
                if (attempt === retries) {
                    throw new Error('API rate limit exceeded.');
                }
                await sleep(API_CONFIG.retryDelay * attempt);
                continue;
            }

            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`);
            }

            return await res.json();
        } catch (err) {
            if (attempt === retries) throw err;
            await sleep(2000 * attempt);
        }
    }
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

function updateLoadingStatus(msg) {
    elements.loadingStatus.textContent = msg;
}

// ==========================
// FETCH ALL COINS
// ==========================
async function fetchAllCoins() {
    if (state.isLoading) return;

    state.isLoading = true;
    showLoading();
    hideError();

    try {
        const allCoins = [];

        for (let i = 0; i < API_CONFIG.pages.length; i++) {
            const { page, perPage } = API_CONFIG.pages[i];
            updateLoadingStatus(`Fetching page ${i + 1} of ${API_CONFIG.pages.length}…`);

            const data = await fetchWithRetry(buildApiUrl(page, perPage));

            data.forEach((coin, index) => {
                coin.market_cap_rank = (page - 1) * 50 + index + 1;
            });

            allCoins.push(...data);

            if (i < API_CONFIG.pages.length - 1) {
                await sleep(500);
            }
        }

        state.coins = allCoins;
        state.currentPage = 1;
        updateLastUpdated();
        renderCoins();
        showCoinsGrid();

    } catch (err) {
        showError(err.message);
    } finally {
        state.isLoading = false;
        elements.refreshBtn.classList.remove('loading');
        elements.refreshBtn.disabled = false;
    }
}

// ==========================
// SORTING & FILTERING
// ==========================
function sortCoins(coins) {
    const sorted = [...coins];

    switch (state.currentSort) {
        case 'market_cap_asc': return sorted.sort((a, b) => a.market_cap - b.market_cap);
        case 'price_desc': return sorted.sort((a, b) => b.current_price - a.current_price);
        case 'price_asc': return sorted.sort((a, b) => a.current_price - b.current_price);
        case 'name_asc': return sorted.sort((a, b) => a.name.localeCompare(b.name));
        case 'name_desc': return sorted.sort((a, b) => b.name.localeCompare(a.name));
        case 'change_desc': return sorted.sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h);
        case 'change_asc': return sorted.sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h);
        case 'liked':
            return sorted.sort((a, b) =>
                Number(state.likedCoins.has(b.id)) - Number(state.likedCoins.has(a.id))
            );
        default:
            return sorted.sort((a, b) => b.market_cap - a.market_cap);
    }
}

function filterCoins(coins) {
    return state.showLikedOnly
        ? coins.filter(c => state.likedCoins.has(c.id))
        : coins;
}

// ==========================
// RENDERING
// ==========================
function renderCoins() {
    let coins = filterCoins(state.coins);
    coins = sortCoins(coins);

    const start = (state.currentPage - 1) * state.coinsPerPage;
    const pageCoins = coins.slice(start, start + state.coinsPerPage);

    elements.coinCount.textContent = `${coins.length} coins`;

    if (!pageCoins.length) {
        elements.emptyState.classList.remove('hidden');
        elements.coinsGrid.classList.add('hidden');
        return;
    }

    elements.emptyState.classList.add('hidden');
    elements.coinsGrid.classList.remove('hidden');

    elements.coinsGrid.innerHTML = pageCoins.map(createCoinCard).join('');
    elements.coinsGrid.querySelectorAll('.like-btn')
        .forEach(btn => btn.addEventListener('click', handleLikeClick));
}

// ==========================
// COIN CARD
// ==========================
function createCoinCard(coin) {
    const liked = state.likedCoins.has(coin.id);
    const change = coin.price_change_percentage_24h ?? 0;

    return `
        <article class="coin-card">
            <span class="coin-rank">#${coin.market_cap_rank}</span>
            <div class="coin-card-header">
                <img src="${coin.image}" alt="${coin.name}" loading="lazy">
                <div>
                    <h3>${coin.name}</h3>
                    <span>${coin.symbol}</span>
                </div>
                <button class="like-btn ${liked ? 'liked' : ''}" data-id="${coin.id}">
                    ♥
                </button>
            </div>
            <div class="coin-stats">
                <div>${formatPrice(coin.current_price)}</div>
                <div class="${change >= 0 ? 'positive' : 'negative'}">${change.toFixed(2)}%</div>
                <div>${formatMarketCap(coin.market_cap)}</div>
                <div>${formatMarketCap(coin.total_volume)}</div>
            </div>
        </article>
    `;
}

function handleLikeClick(e) {
    const id = e.currentTarget.dataset.id;
    state.likedCoins.has(id) ? state.likedCoins.delete(id) : state.likedCoins.add(id);
    saveLikedCoins();
    renderCoins();
}

// ==========================
// FORMATTERS
// ==========================
function formatPrice(price) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: price >= 1 ? 2 : 6
    }).format(price);
}

function formatMarketCap(value) {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    return `$${value.toFixed(2)}`;
}

// ==========================
// UI STATES
// ==========================
function updateLastUpdated() {
    elements.lastUpdated.textContent = new Date().toLocaleString();
}

function showLoading() {
    elements.loadingContainer.classList.remove('hidden');
    elements.coinsGrid.classList.add('hidden');
}

function showCoinsGrid() {
    elements.loadingContainer.classList.add('hidden');
    elements.coinsGrid.classList.remove('hidden');
}

function showError(msg) {
    elements.errorMessage.textContent = msg;
    elements.errorContainer.classList.remove('hidden');
}

function hideError() {
    elements.errorContainer.classList.add('hidden');
}
