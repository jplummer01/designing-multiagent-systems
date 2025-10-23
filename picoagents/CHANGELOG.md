# Changelog

All notable changes to PicoAgents will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.3] - 2025-10-22

### Added

- OpenTelemetry integration following Gen-AI semantic conventions with automatic instrumentation
- Workflow checkpoint system with file and memory storage backends for state persistence
- Tool approval system with `@tool` decorator and `ApprovalMode` support for human-in-the-loop workflows
- Enhanced middleware pipeline with approval flow hooks and tool execution monitoring
- Context management improvements with agent-specific context support
- Memory tools for persistent agent memory across sessions
- Poethepoet task automation (run `poe test`, `poe check`, etc.)
- Example tasks display component in Web UI
- Tool approval banner in Web UI for interactive approval workflows
- Comprehensive examples for memory management, OpenTelemetry, tool approval, and checkpointing

### Changed

- Improved Web UI debug panel with detailed execution traces
- Enhanced middleware system with better error handling and event emission
- Reorganized test structure: workflow tests moved to `tests/workflow/`
- Updated frontend build artifacts with latest React components

### Removed

- Deprecated planning tools module (functionality moved to core tools)
- Old workflow test files from `src/picoagents/workflow/tests/`

## [0.2.2] - 2025-10-11

### Changed

- Update default model to gpt-4.1-mini
- Add examples gallery to web UI for browsing and loading sample agents

## [0.2.1] - 2025-10-11

### Changed

- Update README documentation

## [0.2.0] - 2025-10-11

### Added

- Web UI integration with auto-discovery of agents, workflows, and orchestrators
- Updated examples directory structure

### Changed

- Moved examples from picoagents/examples to root examples/ directory for better organization

## [0.1.2] - 2024

### Initial Release

- Core agent implementation with tool support
- Workflow engine with DAG-based execution
- Orchestration patterns (round-robin, AI-driven, plan-based)
- Memory management system
- Evaluation framework
- Comprehensive test suite
