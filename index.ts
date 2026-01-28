/**
 * WOPR Plugin: Moonshot AI Kimi Provider
 * 
 * Provides Moonshot AI Kimi Code CLI access via the Kimi Agent SDK.
 * Install: wopr plugin install wopr-plugin-provider-kimi
 */

import type { ModelProvider, ModelClient, ModelQueryOptions } from "wopr/dist/types/provider.js";
import type { WOPRPlugin, WOPRPluginContext } from "wopr/dist/types.js";

let KimiSDK: any;

/**
 * Lazy load Kimi Agent SDK
 */
async function loadKimiSDK() {
  if (!KimiSDK) {
    try {
      const kimi = await import("@moonshot-ai/kimi-agent-sdk");
      KimiSDK = kimi;
    } catch (error) {
      throw new Error(
        "Kimi Agent SDK not installed. Run: npm install @moonshot-ai/kimi-agent-sdk"
      );
    }
  }
  return KimiSDK;
}

/**
 * Kimi provider implementation
 */
const kimiProvider: ModelProvider = {
  id: "kimi",
  name: "Kimi",
  description: "Moonshot AI Kimi Code CLI agent SDK for coding tasks (image URLs passed in prompt)",
  defaultModel: "kimi-k2",
  supportedModels: ["kimi-k2", "kimi-for-coding"],

  async validateCredentials(credential: string): Promise<boolean> {
    if (!credential.startsWith("sk-")) {
      return false;
    }

    try {
      const kimi = await loadKimiSDK();
      const agent = new kimi.KimiAgent({ apiKey: credential });
      const session = await agent.createSession();
      await session.close();
      return true;
    } catch (error) {
      return false;
    }
  },

  async createClient(
    credential: string,
    options?: Record<string, unknown>
  ): Promise<ModelClient> {
    return new KimiClient(credential, options);
  },

  getCredentialType(): "api-key" | "oauth" | "custom" {
    return "api-key";
  },
};

/**
 * Kimi client implementation
 */
class KimiClient implements ModelClient {
  private agent: any;

  constructor(
    private credential: string,
    private options?: Record<string, unknown>
  ) {
    process.env.MOONSHOT_API_KEY = credential;
  }

  private async getAgent() {
    if (!this.agent) {
      const kimi = await loadKimiSDK();
      this.agent = new kimi.KimiAgent({
        apiKey: this.credential,
        ...this.options,
      });
    }
    return this.agent;
  }

  async *query(opts: ModelQueryOptions): AsyncGenerator<any> {
    const agent = await this.getAgent();

    try {
      const session = await agent.createSession();

      // Prepare prompt - include image URLs in text
      let prompt = opts.prompt;
      if (opts.images && opts.images.length > 0) {
        const imageList = opts.images.map((url, i) => `[Image ${i + 1}]: ${url}`).join('\n');
        prompt = `[User has shared ${opts.images.length} image(s)]\n${imageList}\n\n${opts.prompt}`;
      }

      if (opts.systemPrompt) {
        prompt = `${opts.systemPrompt}\n\n${prompt}`;
      }

      const stream = await session.sendMessage(prompt);

      for await (const msg of stream) {
        if (msg.type === "text" || msg.type === "assistant") {
          yield {
            type: "assistant",
            message: {
              content: [{ type: "text", text: msg.content || msg.text || "" }],
            },
          };
        } else if (msg.type === "tool_use" || msg.type === "tool_call") {
          yield {
            type: "assistant",
            message: {
              content: [{ type: "tool_use", name: msg.name || msg.tool_name }],
            },
          };
        } else if (msg.type === "complete" || msg.type === "done") {
          yield {
            type: "result",
            subtype: "success",
            total_cost_usd: msg.cost || 0,
          };
        } else if (msg.type === "error") {
          yield {
            type: "result",
            subtype: "error",
            error: msg.error || msg.message,
          };
        } else {
          yield msg;
        }
      }

      await session.close();
    } catch (error) {
      throw new Error(
        `Kimi query failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async listModels(): Promise<string[]> {
    return kimiProvider.supportedModels;
  }

  async healthCheck(): Promise<boolean> {
    try {
      const agent = await this.getAgent();
      const session = await agent.createSession();
      await session.close();
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Plugin export
 */
const plugin: WOPRPlugin = {
  name: "provider-kimi",
  version: "1.0.0",
  description: "Moonshot AI Kimi Code CLI provider for WOPR",

  async init(ctx: WOPRPluginContext) {
    ctx.log.info("Registering Kimi provider...");
    ctx.registerProvider(kimiProvider);
    ctx.log.info("Kimi provider registered");

    // Register config schema for UI
    ctx.registerConfigSchema("provider-kimi", {
      title: "Moonshot AI Kimi",
      description: "Configure Moonshot AI Kimi API credentials",
      fields: [
        {
          name: "apiKey",
          type: "password",
          label: "API Key",
          placeholder: "sk-...",
          required: true,
          description: "Your Moonshot API key (starts with sk-)",
        },
        {
          name: "model",
          type: "select",
          label: "Default Model",
          options: [
            { value: "kimi-k2", label: "Kimi K2" },
            { value: "kimi-for-coding", label: "Kimi for Coding" },
          ],
          default: "kimi-k2",
          description: "Default model to use for new sessions",
        },
      ],
    });
    ctx.log.info("Registered Kimi config schema");
  },

  async shutdown() {
    console.log("[provider-kimi] Shutting down");
  },
};

export default plugin;
