import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, RefreshCcw, Copy, Check, Sparkles, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { useAIChat } from "../hooks/use-ai-coach";
import type { ChatMessage } from "../types";

const initialGreetingMessage: ChatMessage = {
  id: "msg-welcome",
  sender: "assistant",
  content:
    "Hello! I am your local **CareerOS AI Coach**, powered by local Ollama. Ask me anything about resume optimization, interview prep, salary negotiation, or technical career growth.",
  timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  model: "ollama (local)",
};

export function AIChatInterface() {
  const toast = useToast();
  const chatMutation = useAIChat();
  const [messages, setMessages] = useState<ChatMessage[]>([initialGreetingMessage]);
  const [inputPrompt, setInputPrompt] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, chatMutation.isPending]);

  const handleSend = async (customPrompt?: string) => {
    const promptToSend = (customPrompt || inputPrompt).trim();
    if (!promptToSend || chatMutation.isPending) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      content: promptToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setInputPrompt("");

    try {
      const res = await chatMutation.mutateAsync({ prompt: promptToSend, feature: "career_chat" });

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: "assistant",
        content: res.response,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        model: res.model,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to communicate with local Ollama server.";
      const errAssistantMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        sender: "assistant",
        content: `⚠️ **Ollama Error:** ${errorMsg}\n\nPlease verify that local Ollama is running and accessible.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        error: true,
      };
      setMessages((prev) => [...prev, errAssistantMsg]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  const handleCopy = (id: string, text: string) => {
    void navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied to Clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRetryLast = () => {
    const lastUserMsg = [...messages].reverse().find((m) => m.sender === "user");
    if (lastUserMsg) {
      void handleSend(lastUserMsg.content);
    }
  };

  return (
    <Card className="flex flex-col h-[680px] border-indigo-500/20 bg-card/90 overflow-hidden shadow-2xl">
      {/* Header Flightdeck */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/80 bg-surface/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-primary flex items-center gap-2">
              CareerOS AI Advisor
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </h3>
            <p className="text-[11px] text-secondary">
              Powered by local Ollama server • Confidential & Private
            </p>
          </div>
        </div>

        <Badge tone="info" className="text-[10px] font-mono uppercase">
          Local Ollama Engine
        </Badge>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.sender === "user";
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : msg.error
                    ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                    : "bg-surface border border-indigo-500/30 text-indigo-400"
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[80%] rounded-2xl p-4 text-xs leading-relaxed space-y-2 relative group ${
                  isUser
                    ? "bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-600/20"
                    : msg.error
                    ? "bg-rose-500/10 border border-rose-500/30 text-rose-200 rounded-tl-none"
                    : "bg-surface/90 border border-border/80 text-primary rounded-tl-none shadow-sm"
                }`}
              >
                <div className="whitespace-pre-wrap font-sans">{msg.content}</div>

                <div
                  className={`flex items-center justify-between pt-1 border-t ${
                    isUser ? "border-white/20 text-indigo-200" : "border-border/40 text-secondary"
                  } text-[10px]`}
                >
                  <span className="font-mono">{msg.timestamp}</span>
                  {!isUser && !msg.error && (
                    <div className="flex items-center gap-2">
                      {msg.model && <span className="font-mono text-[9px] opacity-70">{msg.model}</span>}
                      <button
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="hover:text-primary transition-colors"
                        title="Copy message"
                      >
                        {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {chatMutation.isPending && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-surface border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 animate-bounce" />
            </div>
            <div className="bg-surface/90 border border-border/80 rounded-2xl rounded-tl-none p-4 text-xs text-secondary flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400 animate-spin" />
              <span>Ollama is thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form Bar */}
      <div className="p-4 border-t border-border/80 bg-surface/80 backdrop-blur-md space-y-3">
        {chatMutation.isError && (
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
            <span className="flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" /> Failed to send message to Ollama.
            </span>
            <Button variant="ghost" size="sm" onClick={handleRetryLast} className="h-7 text-xs flex items-center gap-1 text-rose-300">
              <RefreshCcw className="w-3 h-3" /> Retry
            </Button>
          </div>
        )}

        <div className="relative flex items-center">
          <textarea
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask AI Career Coach... (Press Enter to send, Shift+Enter for newline)"
            rows={2}
            className="w-full pl-4 pr-14 py-3 text-xs bg-surface border border-border/80 rounded-xl text-primary placeholder:text-secondary focus:outline-none focus:border-indigo-500/50 resize-none"
          />
          <Button
            variant="gradient"
            size="sm"
            onClick={() => handleSend()}
            disabled={!inputPrompt.trim() || chatMutation.isPending}
            className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 p-0 rounded-lg flex items-center justify-center"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
