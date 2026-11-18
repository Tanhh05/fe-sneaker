import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useWishlistStore = defineStore('wishlist', () => {
  const items = ref(JSON.parse(localStorage.getItem('sneakerhub_wishlist') || '[]'))

  const saveWishlist = () => {
    localStorage.setItem('sneakerhub_wishlist', JSON.stringify(items.value))
  }

  const count = computed(() => items.value.length)

  const isFavorite = (productId) => {
    if (!productId) return false
    return items.value.some((item) => Number(item.productId || item.id) === Number(productId))
  }

  const toggleFavorite = (product) => {
    if (!product || !product.id) return false
    const id = Number(product.id)
    const index = items.value.findIndex((item) => Number(item.productId || item.id) === id)

    if (index > -1) {
      items.value.splice(index, 1)
      saveWishlist()
      return false
    } else {
      items.value.unshift({
        productId: product.id,
        id: product.id,
        productName: product.productName,
        productCode: product.productCode,
        thumbnailUrl: product.thumbnailUrl || (product.imageUrls && product.imageUrls[0]) || '',
        brandName: product.brandName,
        categoryName: product.categoryName,
        minPrice: product.minPrice ?? product.salePrice ?? 0,
        maxPrice: product.maxPrice ?? product.salePrice ?? 0,
        totalStock: product.totalStock ?? 1,
        addedAt: new Date().toISOString()
      })
      saveWishlist()
      return true
    }
  }

  const removeFromWishlist = (productId) => {
    const id = Number(productId)
    items.value = items.value.filter((item) => Number(item.productId || item.id) !== id)
    saveWishlist()
  }

  const clearWishlist = () => {
    items.value = []
    saveWishlist()
  }

  return {
    items,
    count,
    isFavorite,
    toggleFavorite,
    removeFromWishlist,
    clearWishlist
  }
})
