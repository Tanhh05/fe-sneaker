<template>
  <div class="store-home">
    <!-- Hero Editorial Section -->
    <section class="hero-editorial">
      <div class="layout-container hero-grid">
        <div class="hero-content">
          <div class="hero-eyebrow">
            <span class="eyebrow-accent-tag">CURATED ARCHIVE</span>
            <span class="eyebrow-sep">•</span>
            <span class="eyebrow-sub">SEASON 2026 // STREETWEAR VAULT</span>
          </div>
          <h1 class="hero-headline">
            DEFINED BY CULTURE.<br />
            <span class="headline-accent">BUILT FOR THE STREET.</span>
          </h1>
          <p class="hero-lead">
            Không gian lưu trữ và phân phối Sneaker chính hãng. Tuyển chọn những thiết kế kinh điển và các bản collab danh giá từ Nike, Air Jordan, Adidas, New Balance.
          </p>
          <div class="hero-actions">
            <router-link to="/shop" class="btn-primary-action">
              <span>KHÁM PHÁ CATALOG</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="arrow-svg">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </router-link>
            <router-link to="/tracking" class="btn-outline-action">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="btn-icon">
                <rect x="1" y="3" width="15" height="13"></rect>
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                <circle cx="5.5" cy="18.5" r="2.5"></circle>
                <circle cx="18.5" cy="18.5" r="2.5"></circle>
              </svg>
              <span>TRA CỨU ĐƠN HÀNG</span>
            </router-link>
          </div>

          <div class="hero-pillars">
            <div class="pillar-card">
              <div class="pillar-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
              </div>
              <div class="pillar-info">
                <span class="pillar-title">100% CHÍNH HÃNG</span>
                <span class="pillar-sub">Kiểm định Legit Check</span>
              </div>
            </div>

            <div class="pillar-card">
              <div class="pillar-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                  <rect x="1" y="3" width="15" height="13"></rect>
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                  <circle cx="5.5" cy="18.5" r="2.5"></circle>
                  <circle cx="18.5" cy="18.5" r="2.5"></circle>
                </svg>
              </div>
              <div class="pillar-info">
                <span class="pillar-title">FREESHIP TỪ 1TR</span>
                <span class="pillar-sub">Giao nhanh toàn quốc</span>
              </div>
            </div>

            <div class="pillar-card">
              <div class="pillar-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                  <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
                </svg>
              </div>
              <div class="pillar-info">
                <span class="pillar-title">07 NGÀY ĐỔI SIZE</span>
                <span class="pillar-sub">Hỗ trợ đổi tận nơi</span>
              </div>
            </div>
          </div>
        </div>

        <div class="hero-visual">
          <div class="visual-frame">
            <div class="visual-badge-top">
              <span class="live-dot"></span>
              <span class="badge-text">TOP 1 BEST-SELLER</span>
            </div>
            <div class="visual-ref-tag">
              <span>{{ heroProduct?.productCode || 'TOP #1' }} // {{ heroProduct?.brandName || 'SNEAKER' }}</span>
            </div>
            <img
              :src="heroImage"
              :alt="heroProduct?.productName || 'Sneaker'"
              class="hero-img"
            />
            <div class="floating-grail-tag">
              <div class="grail-header">
                <span class="grail-label">BÁN CHẠY NHẤT THÁNG</span>
                <span class="grail-edition">{{ heroProduct?.categoryName || 'HOT DROP' }}</span>
              </div>
              <div class="grail-body">
                <div class="grail-title">{{ heroProduct?.productName || 'Nike Air Force 1 07 Low' }}</div>

                <!-- Sizes & Colors Row -->
                <div class="grail-specs" v-if="heroSizes.length || heroColors.length">
                  <div class="spec-row" v-if="heroSizes.length">
                    <span class="spec-label">SIZES:</span>
                    <div class="spec-chips">
                      <span
                        v-for="s in heroSizes"
                        :key="s.sizeValue"
                        class="spec-chip"
                        :class="{ 'out-of-stock': !s.inStock }"
                        :title="s.inStock ? `Size EU ${s.sizeValue} (Sẵn hàng)` : `Size EU ${s.sizeValue} (Hết hàng)`"
                      >
                        {{ s.sizeValue }}
                      </span>
                    </div>
                  </div>

                  <div class="spec-row" v-if="heroColors.length">
                    <span class="spec-label">MÀU SẮC:</span>
                    <div class="color-chips">
                      <div
                        v-for="c in heroColors"
                        :key="c.colorName"
                        class="color-dot-chip"
                        :style="{ backgroundColor: c.hexCode }"
                        :title="c.colorName"
                      ></div>
                      <span class="color-count-label">({{ heroColors.length }} màu)</span>
                    </div>
                  </div>
                </div>

                <div class="grail-meta-row">
                  <span class="grail-price">{{ formatCurrency(heroProduct?.salePrice || 0) }}</span>
                  <router-link :to="heroProduct ? ('/product/' + heroProduct.id) : '/shop'" class="grail-link-btn">
                    <span>XEM NGAY</span>
                    <span class="link-arrow">→</span>
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Brand Ticker Bar -->
    <section class="brand-strip">
      <div class="layout-container">
        <div class="brand-strip-header">
          <span class="strip-eyebrow">OFFICIAL BRAND PARTNERS</span>
        </div>
        <div class="brands-row">
          <button
            v-for="b in brands"
            :key="b.id"
            class="brand-pill"
            @click="filterByBrand(b.id)"
          >
            <span class="brand-name">{{ b.brandName }}</span>
            <span class="brand-arrow">↗</span>
          </button>
        </div>
      </div>
    </section>

    <!-- Featured Releases Grid -->
    <section class="featured-section">
      <div class="layout-container">
        <div class="section-top-bar">
          <div>
            <span class="section-tag">CURATED DROPS</span>
            <h2 class="section-title">SẢN PHẨM TIÊU BIỂU</h2>
          </div>
          <router-link to="/shop" class="view-all-link">
            <span>XEM TẤT CẢ ({{ featuredProducts.length }})</span>
            <span class="link-arrow">→</span>
          </router-link>
        </div>

        <div v-if="loading" class="grid-loading">
          <div class="skeleton-card" v-for="i in 4" :key="i"></div>
        </div>

        <div v-else class="releases-grid">
          <div
            v-for="product in featuredProducts"
            :key="product.id"
            class="release-card"
            @click="viewProduct(product.id)"
          >
            <div class="release-media">
              <img
                :src="product.thumbnailUrl || (product.imageUrls && product.imageUrls[0]) || 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=600&q=80'"
                :alt="product.productName"
                class="media-img"
                loading="lazy"
              />
              <div class="media-badges">
                <span class="brand-mark">{{ product.brandName }}</span>
              </div>
              <button
                class="card-wishlist-btn"
                :class="{ active: wishlistStore.isFavorite(product.id) }"
                @click.stop="toggleWishlist(product)"
                :title="wishlistStore.isFavorite(product.id) ? 'Bỏ khỏi yêu thích' : 'Lưu vào yêu thích'"
                aria-label="Yêu thích"
              >
                <svg viewBox="0 0 24 24" :fill="wishlistStore.isFavorite(product.id) ? '#ef4444' : 'none'" :stroke="wishlistStore.isFavorite(product.id) ? '#ef4444' : '#18181b'" stroke-width="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </button>
              <div class="hover-cta">
                <span>XEM CHI TIẾT & SIZE</span>
                <span class="cta-arrow">→</span>
              </div>
            </div>

            <div class="release-info">
              <span class="category-meta">{{ product.categoryName }}</span>
              <h3 class="product-title">{{ product.productName }}</h3>
              <div class="product-pricing">
                <span class="current-price">{{ formatCurrency(product.salePrice) }}</span>
                <span v-if="product.importPrice" class="authentic-tag">LEGIT CHECKED</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Editorial Story / Standards Section -->
    <section class="editorial-standards">
      <div class="layout-container">
        <div class="standards-banner">
          <div class="standards-content">
            <span class="standards-eyebrow">OUR COMMITMENT</span>
            <h2 class="standards-title">TIÊU CHUẨN XUẤT SẮC TRONG TỪNG ĐÔI GIÀY</h2>
            <p class="standards-desc">
              Tại SneakerHub, chúng tôi không chỉ bán giày — chúng tôi gìn giữ văn hóa sneakerhead với cam kết chuẩn mực cao nhất từ khâu nhập khẩu, bảo quản kho chuyên dụng cho đến đóng gói giao hàng tận tay bạn.
            </p>

            <div class="pillars-grid">
              <div class="pillar-box">
                <span class="pillar-num">01</span>
                <h4 class="pillar-title">CHÍNH HÃNG 100%</h4>
                <p class="pillar-desc">Kiểm định nguồn gốc nghiêm ngặt, hoàn tiền 200% nếu phát hiện hàng giả mạo.</p>
              </div>

              <div class="pillar-box">
                <span class="pillar-num">02</span>
                <h4 class="pillar-title">DOUBLE-BOX SHIP</h4>
                <p class="pillar-desc">Luôn đóng 2 lớp hộp bảo vệ chuyên dụng chống móp méo hộp giày nguyên bản.</p>
              </div>

              <div class="pillar-box">
                <span class="pillar-num">03</span>
                <h4 class="pillar-title">ĐỔI SIZE 7 NGÀY</h4>
                <p class="pillar-desc">Hỗ trợ đổi size linh hoạt, nhanh chóng nếu mang không vừa hoặc không hợp ý.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import storeService from '@/services/storeService'
