<template>
  <div class="store-detail">
    <div class="container" v-loading="loading">
      <!-- Breadcrumb -->
      <div class="breadcrumb-bar" v-if="product">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/' }">Trang chủ</el-breadcrumb-item>
          <el-breadcrumb-item :to="{ path: '/shop' }">Sản phẩm</el-breadcrumb-item>
          <el-breadcrumb-item>{{ product.productName }}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>

      <div class="detail-grid" v-if="product">
        <!-- Left: Image Gallery -->
        <div class="gallery-col">
          <div class="main-image-wrap">
            <img :src="activeImage" :alt="product.productName" class="main-image" />
            <span class="brand-floating-tag">{{ product.brandName }}</span>
          </div>
          <div class="thumbnail-list" v-if="allImages.length > 1">
            <div
              v-for="(img, idx) in allImages"
              :key="idx"
              class="thumb-item"
              :class="{ active: activeImage === img }"
              @click="activeImage = img"
            >
              <img :src="img" :alt="product.productName" />
            </div>
          </div>
        </div>

        <!-- Right: Purchase Panel -->
        <div class="info-col">
          <div class="code-badge">{{ product.productCode }}</div>
          <h1 class="product-title">{{ product.productName }}</h1>
          
          <div class="meta-row">
            <span class="meta-item">Thương hiệu: <strong>{{ product.brandName }}</strong></span>
            <span class="meta-item">Dòng sản phẩm: <strong>{{ product.categoryName }}</strong></span>
            <span class="meta-item" v-if="product.material">Chất liệu: <strong>{{ product.material }}</strong></span>
          </div>

          <!-- Price Display -->
          <div class="price-display">
            <span class="price-current">{{ formatCurrency(selectedVariant ? selectedVariant.salePrice : product.salePrice) }}</span>
            <span class="tax-tag">Đã bao gồm VAT</span>
          </div>

          <!-- Color selection -->
          <div class="selector-section" v-if="uniqueColors.length">
            <div class="section-title">
              MÀU SẮC: <strong>{{ selectedColor ? selectedColor.colorName : 'Chọn màu' }}</strong>
            </div>
            <div class="color-options">
              <div
                v-for="color in uniqueColors"
                :key="color.id"
                class="color-pill"
                :class="{ active: selectedColor && selectedColor.id === color.id }"
                @click="selectColor(color)"
              >
                <span class="color-dot" :style="{ backgroundColor: color.hexCode || '#000000' }"></span>
                <span class="color-text">{{ color.colorName }}</span>
              </div>
            </div>
          </div>

          <!-- Size selection -->
          <div class="selector-section">
            <div class="section-title flex-between">
              <span>KÍCH THƯỚC (SIZE): <strong>{{ selectedSize ? selectedSize.sizeValue : 'Chọn size' }}</strong></span>
              <a href="javascript:void(0)" class="link-guide" @click="showSizeGuide = true">📏 Hướng dẫn chọn size</a>
            </div>
            <div class="size-options">
              <button
                v-for="size in availableSizesForColor"
                :key="size.id"
                class="size-box"
                :class="{
                  active: selectedSize && selectedSize.id === size.id,
                  disabled: size.availableQuantity === 0
                }"
                :disabled="size.availableQuantity === 0"
                @click="selectSize(size)"
              >
                <span class="size-val">{{ size.sizeValue }}</span>
                <span class="stock-sub" v-if="size.availableQuantity > 0">Còn {{ size.availableQuantity }}</span>
                <span class="stock-sub out" v-else>Hết</span>
              </button>
            </div>
          </div>

          <!-- Quantity & Stock Status -->
          <div class="quantity-section">
            <span class="section-title">SỐ LƯỢNG MUA:</span>
            <div class="quantity-controls">
              <el-input-number
                v-model="quantity"
                :min="1"
                :max="selectedVariant ? selectedVariant.availableQuantity : 1"
                :disabled="!selectedVariant || selectedVariant.availableQuantity <= 0"
              />
              <span class="stock-note" v-if="selectedVariant">
                (Kho còn sẵn <strong>{{ selectedVariant.availableQuantity }}</strong> đôi)
              </span>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="action-buttons">
            <button
              class="btn-add-cart"
              :disabled="!isReadyToBuy"
              @click="handleAddToCart"
            >
              <el-icon><ShoppingBag /></el-icon> THÊM VÀO GIỎ HÀNG
            </button>
            <button
              class="btn-buy-now"
              :disabled="!isReadyToBuy"
              @click="handleBuyNow"
            >
              MUA NGAY (THANH TOÁN)
            </button>
          </div>

          <!-- Guarantee Perks -->
          <div class="perks-list">
            <div class="perk-item">
              <span class="perk-icon">🚚</span>
              <span>Giao hàng miễn phí toàn quốc cho đơn trên 1.000.000đ</span>
            </div>
            <div class="perk-item">
              <span class="perk-icon">🛡️</span>
              <span>Cam kết 100% Authentic chính hãng - Check legit trọn đời</span>
            </div>
            <div class="perk-item">
              <span class="perk-icon">🔄</span>
              <span>Đổi size trong 7 ngày nếu mang không vừa chân</span>
            </div>
          </div>

          <!-- Description -->
          <div class="product-description" v-if="product.description">
            <h3 class="desc-heading">MÔ TẢ CHI TIẾT SẢN PHẨM</h3>
            <p class="desc-content">{{ product.description }}</p>
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
        <el-table-column prop="cm" label="Chiều dài chân (cm)" align="center" />
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ShoppingBag } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import storeService from '@/services/storeService'
import { useCartStore } from '@/stores/cart'
import { formatCurrency } from '@/utils/formatters'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()

