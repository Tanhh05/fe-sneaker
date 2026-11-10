<template>
  <el-dialog
    :model-value="modelValue"
    title="Chi tiết Chứng từ Phiếu Nhập Hàng"
    width="760px"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div v-if="purchase">
      <el-descriptions :column="2" border style="margin-bottom: 16px">
        <el-descriptions-item label="Mã phiếu nhập">
          <span class="code-badge">{{ purchase.purchaseCode }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="Trạng thái">
          <el-tag :type="PURCHASE_STATUS_MAP[purchase.status]?.type || 'info'">
            {{ PURCHASE_STATUS_MAP[purchase.status]?.label || purchase.status }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="Nhà cung cấp">{{ purchase.supplierName }}</el-descriptions-item>
        <el-descriptions-item label="Nhân viên tạo">{{ purchase.employeeName || '---' }}</el-descriptions-item>
        <el-descriptions-item label="Ngày tạo phiếu">{{ formatDateTime(purchase.purchaseDate) }}</el-descriptions-item>
        <el-descriptions-item label="Tổng tiền nhập">
          <strong class="price-text">{{ formatCurrency(purchase.totalAmount) }}</strong>
        </el-descriptions-item>
        <el-descriptions-item label="Ghi chú" :span="2">{{ purchase.note || '---' }}</el-descriptions-item>
      </el-descriptions>

      <el-table :data="purchase.details || []" border stripe size="small">
        <el-table-column type="index" label="#" width="50" />
        <el-table-column prop="productName" label="Sản phẩm" min-width="190" />
        <el-table-column prop="sku" label="SKU" width="150">
          <template #default="{ row }">
            <span class="code-badge">{{ row.sku }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Size / Màu" width="130">
          <template #default="{ row }">{{ row.sizeValue }} / {{ row.colorName }}</template>
        </el-table-column>
        <el-table-column prop="quantity" label="SL nhập" width="90" align="center" />
        <el-table-column label="Đơn giá nhập" width="135" align="right">
          <template #default="{ row }">{{ formatCurrency(row.unitPrice) }}</template>
        </el-table-column>
        <el-table-column label="Thành tiền" width="145" align="right">
          <template #default="{ row }">
            <strong class="price-text">{{ formatCurrency(row.subtotal) }}</strong>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <template #footer>
      <el-button @click="$emit('update:modelValue', false)">Đóng</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { formatCurrency, formatDateTime } from '@/utils/formatters'
import { PURCHASE_STATUS_MAP } from '@/constants'

defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  purchase: {
    type: Object,
    default: null
  }
})

defineEmits(['update:modelValue'])
</script>

