# Copyright (c) Microsoft. All rights reserved.
"""DevOps troubleshooting agent for Agent Framework Debug UI.

This agent demonstrates:
- Multiple safe operations (listing files, checking Azure status, reading logs)
- Function approvals for sensitive operations (editing source code)
- Thread persistence for async approval workflows

Try asking: "Check the deployment status of our web app and address any issues"
"""

import os
import subprocess
from collections.abc import Awaitable, Callable
from typing import Annotated

from agent_framework import (
    ChatAgent,
    ChatContext,
    ChatMessage,
    ChatResponse,
    FunctionInvocationContext,
    Role,
    ai_function,
    chat_middleware,
    function_middleware,
)
from agent_framework.azure import AzureOpenAIChatClient


@chat_middleware
async def security_filter_middleware(
    context: ChatContext,
    next: Callable[[ChatContext], Awaitable[None]],
) -> None:
    """Chat middleware that blocks requests containing sensitive information."""
    # Block requests with sensitive information
    blocked_terms = ["password", "secret", "api_key", "token"]

    for message in context.messages:
        if message.text:
            message_lower = message.text.lower()
            for term in blocked_terms:
                if term in message_lower:
                    # Override the response without calling the LLM
                    context.result = ChatResponse(
                        messages=[
                            ChatMessage(
                                role=Role.ASSISTANT,
                                text=(
                                    "I cannot process requests containing sensitive information. "
                                    "Please rephrase your question without including passwords, secrets, "
                                    "or other sensitive data."
                                ),
                            )
                        ]
                    )
                    return

    await next(context)


@function_middleware
async def production_guard_middleware(
    context: FunctionInvocationContext,
    next: Callable[[FunctionInvocationContext], Awaitable[None]],
) -> None:
    """Function middleware that prevents operations on production files."""
    # Check if file_path parameter contains "production"
    file_path = getattr(context.arguments, "file_path", None)
    if file_path and "production" in file_path.lower():
        context.result = (
            "Blocked! Cannot edit production files directly. "
            "Please use a development or staging environment."
        )
        context.terminate = True
        return

    await next(context)


# Safe operations - execute immediately
@ai_function
def list_files(directory: Annotated[str, "The directory to list files from"]) -> str:
    """List files in a directory."""
    try:
        result = subprocess.run(
            f"ls -la {directory}",
            shell=True,
            capture_output=True,
            text=True,
            timeout=5,
        )
        return result.stdout if result.returncode == 0 else f"Error: {result.stderr}"
    except subprocess.TimeoutExpired:
        return "Error: Command timed out"
    except Exception as e:
        return f"Error: {str(e)}"


@ai_function
def check_azure_webapp_status(
    webapp_name: Annotated[str, "The name of the Azure web app"],
    resource_group: Annotated[str, "The Azure resource group name"],
) -> str:
    """Check Azure web app status using az CLI."""
    try:
        # Simulated response since we may not have actual Azure resources
        return f"""
Simulated Azure Web App Status for {webapp_name}:
- Resource Group: {resource_group}
- Status: Running with errors
- HTTP Status: 500 (Internal Server Error)
- Error Count: 127 in last hour
- Last Deployment: 2 hours ago
- Health Status: Unhealthy

Common errors:
- NullPointerException in payment_handler.py (92 occurrences)
- Database connection timeout (35 occurrences)

Note: This is a simulated response for demo purposes.
"""
    except Exception as e:
        return f"Error checking Azure status: {str(e)}"


@ai_function
def read_log_file(
    log_path: Annotated[str, "Path to the log file to read"]
) -> str:
    """Read application log file."""
    # Simulated log content for demo purposes
    simulated_logs = """
[2024-10-09 14:23:15] ERROR - NullPointerException in payment_handler.py:line 47
[2024-10-09 14:23:15] Traceback:
  File "src/payment_handler.py", line 47, in process_payment
    billing_address = customer.billing_address.street
AttributeError: 'NoneType' object has no attribute 'street'

[2024-10-09 14:25:32] ERROR - NullPointerException in payment_handler.py:line 47
[2024-10-09 14:25:32] Same error repeated

[2024-10-09 14:27:18] INFO - Customer ID 12345 attempted payment without billing address
[2024-10-09 14:27:18] ERROR - NullPointerException in payment_handler.py:line 47
"""

    try:
        # In a real scenario, you would actually read the file
        # with open(log_path, 'r') as f:
        #     return f.read()
        return f"Contents of {log_path}:\n{simulated_logs}\n\nNote: This is simulated log content for demo purposes."
    except Exception as e:
        return f"Error reading log file: {str(e)}"


