'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { checkDataCompleteness } from "@/lib/validators"
import { CompanyInfo, DailyData, SatelliteData, Scope2Data, Scope3Data } from "@/types"

interface ReviewStepProps {
  companyInfo: CompanyInfo
  dailyData: DailyData[]
  scope2Data: Scope2Data
  scope3Data: Scope3Data
  satelliteData: SatelliteData[]
  onSubmit: () => void
  onPrevious: () => void
  isSubmitting: boolean
}

export default function ReviewStep({
  companyInfo,
  dailyData,
  scope2Data,
  scope3Data,
  satelliteData,
  onSubmit,
  onPrevious,
  isSubmitting,
}: ReviewStepProps) {
  const completeness = checkDataCompleteness({
    company: companyInfo,
    dailyData,
    scope2: scope2Data,
    scope3: scope3Data,
    satelliteData,
  })

  // 计算总排放量
  const totalScope1 = dailyData.reduce((sum, item) => sum + (item.f_daily_emissions || 0), 0)
  const totalScope2 = scope2Data?.f_scope2_emissions || 0
  const totalScope3 = scope3Data?.f_scope3_total || 0
  const grandTotal = totalScope1 + totalScope2 + totalScope3

  return (
    <Card>
      <CardHeader>
        <CardTitle>数据审核与提交</CardTitle>
        <CardDescription>请仔细检查所有数据的完整性和准确性，确认无误后提交</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 企业信息摘要 */}
        <div className="rounded-lg border p-4">
          <h3 className="mb-3 flex items-center text-lg font-medium">
            企业信息
            {completeness.companyInfo && (
              <span className="ml-2 rounded bg-green-100 px-2 py-1 text-xs text-green-800">✓ 完整</span>
            )}
          </h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">企业名称：</span>
              <span className="ml-2 font-medium">{companyInfo.f_company_name}</span>
            </div>
            <div>
              <span className="text-muted-foreground">企业编号：</span>
              <span className="ml-2 font-medium">{companyInfo.f_company_number}</span>
            </div>
            <div>
              <span className="text-muted-foreground">所属行业：</span>
              <span className="ml-2 font-medium">{companyInfo.f_industry}</span>
            </div>
            <div>
              <span className="text-muted-foreground">所属地区：</span>
              <span className="ml-2 font-medium">{companyInfo.f_region}</span>
            </div>
          </div>
        </div>

        {/* 排放数据摘要 */}
        <div className="rounded-lg border p-4">
          <h3 className="mb-3 text-lg font-medium">排放数据摘要</h3>

          {/* 范围一 */}
          <div className="mb-4 border-b pb-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-medium">范围一 - 日度排放数据</span>
              {completeness.dailyData.complete ? (
                <span className="rounded bg-green-100 px-2 py-1 text-xs text-green-800">
                  ✓ 完整 ({completeness.dailyData.count}/{completeness.dailyData.required})
                </span>
              ) : (
                <span className="rounded bg-red-100 px-2 py-1 text-xs text-red-800">
                  ✗ 不完整 ({completeness.dailyData.count}/{completeness.dailyData.required})
                </span>
              )}
            </div>
            <div className="text-sm text-muted-foreground">记录数量：{dailyData.length} 条</div>
            <div className="mt-2 text-lg font-bold text-blue-700">总排放量：{totalScope1.toLocaleString()} 吨CO2</div>
          </div>

          {/* 范围二 */}
          <div className="mb-4 border-b pb-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-medium">范围二 - 年度用电量</span>
              {completeness.scope2 ? (
                <span className="rounded bg-green-100 px-2 py-1 text-xs text-green-800">✓ 完整</span>
              ) : (
                <span className="rounded bg-red-100 px-2 py-1 text-xs text-red-800">✗ 不完整</span>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              年度用电量：{scope2Data?.f_electricity_consumption.toLocaleString()} kWh
            </div>
            <div className="mt-2 text-lg font-bold text-blue-700">总排放量：{totalScope2.toLocaleString()} 吨CO2</div>
          </div>

          {/* 范围三 */}
          <div className="mb-4 border-b pb-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-medium">范围三 - 详细年度排放</span>
              {completeness.scope3.complete ? (
                <span className="rounded bg-green-100 px-2 py-1 text-xs text-green-800">
                  ✓ 完整 ({completeness.scope3.dimensionCount}/{completeness.scope3.required})
                </span>
              ) : (
                <span className="rounded bg-red-100 px-2 py-1 text-xs text-red-800">
                  ✗ 不完整 ({completeness.scope3.dimensionCount}/{completeness.scope3.required})
                </span>
              )}
            </div>
            <div className="space-y-1 text-sm">
              {scope3Data?.dimensions.map((dim, idx) => (
                <div key={idx} className="text-muted-foreground">
                  {dim.f_emission_dimension}：{(dim.f_emission_value || 0).toLocaleString()} 吨CO2
                </div>
              ))}
            </div>
            <div className="mt-2 text-lg font-bold text-blue-700">总排放量：{totalScope3.toLocaleString()} 吨CO2</div>
          </div>

          {/* 卫星数据 */}
          <div className="mb-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-medium">卫星观测数据</span>
              {completeness.satelliteData.complete ? (
                <span className="rounded bg-green-100 px-2 py-1 text-xs text-green-800">
                  ✓ 完整 ({completeness.satelliteData.count}个观测点)
                </span>
              ) : (
                <span className="rounded bg-red-100 px-2 py-1 text-xs text-red-800">
                  ✗ 不完整 ({completeness.satelliteData.count}/{completeness.satelliteData.minimum})
                </span>
              )}
            </div>
            <div className="text-sm text-muted-foreground">观测点数量：{satelliteData.length} 个</div>
          </div>
        </div>

        {/* 总计 */}
        <div className="rounded-lg border-2 border-primary bg-primary/10 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold">企业年度碳排放总量</h3>
              <p className="mt-1 text-sm text-muted-foreground">范围一 + 范围二 + 范围三</p>
            </div>
            <div className="text-3xl font-bold text-primary">{grandTotal.toLocaleString()} 吨CO2</div>
          </div>
        </div>

        {/* 完整性检查 */}
        {!completeness.overallComplete && (
          <div className="rounded-md bg-red-50 p-4 text-red-800">
            <h4 className="mb-2 font-medium">数据不完整</h4>
            <p className="text-sm">请返回相关步骤补充缺失的数据。所有数据必须完整才能提交。</p>
          </div>
        )}

        {completeness.overallComplete && (
          <div className="rounded-md bg-green-50 p-4 text-green-800">
            <h4 className="mb-2 font-medium">✓ 数据完整</h4>
            <p className="text-sm">所有必填数据已完整填写，可以提交到数据库。提交后将以事务方式写入所有数据。</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button onClick={onPrevious} variant="outline" disabled={isSubmitting}>
          上一步
        </Button>
        <Button onClick={onSubmit} disabled={!completeness.overallComplete || isSubmitting}>
          {isSubmitting ? "提交中..." : "确认提交"}
        </Button>
      </CardFooter>
    </Card>
  )
}

