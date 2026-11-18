<template>
  <div class="store-catalog">
    <!-- Header Hero Banner -->
    <section class="catalog-hero">
      <div class="layout-container">
        <div class="breadcrumb-trail">
          <router-link to="/">TRANG CHỦ</router-link>
          <span class="sep">/</span>
          <span class="current">BỘ SƯU TẬP SNEAKER</span>
        </div>
        <div class="catalog-title-row">
          <div>
            <h1 class="catalog-headline">ARCHIVE SNEAKERS</h1>
            <p class="catalog-subhead">Tuyển chọn các thiết kế biểu tượng, phiên bản retro và các phối màu kinh điển</p>
          </div>
          <div class="total-badge">
            <span class="count-num">{{ totalElements }}</span>
            <span class="count-text">RELEASES</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Main Catalog Content -->
    <div class="layout-container catalog-body">
      <!-- Left Sidebar Filters -->
      <aside class="catalog-sidebar">
        <!-- Search Filter -->
        <div class="filter-section">
          <label class="filter-heading">TÌM KIẾM THEO TÊN / SKU</label>
          <div class="search-field">
            <input
              type="text"
              v-model="filters.keyword"
              placeholder="VD: Air Force 1, SP001..."
              @input="handleFilterChange"
              class="filter-input"
            />
            <button v-if="filters.keyword" class="btn-clear" @click="clearKeyword">✕</button>
          </div>
        </div>

        <!-- Brand Filter -->
        <div class="filter-section">
          <div class="heading-with-action">
            <label class="filter-heading">THƯƠNG HIỆU</label>
            <span v-if="filters.brandId" class="clear-link" @click="selectBrand(null)">Bỏ chọn</span>
          </div>
          <div class="brand-options-list">
            <button
              class="brand-option-item"
              :class="{ active: filters.brandId === null }"
              @click="selectBrand(null)"
            >
              <span class="opt-name">Tất cả thương hiệu</span>
              <span class="opt-indicator"></span>
            </button>
            <button
              v-for="b in brands"
              :key="b.id"
              class="brand-option-item"
              :class="{ active: filters.brandId === b.id }"
              @click="selectBrand(b.id)"
            >
              <span class="opt-name">{{ b.brandName }}</span>
              <span class="opt-indicator"></span>
            </button>
          </div>
        </div>

        <!-- Category Filter -->
        <div class="filter-section">
          <div class="heading-with-action">
            <label class="filter-heading">DÒNG SẢN PHẨM</label>
            <span v-if="filters.categoryId" class="clear-link" @click="selectCategory(null)">Bỏ chọn</span>
          </div>
          <div class="category-pills">
            <button
              class="cat-pill"
              :class="{ active: filters.categoryId === null }"
              @click="selectCategory(null)"
            >
              Tất cả
            </button>
            <button
              v-for="c in categories"
              :key="c.id"
              class="cat-pill"
              :class="{ active: filters.categoryId === c.id }"
              @click="selectCategory(c.id)"
            >
              {{ c.categoryName }}
            </button>
          </div>
        </div>

        <!-- Reset Button -->
        <div class="filter-actions">
          <button class="btn-reset-all" @click="resetFilters">
            <span>ĐẶT LẠI TẤT CẢ BỘ LỌC</span>
            <span class="reset-icon">↺</span>
          </button>
        </div>
      </aside>

      <!-- Products Grid Section -->
      <main class="catalog-grid-area">
        <!-- Grid Toolbar -->
        <div class="grid-toolbar">
          <div class="active-filters-chips" v-if="filters.brandId || filters.categoryId || filters.keyword">
            <span class="chips-label">Đang lọc:</span>
            <span v-if="filters.keyword" class="active-chip" @click="clearKeyword">
              "{{ filters.keyword }}" <span class="chip-remove">×</span>
            </span>
            <span v-if="filters.brandId" class="active-chip" @click="selectBrand(null)">
              {{ getBrandName(filters.brandId) }} <span class="chip-remove">×</span>
            </span>
            <span v-if="filters.categoryId" class="active-chip" @click="selectCategory(null)">
              {{ getCategoryName(filters.categoryId) }} <span class="chip-remove">×</span>
            </span>
          </div>
          <div v-else class="toolbar-hint">
            <span>Hiển thị tất cả mẫu giày có sẵn trong kho</span>
          </div>

          <div class="sort-selector">
            <span class="sort-label">Sắp xếp:</span>
            <select v-model="sortBy" @change="handleSortChange" class="sort-select">
              <option value="newest">Mới nhất</option>
              <option value="price_asc">Giá: Thấp đến Cao</option>
              <option value="price_desc">Giá: Cao đến Thấp</option>
            </select>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="products-grid-skeleton">
          <div class="card-skeleton" v-for="i in 6" :key="i"></div>
        </div>

        <!-- Empty State -->
        <div v-else-if="products.length === 0" class="empty-results-box">
          <div class="empty-icon-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="empty-svg">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              <line x1="8" y1="11" x2="14" y2="11"></line>
            </svg>
          </div>
          <h3 class="empty-title">Không tìm thấy sản phẩm phù hợp</h3>
          <p class="empty-desc">Thử tìm kiếm với từ khóa khác hoặc bỏ các bộ lọc thương hiệu/dòng sản phẩm.</p>
          <button class="btn-clear-filters" @click="resetFilters">Xóa toàn bộ bộ lọc</button>
        </div>

        <!-- Products Grid -->
        <div v-else class="products-grid">
          <div
            v-for="product in sortedProducts"
            :key="product.id"
            class="catalog-card"
            @click="viewProduct(product.id)"
          >
            <div class="card-image-box">
              <img
                :src="product.thumbnailUrl || (product.imageUrls && product.imageUrls[0]) || 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=600&q=80'"
                :alt="product.productName"
                class="sneaker-img"
                loading="lazy"
              />
              <div class="card-top-tags">
                <span class="brand-tag">{{ product.brandName }}</span>
                <span class="category-tag">{{ product.categoryName }}</span>
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
              <div class="quick-action-bar">
                <span>CHỌN SIZE & MUA</span>
                <span class="action-arrow">→</span>
              </div>
            </div>

            <div class="card-details">
              <span class="product-sku">{{ product.productCode }}</span>
              <h3 class="product-name">{{ product.productName }}</h3>
              
              <div class="card-bottom-row">
                <div class="price-block">
                  <span class="price-num">{{ formatCurrency(product.salePrice) }}</span>
                </div>
                <span class="legit-badge">AUTHENTIC</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Clean Pagination -->
        <div class="pagination-footer" v-if="totalPages > 1">
          <button
            class="pag-nav-btn"
            :disabled="filters.page === 0"
            @click="handlePageChange(filters.page)"
          >
            ← Trang trước
          </button>
          <div class="pag-numbers">
            <button
              v-for="p in totalPages"
              :key="p"
              class="pag-num-btn"
              :class="{ active: filters.page === p - 1 }"
              @click="handlePageChange(p)"
            >
              {{ p }}
            </button>
          </div>
          <button
            class="pag-nav-btn"
            :disabled="filters.page >= totalPages - 1"
            @click="handlePageChange(filters.page + 2)"
          >
            Trang sau →
          </button>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import storeService from '@/services/storeService'
