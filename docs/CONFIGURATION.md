# ⚙️ Configuration Reference

Complete configuration options for the WOPR Kimi provider plugin.

---

## Table of Contents

- [Configuration Methods](#configuration-methods)
- [Global Options](#global-options)
- [Session Options](#session-options)
- [Provider Options](#provider-options)
- [Environment Variables](#environment-variables)
- [Configuration Files](#configuration-files)
- [Examples](#examples)

---

## Configuration Methods

Configuration can be specified through multiple methods (in order of precedence):

1. **Command-line flags** (highest priority)
2. **Session-specific config files**
3. **WOPR global configuration**
4. **Environment variables**
5. **Default values** (lowest priority)

---

## Global Options

### WOPR CLI Options

| Option | Flag | Description |
|--------|------|-------------|
| Provider | `--provider` | Select the provider (kimi) |
| Model | `--model` | Model ID to use |
| YOLO Mode | `--yolo-mode` | Auto-approve filesystem operations |
| Work Directory | `--work-dir` | Working directory for operations |

### Example

```bash
wopr session create my-session \
  --provider kimi \
  --model kimi-k2 \
  --yolo-mode \
  --work-dir /home/user/project
```

---

## Session Options

### Core Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `provider` | string | - | Must be `"kimi"` |
| `model` | string | `kimi-k2` | Model identifier |
| `yoloMode` | boolean | `false` | Auto-approve all operations |
| `workDir` | string | `/tmp` | Base working directory |
| `sessionId` | string | auto-generated | Session identifier for resumption |
| `timeout` | number | 300000 | Request timeout in milliseconds (5 min) |

### Authentication Options

| Option | Type | Description |
|--------|------|-------------|
| `auth.type` | string | Authentication type (`"oauth"`) |
| `auth.token` | string | OAuth token (auto-managed) |
| `auth.refreshToken` | string | Refresh token (auto-managed) |

### Advanced Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `streaming` | boolean | `true` | Enable streaming responses |
| `maxTokens` | number | model default | Maximum tokens per response |
| `temperature` | number | model default | Sampling temperature (0-2) |
| `topP` | number | model default | Nucleus sampling parameter |
| `systemPrompt` | string | - | Default system prompt |

---

## Provider Options

### Provider-Specific Settings

```json
{
  "provider": "kimi",
  "kimi": {
    "executable": "/path/to/kimi",
    "pythonVersion": "3.12",
    "autoInstall": true,
    "sessionTimeout": 2592000
  }
}
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `executable` | string | auto-detected | Path to kimi-cli binary |
| `pythonVersion` | string | `3.12` | Required Python version |
| `autoInstall` | boolean | `true` | Auto-install missing dependencies |
| `sessionTimeout` | number | `2592000` | Session TTL in seconds (30 days) |

---

## Environment Variables

### Core Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `WOPR_PROVIDER_KIMI_MODEL` | Default model | `kimi-k2` |
| `WOPR_PROVIDER_KIMI_YOLO` | Default YOLO mode | `true` or `false` |
| `WOPR_PROVIDER_KIMI_WORKDIR` | Default working directory | `/home/user/projects` |

### Authentication Variables

| Variable | Description |
|----------|-------------|
| `KIMI_ACCESS_TOKEN` | OAuth access token (if manually managing) |
| `KIMI_REFRESH_TOKEN` | OAuth refresh token |

### Debug Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `WOPR_DEBUG` | Enable debug logging | `false` |
| `KIMI_DEBUG` | Enable Kimi CLI debug mode | `false` |
| `KIMI_LOG_LEVEL` | Log level (error, warn, info, debug) | `warn` |

---

## Configuration Files

### WOPR Global Config

Location: `~/.wopr/config.json`

```json
{
  "providers": {
    "kimi": {
      "defaultModel": "kimi-k2",
      "defaultOptions": {
        "yoloMode": false,
        "workDir": "/home/user/wopr-work"
      }
    }
  }
}
```

### Session Config Files

Location: `~/.wopr/sessions/{session-name}.json`

```json
{
  "name": "my-session",
  "provider": "kimi",
  "model": "kimi-k2",
  "options": {
    "yoloMode": true,
    "workDir": "/home/user/project",
    "systemPrompt": "You are a helpful coding assistant."
  },
  "metadata": {
    "created": "2024-01-15T10:30:00Z",
    "lastUsed": "2024-01-15T14:22:00Z"
  }
}
```

### Project-Level Config

Location: `./.wopr.json` (in project root)

```json
{
  "defaultProvider": "kimi",
  "sessions": {
    "dev": {
      "provider": "kimi",
      "model": "kimi-k2",
      "yoloMode": true,
      "workDir": "."
    }
  }
}
```

---

## Examples

### Basic Configuration

```json
{
  "provider": "kimi",
  "model": "kimi-k2"
}
```

### Development Session

```json
{
  "provider": "kimi",
  "model": "kimi-k2",
  "yoloMode": true,
  "workDir": "/home/user/myproject",
  "systemPrompt": "Focus on clean, well-documented code. Use TypeScript best practices."
}
```

### Secure Session (No YOLO)

```json
{
  "provider": "kimi",
  "model": "kimi-k2",
  "yoloMode": false,
  "workDir": "/tmp",
  "systemPrompt": "Always ask for confirmation before making changes."
}
```

### Resume Previous Session

```json
{
  "provider": "kimi",
  "model": "kimi-k2",
  "sessionId": "sess_abc123xyz",
  "resume": true
}
```

### Multi-Model Setup

```json
{
  "sessions": {
    "kimi-main": {
      "provider": "kimi",
      "model": "kimi-k2",
      "yoloMode": false
    },
    "kimi-auto": {
      "provider": "kimi",
      "model": "kimi-k2",
      "yoloMode": true
    }
  }
}
```

---

## Configuration Precedence

When multiple configurations specify the same option:

```
CLI Flag > Session Config > Project Config > Global Config > Environment > Default
```

Example:

```bash
# Environment variable
export WOPR_PROVIDER_KIMI_YOLO=false

# Global config has yoloMode: true
# Session config has yoloMode: false
# CLI flag: --yolo-mode

# Result: YOLO mode is ENABLED (CLI flag wins)
```

---

## Validation

### Validate Configuration

```bash
# Check a configuration file
wopr config validate ./my-config.json

# Validate current session
wopr session validate my-session

# Show effective configuration
wopr session config my-session --effective
```

### Common Validation Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Invalid model` | Unknown model ID | Check available models with `wopr providers models kimi` |
| `Missing provider` | No provider specified | Add `"provider": "kimi"` |
| `Invalid workDir` | Directory doesn't exist | Create the directory or use an existing one |
| `YOLO without auth` | Not authenticated | Run `wopr providers auth kimi` first |

---

## Best Practices

1. **Use project-level configs** for team consistency
2. **Keep sensitive data in environment variables** or WOPR's credential store
3. **Use YOLO mode cautiously** - only in version-controlled environments
4. **Set appropriate working directories** to limit filesystem access
5. **Use session resumption** for long-running conversations
