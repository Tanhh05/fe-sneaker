<template>
  <el-dialog
    :model-value="modelValue"
    title="Chi tiết Đơn hàng &amp; Lịch sử thay đổi trạng thái"
    width="820px"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div v-if="order">
      <el-descriptions :column="2" border size="small" style="margin-bottom: 16px">
        <el-descriptions-item label="Mã đơn hàng">
          <span class="code-badge">{{ order.orderCode }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="Trạng thái hiện tại">
          <el-tag :type="ORDER_STATUS_MAP[order.status]?.type || 'info'">
            {{ ORDER_STATUS_MAP[order.status]?.label || order.status }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="Khách hàng">
          {{ order.customerName }} ({{ order.customerPhone }})
        </el-descriptions-item>
        <el-descriptions-item label="Nhân viên bán hàng">{{ order.employeeName }}</el-descriptions-item>
        <el-descriptions-item label="Ngày tạo">{{ formatDateTime(order.orderDate) }}</el-descriptions-item>
        <el-descriptions-item label="Phương thức thanh toán">
          {{ PAYMENT_METHOD_MAP[order.paymentMethod] || order.paymentMethod }}
        </el-descriptions-item>
        <el-descriptions-item label="Tổng tiền">
          <strong class="price-text">{{ formatCurrency(order.finalAmount) }}</strong>
        </el-descriptions-item>
        <el-descriptions-item label="Ghi chú">{{ order.note || '---' }}</el-descriptions-item>
      </el-descriptions>

      <h4 style="margin-bottom: 8px">Danh sách Sản phẩm trong đơn</h4>
      <el-table :data="order.details || []" border stripe size="small" style="margin-bottom: 18px">
        <el-table-column type="index" label="#" width="50" />
        <el-table-column prop="productName" label="Sản phẩm Sneaker" min-width="190" />
        <el-table-column prop="sku" label="SKU" width="150">
          <template #default="{ row }">
            <span class="code-badge">{{ row.sku }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Size / Màu" width="130">
          <template #default="{ row }">{{ row.sizeValue }} / {{ row.colorName }}</template>
        </el-table-column>
        <el-table-column prop="quantity" label="SL" width="75" align="center" />
        <el-table-column label="Đơn giá bán" width="135" align="right">
          <template #default="{ row }">{{ formatCurrency(row.unitPrice) }}</template>
        </el-table-column>
        <el-table-column label="Thành tiền" width="145" align="right">
          <template #default="{ row }">
            <strong class="price-text">{{ formatCurrency(row.subtotal) }}</strong>
          </template>
        </el-table-column>
      </el-table>

      <h4 style="margin-bottom: 10px">Lịch sử thay đổi trạng thái đơn hàng</h4>
      <el-timeline>
        <el-timeline-item
          v-for="h in order.histories || []"
          :key="h.id"
          :timestamp="formatDateTime(h.changedAt)"
          placement="top"
          :type="h.toStatus === 'COMPLETED' ? 'success' : h.toStatus === 'CANCELLED' ? 'danger' : 'primary'"
        >
          <div style="font-size: 13px">
            <strong>{{ h.fromStatus ? `${h.fromStatus} → ${h.toStatus}` : `Khởi tạo: ${h.toStatus}` }}</strong>
            <span style="color: #64748b; margin-left: 8px">(Thực hiện bởi: {{ h.createdBy || 'SYSTEM' }})</span>
            <div style="color: #475569; margin-top: 2px">{{ h.note }}</div>
          </div>
        </el-timeline-item>
      </el-timeline>
    </div>
    <template #footer>
      <el-button @click="$emit('update:modelValue', false)">Đóng</el-button>
      <el-button type="primary" @click="$emit('print')">In Hóa Đơn</el-button>
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
  order: {
    type: Object,
    default: null
  }
})

defineEmits(['update:modelValue', 'print'])
</script>

