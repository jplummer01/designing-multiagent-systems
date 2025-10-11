/**
 * PicoAgents TypeScript type definitions
 * Aligned with the PicoAgents Python backend types
 */

// Base Message Types (from picoagents.messages)
// EXACT match with Python backend types

export interface BaseMessage {
  content: string;  // Required: The message content
  source: string;   // Required: Source of the message (agent name, system, user, etc.)
  timestamp?: string;  // Optional in TS since it has default_factory in Python
}

export interface SystemMessage extends BaseMessage {
  role: "system";  // Literal type with default="system" in Python
}

export interface UserMessage extends BaseMessage {
  role: "user";  // Literal type with default="user" in Python
  name?: string;  // Optional: name of the user
}

export interface AssistantMessage extends BaseMessage {
  role: "assistant";  // Literal type with default="assistant" in Python
  tool_calls?: ToolCallRequest[];  // Optional: Tool calls made by the assistant
  structured_content?: any;  // Optional: Structured data when output_format is used (BaseModel in Python)
}

export interface ToolMessage extends BaseMessage {
  role: "tool";  // Literal type with default="tool" in Python
  tool_call_id: string;  // Required: ID of the tool call this is responding to
  tool_name: string;  // Required: Name of the tool that was executed
  success: boolean;  // Required: Whether tool execution succeeded
  error?: string;  // Optional: Error message if failed
}

export interface MultiModalMessage extends BaseMessage {
  role: "user" | "assistant";  // Can be either user or assistant
  mime_type: string;  // Required: MIME type (e.g., 'image/jpeg', 'audio/wav')
  data?: string;  // Optional: Base64 encoded data (bytes in Python become base64 string in JSON)
  media_url?: string;  // Optional: URL to media content if data is not provided
  metadata?: Record<string, any>;  // Optional: Additional content metadata (default_factory=dict in Python)
}

// Union type for all message types - EXACT match with Python
export type Message = SystemMessage | UserMessage | AssistantMessage | ToolMessage | MultiModalMessage;

// Tool Related Types (aligned with Python ToolCallRequest)
export interface ToolCallRequest {
  tool_name: string;
  parameters: Record<string, any>;
  call_id: string;
}

export interface ToolResult {
  success: boolean;
  result: any;
  error?: string;
  metadata?: Record<string, any>;
}

// Usage Statistics
export interface Usage {
  duration_ms: number;
  llm_calls: number;
  tokens_input: number;
  tokens_output: number;
  tool_calls: number;
  memory_operations: number;
  cost_estimate?: number;
}

// Agent Response Types
export interface AgentResponse {
  messages: Message[];
  usage?: Usage;
  metadata?: Record<string, any>;
}

export interface AgentEvent {
  type: "message" | "tool_call" | "tool_result" | "thinking" | "error";
  data: any;
  timestamp?: string;
}

// Entity Discovery Types (from webui._models)
export interface EntityInfo {
  id: string;
  name?: string;
  description?: string;
  type: "agent" | "orchestrator" | "workflow";
  source: string;
  module_path?: string;
  tools: string[];
  has_env: boolean;
}

export interface AgentInfo extends EntityInfo {
  type: "agent";
  model?: string;
  memory_type?: string;
}

export interface OrchestratorInfo extends EntityInfo {
  type: "orchestrator";
  orchestrator_type: string;
  agents: string[];
  termination_conditions: string[];
}

export interface WorkflowInfo extends EntityInfo {
  type: "workflow";
  steps: string[];
  input_schema?: Record<string, any>;
  start_step?: string;
}

export type Entity = AgentInfo | OrchestratorInfo | WorkflowInfo;

// Session Management Types (metadata only)
export interface SessionInfo {
  id: string;
  entity_id: string;
  entity_type: string;
  created_at: string;
  message_count: number;
  last_activity: string;
}

// Full session context
export interface SessionContext {
  messages: Message[];
  metadata: Record<string, any>;
  shared_state: Record<string, any>;
  environment: Record<string, any>;
  session_id: string | null;
  created_at: string;
}

// Streaming Event Types
export interface StreamEvent {
  type: "message" | "token_chunk" | "tool_call" | "tool_result" | "thinking" | "error" | "usage" | "complete" | "workflow_started" | "workflow_completed" | "executor_invoke" | "executor_result" | "workflow_error" | "task_start" | "task_complete" | "model_call" | "model_response" | "unknown";
  data: any;
  session_id?: string;
  timestamp: string;
}

// Workflow Execution Types
export interface WorkflowEvent {
  type: "workflow_started" | "workflow_completed" | "executor_invoke" | "executor_result" | "workflow_error";
  data?: any;
  executor_id?: string;
  timestamp?: string;
}

export interface WorkflowExecutionState {
  status: "pending" | "running" | "completed" | "failed";
  current_step?: string;
  steps_completed: string[];
  result?: any;
  error?: string;
}

// Chat Completion Chunk (for token streaming)
export interface ChatCompletionChunk {
  content: string;
  is_complete: boolean;
  tool_call_chunk?: Record<string, any>;
}

// Request Types for API
export interface RunEntityRequest {
  messages?: Message[];  // For agents and orchestrators
  input_data?: any;      // For workflows
  session_id?: string;
  stream_tokens?: boolean; // Enable token-level streaming (default: true)
}

// Health Check
export interface HealthResponse {
  status: string;
  entities_dir?: string;
  entities_count: number;
}

// Type Guards
export function isAgentInfo(entity: Entity): entity is AgentInfo {
  return entity.type === "agent";
}

export function isOrchestratorInfo(entity: Entity): entity is OrchestratorInfo {
  return entity.type === "orchestrator";
}

export function isWorkflowInfo(entity: Entity): entity is WorkflowInfo {
  return entity.type === "workflow";
}

// Message Type Guards
export function isSystemMessage(msg: Message): msg is SystemMessage {
  return msg.role === "system";
}

export function isUserMessage(msg: Message): msg is UserMessage {
  return msg.role === "user" && !('mime_type' in msg);
}

export function isAssistantMessage(msg: Message): msg is AssistantMessage {
  return msg.role === "assistant" && !('mime_type' in msg);
}

export function isToolMessage(msg: Message): msg is ToolMessage {
  return msg.role === "tool";
}

export function isMultiModalMessage(msg: Message): msg is MultiModalMessage {
  return ('mime_type' in msg) && (msg.role === "user" || msg.role === "assistant");
}