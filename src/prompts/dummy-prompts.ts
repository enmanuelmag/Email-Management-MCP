import { Logger } from "@/utils/logger";

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp";

export function registerDummyPrompts(server: McpServer) {
  Logger.info("Dummy prompts registered", Boolean(server));
}