import { formatCurrency } from '@/utils/formatters'
import { useWishlistStore } from '@/stores/wishlist'

const router = useRouter()
const wishlistStore = useWishlistStore()

const loading = ref(false)
const brands = ref([])
const categories = ref([])
const featuredProducts = ref([])
const bestSellerProduct = ref(null)

const heroProduct = computed(() => {
  return bestSellerProduct.value || featuredProducts.value[0] || null
})

const heroImage = computed(() => {
  if (!heroProduct.value) {
    return 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800'
  }
  return heroProduct.value.thumbnailUrl || 
    (heroProduct.value.imageUrls && heroProduct.value.imageUrls[0]) || 
    'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800'
})

const heroSizes = computed(() => {
  if (!heroProduct.value || !heroProduct.value.variants) return []
  const map = new Map()
  heroProduct.value.variants.forEach(v => {
    if (v.sizeValue && !map.has(v.sizeValue)) {
      map.set(v.sizeValue, {
        sizeValue: v.sizeValue,
        inStock: (v.availableQuantity || 0) > 0
      })
    }
  })
  return Array.from(map.values()).sort((a, b) => {
    const na = parseFloat(a.sizeValue)
    const nb = parseFloat(b.sizeValue)
    if (!isNaN(na) && !isNaN(nb)) return na - nb
    return a.sizeValue.localeCompare(b.sizeValue)
  })
})

