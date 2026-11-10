<template>
  <el-dialog
    :model-value="modelValue"
    title="Thêm Khách hàng nhanh tại quầy"
    width="440px"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <el-form :model="quickCustForm" label-position="top">
      <el-form-item label="Họ và tên khách hàng (*)">
        <el-input v-model="quickCustForm.fullName" placeholder="Nhập họ tên khách hàng" />
      </el-form-item>
      <el-form-item label="Số điện thoại (*)">
        <el-input v-model="quickCustForm.phone" placeholder="09xxxxxxxx" />
      </el-form-item>
      <el-form-item label="Địa chỉ (Tùy chọn)">
        <el-input v-model="quickCustForm.address" placeholder="Nhập địa chỉ" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="$emit('update:modelValue', false)">Hủy</el-button>
      <el-button type="primary" :loading="savingCust" @click="submitQuickCustomer">
        Tạo &amp; Chọn khách hàng
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { customerService } from '@/services/customerService'

defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'created'])

const savingCust = ref(false)
const quickCustForm = reactive({
  fullName: '',
  phone: '',
  address: ''
})

async function submitQuickCustomer() {
  if (!quickCustForm.fullName.trim() || !quickCustForm.phone.trim()) {
    ElMessage.warning('Vui lòng nhập họ tên và số điện thoại khách hàng')
    return
  }
  savingCust.value = true
  try {
    const res = await customerService.createCustomer(quickCustForm)
    const newCust = res.data
    quickCustForm.fullName = ''
    quickCustForm.phone = ''
    quickCustForm.address = ''
    ElMessage.success(`Đã thêm và chọn khách hàng ${newCust.fullName}`)
    emit('created', newCust)
    emit('update:modelValue', false)
  } finally {
    savingCust.value = false
  }
}
</script>

