"use client";

import { useState, useRef, useEffect } from "react";

type Message = {
    id: string;
    content: string;
    role: "user" | "assistant";
    timestamp: Date;
};

export default function Home() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            content: "Hello! How can I assist you today?",
            role: "assistant",
            timestamp: new Date(),
        },
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        // Add user message
        const userMessage: Message = {
            id: Date.now().toString(),
            content: inputValue,
            role: "user",
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputValue("");
        setIsLoading(true);

        try {
            // Simulate API call to AI service
            await new Promise((resolve) => setTimeout(resolve, 1000));

            // Add assistant response
            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                content: `I received your message: "${inputValue}". This is a simulated response from the AI assistant.`,
                role: "assistant",
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, assistantMessage]);
        } catch (error) {
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                content:
                    "Sorry, I encountered an error processing your request.",
                role: "assistant",
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="border-b border-gray-200 bg-white py-4 px-4 sm:px-6 lg:px-8 shadow-sm">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-black to-gray-700 flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                                AI
                            </span>
                        </div>
                        <h1 className="text-lg font-semibold text-gray-900">
                            AI Assistant
                        </h1>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 text-gray-600"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            </header>

            {/* Chat Container */}
            <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        {/* Chat Header */}
                        <div className="border-b border-gray-200 px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">
                                        AI Chat Interface
                                    </h2>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Ask anything, I'm here to help
                                    </p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        Online
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="h-[500px] overflow-y-auto p-4 bg-gray-50">
                            <div className="space-y-4">
                                {messages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                                    >
                                        <div
                                            className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                                                message.role === "user"
                                                    ? "bg-black text-white rounded-br-none"
                                                    : "bg-white text-gray-900 rounded-bl-none border border-gray-200 shadow-sm"
                                            }`}
                                        >
                                            <div className="flex items-start space-x-2">
                                                {message.role ===
                                                    "assistant" && (
                                                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-black to-gray-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                        <span className="text-white text-xs font-bold">
                                                            AI
                                                        </span>
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="whitespace-pre-wrap text-sm">
                                                        {message.content}
                                                    </p>
                                                    <p
                                                        className={`text-xs mt-1 ${message.role === "user" ? "text-gray-300" : "text-gray-500"}`}
                                                    >
                                                        {message.timestamp.toLocaleTimeString(
                                                            [],
                                                            {
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                            },
                                                        )}
                                                    </p>
                                                </div>
                                                {message.role === "user" && (
                                                    <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                        <span className="text-gray-700 text-xs font-bold">
                                                            U
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {isLoading && (
                                    <div className="flex justify-start">
                                        <div className="bg-white text-gray-900 rounded-2xl rounded-bl-none px-4 py-3 max-w-[85%] border border-gray-200 shadow-sm">
                                            <div className="flex items-center space-x-2">
                                                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-black to-gray-700 flex items-center justify-center flex-shrink-0">
                                                    <span className="text-white text-xs font-bold">
                                                        AI
                                                    </span>
                                                </div>
                                                <div className="flex space-x-1">
                                                    <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce"></div>
                                                    <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce delay-75"></div>
                                                    <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce delay-150"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Input Area */}
            <footer className="border-t border-gray-200 bg-white py-4 px-4 sm:px-6 lg:px-8 shadow-sm">
                <div className="max-w-4xl mx-auto">
                    <form onSubmit={handleSubmit} className="flex gap-3">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Message AI Assistant..."
                                className="w-full pl-4 pr-12 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent shadow-sm text-sm transition-all duration-200"
                                disabled={isLoading}
                            />
                            <button
                                type="submit"
                                disabled={isLoading || !inputValue.trim()}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 w-10 h-10 rounded-full bg-black hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors duration-200"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    className="w-4 h-4 text-white"
                                >
                                    <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                                </svg>
                            </button>
                        </div>
                    </form>
                    <p className="text-center text-xs text-gray-500 mt-3">
                        AI Chat Interface • Black & White Theme
                    </p>
                </div>
            </footer>
        </div>
    );
}
