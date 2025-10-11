/**
 * PicoAgents WebUI App - Entity orchestrator for agent/orchestrator/workflow interactions
 * Features: Entity selection, layout management, debug coordination
 */

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { AppHeader } from "@/components/shared/app-header";
import { DebugPanel } from "@/components/shared/debug-panel";
import { AgentView } from "@/components/agent/agent-view";
import { OrchestratorView } from "@/components/orchestrator/orchestrator-view";
import { WorkflowView } from "@/components/workflow/workflow-view";
import { LoadingState } from "@/components/ui/loading-state";
import { apiClient } from "@/services/api";
import { ChevronLeft } from "lucide-react";
import type {
  Entity,
  AgentInfo,
  OrchestratorInfo,
  WorkflowInfo,
  AppState,
  StreamEvent,
} from "@/types";


export default function App() {
  const [appState, setAppState] = useState<AppState>({
    entities: [],
    agents: [],
    orchestrators: [],
    workflows: [],
    isLoading: true,
  });

  const [debugEvents, setDebugEvents] = useState<StreamEvent[]>([]);
  const [debugPanelOpen, setDebugPanelOpen] = useState(true);
  const [debugPanelWidth, setDebugPanelWidth] = useState(() => {
    // Initialize from localStorage or default to 320
    const savedWidth = localStorage.getItem("debugPanelWidth");
    return savedWidth ? parseInt(savedWidth, 10) : 320;
  });
  const [isResizing, setIsResizing] = useState(false);

  // Initialize app - load all entities
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load all entities from unified endpoint
        const entities = await apiClient.getEntities();

        // Separate by type for convenience
        const agents = entities.filter((e): e is AgentInfo => e.type === "agent");
        const orchestrators = entities.filter((e): e is OrchestratorInfo => e.type === "orchestrator");
        const workflows = entities.filter((e): e is WorkflowInfo => e.type === "workflow");

        setAppState((prev) => ({
          ...prev,
          entities,
          agents,
          orchestrators,
          workflows,
          selectedEntity: entities.length > 0 ? entities[0] : undefined,
          isLoading: false,
        }));
      } catch (error) {
        console.error("Failed to load entities:", error);
        setAppState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : "Failed to load entities",
          isLoading: false,
        }));
      }
    };

    loadData();
  }, []);

  // Save debug panel width to localStorage
  useEffect(() => {
    localStorage.setItem("debugPanelWidth", debugPanelWidth.toString());
  }, [debugPanelWidth]);

  // Handle resize drag
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsResizing(true);

      const startX = e.clientX;
      const startWidth = debugPanelWidth;

      const handleMouseMove = (e: MouseEvent) => {
        const deltaX = startX - e.clientX; // Subtract because we're dragging from right
        const newWidth = Math.max(
          200,
          Math.min(window.innerWidth * 0.5, startWidth + deltaX)
        );
        setDebugPanelWidth(newWidth);
      };

      const handleMouseUp = () => {
        setIsResizing(false);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [debugPanelWidth]
  );

  // Handle double-click to collapse
  const handleDoubleClick = useCallback(() => {
    setDebugPanelOpen(false);
  }, []);

  // Handle entity selection
  const handleEntitySelect = useCallback((entity: Entity) => {
    setAppState((prev) => ({
      ...prev,
      selectedEntity: entity,
      currentSession: undefined,
    }));

    // Clear debug events when switching entities
    setDebugEvents([]);
  }, []);

  // Handle debug events from active view
  const handleDebugEvent = useCallback((event: StreamEvent) => {
    setDebugEvents((prev) => [...prev, event]);
  }, []);

  // Show loading state while initializing
  if (appState.isLoading) {
    return (
      <div className="h-screen flex flex-col bg-background">
        {/* Top Bar - Skeleton */}
        <header className="flex h-14 items-center gap-4 border-b px-4">
          <div className="w-64 h-9 bg-muted animate-pulse rounded-md" />
          <div className="flex items-center gap-2 ml-auto">
            <div className="w-8 h-8 bg-muted animate-pulse rounded-md" />
            <div className="w-8 h-8 bg-muted animate-pulse rounded-md" />
          </div>
        </header>

        {/* Loading Content */}
        <LoadingState
          message="Initializing PicoAgents WebUI..."
          description="Discovering agents, orchestrators, and workflows"
          fullPage={true}
        />
      </div>
    );
  }

  // Show error state if loading failed
  if (appState.error) {
    return (
      <div className="h-screen flex flex-col bg-background">
        <AppHeader
          entities={[]}
          selectedEntity={undefined}
          onSelect={() => {}}
          isLoading={false}
        />

        {/* Error Content */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4 max-w-md">
            <div className="text-destructive text-lg font-medium">
              Failed to load entities
            </div>
            <p className="text-muted-foreground text-sm">{appState.error}</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show empty state if no entities are available
  if (
    !appState.isLoading &&
    appState.entities.length === 0
  ) {
    return (
      <div className="h-screen flex flex-col bg-background">
        <AppHeader
          entities={[]}
          selectedEntity={undefined}
          onSelect={() => {}}
          isLoading={false}
        />

        {/* Empty State Content */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4 max-w-md">
            <div className="text-lg font-medium">No entities found</div>
            <p className="text-muted-foreground text-sm">
              No agents, orchestrators, or workflows were discovered. Please
              check your configuration and ensure entities are properly set up.
            </p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Render entity-specific view
  const renderEntityView = () => {
    if (!appState.selectedEntity) {
      return (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          Select an entity to get started.
        </div>
      );
    }

    switch (appState.selectedEntity.type) {
      case "agent":
        return (
          <AgentView
            selectedAgent={appState.selectedEntity as AgentInfo}
            onDebugEvent={handleDebugEvent}
          />
        );
      case "orchestrator":
        return (
          <OrchestratorView
            selectedOrchestrator={appState.selectedEntity as OrchestratorInfo}
            onDebugEvent={handleDebugEvent}
          />
        );
      case "workflow":
        return (
          <WorkflowView
            selectedWorkflow={appState.selectedEntity as WorkflowInfo}
            onDebugEvent={handleDebugEvent}
          />
        );
      default:
        return (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Unknown entity type: {(appState.selectedEntity as any).type}
          </div>
        );
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <AppHeader
        entities={appState.entities}
        selectedEntity={appState.selectedEntity}
        onSelect={handleEntitySelect}
        isLoading={appState.isLoading}
      />

      {/* Main Content - Split Panel with explicit height */}
      <div className="flex overflow-hidden" style={{ height: 'calc(100vh - 56px)' }}>
        {/* Left Panel - Main View */}
        <div className="flex-1 min-w-0 overflow-hidden">
          {renderEntityView()}
        </div>

        {/* Resize Handle */}
        {debugPanelOpen && (
          <div
            className={`w-1 bg-border hover:bg-accent cursor-col-resize flex-shrink-0 relative group ${
              isResizing ? "bg-accent" : ""
            }`}
            onMouseDown={handleMouseDown}
            onDoubleClick={handleDoubleClick}
          >
            <div className="absolute inset-y-0 -left-1 -right-1 flex items-center justify-center">
              <div className="h-12 rounded-lg bg-primary w-2"></div>
            </div>
          </div>
        )}

        {/* Button to reopen when closed */}
        {!debugPanelOpen && (
          <div className="flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDebugPanelOpen(true)}
              className="rounded-none border-l"
              style={{ height: 'calc(100vh - 56px)' }}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Right Panel - Debug */}
        {debugPanelOpen && (
          <div
            className="flex-shrink-0"
            style={{ width: `${debugPanelWidth}px`, height: '100%' }}
          >
            <DebugPanel
              events={debugEvents}
              isStreaming={false}
            />
          </div>
        )}
      </div>
    </div>
  );
}