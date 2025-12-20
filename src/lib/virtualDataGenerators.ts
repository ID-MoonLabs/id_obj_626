import {
  DailyData,
  SatelliteData,
  Scope3Data,
  Scope3Dimension,
  Industry,
  CompanyInfo,
} from "@/types"
import { C_SECTOR_BY_INDUSTRY, K_CONSTANT, SCOPE3_TEMPLATES } from "./constants"

/**
 * 生成指定日期范围内的所有日期
 */
function generateDateRange(startDate: string, days: number): string[] {
  const dates: string[] = []
  const start = new Date(startDate)

  for (let i = 0; i < days; i++) {
    const date = new Date(start)
    date.setDate(start.getDate() + i)
    dates.push(date.toISOString().split("T")[0])
  }

  return dates
}

/**
 * 生成合理范围内的随机数
 */
function randomInRange(min: number, max: number, decimals: number = 2): number {
  const value = Math.random() * (max - min) + min
  return Number(value.toFixed(decimals))
}

/**
 * 生成虚拟日度数据（366条记录）
 * @param companyNumber 企业编号
 * @param industry 企业行业
 * @param year 年份（默认2024）
 */
export function generateVirtualDailyData(
  companyNumber: string,
  industry: Industry,
  year: number = 2024
): DailyData[] {
  const dailyData: DailyData[] = []
  const startDate = `${year}-01-01`
  const dates = generateDateRange(startDate, 366) // 闰年366天

  const cSector = C_SECTOR_BY_INDUSTRY[industry]
  const aParameter = randomInRange(0.5, 2.0, 3) // A公司参数

  for (const date of dates) {
    // 生成合理范围内的输入值
    const f_vbg = randomInRange(400, 420, 2) // 背景值 (ppm)
    const f_vpeak = randomInRange(425, 450, 2) // 峰值 (ppm)
    const f_vpeak_vbg = f_vpeak - f_vbg // 计算峰值-背景值
    const f_u = randomInRange(2, 8, 2) // 风速 (m/s)
    const f_delta_x = randomInRange(500, 2000, 1) // 下风向距离 (m)

    // 计算日排放量（简化公式：f_vpeak_vbg * f_u * f_delta_x * C * K * A）
    const f_daily_emissions = f_vpeak_vbg * f_u * f_delta_x * cSector * K_CONSTANT * aParameter

    dailyData.push({
      f_company_number: companyNumber,
      f_date: date,
      f_vbg,
      f_vpeak,
      f_vpeak_vbg,
      f_u,
      f_delta_x,
      f_c_sector: cSector,
      f_k: K_CONSTANT,
      f_a: aParameter,
      f_daily_emissions: Number(f_daily_emissions.toFixed(2)),
    })
  }

  return dailyData
}

/**
 * 生成虚拟卫星观测点数据（800+条记录）
 * @param companyNumber 企业编号
 * @param centerLat 中心纬度
 * @param centerLon 中心经度
 * @param count 生成数量（默认800）
 */
