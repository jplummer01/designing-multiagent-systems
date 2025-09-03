# Designing Multi-Agent Systems

Official code repository for **"Designing Multi-Agent Systems: Principles, Patterns, and Implementation for AI Agents"** by Victor Dibia.

![Designing Multi-Agent Systems](../../../images/bookcover.png)

Learn to build effective multi-agent systems from first principles (from scratch) through complete, tested implementations.

## Why This Book & Code Repository?

As the AI agent space evolves rapidly, clear patterns are emerging for building effective multi-agent systems. This book focuses on identifying these patterns and providing practical guidance for applying them effectively.

**What makes this approach unique:**

- **Fundamentals-first**: Build from scratch to understand every component and design decision
- **Complete implementations**: Every theoretical concept backed by working, tested code
- **Framework-agnostic**: Core patterns that transcend any specific framework
- **Production considerations**: Evaluation, optimization, and deployment guidance from real-world experience

## What You'll Learn & Build

The book is organized across 4 parts, taking you from theory to production:

### Part I: Foundations of Multi-Agent Systems

| Chapter | Title | Code | Learning Outcome |
|---------|-------|------|------------------|
| **Ch 1** | Understanding Multi-Agent Systems | - | Understand when multi-agent systems are needed |
| **Ch 2** | Multi-Agent Patterns | - | Master coordination strategies (workflows vs autonomous) |
| **Ch 3** | UX of Multi-Agent Systems | - | Build intuitive agent interfaces |

### Part II: Building Multi-Agent Systems from Scratch

| Chapter | Title | Code | Learning Outcome |
|---------|-------|------|------------------|
| **Ch 4** | Building Your First Agent | [`01_basic_agent.py`](picoagents/examples/01_basic_agent.py) | Create agents with reasoning, tools, memory |
| **Ch 5** | Building Multi-Agent Workflows | [`workflow/`](picoagents/workflow/) | Build deterministic multi-agent systems |
| **Ch 6** | Autonomous Multi-Agent Orchestration | [`orchestration/`](picoagents/orchestration/) | Create adaptive agent coordination |
| **Ch 6** | Multi-Agent Frameworks | - | Compare and evaluate existing frameworks |

### Part III: Evaluating and Optimizing Multi-Agent Systems  

| Chapter | Title | Code | Learning Outcome |
|---------|-------|------|------------------|
| **Ch 8** | Evaluating Multi-Agent Systems | Evaluation framework | Measure and improve agent performance |

### Part IV: Real-World Applications

| Chapter | Title | Code | Learning Outcome |
|---------|-------|------|------------------|
| **Ch 12** | Multi-Perspective Information Processing | Complete case study | Deploy production multi-agent systems |

## Getting Started

### Installation

```bash
# Clone the repository
git clone https://github.com/victordibia/designing-multiagent-systems.git
cd designing-multiagent-systems

# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install the picoagents library
cd picoagents
pip install -e .

# Set up your API key
export OPENAI_API_KEY="your-api-key-here"
```

### Quick Start: Your First Agent

```python
from picoagents import Agent, OpenAIChatCompletionClient

def get_weather(location: str) -> str:
    """Get current weather for a given location."""
    return f"The weather in {location} is sunny, 75°F"

# Create an agent
agent = Agent(
    name="assistant",
    instructions="You are helpful. Use tools when appropriate.",
    model_client=OpenAIChatCompletionClient(model="gpt-4o-mini"),
    tools=[get_weather]
)

# Use the agent
response = await agent.run("What's the weather in Paris?")
print(response.messages[-1].content)
```

### Explore the Examples

```bash
# Run basic agent example
python picoagents/examples/01_basic_agent.py

# Try autonomous orchestration
python picoagents/examples/02_roundrobin_orchestration.py
```

## PicoAgents Framework

The [`picoagents/`](picoagents/) directory contains a complete multi-agent framework built from scratch to demonstrate every concept in the book:

```
picoagents/
├── agents.py          # Core Agent implementation (Ch 4)
├── workflow/          # Explicit control patterns (Ch 5)
├── orchestration/     # Autonomous control patterns (Ch 6)
├── examples/          # Complete chapter implementations
└── tests/            # Comprehensive test suite
```

## Get the Book

**"Designing Multi-Agent Systems: Principles, Patterns, and Implementation for AI Agents"**

This repository implements every concept from the book. The book provides the theory, design trade-offs, and production considerations you need to build effective multi-agent systems.

## Questions and Feedback

Questions or feedback about the book or code? Please [open an issue](https://github.com/victordibia/designing-multiagent-systems/issues).

## Citation

```bibtex
@book{dibia2025multiagent,
  title={Designing Multi-Agent Systems: Principles, Patterns, and Implementation for AI Agents},
  author={Dibia, Victor},
  year={2025},
  github={https://github.com/victordibia/designing-multiagent-systems}
}
```
