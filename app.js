/**
 * CryptoTracker - Top 300 Cryptocurrencies
 * Fetches and displays cryptocurrency data from CoinGecko API
 */

// API Configuration
const API_CONFIG = {
    baseUrl: 'https://api.coingecko.com/api/v3/coins/markets',
    vsCurrency: 'usd',
    pages: [
        { page: 1, perPage: 250 },
        { page: 2, perPage: 50 }
    ],
    retryDelay: 60000, // 1 minute for rate limit
    maxRetries: 3
};

// DOM Elements
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

// Application State
let state = {
    coins: [],
    likedCoins: new Set(),
    currentSort: 'market_cap_desc',
    showLikedOnly: false,
    isLoading: false
};

// Initialize the application
function init() {
    loadLikedCoins();
    setupEventListeners();
    fetchAllCoins();
}

// Load liked coins from localStorage
function loadLikedCoins() {
    try {
        const saved = localStorage.getItem('likedCoins');
        if (saved) {
            state.likedCoins = new Set(JSON.parse(saved));
        }
    } catch (error) {
        console.error('Error loading liked coins:', error);
        state.likedCoins = new Set();
    }
}

// Save liked coins to localStorage
function saveLikedCoins() {
    try {
        localStorage.setItem('likedCoins', JSON.stringify([...state.likedCoins]));
    } catch (error) {
        console.error('Error saving liked coins:', error);
    }
}

// Setup event listeners
function setupEventListeners() {
    elements.refreshBtn.addEventListener('click', handleRefresh);
    elements.retryBtn.addEventListener('click', handleRefresh);
    elements.sortSelect.addEventListener('change', handleSortChange);
    elements.showLikedOnly.addEventListener('change', handleFilterChange);
}

// Build API URL for a specific page
function buildApiUrl(page, perPage) {
    const params = new URLSearchParams({
        vs_currency: API_CONFIG.vsCurrency,
        per_page: perPage,
        page: page,
        order: 'market_cap_desc',
        sparkline: false
    });
    return `${API_CONFIG.baseUrl}?${params}`;
}

// Fetch data with retry logic
async function fetchWithRetry(url, retries = API_CONFIG.maxRetries) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const response = await fetch(url);
            
            if (response.status === 429) {
                // Rate limited
                if (attempt < retries) {
                    const waitTime = API_CONFIG.retryDelay * attempt;
                    updateLoadingStatus(`Rate limited. Waiting ${waitTime / 1000}s before retry (${attempt}/${retries})...`);
                    await sleep(waitTime);
                    continue;
                }
                throw new Error('API rate limit exceeded. Please try again in a few minutes.');
            }
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            if (attempt === retries) {
                throw error;
            }
            
            // Network error, retry after delay
            const waitTime = 2000 * attempt;
            updateLoadingStatus(`Connection error. Retrying in ${waitTime / 1000}s (${attempt}/${retries})...`);
            await sleep(waitTime);
        }
    }
}

// Sleep utility
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Update loading status text
function updateLoadingStatus(message) {
    elements.loadingStatus.textContent = message;
}

// Fetch all coins from both API pages
async function fetchAllCoins() {
    if (state.isLoading) return;
    
    state.isLoading = true;
    showLoading();
    hideError();
    
    try {
        const allCoins = [];
        
        for (let i = 0; i < API_CONFIG.pages.length; i++) {
            const { page, perPage } = API_CONFIG.pages[i];
            updateLoadingStatus(`Fetching page ${i + 1} of ${API_CONFIG.pages.length}...`);
            
            const url = buildApiUrl(page, perPage);
            const data = await fetchWithRetry(url);
            
            // Adjust market_cap_rank for page 2 coins
            if (page === 2) {
                data.forEach((coin, index) => {
                    coin.market_cap_rank = 251 + index;
                });
            }
            
            allCoins.push(...data);
            
            // Small delay between requests to avoid rate limiting
            if (i < API_CONFIG.pages.length - 1) {
                await sleep(500);
            }
        }
        
        state.coins = allCoins;
        updateLastUpdated();
        renderCoins();
        showCoinsGrid();
        
    } catch (error) {
        console.error('Error fetching coins:', error);
        showError(error.message);
    } finally {
        state.isLoading = false;
        elements.refreshBtn.classList.remove('loading');
        elements.refreshBtn.disabled = false;
    }
}

