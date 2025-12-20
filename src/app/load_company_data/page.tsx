'use client'

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import CompanyInfoStep from "@/components/wizard/CompanyInfoStep"
import DailyDataStep from "@/components/wizard/DailyDataStep"
import ReviewStep from "@/components/wizard/ReviewStep"
import SatelliteDataStep from "@/components/wizard/SatelliteDataStep"
import Scope2Step from "@/components/wizard/Scope2Step"
import Scope3Step from "@/components/wizard/Scope3Step"
import { submitCarbonData } from "@/lib/api"
import { checkDataCompleteness } from "@/lib/validators"
import { CompanyInfo, DailyData, DataImportPayload, Scope2Data, Scope3Data, SatelliteData, WizardStep } from "@/types"

export default function LoadCompanyDataPage() {
  const [currentStep, setCurrentStep] = useState<WizardStep>(WizardStep.CompanyInfo)
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null)
  const [dailyData, setDailyData] = useState<DailyData[]>([])
  const [scope2Data, setScope2Data] = useState<Scope2Data | null>(null)
  const [scope3Data, setScope3Data] = useState<Scope3Data | null>(null)
  const [satelliteData, setSatelliteData] = useState<SatelliteData[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const steps = [
    { id: WizardStep.CompanyInfo, name: "企业信息", description: "填写企业基本信息" },
    { id: WizardStep.DailyData, name: "日度数据", description: "导入366条日度排放数据" },
    { id: WizardStep.Scope2, name: "范围二", description: "填写年度用电量数据" },
    { id: WizardStep.Scope3, name: "范围三", description: "填写详细年度排放数据" },
    { id: WizardStep.SatelliteData, name: "卫星数据", description: "导入800+条卫星观测数据" },
    { id: WizardStep.Review, name: "审核提交", description: "检查数据完整性并提交" },
  ]

  const progress = (currentStep / steps.length) * 100

  const handleNext = () => {
    if (currentStep < WizardStep.Review) {
      setCurrentStep((currentStep + 1) as WizardStep)
    }
  }

  const handlePrevious = () => {
    if (currentStep > WizardStep.CompanyInfo) {
      setCurrentStep((currentStep - 1) as WizardStep)
    }
  }

  const handleSubmit = async () => {
    if (!companyInfo) {
      alert("请先填写企业信息")
      return
    }

    const completeness = checkDataCompleteness({
      company: companyInfo,
      dailyData,
      scope2: scope2Data || undefined,
      scope3: scope3Data || undefined,
      satelliteData,
    })

    if (!completeness.overallComplete) {
      alert("数据不完整，请检查所有步骤")
      return
    }

    const payload: DataImportPayload = {
      company: companyInfo,
      dailyData,
      scope2: scope2Data!,
      scope3: scope3Data!,
      satelliteData,
    }

    setIsSubmitting(true)

    try {
      const result = await submitCarbonData(payload)

      if (result.success) {
        alert(
          `✅ ${result.message}\n\n` +
            `企业：${result.data?.company}\n` +
            `日度数据：${result.data?.dailyRecords} 条\n` +
            `范围二：${result.data?.scope2Records} 条\n` +
            `范围三：${result.data?.scope3Dimensions} 个维度\n` +
            `卫星数据：${result.data?.satelliteRecords} 条`
        )
      } else {
        alert(`❌ ${result.message}\n\n错误：${result.error}`)
      }
    } catch (error) {
      console.error("Submission error:", error)
      alert("❌ 数据提交失败，请检查后端服务是否运行")
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case WizardStep.CompanyInfo:
        return <CompanyInfoStep data={companyInfo} onDataChange={setCompanyInfo} onNext={handleNext} />
      case WizardStep.DailyData:
        return (
          <DailyDataStep
            companyNumber={companyInfo?.f_company_number || ""}
            industry={companyInfo?.f_industry!}
            data={dailyData}
            onDataChange={setDailyData}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        )
      case WizardStep.Scope2:
        return (
          <Scope2Step
            companyNumber={companyInfo?.f_company_number || ""}
            data={scope2Data}
            onDataChange={setScope2Data}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        )
      case WizardStep.Scope3:
        return (
          <Scope3Step
            companyNumber={companyInfo?.f_company_number || ""}
            companyName={companyInfo?.f_company_name || ""}
            industry={companyInfo?.f_industry!}
            data={scope3Data}
            onDataChange={setScope3Data}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        )
      case WizardStep.SatelliteData:
        return (
          <SatelliteDataStep
            companyNumber={companyInfo?.f_company_number || ""}
            data={satelliteData}
            onDataChange={setSatelliteData}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        )
      case WizardStep.Review:
        return (
          <ReviewStep
            companyInfo={companyInfo!}
            dailyData={dailyData}
            scope2Data={scope2Data!}
            scope3Data={scope3Data!}
            satelliteData={satelliteData}
            onSubmit={handleSubmit}
            onPrevious={handlePrevious}
            isSubmitting={isSubmitting}
          />
        )
      default:
        return null
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-3xl">碳排放数据入库系统</CardTitle>
            <CardDescription>企业碳排放数据批量导入与管理</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium">
                  步骤 {currentStep} / {steps.length}: {steps[currentStep - 1]?.name}
                </span>
                <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} />
              <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-6">
                {steps.map((step) => (
                  <div
                    key={step.id}
                    className={`rounded p-2 text-center text-xs ${
                      step.id === currentStep
                        ? "bg-primary text-primary-foreground"
                        : step.id < currentStep
                          ? "bg-secondary text-secondary-foreground"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <div className="font-medium">{step.name}</div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {renderStepContent()}
      </div>
    </main>
  )
}
