"use client";

import * as React from "react";
import { toast } from "sonner";
import { Sparkles, Send, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "Quais leads devo contatar hoje?",
  "Quantos leads estão em negociação?",
  "Quais leads ainda não foram contatados?",
  "Crie uma mensagem de follow-up.",
];

export default function AssistentePage() {
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Oi! Eu só vejo os dados da sua própria conta — posso te ajudar com o seu pipeline, seus leads e mensagens. O que você quer saber?",
    },
  ]);
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;

    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    setLoading(true);

    const res = await fetch("/api/ai/assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast.error("Não foi possível consultar o assistente", { description: data.error });
      return;
    }

    const data = await res.json();
    setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-8.5rem)] max-w-3xl flex-col">
      <Card className="flex flex-1 flex-col overflow-hidden">
        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-5">
          {messages.map((message, i) => (
            <div
              key={i}
              className={`flex items-start gap-2.5 ${message.role === "user" ? "justify-end" : ""}`}
            >
              {message.role === "assistant" && (
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-soft">
                  <Sparkles className="h-3.5 w-3.5 text-brand" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-lg px-3.5 py-2.5 text-sm leading-relaxed ${
                  message.role === "user"
                    ? "bg-brand text-white"
                    : "bg-surface-raised text-ink"
                }`}
              >
                {message.content}
              </div>
              {message.role === "user" && (
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-raised">
                  <User className="h-3.5 w-3.5 text-muted" />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-soft">
                <Sparkles className="h-3.5 w-3.5 text-brand" />
              </div>
              <div className="rounded-lg bg-surface-raised px-3.5 py-2.5 text-sm text-muted">
                Pensando…
              </div>
            </div>
          )}
        </div>

        {messages.length <= 1 && (
          <div className="flex flex-wrap gap-2 border-t border-border p-4">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                className="focus-ring rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted hover:bg-surface-raised hover:text-ink"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <CardContent className="border-t border-border p-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
            className="flex items-end gap-2"
          >
            <Textarea
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(input);
                }
              }}
              placeholder="Pergunte sobre seus leads e seu pipeline..."
              className="max-h-32 resize-none"
            />
            <Button type="submit" size="icon" loading={loading} aria-label="Enviar">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
