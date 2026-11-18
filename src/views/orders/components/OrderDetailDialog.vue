<template>
  <el-dialog
    :model-value="modelValue"
    title="Chi tiết Đơn hàng &amp; Luồng chuyển trạng thái"
    width="860px"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div v-if="order">
      <!-- Stepper tiến trình đơn hàng trực quan -->
      <div class="order-stepper-box">
        <el-steps
          :active="activeStepIndex"
          finish-status="success"
          align-center
          :process-status="order.status === 'CANCELLED' ? 'error' : 'finish'"
        >
          <el-step title="Tiếp nhận" :description="formatDateTime(order.orderDate)" />
          <el-step title="Đã xác nhận" :description="getStatusTime('CONFIRMED')" />
          <el-step title="Đang giao hàng" :description="getStatusTime('SHIPPING')" />
          <el-step
            :title="order.status === 'CANCELLED' ? 'Đã hủy đơn' : 'Hoàn thành'"
            :description="getStatusTime(order.status)"
          />
        </el-steps>
      </div>

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
        <el-descriptions-item label="Kênh bán / Nhân viên">
          {{ order.employeeName || 'ONLINE STORE' }}
        </el-descriptions-item>
        <el-descriptions-item label="Ngày tạo">{{ formatDateTime(order.orderDate) }}</el-descriptions-item>
        <el-descriptions-item label="Phương thức thanh toán">
          {{ PAYMENT_METHOD_MAP[order.paymentMethod] || order.paymentMethod }}
        </el-descriptions-item>
        <el-descriptions-item label="Tổng tiền">
          <strong class="price-text">{{ formatCurrency(order.finalAmount) }}</strong>
        </el-descriptions-item>
        <el-descriptions-item label="Ghi chú đơn hàng">{{ order.note || '---' }}</el-descriptions-item>
      </el-descriptions>

      <h4 style="margin-bottom: 8px">Danh sách Sản phẩm trong đơn</h4>
      <el-table :data="order.details || []" border stripe size="small" style="margin-bottom: 18px">
        <el-table-column type="index" label="#" width="50" align="center" />
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

      <h4 style="margin-bottom: 10px">Lịch sử chuyển trạng thái (Audit Timeline)</h4>
      <el-timeline>
        <el-timeline-item
          v-for="h in order.histories || []"
          :key="h.id"
          :timestamp="formatDateTime(h.changedAt)"
          placement="top"
          :type="getTimelineType(h.toStatus)"
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
      <div class="dialog-footer-content">
        <div v-if="order" class="status-actions-group">
          <!-- Xác nhận đơn -->
          <el-button
            v-if="order.status === 'DRAFT' || order.status === 'PENDING'"
            type="primary"
            @click="$emit('status-change', 'CONFIRMED', 'Xác nhận đơn hàng')"
          >
            ✓ Xác nhận đơn hàng
          </el-button>

          <!-- Bắt đầu giao hàng -->
          <el-button
            v-if="order.status === 'CONFIRMED'"
            type="warning"
            @click="$emit('status-change', 'SHIPPING', 'Bắt đầu giao hàng')"
          >
            🚚 Bắt đầu giao hàng
          </el-button>

          <!-- Hoàn thành đơn hàng -->
          <el-button
            v-if="['CONFIRMED', 'SHIPPING', 'DRAFT', 'PENDING'].includes(order.status)"
            type="success"
            @click="$emit('status-change', 'COMPLETED', 'Hoàn thành đơn hàng')"
          >
            ✓ Hoàn thành đơn
          </el-button>

          <!-- Hủy đơn hàng -->
          <el-button
            v-if="order.status !== 'COMPLETED' && order.status !== 'CANCELLED'"
            type="danger"
            plain
            @click="$emit('status-change', 'CANCELLED', 'Hủy đơn hàng')"
          >
            ✕ Hủy đơn hàng
          </el-button>
        </div>
        <div class="modal-buttons-right">
          <el-button @click="$emit('update:modelValue', false)">Đóng</el-button>
          <el-button type="primary" @click="$emit('print')">In Hóa Đơn</el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed } from 'vue'
import { formatCurrency, formatDateTime } from '@/utils/formatters'
import { ORDER_STATUS_MAP, PAYMENT_METHOD_MAP } from '@/constants'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  order: {
    type: Object,
    default: null
  }
})

defineEmits(['update:modelValue', 'print', 'status-change'])

const activeStepIndex = computed(() => {
  if (!props.order) return 1
  const s = props.order.status
  if (s === 'COMPLETED') return 4
  if (s === 'SHIPPING') return 3
  if (s === 'CONFIRMED') return 2
  if (s === 'CANCELLED') return 4
  return 1 // DRAFT / PENDING
})

const getStatusTime = (targetStatus) => {
  if (!props.order || !props.order.histories) return ''
  const item = props.order.histories.find(h => h.toStatus === targetStatus)
  return item ? formatDateTime(item.changedAt) : ''
}

const getTimelineType = (toStatus) => {
  switch (toStatus) {
    case 'COMPLETED': return 'success'
    case 'CANCELLED': return 'danger'
    case 'SHIPPING': return 'warning'
    case 'CONFIRMED': return 'primary'
    default: return 'info'
  }
}
</script>

<style scoped lang="scss">
.order-stepper-box {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 16px 12px;
  margin-bottom: 18px;
}

.dialog-footer-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  width: 100%;
}

.status-actions-group {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.modal-buttons-right {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
</style>

