<template>
  <div class="store-home">
    <!-- Hero Banner Section -->
    <section class="hero-section">
      <div class="container hero-container">
        <div class="hero-text">
          <span class="hero-tag">🔥 DROP MỚI NHẤT 2026</span>
          <h1 class="hero-title">ĐẲNG CẤP SNEAKER<br /><span class="gradient-text">CHUẨN STREETWEAR</span></h1>
          <p class="hero-desc">
            Khám phá bộ sưu tập giày Sneaker chính hãng đỉnh cao từ Nike, Jordan, Adidas, Puma, New Balance. Tự tin khẳng định phong cách với chất lượng nguyên bản 100%.
          </p>
          <div class="hero-actions">
            <router-link to="/shop" class="btn-primary">
              KHÁM PHÁ BỘ SƯU TẬP <el-icon><ArrowRight /></el-icon>
            </router-link>
            <router-link to="/tracking" class="btn-secondary">
              TRA CỨU ĐƠN HÀNG
            </router-link>
          </div>
          <div class="hero-stats">
            <div class="stat-item">
              <span class="stat-num">500+</span>
              <span class="stat-label">Mẫu Sneaker HOT</span>
            </div>
            <div class="stat-item">
              <span class="stat-num">100%</span>
              <span class="stat-label">Chính Hãng Authentic</span>
            </div>
            <div class="stat-item">
              <span class="stat-num">15.000+</span>
              <span class="stat-label">Khách hàng tin tưởng</span>
            </div>
          </div>
        </div>
        <div class="hero-visual">
          <div class="sneaker-card-glow"></div>
          <img
            src="https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80"
            alt="Sneaker Hero"
            class="hero-img"
          />
        </div>
      </div>
    </section>

    <!-- Brands Carousel / Logos -->
    <section class="brands-section">
      <div class="container">
        <div class="section-header center">
          <span class="sub-title">ĐỐI TÁC THƯƠNG HIỆU</span>
          <h2 class="title">THƯƠNG HIỆU HÀNG ĐẦU</h2>
        </div>
        <div class="brands-grid">
          <div
            v-for="brand in brands"
            :key="brand.id"
            class="brand-card"
            @click="filterByBrand(brand.id)"
          >
            <span class="brand-code">{{ brand.brandCode }}</span>
            <span class="brand-name">{{ brand.brandName }}</span>
            <span class="brand-origin">{{ brand.country || 'Authentic' }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Categories Section -->
    <section class="categories-section">
      <div class="container">
        <div class="section-header">
          <div>
            <span class="sub-title">PHÂN LOẠI</span>
            <h2 class="title">DÒNG SẢN PHẨM PHỔ BIẾN</h2>
          </div>
          <router-link to="/shop" class="view-all">Xem tất cả <el-icon><ArrowRight /></el-icon></router-link>
        </div>
        <div class="categories-grid">
          <div
            v-for="cat in categories"
            :key="cat.id"
            class="category-chip"
            @click="filterByCategory(cat.id)"
          >
            <span class="cat-icon">👟</span>
            <span class="cat-name">{{ cat.categoryName }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Products Section -->
    <section class="featured-section">
      <div class="container">
        <div class="section-header">
          <div>
            <span class="sub-title">ĐẶC QUYỀN SNEAKERHEAD</span>
            <h2 class="title">SẢN PHẨM NỔI BẬT & MỚI VỀ</h2>
          </div>
          <router-link to="/shop" class="view-all">Xem toàn bộ kho giày <el-icon><ArrowRight /></el-icon></router-link>
        </div>

        <div v-loading="loading" class="products-grid">
          <div
            v-for="product in featuredProducts"
            :key="product.id"
            class="product-card"
          >
            <div class="card-media" @click="viewProduct(product.id)">
              <img
                :src="product.thumbnailUrl || (product.imageUrls && product.imageUrls[0]) || 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=600&q=80'"
                :alt="product.productName"
                class="product-thumb"
              />
              <span class="brand-badge">{{ product.brandName }}</span>
              <span class="category-badge">{{ product.categoryName }}</span>
            </div>
            <div class="card-info">
              <span class="product-code">{{ product.productCode }}</span>
              <h3 class="product-name" @click="viewProduct(product.id)">{{ product.productName }}</h3>
              
              <!-- Available sizes quick list -->
              <div class="variant-chips" v-if="product.variants && product.variants.length">
                <span class="chip-label">Size:</span>
                <span
                  v-for="v in product.variants.slice(0, 5)"
                  :key="v.id"
                  class="size-pill"
                >
                  {{ v.size ? v.size.sizeValue : v.sizeValue }}
                </span>
                <span v-if="product.variants.length > 5" class="size-more">+{{ product.variants.length - 5 }}</span>
              </div>

              <div class="card-footer">
                <div class="price-wrap">
                  <span class="price-val">{{ formatCurrency(product.salePrice) }}</span>
                </div>
                <button class="btn-buy-now" @click="viewProduct(product.id)">
                  CHỌN SIZE
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Why Choose Us -->
    <section class="trust-section">
      <div class="container trust-grid">
        <div class="trust-card">
          <div class="trust-icon">🚀</div>
          <h4 class="trust-title">Giao Hàng Hỏa Tốc</h4>
          <p class="trust-desc">Đóng gói chuẩn Double-Box chống móp hộp. Giao hàng toàn quốc 2-4 ngày.</p>
        </div>
        <div class="trust-card">
          <div class="trust-icon">🛡️</div>
          <h4 class="trust-title">Cam Kết Chính Hãng 100%</h4>
          <p class="trust-desc">Hoàn tiền 200% nếu phát hiện hàng giả, hàng nhái kém chất lượng.</p>
        </div>
        <div class="trust-card">
          <div class="trust-icon">🔄</div>
          <h4 class="trust-title">Đổi Size Trong 7 Ngày</h4>
          <p class="trust-desc">Hỗ trợ đổi size linh hoạt, nhanh chóng nếu khách hàng mang không vừa vặn.</p>
        </div>
        <div class="trust-card">
          <div class="trust-icon">📲</div>
          <h4 class="trust-title">Thanh Toán VietQR & COD</h4>
          <p class="trust-desc">Nhận hàng kiểm tra thanh toán COD hoặc quét mã VietQR tự động tiện lợi.</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowRight } from '@element-plus/icons-vue'
import storeService from '@/services/storeService'
import { formatCurrency } from '@/utils/formatters'

const router = useRouter()

const loading = ref(false)
const brands = ref([])
const categories = ref([])
const featuredProducts = ref([])

const loadData = async () => {
  loading.value = true
  try {
    const [bRes, cRes, pRes] = await Promise.all([
      storeService.getBrands(),
      storeService.getCategories(),
      storeService.getFeaturedProducts()
    ])
    brands.value = (bRes.data && bRes.data.data) || []
    categories.value = (cRes.data && cRes.data.data) || []
    featuredProducts.value = (pRes.data && pRes.data.data) || []
  } catch (err) {
    console.error('Lỗi nạp dữ liệu trang chủ:', err)
  } finally {
    loading.value = false
  }
}

const filterByBrand = (brandId) => {
  router.push({ path: '/shop', query: { brand: brandId } })
}

const filterByCategory = (catId) => {
  router.push({ path: '/shop', query: { category: catId } })
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
  padding-bottom: 40px;
}

.container {
  max-width: 1240px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Hero Section */
.hero-section {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  color: #ffffff;
  padding: 70px 0 90px;
  overflow: hidden;
  position: relative;

  .hero-container {
    display: grid;
    grid-template-columns: 1.2fr 1fr;
    gap: 50px;
    align-items: center;
  }

  .hero-tag {
    display: inline-block;
    background: rgba(249, 115, 22, 0.2);
    color: #f97316;
    border: 1px solid rgba(249, 115, 22, 0.4);
    font-size: 13px;
    font-weight: 700;
    padding: 6px 14px;
    border-radius: 30px;
    margin-bottom: 20px;
    letter-spacing: 0.5px;
  }

  .hero-title {
    font-size: 46px;
    font-weight: 900;
    line-height: 1.15;
    letter-spacing: -1px;
    margin-bottom: 20px;

    .gradient-text {
      background: linear-gradient(90deg, #f97316, #fb923c);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
  }

  .hero-desc {
    font-size: 16px;
    color: #94a3b8;
    line-height: 1.6;
    margin-bottom: 32px;
    max-width: 520px;
  }

  .hero-actions {
    display: flex;
    gap: 16px;
    margin-bottom: 40px;
  }

  .btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: #f97316;
    color: #ffffff;
    font-weight: 700;
    font-size: 15px;
    padding: 14px 28px;
    border-radius: 8px;
    text-decoration: none;
    transition: all 0.2s ease;
    box-shadow: 0 4px 15px rgba(249, 115, 22, 0.4);

    &:hover {
      background: #ea580c;
      transform: translateY(-2px);
    }
  }

  .btn-secondary {
    display: inline-flex;
    align-items: center;
    background: rgba(255, 255, 255, 0.08);
    color: #ffffff;
    font-weight: 600;
    font-size: 15px;
    padding: 14px 24px;
    border-radius: 8px;
    text-decoration: none;
    border: 1px solid rgba(255, 255, 255, 0.2);
    transition: all 0.2s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.15);
    }
  }

  .hero-stats {
    display: flex;
    gap: 36px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    padding-top: 24px;

    .stat-item {
      display: flex;
      flex-direction: column;

      .stat-num {
        font-size: 24px;
        font-weight: 800;
        color: #ffffff;
      }

      .stat-label {
        font-size: 13px;
        color: #94a3b8;
      }
    }
  }

  .hero-visual {
    position: relative;
    display: flex;
    justify-content: center;

    .sneaker-card-glow {
      position: absolute;
      width: 320px;
      height: 320px;
      background: radial-gradient(circle, rgba(249, 115, 22, 0.35) 0%, rgba(249, 115, 22, 0) 70%);
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 0;
    }

    .hero-img {
      position: relative;
      z-index: 1;
      width: 100%;
      max-width: 480px;
      height: 380px;
      object-fit: cover;
      border-radius: 20px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
      transform: rotate(-3deg);
      transition: transform 0.4s ease;

      &:hover {
        transform: rotate(0deg) scale(1.02);
      }
    }
  }
}

/* Section Header */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 30px;

  &.center {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .sub-title {
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 1.5px;
    color: #f97316;
    text-transform: uppercase;
    display: block;
    margin-bottom: 6px;
  }

  .title {
    font-size: 28px;
    font-weight: 800;
    color: #0f172a;
    letter-spacing: -0.5px;
    margin: 0;
  }

  .view-all {
    display: flex;
    align-items: center;
    gap: 4px;
    color: #f97316;
    font-size: 14px;
    font-weight: 700;
    text-decoration: none;
    transition: gap 0.2s;

    &:hover {
      gap: 8px;
    }
  }
}

/* Brands */
.brands-section {
  padding: 50px 0 30px;

  .brands-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 16px;
  }

  .brand-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    padding: 20px 16px;
    border-radius: 12px;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    flex-direction: column;
    align-items: center;

    &:hover {
      border-color: #f97316;
      box-shadow: 0 8px 20px rgba(249, 115, 22, 0.1);
      transform: translateY(-3px);
    }

    .brand-code {
      font-size: 11px;
      font-weight: 700;
      color: #94a3b8;
      letter-spacing: 1px;
    }

    .brand-name {
      font-size: 17px;
      font-weight: 800;
      color: #0f172a;
      margin: 4px 0;
    }

    .brand-origin {
      font-size: 12px;
      color: #64748b;
    }
  }
}

