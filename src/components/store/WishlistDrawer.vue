<template>
  <el-drawer
    :model-value="modelValue"
    title="SẢN PHẨM YÊU THÍCH"
    size="420px"
    class="wishlist-drawer"
    :with-header="false"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div class="wishlist-drawer-wrap">
      <!-- HEADER -->
      <div class="drawer-header">
        <div class="header-title-box">
          <svg class="header-heart-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
          <div class="title-text">
            <h3>SẢN PHẨM YÊU THÍCH</h3>
            <span class="count-tag">{{ wishlistStore.count }} SẢN PHẨM</span>
          </div>
        </div>
        <button class="close-btn" @click="$emit('update:modelValue', false)" aria-label="Đóng">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <!-- BODY CONTENT -->
      <div v-if="wishlistStore.count > 0" class="drawer-body">
        <div class="wishlist-list">
          <div
            v-for="item in wishlistStore.items"
            :key="item.productId"
            class="wishlist-item"
          >
            <!-- THUMBNAIL -->
            <div class="item-thumb" @click="goToProduct(item.productId)">
              <img
                v-if="item.thumbnailUrl"
                :src="item.thumbnailUrl"
                :alt="item.productName"
                class="thumb-img"
              />
              <div v-else class="thumb-placeholder">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                </svg>
              </div>
            </div>

            <!-- DETAILS -->
            <div class="item-info">
              <div class="item-meta">
                <span class="brand">{{ item.brandName || 'SNEAKER' }}</span>
                <span v-if="item.productCode" class="code">{{ item.productCode }}</span>
              </div>

              <h4 class="item-name" @click="goToProduct(item.productId)">
                {{ item.productName }}
              </h4>

              <div class="item-price">
                <span class="price-val">{{ formatCurrency(item.minPrice) }}</span>
                <span v-if="item.maxPrice && item.maxPrice > item.minPrice" class="price-range">
                  - {{ formatCurrency(item.maxPrice) }}
                </span>
              </div>

              <div class="item-actions">
                <button class="action-btn view" @click="goToProduct(item.productId)">
                  XEM CHI TIẾT &rarr;
                </button>
                <button class="action-btn remove" @click="removeItem(item.productId)" title="Bỏ khỏi yêu thích">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                  XÓA
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- EMPTY STATE -->
      <div v-else class="drawer-empty">
        <div class="empty-icon-circle">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </div>
        <h3 class="empty-title">CHƯA CÓ SẢN PHẨM YÊU THÍCH</h3>
        <p class="empty-desc">
          Hãy bấm vào biểu tượng trái tim ở bất kỳ mẫu giày sneaker nào để lưu lại danh sách những mẫu bạn đang cân nhắc mua sắm!
        </p>
        <button class="btn-explore" @click="goToShop">
          KHÁM PHÁ BỘ SƯU TẬP NGAY &rarr;
        </button>
      </div>

      <!-- FOOTER -->
      <div v-if="wishlistStore.count > 0" class="drawer-footer">
        <button class="footer-btn clear" @click="clearAll">
          XÓA TOÀN BỘ YÊU THÍCH
        </button>
        <button class="footer-btn shop" @click="goToShop">
          TIẾP TỤC XEM SẢN PHẨM &rarr;
        </button>
      </div>
    </div>
  </el-drawer>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useWishlistStore } from '@/stores/wishlist'

defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const router = useRouter()
const wishlistStore = useWishlistStore()

function formatCurrency(amount) {
  if (amount == null) return '0 ₫'
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
}

function goToProduct(id) {
  emit('update:modelValue', false)
  router.push(`/product/${id}`)
}

function goToShop() {
  emit('update:modelValue', false)
  router.push('/shop')
}

function removeItem(id) {
  wishlistStore.removeFromWishlist(id)
  ElMessage.info('Đã bỏ sản phẩm khỏi danh sách yêu thích')
}

function clearAll() {
  ElMessageBox.confirm('Bạn có chắc muốn xóa toàn bộ sản phẩm yêu thích không?', 'Xác nhận', {
    confirmButtonText: 'Xóa hết',
    cancelButtonText: 'Hủy',
    type: 'warning'
  }).then(() => {
    wishlistStore.clearWishlist()
    ElMessage.success('Đã làm trống danh sách yêu thích')
  }).catch(() => {})
}
</script>