// Handle refresh button click
function handleRefresh() {
    elements.refreshBtn.classList.add('loading');
    elements.refreshBtn.disabled = true;
    fetchAllCoins();
}

// Handle sort change
function handleSortChange(event) {
    state.currentSort = event.target.value;
    renderCoins();
}

// Handle filter change
function handleFilterChange(event) {
    state.showLikedOnly = event.target.checked;
    renderCoins();
}

// Sort coins based on current sort option
function sortCoins(coins) {
    const sorted = [...coins];
    
    switch (state.currentSort) {
        case 'market_cap_desc':
            return sorted.sort((a, b) => (b.market_cap || 0) - (a.market_cap || 0));
        case 'market_cap_asc':
            return sorted.sort((a, b) => (a.market_cap || 0) - (b.market_cap || 0));
        case 'price_desc':
            return sorted.sort((a, b) => (b.current_price || 0) - (a.current_price || 0));
        case 'price_asc':
            return sorted.sort((a, b) => (a.current_price || 0) - (b.current_price || 0));
        case 'name_asc':
            return sorted.sort((a, b) => a.name.localeCompare(b.name));
        case 'name_desc':
            return sorted.sort((a, b) => b.name.localeCompare(a.name));
        case 'change_desc':
            return sorted.sort((a, b) => (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0));
        case 'change_asc':
            return sorted.sort((a, b) => (a.price_change_percentage_24h || 0) - (b.price_change_percentage_24h || 0));
        case 'liked':
            return sorted.sort((a, b) => {
                const aLiked = state.likedCoins.has(a.id) ? 1 : 0;
                const bLiked = state.likedCoins.has(b.id) ? 1 : 0;
                if (bLiked !== aLiked) return bLiked - aLiked;
                return (b.market_cap || 0) - (a.market_cap || 0);
            });
        default:
            return sorted;
    }
}

// Filter coins based on current filter
function filterCoins(coins) {
    if (state.showLikedOnly) {
        return coins.filter(coin => state.likedCoins.has(coin.id));
    }
    return coins;
}

// Render coins to the grid
function renderCoins() {
    let coins = filterCoins(state.coins);
    coins = sortCoins(coins);
    
    // Update coin count
    elements.coinCount.textContent = `${coins.length} coin${coins.length !== 1 ? 's' : ''}`;
    
    // Show empty state if no coins to display
    if (coins.length === 0 && state.showLikedOnly) {
        elements.coinsGrid.classList.add('hidden');
        elements.emptyState.classList.remove('hidden');
        return;
    }
    
    elements.emptyState.classList.add('hidden');
    elements.coinsGrid.classList.remove('hidden');
    
    // Generate HTML for all coins
    elements.coinsGrid.innerHTML = coins.map(coin => createCoinCard(coin)).join('');
    
    // Attach event listeners to like buttons
    elements.coinsGrid.querySelectorAll('.like-btn').forEach(btn => {
        btn.addEventListener('click', handleLikeClick);
    });
}