const heroColors = computed(() => {
  if (!heroProduct.value || !heroProduct.value.variants) return []
  const map = new Map()
  heroProduct.value.variants.forEach(v => {
    if (v.colorName && !map.has(v.colorName)) {
      map.set(v.colorName, {
        colorName: v.colorName,
        hexCode: v.hexCode || '#111827',
        colorCode: v.colorCode || ''
      })
    }
  })
  return Array.from(map.values())
})

const toggleWishlist = (product) => {
  const isAdded = wishlistStore.toggleFavorite(product)
  if (isAdded) {
    ElMessage.success(`Đã thêm "${product.productName}" vào danh sách yêu thích`)
  } else {
    ElMessage.info(`Đã bỏ "${product.productName}" khỏi danh sách yêu thích`)
  }
}

const loadData = async () => {
  loading.value = true
  try {
    const [bRes, cRes, pRes, bestRes] = await Promise.all([
      storeService.getBrands(),
      storeService.getCategories(),
      storeService.getFeaturedProducts(),
      storeService.getBestSellerProduct()
    ])
    brands.value = bRes?.data || []
    categories.value = cRes?.data || []
    featuredProducts.value = pRes?.data || []
    bestSellerProduct.value = bestRes?.data || null
  } catch (err) {
    console.error('Lỗi nạp dữ liệu trang chủ:', err)
  } finally {
    loading.value = false
  }
}

const filterByBrand = (brandId) => {
  router.push({ path: '/shop', query: { brand: brandId } })
}

const viewProduct = (productId) => {
  router.push(`/product/${productId}`)
}

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.store-home {
  padding-bottom: 80px;
  background: #ffffff;
}

.layout-container {
  max-width: 1360px;
  margin: 0 auto;
  padding: 0 28px;
}

