<template>
  <el-dialog
    :model-value="modelValue"
    title="Chi tiết Sản phẩm &amp; Danh sách Biến thể (SKU)"
    width="780px"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div v-if="product" class="product-detail-box">
      <div class="detail-top">
        <img
          v-if="product.thumbnailUrl"
          :src="product.thumbnailUrl"
          alt="shoe"
          class="detail-img"
        />
        <div class="detail-info">
          <div class="code-badge" style="display: inline-block; margin-bottom: 6px">
            {{ product.productCode }}
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
import { formatCurrency } from '@/utils/formatters'

defineProps({
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
</script>

<style scoped lang="scss">
.product-detail-box {
  .detail-top {
    display: flex;
    gap: 18px;
    background: #f8fafc;
    padding: 16px;
    border-radius: 10px;
    .detail-img {
      width: 120px;
      height: 120px;
      object-fit: cover;
      border-radius: 10px;
      border: 1px solid #cbd5e1;
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

