"use client";

import type { ChatMessage } from "@/lib/types";

interface MessageBubbleProps {
  message: ChatMessage;
  isStreaming?: boolean;
}

export default function MessageBubble({
  message,
  isStreaming = false,
}: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"} animate-fade-in`}
    >
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm sm:max-w-[75%] ${
          isUser
            ? "bubble-user rounded-br-md"
            : "bubble-assistant rounded-bl-md"
        }`}
      >
        <p className="mb-1 text-[10px] font-bold uppercase tracking-widest opacity-70">
          {isUser ? "You" : "Coach"}
        </p>
        <p className="whitespace-pre-wrap text-sm leading-relaxed sm:text-base">
          {message.content}
          {isStreaming && (
            <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-current align-middle" />
          )}
        </p>
      </div>
    </div>
  );
}
