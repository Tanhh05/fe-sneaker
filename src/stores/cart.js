import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCartStore = defineStore('cart', () => {
  const items = ref(JSON.parse(localStorage.getItem('sneakerhub_cart') || '[]'))

  const saveCart = () => {
    localStorage.setItem('sneakerhub_cart', JSON.stringify(items.value))
  }

  const totalItems = computed(() => {
    return items.value.reduce((sum, item) => sum + item.quantity, 0)
  })

  const totalPrice = computed(() => {
    return items.value.reduce((sum, item) => sum + item.salePrice * item.quantity, 0)
  })

  const addToCart = (product, variant, quantity = 1) => {
    const existingIndex = items.value.findIndex(i => i.variantId === variant.id)
    if (existingIndex > -1) {
      items.value[existingIndex].quantity += quantity
    } else {
      items.value.push({
        productId: product.id,
        productName: product.productName,
        productCode: product.productCode,
        thumbnailUrl: product.thumbnailUrl || (product.imageUrls && product.imageUrls[0]) || '',
        brandName: product.brandName,
        categoryName: product.categoryName,
        variantId: variant.id,
        sku: variant.sku,
        sizeValue: variant.sizeValue || (variant.size ? variant.size.sizeValue : ''),
        colorName: variant.colorName || (variant.color ? variant.color.colorName : ''),
        hexCode: variant.hexCode || (variant.color ? variant.color.hexCode : '#000000'),
        salePrice: variant.salePrice || product.salePrice,
        availableQuantity: variant.availableQuantity,
        quantity: quantity
      })
    }
    saveCart()
  }

  const updateQuantity = (variantId, quantity) => {
    const item = items.value.find(i => i.variantId === variantId)
    if (item) {
      if (quantity <= 0) {
        removeFromCart(variantId)
      } else {
        item.quantity = quantity
        saveCart()
      }
    }
  }

  const removeFromCart = (variantId) => {
    items.value = items.value.filter(i => i.variantId !== variantId)
    saveCart()
  }

  const clearCart = () => {
    items.value = []
    saveCart()
  }

  return {
    items,
    totalItems,
    totalPrice,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart
  }
})
