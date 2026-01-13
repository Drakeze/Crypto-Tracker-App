export function Attribution() {
  return (
    <div className="mt-16 pb-8 text-center">
      <p className="text-sm text-muted-foreground">
        Data provided by{" "}
        <a
          href="https://www.coingecko.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-green-600 hover:text-green-700 hover:underline font-semibold transition-colors"
        >
          CoinGecko
        </a>
      </p>
    </div>
  )
}