const loading = ref(false)
const product = ref(null)
const activeImage = ref('')
const quantity = ref(1)

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
  let variants = product.value.variants
  if (selectedColor.value) {
    variants = variants.filter(v => (v.color ? v.color.id : v.colorId) === selectedColor.value.id)
  }
  return variants.map(v => {
    const s = v.size || { id: v.sizeId, sizeValue: v.sizeValue }
    return {
      ...s,
      variantId: v.id,
      availableQuantity: v.availableQuantity
    }
  })
})

const selectedVariant = computed(() => {
  if (!product.value || !product.value.variants || !selectedSize.value) return null
  return product.value.variants.find(v => {
    const matchesSize = (v.size ? v.size.id : v.sizeId) === selectedSize.value.id
    const matchesColor = !selectedColor.value || (v.color ? v.color.id : v.colorId) === selectedColor.value.id
    return matchesSize && matchesColor
  })
})

const isReadyToBuy = computed(() => {
  return selectedVariant.value && selectedVariant.value.availableQuantity > 0 && quantity.value > 0
})

const selectColor = (color) => {
  selectedColor.value = color
  selectedSize.value = null // reset size
}

const selectSize = (size) => {
  selectedSize.value = size
}

const loadProduct = async () => {
  loading.value = true
  try {
    const id = route.params.id
    const res = await storeService.getProductDetail(id)
    product.value = (res.data && res.data.data) || null
    if (allImages.value.length) {
      activeImage.value = allImages.value[0]
    }
    // Auto select first color
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
    ElMessage.warning('Vui lòng chọn Size và Màu sắc trước khi thêm!')
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
  padding-bottom: 70px;
}

.container {
  max-width: 1240px;
  margin: 0 auto;
  padding: 0 20px;
}

.breadcrumb-bar {
  padding: 24px 0 20px;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1.15fr;
  gap: 50px;
}

/* Left: Gallery */
.gallery-col {
  .main-image-wrap {
    position: relative;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    overflow: hidden;
    height: 480px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.04);

    .main-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .brand-floating-tag {
      position: absolute;
      top: 16px;
      left: 16px;
      background: rgba(15, 23, 42, 0.9);
      color: #ffffff;
      font-size: 13px;
      font-weight: 700;
      padding: 6px 12px;
      border-radius: 6px;
      backdrop-filter: blur(4px);
    }
  }

  .thumbnail-list {
    display: flex;
    gap: 12px;
    margin-top: 16px;

    .thumb-item {
      width: 80px;
      height: 80px;
      border: 2px solid #e2e8f0;
      border-radius: 10px;
      overflow: hidden;
      cursor: pointer;
      background: #ffffff;
      transition: all 0.2s;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      &.active,
      &:hover {
        border-color: #f97316;
      }
    }
  }
}

