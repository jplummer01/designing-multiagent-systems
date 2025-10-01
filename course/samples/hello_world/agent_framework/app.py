# pip install agent-framework
"""Sample weather agent for Agent Framework Debug UI."""

import asyncio
import os
from typing import Annotated

from agent_framework import ChatAgent
from agent_framework.azure import AzureOpenAIChatClient


def calculator(a: float, b: float, operator: str) -> str:
    """Perform basic arithmetic operations."""
    try:
        if operator == '+':
            return str(a + b)
        elif operator == '-':
            return str(a - b)
        elif operator == '*':
            return str(a * b)
        elif operator == '/':
            if b == 0:
                return 'Error: Division by zero'
            return str(a / b)
        else:
            return 'Error: Invalid operator. Please use +, -, *, or /'
    except Exception as e:
        return f'Error: {str(e)}'

 
async def main() -> None:
# Agent instance following Agent Framework conventions
    agent = ChatAgent(
        name="AzureWeatherAgent",
        description="A helpful assistant",
        instructions="""
        A helpful assistant""",
        chat_client=AzureOpenAIChatClient(),
        tools=[calculator],
    )
    result = await agent.run("What is the result of 545.34567 * 34555.34?")
    print(result)

asyncio.run(main())