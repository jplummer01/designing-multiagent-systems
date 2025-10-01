# pip install -U autogen-agentchat autogen-ext[openai]
import asyncio
from autogen_agentchat.agents import AssistantAgent 
from autogen_agentchat.ui import Console
from autogen_ext.models.openai import OpenAIChatCompletionClient


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
    agent = AssistantAgent(
        name="assistant", 
        description="A helpful assistant",
        system_message="A helpful assistant",
        model_client=OpenAIChatCompletionClient(model="gpt-4o-2024-11-20"), 
        tools=[calculator])  
    await Console(agent.run_stream(task="What is the result of 545.34567 * 34555.34"))

asyncio.run(main())
