"""
Basic Agent Example - Chapter 4 concepts

This example demonstrates the core agent concepts from Chapter 4:
- Creating agents with different configurations
- Using tools with agents
- Memory management
- Error handling
"""

import asyncio
from typing import Dict, Any

from picoagents import (
    Agent, 
    AgentConfigurationError,
    OpenAIChatCompletionClient,
    FunctionTool,
    ListMemory,
    ToolMessage
)


def get_weather(location: str) -> str:
    """Get current weather for a given location."""
    return f"The weather in {location} is sunny, 75°F"


def calculate(expression: str) -> str:
    """Perform basic mathematical calculations."""
    try:
        # Note: Never use eval in production! This is just for demo purposes
        result = eval(expression)
        return f"The result of {expression} is {result}"
    except Exception as e:
        return f"Error calculating {expression}: {e}"


async def main():
    print("=== Basic Agent Example ===\n")
    
    # Initialize the LLM client
    model_client = OpenAIChatCompletionClient(model="gpt-4o-mini")
    
    # 1. Create a basic agent
    print("1. Creating a basic agent...")
    basic_agent = Agent(
        name="assistant",
        description="A helpful assistant that can answer questions",
        instructions="You are a helpful assistant that can answer questions.",
        model_client=model_client
    )
    
    print(f"Agent: {basic_agent}")
    print(f"Agent info: {basic_agent.get_info()}")
    
    # Test basic conversation
    response = await basic_agent.run("Hello, how are you?")
    print(f"Response: {response.messages[-1].content}\n")
    
    # 2. Create an agent with tools (simplified - just pass functions!)
    print("2. Creating an agent with tools...")
    
    # Create memory for the agent
    memory = ListMemory()
    
    tool_agent = Agent(
        name="tool_assistant",
        description="An assistant with access to weather and calculation tools",
        instructions="You are an assistant with access to weather and calculation tools. Use the tools when appropriate to help users.",
        model_client=model_client,
        tools=[get_weather, calculate],  # Functions are auto-wrapped as FunctionTool!
        memory=memory
    )
     
    
    print(f"Agent: {tool_agent}")
    info = tool_agent.get_info()
    print(f"Agent Info: {info}")
    print(f"Has memory: {info['has_memory']}")
    
    # Test with tools
    response = await tool_agent.run("What's the weather like in San Francisco?")
    print(f"Weather response: {response.messages[-1].content}\n")
    
    # 3. Test calculator tool
    print("3. Testing calculator tool...")
    response = await tool_agent.run("Calculate 15 + 27")
    print(f"Calculator response: {response.messages[-1].content}\n")
    
    # 4. Message history
    print("4. Message history...")
    response = await tool_agent.run("What was my previous calculation?")
    print(f"Follow-up response: {response.messages[-1].content}")
    
    print(f"Message history length: {len(tool_agent.message_history)}")
    for i, msg in enumerate(tool_agent.message_history[-4:]):  # Show last 4 messages
        content = msg.content[:50] + "..." if len(msg.content) > 50 else msg.content
        print(f"  {i+1}. {msg.__class__.__name__}: {content}")
    
    # 5. Error handling
    print("\n5. Error handling...")
    try:
        # Try to create an agent with invalid configuration
        bad_agent = Agent(
            name="",  # Empty name should cause error
            description="Bad agent",
            instructions="Bad instructions",
            model_client=model_client
        )
    except (AgentConfigurationError, ValueError) as e:
        print(f"Caught configuration error: {e}")
    
    # 6. Agent information
    print("\n6. Agent information...")
    info = tool_agent.get_info()
    print(f"Agent info: {info}")
    
    # 7. Reset agent
    print("\n7. Resetting agent...")
    print(f"Messages before reset: {len(tool_agent.message_history)}")
    await tool_agent.reset()
    print(f"Messages after reset: {len(tool_agent.message_history)}")
    
    # 8. Streaming example
    print("\n8. Streaming example...")
    print("Streaming response:")
    
    from picoagents.messages import AssistantMessage, UserMessage
    
    async for item in tool_agent.run_stream("Tell me a short joke about programming"):
        if isinstance(item, (AssistantMessage, UserMessage, ToolMessage)):
            # It's a message
            print(f"  Message ({item.__class__.__name__}): {item.content}")
        else:
            # It's an event
            print(f"  Event ({item.__class__.__name__}): {item}")


if __name__ == "__main__":
    asyncio.run(main())
