// CoinGecko API Configuration
const API_BASE_URL = 'https://api.coingecko.com/api/v3';
const COINS_PER_PAGE = 50;
const TOTAL_COINS = 300;

// Cache management
let coinsCache = {
    data: null,
    timestamp: null,
    expiryTime: 5 * 60 * 1000 // 5 minutes
};

let exchangeRatesCache = {
    data: null,
    timestamp: null,
    expiryTime: 10 * 60 * 1000 // 10 minutes
};

/**
 * Fetch all coins with market data from CoinGecko
 * @returns {Promise<Array>} Array of coin objects
 */
async function fetchCoins() {
    try {
        // Check cache first
        if (coinsCache.data && coinsCache.timestamp &&
            (Date.now() - coinsCache.timestamp < coinsCache.expiryTime)) {
            console.log('Returning cached coins data');
            return coinsCache.data;
        }

        console.log('Fetching fresh coins data from API...');

        const response = await fetch(
            `${API_BASE_URL}/coins/markets?` +
            `vs_currency=usd&` +
            `order=market_cap_desc&` +
            `per_page=${TOTAL_COINS}&` +
            `page=1&` +
            `sparkline=true&` +
            `price_change_percentage=24h`
        );

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        // Update cache
        coinsCache.data = data;
        coinsCache.timestamp = Date.now();

        console.log(`Successfully fetched ${data.length} coins`);
        return data;

    } catch (error) {
        console.error('Error fetching coins:', error);
        throw error;
    }
}

/**
 * Fetch exchange rates for currency conversion
 * @returns {Promise<Object>} Exchange rates object
 */
async function fetchExchangeRates() {
    try {
        // Check cache first
        if (exchangeRatesCache.data && exchangeRatesCache.timestamp &&
            (Date.now() - exchangeRatesCache.timestamp < exchangeRatesCache.expiryTime)) {
            console.log('Returning cached exchange rates');
            return exchangeRatesCache.data;
        }

        console.log('Fetching fresh exchange rates...');

        // Fetch current prices for BTC and ETH in multiple currencies
        const response = await fetch(
            `${API_BASE_URL}/simple/price?` +
            `ids=bitcoin,ethereum&` +
            `vs_currencies=usd,eur,gbp`
        );

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();

        // Calculate exchange rates
        const rates = {
            usd: 1,
            eur: data.bitcoin.eur / data.bitcoin.usd,
            gbp: data.bitcoin.gbp / data.bitcoin.usd,
            btc: 1 / data.bitcoin.usd,
            eth: 1 / data.ethereum.usd
        };

        // Update cache
        exchangeRatesCache.data = rates;
        exchangeRatesCache.timestamp = Date.now();

        console.log('Exchange rates fetched successfully');
        return rates;

    } catch (error) {
        console.error('Error fetching exchange rates:', error);
        // Return default rates if API fails
        return {
            usd: 1,
            eur: 0.92,
            gbp: 0.79,
            btc: 0.000023,
            eth: 0.00042
        };
    }
}

/**
 * Fetch detailed information for a specific coin
 * @param {string} coinId - The CoinGecko ID of the coin
 * @returns {Promise<Object>} Detailed coin data
 */
async function fetchCoinDetails(coinId) {
    try {
        const response = await fetch(
            `${API_BASE_URL}/coins/${coinId}?` +
            `localization=false&` +
            `tickers=false&` +
            `market_data=true&` +
            `community_data=false&` +
            `developer_data=false&` +
            `sparkline=true`
        );

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        return await response.json();

    } catch (error) {
        console.error(`Error fetching details for ${coinId}:`, error);
        throw error;
    }
}

/**
 * Clear all caches and force fresh data fetch
 */
function clearCache() {
    coinsCache = {
        data: null,
        timestamp: null,
        expiryTime: 5 * 60 * 1000
    };

    exchangeRatesCache = {
        data: null,
        timestamp: null,
        expiryTime: 10 * 60 * 1000
    };

    console.log('Cache cleared');
}

/**
 * Format large numbers with abbreviations (K, M, B, T)
 * @param {number} num - Number to format
 * @returns {string} Formatted number string
 */
function formatNumber(num) {
    if (num === null || num === undefined) return 'N/A';

    if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';

    return num.toFixed(2);
}

/**
 * Format currency values
 * @param {number} value - Value to format
 * @param {string} currency - Currency code (usd, eur, gbp, btc, eth)
 * @returns {string} Formatted currency string
 */
function formatCurrency(value, currency = 'usd') {
    if (value === null || value === undefined) return 'N/A';

    const formats = {
        usd: { symbol: '$', decimals: 2 },
        eur: { symbol: '€', decimals: 2 },
        gbp: { symbol: '£', decimals: 2 },
        btc: { symbol: '₿', decimals: 8 },
        eth: { symbol: 'Ξ', decimals: 8 }
    };

    const format = formats[currency.toLowerCase()] || formats.usd;

    if (value < 0.01 && currency !== 'btc' && currency !== 'eth') {
        return format.symbol + value.toFixed(6);
    }

    return format.symbol + value.toFixed(format.decimals);
}

/**
 * Calculate percentage change
 * @param {number} oldValue - Original value
 * @param {number} newValue - New value
 * @returns {number} Percentage change
 */
function calculatePercentageChange(oldValue, newValue) {
    if (!oldValue || !newValue) return 0;
    return ((newValue - oldValue) / oldValue) * 100;
}