<style scoped lang="scss">
.wishlist-drawer-wrap {
  display: flex;
  flex-direction: column;
  height: 100%;
  font-family: var(--font-sans);
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 2px solid #000000;
  background: #ffffff;

  .header-title-box {
    display: flex;
    align-items: center;
    gap: 12px;

    .header-heart-icon {
      width: 24px;
      height: 24px;
      color: #ef4444;
      flex-shrink: 0;
    }

    .title-text {
      h3 {
        margin: 0;
        font-size: 15px;
        font-weight: 900;
        letter-spacing: 0.05em;
        color: #000000;
      }

      .count-tag {
        font-size: 10px;
        font-weight: 800;
        letter-spacing: 0.1em;
        color: #71717a;
      }
    }
  }

  .close-btn {
    width: 32px;
    height: 32px;
    background: transparent;
    border: 1px solid #e4e4e7;
    border-radius: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.15s ease;

    svg {
      width: 16px;
      height: 16px;
      color: #18181b;
    }

    &:hover {
      background: #000000;
      border-color: #000000;
      svg {
        color: #ffffff;
      }
    }
  }
}

.drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;

  .wishlist-list {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .wishlist-item {
    display: flex;
    gap: 14px;
    padding: 12px;
    border: 1px solid #e4e4e7;
    background: #ffffff;
    transition: border-color 0.15s ease;

    &:hover {
      border-color: #000000;
    }

    .item-thumb {
      width: 80px;
      height: 80px;
      background: #f4f4f5;
      flex-shrink: 0;
      cursor: pointer;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;

      .thumb-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.2s ease;
      }

      &:hover .thumb-img {
        transform: scale(1.06);
      }

      .thumb-placeholder {
        color: #a1a1aa;
        svg {
          width: 28px;
          height: 28px;
        }
      }
    }

    .item-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;

      .item-meta {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 10px;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: #71717a;
      }

      .item-name {
        margin: 4px 0 6px;
        font-size: 13px;
        font-weight: 800;
        color: #000000;
        line-height: 1.3;
        cursor: pointer;

        &:hover {
          color: #ef4444;
        }
      }

      .item-price {
        font-size: 13px;
        font-weight: 900;
        color: #000000;
        margin-bottom: 6px;

        .price-range {
          color: #71717a;
          font-weight: 700;
        }
      }

      .item-actions {
        display: flex;
        align-items: center;
        gap: 8px;

        .action-btn {
          height: 28px;
          border-radius: 0;
          font-family: var(--font-sans);
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          transition: all 0.15s ease;

          &.view {
            padding: 0 10px;
            background: #000000;
            color: #ffffff;
            border: 1px solid #000000;

            &:hover {
              background: #27272a;
            }
          }

          &.remove {
            padding: 0 8px;
            background: transparent;
            color: #71717a;
            border: 1px solid #e4e4e7;

            svg {
              width: 12px;
              height: 12px;
            }

            &:hover {
              color: #dc2626;
              border-color: #fca5a5;
              background: #fef2f2;
            }
          }
        }
      }
    }
  }
}

.drawer-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 24px;
  text-align: center;

  .empty-icon-circle {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: #fef2f2;
    color: #ef4444;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;

    svg {
      width: 32px;
      height: 32px;
    }
  }

  .empty-title {
    margin: 0 0 8px;
    font-size: 15px;
    font-weight: 900;
    letter-spacing: 0.05em;
    color: #000000;
  }

  .empty-desc {
    margin: 0 0 24px;
    font-size: 12px;
    line-height: 1.5;
    color: #71717a;
    max-width: 300px;
  }

  .btn-explore {
    height: 42px;
    padding: 0 20px;
    background: #000000;
    color: #ffffff;
    border: none;
    border-radius: 0;
    font-family: var(--font-sans);
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    cursor: pointer;
    transition: background 0.15s ease;

    &:hover {
      background: #27272a;
    }
  }
}

.drawer-footer {
  padding: 16px 20px;
  border-top: 1px solid #e4e4e7;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  gap: 8px;

  .footer-btn {
    width: 100%;
    height: 38px;
    border-radius: 0;
    font-family: var(--font-sans);
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.15s ease;

    &.shop {
      background: #000000;
      color: #ffffff;
      border: 1px solid #000000;

      &:hover {
        background: #27272a;
      }
    }

    &.clear {
      background: transparent;
      color: #71717a;
      border: 1px solid #e4e4e7;

      &:hover {
        color: #dc2626;
        border-color: #fca5a5;
        background: #fef2f2;
      }
    }
  }
}
</style>