import { formatCurrency } from '@/utils/formatters'
import { useWishlistStore } from '@/stores/wishlist'

const router = useRouter()
const route = useRoute()
const wishlistStore = useWishlistStore()

const loading = ref(false)
const brands = ref([])
const categories = ref([])
const products = ref([])
const totalElements = ref(0)
const totalPages = ref(0)
const sortBy = ref('newest')

const toggleWishlist = (product) => {
  const isAdded = wishlistStore.toggleFavorite(product)
  if (isAdded) {
    ElMessage.success(`Đã thêm "${product.productName}" vào danh sách yêu thích`)
  } else {
    ElMessage.info(`Đã bỏ "${product.productName}" khỏi danh sách yêu thích`)
  }
}

const filters = reactive({
  keyword: route.query.q || '',
  brandId: route.query.brand ? Number(route.query.brand) : null,
  categoryId: route.query.category ? Number(route.query.category) : null,
  page: 0,
  size: 16
})

const sortedProducts = computed(() => {
  const list = [...products.value]
  if (sortBy.value === 'price_asc') {
    list.sort((a, b) => (a.salePrice || 0) - (b.salePrice || 0))
  } else if (sortBy.value === 'price_desc') {
    list.sort((a, b) => (b.salePrice || 0) - (a.salePrice || 0))
  }
  return list
})

const getBrandName = (id) => {
  const b = brands.value.find(item => item.id === id)
  return b ? b.brandName : 'Thương hiệu'
}

const getCategoryName = (id) => {
  const c = categories.value.find(item => item.id === id)
  return c ? c.categoryName : 'Dòng sản phẩm'
}

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

const selectBrand = (brandId) => {
  filters.brandId = brandId
  filters.page = 0
  loadProducts()
}

const selectCategory = (catId) => {
  filters.categoryId = catId
  filters.page = 0
  loadProducts()
}

const clearKeyword = () => {
  filters.keyword = ''
  filters.page = 0
  loadProducts()
}

const handleFilterChange = () => {
  filters.page = 0
  loadProducts()
}

const handleSortChange = () => {
  // Handled by computed sortedProducts
}

