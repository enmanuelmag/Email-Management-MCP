/* eslint-disable import/first */
declare global {
  var IS_STREAM_SERVER: boolean;
}

global.IS_STREAM_SERVER = true;

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import cors from "cors";
import express from "express";
import { randomUUID } from "node:crypto";

import { Logger } from "./utils/logger";

import { registerPrompts } from "@/prompts";
import { registerTools } from "@/tools";

const app = express();
app.use(express.json());

Logger.info("Initializing MCP Server");

const transports: {
  [sessionId: string]: StreamableHTTPServerTransport | undefined;
} = {};

app.use(
  cors({
    origin: "*",
    exposedHeaders: ["Mcp-Session-Id"],
    allowedHeaders: [
      "Content-Type",
      "mcp-session-id",
      "EMAIL-USERNAME",
      "EMAIL-PASSWORD",
    ],
  })
);

app.post("/mcp", async (req, res) => {
  const sessionId = req.headers["mcp-session-id"] as string | undefined;
  let transport: StreamableHTTPServerTransport;

  if (sessionId && transports[sessionId]) {
    transport = transports[sessionId];
  } else if (!sessionId && isInitializeRequest(req.body)) {
    transport = new StreamableHTTPServerTransport({
      // enableDnsRebindingProtection: true,
      sessionIdGenerator: () => randomUUID(),
      onsessioninitialized: (_sessionId) => {
        transports[_sessionId] = transport;
      },
    });

    transport.onclose = () => {
      if (transport.sessionId) {
        delete transports[transport.sessionId];
      }
    };
    const server = new McpServer({
      name: "dummy-mcp",
      version: "1.0.0",
    });

    registerTools(server);
    registerPrompts(server);

    await server.connect(transport);
  } else {
    res.status(400).json({
      jsonrpc: "2.0",
      error: {
        code: -32000,
        message: "Bad Request: No valid session ID provided",
      },
      id: null,
    });
    return;
  }

  // req.body.email = req.headers['EMAIL-USERNAME'];
  // req.body.password = req.headers['EMAIL-PASSWORD'];

  // const body = {
  //   ...req.body,
  //   email: req.headers['EMAIL-USERNAME'],
  //   password: req.headers['EMAIL-PASSWORD'],
  // };

  await transport.handleRequest(req, res, req.body);
});

const handleSessionRequest = async (
  req: express.Request,
  res: express.Response
) => {
  const sessionId = req.headers["mcp-session-id"] as string | undefined;
  if (!sessionId || !transports[sessionId]) {
    res.status(400).send("Invalid or missing session ID");
    return;
  }

  const transport = transports[sessionId];
  await transport.handleRequest(req, res);
};

app.get("/mcp", handleSessionRequest);

app.delete("/mcp", handleSessionRequest);

app.listen(5555, (error) => {
  if (error) {
    Logger.error("Failed to start MCP Server:", error);
    process.exit(1);
  }
  Logger.info("MCP Server: Listening on http://localhost:5555");
});
