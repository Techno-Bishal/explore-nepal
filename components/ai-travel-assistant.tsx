"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  MessageCircle, Send, X, Sparkles, Loader2, Bot, User,
  Mountain, Compass, Heart, Sunrise, Map, ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const QUICK_PROMPTS = [
  { icon: Mountain, label: "Peaceful mountains", prompt: "Suggest peaceful mountain destinations in Nepal for a relaxing getaway" },
  { icon: Compass, label: "Adventure trips", prompt: "What are the best adventure destinations in Nepal?" },
  { icon: Heart, label: "Romantic places", prompt: "Recommend romantic places in Nepal for couples" },
  { icon: Sunrise, label: "Hidden gems", prompt: "What are some underrated hidden gems in Nepal most tourists miss?" },
  { icon: Map, label: "Budget travel", prompt: "Best low budget trip ideas in Nepal" },
];

function parseMarkdown(text: string): string {
  let html = text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/^### (.+)$/gm, '<h4 class="font-semibold text-base mt-3 mb-1">$1</h4>')
    .replace(/^## (.+)$/gm, '<h3 class="font-semibold text-lg mt-3 mb-1">$1</h3>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal">$1</li>')
    .replace(/\n\n/g, "<br/><br/>")
    .replace(/\n/g, "<br/>");
  return html;
}

export function AITravelAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView?.({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent, scrollToBottom]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content?.trim() || loading) return;
    const userMsg: Message = { role: "user", content: content.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setStreamingContent("");

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!res?.ok) throw new Error("AI service error");

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";
      let partialRead = "";

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;
        partialRead += decoder.decode(value, { stream: true });
        const lines = partialRead.split("\n");
        partialRead = lines.pop() ?? "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;
            try {
              const parsed = JSON.parse(data);
              const delta = parsed?.choices?.[0]?.delta?.content ?? "";
              if (delta) {
                fullContent += delta;
                setStreamingContent(fullContent);
              }
            } catch { /* skip */ }
          }
        }
      }

      setMessages((prev) => [...prev, { role: "assistant", content: fullContent || "I apologize, I could not generate a response. Please try again." }]);
      setStreamingContent("");
    } catch (err: any) {
      console.error("AI chat error:", err);
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I encountered an error. Please try again." }]);
      setStreamingContent("");
    } finally {
      setLoading(false);
    }
  }, [messages, loading]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
            onClick={() => setIsOpen(true)}
            aria-haspopup="dialog"
            aria-label="Open AI Travel Assistant chat"
            title="AI Travel Assistant"
            className="fixed bottom-6 right-6 z-50 flex items-center justify-center bg-gradient-to-r from-primary to-teal-600 text-white h-14 w-14 rounded-full shadow-xl hover:shadow-2xl transition-all hover:scale-110"
          >
            <Sparkles className="h-6 w-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 1, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-[400px] max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-4rem)] flex flex-col bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary to-teal-600 text-white">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">AI Travel Assistant</h3>
                  <p className="text-xs text-white/70">Your Nepal travel expert</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-white hover:bg-white/20 h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && !streamingContent && (
                <div className="text-center py-6">
                  <div className="h-14 w-14 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Sparkles className="h-7 w-7 text-primary" />
                  </div>
                  <h4 className="font-semibold text-base mb-1">Namaste! \ud83d\ude4f</h4>
                  <p className="text-sm text-muted-foreground mb-5">Ask me anything about traveling in Nepal</p>
                  <div className="space-y-2">
                    {QUICK_PROMPTS.map((qp, i) => (
                      <button
                        key={i}
                        onClick={() => sendMessage(qp.prompt)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-primary/5 text-left transition-all text-sm group"
                      >
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                          <qp.icon className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-foreground">{qp.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "assistant" && (
                    <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}>
                    {msg.role === "assistant" ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.content) }} />
                    ) : (
                      <p>{msg.content}</p>
                    )}
                  </div>
                  {msg.role === "user" && (
                    <div className="h-7 w-7 rounded-full bg-secondary/20 flex items-center justify-center shrink-0 mt-0.5">
                      <User className="h-4 w-4 text-secondary" />
                    </div>
                  )}
                </div>
              ))}

              {streamingContent && (
                <div className="flex gap-3 justify-start">
                  <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="max-w-[85%] rounded-2xl px-4 py-2.5 text-sm bg-muted leading-relaxed">
                    <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: parseMarkdown(streamingContent) }} />
                  </div>
                </div>
              )}

              {loading && !streamingContent && (
                <div className="flex gap-3 justify-start">
                  <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="bg-muted rounded-2xl px-4 py-3 flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">Thinking...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-border bg-card">
              <div className="flex gap-2 items-end">
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target?.value ?? "")}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about Nepal..."
                  className="min-h-[40px] max-h-[100px] resize-none text-sm rounded-xl border-border/50"
                  rows={1}
                />
                <Button
                  onClick={() => sendMessage(input)}
                  disabled={!input?.trim() || loading}
                  size="icon"
                  className="shrink-0 h-10 w-10 rounded-xl bg-primary hover:bg-primary/90"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
