"""
Webpage summarization workflow example: HTTP fetch → PicoAgent summarize
"""

import asyncio
from pydantic import BaseModel

from picoagents.orchestration.workflow import (
    Workflow, WorkflowRunner, WorkflowMetadata, StepMetadata, Context,
    HttpStep, PicoAgentStep, TransformStep,
    HttpRequestInput, HttpResponseOutput,
    PicoAgentInput, PicoAgentOutput
)

# Import picoagents components
from picoagents.agents import Agent
from picoagents.llm import OpenAIChatCompletionClient
    

# Define data models for the workflow
class WebpageInput(BaseModel):
    url: str


class SummaryOutput(BaseModel):
    summary: str
    original_url: str
    model_used: str
    tokens_used: int


# Define step functions for data transformation
async def prepare_http_request(input_data: WebpageInput, _context: Context) -> HttpRequestInput:
    """Prepare HTTP request from workflow input."""
    return HttpRequestInput(
        url=input_data.url,
        method="GET",
        timeout=30,
        verify_ssl=True
    )


def handle_workflow_event(event, execution_ref: list):
    """Handle workflow events and update execution reference."""
    print(f"🎯 {event.event_type}: ", end="")
    
    if event.event_type == "workflow_started":
        print(f"Started with input: {getattr(event, 'initial_input', 'unknown')}")
        
    elif event.event_type == "step_started":
        step_id = getattr(event, 'step_id', 'unknown')
        print(f"Step '{step_id}' started")
        input_data = getattr(event, 'input_data', {})
        if step_id == "http_fetch":
            print(f"    Fetching: {input_data.get('url', 'unknown') if isinstance(input_data, dict) else 'unknown'}")
        elif step_id == "transform_to_agent_input":
            print(f"    Transforming HTTP response to Agent input")
        elif step_id == "agent_summarize":
            print(f"    Summarizing with PicoAgent")
        
    elif event.event_type == "step_completed":
        step_id = getattr(event, 'step_id', 'unknown')
        duration = getattr(event, 'duration_seconds', 0)
        print(f"Step '{step_id}' completed in {duration:.2f}s")
        output_data = getattr(event, 'output_data', {})
        if step_id == "http_fetch" and isinstance(output_data, dict):
            status_code = output_data.get('status_code', 'unknown')
            content_length = len(output_data.get('content', ''))
            print(f"    Status: {status_code}, Content length: {content_length} chars")
        elif step_id == "transform_to_agent_input":
            print(f"    Transformed to Agent input")
        elif step_id == "agent_summarize" and isinstance(output_data, dict):
            metadata = output_data.get('metadata', {})
            usage = output_data.get('usage', {})
            message_count = metadata.get('message_count', 'unknown') if isinstance(metadata, dict) else 'unknown'
            elapsed_time = metadata.get('elapsed_time', 'unknown') if isinstance(metadata, dict) else 'unknown'
            tokens_total = usage.get('tokens_input', 0) + usage.get('tokens_output', 0) if isinstance(usage, dict) else 0
            print(f"    Messages: {message_count}, Time: {elapsed_time}s, Tokens: {tokens_total}")
        
    elif event.event_type == "step_failed":
        step_id = getattr(event, 'step_id', 'unknown')
        duration = getattr(event, 'duration_seconds', 0)
        error = getattr(event, 'error', 'unknown error')
        print(f"Step '{step_id}' failed in {duration:.2f}s: {error}")
        
    elif event.event_type == "edge_activated":
        from_step = getattr(event, 'from_step', 'unknown')
        to_step = getattr(event, 'to_step', 'unknown')
        print(f"Edge '{from_step}' → '{to_step}' activated")
        
    elif event.event_type == "workflow_completed":
        print(f"Workflow completed successfully!")
        execution_ref[0] = getattr(event, 'execution', None)
        
    elif event.event_type == "workflow_failed":
        error = getattr(event, 'error', 'unknown error')
        print(f"Workflow failed: {error}")
        execution_ref[0] = getattr(event, 'execution', None)


