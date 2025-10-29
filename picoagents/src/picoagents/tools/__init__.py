"""
Tool system for picoagents framework.

This module provides the foundation for tools that agents can use to
interact with the world beyond text generation.
"""

from ._base import ApprovalMode, BaseTool, FunctionTool
from ._core_tools import (
    CalculatorTool,
    DateTimeTool,
    JSONParserTool,
    RegexTool,
    TaskStatusTool,
    ThinkTool,
    create_core_tools,
)
from ._decorator import tool
from ._memory_tool import MemoryBackend, MemoryTool

try:
    from ._research_tools import create_research_tools

    RESEARCH_TOOLS_AVAILABLE = True
except ImportError:
    RESEARCH_TOOLS_AVAILABLE = False

from ._coding_tools import create_coding_tools

__all__ = [
    "ApprovalMode",
    "BaseTool",
    "FunctionTool",
    "tool",
    "create_core_tools",
    "create_research_tools",
    "create_coding_tools",
    "MemoryTool",
    "MemoryBackend",
    "ThinkTool",
    "TaskStatusTool",
    "CalculatorTool",
    "DateTimeTool",
    "JSONParserTool",
    "RegexTool",
    "RESEARCH_TOOLS_AVAILABLE",
]
