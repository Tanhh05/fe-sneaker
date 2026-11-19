import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCartStore = defineStore('cart', () => {
  const loadInitialItems = () => {
    try {
      const raw = localStorage.getItem('sneakerhub_cart')
      if (!raw) return []
      const parsed = JSON.parse(raw)
      return (parsed || []).map(item => {
        const img = item.thumbnailUrl || item.imageUrl || (item.imageUrls && item.imageUrls[0]) || ''
        return {
          ...item,
          thumbnailUrl: img,
          imageUrl: img
        }
      })
    } catch (e) {
      return []
    }
  }

  const items = ref(loadInitialItems())

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
    const img = (variant && variant.thumbnailUrl) || product.thumbnailUrl || (product.imageUrls && product.imageUrls[0]) || ''
    if (existingIndex > -1) {
      items.value[existingIndex].quantity += quantity
      if (img && !items.value[existingIndex].thumbnailUrl) {
        items.value[existingIndex].thumbnailUrl = img
        items.value[existingIndex].imageUrl = img
      }
    } else {
      items.value.push({
        productId: product.id,
        productName: product.productName,
        productCode: product.productCode,
        thumbnailUrl: img,
        imageUrl: img,
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

  const addItem = (itemObj, quantity = 1) => {
    const vId = itemObj.variantId
    const existingIndex = items.value.findIndex(i => i.variantId === vId)
    const img = itemObj.thumbnailUrl || itemObj.imageUrl || ''
    if (existingIndex > -1) {
      items.value[existingIndex].quantity += quantity
      if (img && !items.value[existingIndex].thumbnailUrl) {
        items.value[existingIndex].thumbnailUrl = img
        items.value[existingIndex].imageUrl = img
      }
    } else {
      items.value.push({
        productId: itemObj.productId,
        productName: itemObj.productName,
        productCode: itemObj.productCode || '',
        thumbnailUrl: img,
        imageUrl: img,
        brandName: itemObj.brandName || '',
        categoryName: itemObj.categoryName || '',
        variantId: vId,
        sku: itemObj.sku || '',
        sizeValue: itemObj.sizeValue || '',
        colorName: itemObj.colorName || '',
        hexCode: itemObj.hexCode || '#000000',
        salePrice: itemObj.salePrice || 0,
        availableQuantity: itemObj.availableQuantity || 99,
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
    addItem,
    updateQuantity,
    removeFromCart,
    clearCart
  }
})
