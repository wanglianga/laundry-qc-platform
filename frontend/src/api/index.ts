import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
})

export const clothingApi = {
  list: (params?: any) => api.get('/clothing', { params }),
  detail: (id: string) => api.get(`/clothing/${id}`),
  create: (data: any) => api.post('/clothing', data),
  update: (id: string, data: any) => api.put(`/clothing/${id}`, data),
  updateStatus: (id: string, data: any) => api.put(`/clothing/${id}/status`, data),
  factoryProcess: (id: string, data: any) => api.post(`/clothing/${id}/factory-process`, data),
  storeReceive: (id: string, data: any) => api.post(`/clothing/${id}/store-receive`, data),
  pickup: (id: string, data: any) => api.post(`/clothing/${id}/pickup`, data),
  uploadPhotos: (id: string, formData: FormData) =>
    api.post(`/clothing/${id}/photos`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  storeInspection: (id: string, data: any) => api.post(`/clothing/${id}/store-inspection`, data),
  factoryInspection: (id: string, data: any) => api.post(`/clothing/${id}/factory-inspection`, data),
  handleReview: (id: string, data: any) => api.post(`/clothing/${id}/handle-review`, data),
  canWash: (id: string) => api.get(`/clothing/${id}/can-wash`),
  remove: (id: string) => api.delete(`/clothing/${id}`),
}

export const compensationApi = {
  list: (params?: any) => api.get('/compensations', { params }),
  detail: (id: string) => api.get(`/compensations/${id}`),
  create: (data: any) => api.post('/compensations', data),
  update: (id: string, data: any) => api.put(`/compensations/${id}`, data),
  handle: (id: string, data: any) => api.put(`/compensations/${id}/handle`, data),
  byClothing: (clothingId: string) => api.get(`/compensations/clothing/${clothingId}`),
}

export default api
