import axios from 'axios'
import { Toast } from 'antd-mobile'

function errMessage(data: unknown, fallback: string): string {
  if (typeof data === 'string' && data.trim()) return data
  if (data && typeof data === 'object' && 'message' in data) {
    const m = (data as { message?: unknown }).message
    if (typeof m === 'string' && m.trim()) return m
  }
  return fallback
}

export const api = axios.create({ withCredentials: true })

export const adminApi = axios.create({ withCredentials: true })

adminApi.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      window.location.assign('/admin/login')
      return Promise.reject(err)
    }
    const msg = errMessage(err.response?.data, err.message || '操作失败，请稍后重试')
    Toast.show({ icon: 'fail', content: String(msg) })
    return Promise.reject(err)
  }
)
