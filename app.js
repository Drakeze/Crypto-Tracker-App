// Application State
let allCoins = [];
let filteredCoins = [];
let currentPage = 1;
let currentFilter = 'all';
let currentSort = 'market_cap_rank';
let favorites = JSON.parse(localStorage.getItem('cryptoFavorites')) || [];
let isDarkMode = localStorage.getItem('cryptoTheme') === 'dark';
let exchangeRates = null;

// DOM Elements
const coinsGrid = document.getElementById('coinsGrid');
const loading = document.getElementById('loading');
const errorDiv = document.getElementById('error');
const searchInput = document.getElementById('searchInput');
const filterButtons = document.querySelectorAll('.btn-filter');
const sortSelect = document.getElementById('sortSelect');
const refreshBtn = document.getElementById('refreshBtn');
const themeToggle = document.getElementById('themeToggle');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const pageNumbers = document.getElementById('pageNumbers');
const calculatorModal = document.getElementById('calculatorModal');
const closeModal = document.getElementById('closeModal');
const coinAmount = document.getElementById('coinAmount');

// Initialize App
async function initApp() {
    try {
        // Apply saved theme
        applyTheme();

        // Show loading state
        showLoading();

        // Fetch data
        allCoins = await fetchCoins();
        exchangeRates = await fetchExchangeRates();

        // Initial render
        applyFiltersAndSort();
        renderCoins();
        renderPagination();

        // Hide loading
        hideLoading();

        // Setup event listeners
        setupEventListeners();

    } catch (error) {
        showError('Failed to load cryptocurrency data. Please try again.');
        console.error('Initialization error:', error);
    }
}

// Event Listeners Setup
function setupEventListeners() {
    // Search
    searchInput.addEventListener('input', debounce(handleSearch, 300));

    // Filter buttons
    filterButtons.forEach(btn => {
        btn.addEventListener('click', handleFilter);
    });

    // Sort
    sortSelect.addEventListener('change', handleSort);

    // Refresh
    refreshBtn.addEventListener('click', handleRefresh);

    // Theme toggle
    themeToggle.addEventListener('click', toggleTheme);

    // Pagination
    prevBtn.addEventListener('click', () => changePage(currentPage - 1));
    nextBtn.addEventListener('click', () => changePage(currentPage + 1));

    // Modal
    closeModal.addEventListener('click', closeCalculatorModal);
    calculatorModal.addEventListener('click', (e) => {
        if (e.target === calculatorModal) closeCalculatorModal();
    });

    // Calculator input
    coinAmount.addEventListener('input', updateCalculatorValues);
}

// Search Handler
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase().trim();

    if (searchTerm === '') {
        applyFiltersAndSort();
    } else {
        filteredCoins = allCoins.filter(coin =>
            coin.name.toLowerCase().includes(searchTerm) ||
            coin.symbol.toLowerCase().includes(searchTerm)
        );
        applySorting();
    }

    currentPage = 1;
    renderCoins();
    renderPagination();
}

// Filter Handler
function handleFilter(e) {
    const filter = e.target.dataset.filter;

    // Update active button
    filterButtons.forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');

    currentFilter = filter;
    currentPage = 1;

    applyFiltersAndSort();
    renderCoins();
    renderPagination();
}

// Apply Filters
function applyFiltersAndSort() {
    switch (currentFilter) {
        case 'favorites':
            filteredCoins = allCoins.filter(coin => favorites.includes(coin.id));
            break;
        case 'gainers':
            filteredCoins = [...allCoins]
                .filter(coin => coin.price_change_percentage_24h > 0)
                .sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h)
                .slice(0, 50);
            break;
        case 'losers':
            filteredCoins = [...allCoins]
                .filter(coin => coin.price_change_percentage_24h < 0)
                .sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h)
                .slice(0, 50);
            break;
        default:
            filteredCoins = [...allCoins];
    }

    applySorting();
}

// Sort Handler
function handleSort(e) {
    currentSort = e.target.value;
    applySorting();
    renderCoins();
}