/* Right: Info Col */
.info-col {
  .code-badge {
    display: inline-block;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 1px;
    color: #64748b;
    background: #f1f5f9;
    padding: 4px 10px;
    border-radius: 4px;
    margin-bottom: 8px;
    text-transform: uppercase;
  }

  .product-title {
    font-size: 32px;
    font-weight: 900;
    color: #0f172a;
    line-height: 1.25;
    margin: 0 0 12px;
    letter-spacing: -0.5px;
  }

  .meta-row {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    font-size: 13.5px;
    color: #64748b;
    margin-bottom: 20px;

    strong {
      color: #0f172a;
    }
  }

  .price-display {
    display: flex;
    align-items: baseline;
    gap: 12px;
    background: #f8fafc;
    border: 1px dashed #cbd5e1;
    padding: 16px 20px;
    border-radius: 12px;
    margin-bottom: 24px;

    .price-current {
      font-size: 28px;
      font-weight: 900;
      color: #0f172a;
    }

    .tax-tag {
      font-size: 12px;
      color: #10b981;
      font-weight: 600;
    }
  }

  .selector-section {
    margin-bottom: 24px;

    .section-title {
      font-size: 13.5px;
      font-weight: 700;
      color: #334155;
      margin-bottom: 12px;

      strong {
        color: #f97316;
      }

      &.flex-between {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .link-guide {
        font-size: 12px;
        color: #2563eb;
        text-decoration: none;
        font-weight: 600;

        &:hover {
          text-decoration: underline;
        }
      }
    }
  }

  .color-options {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;

    .color-pill {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      border: 1.5px solid #e2e8f0;
      background: #ffffff;
      border-radius: 8px;
      cursor: pointer;
      font-size: 13.5px;
      font-weight: 600;
      transition: all 0.2s;

      .color-dot {
        width: 14px;
        height: 14px;
        border-radius: 50%;
        border: 1px solid #cbd5e1;
      }

      &.active {
        border-color: #f97316;
        background: #fff7ed;
        color: #ea580c;
      }
    }
  }

  .size-options {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 10px;

    .size-box {
      background: #ffffff;
      border: 1.5px solid #e2e8f0;
      border-radius: 8px;
      padding: 10px 4px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;

      .size-val {
        font-size: 15px;
        font-weight: 800;
        color: #0f172a;
      }

      .stock-sub {
        font-size: 10px;
        color: #10b981;
        margin-top: 2px;

        &.out {
          color: #ef4444;
        }
      }

      &.active {
        border-color: #f97316;
        background: #0f172a;

        .size-val {
          color: #ffffff;
        }
        .stock-sub {
          color: #f97316;
        }
      }

      &.disabled {
        opacity: 0.45;
        cursor: not-allowed;
        background: #f1f5f9;
      }
    }
  }

  .quantity-section {
    margin-bottom: 28px;

    .quantity-controls {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-top: 8px;

      .stock-note {
        font-size: 13px;
        color: #64748b;

        strong {
          color: #0f172a;
        }
      }
    }
  }

  .action-buttons {
    display: grid;
    grid-template-columns: 1fr 1.2fr;
    gap: 16px;
    margin-bottom: 28px;

    button {
      padding: 16px;
      font-size: 14px;
      font-weight: 800;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .btn-add-cart {
      background: #ffffff;
      border: 2px solid #0f172a;
      color: #0f172a;

      &:hover:not(:disabled) {
        background: #f1f5f9;
      }
    }

    .btn-buy-now {
      background: #f97316;
      border: 2px solid #f97316;
      color: #ffffff;
      box-shadow: 0 4px 15px rgba(249, 115, 22, 0.4);

      &:hover:not(:disabled) {
        background: #ea580c;
        border-color: #ea580c;
      }
    }

    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      box-shadow: none;
    }
  }

  .perks-list {
    background: #f8fafc;
    border-radius: 12px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 28px;

    .perk-item {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 13px;
      color: #334155;

      .perk-icon {
        font-size: 16px;
      }
    }
  }

  .product-description {
    border-top: 1px solid #e2e8f0;
    padding-top: 24px;

    .desc-heading {
      font-size: 15px;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 10px;
    }

    .desc-content {
      font-size: 14px;
      line-height: 1.6;
      color: #475569;
      white-space: pre-line;
    }
  }
}

@media (max-width: 900px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>
