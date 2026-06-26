"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { checkBackendHealth, sendChatMessage } from "@/lib/api";
import type { ChatMessage } from "@/lib/types";
import MessageBubble from "./MessageBubble";
import SystemPromptPanel from "./SystemPromptPanel";

const DEFAULT_SYSTEM_PROMPT = "You are a supportive mental coach.";
const TYPEWRITER_MS = 12;

/** Reveals text character-by-character to mimic streaming when the API returns all at once. */
function useTypewriter(text: string, active: boolean): string {
  const [visibleLength, setVisibleLength] = useState(active ? 0 : text.length);

  useEffect(() => {
    if (!active) {
      setVisibleLength(text.length);
      return;
    }

    setVisibleLength(0);
    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setVisibleLength(index);
      if (index >= text.length) window.clearInterval(timer);
    }, TYPEWRITER_MS);

    return () => window.clearInterval(timer);
  }, [text, active]);

  return text.slice(0, visibleLength);
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [isPromptOpen, setIsPromptOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const displayedStream = useTypewriter(streamingText, isStreaming);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, displayedStream, scrollToBottom]);

  useEffect(() => {
    checkBackendHealth().then(setBackendOnline);
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage: ChatMessage = { role: "user", content: trimmed };
    const historyForRequest = messages;

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setError(null);
    setIsLoading(true);

    try {
      const reply = await sendChatMessage(
        trimmed,
        historyForRequest,
        systemPrompt,
      );

      setStreamingText(reply);
      setIsStreaming(true);

      await new Promise<void>((resolve) => {
        const duration = reply.length * TYPEWRITER_MS + 100;
        window.setTimeout(resolve, duration);
      });

      setIsStreaming(false);
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      setStreamingText("");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to reach the coach.";
      setError(message);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setStreamingText("");
    setIsStreaming(false);
    setError(null);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSubmit(event as unknown as FormEvent);
    }
  };

  return (
    <div className="mx-auto flex h-full w-full max-w-3xl flex-col gap-4 px-4 py-6 sm:px-6">
      <header className="relative overflow-hidden rounded-3xl border border-[var(--color-border)] bg-white/80 px-6 py-5 shadow-[var(--shadow-card)] backdrop-blur-md">
        <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[var(--gradient-sparkle)] opacity-60 blur-2xl" />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="badge-pop mb-2 inline-flex items-center gap-1">
              <span aria-hidden>★</span> Star Coach
            </p>
            <h1 className="font-display text-2xl font-bold tracking-tight text-[var(--color-glossy-black)] sm:text-3xl">
              Your glossy mental coach
            </h1>
            <p className="mt-1 max-w-md text-sm text-[var(--color-muted)]">
              Stress, motivation, habits, confidence — chat it out with a
              supportive AI coach.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                backendOnline === null
                  ? "bg-[var(--color-lavender)]/40 text-[var(--color-muted)]"
                  : backendOnline
                    ? "bg-[var(--color-icy-blue)]/30 text-[var(--color-electric-blue)]"
                    : "bg-[var(--color-hot-pink)]/15 text-[var(--color-hot-pink)]"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  backendOnline === null
                    ? "animate-pulse bg-[var(--color-muted)]"
                    : backendOnline
                      ? "bg-[var(--color-electric-blue)]"
                      : "bg-[var(--color-hot-pink)]"
                }`}
              />
              {backendOnline === null
                ? "Checking…"
                : backendOnline
                  ? "Backend online"
                  : "Backend offline"}
            </span>
          </div>
        </div>
      </header>

      <SystemPromptPanel
        value={systemPrompt}
        onChange={setSystemPrompt}
        defaultPrompt={DEFAULT_SYSTEM_PROMPT}
        isOpen={isPromptOpen}
        onToggle={() => setIsPromptOpen((open) => !open)}
      />

      <section
        aria-label="Conversation"
        className="flex min-h-[320px] flex-1 flex-col overflow-hidden rounded-3xl border border-[var(--color-border)] bg-white/60 shadow-[var(--shadow-card)] backdrop-blur-sm"
      >
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3">
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-muted)]">
            Conversation
          </p>
          {messages.length > 0 && (
            <button
              type="button"
              onClick={handleClearChat}
              className="text-xs font-semibold text-[var(--color-hot-pink)] transition hover:text-[var(--color-electric-blue)]"
            >
              Clear chat
            </button>
          )}
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
          {messages.length === 0 && !isStreaming && (
            <div className="flex h-full min-h-[240px] flex-col items-center justify-center gap-3 text-center">
              <span className="text-3xl sparkle" aria-hidden>
                ✧
              </span>
              <p className="max-w-xs text-sm text-[var(--color-muted)]">
                Say hi! Try: &ldquo;I&apos;m feeling overwhelmed today.&rdquo;
              </p>
            </div>
          )}

          {messages.map((message, index) => (
            <MessageBubble key={`${message.role}-${index}`} message={message} />
          ))}

          {isStreaming && streamingText && (
            <MessageBubble
              message={{ role: "assistant", content: displayedStream }}
              isStreaming={displayedStream.length < streamingText.length}
            />
          )}

          {isLoading && !isStreaming && (
            <div className="flex justify-start">
              <div className="bubble-assistant rounded-2xl rounded-bl-md px-4 py-3">
                <p className="text-xs font-bold uppercase tracking-widest opacity-70">
                  Coach
                </p>
                <div className="mt-2 flex gap-1">
                  {[0, 1, 2].map((dot) => (
                    <span
                      key={dot}
                      className="h-2 w-2 animate-bounce rounded-full bg-[var(--color-hot-pink)]"
                      style={{ animationDelay: `${dot * 150}ms` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {error && (
          <div
            role="alert"
            className="mx-4 mb-4 rounded-xl border border-[var(--color-hot-pink)]/30 bg-[var(--color-hot-pink)]/10 px-4 py-3 text-sm text-[var(--color-hot-pink)]"
          >
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="border-t border-[var(--color-border)] p-4"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message… (Enter to send, Shift+Enter for new line)"
              rows={2}
              disabled={isLoading}
              className="input-glossy min-h-[52px] flex-1 resize-none text-sm disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="btn-primary shrink-0 px-6 py-3 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? "Sending…" : "Send ✦"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
