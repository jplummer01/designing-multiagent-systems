#!/bin/bash
set -e

echo "🚀 Setting up PicoAgents development environment..."

# Upgrade pip
echo "📦 Upgrading pip..."
python -m pip install --upgrade pip

# Navigate to picoagents directory and install
echo "📦 Installing PicoAgents with all dependencies..."
cd picoagents
pip install -e ".[all]"
cd ..

# Create .env file from example if it doesn't exist
if [ ! -f "picoagents/.env" ]; then
    echo "📝 Creating .env file from template..."
    cp picoagents/.env.example picoagents/.env
    echo "⚠️  Remember to add your OPENAI_API_KEY to picoagents/.env"
fi

# Install Playwright browsers for computer use examples
echo "🌐 Installing Playwright browsers (for computer use agents)..."
playwright install chromium --with-deps || true

echo ""
echo "✅ Setup complete!"
echo ""
echo "📚 Quick Start Guide:"
echo "  1. Add your OpenAI API key to picoagents/.env"
echo "     export OPENAI_API_KEY='your-key-here'"
echo ""
echo "  2. Run an example:"
echo "     python examples/agents/basic-agent.py"
echo ""
echo "  3. Launch the Web UI:"
echo "     picoagents ui"
echo ""
echo "  4. Run tests:"
echo "     cd picoagents && pytest tests/"
echo ""
echo "Happy coding! 🎉"
