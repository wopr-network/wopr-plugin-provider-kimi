# wopr-plugin-provider-kimi

Moonshot AI Kimi Code CLI provider plugin for WOPR.

## Installation

```bash
wopr plugin install wopr-plugin-provider-kimi
```

## Configuration

Add your Moonshot API key:

```bash
wopr providers add kimi sk-...
```

## Usage

Create a session with Kimi provider:

```bash
wopr session create my-session --provider kimi
```

Or set provider on existing session:

```bash
wopr session set-provider my-session kimi
```

## Supported Models

- `kimi-k2` (default) - Kimi K2 model
- `kimi-for-coding` - Optimized for coding tasks

## Development

```bash
npm install
npm run build
```

## About Kimi Code CLI

Kimi Code CLI is Moonshot AI's terminal-based AI agent for software development.
Learn more: https://www.kimi.com/code
