"""
Orchestration patterns - autonomous control flow.

This package provides orchestration patterns for managing multi-agent interactions
with termination conditions and cancellation support.
"""

from ._base import BaseOrchestrator
from ._round_robin import RoundRobinOrchestrator
from ._plan import PlanBasedOrchestrator
from ._ai import AIOrchestrator
from ..termination import (
    BaseTermination,
    MaxMessageTermination,
    TextMentionTermination,
    TokenUsageTermination,
    TimeoutTermination,
    HandoffTermination,
    ExternalTermination,
    CancellationTermination,
    FunctionCallTermination,
    CompositeTermination
)

__all__ = [
    # Orchestrators
    "BaseOrchestrator",
    "RoundRobinOrchestrator",
    "AIOrchestrator",
    "PlanBasedOrchestrator",

    # Termination conditions
    "BaseTermination",
    "MaxMessageTermination",
    "TextMentionTermination", 
    "TokenUsageTermination",
    "TimeoutTermination",
    "HandoffTermination",
    "ExternalTermination",
    "CancellationTermination",
    "FunctionCallTermination",
    "CompositeTermination",
]
