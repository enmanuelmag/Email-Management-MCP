import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp";

import { registerDummyPrompts } from "@/prompts/dummy-prompts";

export function registerPrompts(server: McpServer) {
  registerDummyPrompts(server);
}
