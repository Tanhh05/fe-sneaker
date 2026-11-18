<template>
  <div class="store-detail">
    <div class="layout-container">
      <!-- Breadcrumb -->
      <div class="detail-breadcrumb">
        <router-link to="/">Trang chủ</router-link>
        <span class="sep">/</span>
        <router-link to="/shop">Bộ sưu tập</router-link>
        <span class="sep">/</span>
        <span class="current">{{ product ? product.productName : 'Chi tiết giày' }}</span>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="detail-loading-box">
        <el-skeleton :rows="10" animated />
      </div>

      <!-- Main Product Grid -->
      <div v-else-if="product" class="product-layout-grid">
        <!-- Left: Product Gallery -->
        <div class="product-gallery">
          <div class="main-image-viewport">
            <img
              :src="activeImage"
              :alt="product.productName"
              class="active-sneaker-img"
            />
            <div class="gallery-badge">
              <span>AUTHENTIC PAIR</span>
            </div>
          </div>

          <!-- Thumbnails Strip -->
          <div class="thumbnails-strip" v-if="allImages.length > 1">
            <button
              v-for="(img, idx) in allImages"
              :key="idx"
              class="thumb-btn"
              :class="{ active: activeImage === img }"
              @click="activeImage = img"
            >
              <img :src="img" :alt="`Thumbnail ${idx}`" />
            </button>
          </div>
        </div>

        <!-- Right: Sticky Buy Box -->
        <div class="product-buybox">
          <div class="buybox-header">
            <div class="brand-eyebrow">
              <span class="brand-name">{{ product.brandName }}</span>
              <span class="dot-sep">•</span>
              <span class="category-name">{{ product.categoryName }}</span>
            </div>
            <h1 class="product-headline">{{ product.productName }}</h1>
            <div class="sku-row">
              <span class="sku-tag">MÃ SKU: {{ selectedVariant ? selectedVariant.sku : product.productCode }}</span>
              <span class="stock-indicator" :class="{ 'in-stock': currentStock > 0, 'out-stock': currentStock === 0 }">
                <span class="stock-dot"></span>
                <span>{{ currentStock > 0 ? `Còn ${currentStock} đôi sẵn kho` : 'Tạm hết size này' }}</span>
              </span>
            </div>
          </div>

          <!-- Pricing Section -->
          <div class="pricing-card">
            <div class="price-main">
              <span class="price-val">{{ formatCurrency(product.salePrice) }}</span>
              <span class="price-tax">Đã bao gồm VAT & Hộp chính hãng</span>
            </div>
            <div class="perk-pill">
              <span class="perk-highlight">Freeship</span> toàn quốc cho đơn hàng này
            </div>
          </div>

          <!-- Color Options -->
          <div class="option-group" v-if="uniqueColors.length">
            <div class="group-title-row">
              <span class="group-title">MÀU SẮC</span>
              <span class="selected-text">{{ selectedColor ? selectedColor.colorName : '' }}</span>
            </div>
            <div class="color-swatches">
              <button
                v-for="c in uniqueColors"
                :key="c.id"
                class="swatch-btn"
                :class="{ active: selectedColor && selectedColor.id === c.id }"
                @click="selectColor(c)"
              >
                <span
                  class="color-dot"
                  :style="{ backgroundColor: c.hexCode || '#000000' }"
                ></span>
                <span class="color-title">{{ c.colorName }}</span>
              </button>
            </div>
          </div>

          <!-- Size Selector Matrix -->
          <div class="option-group">
            <div class="group-title-row">
              <span class="group-title">CHỌN KÍCH CỠ (SIZE EU / VN)</span>
              <button class="size-chart-link" @click="showSizeGuide = true">
                Bảng quy đổi size ↗
              </button>
            </div>

            <div class="size-matrix">
              <button
                v-for="size in availableSizesForColor"
                :key="size.id"
                class="size-tile"
                :class="{
                  active: selectedSize && selectedSize.id === size.id,
                  disabled: size.stock <= 0
                }"
                :disabled="size.stock <= 0"
                @click="selectSize(size)"
              >
                <span class="size-val">{{ size.sizeValue }}</span>
                <span class="size-sub">{{ size.stock > 0 ? `Kho: ${size.stock}` : 'Hết' }}</span>
              </button>
            </div>
            <p v-if="!selectedSize" class="size-hint">
              Vui lòng chọn size phù hợp với bạn để tiếp tục đặt hàng.
            </p>
          </div>

          <!-- Quantity Stepper -->
          <div class="quantity-row" v-if="selectedVariant && currentStock > 0">
            <span class="qty-label">SỐ LƯỢNG:</span>
            <div class="qty-stepper">
              <button
                class="step-btn"
                :disabled="quantity <= 1"
                @click="quantity > 1 && quantity--"
              >
                −
              </button>
              <span class="qty-val">{{ quantity }}</span>
              <button
                class="step-btn"
                :disabled="quantity >= currentStock"
                @click="quantity < currentStock && quantity++"
              >
                +
              </button>
            </div>
          </div>

          <!-- Purchase Action Buttons -->
          <div class="cta-actions">
            <button
              class="btn-add-cart"
              :disabled="!isReadyToBuy"
              @click="handleAddToCart"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="cart-icon-svg">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
              <span>{{ isReadyToBuy ? 'THÊM VÀO GIỎ HÀNG' : 'CHỌN SIZE ĐỂ MUA' }}</span>
            </button>

            <button
              class="btn-buy-express"
              :disabled="!isReadyToBuy"
              @click="handleBuyNow"
            >
              MUA NGAY (GIAO TẬN NƠI)
            </button>

            <button
              class="btn-wishlist-toggle"
              :class="{ active: wishlistStore.isFavorite(product?.id) }"
              @click="handleToggleWishlist"
              :title="wishlistStore.isFavorite(product?.id) ? 'Bỏ khỏi yêu thích' : 'Lưu vào danh sách yêu thích'"
            >
              <svg viewBox="0 0 24 24" :fill="wishlistStore.isFavorite(product?.id) ? '#ef4444' : 'none'" :stroke="wishlistStore.isFavorite(product?.id) ? '#ef4444' : '#18181b'" stroke-width="2" class="heart-svg">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
              <span>{{ wishlistStore.isFavorite(product?.id) ? 'ĐÃ LƯU VÀO YÊU THÍCH' : 'THÊM VÀO YÊU THÍCH' }}</span>
            </button>
          </div>

          <!-- Assurance Perks -->
          <div class="assurance-list">
            <div class="assurance-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="perk-svg">
                <rect x="1" y="3" width="15" height="13"></rect>
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                <circle cx="5.5" cy="18.5" r="2.5"></circle>
                <circle cx="18.5" cy="18.5" r="2.5"></circle>
              </svg>
              <div>
                <strong>Miễn phí vận chuyển toàn quốc</strong>
                <p>Đơn hàng từ 1.000.000₫ được hỗ trợ freeship tận nhà.</p>
              </div>
            </div>

            <div class="assurance-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="perk-svg">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
              <div>
                <strong>Cam kết chính hãng trọn đời</strong>
                <p>Phát hiện hàng giả/nhái đền tiền gấp đôi ngay lập tức.</p>
              </div>
            </div>

            <div class="assurance-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="perk-svg">
                <polyline points="23 4 23 10 17 10"></polyline>
                <polyline points="1 20 1 14 7 14"></polyline>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
              </svg>
              <div>
                <strong>Đổi size linh hoạt trong 7 ngày</strong>
                <p>Hỗ trợ đổi sang size vừa vặn nếu sản phẩm còn nguyên tem mác.</p>
              </div>
            </div>
          </div>

          <!-- Product Specifications & Story -->
          <div class="specs-accordion" v-if="product.description || product.material">
            <h3 class="specs-title">THÔNG TIN SẢN PHẨM & CHẤT LIỆU</h3>
            <p class="specs-desc" v-if="product.description">{{ product.description }}</p>
            <div class="spec-row" v-if="product.material">
              <span class="spec-label">Chất liệu:</span>
              <span class="spec-val">{{ product.material }}</span>
            </div>
            <div class="spec-row">
              <span class="spec-label">Thương hiệu:</span>
              <span class="spec-val">{{ product.brandName }}</span>
            </div>
            <div class="spec-row">
              <span class="spec-label">Phân loại:</span>
              <span class="spec-val">{{ product.categoryName }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Size Guide Dialog -->
    <el-dialog v-model="showSizeGuide" title="BẢNG QUY ĐỔI KÍCH THƯỚC GIÀY (SIZE GUIDE)" width="600px">
      <el-table :data="sizeGuideData" border stripe>
        <el-table-column prop="eu" label="EU (VN)" align="center" width="100" />
        <el-table-column prop="us" label="US Men" align="center" width="100" />
        <el-table-column prop="uk" label="UK" align="center" width="100" />
        <el-table-column prop="cm" label="Chiều dài bàn chân" align="center" />
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import storeService from '@/services/storeService'
import { useCartStore } from '@/stores/cart'
import { useWishlistStore } from '@/stores/wishlist'
import { formatCurrency } from '@/utils/formatters'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()
const wishlistStore = useWishlistStore()

const loading = ref(false)
const product = ref(null)
const activeImage = ref('')
const quantity = ref(1)

const handleToggleWishlist = () => {
  if (!product.value) return
  const isAdded = wishlistStore.toggleFavorite(product.value)
  if (isAdded) {
    ElMessage.success(`Đã thêm "${product.value.productName}" vào danh sách yêu thích`)
  } else {
    ElMessage.info(`Đã bỏ "${product.value.productName}" khỏi danh sách yêu thích`)
  }
}

const selectedColor = ref(null)
const selectedSize = ref(null)
const showSizeGuide = ref(false)

const sizeGuideData = [
  { eu: '36', us: '4.0', uk: '3.5', cm: '22.5 cm' },
  { eu: '37', us: '5.0', uk: '4.5', cm: '23.0 cm' },
  { eu: '38', us: '5.5', uk: '5.0', cm: '24.0 cm' },
  { eu: '39', us: '6.5', uk: '6.0', cm: '24.5 cm' },
  { eu: '40', us: '7.0', uk: '6.0', cm: '25.0 cm' },
  { eu: '41', us: '8.0', uk: '7.0', cm: '26.0 cm' },
  { eu: '42', us: '8.5', uk: '7.5', cm: '26.5 cm' },
  { eu: '43', us: '9.5', uk: '8.5', cm: '27.5 cm' },
  { eu: '44', us: '10.0', uk: '9.0', cm: '28.0 cm' },
  { eu: '45', us: '11.0', uk: '10.0', cm: '29.0 cm' }
]

const allImages = computed(() => {
  if (!product.value) return []
  const list = []
  if (product.value.thumbnailUrl) list.push(product.value.thumbnailUrl)
  if (product.value.imageUrls && product.value.imageUrls.length) {
    product.value.imageUrls.forEach(img => {
      if (!list.includes(img)) list.push(img)
    })
  }
  if (list.length === 0) {
    list.push('https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80')
  }
  return list
})

const uniqueColors = computed(() => {
  if (!product.value || !product.value.variants) return []
  const map = new Map()
  product.value.variants.forEach(v => {
    const c = v.color || { id: v.colorId, colorName: v.colorName, hexCode: v.hexCode }
    if (c && c.id && !map.has(c.id)) {
      map.set(c.id, c)
    }
  })
  return Array.from(map.values())
})

const availableSizesForColor = computed(() => {
  if (!product.value || !product.value.variants) return []
  return product.value.variants
    .filter(v => {
      if (!selectedColor.value) return true
      const cId = v.color ? v.color.id : v.colorId
      return cId === selectedColor.value.id
    })
    .map(v => ({
      id: v.size ? v.size.id : v.sizeId,
      sizeValue: v.size ? v.size.sizeValue : v.sizeValue,
      stock: v.quantityInStock !== undefined ? v.quantityInStock : 10,
      variant: v
    }))
})

const selectedVariant = computed(() => {
  if (!product.value || !product.value.variants || !selectedSize.value) return null
  return product.value.variants.find(v => {
    const sId = v.size ? v.size.id : v.sizeId
    const cId = v.color ? v.color.id : v.colorId
    const matchSize = sId === selectedSize.value.id
    const matchColor = selectedColor.value ? cId === selectedColor.value.id : true
    return matchSize && matchColor
  })
})

const currentStock = computed(() => {
  if (!selectedVariant.value) {
    if (product.value && product.value.variants) {
      return product.value.variants.reduce((acc, v) => acc + (v.quantityInStock || 0), 0)
    }
    return 10
  }
  return selectedVariant.value.quantityInStock !== undefined ? selectedVariant.value.quantityInStock : 10
})

const isReadyToBuy = computed(() => {
  return selectedVariant.value && currentStock.value > 0
})

const selectColor = (color) => {
  selectedColor.value = color
  selectedSize.value = null
}

const selectSize = (size) => {
  selectedSize.value = size
}

const loadProduct = async () => {
  loading.value = true
  try {
    const id = route.params.id
    const res = await storeService.getProductDetail(id)
    product.value = res?.data || null
    if (allImages.value.length) {
      activeImage.value = allImages.value[0]
    }
    if (uniqueColors.value.length) {
      selectedColor.value = uniqueColors.value[0]
    }
  } catch (err) {
    console.error('Lỗi nạp sản phẩm:', err)
    ElMessage.error('Không tìm thấy thông tin sản phẩm')
  } finally {
    loading.value = false
  }
}

const handleAddToCart = () => {
  if (!selectedVariant.value) {
    ElMessage.warning('Vui lòng chọn Size giày trước khi thêm vào giỏ!')
    return
  }
  cartStore.addToCart(product.value, selectedVariant.value, quantity.value)
  ElMessage.success(`Đã thêm "${product.value.productName}" (Size ${selectedSize.value.sizeValue}) vào giỏ hàng!`)
}

const handleBuyNow = () => {
  handleAddToCart()
  router.push('/cart')
}

onMounted(() => {
  loadProduct()
})
</script>

<style scoped lang="scss">
.store-detail {
  padding-bottom: 90px;
  background: #ffffff;
}

.layout-container {
  max-width: 1360px;
  margin: 0 auto;
  padding: 0 28px;
}

.detail-breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #737373;
  padding: 24px 0 32px;

  a {
    color: #737373;
    text-decoration: none;
    transition: color 0.15s ease;
    &:hover {
      color: #000000;
    }
  }

  .sep {
    color: #d4d4d4;
  }

  .current {
    color: #000000;
  }
}

