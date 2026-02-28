#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// Configuration - set via environment variables
const API_URL = process.env.PADOKU_API_URL || 'https://padoku.com';
const API_TOKEN = process.env.PADOKU_API_TOKEN || '';

// Types
interface WorkItem {
  id: string;
  title: string;
  description: string | null;
  status: 'garage' | 'on_track' | 'pits' | 'checkered';
  parent_id: string | null;
  due_at: number | null;
  grid_points: number | null;
  is_goal: boolean;
  position: number;
  created_at: number;
  updated_at: number;
}

// API helpers
async function apiRequest(path: string, options: RequestInit = {}): Promise<any> {
  const url = `${API_URL}/api${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>,
  };

  if (API_TOKEN) {
    headers['Authorization'] = `Bearer ${API_TOKEN}`;
  }

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API error (${response.status}): ${error}`);
  }

  return response.json();
}

// Tool implementations
async function listWorkItems(status?: string, parentId?: string): Promise<WorkItem[]> {
  let path = '/work-items';
  const params = new URLSearchParams();
  
  if (parentId) {
    params.set('parent_id', parentId);
  }
  
  if (params.toString()) {
    path += `?${params.toString()}`;
  }

  const items: WorkItem[] = await apiRequest(path);
  
  if (status) {
    return items.filter(item => item.status === status);
  }
  
  return items;
}

async function getWorkItem(id: string): Promise<WorkItem> {
  return apiRequest(`/work-items/${id}`);
}

