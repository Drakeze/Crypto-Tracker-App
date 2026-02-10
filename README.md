# 📊 Crypto Tracker App

A lightweight, fully client-side cryptocurrency tracker built with **HTML, CSS, and Vanilla JavaScript**, using live market data from the CoinGecko API.

This project focuses on simplicity, clarity, and real-world API usage without any backend, frameworks, or build tools.

---

## 🚀 Features

- Fetches real-time cryptocurrency market data from CoinGecko
- Displays prices, market cap, rankings, and 24h change
- Clean and responsive UI
- Fully client-side (no backend required)
- No frameworks or libraries
- Easy to run locally or deploy as a static site

---

## 🧰 Tech Stack

- **HTML** – Application structure
- **CSS** – Styling and layout
- **JavaScript (Vanilla)** – Data fetching and UI logic
- **CoinGecko API** – Cryptocurrency market data

---

## 📁 Project Structure
```
Crypto-Tracker-App/
├── index.html     # Main HTML file
├── styles.css     # App styling
├── app.js         # UI logic and DOM updates
└── api.js         # CoinGecko API fetch logic
```
---

## 🌐 Data Source

This project uses the **CoinGecko Public API** to retrieve cryptocurrency market data.

- No API key required
- Public rate limits apply
- Data is fetched directly from the browser

---

## 📡 API Usage

Example endpoint used in the app: https://api.coingecko.com/api/v3/coins/markets

Example parameters:
- `vs_currency=usd`
- `order=market_cap_desc`
- `per_page=100`
- `page=1`
- `sparkline=false`

---

## ▶️ Running the Project

### Option 1: Open directly (simplest)

1. Clone or download the repository
2. Open `index.html` in your browser

That’s it.

---

### Option 2: Run with a local server (recommended)

Some browsers restrict API requests when opening files directly.

Using a local server avoids these issues.

#### Using VS Code Live Server
- Install the **Live Server** extension
- Right-click `index.html`
- Select **Open with Live Server**



