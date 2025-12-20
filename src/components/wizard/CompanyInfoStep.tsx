'use client'

import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select-native"
import { INDUSTRIES } from "@/lib/constants"
import { validateCompanyInfo } from "@/lib/validators"
import { CompanyInfo, Industry } from "@/types"

interface CompanyInfoStepProps {
  data: CompanyInfo | null
  onDataChange: (data: CompanyInfo) => void
  onNext: () => void
}

export default function CompanyInfoStep({ data, onDataChange, onNext }: CompanyInfoStepProps) {
  const [formData, setFormData] = useState<CompanyInfo>(
    data || {
      f_company_name: "",
      f_company_number: "",
      f_industry: "" as Industry,
      f_region: "",
      f_registration_date: new Date().toISOString().split("T")[0],
    }
  )

  const [errors, setErrors] = useState<string[]>([])

  useEffect(() => {
    if (data) {
      setFormData(data)
    }
  }, [data])

  const handleChange = (field: keyof CompanyInfo, value: string) => {
    const updated = { ...formData, [field]: value }
    setFormData(updated)
    onDataChange(updated)
  }

  const handleNext = () => {
    const validation = validateCompanyInfo(formData)
    if (!validation.valid) {
      setErrors(validation.errors)
      return
    }
    setErrors([])
    onNext()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>企业信息</CardTitle>
        <CardDescription>请填写企业基本信息</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="company_name">企业名称 *</Label>
            <Input
              id="company_name"
              value={formData.f_company_name}
              onChange={(e) => handleChange("f_company_name", e.target.value)}
              placeholder="请输入企业名称"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company_number">企业编号 *</Label>
            <Input
              id="company_number"
              value={formData.f_company_number}
              onChange={(e) => handleChange("f_company_number", e.target.value)}
              placeholder="请输入企业编号（唯一标识）"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="industry">所属行业 *</Label>
            <Select
              id="industry"
              value={formData.f_industry}
              onChange={(e) => handleChange("f_industry", e.target.value)}
            >
              <option value="">请选择行业</option>
              {INDUSTRIES.map((industry) => (
                <option key={industry} value={industry}>
                  {industry}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="region">所属地区 *</Label>
            <Input
              id="region"
              value={formData.f_region}
              onChange={(e) => handleChange("f_region", e.target.value)}
              placeholder="请输入所属地区"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="registration_date">注册日期</Label>
            <Input
              id="registration_date"
              type="date"
              value={formData.f_registration_date || ""}
              onChange={(e) => handleChange("f_registration_date", e.target.value)}
            />
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
        <div className="text-sm text-muted-foreground">* 表示必填项</div>
        <Button onClick={handleNext}>下一步</Button>
      </CardFooter>
    </Card>
  )
}

