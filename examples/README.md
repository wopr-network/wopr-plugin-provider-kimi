# 📁 Example Configurations

This directory contains example configuration files for the WOPR Kimi provider plugin.

---

## Available Examples

### [basic.json](basic.json)

Simple configuration for getting started with Kimi provider.

**Features:**
- Default model (kimi-k2)
- Safe mode (YOLO disabled)
- Temporary working directory

**Use when:** You're new to WOPR or want a safe, basic setup.

---

### [yolo-mode.json](yolo-mode.json)

Configuration for automated workflows with filesystem operation auto-approval.

**Features:**
- YOLO mode enabled (auto-approve filesystem changes)
- Extended timeout for long operations
- System prompt optimized for automation

**Use when:** You want Kimi to work autonomously on trusted projects.

⚠️ **Warning:** Only use in version-controlled environments!

---

### [multi-model.json](multi-model.json)

Configuration for running multiple Kimi sessions with different purposes.

**Features:**
- 4 specialized sessions (coder, reviewer, debugger, docs)
- Workflow definitions for common tasks
- Each session with optimized system prompts

**Use when:** You want to orchestrate complex development workflows.

---

## Usage

### Load an Example Configuration

```bash
# Load basic configuration
wopr session load examples/basic.json

# Load with custom name
wopr session load examples/yolo-mode.json --name my-automation
```

### Customize Examples

1. Copy the example file:
   ```bash
   cp examples/basic.json my-config.json
   ```

2. Edit the configuration:
   ```bash
   nano my-config.json
   ```

3. Load your customized config:
   ```bash
   wopr session load my-config.json
   ```

---

## Creating Your Own Configurations

See the [Configuration Reference](../docs/CONFIGURATION.md) for all available options.

Basic structure:

```json
{
  "session": {
    "name": "my-session",
    "provider": "kimi",
    "model": "kimi-k2"
  },
  "provider": {
    "kimi": {
      "yoloMode": false,
      "workDir": "/path/to/project"
    }
  }
}
```

---

## Validation

Validate your configuration before using:

```bash
wopr config validate my-config.json
```
