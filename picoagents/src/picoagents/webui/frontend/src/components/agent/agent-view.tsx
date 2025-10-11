/**
 * AgentView - Single agent chat interface for PicoAgents
 * Features: Chat interface, message streaming, PicoAgents message format
 */

import { useState, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { ChatBase } from "@/components/shared/chat-base";
import { SessionSwitcher } from "@/components/shared/session-switcher";
import {
  Bot,
  Brain,
  Wrench,
  Database,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { apiClient } from "@/services/api";
import type {
  AgentInfo,
  Message,
  StreamEvent,
  RunEntityRequest,
} from "@/types";

interface AgentViewProps {
  selectedAgent: AgentInfo;
  onDebugEvent: (event: StreamEvent) => void;
}

export function AgentView({ selectedAgent, onDebugEvent }: AgentViewProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | undefined>(
    undefined
  );

  // Load session messages when session changes
  const handleSessionChange = useCallback(
    async (sessionId: string | undefined) => {
      setCurrentSessionId(sessionId);

      if (sessionId) {
        // Load existing session messages
        try {
          const response = await apiClient.getSessionMessages(sessionId);
          setMessages(response.messages);
        } catch (error) {
          console.error("Failed to load session messages:", error);
          setMessages([]);
        }
      } else {
        // New session - clear messages
        setMessages([]);
      }
    },
    []
  );

  const handleSendMessage = useCallback(
    async (newMessages: Message[]) => {
      // Add new messages to state
      setMessages((prev) => [...prev, ...newMessages]);
      setIsStreaming(true);

      try {
        const request: RunEntityRequest = {
          messages: newMessages, // Send only NEW messages
          session_id: currentSessionId, // Backend will append to session
          stream_tokens: true,
        };

        let assistantMessage: Message = {
          role: "assistant",
          content: "",
          source: selectedAgent.name || selectedAgent.id,
        };

        setMessages((prev) => [...prev, assistantMessage]);

        for await (const event of apiClient.streamEntityExecution(
          selectedAgent.id,
          request
        )) {
          onDebugEvent(event);

          // Capture session_id from first event
          if (!currentSessionId && event.session_id) {
            setCurrentSessionId(event.session_id);
          }

          // Handle different event types
          if (event.type === "token_chunk") {
            // Handle streaming token chunks
            if (event.data?.content) {
              assistantMessage = {
                ...assistantMessage,
                content: assistantMessage.content + event.data.content,
              };

              setMessages((prev) => [...prev.slice(0, -1), assistantMessage]);
            }
          } else if (event.type === "message") {
            // Check if it's an assistant message (fallback for non-streaming)
            if (event.data?.role === "assistant" && event.data?.content) {
              assistantMessage = {
                role: "assistant",
                content: event.data.content,
                source:
                  event.data.source || selectedAgent.name || selectedAgent.id,
              };

              setMessages((prev) => [...prev.slice(0, -1), assistantMessage]);
            }
          } else if (event.type === "complete") {
            // Final response - update with complete message
            if (event.data?.messages) {
              const lastMessage =
                event.data.messages[event.data.messages.length - 1];
              if (lastMessage?.role === "assistant") {
                assistantMessage = {
                  role: "assistant",
                  content: lastMessage.content,
                  source:
                    lastMessage.source ||
                    selectedAgent.name ||
                    selectedAgent.id,
                };

                setMessages((prev) => [...prev.slice(0, -1), assistantMessage]);
              }
            }
            break;
          }
        }
      } catch (error) {
        console.error("Failed to send message:", error);
        const errorMessage: Message = {
          role: "assistant",
          content: `Error: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
          source: "system",
        };
        setMessages((prev) => [...prev.slice(0, -1), errorMessage]);
      } finally {
        setIsStreaming(false);
      }
    },
    [selectedAgent.id, currentSessionId, onDebugEvent]
  );

  const handleClearMessages = useCallback(() => {
    setMessages([]);
    setCurrentSessionId(undefined); // Also reset session
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Agent Info Header */}
      <div className="border-b">
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bot className="h-6 w-6 text-blue-600" />
              <div className="flex-1">
                <h2 className="text-lg font-semibold">
                  {selectedAgent.name || selectedAgent.id}
                </h2>
                {selectedAgent.description && (
                  <p className="text-sm text-muted-foreground">
                    {selectedAgent.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Session switcher and metadata badges */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <SessionSwitcher
                entityId={selectedAgent.id}
                currentSessionId={currentSessionId}
                onSessionChange={handleSessionChange}
              />
              <div className="h-4 w-px bg-border" />
              <div className="flex flex-wrap gap-2">
                {selectedAgent.model && (
                  <Badge variant="secondary" className="text-xs">
                    <Brain className="h-3 w-3 mr-1" />
                    {selectedAgent.model}
                  </Badge>
                )}
                <Badge variant="secondary" className="text-xs">
                  <Wrench className="h-3 w-3 mr-1" />
                  {selectedAgent.tools.length} tools
                </Badge>
                {selectedAgent.memory_type && (
                  <Badge variant="secondary" className="text-xs">
                    <Database className="h-3 w-3 mr-1" />
                    {selectedAgent.memory_type}
                  </Badge>
                )}
                <Badge variant="secondary" className="text-xs">
                  {selectedAgent.source}
                </Badge>
              </div>
            </div>

            {/* Expand/collapse button */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-accent rounded-md transition-colors"
              aria-label={isExpanded ? "Hide details" : "Show details"}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Expandable detailed view */}
        {isExpanded && (
          <div className="px-4 pb-3 space-y-2 border-t bg-muted/50">
            {/* Detailed metadata cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2">
              {/* Model */}
              {selectedAgent.model && (
                <div className="bg-card border border-muted rounded p-2 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Brain className="h-4 w-4 text-purple-600 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs text-muted-foreground">Model</div>
                      <div className="text-sm font-medium truncate">
                        {selectedAgent.model}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tools */}
              <div className="bg-card border border-muted rounded p-2 shadow-sm">
                <div className="flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-orange-600 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs text-muted-foreground">Tools</div>
                    <div className="text-sm font-medium">
                      {selectedAgent.tools.length} available
                    </div>
                  </div>
                </div>
              </div>

              {/* Memory */}
              {selectedAgent.memory_type && (
                <div className="bg-card border border-muted rounded p-2 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-green-600 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs text-muted-foreground">
                        Memory
                      </div>
                      <div className="text-sm font-medium truncate">
                        {selectedAgent.memory_type}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Source */}
              <div className="bg-card border border-muted rounded p-2 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full bg-gray-600 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs text-muted-foreground">Source</div>
                    <div className="text-sm font-medium truncate">
                      {selectedAgent.source}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tools List */}
            {selectedAgent.tools.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Wrench className="h-4 w-4" />
                  <span>Available Tools ({selectedAgent.tools.length})</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedAgent.tools.map((tool) => (
                    <Badge key={tool} variant="outline">
                      {tool}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Chat Interface */}
      <div className="flex-1 min-h-0">
        <ChatBase
          messages={messages}
          onSendMessage={handleSendMessage}
          onClearMessages={handleClearMessages}
          isStreaming={isStreaming}
          placeholder={`Chat with ${selectedAgent.name || selectedAgent.id}...`}
          emptyStateTitle="Agent Chat"
          emptyStateDescription={`Start a conversation with this agent. It has access to ${selectedAgent.tools.length} tools and can help you with various tasks.`}
        />
      </div>
    </div>
  );
}