async def format_final_output(input_data: PicoAgentOutput, context: Context) -> SummaryOutput:
    """Format the final output combining agent response with metadata."""
    # Get original URL from context
    http_request_info = context.get('http_fetch_request_info', {})
    original_url = http_request_info.get('url', 'unknown')
    
    return SummaryOutput(
        summary=input_data.response,
        original_url=original_url,
        model_used=input_data.metadata.get('agent_name', 'unknown') if input_data.metadata else 'unknown',
        tokens_used=input_data.usage.get('tokens_input', 0) + input_data.usage.get('tokens_output', 0) if input_data.usage else 0
    )


async def main():
    """Run the webpage summarization workflow example."""
    
    print("=== Webpage Summarization Workflow Example ===")
    print("Flow: URL → HTTP Fetch → Agent Summarize → Formatted Output")
    print("")
    
    # Create steps
    http_step = HttpStep(
        step_id="http_fetch",
        metadata=StepMetadata(
            name="HTTP Fetch",
            description="Fetch webpage content",
            tags=["http", "fetch"]
        )
    )
    
    # Transformation step to convert HTTP response to Agent input
    transform_step = TransformStep(
        step_id="transform_to_agent_input",
        metadata=StepMetadata(
            name="Transform to Agent Input",
            description="Transform HTTP response to Agent input",
            tags=["transform"]
        ),
        input_type=HttpResponseOutput,
        output_type=PicoAgentInput,
        mappings={
            "task": "static:Please summarize the following HTML content in 2-3 sentences, focusing on the main topic and key information: {content}"
        }
    )
    
    
    # Create PicoAgents client and agent
    llm_client = OpenAIChatCompletionClient(
        model="gpt-4o-mini",
        # API key will be loaded from environment variables
    )
    
    # Create PicoAgent
    agent = Agent(
        name="summarizer", 
        description="Web content summarization agent",
        instructions="You are a helpful assistant that summarizes web content. Provide concise, informative summaries.",
        model_client=llm_client
    )
    
    agent_step = PicoAgentStep(
        step_id="agent_summarize",
        metadata=StepMetadata(
            name="PicoAgent Summarize",
            description="Summarize content using PicoAgents AI agent",
            tags=["picoagents", "ai", "summarize"]
        ),
        agent=agent
    )
    
    # Create workflow
    workflow = Workflow(
        metadata=WorkflowMetadata(
            name="Webpage Summarization",
            description="Fetch a webpage and summarize its content using AI",
            tags=["web", "summarization", "ai"]
        )
    )
    
    workflow.add_step(http_step)
    workflow.add_step(transform_step)
    workflow.add_step(agent_step)
    
    # Create sequence
    workflow.add_edge("http_fetch", "transform_to_agent_input")
    workflow.add_edge("transform_to_agent_input", "agent_summarize")
    
    workflow.set_start_step("http_fetch")
    workflow.add_end_step("agent_summarize")

    # Run workflow with streaming events
    runner = WorkflowRunner()
    initial_input = {"url": "https://httpbin.org/html"}
    print(f"\nRunning workflow with input: {initial_input}")
    print("\n=== Streaming Events ===")
    execution_ref = [None]
    async for event in runner.run_stream(workflow, initial_input):
        handle_workflow_event(event, execution_ref)
    execution = execution_ref[0]
    
    if execution is None:
        print("❌ No final execution received!")
    else:
        print("\n=== Final Results ===")
        for step_id, step_exec in execution.step_executions.items():
            print(f"{step_id}: {step_exec.status}")
    
        print("\n=== Shared Workflow State ===")
        state_keys = list(execution.state.keys())
        print(f"State keys: {state_keys}")
        
        # Show request info for debugging
        for step_id in ["http_fetch", "agent_summarize"]:
            request_info = execution.state.get(f'{step_id}_request_info')
            if request_info:
                print(f"\n{step_id} request info:")
                for key, value in request_info.items():
                    print(f"  {key}: {value}")


if __name__ == "__main__":
    asyncio.run(main()) 