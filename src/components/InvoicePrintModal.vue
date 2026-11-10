<template>
  <el-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    title="HÓA ĐƠN BÁN HÀNG TẠI QUẦY"
    width="650px"
  >
    <div v-if="order" id="printable-invoice" class="invoice-wrapper">
      <div class="invoice-header">
        <div>
          <h2 class="brand-title">SNEAKERHUB PRO STORE</h2>
          <p>Địa chỉ: 120 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh</p>
          <p>Hotline: 0901 000 001 | Website: internal.sneakerstore.vn</p>
        </div>
        <div class="invoice-meta">
          <div class="invoice-code">{{ order.orderCode }}</div>
          <p>Ngày lập: {{ formatDateTime(order.orderDate) }}</p>
          <p>Trạng thái: {{ ORDER_STATUS_MAP[order.status]?.label || order.status }}</p>
        </div>
      </div>

      <div class="customer-section">
        <div>
          <strong>Khách hàng:</strong> {{ order.customerName || 'Khách lẻ tại quầy' }}
          <span v-if="order.customerCode">({{ order.customerCode }})</span>
        </div>
        <div><strong>SĐT:</strong> {{ order.customerPhone || '---' }}</div>
        <div><strong>Thu ngân / Nhân viên:</strong> {{ order.employeeName || '---' }}</div>
        <div><strong>Thanh toán:</strong> {{ PAYMENT_METHOD_MAP[order.paymentMethod] || order.paymentMethod }}</div>
      </div>

      <table class="invoice-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Sản phẩm / Biến thể</th>
            <th>SKU</th>
            <th>Size / Màu</th>
            <th class="text-right">SL</th>
            <th class="text-right">Đơn giá</th>
            <th class="text-right">Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, idx) in order.details || []" :key="item.id || idx">
            <td>{{ idx + 1 }}</td>
            <td>{{ item.productName }}</td>
            <td><code>{{ item.sku }}</code></td>
            <td>{{ item.sizeValue }} / {{ item.colorName }}</td>
            <td class="text-right">{{ item.quantity }}</td>
            <td class="text-right">{{ formatCurrency(item.unitPrice) }}</td>
            <td class="text-right font-bold">{{ formatCurrency(item.subtotal) }}</td>
          </tr>
        </tbody>
      </table>

      <div class="invoice-summary">
        <div class="summary-row">
          <span>Tổng cộng tiền hàng:</span>
          <strong>{{ formatCurrency(order.totalAmount) }}</strong>
        </div>
        <div class="summary-row grand-total">
          <span>THÀNH TIỀN THANH TOÁN:</span>
          <span>{{ formatCurrency(order.finalAmount) }}</span>
        </div>
      </div>

      <div v-if="order.note" class="invoice-note">
        <strong>Ghi chú:</strong> {{ order.note }}
      </div>

      <div class="invoice-footer">
        <p>Cảm ơn Quý khách đã mua sắm tại SNEAKERHUB PRO STORE!</p>
        <p class="sub">Vui lòng giữ hóa đơn để được hỗ trợ bảo hành keo chỉ chính hãng.</p>
      </div>
    </div>

    <template #footer>
      <el-button @click="$emit('update:modelValue', false)">Đóng</el-button>
      <el-button type="primary" @click="handlePrint">
        <el-icon style="margin-right: 6px"><Printer /></el-icon>
        In Hóa Đơn Ngay
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { Printer } from '@element-plus/icons-vue'
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

defineEmits(['update:modelValue'])

function handlePrint() {
  const el = document.getElementById('printable-invoice')
  if (!el) return
  const printWindow = window.open('', '_blank', 'width=800,height=700')
  if (!printWindow) {
    window.print()
    return
  }
  printWindow.document.write(`
    <html>
      <head>
        <title>In Hóa Đơn</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; color: #0f172a; }
          .invoice-header { display: flex; justify-content: space-between; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 16px; }
          .brand-title { margin: 0 0 6px 0; font-size: 20px; }
          .invoice-code { font-size: 18px; font-weight: bold; color: #ea580c; }
          .customer-section { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 16px; font-size: 13px; background: #f8fafc; padding: 12px; border-radius: 6px; }
          .invoice-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 13px; }
          .invoice-table th, .invoice-table td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; }
          .invoice-table th { background: #0f172a; color: #fff; }
          .text-right { text-align: right !important; }
          .invoice-summary { margin-left: auto; width: 320px; border-top: 2px solid #0f172a; padding-top: 10px; }
          .summary-row { display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 14px; }
          .grand-total { font-size: 16px; font-weight: bold; color: #ea580c; }
          .invoice-footer { text-align: center; margin-top: 24px; font-size: 12px; color: #64748b; }
        </style>
      </head>
      <body>${el.innerHTML}</body>
    </html>
  `)
  printWindow.document.close()
  printWindow.focus()
  printWindow.print()
}
</script>

<style scoped lang="scss">
.invoice-wrapper {
  border: 1px dashed #cbd5e1;
  padding: 20px;
  border-radius: 10px;
  background: #ffffff;
}
.invoice-header {
  display: flex;
  justify-content: space-between;
  border-bottom: 2px solid #0f172a;
  padding-bottom: 14px;
  margin-bottom: 16px;
  .brand-title {
    font-size: 18px;
    font-weight: 800;
    color: #0f172a;
    margin-bottom: 4px;
  }
  p {
    font-size: 12.5px;
    color: #475569;
    margin: 2px 0;
  }
  .invoice-meta {
    text-align: right;
    .invoice-code {
      font-size: 17px;
      font-weight: 800;
      color: #f97316;
    }
  }
}
.customer-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  background: #f8fafc;
  padding: 12px 14px;
  border-radius: 8px;
  font-size: 13px;
  margin-bottom: 16px;
}
.invoice-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  margin-bottom: 16px;
  th,
  td {
    border: 1px solid #e2e8f0;
    padding: 8px 10px;
  }
  th {
    background: #0f172a;
    color: #ffffff;
    font-weight: 600;
  }
  .text-right {
    text-align: right;
  }
  .font-bold {
    font-weight: 700;
  }
}
.invoice-summary {
  margin-left: auto;
  width: 300px;
  .summary-row {
    display: flex;
    justify-content: space-between;
    padding: 4px 0;
    font-size: 13.5px;
  }
  .grand-total {
    border-top: 2px solid #0f172a;
    margin-top: 6px;
    padding-top: 8px;
    font-size: 15.5px;
    font-weight: 800;
    color: #ea580c;
  }
}
.invoice-note {
  margin-top: 12px;
  font-size: 13px;
  color: #475569;
}
.invoice-footer {
  margin-top: 20px;
  padding-top: 12px;
  border-top: 1px dashed #cbd5e1;
  text-align: center;
  font-size: 12.5px;
  font-weight: 600;
  color: #334155;
  .sub {
    font-weight: 400;
    color: #64748b;
    margin-top: 3px;
  }
}
</style>

