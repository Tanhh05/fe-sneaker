<template>
  <el-dialog
    :model-value="modelValue"
    title="Chi tiết Sản phẩm &amp; Danh sách Biến thể (SKU)"
    width="780px"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div v-if="product" class="product-detail-box">
      <div class="detail-top">
        <div class="detail-gallery-col">
          <img
            v-if="currentImg"
            :src="currentImg"
            alt="shoe"
            class="detail-img"
          />
          <div v-if="product.imageUrls && product.imageUrls.length > 1" class="dialog-thumbs-strip">
            <img
              v-for="(img, idx) in product.imageUrls"
              :key="idx"
              :src="img"
              class="d-thumb"
              :class="{ active: currentImg === img }"
              @click="activeImg = img"
            />
          </div>
        </div>
        <div class="detail-info">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px">
            <span class="code-badge">{{ product.productCode }}</span>
            <el-tag :type="product.status === 'ACTIVE' ? 'success' : 'info'" size="small">
              {{ product.status }}
            </el-tag>
          </div>
          <h3>{{ product.productName }}</h3>
          <p class="meta">
            Thương hiệu: <strong>{{ product.brandName }}</strong> |
            Danh mục: <strong>{{ product.categoryName }}</strong> |
            Chất liệu: <strong>{{ product.material || '---' }}</strong>
          </p>
          <p class="desc">{{ product.description }}</p>
          <div class="prices">
            <span>Giá nhập: <strong>{{ formatCurrency(product.importPrice) }}</strong></span>
            <span>Giá bán: <strong class="price-text">{{ formatCurrency(product.salePrice) }}</strong></span>
          </div>
        </div>
      </div>

      <h4 style="margin: 18px 0 10px">
        Danh sách Biến thể Size / Màu sắc / SKU ({{ (product.variants || []).length }} biến thể)
      </h4>
      <el-table :data="product.variants || []" border stripe size="small">
        <el-table-column prop="sku" label="Mã SKU" width="160">
          <template #default="{ row }">
            <span class="code-badge">{{ row.sku }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="sizeValue" label="Size EU" width="90" align="center" />
        <el-table-column label="Màu sắc" min-width="140">
          <template #default="{ row }">
            <span class="color-dot" :style="{ backgroundColor: row.hexCode }"></span>
            {{ row.colorName }}
          </template>
        </el-table-column>
        <el-table-column label="Giá nhập" width="130" align="right">
          <template #default="{ row }">{{ formatCurrency(row.importPrice) }}</template>
        </el-table-column>
        <el-table-column label="Giá bán" width="130" align="right">
          <template #default="{ row }">
            <span class="price-text">{{ formatCurrency(row.salePrice) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="availableQuantity" label="SL sẵn có" width="100" align="center" />
      </el-table>
    </div>
    <template #footer>
      <el-button @click="$emit('update:modelValue', false)">Đóng</el-button>
      <el-button type="primary" @click="$emit('manage-variants')">Quản lý Biến thể SKU</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { formatCurrency } from '@/utils/formatters'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  product: {
    type: Object,
    default: null
  }
})

defineEmits(['update:modelValue', 'manage-variants'])

const activeImg = ref('')
const currentImg = computed(() => {
  return activeImg.value || props.product?.thumbnailUrl || (props.product?.imageUrls && props.product.imageUrls[0]) || ''
})

watch(() => props.product, () => {
  activeImg.value = ''
})
</script>

<style scoped lang="scss">
.product-detail-box {
  .detail-top {
    display: flex;
    gap: 18px;
    background: #fafafa;
    padding: 16px;
    border-radius: 0;
    border: 1px solid #e5e5e5;

    .detail-gallery-col {
      display: flex;
      flex-direction: column;
      gap: 8px;
      width: 120px;
      flex-shrink: 0;

      .detail-img {
        width: 120px;
        height: 120px;
        object-fit: cover;
        border-radius: 0;
        border: 1px solid #e5e5e5;
        background: #ffffff;
      }

      .dialog-thumbs-strip {
        display: flex;
        gap: 4px;
        overflow-x: auto;
        padding-bottom: 2px;

        .d-thumb {
          width: 34px;
          height: 34px;
          object-fit: cover;
          border: 1px solid #cbd5e1;
          cursor: pointer;
          flex-shrink: 0;
          transition: all 0.15s ease;

          &:hover,
          &.active {
            border-color: #000000;
            box-shadow: 0 0 0 1px #000000;
          }
        }
      }
    }
    .detail-info {
      flex: 1;
      h3 {
        font-size: 18px;
        color: #0f172a;
        margin-bottom: 4px;
      }
      .meta {
        font-size: 13px;
        color: #475569;
        margin-bottom: 6px;
      }
      .desc {
        font-size: 13px;
        color: #64748b;
        margin-bottom: 10px;
      }
      .prices {
        display: flex;
        gap: 24px;
        font-size: 14px;
      }
    }
  }
}
</style>

