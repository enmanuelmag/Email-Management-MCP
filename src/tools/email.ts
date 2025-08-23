import { FetchEmailsInputSchema, FetchEmailsOutputSchema } from "@/types/email";

import { Logger } from "@/utils/logger";
import { getResource } from "@/utils/resource";

import { FETCH_EMAILS_PROMPT } from "@/constants/email";

import type { AuthEmailType, FetchEmailsOutputType } from "@/types/email";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp";

import EmailClient from "@/models/email";

const parseResponsePrompt = (
  response: FetchEmailsOutputType,
  prompt: string
) => {
  if (!response.emails || response.emails.length === 0) {
    return prompt.replace("{{emails}}", "[]");
  }

  const emailsContent = prompt.replace(
    "{{emails}}",
    JSON.stringify(response.emails)
  );

  return emailsContent;
};

export function registerEmailTools(server: McpServer) {
  server.registerTool(
    "fetch-emails",
    {
      title: "Fetch Emails",
      description:
        "Get emails from the user's inbox. Can specify the mailbox (INBOX by default), a subject (string), date range (ISO format: YYYY-MM-DDTHH:mm:ss), and sender emails (list of strings) to filter emails.",
      inputSchema: FetchEmailsInputSchema.shape,
      outputSchema: FetchEmailsOutputSchema.shape,
    },
    async (params, { requestInfo }) => {
      const authEmail = {
        port: requestInfo?.headers["email-port"],
        email: requestInfo?.headers["email-username"],
        password: requestInfo?.headers["email-password"],
        clientType: requestInfo?.headers["email-client-type"],
      } as AuthEmailType;

      const emailClient = new EmailClient(authEmail);

      const response = await emailClient.fetchEmails(params);

      if (response.error) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: response.error,
            },
          ],
        };
      }

      const instructionsPromptSource =
        requestInfo?.headers["email-instructions"] ||
        process.env.EMAIL_INSTRUCTIONS ||
        FETCH_EMAILS_PROMPT;

      const instructionsPrompt = await getResource(
        instructionsPromptSource as string
      );

      const finalResponse = parseResponsePrompt(response, instructionsPrompt);

      return {
        content: [
          {
            type: "text",
            text: finalResponse,
          },
        ],
        structuredContent: response,
      };
    }
  );

  Logger.info("Email tools registered", Boolean(server));
}
