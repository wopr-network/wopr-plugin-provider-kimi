/**
 * WOPR Plugin: Moonshot AI Kimi Provider (OAuth)
 */
import logger from "./logger.js";
import { homedir } from "os";
import { join } from "path";
import { existsSync } from "fs";
const KIMI_PATH = join(homedir(), ".local/share/uv/tools/kimi-cli/bin/kimi");
function getKimiPath() {
    // Use known location first, fallback to PATH
    if (existsSync(KIMI_PATH))
        return KIMI_PATH;
    return "kimi";
}
async function loadSDK() {
    return await import("/tmp/wopr-test/plugins/wopr-plugin-provider-kimi/node_modules/@moonshot-ai/kimi-agent-sdk/dist/index.mjs");
}
const kimiProvider = {
    id: "kimi",
    name: "Kimi",
    description: "Moonshot AI Kimi Code CLI with OAuth authentication",
    defaultModel: "kimi-k2",
    supportedModels: ["kimi-k2"],
    async validateCredentials() {
        try {
            const { createSession } = await loadSDK();
            const session = createSession({ workDir: "/tmp", executable: getKimiPath() });
            await session.close();
            return true;
        }
        catch {
            return false;
        }
    },
    async createClient(_credential, options) {
        return new KimiClient(options);
    },
    getCredentialType() { return "oauth"; },
};
class KimiClient {
    options;
    executable;
    constructor(options) {
        this.options = options;
        this.executable = getKimiPath();
    }
    async *query(opts) {
        const { createSession } = await loadSDK();
        const session = createSession({
            workDir: "/tmp",
            executable: this.executable,
            ...this.options
        });
        try {
            let promptText = opts.prompt;
            if (opts.images?.length) {
                const imageList = opts.images.map((url, i) => `[Image ${i + 1}]: ${url}`).join('\n');
                promptText = `[User has shared ${opts.images.length} image(s)]\n${imageList}\n\n${promptText}`;
            }
            if (opts.systemPrompt)
                promptText = `${opts.systemPrompt}\n\n${promptText}`;
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
        }
        catch (error) {
            await session.close();
            throw error;
        }
    }
    async listModels() { return ["kimi-k2"]; }
    async healthCheck() {
        try {
            const { createSession } = await loadSDK();
            const session = createSession({ workDir: "/tmp", executable: this.executable });
            await session.close();
            return true;
        }
        catch {
            return false;
        }
    }
}
const plugin = {
    name: "provider-kimi",
    version: "1.5.0",
    description: "Moonshot AI Kimi Code CLI provider - auto-installs dependencies",
    async init(ctx) {
        ctx.log.info("Registering Kimi provider (OAuth)...");
        ctx.registerProvider(kimiProvider);
        ctx.log.info("Kimi provider registered");
    },
    async shutdown() { logger.info("[provider-kimi] Shutting down"); },
};
export default plugin;
