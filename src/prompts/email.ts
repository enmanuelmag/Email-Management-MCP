import { SendEmailInputSchema } from "@/types/email";

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp";

export function registerEmailPrompts(server: McpServer) {
  server.registerPrompt(
    "send-email",
    {
      title: "Send email",
      description:
        "Send an email to a specified recipient with a subject and body content.",
      argsSchema: SendEmailInputSchema.shape,
    },
    ({ tone, to, subject, body }) => {
      const prompt = `
      You are about to send an email with the following details:

      Tone: ${tone}
      To: ${to}
      Subject: ${subject}
      Body: ${body}
      `;

      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: prompt,
            },
          },
        ],
      };
    }
  );
}
