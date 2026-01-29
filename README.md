# 🌙 wopr-plugin-provider-kimi

[![npm version](https://img.shields.io/npm/v/wopr-plugin-provider-kimi.svg)](https://www.npmjs.com/package/wopr-plugin-provider-kimi)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![WOPR](https://img.shields.io/badge/WOPR-Plugin-blue)](https://github.com/TSavo/wopr)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/Python-3.12+-blue.svg)](https://python.org/)

> Moonshot AI Kimi Code CLI provider plugin for [WOPR](https://github.com/TSavo/wopr) - Self-sovereign AI session management over P2P.

[Kimi Code CLI](https://www.kimi.com/code) is Moonshot AI's terminal-based AI agent for software development, offering powerful code generation, analysis, and task automation capabilities.

---

## ✨ Features

- 🚀 **Auto-Installation** - Automatically installs Python 3.12+, uv, and kimi-cli
- 🔐 **OAuth Authentication** - Secure OAuth2 login flow
- 📝 **Session Resumption** - Resume previous conversations seamlessly
- ⚡ **Streaming Responses** - Real-time token streaming for interactive sessions
- 🎯 **YOLO Mode** - Auto-approve filesystem operations for trusted workflows
- 🔧 **Kimi K2 Models** - Full support for Kimi K2 series models
- 🖼️ **Vision Support** - Process and analyze images alongside text
- 🔄 **Multi-Session** - Manage multiple concurrent Kimi sessions

---

## 📦 Installation

### Prerequisites

- Node.js 18+ (for WOPR)
- Python 3.12+ (auto-installed if missing)
- [uv](https://github.com/astral-sh/uv) (auto-installed if missing)

### Plugin Installation

```bash
wopr plugin install wopr-plugin-provider-kimi
```

The plugin will automatically:
1. Check for Python 3.12+ and install via `uv` if missing
2. Install `uv` (Python package manager) if not present
3. Install `kimi-cli` tool via `uv`

### Manual Installation

```bash
npm install -g wopr-plugin-provider-kimi
```

---

## 🔐 Authentication

The Kimi provider supports OAuth authentication.

### OAuth Login

```bash
# The plugin uses OAuth - authenticate via Kimi's web flow
wopr providers auth kimi
```

This will:
1. Open your browser to the Kimi OAuth consent page
2. Request permissions for code access
3. Store the secure token in WOPR's credential store

### Verify Authentication

```bash
wopr providers list
```

You should see `kimi` with a ✅ indicating successful authentication.

---

## ⚙️ Configuration

### Quick Start

Create a session with default settings:

```bash
wopr session create my-kimi-session --provider kimi
```

### With Options

```bash
wopr session create my-kimi-session \
  --provider kimi \
  --model kimi-k2 \
  --yolo-mode
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `model` | string | `kimi-k2` | Model to use for the session |
| `yoloMode` | boolean | `false` | Auto-approve filesystem operations |
| `workDir` | string | `/tmp` | Working directory for the session |
| `resume` | string | - | Session ID to resume from |

### JSON Configuration Example

```json
{
  "provider": "kimi",
  "model": "kimi-k2",
  "yoloMode": true,
  "workDir": "/home/user/projects"
}
```

See [docs/CONFIGURATION.md](docs/CONFIGURATION.md) for detailed configuration options.

---

## 🤖 Available Models

| Model | Description | Best For |
|-------|-------------|----------|
| `kimi-k2` | Kimi K2 (default) | General coding, analysis, and automation |

> **Note:** Moonshot AI periodically updates available models. Run `wopr providers models kimi` for the latest list.

See [docs/MODELS.md](docs/MODELS.md) for detailed model information and capabilities.

---

## 🔄 Session Resumption

One of the most powerful features is the ability to resume previous sessions.

### How It Works

When you create a session, WOPR receives a unique session ID from Kimi:

```bash
wopr session create my-session --provider kimi
# Output: Session initialized with ID: sess_abc123xyz
```

### Resuming a Session

```bash
# Resume using the session ID
wopr session resume my-session --session-id sess_abc123xyz
```

Or via configuration:

```json
{
  "provider": "kimi",
  "resume": "sess_abc123xyz"
}
```

### Session Persistence

Sessions persist on Moonshot AI's servers for 30 days of inactivity. WOPR automatically:
- Stores session IDs securely
- Handles re-authentication when needed
- Cleans up expired session references

---

## 🚀 Usage Examples

### Basic Code Generation

```bash
wopr session create coding-task --provider kimi
wopr prompt coding-task "Create a Python function to parse JSON with error handling"
```

### With System Prompt

```bash
wopr prompt my-session "Review this code" \
  --system "You are a senior code reviewer. Focus on security and performance."
```

### Image Analysis

```bash
wopr prompt my-session "Describe this image" \
  --images ./screenshot.png,./diagram.jpg
```

### YOLO Mode (Auto-approve)

For trusted, automated workflows:

```bash
wopr session create auto-task --provider kimi --yolo-mode
wopr prompt auto-task "Refactor the src/ directory to use TypeScript"
```

⚠️ **Warning:** YOLO mode allows the AI to make filesystem changes without confirmation. Use only in version-controlled environments.

---

## 📁 Example Configurations

Check the [examples/](examples/) directory for complete configuration examples:

- [examples/basic.json](examples/basic.json) - Basic setup
- [examples/yolo-mode.json](examples/yolo-mode.json) - Automated workflows
- [examples/multi-model.json](examples/multi-model.json) - Multi-model orchestration

---

## 🔧 Troubleshooting

### Common Issues

**Kimi CLI not found**
```bash
# Re-run the installation
wopr plugin reinstall wopr-plugin-provider-kimi
```

**OAuth authentication failed**
```bash
# Reset credentials and re-authenticate
wopr providers remove kimi
wopr providers auth kimi
```

**Session resumption failed**
- Sessions expire after 30 days of inactivity
- Check if the session ID is correct
- Some sessions may be invalidated server-side

See [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) for comprehensive troubleshooting.

---

## 📚 Documentation

- [📖 Installation Guide](docs/INSTALL.md) - Detailed setup instructions
- [⚙️ Configuration Reference](docs/CONFIGURATION.md) - All configuration options
- [🤖 Model Information](docs/MODELS.md) - Available models and capabilities
- [🔧 Troubleshooting](docs/TROUBLESHOOTING.md) - Common issues and solutions

---

## 🏗️ Development

```bash
# Clone the repository
git clone https://github.com/TSavo/wopr-plugin-provider-kimi.git
cd wopr-plugin-provider-kimi

# Install dependencies
npm install

# Build
npm run build

# Watch mode
npm run build -- --watch
```

---

## 🔗 WOPR Ecosystem

This plugin is part of the [WOPR](https://github.com/TSavo/wopr) ecosystem:

| Package | Description |
|---------|-------------|
| [wopr](https://github.com/TSavo/wopr) | Core WOPR CLI |
| [wopr-plugin-router](https://github.com/TSavo/wopr-plugin-router) | Intelligent model routing |
| [wopr-plugin-p2p](https://github.com/TSavo/wopr-plugin-p2p) | P2P session synchronization |
| [wopr-plugin-webui](https://github.com/TSavo/wopr-plugin-webui) | Web UI for WOPR |

---

## 📄 License

MIT © [TSavo](https://github.com/TSavo)

---

## 🤝 Contributing

Contributions welcome! Please read the [WOPR Contributing Guide](https://github.com/TSavo/wopr/blob/main/CONTRIBUTING.md) first.

---

## 📞 Support

- 🐛 [Report Issues](https://github.com/TSavo/wopr-plugin-provider-kimi/issues)
- 💬 [Discussions](https://github.com/TSavo/wopr/discussions)
- 📧 Contact: See [WOPR repository](https://github.com/TSavo/wopr)

---

<p align="center">
  <a href="https://github.com/TSavo/wopr">
    <img src="https://img.shields.io/badge/←_Back_to_WOPR-blue?style=for-the-badge" alt="Back to WOPR">
  </a>
</p>
