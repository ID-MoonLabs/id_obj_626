'use client'

import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { validateScope2Data } from "@/lib/validators"
import { Scope2Data } from "@/types"

interface Scope2StepProps {
  companyNumber: string
  data: Scope2Data | null
  onDataChange: (data: Scope2Data) => void
  onNext: () => void
  onPrevious: () => void
}

export default function Scope2Step({
  companyNumber,
  data,
  onDataChange,
  onNext,
  onPrevious,
}: Scope2StepProps) {
  const DEFAULT_EMISSION_FACTOR = 0.5810 // 中国电网平均排放因子 tCO2/MWh

  const [formData, setFormData] = useState<Scope2Data>(
    data || {
      f_company_number: companyNumber,
      f_year: 2024,
      f_electricity_consumption: 0,
      f_emission_factor: DEFAULT_EMISSION_FACTOR,
      f_scope2_emissions: 0,
    }
  )

  const [errors, setErrors] = useState<string[]>([])

  useEffect(() => {
    if (data) {
      setFormData(data)
    }
  }, [data])

  // 自动计算范围二排放量
  useEffect(() => {
    const electricity = formData.f_electricity_consumption
    const factor = formData.f_emission_factor || DEFAULT_EMISSION_FACTOR
    const emissions = (electricity / 1000) * factor // kWh 转 MWh

    const updated = {
      ...formData,
      f_scope2_emissions: Number(emissions.toFixed(2)),
    }

    setFormData(updated)
    onDataChange(updated)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.f_electricity_consumption, formData.f_emission_factor])

  const handleChange = (field: keyof Scope2Data, value: number) => {
    const updated = { ...formData, [field]: value }
    setFormData(updated)
  }

  const handleNext = () => {
    const validation = validateScope2Data(formData)
    if (!validation.valid) {
      setErrors(validation.errors)
      return
    }
    setErrors([])
    onDataChange(formData)
    onNext()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>范围二：年度用电量数据</CardTitle>
        <CardDescription>填写企业2024年度用电量，系统将自动计算范围二排放</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="year">年度 *</Label>
            <Input id="year" type="number" value={formData.f_year} onChange={(e) => handleChange("f_year", Number(e.target.value))} readOnly />
          </div>

          <div className="space-y-2">
            <Label htmlFor="electricity">年度用电量 (kWh) *</Label>
            <Input
              id="electricity"
              type="number"
              value={formData.f_electricity_consumption}
              onChange={(e) => handleChange("f_electricity_consumption", Number(e.target.value))}
              placeholder="请输入年度用电量"
              step="0.01"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="emission_factor">电网排放因子 (tCO2/MWh)</Label>
            <Input
              id="emission_factor"
              type="number"
              value={formData.f_emission_factor}
              onChange={(e) => handleChange("f_emission_factor", Number(e.target.value))}
              step="0.0001"
            />
            <p className="text-xs text-muted-foreground">默认值：{DEFAULT_EMISSION_FACTOR} (中国电网平均)</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="scope2_emissions">范围二排放量 (tCO2)</Label>
            <Input id="scope2_emissions" type="number" value={formData.f_scope2_emissions} readOnly className="bg-secondary" />
            <p className="text-xs text-muted-foreground">自动计算：用电量(MWh) × 排放因子</p>
          </div>
        </div>

        <div className="rounded-md bg-blue-100 p-4 text-blue-900">
          <h4 className="mb-2 font-medium">说明</h4>
          <ul className="list-inside list-disc space-y-1 text-sm">
            <li>范围二主要核算外购电力产生的间接排放</li>
            <li>用电量单位为千瓦时 (kWh)，系统将自动转换为兆瓦时 (MWh)</li>
            <li>排放因子根据所在地区电网确定，可手动调整</li>
            <li>计算公式：范围二排放 = 用电量(MWh) × 电网排放因子</li>
          </ul>
        </div>

        {errors.length > 0 && (
          <div className="rounded-md bg-destructive/10 p-4 text-destructive">
            <p className="mb-2 font-medium">请修正以下错误：</p>
            <ul className="list-inside list-disc space-y-1">
              {errors.map((error, index) => (
                <li key={index} className="text-sm">
                  {error}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button onClick={onPrevious} variant="outline">
          上一步
        </Button>
        <Button onClick={handleNext}>下一步</Button>
      </CardFooter>
    </Card>
  )
}

