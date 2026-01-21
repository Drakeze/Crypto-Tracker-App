// Simple Bun server for CryptoTracker
const API_KEY = Bun.env.COINGECKO_API_KEY;
const PORT = Bun.env.PORT || 3000;

const server = Bun.serve({
    port: PORT,
    async fetch(req) {
        const url = new URL(req.url);

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

        // API proxy to CoinGecko
        if (url.pathname === "/api/coins") {
            const page = url.searchParams.get("page") || "1";
            const perPage = url.searchParams.get("per_page") || "50";

            const apiUrl = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&per_page=${perPage}&page=${page}&order=market_cap_desc&sparkline=false`;
            
            const headers = {
                "Accept": "application/json"
            };
            
            if (API_KEY) {
                headers["x-cg-demo-api-key"] = API_KEY;
            }

            try {
                const response = await fetch(apiUrl, { headers });
                const data = await response.json();
                
                return new Response(JSON.stringify(data), {
                    headers: {
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": "*"
                    }
                });
            } catch (error) {
                return new Response(JSON.stringify({ error: error.message }), {
                    status: 500,
                    headers: { "Content-Type": "application/json" }
                });
            }
        }

        // Health check
        if (url.pathname === "/api/ping") {
            return new Response(JSON.stringify({
                status: "ok",
                timestamp: new Date().toISOString(),
                apiKey: !!API_KEY
            }), {
                headers: { "Content-Type": "application/json" }
            });
        }

        return new Response("Not Found", { status: 404 });
    }
});

console.log(`
╔════════════════════════════════════════════════╗
║     🚀 CryptoTracker Server (Bun)             ║
╠════════════════════════════════════════════════╣
║  URL:     http://localhost:${PORT}                  ║
║  API:     http://localhost:${PORT}/api/coins        ║
║  Status:  http://localhost:${PORT}/api/ping         ║
╠════════════════════════════════════════════════╣
║  API Key: ${API_KEY ? '✓ Configured' : '✗ Not configured'.padEnd(31)}  ║
╚════════════════════════════════════════════════╝
`);
