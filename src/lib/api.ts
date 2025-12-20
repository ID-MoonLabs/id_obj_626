import axios from "axios"

import { DataImportPayload } from "@/types"
import { API_BASE_URL } from "./constants"

// 动态获取后端 API 基础URL，支持本地代理及环境变量覆盖
const getApiBaseUrl = () => {
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_CARBON_API_BASE_URL || API_BASE_URL
  }
  return process.env.CARBON_API_BASE_URL || process.env.NEXT_PUBLIC_CARBON_API_BASE_URL || API_BASE_URL
}

// 创建 axios 实例（通过拦截器注入 baseURL）
const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 60000, // 60秒超时
  headers: {
    "Content-Type": "application/json",
  },
})

apiClient.interceptors.request.use((config) => {
  config.baseURL = getApiBaseUrl()
  return config
})

/**
 * 测试数据库连接
 */
export async function testDatabaseConnection(): Promise<{
  success: boolean
  message: string
  timestamp?: string
}> {
  try {
    const response = await apiClient.get("/test-db")
    return response.data
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    }
  }
}

/**
 * 提交碳排放数据（事务提交）
 */
export async function submitCarbonData(payload: DataImportPayload): Promise<{
  success: boolean
  message: string
  data?: any
  error?: string
}> {
  try {
    // 从 localStorage 获取 user_id 并添加到 payload
    const userId = typeof window !== "undefined" ? localStorage.getItem("user_id") : null
    const payloadWithUserId = {
      ...payload,
      user_id: userId || payload.user_id,
    }
    const response = await apiClient.post("/import_carbon_data", payloadWithUserId)
    return response.data
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "数据提交失败",
      error: error.response?.data?.error || error.message,
    }
  }
}

/**
 * 获取所有企业列表
 */
export async function getAllCompanies(): Promise<{
  success: boolean
  data?: any[]
  error?: string
}> {
  try {
    const response = await apiClient.get("/companies")
    return response.data
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.error || error.message,
    }
  }
}

/**
 * 获取指定企业的所有数据
 */
export async function getCompanyData(companyNumber: string): Promise<{
  success: boolean
  data?: any
  error?: string
}> {
  try {
    const response = await apiClient.get(`/company/${companyNumber}`)
    return response.data
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.error || error.message,
    }
  }
}

