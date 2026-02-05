// server.js
const PORT = Number(process.env.PORT || 3000);
const API_KEY = process.env.COINGECKO_API_KEY || null;
const COINS_PER_PAGE = Number(process.env.COINGECKO_PER_PAGE || 100);
const COIN_PAGES = Number(process.env.COINGECKO_PAGES || 3);
const CACHE_TTL_MS = Number(process.env.COINGECKO_CACHE_TTL_MS || 60_000);

const cache = {
  expiresAt: 0,
  payload: null
};

function buildCoinGeckoUrl({ page, perPage, currency }) {
  return (
    "https://api.coingecko.com/api/v3/coins/markets" +
    `?vs_currency=${currency}` +
    `&order=market_cap_desc` +
    `&per_page=${perPage}` +
    `&page=${page}` +
    "&sparkline=false"
  );
}

function normalizeCoin(coin) {
  return {
    id: coin.id,
    symbol: coin.symbol,
    name: coin.name,
    price: coin.current_price,
    marketCap: coin.market_cap,
    rank: coin.market_cap_rank,
    image: coin.image,
    change24h: coin.price_change_percentage_24h
  };
}

async function fetchMarketsPage({ page, perPage, currency }) {
  const apiUrl = buildCoinGeckoUrl({ page, perPage, currency });

  const headers = { Accept: "application/json" };
  if (API_KEY) headers["x-cg-demo-api-key"] = API_KEY;

  const response = await fetch(apiUrl, { headers });
  const rawText = await response.text();

  let body;
  try {
    body = JSON.parse(rawText);
  } catch {
    body = rawText;
  }

  if (!response.ok) {
    const details = typeof body === "object" ? JSON.stringify(body) : String(body).slice(0, 300);
    throw new Error(`CoinGecko ${response.status}: ${details}`);
  }

  if (!Array.isArray(body)) {
    throw new Error("CoinGecko payload was not an array");
  }

  return body.map(normalizeCoin);
}

async function fetchAllCoins({ currency, perPage, pages }) {
  const chunks = [];

  for (let page = 1; page <= pages; page++) {
    const coins = await fetchMarketsPage({ page, perPage, currency });
    chunks.push(...coins);

    // Small pacing buffer to avoid triggering CoinGecko burst limits.
    await Bun.sleep(300);
  }

  return chunks;
}

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      ...headers
    }
  });
}

const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);

    if (url.pathname === "/api/coins") {
      const currency = url.searchParams.get("vs_currency") || "usd";
      const forceRefresh = url.searchParams.get("refresh") === "1";

      const now = Date.now();
      if (!forceRefresh && cache.payload && now < cache.expiresAt) {
        return json({ ...cache.payload, source: "cache" });
      }

      try {
        const data = await fetchAllCoins({
          currency,
          perPage: COINS_PER_PAGE,
          pages: COIN_PAGES
        });

        const payload = {
          count: data.length,
          data,
          fetchedAt: new Date().toISOString(),
          source: "coingecko"
        };

        cache.payload = payload;
        cache.expiresAt = now + CACHE_TTL_MS;

        return json(payload);
      } catch (error) {
        console.error("[api/coins]", error.message);

        return json(
          {
            error: "Failed to fetch CoinGecko data",
            details: error.message,
            hint: "Configure COINGECKO_API_KEY and keep server-side caching enabled"
          },
          502
        );
      }
    }

    if (url.pathname === "/" || url.pathname === "/index.html") {
      return new Response(Bun.file("index.html"));
    }
    if (url.pathname === "/style.css") {
      return new Response(Bun.file("style.css"), {
        headers: { "Content-Type": "text/css" }
      });
    }
    if (url.pathname === "/app.js") {
      return new Response(Bun.file("app.js"), {
        headers: { "Content-Type": "application/javascript" }
      });
    }

    return new Response("Not Found", { status: 404 });
  }
});

console.log(`\nServer running on http://localhost:${PORT}\n`);