/* Hero Section */
.hero-editorial {
  padding: 70px 0 80px;
  background: #ffffff;
  border-bottom: 1px solid #ebebeb;

  @media (max-width: 768px) {
    padding: 30px 0 40px;
  }

  .hero-grid {
    display: grid;
    grid-template-columns: 1.15fr 1fr;
    gap: 54px;
    align-items: center;

    @media (max-width: 992px) {
      grid-template-columns: 1fr;
      gap: 36px;
    }
  }

  .hero-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 18px;

    .eyebrow-accent-tag {
      background: #000000;
      color: #ffffff;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.1em;
      padding: 3px 8px;
    }

    .eyebrow-sep {
      color: #d4d4d4;
      font-size: 11px;
    }

    .eyebrow-sub {
      color: #71717a;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.12em;
    }
  }

  .hero-headline {
    font-size: 50px;
    font-weight: 900;
    line-height: 1.06;
    letter-spacing: -0.035em;
    color: #000000;
    margin: 0 0 18px;

    .headline-accent {
      display: inline-block;
      color: #000000;
    }

    @media (max-width: 992px) {
      font-size: 38px;
    }

    @media (max-width: 600px) {
      font-size: 28px;
      line-height: 1.15;
    }

    @media (max-width: 400px) {
      font-size: 24px;
    }
  }

  .hero-lead {
    font-size: 15.5px;
    line-height: 1.65;
    color: #525252;
    max-width: 520px;
    margin: 0 0 32px;

    @media (max-width: 600px) {
      font-size: 14px;
      margin-bottom: 24px;
    }
  }

  .hero-actions {
    display: flex;
    gap: 14px;
    align-items: center;
    margin-bottom: 38px;
    flex-wrap: wrap;

    @media (max-width: 600px) {
      flex-direction: column;
      width: 100%;
      gap: 12px;
      margin-bottom: 30px;

      .btn-primary-action,
      .btn-outline-action {
        width: 100%;
        justify-content: center;
      }
    }

    .btn-primary-action {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      background: #000000;
      color: #ffffff;
      padding: 15px 28px;
      font-size: 12.5px;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-decoration: none;
      border: 1px solid #000000;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);

      .arrow-svg {
        width: 16px;
        height: 16px;
        transition: transform 0.2s ease;
      }

      &:hover {
        background: #262626;
        border-color: #262626;
        .arrow-svg {
          transform: translateX(4px);
        }
      }
    }

    .btn-outline-action {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 14px 24px;
      font-size: 12.5px;
      font-weight: 800;
      letter-spacing: 0.06em;
      text-decoration: none;
      color: #000000;
      border: 1px solid #000000;
      background: #ffffff;
      transition: all 0.2s ease;

      .btn-icon {
        color: #000000;
      }

      &:hover {
        background: #000000;
        color: #ffffff;

        .btn-icon {
          color: #ffffff;
        }
      }
    }
  }

  .hero-pillars {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    padding-top: 28px;
    border-top: 1px solid #e5e5e5;

    @media (max-width: 600px) {
      grid-template-columns: 1fr;
      gap: 10px;
      padding-top: 20px;
    }

    .pillar-card {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      background: #ffffff;
      border: 1px solid #e5e5e5;
      transition: all 0.2s ease;
      box-sizing: border-box;

      &:hover {
        border-color: #000000;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
      }

      .pillar-icon {
        width: 30px;
        height: 30px;
        background: #f4f4f5;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #000000;
        flex-shrink: 0;
      }

      .pillar-info {
        display: flex;
        flex-direction: column;
        min-width: 0;

        .pillar-title {
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.03em;
          color: #000000;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .pillar-sub {
          font-size: 10px;
          color: #71717a;
          font-weight: 500;
          margin-top: 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }
  }

  .visual-frame {
    position: relative;
    background: #000000;
    border: 1px solid #000000;
    padding: 0;
    overflow: hidden;
    box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.16);

    .visual-badge-top {
      position: absolute;
      top: 16px;
      left: 16px;
      z-index: 3;
      background: rgba(0, 0, 0, 0.88);
      backdrop-filter: blur(8px);
      padding: 5px 10px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      border: 1px solid rgba(255, 255, 255, 0.18);

      .live-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #10b981;
        box-shadow: 0 0 8px #10b981;
      }

      .badge-text {
        font-size: 9.5px;
        font-weight: 800;
        letter-spacing: 0.1em;
        color: #ffffff;
        text-transform: uppercase;
      }
    }

    .visual-ref-tag {
      position: absolute;
      top: 16px;
      right: 16px;
      z-index: 3;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(8px);
      padding: 5px 10px;
      font-size: 9.5px;
      font-weight: 900;
      font-family: var(--font-mono);
      letter-spacing: 0.08em;
      color: #000000;
      border: 1px solid #000000;
    }

    .hero-img {
      width: 100%;
      height: 490px;
      object-fit: cover;
      display: block;
      filter: contrast(1.02);
      transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);

      @media (max-width: 992px) {
        height: 380px;
      }

      @media (max-width: 600px) {
        height: 280px;
      }
    }

    &:hover .hero-img {
      transform: scale(1.04);
    }

    .floating-grail-tag {
      position: absolute;
      bottom: 20px;
      left: 20px;
      right: 20px;
      z-index: 3;
      background: rgba(0, 0, 0, 0.92);
      backdrop-filter: blur(12px);
      color: #ffffff;
      padding: 14px 18px;
      border: 1px solid rgba(255, 255, 255, 0.16);
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.45);

      @media (max-width: 600px) {
        bottom: 12px;
        left: 12px;
        right: 12px;
        padding: 12px 14px;
      }

      .grail-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 5px;

        .grail-label {
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.12em;
          color: #a1a1aa;
          text-transform: uppercase;
        }

        .grail-edition {
          font-family: var(--font-mono);
          font-size: 9px;
          font-weight: 800;
          background: #27272a;
          padding: 2px 6px;
          color: #f4f4f5;
          letter-spacing: 0.05em;
        }
      }

      .grail-title {
        font-size: 14px;
        font-weight: 800;
        letter-spacing: -0.01em;
        color: #ffffff;
        margin-bottom: 6px;
      }

      .grail-specs {
        display: flex;
        flex-direction: column;
        gap: 6px;
        margin-bottom: 10px;
        padding: 6px 0;
        border-top: 1px dashed rgba(255, 255, 255, 0.15);
        border-bottom: 1px dashed rgba(255, 255, 255, 0.15);

        .spec-row {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;

          .spec-label {
            font-size: 9px;
            font-weight: 800;
            letter-spacing: 0.1em;
            color: #a1a1aa;
            text-transform: uppercase;
            min-width: 44px;
          }

          .spec-chips {
            display: flex;
            align-items: center;
            gap: 4px;
            flex-wrap: wrap;

            .spec-chip {
              font-family: var(--font-mono);
              font-size: 10px;
              font-weight: 700;
              padding: 2px 6px;
              background: rgba(255, 255, 255, 0.1);
              border: 1px solid rgba(255, 255, 255, 0.2);
              color: #ffffff;
              line-height: 1.2;

              &.out-of-stock {
                opacity: 0.4;
                text-decoration: line-through;
              }
            }
          }

          .color-chips {
            display: flex;
            align-items: center;
            gap: 6px;

            .color-dot-chip {
              width: 13px;
              height: 13px;
              border-radius: 50%;
              border: 1.5px solid rgba(255, 255, 255, 0.7);
              box-shadow: 0 0 3px rgba(0, 0, 0, 0.4);
              cursor: pointer;
              transition: transform 0.15s ease;

              &:hover {
                transform: scale(1.2);
              }
            }

            .color-count-label {
              font-size: 9.5px;
              color: #a1a1aa;
              font-weight: 600;
            }
          }
        }
      }

      .grail-meta-row {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .grail-price {
          font-size: 16px;
          font-weight: 900;
          color: #ffffff;
          font-variant-numeric: tabular-nums;
        }

        .grail-link-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: #ffffff;
          color: #000000;
          padding: 5px 12px;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.06em;
          text-decoration: none;
          text-transform: uppercase;
          transition: all 0.15s ease;

          .link-arrow {
            transition: transform 0.15s ease;
          }

          &:hover {
            background: #e4e4e7;
            .link-arrow {
              transform: translateX(3px);
            }
          }
        }
      }
    }
  }
}

