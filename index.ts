/**
 * WOPR Plugin: Moonshot AI Kimi Provider (OAuth)
 */

import winston from "winston";
import { homedir } from "os";
import { join } from "path";
import { existsSync } from "fs";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: "wopr-plugin-provider-kimi" },
  transports: [
    new winston.transports.Console({ level: "warn" })
  ],
});

const KIMI_PATH = join(homedir(), ".local/share/uv/tools/kimi-cli/bin/kimi");

function getKimiPath(): string {
  if (existsSync(KIMI_PATH)) return KIMI_PATH;
  return "kimi";
}

async function loadSDK(): Promise<any> {
  return await import("/tmp/wopr-test/plugins/wopr-plugin-provider-kimi/node_modules/@moonshot-ai/kimi-agent-sdk/dist/index.mjs");
}

interface KimiProvider {
  id: string;
  name: string;
  description: string;
  defaultModel: string;
  supportedModels: string[];
  validateCredentials(): Promise<boolean>;
  createClient(credential: string, options?: Record<string, unknown>): Promise<any>;
  getCredentialType(): "oauth";
}

const kimiProvider: KimiProvider = {
  id: "kimi",
  name: "Kimi",
  description: "Moonshot AI Kimi Code CLI with OAuth authentication",
  defaultModel: "kimi-k2",
  supportedModels: ["kimi-k2"],

  async validateCredentials(): Promise<boolean> {
    try {
      const { createSession } = await loadSDK();
      const session = createSession({ workDir: "/tmp", executable: getKimiPath(), yoloMode: true });
      await session.close();
      return true;
    } catch { return false; }
  },

  async createClient(_credential: string, options?: Record<string, unknown>): Promise<any> {
    return new KimiClient(options);
  },

  getCredentialType(): "oauth" { return "oauth"; },
};

interface QueryOptions {
  prompt: string;
  systemPrompt?: string;
  images?: string[];
  resume?: string; // Session ID to resume
}

class KimiClient {
  private executable: string;
  constructor(private options?: Record<string, unknown>) {
    this.executable = getKimiPath();
  }

  async *query(opts: QueryOptions): AsyncGenerator<any> {
    const { createSession } = await loadSDK();
    const sessionOptions: any = {
      workDir: "/tmp",
      executable: this.executable,
      yoloMode: true, // Auto-approve filesystem operations
      ...this.options
    };
    // Pass sessionId to resume existing session
    if (opts.resume) {
      sessionOptions.sessionId = opts.resume;
    }
    const session = createSession(sessionOptions);
    
    // Yield session ID so WOPR can persist it for resumption
    yield { type: "system", subtype: "init", session_id: session.sessionId };

    try {
      let promptText = opts.prompt;
      if (opts.images?.length) {
        const imageList = opts.images.map((url: string, i: number) => `[Image ${i + 1}]: ${url}`).join('\n');
        promptText = `[User has shared ${opts.images.length} image(s)]\n${imageList}\n\n${promptText}`;
      }
      if (opts.systemPrompt) promptText = `${opts.systemPrompt}\n\n${promptText}`;

      const turn = session.prompt(promptText);

      for await (const event of turn) {
        if (event.type === "ContentPart" && event.payload?.type === "text") {
          yield {
            type: "assistant",
            message: {
              content: [{ type: "text", text: event.payload.text }]
            }
          };
        }
      }

      await turn.result;
      yield { type: "result", subtype: "success", total_cost_usd: 0 };
      await session.close();
    } catch (error) {
      await session.close();
      throw error;
    }
  }

  async listModels(): Promise<string[]> { return ["kimi-k2"]; }

  async healthCheck(): Promise<boolean> {
    try {
      const { createSession } = await loadSDK();
      const session = createSession({ workDir: "/tmp", executable: this.executable });
      await session.close();
      return true;
    } catch { return false; }
  }
}

interface WOPRPluginContext {
  log: { info: (msg: string) => void };
  registerProvider: (provider: any) => void;
}

interface WOPRPlugin {
  name: string;
  version: string;
  description: string;
  init(ctx: WOPRPluginContext): Promise<void>;
  shutdown(): Promise<void>;
}

const plugin: WOPRPlugin = {
  name: "provider-kimi",
  version: "1.5.0",
  description: "Moonshot AI Kimi Code CLI provider - auto-installs dependencies",

  async init(ctx: WOPRPluginContext) {
    ctx.log.info("Registering Kimi provider (OAuth)...");
    ctx.registerProvider(kimiProvider);
    ctx.log.info("Kimi provider registered");
  },

  async shutdown() { logger.info("[provider-kimi] Shutting down"); },
};

export default plugin;
