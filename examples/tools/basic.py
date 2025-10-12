#!/usr/bin/env python3
"""
Example demonstrating the different tool categories in picoagents.

This example shows:
1. Core tools (calculator, datetime, json, regex) - no external dependencies
2. Planning tools (task management) - no external dependencies
3. Coding tools (file operations, code execution) - no external dependencies
4. Research tools (web search, content extraction) - requires: httpx, beautifulsoup4, arxiv

Run with: python examples/tools_example.py
"""

import asyncio
import os
import tempfile
from pathlib import Path

from picoagents import Agent
from picoagents.llm import AzureOpenAIChatCompletionClient
from picoagents.tools import (
    RESEARCH_TOOLS_AVAILABLE,
    create_coding_tools,
    create_core_tools,
    create_planning_tools,
)


async def demo_core_tools():
    """Demonstrate core utility tools (no external dependencies)."""
    print("\n" + "=" * 60)
    print("DEMO 1: Core Tools (Calculator, DateTime, JSON, Regex)")
    print("=" * 60)

    azure_endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
    api_key = os.getenv("AZURE_OPENAI_API_KEY")
    deployment = os.getenv("AZURE_OPENAI_DEPLOYMENT", "gpt-4.1-mini")

    if not azure_endpoint or not api_key:
        print("⚠️  Set AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_API_KEY to run this demo")
        return

    client = AzureOpenAIChatCompletionClient(
        model="gpt-4.1-mini",
        azure_endpoint=azure_endpoint,
        api_key=api_key,
        azure_deployment=deployment,
    )

    agent = Agent(
        name="math_agent",
        description="Agent that can do calculations and data processing",
        instructions="You are a helpful assistant with access to calculator, datetime, JSON parsing, and regex tools. Use these tools to help answer questions.",
        model_client=client,
        tools=create_core_tools(),
    )

    task = "Calculate the square root of 144, then tell me what date it will be 30 days from now."

    print(f"\nTask: {task}\n")

    response = await agent.run(task)
    print(f"Agent: {response.messages[-1].content}\n")


async def demo_planning_tools():
    """Demonstrate planning tools for task management."""
    print("\n" + "=" * 60)
    print("DEMO 2: Planning Tools (Task Management)")
    print("=" * 60)

    azure_endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
    api_key = os.getenv("AZURE_OPENAI_API_KEY")
    deployment = os.getenv("AZURE_OPENAI_DEPLOYMENT", "gpt-4.1-mini")

    if not azure_endpoint or not api_key:
        print("⚠️  Set AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_API_KEY to run this demo")
        return

    client = AzureOpenAIChatCompletionClient(
        model="gpt-4.1-mini",
        azure_endpoint=azure_endpoint,
        api_key=api_key,
        azure_deployment=deployment,
    )

    with tempfile.TemporaryDirectory() as tmpdir:
        plan_file = Path(tmpdir) / "plan.json"

        agent = Agent(
            name="planner_agent",
            description="Agent that creates and manages task plans",
            instructions="You are a helpful assistant that creates structured plans. Use the planning tools to create a plan, track tasks, and report progress.",
            model_client=client,
            tools=create_planning_tools(plan_file),
        )

        task = "Create a plan for building a simple REST API with 3 tasks: 1) Design database schema, 2) Implement endpoints, 3) Write tests. Then mark the first task as completed and show me a summary."

        print(f"\nTask: {task}\n")

        response = await agent.run(task)
        print(f"Agent: {response.messages[-1].content}\n")

        print(f"\nPlan file contents ({plan_file}):")
        print(plan_file.read_text())


async def demo_coding_tools():
    """Demonstrate coding tools for file operations."""
    print("\n" + "=" * 60)
    print("DEMO 3: Coding Tools (File Operations, Code Execution)")
    print("=" * 60)

    azure_endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
    api_key = os.getenv("AZURE_OPENAI_API_KEY")
    deployment = os.getenv("AZURE_OPENAI_DEPLOYMENT", "gpt-4.1-mini")

    if not azure_endpoint or not api_key:
        print("⚠️  Set AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_API_KEY to run this demo")
        return

    client = AzureOpenAIChatCompletionClient(
        model="gpt-4.1-mini",
        azure_endpoint=azure_endpoint,
        api_key=api_key,
        azure_deployment=deployment,
    )

    with tempfile.TemporaryDirectory() as tmpdir:
        workspace = Path(tmpdir)

        agent = Agent(
            name="coder_agent",
            description="Agent that can write and execute code",
            instructions="You are a helpful coding assistant. Use the available tools to read/write files, list directories, and execute code.",
            model_client=client,
            tools=create_coding_tools(workspace=workspace),
        )

        task = "Create a Python file called 'hello.py' that prints 'Hello, World!', then use python_repl to execute it and show me the output."

        print(f"\nTask: {task}\n")

        response = await agent.run(task)
        print(f"Agent: {response.messages[-1].content}\n")

        print(f"\nWorkspace contents:")
        for file in workspace.iterdir():
            print(f"  - {file.name}")
            if file.is_file() and file.suffix == ".py":
                print(f"    Content:\n{file.read_text()}")


async def demo_research_tools():
    """Demonstrate research tools (requires external dependencies)."""
    print("\n" + "=" * 60)
    print("DEMO 4: Research Tools (Web Search, Content Extraction)")
    print("=" * 60)

    if not RESEARCH_TOOLS_AVAILABLE:
        print("⚠️  Research tools require additional dependencies:")
        print("    pip install httpx beautifulsoup4 arxiv")
        print("\nSkipping research tools demo.")
        return

    azure_endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
    api_key = os.getenv("AZURE_OPENAI_API_KEY")
    deployment = os.getenv("AZURE_OPENAI_DEPLOYMENT", "gpt-4.1-mini")
    tavily_key = os.getenv("TAVILY_API_KEY")

    if not azure_endpoint or not api_key:
        print("⚠️  Set AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_API_KEY to run this demo")
        return

    if not tavily_key:
        print("⚠️  Set TAVILY_API_KEY for web search functionality")
        return

    from picoagents.tools import create_research_tools

    client = AzureOpenAIChatCompletionClient(
        model="gpt-4.1-mini",
        azure_endpoint=azure_endpoint,
        api_key=api_key,
        azure_deployment=deployment,
    )

    agent = Agent(
        name="researcher_agent",
        description="Agent that can search for information",
        instructions="You are a research assistant. Use the available tools to search arXiv for papers and extract information from web pages.",
        model_client=client,
        tools=create_research_tools(tavily_api_key=tavily_key),
    )

    task = "Search arXiv for papers about 'transformer neural networks' and give me the title and abstract of the most recent paper."

    print(f"\nTask: {task}\n")

    response = await agent.run(task)
    print(f"Agent: {response.messages[-1].content}\n")


async def main():
    """Run all tool demos."""
    print("\n" + "=" * 60)
    print("PICOAGENTS TOOL CATEGORIES DEMO")
    print("=" * 60)
    print("\nThis demo showcases the different tool categories:")
    print("  1. Core Tools (no dependencies)")
    print("  2. Planning Tools (no dependencies)")
    print("  3. Coding Tools (no dependencies)")
    print("  4. Research Tools (requires: httpx, beautifulsoup4, arxiv)")

    await demo_core_tools()

    await demo_planning_tools()

    await demo_coding_tools()

    await demo_research_tools()

    print("\n" + "=" * 60)
    print("ALL DEMOS COMPLETED")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