// Create HTML for a single coin card
function createCoinCard(coin) {
    const isLiked = state.likedCoins.has(coin.id);
    const priceChange = coin.price_change_percentage_24h || 0;
    const priceChangeClass = priceChange >= 0 ? 'positive' : 'negative';
    const priceChangeSign = priceChange >= 0 ? '+' : '';
    
    return `
        <article class="coin-card" data-coin-id="${coin.id}">
            <span class="coin-rank">#${coin.market_cap_rank || 'N/A'}</span>
            <div class="coin-card-header">
                <img 
                    class="coin-image" 
                    src="${coin.image}" 
                    alt="${coin.name} logo"
                    loading="lazy"
                    onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22%2364748b%22%3E%3Ccircle cx=%2212%22 cy=%2212%22 r=%2210%22/%3E%3C/svg%3E'"
                >
                <div class="coin-info">
                    <h3 class="coin-name" title="${coin.name}">${coin.name}</h3>
                    <span class="coin-symbol">${coin.symbol}</span>
                </div>
                <button 
                    class="like-btn ${isLiked ? 'liked' : ''}" 
                    data-coin-id="${coin.id}"
                    aria-label="${isLiked ? 'Unlike' : 'Like'} ${coin.name}"
                    title="${isLiked ? 'Remove from favorites' : 'Add to favorites'}"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                </button>
            </div>
            <div class="coin-stats">
                <div class="stat">
                    <span class="stat-label">Price</span>
                    <span class="stat-value price">${formatPrice(coin.current_price)}</span>
                </div>
                <div class="stat">
                    <span class="stat-label">24h Change</span>
                    <span class="stat-value ${priceChangeClass}">${priceChangeSign}${priceChange.toFixed(2)}%</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Market Cap</span>
                    <span class="stat-value">${formatMarketCap(coin.market_cap)}</span>
                </div>
                <div class="stat">
                    <span class="stat-label">24h Volume</span>
                    <span class="stat-value">${formatMarketCap(coin.total_volume)}</span>
                </div>
            </div>
        </article>
    `;
}

// Handle like button click
function handleLikeClick(event) {
    const btn = event.currentTarget;
    const coinId = btn.dataset.coinId;
    
    if (state.likedCoins.has(coinId)) {
        state.likedCoins.delete(coinId);
        btn.classList.remove('liked');
        btn.setAttribute('aria-label', `Like ${coinId}`);
        btn.setAttribute('title', 'Add to favorites');
    } else {
        state.likedCoins.add(coinId);
        btn.classList.add('liked');
        btn.setAttribute('aria-label', `Unlike ${coinId}`);
        btn.setAttribute('title', 'Remove from favorites');
    }
    
    saveLikedCoins();
    
    // Re-render if showing liked only and we just unliked
    if (state.showLikedOnly) {
        renderCoins();
    }
    
    // Re-render if sorted by liked to update order
    if (state.currentSort === 'liked') {
        renderCoins();
    }
}

// Format price with appropriate precision
function formatPrice(price) {
    if (price === null || price === undefined) return 'N/A';
    
    if (price >= 1) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(price);
    } else if (price >= 0.01) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 4,
            maximumFractionDigits: 4
        }).format(price);
    } else {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 6,
            maximumFractionDigits: 8
        }).format(price);
    }
}

// Format market cap with abbreviations
function formatMarketCap(value) {
    if (value === null || value === undefined) return 'N/A';
    
    if (value >= 1e12) {
        return `$${(value / 1e12).toFixed(2)}T`;
    } else if (value >= 1e9) {
        return `$${(value / 1e9).toFixed(2)}B`;
    } else if (value >= 1e6) {
        return `$${(value / 1e6).toFixed(2)}M`;
    } else if (value >= 1e3) {
        return `$${(value / 1e3).toFixed(2)}K`;
    } else {
        return `$${value.toFixed(2)}`;
    }
}

// Update last updated timestamp
function updateLastUpdated() {
    const now = new Date();
    elements.lastUpdated.textContent = now.toLocaleString();
}

// UI State Management
function showLoading() {
    elements.loadingContainer.classList.remove('hidden');
    elements.coinsGrid.classList.add('hidden');
    elements.errorContainer.classList.add('hidden');
    elements.emptyState.classList.add('hidden');
}

function hideLoading() {
    elements.loadingContainer.classList.add('hidden');
}

function showCoinsGrid() {
    hideLoading();
    elements.coinsGrid.classList.remove('hidden');
}

function showError(message) {
    hideLoading();
    elements.errorMessage.textContent = message;
    elements.errorContainer.classList.remove('hidden');
    elements.coinsGrid.classList.add('hidden');
}

function hideError() {
    elements.errorContainer.classList.add('hidden');
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', init);
