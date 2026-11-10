import api from './api'

export const employeeService = {
  getEmployees(params) {
    return api.get('/employees', { params })
  },
  getAllEmployees() {
    return api.get('/employees/all')
  },
  createEmployee(payload) {
    return api.post('/employees', payload)
  },
  updateEmployee(id, payload) {
    return api.put(`/employees/${id}`, payload)
  },
  updateEmployeeStatus(id, status) {
    return api.patch(`/employees/${id}/status`, { status })
  }
}

