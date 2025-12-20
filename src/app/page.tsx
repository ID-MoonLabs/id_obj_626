"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { MessageCircle, BookOpen, Upload, Trash2, FileText, Plus, Loader2, Send, Download, Database, FileDown, X, ChevronLeft, ChevronRight, Search, Building2 } from "lucide-react";
import CompanyDataSheet from "@/components/CompanyDataSheet";

const API_BASE_URL = "http://localhost:18080/b/ibot";

interface KnowledgeBase {
  id: number;
  name: string;
  description: string;
  status: string;
  doc_count: number;
  created_at: string;
}

interface Document {
  id: number;
  name: string;
  file_type: string;
  file_size: number;
  status: string;
  chunk_count: number;
  created_at: string;
}

interface Company {
  company_name: string;
  id: string;
}

export default function Home() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"chat" | "kb">("chat");
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [selectedKbId, setSelectedKbId] = useState<number | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [messages, setMessages] = useState<Array<{ 
    role: "user" | "assistant"; 
    content: string; 
    documents?: Array<{ id: number; name: string }>; 
  }>>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [newKbName, setNewKbName] = useState("");
  const [newKbDescription, setNewKbDescription] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // 下载报告相关状态
  const [showCompanyList, setShowCompanyList] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [downloadingCompany, setDownloadingCompany] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmingCompany, setConfirmingCompany] = useState<string | null>(null);
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCompanyDataSheetOpen, setIsCompanyDataSheetOpen] = useState(false);
  const [parsingDocId, setParsingDocId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const itemsPerPage = 10;

  useEffect(() => {
    loadKnowledgeBases();
  }, []);

  useEffect(() => {
    if (selectedKbId) {
      loadDocuments(selectedKbId);
    }
  }, [selectedKbId]);

  // 自动滚动到消息底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadKnowledgeBases = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/dataset/read`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const result = await response.json();
      if (result.code === 200) {
        setKnowledgeBases(result.data);
        if (result.data.length > 0 && !selectedKbId) {
          setSelectedKbId(result.data[0].id);
        }
      }
    } catch (error) {
      console.error("加载知识库失败:", error);
    }
  };

  const loadDocuments = async (kbId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/document/read`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ knowledge_base_id: kbId }),
      });
      const result = await response.json();
      if (result.code === 200) {
        setDocuments(result.data);
      }
    } catch (error) {
      console.error("加载文档失败:", error);
    }
  };

  const createKnowledgeBase = async () => {
    if (!newKbName.trim()) {
      alert("请输入知识库名称");
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/dataset/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newKbName,
          description: newKbDescription,
          user_id: 1,
        }),
      });
      const result = await response.json();
      if (result.code === 200) {
        setNewKbName("");
        setNewKbDescription("");
        setIsCreateDialogOpen(false);
        loadKnowledgeBases();
      } else {
        alert(result.msg);
      }
    } catch (error) {
      console.error("创建知识库失败:", error);
      alert("创建失败");
    }
  };

  const deleteKnowledgeBase = async (id: number) => {
    if (!confirm("确定要删除这个知识库吗？这将删除所有相关文档。")) {
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/dataset/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const result = await response.json();
      if (result.code === 200) {
        loadKnowledgeBases();
        if (selectedKbId === id) {
          setSelectedKbId(null);
        }
      } else {
        alert(result.msg);
      }
    } catch (error) {
      console.error("删除知识库失败:", error);
      alert("删除失败");
    }
  };

  const uploadDocument = async (file: File, kbId: number) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("knowledge_base_id", kbId.toString());

    try {
      const response = await fetch(`${API_BASE_URL}/document/upload`, {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (result.code === 200) {
        loadDocuments(kbId);
        // 取消自动解析，必须手动点击"开始解析"按钮
        // startParseDocument(result.data.id);
      } else {
        alert(result.msg);
      }
    } catch (error) {
      console.error("上传文档失败:", error);
      alert("上传失败");
    }
  };

  const startParseDocument = async (docId: number) => {
    setParsingDocId(docId);
    try {
      const response = await fetch(`${API_BASE_URL}/document/parse/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: docId }),
      });
      const result = await response.json();
      if (result.code === 200) {
        loadDocuments(selectedKbId!);
        checkDocumentStatus(docId);
      } else {
        setParsingDocId(null);
      }
    } catch (error) {
      console.error("开始解析失败:", error);
      setParsingDocId(null);
    }
  };

  const reparseDocument = async (docId: number) => {
    if (!confirm("确定要重新解析这个文档吗？这将删除旧的解析数据并重新解析。")) {
      return;
    }
    
    setParsingDocId(docId);
    try {
      const response = await fetch(`${API_BASE_URL}/document/parse/reparse`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: docId }),
      });
      const result = await response.json();
      if (result.code === 200) {
        loadDocuments(selectedKbId!);
        checkDocumentStatus(docId);
      } else {
        setParsingDocId(null);
        alert(result.msg || "重新解析失败");
      }
    } catch (error) {
      console.error("重新解析失败:", error);
      setParsingDocId(null);
      alert("重新解析失败，请稍后重试");
    }
  };

  const checkDocumentStatus = async (docId: number) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/document/read`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ knowledge_base_id: selectedKbId }),
        });
        const result = await response.json();
        if (result.code === 200) {
          const doc = result.data.find((d: Document) => d.id === docId);
          if (doc && (doc.status === "completed" || doc.status === "failed")) {
            clearInterval(interval);
            setParsingDocId(null);
            loadDocuments(selectedKbId!);
          }
        }
      } catch (error) {
        clearInterval(interval);
        setParsingDocId(null);
      }
    }, 2000);
  };

  const deleteDocument = async (id: number) => {
    if (!confirm("确定要删除这个文档吗？")) {
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/document/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const result = await response.json();
      if (result.code === 200) {
        loadDocuments(selectedKbId!);
      } else {
        alert(result.msg);
      }
    } catch (error) {
      console.error("删除文档失败:", error);
      alert("删除失败");
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !selectedKbId) {
      alert("请先选择知识库并输入消息");
      return;
    }

    const userMessage = inputMessage;
    setInputMessage("");
    
    // 添加用户消息
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    
    // 添加空的assistant消息用于流式更新
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/rag/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          knowledge_base_id: selectedKbId,
          query: userMessage,
          k: 5,
        }),
      });

      if (!response.ok) {
        throw new Error(`请求失败: ${response.status} ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error("响应体为空");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let assistantMessage = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          
          // 保留最后一个可能不完整的行
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine || !trimmedLine.startsWith("data: ")) {
              continue;
            }

            try {
              const jsonStr = trimmedLine.slice(6); // 移除 "data: " 前缀
              const data = JSON.parse(jsonStr);
              
              if (data.type === "token" && data.content) {
                // 流式更新assistant消息
                assistantMessage += data.content;
                setMessages((prev) => {
                  const newMessages = [...prev];
                  // 找到最后一条assistant消息并更新
                  for (let i = newMessages.length - 1; i >= 0; i--) {
                    if (newMessages[i].role === "assistant") {
                      newMessages[i].content = assistantMessage;
                      break;
                    }
                  }
                  return newMessages;
                });
              } else if (data.type === "search_complete") {
                // 检索完成（可选：显示提示）
                console.log(`检索完成: 找到${data.doc_count}个相关文档`);
              } else if (data.type === "sources") {
                // 来源信息：保存文档列表到消息中（即使为空也要设置，以确保状态正确）
                const documents = data.documents || [];
                setMessages((prev) => {
                  const newMessages = [...prev];
                  // 找到最后一条assistant消息并设置文档列表（可能为空）
                  for (let i = newMessages.length - 1; i >= 0; i--) {
                    if (newMessages[i].role === "assistant") {
                      // 只有当有文档时才设置，否则保持undefined（不显示按钮）
                      if (documents.length > 0) {
                        newMessages[i].documents = documents;
                      }
                      // 如果没有文档，不设置documents字段，这样按钮就不会显示
                      break;
                    }
                  }
                  return newMessages;
                });
                console.log("来源文档数量:", documents.length);
              } else if (data.type === "done") {
                // 流式响应完成
                console.log("流式响应完成");
              } else if (data.type === "error") {
                throw new Error(data.error || "未知错误");
              }
            } catch (parseError) {
              // 忽略JSON解析错误，继续处理下一行
              console.warn("解析SSE数据失败:", parseError, trimmedLine);
            }
          }
        }

        // 处理剩余缓冲区
        if (buffer.trim()) {
          const trimmedLine = buffer.trim();
          if (trimmedLine.startsWith("data: ")) {
            try {
              const jsonStr = trimmedLine.slice(6);
              const data = JSON.parse(jsonStr);
              if (data.type === "token" && data.content) {
                assistantMessage += data.content;
                setMessages((prev) => {
                  const newMessages = [...prev];
                  for (let i = newMessages.length - 1; i >= 0; i--) {
                    if (newMessages[i].role === "assistant") {
                      newMessages[i].content = assistantMessage;
                      break;
                    }
                  }
                  return newMessages;
                });
              }
            } catch (e) {
              console.warn("解析剩余缓冲区失败:", e);
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      console.error("发送消息失败:", error);
      setMessages((prev) => {
        const newMessages = [...prev];
        // 更新最后一条assistant消息为错误信息
        for (let i = newMessages.length - 1; i >= 0; i--) {
          if (newMessages[i].role === "assistant") {
            newMessages[i].content = error instanceof Error ? `错误: ${error.message}` : "抱歉，发生了错误，请稍后重试。";
            break;
          }
        }
        return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 录入企业数据 - 跳转到数据录入页面
  const handleGoToLoadCompanyData = () => {
    router.push("/load_company_data");
  };

  // 下载模板
  const handleDownloadTemplate = async () => {
    setIsDownloadingTemplate(true);
    setErrorMessage(null);

    try {
      const response = await fetch("http://localhost:18080/b/ibot/download_template", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        throw new Error(`下载失败: ${response.status}`);
      }

      // 处理流式响应
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("无法读取响应流");
      }

      // 收集流式数据（二进制数据）
      const chunks: Uint8Array[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // 如果是二进制流，直接收集chunks
        if (value) {
          chunks.push(value);
        }
      }

      // 从所有chunks创建Blob
      const blob = new Blob(chunks as BlobPart[]);

      // 从响应头中获取文件名
      let filename = "[模板]碳排放数据.xlsx";
      const contentDisposition = response.headers.get("Content-Disposition");
      if (contentDisposition) {
        // 优先尝试解析 filename* (RFC 5987 格式，支持 UTF-8)
        const filenameStarMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)/);
        if (filenameStarMatch && filenameStarMatch[1]) {
          try {
            filename = decodeURIComponent(filenameStarMatch[1]);
          } catch {
            // 如果解码失败，尝试其他方式
          }
        }
        
        // 如果没有 filename*，尝试解析 filename
        if (filename === "[模板]碳排放数据.xlsx") {
          const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
          if (filenameMatch && filenameMatch[1]) {
            let extractedFilename = filenameMatch[1].replace(/['"]/g, "");
            // 尝试 URL 解码（可能包含编码的中文字符）
            try {
              extractedFilename = decodeURIComponent(extractedFilename);
            } catch {
              // 如果解码失败，直接使用原始值
            }
            if (extractedFilename) {
              filename = extractedFilename;
            }
          }
        }
      }

      // 创建下载链接
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "下载模板失败，请稍后重试";
      console.error("下载模板错误:", err);
      setErrorMessage(errorMessage);
    } finally {
      setIsDownloadingTemplate(false);
    }
  };

  // 获取公司列表
  const handleFetchCompanyList = async () => {
    setIsLoadingCompanies(true);
    setErrorMessage(null);

    try {
      const response = await fetch("http://localhost:18080/b/ibot/fetch_compony_list", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      if (!response.ok || data.code !== 200) {
        throw new Error(data.msg || `获取公司列表失败: ${response.status}`);
      }

      if (data.data && Array.isArray(data.data)) {
        setCompanies(data.data);
        setCurrentPage(1);
        setShowCompanyList(true);
      } else {
        throw new Error("公司列表数据格式错误");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "获取公司列表失败，请稍后重试";
      setErrorMessage(errorMessage);
      console.error("获取公司列表错误:", err);
    } finally {
      setIsLoadingCompanies(false);
    }
  };

  // 显示确认弹窗
  const handleShowConfirmDialog = (companyName: string) => {
    setConfirmingCompany(companyName);
    setShowConfirmDialog(true);
  };

  // 确认生成报告
  const handleConfirmGenerateReport = async () => {
    if (confirmingCompany) {
      setShowConfirmDialog(false);
      await handleDownloadCompanyReport(confirmingCompany);
      setConfirmingCompany(null);
    }
  };

  // 取消生成报告
  const handleCancelGenerateReport = () => {
    setShowConfirmDialog(false);
    setConfirmingCompany(null);
  };

  // 下载指定公司的报告（流式返回）
  const handleDownloadCompanyReport = async (companyName: string) => {
    setDownloadingCompany(companyName);

    try {
      const response = await fetch("http://localhost:18080/b/ibot/download_report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          company: companyName,
        }),
      });

      if (!response.ok) {
        throw new Error(`下载失败: ${response.status}`);
      }

      // 处理流式响应
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("无法读取响应流");
      }

      // 收集流式数据（二进制数据）
      const chunks: Uint8Array[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // 如果是二进制流，直接收集chunks
        if (value) {
          chunks.push(value);
        }
      }

      // 从所有chunks创建Blob
      const blob = new Blob(chunks as BlobPart[]);

      // 从响应头中获取文件名
      let filename = `${companyName}_报告.docx`;
      const contentDisposition = response.headers.get("Content-Disposition");
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, "");
        }
      }

      // 创建下载链接
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "下载报告失败，请稍后重试";
      console.error("下载报告错误:", err);
      setErrorMessage(errorMessage);
    } finally {
      setDownloadingCompany(null);
    }
  };

  // 过滤公司列表（基于搜索）
  const filteredCompanies = companies.filter((company) =>
    company.company_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 计算分页数据
  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCompanies = filteredCompanies.slice(startIndex, endIndex);

  // 当搜索查询改变时，重置到第一页
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      completed: "default",
      processing: "secondary",
      failed: "destructive",
      pending: "outline",
    };
    const labels: Record<string, string> = {
      completed: "已完成",
      processing: "处理中",
      failed: "失败",
      pending: "待处理",
    };
    return (
      <Badge variant={variants[status] || "outline"}>
        {labels[status] || status}
      </Badge>
    );
  };

  // 检测是否为"未找到答案"
  const isNoAnswerFound = (content: string): boolean => {
    if (!content || content.trim().length === 0) {
      return false;
    }
    const noAnswerKeywords = [
      "未找到答案",
      "找不到答案",
      "未找到",
      "找不到",
      "抱歉，未找到",
      "抱歉，找不到",
      "没有找到",
      "暂无答案",
      "无法找到",
    ];
    const lowerContent = content.toLowerCase();
    return noAnswerKeywords.some(keyword => lowerContent.includes(keyword.toLowerCase()));
  };

  return (
    <div className="flex h-screen flex-col bg-slate-50">
      {/* Header */}
      <header className="flex items-center justify-between gap-3 border-b border-slate-200/80 bg-white px-6 py-4 shadow-soft backdrop-blur-sm">
        <div className="flex items-center gap-3">
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleGoToLoadCompanyData} className="gap-2 bg-black text-white hover:bg-black/90 border-black hidden">
            <Database className="h-4 w-4" />
            录入企业数据
          </Button>
          {/* 下载模板按钮 */}
          <Button
            variant="outline"
            onClick={handleDownloadTemplate}
            disabled={isDownloadingTemplate}
            className="gap-2 bg-blue-700 text-white hover:bg-blue-800 border-0 shadow-md transition-all duration-200"
          >
            {isDownloadingTemplate ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                下载中...
              </>
            ) : (
              <>
                <FileDown className="h-4 w-4" />
                下载模板
              </>
            )}
          </Button>

          <Button
            variant="outline"
            onClick={handleFetchCompanyList}
            disabled={isLoadingCompanies}
            className="gap-2 bg-purple-700 text-white hover:bg-purple-800 border-0 shadow-md transition-all duration-200"
          >
            <FileText className="h-4 w-4" />
            {isLoadingCompanies ? "加载中..." : "生成报告"}
          </Button>
        </div>
      </header>

      {/* 错误提示 */}
      {errorMessage && (
        <div className="border-b border-red-300/60 bg-red-100 px-6 py-3 shadow-sm">
          <p className="text-sm text-red-800 font-medium">{errorMessage}</p>
        </div>
      )}

      {/* 确认生成报告弹窗 */}
      <Dialog open={showConfirmDialog} onOpenChange={(open) => {
        if (!open) {
          handleCancelGenerateReport();
        }
      }}>
        <DialogContent className="max-w-lg sm:max-w-md overflow-hidden bg-white">
          <DialogHeader className="space-y-4 pb-4">
            {/* 图标和标题区域 */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 p-3 rounded-xl bg-gray-50 border border-gray-200">
                <FileText className="h-6 w-6 text-primary" strokeWidth={2} />
              </div>
              <div className="flex-1 space-y-1">
                <DialogTitle className="text-2xl font-semibold tracking-tight">
                  确认生成报告
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
                  即将为以下公司生成碳排放认证报告
                </DialogDescription>
              </div>
            </div>
            
            {/* 公司信息卡片 */}
            <div className="mt-4 p-4 rounded-lg bg-gray-50 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 p-2 rounded-md bg-white border border-gray-200">
                  <Building2 className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-muted-foreground mb-1">公司名称</p>
                  <p className="text-base font-semibold text-foreground truncate">
                    {confirmingCompany}
                  </p>
                </div>
              </div>
            </div>

            {/* 提示信息 */}
            <div className="mt-3 p-3 rounded-lg bg-blue-100 border border-blue-300">
              <p className="text-xs text-blue-800 leading-relaxed">
                <span className="font-medium">提示：</span>
                报告生成可能需要几秒钟时间，请耐心等待。生成完成后将自动下载。
              </p>
            </div>
          </DialogHeader>
          
          <DialogFooter className="gap-3 sm:gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleCancelGenerateReport}
              disabled={downloadingCompany === confirmingCompany}
              className="flex-1 sm:flex-initial"
            >
              取消
            </Button>
            <Button
              variant="default"
              onClick={handleConfirmGenerateReport}
              disabled={downloadingCompany === confirmingCompany}
              className="flex-1 sm:flex-initial gap-2 bg-primary hover:bg-primary/90 shadow-sm"
            >
              {downloadingCompany === confirmingCompany ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>生成中...</span>
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4" />
                  <span>确认生成</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 公司列表模态框 */}
      <Dialog open={showCompanyList} onOpenChange={(open) => {
        setShowCompanyList(open);
        if (!open) {
          setCompanies([]);
          setCurrentPage(1);
          setSearchQuery("");
        }
      }}>
        <DialogContent className="max-w-3xl max-h-[85vh] !flex !flex-col p-0 gap-0 [&>button]:hidden bg-white">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <DialogTitle className="text-xl">选择公司生成报告</DialogTitle>
                <DialogDescription className="mt-1">
                  从列表中选择一个公司，为其生成碳排放报告
                </DialogDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => {
                  setShowCompanyList(false);
                  setCompanies([]);
                  setCurrentPage(1);
                  setSearchQuery("");
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          
          <div className="flex-1 overflow-hidden flex flex-col">
            {/* 搜索框 */}
            {companies.length > 0 && (
              <div className="px-6 pt-4 pb-3 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="搜索公司名称..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            )}

            {/* 公司列表 */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {companies.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="p-4 rounded-full bg-muted mb-4">
                    <Building2 className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-lg font-medium text-foreground mb-2">暂无公司数据</p>
                  <p className="text-sm text-muted-foreground">请先录入企业数据</p>
                </div>
              ) : filteredCompanies.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="p-4 rounded-full bg-muted mb-4">
                    <Search className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-lg font-medium text-foreground mb-2">未找到匹配的公司</p>
                  <p className="text-sm text-muted-foreground">请尝试其他搜索关键词</p>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    {currentCompanies.map((company) => (
                      <div
                        key={company.id}
                        className="group flex items-center justify-between p-4 border rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 cursor-pointer"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="p-2 rounded-md bg-primary/10 group-hover:bg-primary/20 transition-colors">
                            <Building2 className="h-4 w-4 text-primary" />
                          </div>
                          <span className="text-sm font-medium text-foreground truncate">
                            {company.company_name}
                          </span>
                        </div>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleShowConfirmDialog(company.company_name)}
                          disabled={downloadingCompany === company.company_name || showConfirmDialog}
                          className="ml-4 shrink-0"
                        >
                          {downloadingCompany === company.company_name ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              生成中...
                            </>
                          ) : (
                            <>
                              <FileText className="h-4 w-4 mr-2" />
                              生成报告
                            </>
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                  
                  {/* 分页控件 */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6 pt-4 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="gap-2"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        上一页
                      </Button>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">
                          第 {currentPage} / {totalPages} 页
                        </span>
                        <span className="text-muted-foreground">
                          （共 {filteredCompanies.length} 条）
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="gap-2"
                      >
                        下一页
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex flex-1 overflow-hidden">
      {/* 侧边栏 */}
      <div className="w-80 border-r border-slate-200/80 bg-white shadow-elegant">
        <div className="flex h-full flex-col">
          <div className="border-b border-slate-200/60 p-6 bg-blue-100/60">
            <h1 className="text-2xl font-bold flex items-center gap-2 text-blue-700">
              <BookOpen className="h-6 w-6 text-blue-700" />
              南网智能体v1.0
            </h1>
          </div>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "chat" | "kb")} className="flex-1 flex flex-col">
            <div className="px-4 pt-4">
              <TabsList className="grid w-full grid-cols-2 bg-slate-100/80 p-1 rounded-lg shadow-inner">
                <TabsTrigger value="chat" className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200">
                  <MessageCircle className="h-4 w-4" />
                  对话
                </TabsTrigger>
                <TabsTrigger value="kb" className="flex items-center gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200">
                  <BookOpen className="h-4 w-4" />
                  知识库
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="chat" className="flex-1 mt-4 px-4">
              <div className="space-y-4">
                <Label className="text-sm font-semibold text-slate-700">选择知识库</Label>
                <Select
                  value={selectedKbId?.toString() || ""}
                  onValueChange={(value) => setSelectedKbId(Number(value))}
                >
                  <SelectTrigger className="bg-white border-slate-200 shadow-sm hover:border-blue-400 transition-colors">
                    <SelectValue placeholder="请选择知识库" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200 shadow-soft">
                    {knowledgeBases.map((kb) => (
                      <SelectItem key={kb.id} value={kb.id.toString()} className="hover:bg-blue-100 focus:bg-blue-100">
                        {kb.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="kb" className="flex-1 mt-4 px-4 space-y-4 overflow-y-auto">
              <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
                setIsCreateDialogOpen(open);
                if (!open) {
                  setNewKbName("");
                  setNewKbDescription("");
                }
              }}>
                <DialogTrigger asChild>
                  <Button className="w-full gap-2 bg-purple-700 text-white hover:bg-purple-800 shadow-md">
                    <Plus className="h-4 w-4" />
                    创建知识库
                  </Button>
                </DialogTrigger>
                <DialogContent className="!bg-white border-slate-200 shadow-soft">
                  <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-3 rounded-xl bg-blue-600 shadow-md">
                        <BookOpen className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <DialogTitle className="text-xl font-bold text-slate-800">创建知识库</DialogTitle>
                        <DialogDescription className="mt-1 text-slate-600">
                          创建一个新的知识库来管理您的文档
                        </DialogDescription>
                      </div>
                    </div>
                  </DialogHeader>
                  <div className="space-y-5 py-4">
                    <div className="space-y-2.5">
                      <Label htmlFor="name" className="text-sm font-semibold text-slate-700">
                        知识库名称 <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="name"
                        placeholder="请输入知识库名称"
                        value={newKbName}
                        onChange={(e) => setNewKbName(e.target.value)}
                        className="h-10 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-300"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && newKbName.trim()) {
                            createKnowledgeBase();
                          }
                        }}
                      />
                      <p className="text-xs text-slate-500">
                        知识库名称用于标识和管理您的文档集合
                      </p>
                    </div>
                    <div className="space-y-2.5">
                      <Label htmlFor="description" className="text-sm font-semibold text-slate-700">
                        描述 <span className="text-slate-400 text-xs font-normal">（可选）</span>
                      </Label>
                      <Textarea
                        id="description"
                        placeholder="请输入知识库的描述信息，帮助您更好地识别和管理"
                        value={newKbDescription}
                        onChange={(e) => setNewKbDescription(e.target.value)}
                        rows={3}
                        className="resize-none border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-300"
                      />
                      <p className="text-xs text-slate-500">
                        添加描述可以帮助您更好地组织和识别知识库
                      </p>
                    </div>
                  </div>
                  <DialogFooter className="gap-2 sm:gap-0 border-t border-slate-200 pt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setIsCreateDialogOpen(false)}
                      className="border-slate-300 hover:bg-slate-50"
                    >
                      取消
                    </Button>
                    <Button 
                      onClick={createKnowledgeBase}
                      disabled={!newKbName.trim()}
                      className="gap-2 bg-blue-700 text-white hover:bg-blue-800 shadow-md"
                    >
                      <Plus className="h-4 w-4" />
                      创建知识库
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">知识库列表</Label>
                <div className="space-y-2">
                  {knowledgeBases.map((kb) => (
                    <Card
                      key={kb.id}
                      className={`cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md ${
                        selectedKbId === kb.id 
                          ? "border-2 border-blue-600 bg-blue-100 shadow-md" 
                          : "border border-slate-200 hover:border-blue-400 bg-white"
                      }`}
                      onClick={() => setSelectedKbId(kb.id)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className={`text-base ${selectedKbId === kb.id ? "text-blue-800" : "text-slate-800"}`}>{kb.name}</CardTitle>
                            <CardDescription className="text-xs mt-1 flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              {kb.doc_count} 个文档
                            </CardDescription>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-red-50 hover:text-red-600 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteKnowledgeBase(kb.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col bg-white">
        {activeTab === "chat" ? (
          <>
            {/* 消息列表 */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center p-8 rounded-2xl bg-blue-100 border border-blue-200 shadow-soft">
                    <div className="p-4 rounded-full bg-blue-600 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <MessageCircle className="h-8 w-8 text-white" />
                    </div>
                    <p className="text-slate-600 font-medium">开始对话吧！选择一个知识库后输入您的问题。</p>
                  </div>
                </div>
              )}
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
                >
                  <Card className={`max-w-3xl shadow-elegant ${
                    msg.role === "user" 
                      ? "bg-blue-700 text-white border-0" 
                      : "bg-white border-slate-200"
                  }`}>
                    <CardContent className="p-5">
                      {msg.role === "assistant" && !msg.content && isLoading ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-muted-foreground">正在思考...</span>
                        </div>
                      ) : (
                        <div className="whitespace-pre-wrap break-words">
                          {msg.content}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  {/* 显示来源文档下载按钮（只显示匹配度最高的一个文档，确保有且只有一个） */}
                  {msg.role === "assistant" && 
                   msg.documents && 
                   Array.isArray(msg.documents) && 
                   msg.documents.length === 1 && 
                   msg.documents[0]?.id && (
                    <div className="mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs bg-white border-blue-300 text-blue-800 hover:bg-blue-100 hover:border-blue-400 shadow-sm"
                        onClick={async () => {
                          try {
                            // 确保只取第一个文档（匹配度最高的，且是问答中实际使用的）
                            const doc = msg.documents![0];
                            
                            // 验证文档信息
                            if (!doc || !doc.id) {
                              throw new Error("文档信息无效");
                            }
                            
                            console.log("开始下载文档:", doc);
                            
                            const response = await fetch(`${API_BASE_URL}/document/download`, {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ id: doc.id }),
                            });
                            
                            if (!response.ok) {
                              const errorText = await response.text();
                              throw new Error(`下载失败: ${response.status} ${response.statusText} - ${errorText}`);
                            }
                            
                            // 获取blob并下载
                            const blob = await response.blob();
                            
                            // 验证blob是否有效
                            if (!blob || blob.size === 0) {
                              throw new Error("下载的文件为空");
                            }
                            
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement("a");
                            a.href = url;
                            // 使用文档名称，如果没有则使用默认名称
                            const filename = doc.name || `文档_${doc.id}.pdf`;
                            a.download = filename;
                            document.body.appendChild(a);
                            a.click();
                            
                            // 清理
                            setTimeout(() => {
                              window.URL.revokeObjectURL(url);
                              document.body.removeChild(a);
                            }, 100);
                            
                            console.log("文档下载成功:", filename);
                          } catch (error) {
                            console.error("下载文档失败:", error);
                            const errorMessage = error instanceof Error ? error.message : "下载文档失败，请稍后重试";
                            alert(errorMessage);
                          }
                        }}
                      >
                        <Download className="h-3 w-3 mr-1.5" />
                        {msg.documents[0].name || `文档_${msg.documents[0].id}`}
                      </Button>
                    </div>
                  )}
                  {/* 如果未找到答案，显示"添加企业"链接 */}
                  {msg.role === "assistant" && msg.content && !isLoading && isNoAnswerFound(msg.content) && (
                    <div className="mt-3">
                      <button
                        onClick={() => setIsCompanyDataSheetOpen(true)}
                        className="text-xs text-blue-700 hover:text-blue-900 hover:underline cursor-pointer bg-transparent border-none p-0 font-medium transition-colors"
                      >
                        添加企业
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {/* 滚动锚点 */}
              <div ref={messagesEndRef} />
            </div>

            {/* 输入框 */}
            <div className="border-t border-slate-200/80 bg-white p-6 shadow-soft">
              <div className="flex gap-3 max-w-6xl mx-auto">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                  placeholder="输入您的问题..."
                  disabled={isLoading || !selectedKbId}
                  className="flex-1 h-16 text-base border-slate-200 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-300 bg-white rounded-xl"
                />
                <Button
                  onClick={sendMessage}
                  disabled={isLoading || !selectedKbId}
                  size="icon"
                  className="h-16 w-16 bg-blue-700 hover:bg-blue-800 text-white shadow-md rounded-xl transition-all duration-200"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 overflow-y-auto p-6">
            {selectedKbId ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between p-6 rounded-xl bg-white border border-slate-200 shadow-elegant">
                  <div>
                    <h2 className="text-2xl font-bold text-blue-700">
                      {knowledgeBases.find((kb) => kb.id === selectedKbId)?.name}
                    </h2>
                    <p className="text-slate-600 mt-2 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      {knowledgeBases.find((kb) => kb.id === selectedKbId)?.description || "暂无描述"}
                    </p>
                  </div>
                  <label>
                    <Button asChild variant="outline" className="bg-blue-700 text-white hover:bg-blue-800 border-0 shadow-md">
                      <span>
                        <Upload className="h-4 w-4 mr-2" />
                        上传文档
                      </span>
                    </Button>
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.docx,.txt"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          uploadDocument(file, selectedKbId);
                        }
                      }}
                    />
                  </label>
                </div>

                <Separator className="bg-slate-200" />

                <div className="space-y-3">
                  {documents.length === 0 ? (
                    <Card className="border-2 border-dashed border-slate-300 bg-slate-50">
                      <CardContent className="p-12 text-center">
                        <div className="p-4 rounded-full bg-blue-200 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                          <FileText className="h-8 w-8 text-blue-700" />
                        </div>
                        <p className="text-slate-600 font-medium">暂无文档，请上传文档</p>
                      </CardContent>
                    </Card>
                  ) : (
                    documents.map((doc) => (
                      <Card key={doc.id} className="shadow-elegant hover:shadow-md transition-shadow border-slate-200">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 rounded-lg bg-blue-200">
                                  <FileText className="h-5 w-5 text-blue-700" />
                                </div>
                                <CardTitle className="text-lg text-slate-800">{doc.name}</CardTitle>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-slate-600 ml-9">
                                <span className="px-2 py-0.5 rounded bg-slate-100">{doc.file_type}</span>
                                <span>{(doc.file_size / 1024).toFixed(2)} KB</span>
                                <span>{doc.chunk_count} 个分块</span>
                                {getStatusBadge(doc.status)}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {doc.status === "pending" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => startParseDocument(doc.id)}
                                  disabled={parsingDocId === doc.id}
                                  className="bg-blue-600 text-white hover:bg-blue-700 border-0 shadow-sm"
                                >
                                  {parsingDocId === doc.id ? (
                                    <>
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                      解析中...
                                    </>
                                  ) : (
                                    "开始解析"
                                  )}
                                </Button>
                              )}
                              {doc.status === "failed" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => startParseDocument(doc.id)}
                                  disabled={parsingDocId === doc.id}
                                  className="bg-orange-600 text-white hover:bg-orange-700 border-0 shadow-sm"
                                >
                                  {parsingDocId === doc.id ? (
                                    <>
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                      解析中...
                                    </>
                                  ) : (
                                    "重新解析"
                                  )}
                                </Button>
                              )}
                              {doc.status === "completed" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => reparseDocument(doc.id)}
                                  disabled={parsingDocId === doc.id}
                                  className="bg-green-600 text-white hover:bg-green-700 border-0 shadow-sm"
                                >
                                  {parsingDocId === doc.id ? (
                                    <>
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                      重新解析中...
                                    </>
                                  ) : (
                                    "重新解析"
                                  )}
                                </Button>
                              )}
                              {doc.status === "processing" && (
                                <div className="flex items-center gap-2 text-sm text-blue-700 px-3 py-1.5 rounded-lg bg-blue-100">
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  <span>解析中...</span>
                                </div>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteDocument(doc.id)}
                                className="hover:bg-red-50 hover:text-red-600 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <Card className="border-2 border-dashed border-slate-300 bg-slate-50">
                <CardContent className="p-12 text-center">
                  <div className="p-4 rounded-full bg-indigo-200 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <BookOpen className="h-8 w-8 text-indigo-700" />
                  </div>
                  <p className="text-slate-600 font-medium">请先选择一个知识库</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
      </div>
      
      {/* 企业数据录入滑窗 */}
      <CompanyDataSheet 
        open={isCompanyDataSheetOpen} 
        onOpenChange={setIsCompanyDataSheetOpen} 
      />
    </div>
  );
}
