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
        <div className="min-h-screen bg-white text-black flex flex-col">
            {/* Header */}
            <header className="border-b border-gray-200 py-4 px-6">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <h1 className="text-xl font-semibold">AI Assistant</h1>
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-sm font-medium">AI</span>
                    </div>
                </div>
            </header>

            {/* Chat Container */}
            <main className="flex-1 py-6 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="space-y-6">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                                        message.role === "user"
                                            ? "bg-black text-white rounded-br-none"
                                            : "bg-gray-100 text-black rounded-bl-none"
                                    }`}
                                >
                                    <p className="whitespace-pre-wrap">
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
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-gray-100 text-black rounded-2xl rounded-bl-none px-4 py-3">
                                    <div className="flex space-x-2">
                                        <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce"></div>
                                        <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce delay-75"></div>
                                        <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce delay-150"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>
            </main>

            {/* Input Area */}
            <footer className="border-t border-gray-200 py-4 px-4">
                <div className="max-w-4xl mx-auto">
                    <form onSubmit={handleSubmit} className="flex gap-2">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Type your message..."
                            className="flex-1 border border-gray-300 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !inputValue.trim()}
                            className={`bg-black text-white rounded-full w-12 h-12 flex items-center justify-center ${
                                isLoading || !inputValue.trim()
                                    ? "opacity-50 cursor-not-allowed"
                                    : "hover:bg-gray-800"
                            }`}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="w-5 h-5"
                            >
                                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                            </svg>
                        </button>
                    </form>
                    <p className="text-center text-xs text-gray-500 mt-2">
                        AI Chat Interface • Black & White Theme
                    </p>
                </div>
            </footer>
        </div>
    );
}
