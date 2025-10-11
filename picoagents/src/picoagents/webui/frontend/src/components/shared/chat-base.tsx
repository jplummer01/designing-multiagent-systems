/**
 * ChatBase - Rich chat interface for PicoAgents with multimodal support
 * Provides chat UI with message display, file upload, and rich content rendering
 */

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageInput } from "@/components/ui/message-input";
import { MessageRenderer } from "@/components/message_renderer";
import { User, Bot, Trash2 } from "lucide-react";
import type { Message, UserMessage } from "@/types";
import type { AttachmentItem } from "@/components/ui/attachment-gallery";
import { createMultiModalMessage } from "@/utils/message-utils";

interface ChatBaseProps {
  messages: Message[];
  onSendMessage: (messages: Message[]) => Promise<void>; // Updated to accept Message array
  onClearMessages: () => void;
  isStreaming: boolean;
  placeholder?: string;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
}

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
}

function MessageBubble({ message, isStreaming }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const Icon = isUser ? User : Bot;

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={`flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border ${
          isUser ? "bg-primary text-primary-foreground" : "bg-muted"
        }`}
      >
        <Icon className="h-4 w-4" />
      </div>

      <div
        className={`flex flex-col space-y-1 ${
          isUser ? "items-end" : "items-start"
        } max-w-[80%]`}
      >
        <div
          className={`rounded px-3 py-2 text-sm ${
            isUser ? "bg-primary text-primary-foreground" : "bg-muted"
          }`}
        >
          <MessageRenderer
            message={message}
            isStreaming={isStreaming}
          />
        </div>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border bg-muted">
        <Bot className="h-4 w-4" />
      </div>
      <div className="flex items-center space-x-1 rounded bg-muted px-3 py-2">
        <div className="flex space-x-1">
          <div className="h-2 w-2 animate-bounce rounded-full bg-current [animation-delay:-0.3s]" />
          <div className="h-2 w-2 animate-bounce rounded-full bg-current [animation-delay:-0.15s]" />
          <div className="h-2 w-2 animate-bounce rounded-full bg-current" />
        </div>
      </div>
    </div>
  );
}

export function ChatBase({
  messages,
  onSendMessage,
  onClearMessages,
  isStreaming,
  placeholder = "Type a message...",
  emptyStateTitle = "Start a conversation",
  emptyStateDescription = "Type a message below to begin",
}: ChatBaseProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  // Handle message sending with text and attachments
  const handleSendMessage = async (text: string, attachments: AttachmentItem[]) => {
    if ((!text.trim() && attachments.length === 0) || isSubmitting || isStreaming) {
      return;
    }

    setIsSubmitting(true);

    try {
      const messagesToSend: Message[] = [];

      if (attachments.length > 0) {
        // Send multimodal messages for attachments
        for (const attachment of attachments) {
          const multiModalMsg = await createMultiModalMessage(
            text || `Uploaded ${attachment.file.name}`,
            attachment.file,
            "user"
          );
          messagesToSend.push(multiModalMsg);
        }
      } else if (text.trim()) {
        // Send regular text message
        const userMsg: UserMessage = {
          role: "user",
          content: text.trim(),
          source: "user",
        };
        messagesToSend.push(userMsg);
      }

      await onSendMessage(messagesToSend);
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Messages */}
      <ScrollArea className="flex-1 min-h-0 p-4 overflow-auto" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <div className="text-muted-foreground text-sm">{emptyStateTitle}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {emptyStateDescription}
              </div>
            </div>
          ) : (
            <>
              {messages.map((message, index) => {
                // Check if this is the last message and streaming
                const isLastMessage = index === messages.length - 1;
                const shouldShowStreaming = isStreaming && isLastMessage && message.role === "assistant";

                return (
                  <MessageBubble
                    key={index}
                    message={message}
                    isStreaming={shouldShowStreaming}
                  />
                );
              })}
              {isStreaming && <TypingIndicator />}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Clear Messages Button */}
      {messages.length > 0 && (
        <div className="px-4 py-2 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={onClearMessages}
            disabled={isStreaming}
            className="gap-1"
          >
            <Trash2 className="h-3 w-3" />
            Clear Chat
          </Button>
        </div>
      )}

      {/* Enhanced Input with File Upload */}
      <MessageInput
        onSendMessage={handleSendMessage}
        disabled={isSubmitting || isStreaming}
        placeholder={placeholder}
      />
    </div>
  );
}