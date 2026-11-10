<template>
  <div>
    <el-table :data="colors" stripe border style="width: 100%">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column label="Mã màu" width="140">
        <template #default="{ row }">
          <span class="code-badge">{{ row.colorCode }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="colorName" label="Tên màu sắc" min-width="200" />
      <el-table-column label="Mã HEX &amp; Preview" width="200">
        <template #default="{ row }">
          <span class="color-dot" :style="{ backgroundColor: row.hexCode }"></span>
          <code>{{ row.hexCode }}</code>
        </template>
      </el-table-column>
      <el-table-column label="Trạng thái" width="140" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === 'ACTIVE' ? 'success' : 'info'">{{ row.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column v-if="canManageCatalog" label="Thao tác" width="130" align="center">
        <template #default="{ row }">
          <el-button size="small" @click="openEditColor(row)">Sửa</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="colorDialogVisible" :title="isEditColor ? 'Sửa Màu sắc' : 'Thêm Màu sắc mới'" width="420px">
      <el-form :model="colorForm" label-position="top">
        <el-form-item label="Mã màu (VD: W, B, RED, YLW)">
          <el-input v-model="colorForm.colorCode" />
        </el-form-item>
        <el-form-item label="Tên màu sắc">
          <el-input v-model="colorForm.colorName" />
        </el-form-item>
        <el-form-item label="Mã màu HEX">
          <div style="display: flex; gap: 10px; width: 100%">
            <el-color-picker v-model="colorForm.hexCode" />
            <el-input v-model="colorForm.hexCode" />
          </div>
        </el-form-item>
        <el-form-item label="Trạng thái">
          <el-select v-model="colorForm.status" style="width: 100%">
            <el-option label="ACTIVE" value="ACTIVE" />
            <el-option label="INACTIVE" value="INACTIVE" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="colorDialogVisible = false">Hủy</el-button>
        <el-button type="primary" @click="submitColor">Lưu Màu sắc</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { variantService } from '@/services/variantService'

defineProps({
  colors: {
    type: Array,
    default: () => []
  },
  canManageCatalog: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['saved'])

const colorDialogVisible = ref(false)
const isEditColor = ref(false)
const editingColorId = ref(null)
const colorForm = reactive({
  colorCode: '',
  colorName: '',
  hexCode: '#F97316',
  status: 'ACTIVE'
})

function openCreateColor() {
  isEditColor.value = false
  editingColorId.value = null
  colorForm.colorCode = ''
  colorForm.colorName = ''
  colorForm.hexCode = '#F97316'
  colorForm.status = 'ACTIVE'
  colorDialogVisible.value = true
}

function openEditColor(row) {
  isEditColor.value = true
  editingColorId.value = row.id
  colorForm.colorCode = row.colorCode
  colorForm.colorName = row.colorName
  colorForm.hexCode = row.hexCode
  colorForm.status = row.status
  colorDialogVisible.value = true
}

async function submitColor() {
  if (isEditColor.value) {
    await variantService.updateColor(editingColorId.value, colorForm)
    ElMessage.success('Đã cập nhật Màu sắc')
  } else {
    await variantService.createColor(colorForm)
    ElMessage.success('Đã thêm Màu sắc mới')
  }
  colorDialogVisible.value = false
  emit('saved')
}

defineExpose({ openCreateColor })
</script>