const handlePageChange = (p) => {
  filters.page = p - 1
  loadProducts()
  window.scrollTo({ top: 180, behavior: 'smooth' })
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
  if (newQ.brand !== undefined) filters.brandId = newQ.brand ? Number(newQ.brand) : null
  if (newQ.category !== undefined) filters.categoryId = newQ.category ? Number(newQ.category) : null
  if (newQ.q !== undefined) filters.keyword = newQ.q || ''
  loadProducts()
})

onMounted(() => {
  loadMeta()
  loadProducts()
})
</script>

<style scoped lang="scss">
.store-catalog {
  padding-bottom: 90px;
  background: #ffffff;
}

.layout-container {
  max-width: 1360px;
  margin: 0 auto;
  padding: 0 28px;
}

/* Catalog Hero Banner */
.catalog-hero {
  background: #fafafa;
  border-bottom: 1px solid #ebebeb;
  padding: 40px 0 36px;

  .breadcrumb-trail {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    color: #737373;
    margin-bottom: 16px;

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

  .catalog-title-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    gap: 20px;
  }

  .catalog-headline {
    font-size: 38px;
    font-weight: 900;
    letter-spacing: -0.03em;
    color: #000000;
    margin: 0 0 8px;
    line-height: 1.1;

    @media (max-width: 600px) {
      font-size: 28px;
    }
  }

  .catalog-subhead {
    font-size: 14px;
    color: #525252;
    margin: 0;
  }

  .total-badge {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    padding: 10px 18px;
    background: #ffffff;
    border: 1px solid #e5e5e5;

    .count-num {
      font-size: 24px;
      font-weight: 900;
      letter-spacing: -0.02em;
      color: #000000;
      line-height: 1;
    }

    .count-text {
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.12em;
      color: #737373;
      margin-top: 4px;
    }
  }
}

/* Layout Grid */
.catalog-body {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 48px;
  padding-top: 40px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 30px;
  }
}

/* Sidebar Filters */
.catalog-sidebar {
  display: flex;
  flex-direction: column;
  gap: 32px;

  .filter-section {
    border-bottom: 1px solid #f0f0f0;
    padding-bottom: 24px;

    &:last-child {
      border-bottom: none;
    }
  }

  .filter-heading {
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.12em;
    color: #000000;
    text-transform: uppercase;
    display: block;
    margin-bottom: 14px;
  }

  .heading-with-action {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 14px;

    .filter-heading {
      margin-bottom: 0;
    }

    .clear-link {
      font-size: 11px;
      font-weight: 700;
      color: #737373;
      cursor: pointer;
      text-decoration: underline;
      &:hover {
        color: #000000;
      }
    }
  }

  .search-field {
    position: relative;
    display: flex;
    align-items: center;

    .filter-input {
      width: 100%;
      height: 42px;
      padding: 0 32px 0 12px;
      border: 1px solid #e5e5e5;
      background: #fafafa;
      font-family: inherit;
      font-size: 13px;
      color: #0a0a0a;
      outline: none;
      transition: all 0.2s ease;

      &:focus {
        border-color: #000000;
        background: #ffffff;
      }
    }

    .btn-clear {
      position: absolute;
      right: 10px;
      background: none;
      border: none;
      color: #737373;
      font-size: 13px;
      cursor: pointer;
      &:hover {
        color: #000000;
      }
    }
  }

  .brand-options-list {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .brand-option-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 10px;
      background: none;
      border: 1px solid transparent;
      font-family: inherit;
      font-size: 13px;
      font-weight: 600;
      color: #525252;
      text-align: left;
      cursor: pointer;
      transition: all 0.15s ease;

      .opt-indicator {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: transparent;
      }

      &:hover {
        color: #000000;
        background: #f5f5f5;
      }

      &.active {
        color: #000000;
        font-weight: 800;
        background: #f5f5f5;
        border-color: #e5e5e5;

        .opt-indicator {
          background: #000000;
        }
      }
    }
  }

  .category-pills {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;

    .cat-pill {
      padding: 6px 12px;
      background: #f5f5f5;
      border: 1px solid transparent;
      font-family: inherit;
      font-size: 12px;
      font-weight: 600;
      color: #525252;
      cursor: pointer;
      transition: all 0.15s ease;

      &:hover {
        background: #ebebeb;
        color: #000000;
      }

      &.active {
        background: #000000;
        color: #ffffff;
        font-weight: 700;
      }
    }
  }

  .btn-reset-all {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 14px;
    background: transparent;
    border: 1px dashed #d4d4d4;
    font-family: inherit;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.08em;
    color: #525252;
    cursor: pointer;
    transition: all 0.15s ease;

    &:hover {
      border-color: #000000;
      color: #000000;
      background: #fafafa;
    }
  }
}

