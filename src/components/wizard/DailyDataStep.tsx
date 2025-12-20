'use client'

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { generateVirtualDailyData } from "@/lib/virtualDataGenerators"
import { validateDailyData } from "@/lib/validators"
import { DailyData, Industry } from "@/types"

interface DailyDataStepProps {
  companyNumber: string
  industry: Industry
  data: DailyData[]
  onDataChange: (data: DailyData[]) => void
  onNext: () => void
  onPrevious: () => void
}

export default function DailyDataStep({
  companyNumber,
  industry,
  data,
  onDataChange,
  onNext,
  onPrevious,
}: DailyDataStepProps) {
  const [errors, setErrors] = useState<string[]>([])
  const [warnings, setWarnings] = useState<string[]>([])

  const handleGenerateVirtualData = () => {
    if (!companyNumber || !industry) {
      alert("请先完成企业信息填写")
      return
    }

    const virtualData = generateVirtualDailyData(companyNumber, industry, 2024)
    onDataChange(virtualData)
    setErrors([])
    setWarnings([])
    alert(`成功生成${virtualData.length}条虚拟日度数据`)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      // TODO: 使用 xlsx 库解析 Excel 文件
      alert("Excel 导入功能即将实现")
    } catch (error) {
      alert("文件解析失败")
      console.error(error)
    }
  }

  const handleNext = () => {
    if (data.length === 0) {
      setErrors(["请先导入或生成日度数据"])
      return
    }

    const validation = validateDailyData(data)
    if (!validation.valid) {
      setErrors(validation.errors)
      setWarnings(validation.warnings || [])
      return
    }

    setErrors([])
    setWarnings(validation.warnings || [])
    onNext()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>日度排放数据（范围一）</CardTitle>
        <CardDescription>导入或生成366条日度排放数据，用于计算企业2024年度范围一排放</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-4 rounded-lg border-2 border-dashed p-6">
            <div>
              <h3 className="mb-2 font-medium">生成虚拟数据</h3>
              <p className="mb-4 text-sm text-muted-foreground">点击按钮自动生成366条合理范围内的虚拟日度数据用于演示</p>
              <Button onClick={handleGenerateVirtualData} variant="outline" className="w-full">
                生成366条虚拟数据
              </Button>
            </div>
          </div>

          <div className="space-y-4 rounded-lg border-2 border-dashed p-6">
            <div>
              <h3 className="mb-2 font-medium">Excel 文件导入</h3>
              <p className="mb-4 text-sm text-muted-foreground">上传包含日度数据的 Excel 文件（*.xlsx）</p>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                className="w-full text-sm text-gray-500 file:mr-4 file:rounded file:border-0 file:bg-primary file:px-4 file:py-2 file:font-semibold file:text-primary-foreground hover:file:bg-primary/90"
              />
            </div>
          </div>
        </div>

        {data.length > 0 && (
          <div className="space-y-4">
            <div className="rounded-md bg-secondary/50 p-4">
              <h4 className="mb-2 font-medium">已导入数据概览</h4>
              <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                <div>
                  <span className="text-muted-foreground">记录数量：</span>
                  <span className="ml-2 font-medium">{data.length} 条</span>
                </div>
                <div>
                  <span className="text-muted-foreground">日期范围：</span>
                  <span className="ml-2 font-medium">
                    {data[0]?.f_date} ~ {data[data.length - 1]?.f_date}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">C扇区参数：</span>
                  <span className="ml-2 font-medium">{data[0]?.f_c_sector}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">K常数：</span>
                  <span className="ml-2 font-medium">{data[0]?.f_k}</span>
                </div>
              </div>
              <div className="mt-3">
                <span className="text-sm text-muted-foreground">总排放量：</span>
                <span className="ml-2 font-medium">
                  {data.reduce((sum, item) => sum + (item.f_daily_emissions || 0), 0).toFixed(2)} 吨CO2
                </span>
              </div>
            </div>

            <div className="rounded-md border">
              <div className="flex items-center justify-between border-b bg-muted/50 p-3">
                <h4 className="font-medium">数据预览（前20条）</h4>
                <span className="text-sm text-muted-foreground">
                  显示 1-{Math.min(20, data.length)} / {data.length}
                </span>
              </div>
              <div className="max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-28">日期</TableHead>
                      <TableHead className="text-right">背景值</TableHead>
                      <TableHead className="text-right">峰值</TableHead>
                      <TableHead className="text-right">差值</TableHead>
                      <TableHead className="text-right">风速</TableHead>
                      <TableHead className="text-right">距离</TableHead>
                      <TableHead className="text-right">日排放量</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.slice(0, 20).map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-mono text-xs">{item.f_date}</TableCell>
                        <TableCell className="text-right font-mono text-xs">{item.f_vbg.toFixed(2)}</TableCell>
                        <TableCell className="text-right font-mono text-xs">{item.f_vpeak.toFixed(2)}</TableCell>
                        <TableCell className="text-right font-mono text-xs">{item.f_vpeak_vbg?.toFixed(2)}</TableCell>
                        <TableCell className="text-right font-mono text-xs">{item.f_u.toFixed(2)}</TableCell>
                        <TableCell className="text-right font-mono text-xs">{item.f_delta_x.toFixed(0)}</TableCell>
                        <TableCell className="text-right font-mono text-xs font-medium">
                          {item.f_daily_emissions?.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        )}

        {warnings.length > 0 && (
          <div className="rounded-md bg-yellow-50 p-4 text-yellow-800">
            <p className="mb-2 font-medium">警告：</p>
            <ul className="list-inside list-disc space-y-1">
              {warnings.map((warning, index) => (
                <li key={index} className="text-sm">
                  {warning}
                </li>
              ))}
            </ul>
          </div>
        )}

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

