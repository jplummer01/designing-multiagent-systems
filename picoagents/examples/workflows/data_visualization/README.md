# Data Visualization Workflow

This workflow demonstrates automated data visualization generation using LLM-powered workflows. It showcases production patterns for safe code generation and execution.

## Features

- **Intelligent Data Summarization**: LLM-powered understanding of data context
- **Structured Goal Generation**: Diverse visualization objectives with validation
- **Safe Code Generation**: Multi-layer security validation for LLM-generated code
- **Sandboxed Execution**: Controlled environment for running visualization code
- **Production Patterns**: Checkpointing, error handling, and independent testing

## Quick Start

### Prerequisites

1. Set environment variables:
```bash
export AZURE_OPENAI_ENDPOINT="your-endpoint"
export AZURE_OPENAI_API_KEY="your-key"
```

2. Install dependencies:
```bash
pip install pandas matplotlib seaborn numpy
```

### Running the Workflow

```bash
# Basic usage with sample data
python workflow.py

# Test with your own data
python workflow.py --data-file your_data.csv
```

### Example Output

The workflow generates:
- `viz_output/chart_*.png` - Generated visualizations
- `viz_output/visualization_report.md` - Summary report
- Checkpoint files for resumability

## Architecture

The workflow follows the same patterns as the YC analysis example:

1. **Data Loading & Summarization** (`load_and_summarize_data`)
   - Loads CSV data with intelligent caching
   - Generates LLM-powered contextual summary
   - Identifies visualization opportunities

2. **Goal Generation** (`generate_visualization_goals`)
   - Creates diverse analytical questions
   - Suggests appropriate chart types
   - Validates column references

3. **Code Generation** (`generate_visualization_code`)
   - Generates Python visualization code
   - Validates code safety before execution
   - Supports multiple visualization libraries

4. **Safe Execution** (`execute_visualization_codes`)
   - Runs code in restricted environment
   - Applies timeouts and resource limits
   - Saves charts with proper cleanup

## Safety Features

### Code Validation
- Static analysis for dangerous patterns
- Import whitelisting (only safe libraries)
- No file I/O or network access allowed

### Execution Sandboxing
- Restricted global namespace
- Timeout controls (30s default)
- Automatic resource cleanup
- Error isolation between visualizations

## Testing

```bash
# Run unit tests
python test_workflow.py

# Test individual components
python -m pytest test_workflow.py -v
```

## Configuration

Key configuration options in `VisualizationConfig`:

- `data_file`: Path to CSV data file
- `output_dir`: Directory for generated charts
- `max_goals`: Number of visualization goals to generate
- `grammar_preference`: Visualization library ("matplotlib", "seaborn", "plotly")
- `execution_timeout`: Maximum code execution time
- `force_refresh`: Skip cache and regenerate everything

## Production Considerations

### Security
- Use stronger sandboxing for production (containers, restricted Python)
- Implement user quotas and rate limiting
- Audit generated code before execution
- Monitor resource usage

### Scalability
- Implement distributed execution for large datasets
- Add queue-based processing for multiple users
- Cache visualization templates for common patterns
- Use async processing for I/O intensive operations

### Monitoring
- Track code generation success rates
- Monitor execution failures and security violations
- Measure end-to-end latency and cost
- Alert on unusual patterns or errors

## Integration with Book Chapter

This implementation powers Chapter 13: "Building Automated Data Visualization Systems" and demonstrates:

- Creative LLM applications with safety constraints
- Production workflow patterns for code generation
- Independent component testing strategies
- Real-world security considerations for AI systems

The workflow follows the same engineering principles as the data analysis chapter while addressing the unique challenges of safe code execution.