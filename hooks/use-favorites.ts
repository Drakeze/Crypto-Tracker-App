"use client"

import { useEffect, useState } from "react"

const STORAGE_KEY = "crypto-favorites"

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setFavorites(JSON.parse(stored))
      }
    } catch (error) {
      console.error("Failed to load favorites:", error)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  useEffect(() => {
    if (!isLoaded) return

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites))
    } catch (error) {
      console.error("Failed to save favorites:", error)
    }
  }, [favorites, isLoaded])

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]))
  }

  const isFavorite = (id: string) => favorites.includes(id)

  const clearAllFavorites = () => setFavorites([])

  return {
    favorites,
    toggleFavorite,
    isFavorite,
    clearAllFavorites,
    isLoaded,
  }
}
