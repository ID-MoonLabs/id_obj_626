// 行业类型
export type Industry =
  | "金融机构（以商业银行为例）"
  | "交通运输业（以航空公司为例）"
  | "数字科技行业（以云服务/互联网公司为例）"
  | "新材料行业（以先进化工材料/复合材料为例）"
  | "制造业（以汽车制造为例）"
  | "电子信息业（以智能手机制造为例）"
  | "医疗行业（以大型综合医院为例）"
  | "电力行业（以火电厂为例）"

// 企业信息
export interface CompanyInfo {
  f_company_name: string // 企业名称
  f_company_number: string // 企业编号（唯一标识）
  f_industry: Industry // 行业
  f_region: string // 所属地区
  f_registration_date?: string // 注册日期
}

// 日度数据（范围一）
export interface DailyData {
  f_id?: number
  f_company_number: string
  f_date: string // 日期 YYYY-MM-DD
  f_vbg: number // 背景值 (输入)
  f_vpeak: number // 峰值 (输入)
  f_vpeak_vbg?: number // 峰值-背景值 (计算: f_vpeak - f_vbg)
  f_u: number // 风速 (输入)
  f_delta_x: number // 下风向距离 (输入)
  f_c_sector?: number // C扇区参数 (按行业常量)
  f_k?: number // K常数 (全局常数 0.1)
  f_a?: number // A公司参数 (企业固定值)
  f_daily_emissions?: number // 日排放量 (计算公式)
}

// 范围二：年度用电量数据
export interface Scope2Data {
  f_id?: number
  f_company_number: string
  f_year: number // 年度
  f_electricity_consumption: number // 年度用电量 (kWh)
  f_emission_factor?: number // 电网排放因子 (tCO2/kWh)
  f_scope2_emissions?: number // 范围二排放量 (计算: f_electricity_consumption × f_emission_factor)
}

// 范围三：详细年度排放数据（行业特定）
// f_emission_detail 中的变量结构
export interface Scope3Variable {
  名称: string // 变量名称
  数值: number // 变量数值
  单位: string // 变量单位
}

export interface Scope3Dimension {
  f_emission_dimension: string // 排放维度名称
  f_emission_type: string // 范围三类别
  f_emission_detail: Scope3Variable[] // 变量数组（JSON格式）
  f_calculation_formula: string // 计算公式
  f_deduction_explanation?: string // 推导说明
  f_emission_value?: number // 计算得到的排放值 (吨CO2)
}

export interface Scope3Data {
  f_id?: number
  f_company_number: string
  f_company_name: string
  f_company_industry: Industry
  f_year: number // 年度
  dimensions: Scope3Dimension[] // 4个行业特定维度
  f_scope3_total?: number // 范围三总排放量 (计算: sum of all dimensions)
}

// 卫星观测点数据
export interface SatelliteData {
  f_id?: number
  f_company_number: string
  f_observation_date: string // 观测日期 YYYY-MM-DD
  f_latitude: number // 纬度
  f_longitude: number // 经度
  f_co2_concentration: number // CO2浓度 (ppm)
  f_observation_time?: string // 观测时间
}

// 完整的数据入库对象
export interface DataImportPayload {
  company: CompanyInfo
  dailyData: DailyData[] // 366条记录
  scope2: Scope2Data // 1条记录
  scope3: Scope3Data // 1条记录，包含4个维度
  satelliteData: SatelliteData[] // 800+条记录
  user_id?: string | number // 用户ID
}

// 向导步骤
export enum WizardStep {
  CompanyInfo = 1,
  DailyData = 2,
  Scope2 = 3,
  Scope3 = 4,
  SatelliteData = 5,
  Review = 6,
}

// 验证结果
export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings?: string[]
}

// 数据完整性检查结果
export interface CompletenessCheck {
  companyInfo: boolean
  dailyData: { complete: boolean; count: number; required: 366 }
  scope2: boolean
  scope3: { complete: boolean; dimensionCount: number; required: 4 }
  satelliteData: { complete: boolean; count: number; minimum: 800 }
  overallComplete: boolean
}

