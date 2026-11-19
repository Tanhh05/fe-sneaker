<template>
  <div class="store-home">
    <!-- Hero Editorial Section -->
    <section class="hero-editorial">
      <div class="layout-container hero-grid">
        <div class="hero-content">
          <div class="hero-eyebrow">
            <span class="eyebrow-dash"></span>
            <span>CURATED ARCHIVE • SEASON 2026</span>
          </div>
          <h1 class="hero-headline">
            DEFINED BY CULTURE.<br />
            BUILT FOR THE STREET.
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
              TRA CỨU ĐƠN HÀNG
            </router-link>
          </div>

          <div class="hero-stats">
            <div class="stat-item">
              <span class="stat-number">100%</span>
              <span class="stat-label">AUTHENTIC GUARANTEE</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <span class="stat-number">0₫</span>
              <span class="stat-label">FREESHIP TOÀN QUỐC TỪ 1TR</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <span class="stat-number">07</span>
              <span class="stat-label">NGÀY ĐỔI SIZE MIỄN PHÍ</span>
            </div>
          </div>
        </div>

        <div class="hero-visual">
          <div class="visual-frame">
            <img
              src="https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1000&q=85"
              alt="Air Jordan 1 Hero"
              class="hero-img"
            />
            <div class="floating-grail-tag">
              <span class="grail-label">ICON OF THE MONTH</span>
              <span class="grail-title">Air Jordan 1 Retro High OG</span>
              <span class="grail-price">5.200.000₫</span>
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
import { ref, onMounted } from 'vue'
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
    const [bRes, cRes, pRes] = await Promise.all([
      storeService.getBrands(),
      storeService.getCategories(),
      storeService.getFeaturedProducts()
    ])
    brands.value = bRes?.data || []
    categories.value = cRes?.data || []
    featuredProducts.value = pRes?.data || []
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
  background: #fafafa;
  border-bottom: 1px solid #ebebeb;

  @media (max-width: 768px) {
    padding: 30px 0 40px;
  }

  .hero-grid {
    display: grid;
    grid-template-columns: 1.15fr 1fr;
    gap: 60px;
    align-items: center;

    @media (max-width: 992px) {
      grid-template-columns: 1fr;
      gap: 36px;
    }
  }

  .hero-eyebrow {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.14em;
    color: #737373;
    margin-bottom: 18px;

    .eyebrow-dash {
      width: 20px;
      height: 2px;
      background: #000000;
    }
  }

  .hero-headline {
    font-size: 48px;
    font-weight: 900;
    line-height: 1.08;
    letter-spacing: -0.03em;
    color: #000000;
    margin: 0 0 20px;

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
    font-size: 16px;
    line-height: 1.6;
    color: #525252;
    max-width: 520px;
    margin: 0 0 36px;

    @media (max-width: 600px) {
      font-size: 14px;
      margin-bottom: 24px;
    }
  }

  .hero-actions {
    display: flex;
    gap: 16px;
    align-items: center;
    margin-bottom: 48px;
    flex-wrap: wrap;

    @media (max-width: 600px) {
      flex-direction: column;
      width: 100%;
      gap: 12px;
      margin-bottom: 32px;

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
      padding: 16px 28px;
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-decoration: none;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);

      .arrow-svg {
        width: 16px;
        height: 16px;
        transition: transform 0.2s ease;
      }

      &:hover {
        background: #262626;
        .arrow-svg {
          transform: translateX(4px);
        }
      }
    }

    .btn-outline-action {
      display: inline-flex;
      align-items: center;
      padding: 15px 26px;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-decoration: none;
      color: #000000;
      border: 1px solid #000000;
      background: transparent;
      transition: all 0.2s ease;

      &:hover {
        background: #000000;
        color: #ffffff;
      }
    }
  }

  .hero-stats {
    display: flex;
    align-items: center;
    gap: 24px;
    padding-top: 28px;
    border-top: 1px solid #e5e5e5;

    @media (max-width: 600px) {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
      padding-top: 20px;

      .stat-divider {
        display: none !important;
      }
    }

    @media (max-width: 380px) {
      grid-template-columns: 1fr;
    }

    .stat-item {
      display: flex;
      flex-direction: column;

      .stat-number {
        font-size: 20px;
        font-weight: 900;
        letter-spacing: -0.02em;
        color: #000000;
      }

      .stat-label {
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.08em;
        color: #737373;
        margin-top: 2px;
      }
    }

    .stat-divider {
      width: 1px;
      height: 30px;
      background: #e5e5e5;
    }
  }

  .visual-frame {
    position: relative;
    background: #ffffff;
    border: 1px solid #e5e5e5;
    padding: 24px;

    @media (max-width: 600px) {
      padding: 12px;
    }

    .hero-img {
      width: 100%;
      height: 480px;
      object-fit: cover;
      display: block;
      filter: contrast(1.02);

      @media (max-width: 992px) {
        height: 380px;
      }

      @media (max-width: 600px) {
        height: 260px;
      }
    }

    .floating-grail-tag {
      position: absolute;
      bottom: 40px;
      left: 40px;
      background: rgba(0, 0, 0, 0.9);
      backdrop-filter: blur(8px);
      color: #ffffff;
      padding: 16px 22px;
      display: flex;
      flex-direction: column;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);

      @media (max-width: 600px) {
        bottom: 12px;
        left: 12px;
        right: 12px;
        padding: 12px 14px;
      }

      .grail-label {
        font-size: 9px;
        font-weight: 800;
        letter-spacing: 0.12em;
        color: #a3a3a3;
      }

      .grail-title {
        font-size: 15px;
        font-weight: 800;
        letter-spacing: -0.01em;
        margin: 4px 0;
      }

      .grail-price {
        font-size: 16px;
        font-weight: 900;
        color: #ffffff;
        font-variant-numeric: tabular-nums;
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
