"""
Base judge class for evaluation scoring.

This module defines the abstract base class for all evaluation judges.
"""

from abc import ABC, abstractmethod
from typing import List, Optional

from ..._cancellation_token import CancellationToken
from ...types import EvalTrajectory, EvalScore


class BaseEvalJudge(ABC):
    """Abstract base class for evaluation judges."""
    
    def __init__(self, name: str):
        """Initialize the judge.
        
        Args:
            name: Human-readable name for this judge
        """
        self.name = name
    
    @abstractmethod
    async def score(
        self, 
        trajectory: EvalTrajectory, 
        criteria: Optional[List[str]] = None,
        cancellation_token: Optional[CancellationToken] = None
    ) -> EvalScore:
        """Score an evaluation trajectory.
        
        Args:
            trajectory: The execution trajectory to score
            criteria: Optional list of evaluation dimensions to score
            cancellation_token: Optional token to cancel scoring
            
        Returns:
            EvalScore with overall and dimensional scores
        """
        pass