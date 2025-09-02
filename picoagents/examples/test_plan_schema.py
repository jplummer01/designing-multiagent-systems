#!/usr/bin/env python3
"""
Isolated test for plan generation schema debugging.

This test helps debug the OpenAI structured output schema issues
with ExecutionPlan and StepProgressEvaluation models.
"""

import asyncio
import json
from pydantic import BaseModel, Field
from typing import List
from picoagents.llm import OpenAIChatCompletionClient
from picoagents.messages import UserMessage

# Test versions of our models to debug schema issues
class TestPlanStep(BaseModel):
    """Test plan step for schema debugging."""
    model_config = {"extra": "forbid"}
    
    task: str = Field(description="Clear, actionable task description")
    agent_name: str = Field(description="Name of the agent that should handle this step")
    reasoning: str = Field(description="Brief explanation for why this agent was chosen")

class TestExecutionPlan(BaseModel):
    """Test execution plan for schema debugging."""
    model_config = {"extra": "forbid"}
    
    steps: List[TestPlanStep] = Field(description="Ordered list of execution steps")

class TestStepProgressEvaluation(BaseModel):
    """Test step progress evaluation for schema debugging."""
    model_config = {"extra": "forbid"}
    
    step_completed: bool = Field(description="Whether the step was successfully completed")
    failure_reason: str = Field(description="Brief explanation if step failed, use 'None' if successful")
    confidence_score: float = Field(description="Confidence in the evaluation (0.0 to 1.0)", ge=0.0, le=1.0)
    suggested_improvements: List[str] = Field(description="Specific suggestions for retry if step failed")

async def test_plan_generation():
    """Test plan generation with schema debugging."""
    print("🧪 Testing Plan Generation Schema...")
    
    client = OpenAIChatCompletionClient(model="gpt-4o-mini")
    
    # Print the schema to see what's being sent
    print("\n📋 ExecutionPlan Schema:")
    plan_schema = TestExecutionPlan.model_json_schema()
    print(json.dumps(plan_schema, indent=2))
    
    planning_prompt = """You are a helpful assistant that breaks down tasks into executable steps.

Available agents and their capabilities:
- researcher: Research specialist who gathers and analyzes information from various sources
- writer: Technical writer who creates clear, well-structured documentation  
- reviewer: Quality reviewer who evaluates content for accuracy and completeness

User task: Research and write a comprehensive guide about the benefits of renewable energy sources

Generate a step-by-step execution plan. For each step:
- Assign it to the agent best suited for that type of work
- Provide clear, actionable task description  
- Explain briefly why that agent was chosen

Keep it simple and focused. Multiple steps can use the same agent if appropriate."""
    
    try:
        # Test plan generation
        result = await client.create(
            messages=[UserMessage(content=planning_prompt, source="planner")],
            output_format=TestExecutionPlan
        )
        
        if result.structured_output:
            print("\n✅ Plan Generation Successful!")
            plan = result.structured_output
            print(f"Generated {len(plan.steps)} steps:")
            for i, step in enumerate(plan.steps, 1):
                print(f"  {i}. {step.task} (Agent: {step.agent_name})")
        else:
            print(f"\n❌ Plan Generation Failed - No structured output")
            print(f"Raw response: {result.content}")
            
    except Exception as e:
        print(f"\n❌ Plan Generation Failed with error: {e}")

async def test_step_evaluation():
    """Test step evaluation schema."""
    print("\n\n🧪 Testing Step Evaluation Schema...")
    
    client = OpenAIChatCompletionClient(model="gpt-4o-mini")
    
    # Print the schema
    print("\n📋 StepProgressEvaluation Schema:")
    eval_schema = TestStepProgressEvaluation.model_json_schema()
    print(json.dumps(eval_schema, indent=2))
    
    evaluation_prompt = """Evaluate whether the following step was successfully completed based on the agent's output.

Step Task: Research renewable energy benefits
Expected Agent: researcher
Reasoning: Research specialist best suited for information gathering

Agent's Output:
**Guide to the Benefits of Renewable Energy Sources**

Renewable energy sources have gained significant importance due to their environmental and economic advantages:

1. **Environmental Benefits**: Reduced greenhouse gas emissions and minimal environmental impact
2. **Economic Advantages**: Long-term cost savings and job creation in green sectors  
3. **Energy Security**: Reduced dependence on fossil fuel imports
4. **Sustainability**: Inexhaustible energy sources for future generations

This covers the key benefits comprehensively with supporting evidence.

Evaluate:
1. Was the step task completed successfully?
2. If not, what was the main failure reason?
3. How confident are you in this assessment (0.0 to 1.0)?
4. If the step failed, provide 2-3 specific suggestions for improvement.

Consider the step successful if the agent made meaningful progress toward the stated goal, even if not perfect."""
    
    try:
        # Test evaluation
        result = await client.create(
            messages=[UserMessage(content=evaluation_prompt, source="step_evaluator")],
            output_format=TestStepProgressEvaluation
        )
        
        if result.structured_output:
            print("\n✅ Step Evaluation Successful!")
            eval_result = result.structured_output
            print(f"Step completed: {eval_result.step_completed}")
            print(f"Confidence: {eval_result.confidence_score}")
            if eval_result.failure_reason:
                print(f"Failure reason: {eval_result.failure_reason}")
            if eval_result.suggested_improvements:
                print(f"Suggestions: {eval_result.suggested_improvements}")
        else:
            print(f"\n❌ Step Evaluation Failed - No structured output")
            print(f"Raw response: {result.content}")
            
    except Exception as e:
        print(f"\n❌ Step Evaluation Failed with error: {e}")

async def test_minimal_schema():
    """Test with minimal schema to isolate the issue."""
    print("\n\n🧪 Testing Minimal Schema...")
    
    class MinimalModel(BaseModel):
        name: str
        count: int
        
    client = OpenAIChatCompletionClient(model="gpt-4o-mini")
    
    print("\n📋 Minimal Schema:")
    minimal_schema = MinimalModel.model_json_schema()
    print(json.dumps(minimal_schema, indent=2))
    
    try:
        result = await client.create(
            messages=[UserMessage(content="Generate a name and count. Name should be 'test', count should be 42.", source="test")],
            output_format=MinimalModel
        )
        
        if result.structured_output:
            print(f"\n✅ Minimal Schema Successful: {result.structured_output}")
        else:
            print(f"\n❌ Minimal Schema Failed")
            
    except Exception as e:
        print(f"\n❌ Minimal Schema Failed: {e}")

async def main():
    """Run all schema tests."""
    await test_minimal_schema()
    await test_plan_generation() 
    await test_step_evaluation()

if __name__ == "__main__":
    asyncio.run(main())