export function generateVirtualSatelliteData(
  companyNumber: string,
  centerLat: number = 39.9,
  centerLon: number = 116.4,
  count: number = 800
): SatelliteData[] {
  const satelliteData: SatelliteData[] = []
  const dates = generateDateRange("2024-01-01", 366)

  // 在一年中随机选择一些日期进行观测
  const observationDates: string[] = []
  for (let i = 0; i < count; i++) {
    const randomDate = dates[Math.floor(Math.random() * dates.length)]
    observationDates.push(randomDate)
  }

  for (const date of observationDates) {
    // 在中心点周围生成随机位置（约0.1度范围内）
    const lat = centerLat + randomInRange(-0.1, 0.1, 6)
    const lon = centerLon + randomInRange(-0.1, 0.1, 6)

    // 生成合理的CO2浓度值 (ppm)
    const co2Concentration = randomInRange(410, 450, 2)

    // 生成随机观测时间
    const hour = Math.floor(Math.random() * 24)
    const minute = Math.floor(Math.random() * 60)
    const observationTime = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}:00`

    satelliteData.push({
      f_company_number: companyNumber,
      f_observation_date: date,
      f_latitude: lat,
      f_longitude: lon,
      f_co2_concentration: co2Concentration,
      f_observation_time: observationTime,
    })
  }

  return satelliteData
}

/**
 * 生成虚拟范围三数据
 * @param companyNumber 企业编号
 * @param companyName 企业名称
 * @param industry 企业行业
 * @param year 年份（默认2024）
 */
export function generateVirtualScope3Data(
  companyNumber: string,
  companyName: string,
  industry: Industry,
  year: number = 2024
): Scope3Data {
  const template = SCOPE3_TEMPLATES[industry]

  if (!template || template.length !== 4) {
    throw new Error(`Invalid industry or template not found: ${industry}`)
  }

  const dimensions: Scope3Dimension[] = template.map((item) => {
    // 根据行业特征生成合理的数值范围
    let minBase = 100
    let maxBase = 10000
    let minFactor = 0.5
    let maxFactor = 5.0

    // 特定行业调整
    if (industry === "金融机构（以商业银行为例）") {
      minBase = 1000
      maxBase = 100000
      minFactor = 0.001
      maxFactor = 0.01
    } else if (industry === "电力行业（以火电厂为例）") {
      minBase = 10000
      maxBase = 500000
      minFactor = 1.0
      maxFactor = 10.0
    } else if (industry === "制造业（以汽车制造为例）") {
      minBase = 5000
      maxBase = 200000
      minFactor = 0.5
      maxFactor = 3.0
    } else if (industry === "交通运输业（以航空公司为例）") {
      minBase = 10000
      maxBase = 100000
      minFactor = 2.0
      maxFactor = 5.0
    }

    // 生成2-3个变量
    const variableCount = 2 + Math.floor(Math.random() * 2) // 2或3个变量
    const variables = []

    // 第一个变量：活动数据（数量、消耗量等）
    const baseValue = randomInRange(minBase, maxBase, 2)
    variables.push({
      名称: getActivityVariableName(item.dimension),
      数值: baseValue,
      单位: getActivityUnit(item.dimension),
    })

    // 第二个变量：排放因子
    const factor = randomInRange(minFactor, maxFactor, 3)
    variables.push({
      名称: "排放因子",
      数值: factor,
      单位: "tCO₂e/单位",
    })

    // 如果有第三个变量，添加额外参数
    if (variableCount === 3) {
      const coefficient = randomInRange(0.1, 1.0, 2)
      variables.push({
        名称: "摊销系数",
        数值: coefficient,
        单位: "",
      })
    }

    // 计算排放值（简化计算：基数 × 因子 × 系数）
    let emissionValue = baseValue * factor
    if (variableCount === 3) {
      emissionValue *= variables[2].数值
    }

    return {
      f_emission_dimension: item.dimension,
      f_emission_type: item.category,
      f_emission_detail: variables,
      f_calculation_formula: item.formula,
      f_deduction_explanation: item.description + " " + item.note,
      f_emission_value: Number(emissionValue.toFixed(2)),
    }
  })

  const f_scope3_total = dimensions.reduce((sum, dim) => sum + (dim.f_emission_value || 0), 0)

  return {
    f_company_number: companyNumber,
    f_company_name: companyName,
    f_company_industry: industry,
    f_year: year,
    dimensions,
    f_scope3_total: Number(f_scope3_total.toFixed(2)),
  }
}

/**
 * 根据维度名称获取活动变量名称
 */
function getActivityVariableName(dimension: string): string {
  if (dimension.includes("燃油") || dimension.includes("能源")) {
    return "消耗量"
  } else if (dimension.includes("采购") || dimension.includes("供应链")) {
    return "采购支出"
  } else if (dimension.includes("租赁") || dimension.includes("资产")) {
    return "租赁面积"
  } else if (dimension.includes("通勤") || dimension.includes("差旅")) {
    return "活动人公里"
  } else if (dimension.includes("制造") || dimension.includes("设备")) {
    return "采购数量"
  } else if (dimension.includes("投资") || dimension.includes("融资")) {
    return "投资金额"
  } else {
    return "活动数据"
  }
}

/**
 * 根据维度名称获取活动单位
 */
function getActivityUnit(dimension: string): string {
  if (dimension.includes("燃油") || dimension.includes("材料")) {
    return "吨"
  } else if (dimension.includes("采购") || dimension.includes("投资")) {
    return "万元"
  } else if (dimension.includes("租赁") || dimension.includes("面积")) {
    return "平方米"
  } else if (dimension.includes("通勤") || dimension.includes("差旅")) {
    return "人·公里"
  } else if (dimension.includes("设备") || dimension.includes("飞机")) {
    return "台/架"
  } else {
    return "单位"
  }
}

/**
 * 生成完整的虚拟数据集
 * @param company 企业信息
 */
export function generateCompleteVirtualData(company: CompanyInfo) {
  const { f_company_number, f_company_name, f_industry } = company

  // 生成366条日度数据
  const dailyData = generateVirtualDailyData(f_company_number, f_industry, 2024)

  // 生成800条卫星观测数据
  const satelliteData = generateVirtualSatelliteData(f_company_number, 39.9, 116.4)

  // 生成范围三数据
  const scope3 = generateVirtualScope3Data(f_company_number, f_company_name, f_industry, 2024)

  // 生成范围二数据（用电量）
  const electricityConsumption = randomInRange(100000, 10000000, 0) // kWh
  const emissionFactor = 0.5810 // 中国电网平均排放因子 tCO2/MWh
  const scope2Emissions = (electricityConsumption / 1000) * emissionFactor

  return {
    dailyData,
    satelliteData,
    scope3,
    scope2: {
      f_company_number,
      f_year: 2024,
      f_electricity_consumption: electricityConsumption,
      f_emission_factor: emissionFactor,
      f_scope2_emissions: Number(scope2Emissions.toFixed(2)),
    },
  }
}

