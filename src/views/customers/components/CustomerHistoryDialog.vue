<template>
  <el-dialog
    :model-value="modelValue"
    :title="`Chi tiết Khách hàng & Lịch sử mua hàng: ${customer?.fullName || ''}`"
    width="760px"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div v-if="customer">
      <el-descriptions :column="2" border size="small" style="margin-bottom: 16px">
        <el-descriptions-item label="Mã khách hàng">{{ customer.customerCode }}</el-descriptions-item>
        <el-descriptions-item label="Số điện thoại">{{ customer.phone }}</el-descriptions-item>
        <el-descriptions-item label="Email">{{ customer.email || '---' }}</el-descriptions-item>
        <el-descriptions-item label="Địa chỉ">{{ customer.address || '---' }}</el-descriptions-item>
      </el-descriptions>

      <h4 style="margin-bottom: 10px">Danh sách đơn hàng đã mua ({{ orders.length }} đơn)</h4>
      <el-table :data="orders" border stripe size="small">
        <el-table-column prop="orderCode" label="Mã đơn" width="130">
          <template #default="{ row }">
            <span class="code-badge">{{ row.orderCode }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Ngày mua" width="160">
          <template #default="{ row }">{{ formatDateTime(row.orderDate) }}</template>
        </el-table-column>
        <el-table-column prop="employeeName" label="Nhân viên bán" min-width="150" />
        <el-table-column label="Phương thức TT" width="150">
          <template #default="{ row }">{{ PAYMENT_METHOD_MAP[row.paymentMethod] || row.paymentMethod }}</template>
        </el-table-column>
        <el-table-column label="Thành tiền" width="145" align="right">
          <template #default="{ row }">
            <strong class="price-text">{{ formatCurrency(row.finalAmount) }}</strong>
          </template>
        </el-table-column>
        <el-table-column label="Trạng thái" width="130" align="center">
          <template #default="{ row }">
            <el-tag :type="ORDER_STATUS_MAP[row.status]?.type || 'info'" size="small">
              {{ ORDER_STATUS_MAP[row.status]?.label || row.status }}
            </el-tag>
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
import { ORDER_STATUS_MAP, PAYMENT_METHOD_MAP } from '@/constants'

defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  customer: {
    type: Object,
    default: null
  },
  orders: {
    type: Array,
    default: () => []
  }
})

defineEmits(['update:modelValue'])
</script>