async function createWorkItem(data: {
  title: string;
  description?: string;
  status?: string;
  parent_id?: string;
  due_at?: string;
  grid_points?: number;
}): Promise<WorkItem> {
  const body: any = {
    title: data.title,
    status: data.status || 'garage',
  };

  if (data.description) body.description = data.description;
  if (data.parent_id) body.parent_id = data.parent_id;
  if (data.grid_points) body.grid_points = data.grid_points;
  if (data.due_at) {
    // Parse date string to timestamp
    body.due_at = new Date(data.due_at).getTime();
  }

  return apiRequest('/work-items', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

async function updateWorkItem(id: string, data: {
  title?: string;
  description?: string;
  status?: string;
  due_at?: string;
  grid_points?: number;
}): Promise<WorkItem> {
  const body: any = {};

  if (data.title) body.title = data.title;
  if (data.description !== undefined) body.description = data.description;
  if (data.status) body.status = data.status;
  if (data.grid_points !== undefined) body.grid_points = data.grid_points;
  if (data.due_at) {
    body.due_at = new Date(data.due_at).getTime();
  }

  return apiRequest(`/work-items/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

async function deleteWorkItem(id: string): Promise<void> {
  await apiRequest(`/work-items/${id}`, { method: 'DELETE' });
}

// Format work item for display
function formatWorkItem(item: WorkItem): string {
  const statusEmoji: Record<string, string> = {
    garage: '🔧',
    on_track: '🏎️',
    pits: '⏸️',
    checkered: '🏁',
  };

  let result = `${statusEmoji[item.status] || '📋'} **${item.title}**\n`;
  result += `   ID: ${item.id}\n`;
  result += `   Status: ${item.status}\n`;
  
  if (item.grid_points) {
    result += `   Grid Points: ${item.grid_points} GP\n`;
  }
  
  if (item.due_at) {
    result += `   Due: ${new Date(item.due_at).toLocaleDateString()}\n`;
  }
  
  if (item.description) {
    result += `   Description: ${item.description}\n`;
  }

  return result;
}

// Create MCP server
const server = new Server(
  {
    name: 'padoku-mcp',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'list_tasks',
      description: 'List all tasks/work items in Padoku. Can filter by status (garage, on_track, pits, checkered) or parent project.',
      inputSchema: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            description: 'Filter by status: garage (backlog), on_track (in progress), pits (blocked), checkered (done)',
            enum: ['garage', 'on_track', 'pits', 'checkered'],
          },
          parent_id: {
            type: 'string',
            description: 'Filter by parent project/epic ID',
          },
        },
      },
    },
    {
      name: 'get_task',
      description: 'Get details of a specific task by ID',
      inputSchema: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'The task ID',
          },
        },
        required: ['id'],
      },
    },
    {
      name: 'create_task',
      description: 'Create a new task in Padoku',
      inputSchema: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            description: 'Task title',
          },
          description: {
            type: 'string',
            description: 'Task description (optional)',
          },
          status: {
            type: 'string',
            description: 'Initial status (default: garage)',
            enum: ['garage', 'on_track', 'pits', 'checkered'],
          },
          parent_id: {
            type: 'string',
            description: 'Parent project/epic ID (optional)',
          },
          due_at: {
            type: 'string',
            description: 'Due date in ISO format (e.g., 2024-03-15)',
          },
          grid_points: {
            type: 'number',
            description: 'Story points using Fibonacci scale (1, 2, 3, 5, 8, 13, 21)',
          },
        },
        required: ['title'],
      },
    },
    {
      name: 'update_task',
      description: 'Update an existing task',
      inputSchema: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'The task ID to update',
          },
          title: {
            type: 'string',
            description: 'New title',
          },
          description: {
            type: 'string',
            description: 'New description',
          },
          status: {
            type: 'string',
            description: 'New status',
            enum: ['garage', 'on_track', 'pits', 'checkered'],
          },
          due_at: {
            type: 'string',
            description: 'New due date in ISO format',
          },
          grid_points: {
            type: 'number',
            description: 'New grid points',
          },
        },
        required: ['id'],
      },
    },
    {
      name: 'complete_task',
      description: 'Mark a task as complete (move to checkered status)',
      inputSchema: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'The task ID to complete',
          },
        },
        required: ['id'],
      },
    },
    {
      name: 'delete_task',
      description: 'Delete a task permanently',
      inputSchema: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'The task ID to delete',
          },
        },
        required: ['id'],
      },
    },
  ],
}));

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'list_tasks': {
        const items = await listWorkItems(args?.status as string, args?.parent_id as string);
        if (items.length === 0) {
          return {
            content: [{ type: 'text', text: 'No tasks found.' }],
          };
        }
        const formatted = items.map(formatWorkItem).join('\n');
        return {
          content: [{ type: 'text', text: `Found ${items.length} tasks:\n\n${formatted}` }],
        };
      }

      case 'get_task': {
        const item = await getWorkItem(args?.id as string);
        return {
          content: [{ type: 'text', text: formatWorkItem(item) }],
        };
      }

      case 'create_task': {
        const item = await createWorkItem(args as any);
        return {
          content: [{ type: 'text', text: `✅ Task created!\n\n${formatWorkItem(item)}` }],
        };
      }

      case 'update_task': {
        const { id, ...updates } = args as any;
        const item = await updateWorkItem(id, updates);
        return {
          content: [{ type: 'text', text: `✅ Task updated!\n\n${formatWorkItem(item)}` }],
        };
      }

      case 'complete_task': {
        const item = await updateWorkItem(args?.id as string, { status: 'checkered' });
        return {
          content: [{ type: 'text', text: `🏁 Task completed!\n\n${formatWorkItem(item)}` }],
        };
      }

      case 'delete_task': {
        await deleteWorkItem(args?.id as string);
        return {
          content: [{ type: 'text', text: `🗑️ Task deleted successfully.` }],
        };
      }

      default:
        return {
          content: [{ type: 'text', text: `Unknown tool: ${name}` }],
          isError: true,
        };
    }
  } catch (error) {
    return {
      content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
      isError: true,
    };
  }
});

// List resources (projects/epics)
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  try {
    const items = await listWorkItems();
    // Filter to top-level items (potential projects)
    const projects = items.filter(item => !item.parent_id);
    
    return {
      resources: projects.map(project => ({
        uri: `padoku://project/${project.id}`,
        name: project.title,
        description: project.description || `Status: ${project.status}`,
        mimeType: 'application/json',
      })),
    };
  } catch {
    return { resources: [] };
  }
});

// Read resource content
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const uri = request.params.uri;
  const match = uri.match(/^padoku:\/\/project\/(.+)$/);
  
  if (!match) {
    throw new Error(`Invalid resource URI: ${uri}`);
  }

  const projectId = match[1];
  const project = await getWorkItem(projectId);
  const children = await listWorkItems(undefined, projectId);

  return {
    contents: [
      {
        uri,
        mimeType: 'application/json',
        text: JSON.stringify({ project, children }, null, 2),
      },
    ],
  };
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Padoku MCP server running on stdio');
}

main().catch(console.error);
