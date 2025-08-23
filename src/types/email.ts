import { z } from "zod";

// Auth Email Schema
export const AuthEmailSchema = z.object({
  email: z
    .string()
    .email()
    .describe("Email address of the user")
    .describe("Email address of the user"),
  password: z
    .string()
    .min(6)
    .describe("Password of the user")
    .describe("Password of the user"),
  clientType: z
    .enum(["gmail", "outlook", "yahoo"])
    .describe("Type of email client to use"),
  port: z
    .string()
    .nullish()
    .describe("Port to connect to the email server, defaults to 993 for IMAP"),
});
export type AuthEmailType = z.infer<typeof AuthEmailSchema>;

// Search Email Schemas
export const FetchEmailsInputSchema = z.object({
  mailbox: z.string().default("INBOX").describe("Mailbox to fetch emails from"),
  subject: z
    .string()
    .optional()
    .describe(
      "Optional subject to filter emails by subject or sender. Only sent if user provides a subject to search EXPLICITLY!"
    ),
  dateRange: z
    .object({
      start: z.string().optional().describe("Start date of the range"),
      end: z.string().optional().describe("End date of the range"),
    })
    .describe(
      'Date range is a dictionary with the keys "start" and "end". Must be provided on date time ISO string format.'
    ),
  senders: z
    .array(z.string())
    .optional()
    .describe("Optional array of email addresses to filter emails by sender"),
});
export type FetchEmailsInputType = z.infer<typeof FetchEmailsInputSchema>;

export const FetchEmailsOutputSchema = z.object({
  emails: z
    .array(
      z.object({
        id: z.number(),
        subject: z.string(),
        sender: z.string(),
        snippet: z.string(),
        date: z.string().nullish(),
      })
    )
    .nullish(),
  error: z.string().nullish(),
});
export type FetchEmailsOutputType = z.infer<typeof FetchEmailsOutputSchema>;

// Mark Emails as Read Schemas
export const MarkEmailsAsReadInputSchema = z.object({
  ids: z.array(z.number()).describe("Array of email IDs to mark as read"),
  mailbox: z
    .string()
    .default("INBOX")
    .describe("Mailbox to mark emails as read from"),
});
export type MarkEmailsAsReadInputType = z.infer<
  typeof MarkEmailsAsReadInputSchema
>;

export const MarkEmailsAsReadOutputSchema = z.object({
  success: z.boolean(),
  error: z.string().nullish(),
});
export type MarkEmailsAsReadOutputType = z.infer<
  typeof MarkEmailsAsReadOutputSchema
>;
