# MCP Server - Dummy Boilerplate

A basic boilerplate for creating MCP (Model Context Protocol) servers with TypeScript and Node.js. This project provides a base structure that you can use as a starting point to develop your own MCP servers.

## 🚀 Features

- **Complete MCP server** with stdio and HTTP support
- **Customizable logger** with different modes (console/file)
- **Modular structure** for tools and prompts
- **TypeScript** with complete configuration
- **Hot reload** for development
- **Docker** ready

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/enmanuelmag/Email-Management-MCP.git
cd Email-Management-MCP

# Install dependencies
npm install

# Build the project
npm run build
```

## 🎯 Usage

### Stdio Mode (CLI)
```bash
# Development
npm run dev

# Production
npm start
```

### HTTP Server Mode
```bash
# Development
npm run serve

# Server will be available at http://localhost:5555
```

## 🏗️ Project Structure

```
src/
├── main.ts              # Entry point for stdio mode
├── server.ts            # HTTP server
├── models/              # Data models
├── prompts/             # MCP prompts
│   ├── index.ts
│   └── dummy-prompts.ts
├── tools/               # MCP tools
│   ├── index.ts
│   └── dummy-tool.ts
├── types/               # TypeScript type definitions
├── utils/
│   └── logger.ts        # Logging system
```

## 📝 Defining Types

Create your custom types in the `src/types/` folder:

### Example: `src/types/user.ts`

```typescript
import { z } from "zod";

// Validation schemas with Zod
export const CreateUserSchema = z.object({
  name: z.string().min(1),
  age: z.number().int().positive(),
  email: z.string().email().optional(),
});

export const UserFilterSchema = z.object({
  name: z.string().optional(),
  minAge: z.number().int().optional(),
  maxAge: z.number().int().optional(),
});

// Types derived from schemas (use these in your tools!)
export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type UserFilter = z.infer<typeof UserFilterSchema>;

// Additional types
export interface User {
  id: string;
  name: string;
  age: number;
  email?: string;
  createdAt: Date;
}
```
```

### Example: `src/types/index.ts`

```typescript
// Export all project types
export * from "./user";
export * from "./common";

// Common types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
```

## 🔧 Registering Tools

### Example: `src/tools/user-tools.ts`

```typescript
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { zodToJsonSchema } from "zod-to-json-schema";
import { Logger } from "@/utils/logger";
import { 
  CreateUserSchema, 
  UserFilterSchema, 
  type CreateUserInput, 
  type UserFilter 
} from "@/types";

export function registerUserTools(server: McpServer) {
  // Register available tools
  server.setRequestHandler("tools/list", async () => ({
    tools: [
      {
        name: "create_user",
        description: "Creates a new user with the provided information",
        inputSchema: zodToJsonSchema(CreateUserSchema),
      },
      {
        name: "list_users", 
        description: "Lists users based on filters",
        inputSchema: zodToJsonSchema(UserFilterSchema),
      },
    ],
  }));

  // Tool implementations
  server.setRequestHandler("tools/call", async (request) => {
    const { name, arguments: args } = request.params;

    if (name === "create_user") {
      try {
        // Validate input using Zod schema - this gives you full type safety!
        const userData: CreateUserInput = CreateUserSchema.parse(args);
        
        Logger.info("Creating user:", userData);
        
        // Your implementation here
        const result = await createUserImplementation(userData);
        
        return {
          content: [
            {
              type: "text",
              text: `User created successfully: ${userData.name}`,
            },
          ],
        };
      } catch (error) {
        Logger.error("Error creating user:", error);
        return {
          content: [
            {
              type: "text", 
              text: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
            },
          ],
          isError: true,
        };
      }
    }

    if (name === "list_users") {
      try {
        const filterData: UserFilter = UserFilterSchema.parse(args || {});
        
        Logger.info("Listing users with filters:", filterData);
        
        const users = await listUsersImplementation(filterData);
        
        return {
          content: [
            {
              type: "text",
              text: `Found ${users.length} users`,
            },
          ],
        };
      } catch (error) {
        Logger.error("Error listing users:", error);
        return {
          content: [
            {
              type: "text",
              text: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
            },
          ],
          isError: true,
        };
      }
    }

    throw new Error(`Unknown tool: ${name}`);
  });
}

// Implementation functions (dummy examples)
async function createUserImplementation(userData: CreateUserInput): Promise<void> {
  // Implement actual user creation logic here
  Logger.info("User creation implementation goes here");
}

async function listUsersImplementation(filter: UserFilter): Promise<any[]> {
  // Implement actual user listing logic here  
  Logger.info("User listing implementation goes here");
  return [];
}
```

### Register the new tools: `src/tools/index.ts`

```typescript
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { registerDummyTools } from "@/tools/dummy-tool";
import { registerUserTools } from "@/tools/user-tools";

export function registerTools(server: McpServer) {
  registerDummyTools(server);
  registerUserTools(server);
}
```

## 📋 Prompts

### Example: `src/prompts/user-prompts.ts`

```typescript
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { Logger } from "@/utils/logger";

export function registerUserPrompts(server: McpServer) {
  server.setRequestHandler("prompts/list", async () => ({
    prompts: [
      {
        name: "user_summary",
        description: "Generates a summary of users",
        arguments: [
          {
            name: "users",
            description: "List of users to summarize",
            required: true,
          },
        ],
      },
    ],
  }));

  server.setRequestHandler("prompts/get", async (request) => {
    const { name, arguments: args } = request.params;

    if (name === "user_summary") {
      const users = args?.users || [];
      
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Please summarize the following users:\n\n${JSON.stringify(users, null, 2)}`,
            },
          },
        ],
      };
    }

    throw new Error(`Unknown prompt: ${name}`);
  });
}
```

## 🐳 Docker

```bash
# Build image
npm run docker:build

# Start with docker-compose
npm run docker:start
```

## 🛠️ Development

```bash
# Development mode with hot reload
npm run dev

# HTTP server in development  
npm run serve

# Lint and format
npm run lint
npm run format
```

## 📚 MCP API

This boilerplate implements the complete MCP specification:

- **Tools**: Functions that the model can call
- **Prompts**: Reusable prompt templates  
- **Resources**: Access to data and files (to be implemented)
- **Logging**: Configurable logging system

## 🔑 Key Features

### Type Safety with Zod
- Define schemas with Zod for runtime validation
- Infer TypeScript types automatically from schemas
- Use `zodToJsonSchema` to generate JSON schemas for MCP tools
- Get full type safety in your tool implementations

### Modular Architecture
- Separate folders for tools, prompts, types, and utilities
- Easy to extend and maintain
- Clear separation of concerns

## 🤝 Contributing

1. Fork the project
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Open a Pull Request

## 📄 License

This project is under the ISC License. See the `LICENSE` file for more details.

## 📞 Support

- **Author**: enmanuelmag@cardor.dev
- **Issues**: [GitHub Issues](https://github.com/enmanuelmag/Email-Management-MCP/issues)
- **MCP Docs**: [Model Context Protocol](https://modelcontextprotocol.io/)
