# GitHub Codespaces Configuration

This directory contains the configuration for GitHub Codespaces, enabling one-click development environments in the browser.

## What's Included

### Container Configuration (`devcontainer.json`)

- **Base Image**: Python 3.11 (Debian Bullseye)
- **VS Code Extensions**:
  - Python language support
  - Pylance (advanced IntelliSense)
  - Black formatter
  - Ruff linter
  - Jupyter notebooks
- **Port Forwarding**:
  - 8000: PicoAgents WebUI
  - 8080: Development server
- **Auto-setup**: Runs `setup.sh` on container creation

### Setup Script (`setup.sh`)

Automatically installs:
1. PicoAgents with all dependencies (`[all]` extras)
2. Playwright browsers (for computer use agents)
3. Creates `.env` file from template

## Usage

### Starting a Codespace

1. Click the "Open in GitHub Codespaces" badge in the main README
2. Wait for the container to build (~2-3 minutes on first run)
3. Add your `OPENAI_API_KEY` to `picoagents/.env`
4. Start coding!

### Quick Commands

```bash
# Run an example
python examples/agents/basic-agent.py

# Launch Web UI
picoagents ui

# Run tests
cd picoagents && pytest tests/

# Type checking
cd picoagents && python -m mypy src/
```

## Customization

### Adding VS Code Extensions

Edit `devcontainer.json` → `customizations.vscode.extensions`:

```json
"extensions": [
  "ms-python.python",
  "your.extension.id"
]
```

### Adding System Packages

Edit `setup.sh` to include `apt-get install` commands.

### Changing Python Version

Edit `devcontainer.json` → `image`:

```json
"image": "mcr.microsoft.com/devcontainers/python:1-3.10-bullseye"
```

## Troubleshooting

### Setup script fails

Re-run manually:
```bash
bash .devcontainer/setup.sh
```

### Missing API key

Add to your shell session:
```bash
export OPENAI_API_KEY='your-key-here'
```

Or add to `picoagents/.env`:
```bash
echo "OPENAI_API_KEY=your-key-here" >> picoagents/.env
```

### Playwright browsers not installed

```bash
playwright install chromium --with-deps
```

## Cost

- **Free tier**: 60 hours/month for individual GitHub accounts
- **Pro tier**: 180 hours/month
- **Billing**: Charged per minute of usage

Learn more: https://docs.github.com/en/billing/managing-billing-for-github-codespaces

## Local Development Containers

This configuration also works with VS Code's Dev Containers extension:

1. Install [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
2. Open repository in VS Code
3. Command Palette → "Dev Containers: Reopen in Container"
