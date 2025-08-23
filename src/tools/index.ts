import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp";

import { registerDummyTools } from "@/tools/dummy-tool";

export function registerTools(server: McpServer) {
  registerDummyTools(server);
}