@ai_function
def scan_codebase(
    pattern: Annotated[str, "The pattern to search for"],
    directory: Annotated[str, "The directory to search in"],
) -> str:
    """Search for patterns in the codebase using grep."""
    # Simulated code search results for demo purposes
    simulated_results = """
src/payment_handler.py:45:    def process_payment(self, customer):
src/payment_handler.py:46:        # Process customer payment
src/payment_handler.py:47:        billing_address = customer.billing_address.street
src/payment_handler.py:48:        # ... rest of payment logic

Found the issue: Line 47 accesses customer.billing_address.street without
checking if billing_address is None first.

Note: This is simulated search output for demo purposes.
"""

    try:
        # In a real scenario, you would run: grep -r pattern directory
        # result = subprocess.run(...)
        return f"Searching for '{pattern}' in {directory}:\n{simulated_results}"
    except Exception as e:
        return f"Error scanning codebase: {str(e)}"


# Dangerous operation - requires approval
@ai_function(approval_mode="always_require")
def edit_file(
    file_path: Annotated[str, "The path to the file to edit"],
    old_content: Annotated[str, "The exact content to replace"],
    new_content: Annotated[str, "The new content to insert"],
) -> str:
    """Edit a source code file. Requires approval.

    This is a sensitive operation that modifies source code,
    so it requires explicit human approval before execution.
    """
    # Simulated file edit for demo purposes
    return f"""
Simulated file edit for {file_path}:

OLD:
{old_content}

NEW:
{new_content}

File would be updated successfully.

Note: This is a simulated edit for demo purposes. In production, this would
actually modify the file after receiving approval.
"""


# Agent instance following Agent Framework conventions
agent = ChatAgent(
    name="DevOpsBot",
    description="A DevOps troubleshooting agent that diagnoses deployment issues and proposes fixes",
    instructions="""
You are a DevOps troubleshooting assistant. You help engineers diagnose and fix deployment issues.

IMPORTANT: When asked to "check deployment status and address any issues", you should AUTOMATICALLY:
1. Check the Azure web app status (use check_azure_webapp_status with webapp_name="contoso app" and resource_group="rg-contoso")
2. If errors are found, read the application logs (use read_log_file with log_path="/var/log/app/error.log")
3. Analyze the errors to identify patterns
4. Scan the codebase for the problematic code (use scan_codebase to find the bug)
5. Identify the root cause and formulate a fix
6. Propose the fix by calling edit_file with the exact old and new content

When editing files:
- Always explain WHY the change is needed based on your investigation
- Show the exact old and new content
- Be precise about the file path and line numbers
- Reference the errors you found in the logs

Be thorough, autonomous in your investigation, and always prioritize code safety.
""",
    chat_client=AzureOpenAIChatClient(
        api_key=os.environ.get("AZURE_OPENAI_API_KEY", ""),
    ),
    tools=[
        list_files,
        check_azure_webapp_status,
        read_log_file,
        scan_codebase,
        edit_file,
    ],
    middleware=[security_filter_middleware, production_guard_middleware],
)


def main():
    """Launch the DevOps troubleshooting agent in DevUI."""
    import logging

    from agent_framework.devui import serve

    # Setup logging
    logging.basicConfig(level=logging.INFO, format="%(message)s")
    logger = logging.getLogger(__name__)

    logger.info("Starting DevOps Troubleshooting Agent")
    logger.info("Available at: http://localhost:8090")
    logger.info("Entity ID: agent_DevOpsBot")
    logger.info("")
    logger.info("Try asking:")
    logger.info("  'Check the deployment status of our web app and address any issues'")
    logger.info("  'List files in the src directory'")
    logger.info("  'Read the application logs'")

    # Launch server with the agent
    serve(entities=[agent], port=8092, auto_open=True)


if __name__ == "__main__":
    main()
