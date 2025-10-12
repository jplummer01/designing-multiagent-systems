#!/usr/bin/env python3
"""
Simple round-robin orchestration example.
"""

import asyncio

from httpx import get

from picoagents import Agent
from picoagents.llm import OpenAIChatCompletionClient
from picoagents.orchestration import RoundRobinOrchestrator
from picoagents.termination import MaxMessageTermination, TextMentionTermination


def get_orchestrator():
    """Demonstrate round-robin conversation flow."""

    client = OpenAIChatCompletionClient(model="gpt-4.1-mini")

    # Create a haiku writer and critic working together
    poet = Agent(
        name="poet",
        description="Haiku poet.",
        instructions="""You are a haiku poet.""",
        model_client=client,
    )

    critic = Agent(
        name="critic",
        description="Poetry critic who provides specific, constructive feedback on haikus.",
        instructions="""You are a haiku critic. When you see a haiku, provide 2-3 specific, 
        actionable suggestions for improvement. Focus on imagery, syllable count, seasonal words, 
        or emotional impact. Be constructive and brief. If you are satisfied with the haiku and your comments addressed, respond with the word 'APPROVED'""",
        model_client=client,
    )
    termination = MaxMessageTermination(max_messages=8) | TextMentionTermination(
        text="APPROVED"
    )
    # Create orchestrator - poet writes first, then critic provides feedback
    orchestrator = RoundRobinOrchestrator(
        agents=[poet, critic], termination=termination, max_iterations=4
    )

    return orchestrator


orchestrator = get_orchestrator()


async def main():
    task = "Write a haiku about cherry blossoms in spring"
    print(f"🎯 Task: {task}")
    print("🔄 Poet and Critic collaboration:\n")

    # Run orchestration and show final conversation
    stream = orchestrator.run_stream(task)

    async for message in stream:
        print(f"========\n{message}")


if __name__ == "__main__":
    asyncio.run(main())
