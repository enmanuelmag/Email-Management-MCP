import { Logger } from "@/utils/logger";

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp";

export function registerDummyTools(server: McpServer) {
  Logger.info("Dummy tools registered", Boolean(server));
}
