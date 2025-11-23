# Premium Code Samples

Complete applications demonstrating multi-agent patterns from "Designing Multi-Agent Systems".

## What Are Premium Samples?

These are deployable applications that show how to build multi-agent systems. Each sample includes:

- Backend and frontend source code
- Docker configuration
- Setup instructions
- Documentation

## Access

Premium samples are available to Professional tier book bundle purchasers.

**[Purchase Professional Bundle →](https://buy.multiagentbook.com)**

Already purchased? Sign in at [buy.multiagentbook.com](https://buy.multiagentbook.com) to access your dashboard.

---

## Available Samples

### YC Analysis App

![YC Analysis App](yc-analysis-app/screenshot.jpg)

Analyzes 5,622 Y Combinator companies to identify AI agent trends. Uses a 4-stage workflow with filtering to reduce API costs by 90%.

**Topics covered:**
- Multi-stage workflow orchestration
- Cost optimization through filtering
- Real-time streaming with Server-Sent Events
- Event-driven architecture
- Docker deployment

**Tech Stack:**
- Backend: FastAPI, PicoAgents, Python 3.11+
- Frontend: React 19, TypeScript, Vite, Tailwind CSS v4
- Deployment: Docker, Docker Compose

**Features:**
- Demonstrates a 4-stage workflow pattern: Load → Filter → Classify → Analyze
- Demonstrates cost reduction approaches with 2-stage filtering
- UI integration showing Real-time streaming with Server-Sent Events
- Interactive results dashboard with metrics visualization
- Historical runs gallery and comparison
- Checkpointing and resume capability
- Docker deployment with unified container

**Cost Estimates:**
- 100 companies: ~$0.30
- 500 companies: ~$1.50
- Full dataset (5,622): ~$15.00

**Related Chapters:** 5 (Workflows), 6 (Orchestration), 13 (Case Studies)

[📂 View Full README](./yc-analysis-app/) • [📚 Documentation](https://github.com/victordibia/designing-multiagent-systems/blob/main/premium-samples/yc-analysis-app/README.md)

---

## Coming Soon

More premium samples are in development:

- **Data Visualization Agent** - AI-powered chart generation from CSV files
- **Multi-Agent Research Assistant** - Coordinated agents for literature review
- **Code Review Workflow** - Automated code analysis and improvement suggestions

---

## How to Use

### 1. Purchase Access
Premium samples are included with the Professional tier book bundle ($149).

[Purchase Now →](https://buy.multiagentbook.com)

### 2. Download
1. Go to [buy.multiagentbook.com](https://buy.multiagentbook.com)
2. Click "Sign In" (top right)
3. Sign in to view your dashboard and download samples

### 3. Run
Each sample includes a quick-start guide for Docker deployment:

```bash
# Extract the zip
unzip yc-analysis-app.zip
cd yc-analysis-app/

# Configure API keys
cp .env.example backend/.env
# Edit backend/.env with your API credentials

# Start with Docker
docker-compose up --build

# Access at http://localhost:8000
```

---

## Support

- **Documentation**: Each sample includes comprehensive README and QUICK_START guides
- **Email Support**: support@multiagentbook.com
- **Dashboard**: https://buy.multiagentbook.com/dashboard

---

## License

Premium samples are licensed under MIT for commercial use by Professional and Enterprise tier buyers. See individual sample LICENSE files for details.

---

## Metadata API

For programmatic access to sample information, use:

```
https://raw.githubusercontent.com/victordibia/designing-multiagent-systems/main/premium-samples/samples.json
```

This JSON file contains structured metadata for all available samples, including titles, descriptions, tech stacks, features, and download information.
