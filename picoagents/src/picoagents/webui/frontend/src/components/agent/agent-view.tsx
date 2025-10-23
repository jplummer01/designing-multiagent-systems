/**
 * AgentView - Single agent chat interface for PicoAgents
 * Features: Chat interface, message streaming, PicoAgents message format
 */

import { useState, useCallback, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { ChatBase } from "@/components/shared/chat-base";
import { SessionSwitcher } from "@/components/shared/session-switcher";
import { ToolApprovalBanner } from "@/components/shared/tool-approval-banner";
import { ExampleTasksDisplay } from "@/components/shared/example-tasks-display";
import {
  Bot,
  Brain,
  Wrench,
  Database,
  ChevronDown,
  ChevronUp,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { apiClient } from "@/services/api";
import type {
  AgentInfo,
  Message,
  StreamEvent,
  RunEntityRequest,
  ToolApprovalRequest,
  ToolApprovalResponse,
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
  const [pendingApproval, setPendingApproval] = useState<ToolApprovalRequest | null>(null);
  const [pendingApprovalResponses, setPendingApprovalResponses] = useState<ToolApprovalResponse[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [messageUsage, setMessageUsage] = useState<Map<number, { tokens_input: number; tokens_output: number }>>(new Map());
  const [sessionTotalUsage, setSessionTotalUsage] = useState<{ tokens_input: number; tokens_output: number }>({ tokens_input: 0, tokens_output: 0 });

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
    async (newMessages: Message[], approvalResponses?: ToolApprovalResponse[]) => {
      // Add new messages to state
      setMessages((prev) => [...prev, ...newMessages]);
      setIsStreaming(true);

      // Create new AbortController for this request
      abortControllerRef.current = new AbortController();

      // Use provided approval responses or fallback to state
      const approvalsToSend = approvalResponses || (pendingApprovalResponses.length > 0 ? pendingApprovalResponses : undefined);

      try {
        const request: RunEntityRequest = {
          messages: newMessages, // Send only NEW messages
          session_id: currentSessionId, // Backend will append to session
          stream_tokens: true,
          approval_responses: approvalsToSend,
        };

        // Debug logging
        console.log("🔍 Full request being sent:", JSON.stringify(request, null, 2));

        // Clear pending approvals after sending
        if (approvalsToSend) {
          setPendingApprovalResponses([]);
        }

        let assistantMessage: Message = {
          role: "assistant",
          content: "",
          source: selectedAgent.name || selectedAgent.id,
        };

        setMessages((prev) => [...prev, assistantMessage]);

        for await (const event of apiClient.streamEntityExecution(
          selectedAgent.id,
          request,
          abortControllerRef.current.signal
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
          } else if (event.type === "tool_approval") {
            // Tool approval requested - show dialog
            if (event.data?.approval_request) {
              setPendingApproval(event.data.approval_request);
            }
          } else if (event.type === "complete") {
            // Final response - update with complete message and usage
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

            // Capture usage statistics
            if (event.data?.usage) {
              const usage = event.data.usage;
              const messageIndex = messages.length; // Index of the assistant message

              // Store usage for this message
              setMessageUsage((prev) => {
                const newMap = new Map(prev);
                newMap.set(messageIndex, {
                  tokens_input: usage.tokens_input || 0,
                  tokens_output: usage.tokens_output || 0,
                });
                return newMap;
              });

              // Update session total
              setSessionTotalUsage((prev) => ({
                tokens_input: prev.tokens_input + (usage.tokens_input || 0),
                tokens_output: prev.tokens_output + (usage.tokens_output || 0),
              }));
            }
            break;
          }
        }
      } catch (error) {
        console.error("Failed to send message:", error);

        // Check if this was an abort (user clicked stop)
        if (error instanceof Error && error.name === "AbortError") {
          const cancelMessage: Message = {
            role: "assistant",
            content: "Cancelled by user",
            source: "system",
          };
          setMessages((prev) => [...prev.slice(0, -1), cancelMessage]);
        } else {
          const errorMessage: Message = {
            role: "assistant",
            content: `Error: ${
              error instanceof Error ? error.message : "Unknown error"
            }`,
            source: "system",
          };
          setMessages((prev) => [...prev.slice(0, -1), errorMessage]);
        }
      } finally {
        setIsStreaming(false);
        abortControllerRef.current = null;
      }
    },
    [selectedAgent.id, currentSessionId, pendingApprovalResponses, onDebugEvent]
  );

  const handleStop = useCallback(() => {
    if (abortControllerRef.current) {
      console.log("🛑 Stopping agent execution");
      abortControllerRef.current.abort();
    }
  }, []);

  const handleClearMessages = useCallback(() => {
    setMessages([]);
    setCurrentSessionId(undefined); // Also reset session
    setMessageUsage(new Map()); // Clear usage tracking
    setSessionTotalUsage({ tokens_input: 0, tokens_output: 0 }); // Reset totals
  }, []);

  const handleApprove = useCallback((response: ToolApprovalResponse) => {
    console.log("📝 handleApprove called with:", response);
    setPendingApproval(null);

    // Send immediately with approval response
    handleSendMessage([], [response]);
  }, [handleSendMessage]);

  const handleReject = useCallback((response: ToolApprovalResponse) => {
    console.log("📝 handleReject called with:", response);
    setPendingApproval(null);

    // Send immediately with rejection response
    handleSendMessage([], [response]);
  }, [handleSendMessage]);

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
                {/* Session token usage */}
                {(sessionTotalUsage.tokens_input > 0 || sessionTotalUsage.tokens_output > 0) && (
                  <Badge variant="outline" className="text-xs gap-1">
                    <ArrowUp className="h-3 w-3" />
                    {sessionTotalUsage.tokens_input.toLocaleString()}
                    <ArrowDown className="h-3 w-3" />
                    {sessionTotalUsage.tokens_output.toLocaleString()}
                  </Badge>
                )}
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
          onStop={handleStop}
          isStreaming={isStreaming}
          messageUsage={messageUsage}
          sessionTotalUsage={sessionTotalUsage}
          placeholder={`Chat with ${selectedAgent.name || selectedAgent.id}...`}
          emptyStateTitle="Agent Chat"
          emptyStateDescription={`Start a conversation with this agent. It has access to ${selectedAgent.tools.length} tools and can help you with various tasks.`}
          emptyStateCustom={
            selectedAgent.example_tasks && selectedAgent.example_tasks.length > 0 ? (
              <ExampleTasksDisplay
                tasks={selectedAgent.example_tasks}
                entityName={selectedAgent.name || selectedAgent.id}
                onTaskClick={(task) => {
                  const userMessage: Message = {
                    role: "user",
                    content: task,
                    source: "user",
                  };
                  handleSendMessage([userMessage]);
                }}
              />
            ) : null
          }
          beforeInput={
            <ToolApprovalBanner
              request={pendingApproval}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          }
        />
      </div>
    </div>
  );
}
