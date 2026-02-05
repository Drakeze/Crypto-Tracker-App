// server.js
const PORT = 3000;
const API_KEY = null;

const server = Bun.serve({
  port: PORT,
    async fetch(req) {
        const url = new URL(req.url);

        // API proxy to CoinGecko (normalized response)
        if (url.pathname === "/api/coins") {
            const page = Number(url.searchParams.get("page") || 1);
            const perPage = Number(url.searchParams.get("per_page") || 50);
            const currency = url.searchParams.get("vs_currency") || "usd";

            const apiUrl =
                "https://api.coingecko.com/api/v3/coins/markets" +
                `?vs_currency=${currency}` +
                `&order=market_cap_desc` +
                `&per_page=${perPage}` +
                `&page=${page}` +
                `&sparkline=false`;

            const headers = {
                "Accept": "application/json"
            };

            if (API_KEY) {
                headers["x-cg-demo-api-key"] = API_KEY;
            }

            try {
                const response = await fetch(apiUrl, { headers });
                const rawData = await response.json();

                // Normalize + reduce payload
                const normalized = rawData.map(coin => ({
                    id: coin.id,
                    symbol: coin.symbol,
                    name: coin.name,
                    price: coin.current_price,
                    marketCap: coin.market_cap,
                    rank: coin.market_cap_rank,
                    image: coin.image,
                    change24h: coin.price_change_percentage_24h
                }));

                return new Response(JSON.stringify({
                    page,
                    perPage,
                    count: normalized.length,
                    data: normalized
                }), {
                    headers: {
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": "*"
                    }
                });
            } catch (error) {
                return new Response(JSON.stringify({
                    error: "Failed to fetch CoinGecko data",
                    details: error.message
                }), {
                    status: 500,
                    headers: { "Content-Type": "application/json" }
                });
            }
        }

        // Serve static files
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

console.log(`
Server running on http://localhost:${PORT}
`);
