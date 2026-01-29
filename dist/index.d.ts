/**
 * WOPR Plugin: Moonshot AI Kimi Provider (OAuth)
 */
interface WOPRPluginContext {
    log: {
        info: (msg: string) => void;
    };
    registerProvider: (provider: any) => void;
}
interface WOPRPlugin {
    name: string;
    version: string;
    description: string;
    init(ctx: WOPRPluginContext): Promise<void>;
    shutdown(): Promise<void>;
}
declare const plugin: WOPRPlugin;
export default plugin;