/* Products Grid Area */
.catalog-grid-area {
  .grid-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 20px;
    border-bottom: 1px solid #f0f0f0;
    margin-bottom: 28px;
    flex-wrap: wrap;
    gap: 16px;

    .active-filters-chips {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;

      .chips-label {
        font-size: 12px;
        font-weight: 700;
        color: #737373;
      }

      .active-chip {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: #000000;
        color: #ffffff;
        padding: 4px 10px;
        font-size: 11px;
        font-weight: 700;
        cursor: pointer;
        transition: opacity 0.15s ease;

        &:hover {
          opacity: 0.8;
        }

        .chip-remove {
          font-size: 13px;
        }
      }
    }

    .toolbar-hint {
      font-size: 13px;
      color: #737373;
    }

    .sort-selector {
      display: flex;
      align-items: center;
      gap: 8px;

      .sort-label {
        font-size: 12px;
        font-weight: 700;
        color: #737373;
      }

      .sort-select {
        height: 36px;
        padding: 0 10px;
        border: 1px solid #e5e5e5;
        background: #ffffff;
        font-family: inherit;
        font-size: 12px;
        font-weight: 700;
        color: #000000;
        outline: none;
        cursor: pointer;

        &:focus {
          border-color: #000000;
        }
      }
    }
  }

  .products-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 28px;

    @media (max-width: 1150px) {
      grid-template-columns: repeat(2, 1fr);
    }

    @media (max-width: 600px) {
      grid-template-columns: 1fr;
    }
  }

  .catalog-card {
    cursor: pointer;
    background: #ffffff;
    display: flex;
    flex-direction: column;

    &:hover {
      .sneaker-img {
        transform: scale(1.05);
      }
      .quick-action-bar {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .card-image-box {
      position: relative;
      background: #f5f5f7;
      aspect-ratio: 1 / 1;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;

      .sneaker-img {
        width: 85%;
        height: 85%;
        object-fit: contain;
        transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      }

      .card-top-tags {
        position: absolute;
        top: 12px;
        left: 12px;
        display: flex;
        gap: 6px;

        .brand-tag {
          background: #000000;
          color: #ffffff;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.08em;
          padding: 3px 7px;
          text-transform: uppercase;
        }

        .category-tag {
          background: #ffffff;
          color: #000000;
          border: 1px solid #e5e5e5;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.06em;
          padding: 3px 6px;
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

      .quick-action-bar {
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

    .card-details {
      padding: 14px 4px 6px;

      .product-sku {
        font-size: 10px;
        font-weight: 700;
        color: #737373;
        font-family: monospace;
        letter-spacing: 0.06em;
      }

      .product-name {
        font-size: 15px;
        font-weight: 800;
        color: #0a0a0a;
        margin: 4px 0 10px;
        line-height: 1.3;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .card-bottom-row {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .price-num {
          font-size: 16px;
          font-weight: 900;
          letter-spacing: -0.02em;
          color: #000000;
          font-variant-numeric: tabular-nums;
        }

        .legit-badge {
          font-size: 9px;
          font-weight: 700;
          color: #10b981;
          letter-spacing: 0.06em;
        }
      }
    }
  }

  /* Empty State */
  .empty-results-box {
    text-align: center;
    padding: 80px 20px;
    background: #fafafa;
    border: 1px dashed #e5e5e5;

    .empty-icon-wrap {
      margin-bottom: 16px;
      .empty-svg {
        width: 48px;
        height: 48px;
        color: #a3a3a3;
      }
    }

    .empty-title {
      font-size: 18px;
      font-weight: 900;
      color: #000000;
      margin: 0 0 8px;
    }

    .empty-desc {
      font-size: 14px;
      color: #737373;
      margin: 0 0 24px;
    }

    .btn-clear-filters {
      background: #000000;
      color: #ffffff;
      padding: 12px 24px;
      border: none;
      font-family: inherit;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.08em;
      cursor: pointer;
      transition: background 0.15s ease;

      &:hover {
        background: #262626;
      }
    }
  }

  /* Pagination */
  .pagination-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 50px;
    padding-top: 24px;
    border-top: 1px solid #f0f0f0;

    .pag-nav-btn {
      padding: 10px 18px;
      background: #f5f5f5;
      border: 1px solid transparent;
      font-family: inherit;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.04em;
      color: #000000;
      cursor: pointer;
      transition: all 0.15s ease;

      &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }

      &:hover:not(:disabled) {
        background: #000000;
        color: #ffffff;
      }
    }

    .pag-numbers {
      display: flex;
      gap: 6px;

      .pag-num-btn {
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        border: 1px solid transparent;
        font-family: inherit;
        font-size: 13px;
        font-weight: 700;
        color: #525252;
        cursor: pointer;
        transition: all 0.15s ease;

        &:hover {
          color: #000000;
          background: #f5f5f5;
        }

        &.active {
          background: #000000;
          color: #ffffff;
          font-weight: 900;
        }
      }
    }
  }
}
</style>