// Apply Sorting
function applySorting() {
    switch (currentSort) {
        case 'price_desc':
            filteredCoins.sort((a, b) => b.current_price - a.current_price);
            break;
        case 'price_asc':
            filteredCoins.sort((a, b) => a.current_price - b.current_price);
            break;
        case 'change_desc':
            filteredCoins.sort((a, b) =>
                (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0)
            );
            break;
        case 'change_asc':
            filteredCoins.sort((a, b) =>
                (a.price_change_percentage_24h || 0) - (b.price_change_percentage_24h || 0)
            );
            break;
        case 'name_asc':
            filteredCoins.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'name_desc':
            filteredCoins.sort((a, b) => b.name.localeCompare(a.name));
            break;
        default:
            filteredCoins.sort((a, b) => a.market_cap_rank - b.market_cap_rank);
    }
}

// Refresh Handler
async function handleRefresh() {
    try {
        refreshBtn.disabled = true;
        refreshBtn.innerHTML = '<span class="refresh-icon" style="animation: spin 1s linear infinite;">↻</span> Refreshing...';

        clearCache();
        allCoins = await fetchCoins();
        exchangeRates = await fetchExchangeRates();

        applyFiltersAndSort();
        renderCoins();
        renderPagination();

        refreshBtn.disabled = false;
        refreshBtn.innerHTML = '<span class="refresh-icon">↻</span> Refresh';

    } catch (error) {
        showError('Failed to refresh data. Please try again.');
        refreshBtn.disabled = false;
        refreshBtn.innerHTML = '<span class="refresh-icon">↻</span> Refresh';
    }
}

// Theme Toggle
function toggleTheme() {
    isDarkMode = !isDarkMode;
    localStorage.setItem('cryptoTheme', isDarkMode ? 'dark' : 'light');
    applyTheme();
}

function applyTheme() {
    if (isDarkMode) {
        document.body.setAttribute('data-theme', 'dark');
        themeToggle.innerHTML = '<span class="theme-icon">☀️</span>';
    } else {
        document.body.removeAttribute('data-theme');
        themeToggle.innerHTML = '<span class="theme-icon">🌙</span>';
    }
}

// Render Coins
function renderCoins() {
    const startIndex = (currentPage - 1) * COINS_PER_PAGE;
    const endIndex = startIndex + COINS_PER_PAGE;
    const coinsToDisplay = filteredCoins.slice(startIndex, endIndex);

    if (coinsToDisplay.length === 0) {
        coinsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 2rem;">No coins found.</p>';
        return;
    }

    coinsGrid.innerHTML = coinsToDisplay.map(coin => createCoinCard(coin)).join('');

    // Add event listeners to favorite buttons
    document.querySelectorAll('.favorite-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleFavorite(btn.dataset.coinId);
        });
    });

    // Add event listeners to coin cards
    document.querySelectorAll('.coin-card').forEach(card => {
        card.addEventListener('click', () => {
            openCalculator(card.dataset.coinId);
        });
    });

    // Render sparklines
    coinsToDisplay.forEach(coin => {
        if (coin.sparkline_in_7d && coin.sparkline_in_7d.price) {
            renderSparkline(coin.id, coin.sparkline_in_7d.price);
        }
    });
}

// Create Coin Card HTML
function createCoinCard(coin) {
    const isFavorite = favorites.includes(coin.id);
    const priceChange = coin.price_change_percentage_24h || 0;
    const changeClass = priceChange >= 0 ? 'positive' : 'negative';
    const changeSymbol = priceChange >= 0 ? '▲' : '▼';

    return `
        <div class="coin-card" data-coin-id="${coin.id}">
            <div class="coin-header">
                <div class="coin-info">
                    <img src="${coin.image}" alt="${coin.name}" class="coin-image">
                    <div class="coin-name-symbol">
                        <h3>${coin.name}</h3>
                        <span class="coin-symbol">${coin.symbol}</span>
                    </div>
                </div>
                <button class="favorite-btn ${isFavorite ? 'active' : ''}" data-coin-id="${coin.id}">
                    ${isFavorite ? '♥' : '♡'}
                </button>
            </div>

            <div class="coin-price">${formatCurrency(coin.current_price, 'usd')}</div>

            <div class="coin-change ${changeClass}">
                ${changeSymbol} ${Math.abs(priceChange).toFixed(2)}%
            </div>

            <div class="coin-stats">
                <div class="coin-stat">
                    <span class="coin-stat-label">Market Cap</span>
                    <span class="coin-stat-value">${formatNumber(coin.market_cap)}</span>
                </div>
                <div class="coin-stat">
                    <span class="coin-stat-label">Volume (24h)</span>
                    <span class="coin-stat-value">${formatNumber(coin.total_volume)}</span>
                </div>
                <div class="coin-stat">
                    <span class="coin-stat-label">Rank</span>
                    <span class="coin-stat-value">#${coin.market_cap_rank || 'N/A'}</span>
                </div>
            </div>

            <div class="coin-sparkline" id="sparkline-${coin.id}"></div>
        </div>
    `;
}

