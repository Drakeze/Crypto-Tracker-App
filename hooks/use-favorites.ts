"use client"

import { useState, useEffect } from "react"

export function useFavorites() {
  const [favorites, setFavorites] = useState<number[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load favorites from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("crypto-favorites")
      if (stored) {
        setFavorites(JSON.parse(stored))
      } else {
        // Default favorites for first-time users
        setFavorites([1, 2, 5])
      }
    } catch (error) {
      console.error("Failed to load favorites:", error)
      setFavorites([1, 2, 5])
    } finally {
      setIsLoaded(true)
    }
  }, [])

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem("crypto-favorites", JSON.stringify(favorites))
      } catch (error) {
        console.error("Failed to save favorites:", error)
      }
    }
  }, [favorites, isLoaded])

  const toggleFavorite = (id: number) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]))
  }

  const isFavorite = (id: number) => favorites.includes(id)

  const clearAllFavorites = () => {
    setFavorites([])
  }

  return {
    favorites,
    toggleFavorite,
    isFavorite,
    clearAllFavorites,
    isLoaded,
  }
}
