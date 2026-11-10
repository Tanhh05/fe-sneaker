<template>
  <div>
    <el-table :data="sizes" stripe border style="width: 100%">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column label="Size EU" width="150">
        <template #default="{ row }">
          <span class="code-badge">Size {{ row.sizeValue }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="sizeNumber" label="Giá trị số" width="140" />
      <el-table-column prop="description" label="Mô tả chiều dài bàn chân" min-width="260" />
      <el-table-column label="Trạng thái" width="140" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === 'ACTIVE' ? 'success' : 'info'">{{ row.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column v-if="canManageCatalog" label="Thao tác" width="130" align="center">
        <template #default="{ row }">
          <el-button size="small" @click="openEditSize(row)">Sửa</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="sizeDialogVisible" :title="isEditSize ? 'Sửa Size giày' : 'Thêm Size giày mới'" width="420px">
      <el-form :model="sizeForm" label-position="top">
        <el-form-item label="Giá trị hiển thị (VD: 36, 36.5, 46)">
          <el-input v-model="sizeForm.sizeValue" />
        </el-form-item>
        <el-form-item label="Giá trị số">
          <el-input-number v-model="sizeForm.sizeNumber" :min="20" :max="55" :step="0.5" style="width: 100%" />
        </el-form-item>
        <el-form-item label="Mô tả">
          <el-input v-model="sizeForm.description" />
        </el-form-item>
        <el-form-item label="Trạng thái">
          <el-select v-model="sizeForm.status" style="width: 100%">
            <el-option label="ACTIVE" value="ACTIVE" />
            <el-option label="INACTIVE" value="INACTIVE" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="sizeDialogVisible = false">Hủy</el-button>
        <el-button type="primary" @click="submitSize">Lưu Size</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { variantService } from '@/services/variantService'

defineProps({
  sizes: {
    type: Array,
    default: () => []
  },
  canManageCatalog: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['saved'])

const sizeDialogVisible = ref(false)
const isEditSize = ref(false)
const editingSizeId = ref(null)
const sizeForm = reactive({
  sizeValue: '',
  sizeNumber: 40,
  description: '',
  status: 'ACTIVE'
})

function openCreateSize() {
  isEditSize.value = false
  editingSizeId.value = null
  sizeForm.sizeValue = ''
  sizeForm.sizeNumber = 46
  sizeForm.description = ''
  sizeForm.status = 'ACTIVE'
  sizeDialogVisible.value = true
}

function openEditSize(row) {
  isEditSize.value = true
  editingSizeId.value = row.id
  sizeForm.sizeValue = row.sizeValue
  sizeForm.sizeNumber = Number(row.sizeNumber)
  sizeForm.description = row.description || ''
  sizeForm.status = row.status
  sizeDialogVisible.value = true
}

async function submitSize() {
  if (isEditSize.value) {
    await variantService.updateSize(editingSizeId.value, sizeForm)
    ElMessage.success('Đã cập nhật Size')
  } else {
    await variantService.createSize(sizeForm)
    ElMessage.success('Đã thêm Size mới')
  }
  sizeDialogVisible.value = false
  emit('saved')
}

defineExpose({ openCreateSize })
</script>

