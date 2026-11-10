<template>
  <el-dialog
    :model-value="modelValue"
    title="Đổi mật khẩu tài khoản"
    width="440px"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <el-form
      ref="pwdFormRef"
      :model="pwdForm"
      :rules="pwdRules"
      label-position="top"
    >
      <el-form-item label="Mật khẩu hiện tại" prop="oldPassword">
        <el-input v-model="pwdForm.oldPassword" type="password" show-password placeholder="Nhập mật khẩu hiện tại" />
      </el-form-item>
      <el-form-item label="Mật khẩu mới" prop="newPassword">
        <el-input v-model="pwdForm.newPassword" type="password" show-password placeholder="Ít nhất 6 ký tự" />
      </el-form-item>
      <el-form-item label="Xác nhận mật khẩu mới" prop="confirmPassword">
        <el-input v-model="pwdForm.confirmPassword" type="password" show-password placeholder="Nhập lại mật khẩu mới" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="$emit('update:modelValue', false)">Hủy</el-button>
      <el-button type="primary" :loading="pwdLoading" @click="submitChangePassword">
        Cập nhật mật khẩu
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { authService } from '@/services/authService'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const pwdLoading = ref(false)
const pwdFormRef = ref(null)
const pwdForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

watch(
  () => props.modelValue,
  (visible) => {
    if (visible) {
      pwdForm.oldPassword = ''
      pwdForm.newPassword = ''
      pwdForm.confirmPassword = ''
    }
  }
)

const pwdRules = {
  oldPassword: [{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại', trigger: 'blur' }],
  newPassword: [
    { required: true, message: 'Vui lòng nhập mật khẩu mới', trigger: 'blur' },
    { min: 6, message: 'Mật khẩu mới tối thiểu 6 ký tự', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: 'Vui lòng xác nhận mật khẩu mới', trigger: 'blur' },
    {
      validator: (_, value, callback) => {
        if (value !== pwdForm.newPassword) {
          callback(new Error('Mật khẩu xác nhận không khớp'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

async function submitChangePassword() {
  if (!pwdFormRef.value) return
  await pwdFormRef.value.validate(async (valid) => {
    if (!valid) return
    pwdLoading.value = true
    try {
      await authService.changePassword({
        oldPassword: pwdForm.oldPassword,
        newPassword: pwdForm.newPassword
      })
      ElMessage.success('Đổi mật khẩu thành công!')
      emit('update:modelValue', false)
    } finally {
      pwdLoading.value = false
    }
  })
}
</script>

