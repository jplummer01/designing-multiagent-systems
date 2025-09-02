#!/usr/bin/env python3
"""
Concise example demonstrating structured output in picoagents.
"""

import asyncio
from typing import List, cast
from pydantic import BaseModel, Field
from picoagents import Agent
from picoagents.llm import OpenAIChatCompletionClient
from picoagents.messages import AssistantMessage

class TaskAnalysis(BaseModel):
    """Structured response for task analysis."""
    summary: str = Field(..., description="Brief summary")
    priority: str = Field(..., description="Priority: low/medium/high/urgent")
    estimated_hours: float = Field(..., description="Hours to complete")
    next_steps: List[str] = Field(..., description="Recommended steps")

async def main():
    """Demonstrate structured output vs regular output on the same task."""
    
    client = OpenAIChatCompletionClient(model="gpt-4o-mini")
    task = "Analyze: Build a user authentication system with OAuth2"
    
    print("🎯 SAME TASK, TWO APPROACHES")
    print(f"Task: {task}\n")
    
    # 🔹 Regular Agent (Text Response)
    print("1️⃣ REGULAR AGENT (Text Response)")
    print("=" * 50)
    
    regular_agent = Agent(
        name="analyst",
        description="Task analyst",
        instructions="Analyze tasks and provide very brief summary of insights (5 lines).",
        model_client=client
        # No output_format = regular text response
    )
    
    response = await regular_agent.run(task)
    print("📄 Raw text response:")
    print(response.messages[-1].content)
    print()
    
    # 🔹 Structured Agent (Same Task, Structured Response)
    print("2️⃣ STRUCTURED AGENT (Same Task)")
    print("=" * 50)
    
    structured_agent = Agent(
        name="analyst",
        description="Task analyst", 
        instructions="Analyze tasks and provide very brief summary of insights (5 lines).",
        model_client=client,
        output_format=TaskAnalysis  # 🎯 Only difference: structured output
    )
    
    response = await structured_agent.run(task)
    final_message = response.messages[-1]
    
    print("📊 Structured response:")
    if isinstance(final_message, AssistantMessage) and final_message.structured_content:
        analysis = cast(TaskAnalysis, final_message.structured_content)
        print(f"   📋 Summary: {analysis.summary}")
        print(f"   ⚡ Priority: {analysis.priority}")
        print(f"   ⏰ Estimated Hours: {analysis.estimated_hours}")
        print(f"   ➡️  Next Steps:")
        for i, step in enumerate(analysis.next_steps, 1):
            print(f"      {i}. {step}")
        
        print(f"\n🔍 Raw JSON content: {final_message.content}")
        print(f"✅ Structured content available: {analysis.__class__.__name__}")
    else:
        print("❌ No structured content received")
    
    print("\n🎉 Notice: Same task, different output formats!")
    print("   • Regular: Free-form text (requires parsing)")  
    print("   • Structured: Type-safe objects (direct access)")

if __name__ == "__main__":
    asyncio.run(main())