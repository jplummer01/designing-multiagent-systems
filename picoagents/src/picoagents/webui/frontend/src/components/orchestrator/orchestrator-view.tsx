/**
 * OrchestratorView - Chat interface for multi-agent orchestration
 * Features: Multi-agent conversation display, termination conditions, agent tracking
 */

import { useState, useCallback, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ChatBase } from "@/components/shared/chat-base";
import { ExampleTasksDisplay } from "@/components/shared/example-tasks-display";
import { Users, Bot, MessageSquare, StopCircle } from "lucide-react";
import { apiClient } from "@/services/api";
import type {
  OrchestratorInfo,
  Message,
  StreamEvent,
  RunEntityRequest
} from "@/types";

interface OrchestratorViewProps {
  selectedOrchestrator: OrchestratorInfo;
  onDebugEvent: (event: StreamEvent) => void;
}

export function OrchestratorView({
  selectedOrchestrator,
  onDebugEvent,
}: OrchestratorViewProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentAgentSpeaking, setCurrentAgentSpeaking] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleSendMessage = useCallback(
    async (newMessages: Message[]) => {
      // Add new messages to state
      setMessages((prev) => [...prev, ...newMessages]);
      setIsStreaming(true);
      setCurrentAgentSpeaking(null);

      // Create new AbortController for this request
      abortControllerRef.current = new AbortController();

      try {
        const request: RunEntityRequest = {
          messages: [...messages, ...newMessages],
        };

        let assistantMessage: Message = {
          role: "assistant",
          content: "",
          source: selectedOrchestrator.name || selectedOrchestrator.id,
        };

        setMessages((prev) => [...prev, assistantMessage]);

        for await (const event of apiClient.streamEntityExecution(
          selectedOrchestrator.id,
          request,
          abortControllerRef.current.signal
        )) {
          onDebugEvent(event);

          // Handle different event types
          if (event.type === "message") {
            if (event.data?.content) {
              assistantMessage = {
                ...assistantMessage,
                content: assistantMessage.content + event.data.content,
              };

              setMessages((prev) => [
                ...prev.slice(0, -1),
                assistantMessage,
              ]);
            }

            // Track which agent is currently speaking
            if (event.data?.name) {
              setCurrentAgentSpeaking(event.data.name);
            }
          } else if (event.type === "complete") {
            setCurrentAgentSpeaking(null);
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
            content: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
            source: "system",
          };
          setMessages((prev) => [...prev.slice(0, -1), errorMessage]);
        }
      } finally {
        setIsStreaming(false);
        setCurrentAgentSpeaking(null);
        abortControllerRef.current = null;
      }
    },
    [selectedOrchestrator.id, messages, onDebugEvent]
  );

  const handleStop = useCallback(() => {
    if (abortControllerRef.current) {
      console.log("🛑 Stopping orchestrator execution");
      abortControllerRef.current.abort();
    }
  }, []);

  const handleClearMessages = useCallback(() => {
    setMessages([]);
    setCurrentAgentSpeaking(null);
  }, []);

  const getOrchestratorTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "round_robin":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "ai":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "plan":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Orchestrator Info Header */}
      <div className="border-b p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-lg font-semibold">
                {selectedOrchestrator.name || selectedOrchestrator.id}
              </h2>
              {selectedOrchestrator.description && (
                <p className="text-sm text-muted-foreground">
                  {selectedOrchestrator.description}
                </p>
              )}
            </div>
          </div>
          <Badge className={getOrchestratorTypeColor(selectedOrchestrator.orchestrator_type)}>
            {selectedOrchestrator.orchestrator_type}
          </Badge>
        </div>

        {/* Agent Participants */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Bot className="h-4 w-4" />
            <span>Participating Agents ({selectedOrchestrator.agents.length})</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedOrchestrator.agents.map((agentName) => (
              <Badge
                key={agentName}
                variant={currentAgentSpeaking === agentName ? "default" : "outline"}
                className={currentAgentSpeaking === agentName ? "animate-pulse" : ""}
              >
                {agentName}
                {currentAgentSpeaking === agentName && (
                  <MessageSquare className="h-3 w-3 ml-1" />
                )}
              </Badge>
            ))}
          </div>
        </div>

        {/* Termination Conditions */}
        {selectedOrchestrator.termination_conditions.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <StopCircle className="h-4 w-4" />
              <span>Termination Conditions</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedOrchestrator.termination_conditions.map((condition) => (
                <Badge key={condition} variant="secondary">
                  {condition}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Current Agent Speaking Indicator */}
        {currentAgentSpeaking && (
          <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-blue-600 rounded-full animate-pulse" />
                <span className="text-sm font-medium">
                  {currentAgentSpeaking} is responding...
                </span>
              </div>
            </CardContent>
          </Card>
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
          placeholder={`Start a conversation with ${selectedOrchestrator.agents.length} agents via ${selectedOrchestrator.orchestrator_type} orchestration...`}
          emptyStateTitle="Multi-Agent Orchestration"
          emptyStateDescription={`This orchestrator will coordinate conversations between ${selectedOrchestrator.agents.join(", ")} using ${selectedOrchestrator.orchestrator_type} pattern.`}
          emptyStateCustom={
            selectedOrchestrator.example_tasks && selectedOrchestrator.example_tasks.length > 0 ? (
              <ExampleTasksDisplay
                tasks={selectedOrchestrator.example_tasks}
                entityName={selectedOrchestrator.name || selectedOrchestrator.id}
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
        />
      </div>
    </div>
  );
}