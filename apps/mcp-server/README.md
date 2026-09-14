# Padoku MCP Server

Model Context Protocol (MCP) server for Padoku task management. Allows ChatGPT, Claude, and other LLMs to interact with your Padoku tasks.

## Features

- **list_tasks** - List all tasks, filter by status or project
- **get_task** - Get details of a specific task
- **create_task** - Create new tasks
- **update_task** - Update task title, description, status, due date, or points
- **complete_task** - Mark a task as complete
- **delete_task** - Delete a task

## Setup

### 1. Generate an API Token

First, you need an API token to authenticate. For now, use your existing JWT token from Padoku:

1. Log in to https://padoku.com
2. Open browser DevTools (F12)
3. Go to Application → Local Storage → padoku.com
4. Copy the value of `paddock_auth_token`

### 2. Configure MCP Client

#### For Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "padoku": {
      "command": "node",
      "args": ["/path/to/padoku-mcp/dist/index.js"],
      "env": {
        "PADOKU_API_URL": "https://padoku.com",
        "PADOKU_API_TOKEN": "your-jwt-token-here"
      }
    }
  }
}
```

#### For ChatGPT (via MCP Bridge)

ChatGPT doesn't natively support MCP yet, but you can use an MCP-to-OpenAI bridge:

1. Install an MCP bridge like `mcp-openai-bridge`
2. Configure it to expose this server as an OpenAI-compatible API
3. Add as a ChatGPT plugin or custom GPT action

### 3. Run the Server

```bash
# Development
cd apps/mcp-server
pnpm dev

# Production
pnpm build
node dist/index.js
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PADOKU_API_URL` | Padoku API base URL | `https://padoku.com` |
| `PADOKU_API_TOKEN` | JWT authentication token | (required) |

## Example Prompts

Once connected, you can ask your AI:

- "Show me all my tasks"
- "What tasks are in progress?"
- "Create a task called 'Review PR #123' with 3 points"
- "Mark task abc-123 as complete"
- "What's due this week?"
- "Move 'Fix bug' to on_track status"

## Task Statuses

| Status | Emoji | Description |
|--------|-------|-------------|
| `garage` | 🔧 | Backlog / To Do |
| `on_track` | 🏎️ | In Progress |
| `pits` | ⏸️ | Blocked |
| `checkered` | 🏁 | Done |

## Grid Points

Tasks use Fibonacci scale for estimation: 1, 2, 3, 5, 8, 13, 21

---

Built for [Padoku](https://padoku.com) パドク - Run your laps. Beat your pace. 🏁
