<template>
  <div class="store-catalog">
    <!-- Breadcrumb & Title -->
    <div class="catalog-header">
      <div class="container">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/' }">Trang chủ</el-breadcrumb-item>
          <el-breadcrumb-item>Bộ sưu tập Giày Sneaker</el-breadcrumb-item>
        </el-breadcrumb>
        <h1 class="catalog-title">TẤT CẢ SNEAKER CHÍNH HÃNG</h1>
        <p class="catalog-sub">Tìm kiếm đôi giày chân ái của bạn với đầy đủ các phối màu và kích thước hot nhất</p>
      </div>
    </div>

    <div class="container catalog-body">
      <!-- Filter Sidebar -->
      <aside class="catalog-sidebar">
        <!-- Search filter -->
        <div class="filter-group">
          <h4 class="filter-title">TÌM KIẾM SẢN PHẨM</h4>
          <el-input
            v-model="filters.keyword"
            placeholder="Tên giày, mã SKU..."
            clearable
            @input="handleFilterChange"
          />
        </div>

        <!-- Brand filter -->
        <div class="filter-group">
          <h4 class="filter-title">THƯƠNG HIỆU</h4>
          <el-radio-group v-model="filters.brandId" @change="handleFilterChange" class="filter-radio-group">
            <el-radio :value="null" :label="null">Tất cả thương hiệu</el-radio>
            <el-radio v-for="b in brands" :key="b.id" :value="b.id" :label="b.id">
              {{ b.brandName }}
            </el-radio>
          </el-radio-group>
        </div>

        <!-- Category filter -->
        <div class="filter-group">
          <h4 class="filter-title">DÒNG SẢN PHẨM</h4>
          <el-radio-group v-model="filters.categoryId" @change="handleFilterChange" class="filter-radio-group">
            <el-radio :value="null" :label="null">Tất cả dòng sản phẩm</el-radio>
            <el-radio v-for="c in categories" :key="c.id" :value="c.id" :label="c.id">
              {{ c.categoryName }}
            </el-radio>
          </el-radio-group>
        </div>

        <!-- Reset button -->
        <button class="btn-reset-filter" @click="resetFilters">
          XÓA TẤT CẢ BỘ LỌC
        </button>
      </aside>

      <!-- Main Products View -->
      <section class="catalog-content">
        <!-- Bar: Results count & Sort -->
        <div class="toolbar">
          <span class="results-count">Hiển thị <strong>{{ totalElements }}</strong> mẫu giày</span>
        </div>

        <!-- Products Grid -->
        <div v-loading="loading" class="products-grid">
          <div
            v-for="product in products"
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

        <div v-if="!loading && products.length === 0" class="empty-state">
          <span class="empty-icon">👟</span>
          <h3>Không tìm thấy sản phẩm phù hợp</h3>
          <p>Thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc để xem tất cả sản phẩm.</p>
          <button class="btn-primary" @click="resetFilters">Xóa bộ lọc</button>
        </div>

        <!-- Pagination -->
        <div class="pagination-wrap" v-if="totalPages > 1">
          <el-pagination
            background
            layout="prev, pager, next"
            :current-page="filters.page + 1"
            :page-size="filters.size"
            :total="totalElements"
            @current-change="handlePageChange"
          />
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import storeService from '@/services/storeService'
import { formatCurrency } from '@/utils/formatters'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const brands = ref([])
const categories = ref([])
const products = ref([])
const totalElements = ref(0)
const totalPages = ref(0)

const filters = reactive({
  keyword: route.query.q || '',
  brandId: route.query.brand ? Number(route.query.brand) : null,
  categoryId: route.query.category ? Number(route.query.category) : null,
  page: 0,
  size: 12
})

const loadMeta = async () => {
  try {
    const [bRes, cRes] = await Promise.all([
      storeService.getBrands(),
      storeService.getCategories()
    ])
    brands.value = bRes?.data || []
    categories.value = cRes?.data || []
  } catch (err) {
    console.error('Lỗi nạp metadata:', err)
  }
}

const loadProducts = async () => {
  loading.value = true
  try {
    const params = {
      keyword: filters.keyword || null,
      brandId: filters.brandId || null,
      categoryId: filters.categoryId || null,
      page: filters.page,
      size: filters.size
    }
    const res = await storeService.getProducts(params)
    const pageData = res?.data || {}
    products.value = pageData.content || []
    totalElements.value = pageData.totalElements || 0
    totalPages.value = pageData.totalPages || 0
  } catch (err) {
    console.error('Lỗi nạp danh sách sản phẩm:', err)
  } finally {
    loading.value = false
  }
}

const handleFilterChange = () => {
  filters.page = 0
  loadProducts()
}

const handlePageChange = (val) => {
  filters.page = val - 1
  loadProducts()
  window.scrollTo({ top: 120, behavior: 'smooth' })
}

const resetFilters = () => {
  filters.keyword = ''
  filters.brandId = null
  filters.categoryId = null
  filters.page = 0
  loadProducts()
}

const viewProduct = (id) => {
  router.push(`/product/${id}`)
}

watch(() => route.query, (newQ) => {
  if (newQ.brand) filters.brandId = Number(newQ.brand)
  if (newQ.category) filters.categoryId = Number(newQ.category)
  if (newQ.q) filters.keyword = newQ.q
  loadProducts()
})

onMounted(() => {
  loadMeta()
  loadProducts()
})
</script>

<style scoped lang="scss">
.store-catalog {
  padding-bottom: 60px;
}

.container {
  max-width: 1240px;
  margin: 0 auto;
  padding: 0 20px;
}

.catalog-header {
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  padding: 28px 0;
  margin-bottom: 30px;

  .catalog-title {
    font-size: 30px;
    font-weight: 900;
    color: #0f172a;
    letter-spacing: -0.5px;
    margin: 12px 0 6px;
  }

  .catalog-sub {
    font-size: 14px;
    color: #64748b;
    margin: 0;
  }
}

.catalog-body {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 36px;
}

/* Sidebar */
.catalog-sidebar {
  .filter-group {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 20px;

    .filter-title {
      font-size: 13px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: 0.5px;
      margin-bottom: 14px;
      text-transform: uppercase;
    }

    .filter-radio-group {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
  }

  .btn-reset-filter {
    width: 100%;
    padding: 12px;
    background: #f1f5f9;
    border: 1px solid #cbd5e1;
    color: #475569;
    font-weight: 700;
    font-size: 13px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: #e2e8f0;
      color: #0f172a;
    }
  }
}

/* Content */
.catalog-content {
  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding-bottom: 12px;
    border-bottom: 1px solid #e2e8f0;

    .results-count {
      font-size: 14px;
      color: #64748b;

      strong {
        color: #0f172a;
      }
    }
  }

  .products-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
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

  .empty-state {
    text-align: center;
    padding: 60px 20px;
    background: #ffffff;
    border-radius: 12px;
    border: 1px solid #e2e8f0;

    .empty-icon {
      font-size: 48px;
      display: block;
      margin-bottom: 12px;
    }

    h3 {
      font-size: 18px;
      color: #0f172a;
      margin-bottom: 8px;
    }

    p {
      color: #64748b;
      font-size: 14px;
      margin-bottom: 20px;
    }

    .btn-primary {
      background: #f97316;
      color: #ffffff;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      font-weight: 700;
      cursor: pointer;
    }
  }

  .pagination-wrap {
    display: flex;
    justify-content: center;
    margin-top: 40px;
  }
}

@media (max-width: 900px) {
  .catalog-body {
    grid-template-columns: 1fr;
  }
  .catalog-content .products-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
