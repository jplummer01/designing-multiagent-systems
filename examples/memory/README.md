# Memory Tool Examples

This directory contains examples demonstrating PicoAgents' MemoryTool for cross-conversation learning.

## Files

- **`memory_tool_example.py`** - Complete examples showing:
  - Code review with cross-session learning
  - All memory operations (view, create, edit, delete, rename)
  - Memory organization patterns

## Running the Examples

```bash
# Navigate to examples directory
cd /path/to/designing-multiagent-systems/examples/memory

# Run all demos
python memory_tool_example.py
```

## Requirements

Ensure you have your API key configured:

```bash
# Set environment variable
export OPENAI_API_KEY="your-key-here"

# Or create .env file in project root
echo "OPENAI_API_KEY=your-key-here" > ../../.env
```

## What You'll See

### Demo 1: Code Review with Cross-Session Learning

- **Session 1**: Agent reviews code with a race condition, stores the pattern in memory
- **Session 2**: Agent reviews similar async code, applies the learned pattern immediately

### Demo 2: Memory Operations

Demonstrates all 6 memory operations:
- `view` - Show directory or file contents
- `create` - Create new files
- `str_replace` - Edit file contents
- `insert` - Insert text at specific line
- `delete` - Remove files
- `rename` - Rename or move files

### Demo 3: Memory Organization

Shows how to organize memory into directories:
```
/memories/
  ├── patterns/     # Code patterns
  ├── bugs/         # Known bugs
  ├── projects/     # Project notes
  └── users/        # User preferences
```

## Key Concepts Demonstrated

1. **Cross-Session Learning**: Memory persists between agent conversations
2. **Agent Autonomy**: Agents actively manage their own knowledge
3. **File Organization**: Structured memory with directories
4. **Pattern Recognition**: Applying learned patterns to new problems

## Related Documentation

- [Memory Tool Documentation](../../picoagents/docs/memory_tool.md)
- [PicoAgents README](../../picoagents/README.md)
- [Book Chapter on Memory](../../../../chapters/) (coming soon)

## Comparison with Anthropic

This implementation mirrors Anthropic's memory tool:
- Same 6 operations
- Same file-based approach
- Same agent-driven memory management

See [Memory Comparison](../../../../misc/memory_comparison_summary.md) for detailed comparison.