.product-layout-grid {
  display: grid;
  grid-template-columns: 1.15fr 1fr;
  gap: 60px;
  align-items: flex-start;

  @media (max-width: 992px) {
    grid-template-columns: 1fr;
    gap: 40px;
  }
}

/* Gallery */
.product-gallery {
  position: sticky;
  top: 96px;

  .main-image-viewport {
    position: relative;
    background: #f5f5f7;
    aspect-ratio: 1 / 1;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;

    .active-sneaker-img {
      width: 85%;
      height: 85%;
      object-fit: contain;
      transition: transform 0.3s ease;
    }

    .gallery-badge {
      position: absolute;
      top: 18px;
      left: 18px;
      background: #000000;
      color: #ffffff;
      font-size: 9px;
      font-weight: 800;
      letter-spacing: 0.1em;
      padding: 4px 8px;
    }
  }

  .thumbnails-strip {
    display: flex;
    gap: 12px;
    margin-top: 16px;

    .thumb-btn {
      width: 80px;
      height: 80px;
      background: #f5f5f7;
      border: 1px solid #e5e5e5;
      padding: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s ease;

      img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }

      &:hover,
      &.active {
        border-color: #000000;
        background: #ffffff;
      }
    }
  }
}

/* Buy Box */
.product-buybox {
  display: flex;
  flex-direction: column;

  .brand-eyebrow {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.12em;
    color: #737373;
    text-transform: uppercase;
    margin-bottom: 8px;

    .dot-sep {
      color: #d4d4d4;
    }
  }

  .product-headline {
    font-size: 34px;
    font-weight: 900;
    letter-spacing: -0.02em;
    color: #000000;
    line-height: 1.15;
    margin: 0 0 12px;

    @media (max-width: 600px) {
      font-size: 26px;
    }
  }

  .sku-row {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 24px;

    .sku-tag {
      font-size: 11px;
      font-weight: 700;
      color: #737373;
      font-family: monospace;
      letter-spacing: 0.06em;
    }

    .stock-indicator {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      font-weight: 700;

      .stock-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
      }

      &.in-stock {
        color: #15803d;
        .stock-dot {
          background: #10b981;
        }
      }

      &.out-stock {
        color: #b91c1c;
        .stock-dot {
          background: #ef4444;
        }
      }
    }
  }

  .pricing-card {
    background: #fafafa;
    border: 1px solid #ebebeb;
    padding: 20px 24px;
    margin-bottom: 30px;

    .price-main {
      display: flex;
      align-items: baseline;
      gap: 12px;
      margin-bottom: 6px;

      .price-val {
        font-size: 28px;
        font-weight: 900;
        letter-spacing: -0.03em;
        color: #000000;
        font-variant-numeric: tabular-nums;
      }

      .price-tax {
        font-size: 12px;
        color: #737373;
      }
    }

    .perk-pill {
      font-size: 12px;
      color: #525252;
      .perk-highlight {
        font-weight: 800;
        color: #000000;
      }
    }
  }

  .option-group {
    margin-bottom: 28px;

    .group-title-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      .group-title {
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.1em;
        color: #000000;
        text-transform: uppercase;
      }

      .selected-text {
        font-size: 12px;
        font-weight: 700;
        color: #525252;
      }

      .size-chart-link {
        background: none;
        border: none;
        font-family: inherit;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.04em;
        color: #737373;
        text-decoration: underline;
        cursor: pointer;
        padding: 0;

        &:hover {
          color: #000000;
        }
      }
    }

    .color-swatches {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;

      .swatch-btn {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 8px 14px;
        background: #ffffff;
        border: 1px solid #e5e5e5;
        font-family: inherit;
        font-size: 12px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.15s ease;

        .color-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 1px solid rgba(0, 0, 0, 0.1);
        }

        &:hover {
          border-color: #000000;
        }

        &.active {
          border-color: #000000;
          background: #000000;
          color: #ffffff;
        }
      }
    }

    .size-matrix {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;

      @media (max-width: 500px) {
        grid-template-columns: repeat(3, 1fr);
      }

      .size-tile {
        height: 52px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: #ffffff;
        border: 1px solid #e5e5e5;
        font-family: inherit;
        cursor: pointer;
        transition: all 0.15s ease;

        .size-val {
          font-size: 14px;
          font-weight: 800;
          color: #000000;
        }

        .size-sub {
          font-size: 10px;
          color: #737373;
          margin-top: 2px;
        }

        &:hover:not(.disabled) {
          border-color: #000000;
        }

        &.active {
          background: #000000;
          border-color: #000000;
          .size-val {
            color: #ffffff;
          }
          .size-sub {
            color: #a3a3a3;
          }
        }

        &.disabled {
          background: #fafafa;
          border-color: #f0f0f0;
          opacity: 0.4;
          cursor: not-allowed;
          position: relative;
        }
      }
    }

    .size-hint {
      font-size: 12px;
      color: #e11d48;
      margin: 8px 0 0;
      font-weight: 600;
    }
  }

  .quantity-row {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 28px;

    .qty-label {
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.1em;
      color: #000000;
    }

    .qty-stepper {
      display: flex;
      align-items: center;
      border: 1px solid #e5e5e5;

      .step-btn {
        width: 36px;
        height: 36px;
        background: none;
        border: none;
        font-size: 16px;
        cursor: pointer;
        color: #000000;
        display: flex;
        align-items: center;
        justify-content: center;

        &:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        &:hover:not(:disabled) {
          background: #f5f5f5;
        }
      }

      .qty-val {
        width: 36px;
        text-align: center;
        font-size: 13px;
        font-weight: 800;
        font-variant-numeric: tabular-nums;
      }
    }
  }

  .cta-actions {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 36px;

    .btn-add-cart {
      height: 54px;
      background: #000000;
      color: #ffffff;
      border: 1px solid #000000;
      font-family: inherit;
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 0.08em;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      cursor: pointer;
      transition: all 0.2s ease;

      .cart-icon-svg {
        width: 18px;
        height: 18px;
      }

      &:hover:not(:disabled) {
        background: #262626;
      }

      &:disabled {
        background: #e5e5e5;
        border-color: #e5e5e5;
        color: #a3a3a3;
        cursor: not-allowed;
      }
    }

    .btn-buy-express {
      height: 50px;
      background: transparent;
      color: #000000;
      border: 1px solid #000000;
      font-family: inherit;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.08em;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover:not(:disabled) {
        background: #f5f5f5;
      }

      &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }
    }

    .btn-wishlist-toggle {
      height: 48px;
      background: #ffffff;
      color: #000000;
      border: 1.5px solid #18181b;
      font-family: inherit;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.08em;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      transition: all 0.2s ease;

      .heart-svg {
        width: 18px;
        height: 18px;
        transition: transform 0.2s ease;
      }

      &:hover {
        background: #f4f4f5;
        border-color: #000000;
        .heart-svg {
          transform: scale(1.15);
        }
      }

      &.active {
        background: #fef2f2;
        border-color: #f87171;
        color: #dc2626;

        .heart-svg {
          color: #ef4444;
          fill: #ef4444;
        }
      }
    }
  }

  .assurance-list {
    border-top: 1px solid #ebebeb;
    border-bottom: 1px solid #ebebeb;
    padding: 24px 0;
    margin-bottom: 30px;
    display: flex;
    flex-direction: column;
    gap: 16px;

    .assurance-item {
      display: flex;
      gap: 14px;
      align-items: flex-start;

      .perk-svg {
        width: 20px;
        height: 20px;
        color: #000000;
        flex-shrink: 0;
        margin-top: 2px;
      }

      strong {
        font-size: 13px;
        font-weight: 800;
        color: #000000;
        display: block;
        margin-bottom: 2px;
      }

      p {
        font-size: 12px;
        color: #737373;
        margin: 0;
        line-height: 1.4;
      }
    }
  }

  .specs-accordion {
    .specs-title {
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.1em;
      color: #000000;
      text-transform: uppercase;
      margin: 0 0 12px;
    }

    .specs-desc {
      font-size: 13px;
      color: #525252;
      line-height: 1.6;
      margin: 0 0 16px;
    }

    .spec-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #f5f5f5;
      font-size: 12px;

      .spec-label {
        color: #737373;
      }

      .spec-val {
        color: #000000;
        font-weight: 700;
      }
    }
  }
}
</style>
