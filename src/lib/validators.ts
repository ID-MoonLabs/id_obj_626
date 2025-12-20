import {
  CompanyInfo,
  DailyData,
  Scope2Data,
  Scope3Data,
  SatelliteData,
  ValidationResult,
  CompletenessCheck,
  DataImportPayload,
} from "@/types"

/**
 * 验证企业信息
 */
export function validateCompanyInfo(company: CompanyInfo): ValidationResult {
  const errors: string[] = []

  if (!company.f_company_name || company.f_company_name.trim() === "") {
    errors.push("企业名称不能为空")
  }

  if (!company.f_company_number || company.f_company_number.trim() === "") {
    errors.push("企业编号不能为空")
  }

  if (!company.f_industry || company.f_industry.trim() === "") {
    errors.push("请选择行业")
  }

  if (!company.f_region || company.f_region.trim() === "") {
    errors.push("所属地区不能为空")
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * 验证日度数据
 */
export function validateDailyData(data: DailyData[]): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  if (data.length === 0) {
    errors.push("日度数据不能为空")
    return { valid: false, errors }
  }

  if (data.length !== 366) {
    warnings.push(`日度数据应为366条记录，当前为${data.length}条`)
  }

  // 检查必填字段
  data.forEach((item, index) => {
    if (!item.f_date) {
      errors.push(`第${index + 1}条记录：日期不能为空`)
    }

    if (item.f_vbg === undefined || item.f_vbg === null) {
      errors.push(`第${index + 1}条记录：背景值不能为空`)
    } else if (item.f_vbg < 0 || item.f_vbg > 1000) {
      errors.push(`第${index + 1}条记录：背景值超出合理范围(0-1000 ppm)`)
    }

    if (item.f_vpeak === undefined || item.f_vpeak === null) {
      errors.push(`第${index + 1}条记录：峰值不能为空`)
    } else if (item.f_vpeak < 0 || item.f_vpeak > 1000) {
      errors.push(`第${index + 1}条记录：峰值超出合理范围(0-1000 ppm)`)
    }

    if (item.f_vpeak !== undefined && item.f_vbg !== undefined) {
      if (item.f_vpeak < item.f_vbg) {
        errors.push(`第${index + 1}条记录：峰值不能小于背景值`)
      }
    }

    if (item.f_u === undefined || item.f_u === null) {
      errors.push(`第${index + 1}条记录：风速不能为空`)
    } else if (item.f_u < 0 || item.f_u > 50) {
      errors.push(`第${index + 1}条记录：风速超出合理范围(0-50 m/s)`)
    }

    if (item.f_delta_x === undefined || item.f_delta_x === null) {
      errors.push(`第${index + 1}条记录：下风向距离不能为空`)
    } else if (item.f_delta_x < 0 || item.f_delta_x > 10000) {
      errors.push(`第${index + 1}条记录：下风向距离超出合理范围(0-10000 m)`)
    }
  })

  // 检查日期唯一性
  const dates = data.map((item) => item.f_date)
  const uniqueDates = new Set(dates)
  if (dates.length !== uniqueDates.size) {
    errors.push("日期存在重复")
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * 验证范围二数据
 */
export function validateScope2Data(data: Scope2Data): ValidationResult {
  const errors: string[] = []

  if (!data.f_year) {
    errors.push("年度不能为空")
  }

  if (data.f_electricity_consumption === undefined || data.f_electricity_consumption === null) {
    errors.push("年度用电量不能为空")
  } else if (data.f_electricity_consumption < 0) {
    errors.push("年度用电量不能为负数")
  } else if (data.f_electricity_consumption > 100000000) {
    errors.push("年度用电量超出合理范围(0-100,000,000 kWh)")
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * 验证范围三数据
 */
export function validateScope3Data(data: Scope3Data): ValidationResult {
  const errors: string[] = []

  if (!data.f_year) {
    errors.push("年度不能为空")
  }

  if (!data.f_company_industry) {
    errors.push("行业不能为空")
  }

  if (!data.dimensions || data.dimensions.length === 0) {
    errors.push("排放维度不能为空")
  } else if (data.dimensions.length !== 4) {
    errors.push(`排放维度应为4个，当前为${data.dimensions.length}个`)
  } else {
    data.dimensions.forEach((dim, index) => {
      if (dim.f_emission_value === undefined || dim.f_emission_value === null) {
        errors.push(`第${index + 1}个维度：排放值不能为空`)
      } else if (dim.f_emission_value < 0) {
        errors.push(`第${index + 1}个维度：排放值不能为负数`)
      } else if (dim.f_emission_value > 1000000) {
        errors.push(`第${index + 1}个维度：排放值超出合理范围(0-1,000,000 吨CO2)`)
      }
    })
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * 验证卫星观测数据
 */
export function validateSatelliteData(data: SatelliteData[]): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  if (data.length === 0) {
    errors.push("卫星观测数据不能为空")
    return { valid: false, errors }
  }

  if (data.length < 800) {
    warnings.push(`卫星观测数据建议至少800条，当前为${data.length}条`)
  }

  // 检查必填字段
  data.forEach((item, index) => {
    if (!item.f_observation_date) {
      errors.push(`第${index + 1}条记录：观测日期不能为空`)
    }

    if (item.f_latitude === undefined || item.f_latitude === null) {
      errors.push(`第${index + 1}条记录：纬度不能为空`)
    } else if (item.f_latitude < -90 || item.f_latitude > 90) {
      errors.push(`第${index + 1}条记录：纬度超出有效范围(-90 到 90)`)
    }

    if (item.f_longitude === undefined || item.f_longitude === null) {
      errors.push(`第${index + 1}条记录：经度不能为空`)
    } else if (item.f_longitude < -180 || item.f_longitude > 180) {
      errors.push(`第${index + 1}条记录：经度超出有效范围(-180 到 180)`)
    }

    if (item.f_co2_concentration === undefined || item.f_co2_concentration === null) {
      errors.push(`第${index + 1}条记录：CO2浓度不能为空`)
    } else if (item.f_co2_concentration < 0 || item.f_co2_concentration > 1000) {
      errors.push(`第${index + 1}条记录：CO2浓度超出合理范围(0-1000 ppm)`)
    }
  })

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * 检查数据完整性
 */
export function checkDataCompleteness(data: Partial<DataImportPayload>): CompletenessCheck {
  const companyInfo = !!data.company && validateCompanyInfo(data.company).valid

  const dailyData = {
    complete: !!data.dailyData && data.dailyData.length === 366,
    count: data.dailyData?.length || 0,
    required: 366 as const,
  }

  const scope2 = !!data.scope2 && validateScope2Data(data.scope2).valid

  const scope3 = {
    complete: !!data.scope3 && data.scope3.dimensions && data.scope3.dimensions.length === 4,
    dimensionCount: data.scope3?.dimensions?.length || 0,
    required: 4 as const,
  }

  const satelliteData = {
    complete: !!data.satelliteData && data.satelliteData.length >= 800,
    count: data.satelliteData?.length || 0,
    minimum: 800 as const,
  }

  const overallComplete =
    companyInfo && dailyData.complete && scope2 && scope3.complete && satelliteData.complete

  return {
    companyInfo,
    dailyData,
    scope2,
    scope3,
    satelliteData,
    overallComplete,
  }
}

