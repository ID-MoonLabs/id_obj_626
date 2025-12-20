'use client'

import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SCOPE3_TEMPLATES } from "@/lib/constants"
import { generateVirtualScope3Data } from "@/lib/virtualDataGenerators"
import { validateScope3Data } from "@/lib/validators"
import { Industry, Scope3Data, Scope3Dimension } from "@/types"

const isSameScope3 = (a: Scope3Data, b: Scope3Data) => JSON.stringify(a) === JSON.stringify(b)

interface Scope3StepProps {
  companyNumber: string
  companyName: string
  industry: Industry
  data: Scope3Data | null
  onDataChange: (data: Scope3Data) => void
  onNext: () => void
  onPrevious: () => void
}

export default function Scope3Step({
  companyNumber,
  companyName,
  industry,
  data,
  onDataChange,
  onNext,
  onPrevious,
}: Scope3StepProps) {
  const template = SCOPE3_TEMPLATES[industry] || []

  const buildDefaultDimensions = (): Scope3Dimension[] =>
    template.map((t) => ({
      f_emission_dimension: t.dimension,
      f_emission_type: t.category,
      f_emission_detail: [],
      f_calculation_formula: t.formula,
      f_deduction_explanation: `${t.description} ${t.note}`.trim(),
      f_emission_value: 0,
    }))

  const [formData, setFormData] = useState<Scope3Data>(() => ({
    f_company_number: companyNumber,
    f_company_name: companyName,
    f_company_industry: industry,
    f_year: 2024,
    dimensions: buildDefaultDimensions(),
    f_scope3_total: 0,
  }))

  const [errors, setErrors] = useState<string[]>([])

  // 归一化外部传入的数据（兼容旧字段名）
  const normalizeScope3Data = (payload: Scope3Data): Scope3Data => {
    const normalizedDimensions: Scope3Dimension[] = (payload.dimensions || []).map((dim: any) => ({
      f_emission_dimension: dim.f_emission_dimension || dim.dimension || dim.f_emission_type || "",
      f_emission_type: dim.f_emission_type || dim.category || "",
      f_emission_detail: dim.f_emission_detail || [],
      f_calculation_formula: dim.f_calculation_formula || dim.formula || "",
      f_deduction_explanation: dim.f_deduction_explanation || dim.description || dim.note || "",
      f_emission_value:
        dim.f_emission_value !== undefined
          ? dim.f_emission_value
          : dim.value !== undefined
            ? dim.value
            : 0,
    }))

    const total = normalizedDimensions.reduce((sum, dim) => sum + (dim.f_emission_value || 0), 0)

    return {
      f_company_number: payload.f_company_number || companyNumber,
      f_company_name: payload.f_company_name || companyName,
      f_company_industry: payload.f_company_industry || industry,
      f_year: payload.f_year || 2024,
      dimensions: normalizedDimensions,
      f_scope3_total: Number(total.toFixed(2)),
    }
  }

  useEffect(() => {
    const nextData = data
      ? normalizeScope3Data(data)
      : {
          f_company_number: companyNumber,
          f_company_name: companyName,
          f_company_industry: industry,
          f_year: 2024,
          dimensions: buildDefaultDimensions(),
          f_scope3_total: 0,
        }

    if (!isSameScope3(nextData, formData)) {
      setFormData(nextData)
    }
  }, [data, companyNumber, companyName, industry])

  const handleDimensionChange = (index: number, value: number) => {
    const updatedDimensions: Scope3Dimension[] = formData.dimensions.map((dim, i) =>
      i === index ? { ...dim, f_emission_value: value } : dim
    )
    const total = updatedDimensions.reduce((sum, dim) => sum + (dim.f_emission_value || 0), 0)
    const updated = {
      ...formData,
      dimensions: updatedDimensions,
      f_scope3_total: Number(total.toFixed(2)),
    }
    setFormData(updated)
    onDataChange(updated)
  }

  const handleGenerateVirtualData = () => {
    if (!companyNumber || !industry || !companyName) {
      alert("请先完成企业信息填写")
      return
    }

    const virtualData = generateVirtualScope3Data(companyNumber, companyName, industry, 2024)
    const total = virtualData.dimensions.reduce((sum, dim) => sum + (dim.f_emission_value || 0), 0)
    const updated = { ...virtualData, f_scope3_total: Number(total.toFixed(2)) }
    setFormData(updated)
    onDataChange(updated)
    alert("成功生成虚拟范围三数据")
  }

  const handleNext = () => {
    const validation = validateScope3Data(formData)
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
        <CardTitle>范围三：详细年度排放数据</CardTitle>
        <CardDescription>根据行业特征填写4个维度的详细年度排放数据（{industry}）</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="mb-4 flex justify-end">
          <Button onClick={handleGenerateVirtualData} variant="outline" size="sm">
            生成虚拟数据
          </Button>
        </div>

        <div className="space-y-6">
          {formData.dimensions.map((dimension, index) => (
            <div key={index} className="space-y-3 rounded-lg border p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-lg font-medium">{dimension.f_emission_dimension}</h4>
                  <p className="mt-1 text-sm text-muted-foreground">{dimension.f_emission_type}</p>
                </div>
                <div className="w-48">
                  <Label htmlFor={`dimension-${index}`}>排放值 (吨CO2)</Label>
                  <Input
                    id={`dimension-${index}`}
                    type="number"
                    value={dimension.f_emission_value ?? 0}
                    onChange={(e) => handleDimensionChange(index, Number(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* 显示排放详情变量 */}
              <div className="rounded bg-blue-100 p-3 text-sm dark:bg-blue-950">
                <p className="font-medium">排放详情变量：</p>
                {dimension.f_emission_detail && dimension.f_emission_detail.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {dimension.f_emission_detail.map((variable, vIndex) => (
                      <div key={vIndex} className="text-xs">
                        <span className="font-medium">{variable.名称}:</span> {variable.数值} {variable.单位}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground">暂无变量明细，可生成虚拟数据或手动编辑排放值</div>
                )}
              </div>

              <div className="space-y-1 rounded bg-secondary/50 p-3 text-sm">
                <p>
                  <span className="font-medium">计算公式：</span>
                  <code className="ml-1">{dimension.f_calculation_formula}</code>
                </p>
                {dimension.f_deduction_explanation && (
                  <p>
                    <span className="font-medium">说明：</span>
                    {dimension.f_deduction_explanation}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-md bg-blue-100 p-4 text-blue-900">
          <div className="flex items-center justify-between">
            <span className="font-medium">范围三总排放量：</span>
            <span className="text-2xl font-bold">{(formData.f_scope3_total ?? 0).toLocaleString()} 吨CO2</span>
          </div>
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

