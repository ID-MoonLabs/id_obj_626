"use client";

import { useState, useEffect, useRef } from "react";
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
import { MessageCircle, BookOpen, Upload, Trash2, FileText, Plus, Loader2, Send, Download } from "lucide-react";

const API_BASE_URL = "http://10.26.9.48:18080/b/ibot";

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

export default function Home() {
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
        startParseDocument(result.data.id);
      } else {
        alert(result.msg);
      }
    } catch (error) {
      console.error("上传文档失败:", error);
      alert("上传失败");
    }
  };

  const startParseDocument = async (docId: number) => {
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
      }
    } catch (error) {
      console.error("开始解析失败:", error);
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
            loadDocuments(selectedKbId!);
          }
        }
      } catch (error) {
        clearInterval(interval);
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

  return (
    <div className="flex h-screen bg-background">
      {/* 侧边栏 */}
      <div className="w-80 border-r bg-card">
        <div className="flex h-full flex-col">
          <div className="border-b p-6">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <BookOpen className="h-6 w-6" />
              RAG知识库系统
            </h1>
          </div>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "chat" | "kb")} className="flex-1 flex flex-col">
            <div className="px-4 pt-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="chat" className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  对话
                </TabsTrigger>
                <TabsTrigger value="kb" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  知识库
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="chat" className="flex-1 mt-4 px-4">
              <div className="space-y-4">
                <Label>选择知识库</Label>
                <Select
                  value={selectedKbId?.toString() || ""}
                  onValueChange={(value) => setSelectedKbId(Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="请选择知识库" />
                  </SelectTrigger>
                  <SelectContent>
                    {knowledgeBases.map((kb) => (
                      <SelectItem key={kb.id} value={kb.id.toString()}>
                        {kb.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="kb" className="flex-1 mt-4 px-4 space-y-4 overflow-y-auto">
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    创建知识库
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>创建知识库</DialogTitle>
                    <DialogDescription>
                      创建一个新的知识库来管理您的文档
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">知识库名称</Label>
                      <Input
                        id="name"
                        placeholder="请输入知识库名称"
                        value={newKbName}
                        onChange={(e) => setNewKbName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">描述（可选）</Label>
                      <Textarea
                        id="description"
                        placeholder="请输入描述"
                        value={newKbDescription}
                        onChange={(e) => setNewKbDescription(e.target.value)}
                        rows={3}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      取消
                    </Button>
                    <Button onClick={createKnowledgeBase}>创建</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <div className="space-y-2">
                <Label>知识库列表</Label>
                <div className="space-y-2">
                  {knowledgeBases.map((kb) => (
                    <Card
                      key={kb.id}
                      className={`cursor-pointer transition-colors ${
                        selectedKbId === kb.id ? "border-primary bg-primary/5" : ""
                      }`}
                      onClick={() => setSelectedKbId(kb.id)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-base">{kb.name}</CardTitle>
                            <CardDescription className="text-xs mt-1">
                              {kb.doc_count} 个文档
                            </CardDescription>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteKnowledgeBase(kb.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
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
      <div className="flex-1 flex flex-col">
        {activeTab === "chat" ? (
          <>
            {/* 消息列表 */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 && (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>开始对话吧！选择一个知识库后输入您的问题。</p>
                  </div>
                </div>
              )}
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
                >
                  <Card className={`max-w-3xl ${msg.role === "user" ? "bg-primary text-primary-foreground" : ""}`}>
                    <CardContent className="p-4">
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
                  {/* 显示来源文档下载按钮（只显示匹配度最高的一个文档） */}
                  {msg.role === "assistant" && msg.documents && msg.documents.length > 0 && (
                    <div className="mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          try {
                            // 只取第一个文档（匹配度最高的）
                            const doc = msg.documents![0];
                            console.log("开始下载文档:", doc);
                            
                            const response = await fetch(`${API_BASE_URL}/document/download`, {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ id: doc.id }),
                            });
                            
                            if (!response.ok) {
                              throw new Error(`下载失败: ${response.status} ${response.statusText}`);
                            }
                            
                            // 获取blob并下载
                            const blob = await response.blob();
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement("a");
                            a.href = url;
                            a.download = doc.name || `文档_${doc.id}`;
                            document.body.appendChild(a);
                            a.click();
                            window.URL.revokeObjectURL(url);
                            document.body.removeChild(a);
                            console.log("文档下载成功:", doc.name);
                          } catch (error) {
                            console.error("下载文档失败:", error);
                            alert("下载文档失败，请稍后重试");
                          }
                        }}
                        className="text-xs"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        {msg.documents[0].name || `文档_${msg.documents[0].id}`}
                      </Button>
                    </div>
                  )}
                </div>
              ))}
              {/* 滚动锚点 */}
              <div ref={messagesEndRef} />
            </div>

            {/* 输入框 */}
            <div className="border-t p-4">
              <div className="flex gap-2 max-w-4xl mx-auto">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                  placeholder="输入您的问题..."
                  disabled={isLoading || !selectedKbId}
                  className="flex-1"
                />
                <Button
                  onClick={sendMessage}
                  disabled={isLoading || !selectedKbId}
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 overflow-y-auto p-6">
            {selectedKbId ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">
                      {knowledgeBases.find((kb) => kb.id === selectedKbId)?.name}
                    </h2>
                    <p className="text-muted-foreground mt-1">
                      {knowledgeBases.find((kb) => kb.id === selectedKbId)?.description || "暂无描述"}
                    </p>
                  </div>
                  <label>
                    <Button asChild variant="outline">
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

                <Separator />

                <div className="space-y-2">
                  {documents.length === 0 ? (
                    <Card>
                      <CardContent className="p-12 text-center text-muted-foreground">
                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>暂无文档，请上传文档</p>
                      </CardContent>
                    </Card>
                  ) : (
                    documents.map((doc) => (
                      <Card key={doc.id}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <FileText className="h-5 w-5 text-muted-foreground" />
                                <CardTitle className="text-lg">{doc.name}</CardTitle>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>{doc.file_type}</span>
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
                                >
                                  开始解析
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteDocument(doc.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
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
              <Card>
                <CardContent className="p-12 text-center text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>请先选择一个知识库</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