/* Categories */
.categories-section {
  padding: 30px 0;

  .categories-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }

  .category-chip {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    padding: 12px 24px;
    border-radius: 30px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    font-size: 14px;
    color: #334155;
    transition: all 0.2s ease;

    &:hover {
      background: #0f172a;
      color: #ffffff;
      border-color: #0f172a;
      transform: translateY(-2px);
    }

    .cat-icon {
      font-size: 16px;
    }
  }
}

/* Featured Products */
.featured-section {
  padding: 40px 0 60px;

  .products-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;
  }

  .product-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 14px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    transition: all 0.25s ease;

    &:hover {
      box-shadow: 0 12px 28px rgba(0, 0, 0, 0.08);
      transform: translateY(-4px);

      .card-media img {
        transform: scale(1.05);
      }
    }

    .card-media {
      height: 220px;
      background: #f1f5f9;
      position: relative;
      overflow: hidden;
      cursor: pointer;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s ease;
      }

      .brand-badge {
        position: absolute;
        top: 12px;
        left: 12px;
        background: rgba(15, 23, 42, 0.85);
        color: #ffffff;
        font-size: 11px;
        font-weight: 700;
        padding: 4px 8px;
        border-radius: 6px;
        backdrop-filter: blur(4px);
      }

      .category-badge {
        position: absolute;
        top: 12px;
        right: 12px;
        background: rgba(249, 115, 22, 0.9);
        color: #ffffff;
        font-size: 11px;
        font-weight: 600;
        padding: 4px 8px;
        border-radius: 6px;
      }
    }

    .card-info {
      padding: 18px;
      display: flex;
      flex-direction: column;
      flex: 1;

      .product-code {
        font-size: 11px;
        color: #94a3b8;
        font-weight: 600;
        text-transform: uppercase;
      }

      .product-name {
        font-size: 15px;
        font-weight: 700;
        color: #0f172a;
        margin: 4px 0 10px;
        cursor: pointer;
        line-height: 1.35;
        height: 40px;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;

        &:hover {
          color: #f97316;
        }
      }

      .variant-chips {
        display: flex;
        align-items: center;
        gap: 4px;
        margin-bottom: 14px;

        .chip-label {
          font-size: 11px;
          color: #64748b;
        }

        .size-pill {
          background: #f1f5f9;
          font-size: 11px;
          font-weight: 600;
          padding: 2px 6px;
          border-radius: 4px;
          color: #334155;
        }

        .size-more {
          font-size: 10px;
          color: #94a3b8;
        }
      }

      .card-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: auto;
        padding-top: 12px;
        border-top: 1px solid #f1f5f9;

        .price-val {
          font-size: 17px;
          font-weight: 800;
          color: #0f172a;
        }

        .btn-buy-now {
          background: #0f172a;
          color: #ffffff;
          border: none;
          padding: 8px 14px;
          font-size: 12px;
          font-weight: 700;
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.2s;

          &:hover {
            background: #f97316;
          }
        }
      }
    }
  }
}

/* Trust Section */
.trust-section {
  padding: 40px 0;
  border-top: 1px solid #e2e8f0;

  .trust-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;
  }

  .trust-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    padding: 24px;
    border-radius: 12px;
    text-align: center;

    .trust-icon {
      font-size: 32px;
      margin-bottom: 12px;
    }

    .trust-title {
      font-size: 16px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 8px;
    }

    .trust-desc {
      font-size: 13px;
      color: #64748b;
      line-height: 1.5;
      margin: 0;
    }
  }
}

@media (max-width: 1024px) {
  .featured-section .products-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  .trust-section .trust-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .hero-section .hero-container {
    grid-template-columns: 1fr;
    text-align: center;
  }
  .hero-section .hero-actions {
    justify-content: center;
  }
  .hero-section .hero-stats {
    justify-content: center;
  }
  .featured-section .products-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