/* Brand Strip */
.brand-strip {
  padding: 40px 0;
  border-bottom: 1px solid #ebebeb;

  .brand-strip-header {
    margin-bottom: 16px;
    .strip-eyebrow {
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.14em;
      color: #a3a3a3;
    }
  }

  .brands-row {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;

    .brand-pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 18px;
      background: #f5f5f5;
      border: 1px solid transparent;
      color: #171717;
      font-family: inherit;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.04em;
      cursor: pointer;
      transition: all 0.15s ease;

      .brand-arrow {
        color: #737373;
        font-size: 11px;
        transition: transform 0.15s ease;
      }

      &:hover {
        background: #000000;
        color: #ffffff;
        border-color: #000000;

        .brand-arrow {
          color: #ffffff;
          transform: translate(2px, -2px);
        }
      }
    }
  }
}

/* Featured Section */
.featured-section {
  padding: 80px 0 60px;

  .section-top-bar {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 40px;

    .section-tag {
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.14em;
      color: #737373;
      display: block;
      margin-bottom: 6px;
    }

    .section-title {
      font-size: 32px;
      font-weight: 900;
      letter-spacing: -0.02em;
      color: #000000;
      margin: 0;
    }

    .view-all-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: #000000;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-decoration: none;
      padding-bottom: 4px;
      border-bottom: 2px solid #000000;
      transition: gap 0.2s ease;

      &:hover {
        gap: 10px;
      }
    }
  }

  .releases-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 28px;

    @media (max-width: 1100px) {
      grid-template-columns: repeat(3, 1fr);
    }
    @media (max-width: 800px) {
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }
    @media (max-width: 500px) {
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }
    @media (max-width: 360px) {
      grid-template-columns: 1fr;
    }
  }

  .release-card {
    cursor: pointer;
    background: #ffffff;
    display: flex;
    flex-direction: column;
    transition: transform 0.2s ease;

    &:hover {
      .media-img {
        transform: scale(1.05);
      }
      .hover-cta {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .release-media {
      position: relative;
      background: #f5f5f7;
      aspect-ratio: 1 / 1;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;

      .media-img {
        width: 85%;
        height: 85%;
        object-fit: contain;
        transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      }

      .media-badges {
        position: absolute;
        top: 14px;
        left: 14px;

        .brand-mark {
          background: #000000;
          color: #ffffff;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.06em;
          padding: 4px 8px;
          text-transform: uppercase;
        }
      }

      .card-wishlist-btn {
        position: absolute;
        top: 12px;
        right: 12px;
        width: 34px;
        height: 34px;
        background: #ffffff;
        border: 1px solid #e4e4e7;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        z-index: 5;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        transition: all 0.15s ease;

        svg {
          width: 17px;
          height: 17px;
          transition: transform 0.15s ease;
        }

        &:hover {
          background: #ffffff;
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        &.active {
          border-color: #fca5a5;
          background: #fef2f2;
        }
      }

      .hover-cta {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        background: #000000;
        color: #ffffff;
        padding: 12px 16px;
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.08em;
        display: flex;
        justify-content: space-between;
        align-items: center;
        opacity: 0;
        transform: translateY(8px);
        transition: all 0.2s ease;
      }
    }

    .release-info {
      padding: 16px 4px 8px;

      .category-meta {
        font-size: 11px;
        font-weight: 600;
        color: #737373;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }

      .product-title {
        font-size: 15px;
        font-weight: 800;
        color: #0a0a0a;
        margin: 6px 0 10px;
        line-height: 1.35;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .product-pricing {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .current-price {
          font-size: 16px;
          font-weight: 900;
          letter-spacing: -0.02em;
          color: #000000;
          font-variant-numeric: tabular-nums;
        }

        .authentic-tag {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.06em;
          color: #10b981;
          border: 1px solid #d1fae5;
          padding: 2px 6px;
          background: #ecfdf5;
        }
      }
    }
  }
}

/* Standards Banner */
.editorial-standards {
  margin-top: 40px;

  .standards-banner {
    background: #000000;
    color: #ffffff;
    padding: 70px 60px;

    @media (max-width: 768px) {
      padding: 40px 24px;
    }

    .standards-eyebrow {
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.14em;
      color: #a3a3a3;
      display: block;
      margin-bottom: 12px;
    }

    .standards-title {
      font-size: 32px;
      font-weight: 900;
      letter-spacing: -0.02em;
      margin: 0 0 16px;
      max-width: 700px;
      line-height: 1.2;

      @media (max-width: 600px) {
        font-size: 24px;
      }
    }

    .standards-desc {
      font-size: 14px;
      line-height: 1.6;
      color: #a3a3a3;
      max-width: 640px;
      margin: 0 0 48px;
    }

    .pillars-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 36px;
      border-top: 1px solid #262626;
      padding-top: 40px;

      @media (max-width: 800px) {
        grid-template-columns: 1fr;
        gap: 28px;
      }

      .pillar-box {
        .pillar-num {
          font-size: 13px;
          font-weight: 800;
          color: #525252;
          font-family: monospace;
          display: block;
          margin-bottom: 10px;
        }

        .pillar-title {
          font-size: 14px;
          font-weight: 800;
          letter-spacing: 0.08em;
          margin: 0 0 8px;
          color: #ffffff;
        }

        .pillar-desc {
          font-size: 13px;
          line-height: 1.5;
          color: #737373;
          margin: 0;
        }
      }
    }
  }
}
</style>