// Render Sparkline Chart
function renderSparkline(coinId, priceData) {
    const container = document.getElementById(`sparkline-${coinId}`);
    if (!container || !priceData || priceData.length === 0) return;

    const canvas = document.createElement('canvas');
    container.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    const width = container.offsetWidth;
    const height = 60;

    canvas.width = width;
    canvas.height = height;

    const max = Math.max(...priceData);
    const min = Math.min(...priceData);
    const range = max - min;

    const isPositive = priceData[priceData.length - 1] >= priceData[0];
    const color = isPositive ? '#10b981' : '#ef4444';

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();

    priceData.forEach((price, index) => {
        const x = (index / (priceData.length - 1)) * width;
        const y = height - ((price - min) / range) * height;

        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });

    ctx.stroke();
}

// Pagination
function renderPagination() {
    const totalPages = Math.ceil(filteredCoins.length / COINS_PER_PAGE);

    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;

    // Render page numbers
    pageNumbers.innerHTML = '';

    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = `page-number ${i === currentPage ? 'active' : ''}`;
        pageBtn.textContent = i;
        pageBtn.addEventListener('click', () => changePage(i));
        pageNumbers.appendChild(pageBtn);
    }
}

function changePage(page) {
    const totalPages = Math.ceil(filteredCoins.length / COINS_PER_PAGE);

    if (page < 1 || page > totalPages) return;

    currentPage = page;
    renderCoins();
    renderPagination();

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Favorites
function toggleFavorite(coinId) {
    const index = favorites.indexOf(coinId);

    if (index > -1) {
        favorites.splice(index, 1);
    } else {
        favorites.push(coinId);
    }

    localStorage.setItem('cryptoFavorites', JSON.stringify(favorites));

    // Re-render if on favorites filter
    if (currentFilter === 'favorites') {
        applyFiltersAndSort();
        renderCoins();
        renderPagination();
    } else {
        // Just update the button
        const btn = document.querySelector(`.favorite-btn[data-coin-id="${coinId}"]`);
        if (btn) {
            btn.classList.toggle('active');
            btn.textContent = favorites.includes(coinId) ? '♥' : '♡';
        }
    }
}

// Calculator Modal
function openCalculator(coinId) {
    const coin = allCoins.find(c => c.id === coinId);
    if (!coin) return;

    document.getElementById('calcCoinImage').src = coin.image;
    document.getElementById('calcCoinName').textContent = coin.name;
    document.getElementById('calcCoinSymbol').textContent = coin.symbol.toUpperCase();

    calculatorModal.dataset.coinPrice = coin.current_price;
    coinAmount.value = 1;

    updateCalculatorValues();
    calculatorModal.classList.add('active');
}

function closeCalculatorModal() {
    calculatorModal.classList.remove('active');
}

function updateCalculatorValues() {
    const amount = parseFloat(coinAmount.value) || 0;
    const priceUSD = parseFloat(calculatorModal.dataset.coinPrice) || 0;

    if (!exchangeRates) return;

    const totalUSD = amount * priceUSD;

    document.getElementById('valueUSD').textContent = formatCurrency(totalUSD, 'usd');
    document.getElementById('valueEUR').textContent = formatCurrency(totalUSD * exchangeRates.eur, 'eur');
    document.getElementById('valueGBP').textContent = formatCurrency(totalUSD * exchangeRates.gbp, 'gbp');
    document.getElementById('valueBTC').textContent = formatCurrency(totalUSD * exchangeRates.btc, 'btc');
    document.getElementById('valueETH').textContent = formatCurrency(totalUSD * exchangeRates.eth, 'eth');
}

// Utility Functions
function showLoading() {
    loading.style.display = 'block';
    coinsGrid.style.display = 'none';
    errorDiv.style.display = 'none';
}

function hideLoading() {
    loading.style.display = 'none';
    coinsGrid.style.display = 'grid';
}

function showError(message) {
    loading.style.display = 'none';
    coinsGrid.style.display = 'none';
    errorDiv.style.display = 'block';
    errorDiv.querySelector('.error-message').textContent = message;
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
