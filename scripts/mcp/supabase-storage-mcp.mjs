#!/usr/bin/env node
/**
 * Supabase Storage MCP (self-hosted)
 * --------------------------------------------------------------
 * Minimal, dependency-light MCP server that wraps the Supabase
 * Storage API so an AI assistant can manage image buckets:
 * upload / download / list / delete / move / copy files,
 * create & manage buckets, and generate public / signed URLs.
 *
 * Speaks newline-delimited JSON-RPC 2.0 over stdio (MCP stdio transport).
 * Reuses the project's @supabase/supabase-js (no extra install needed).
 *
 * Config via env (set in .mcp.json):
 *   SUPABASE_URL                 e.g. http://localhost:8000
 *   SUPABASE_SERVICE_ROLE_KEY    service_role JWT (bypasses RLS)
 */

import { readFile, writeFile } from 'node:fs/promises';
import { basename, extname } from 'node:path';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  process.stderr.write(
    '[supabase-storage-mcp] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env.\n'
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const SERVER_INFO = { name: 'supabase-storage', version: '1.0.0' };

const MIME_BY_EXT = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.avif': 'image/avif',
  '.bmp': 'image/bmp',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.json': 'application/json',
  '.txt': 'text/plain',
  '.csv': 'text/csv',
};

function guessContentType(p) {
  return MIME_BY_EXT[extname(p).toLowerCase()] || 'application/octet-stream';
}

// ----------------------------- tool definitions -----------------------------

const TOOLS = [
  {
    name: 'list_buckets',
    description: 'List all storage buckets (id, name, public flag).',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'create_bucket',
    description: 'Create a new storage bucket.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Bucket id/name' },
        public: { type: 'boolean', description: 'Public read access (default false)' },
        file_size_limit: { type: 'string', description: 'e.g. "5MB" (optional)' },
        allowed_mime_types: {
          type: 'array',
          items: { type: 'string' },
          description: 'e.g. ["image/png","image/jpeg"] (optional)',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'delete_bucket',
    description: 'Delete a bucket (must be empty unless emptied first).',
    inputSchema: {
      type: 'object',
      properties: { id: { type: 'string' } },
      required: ['id'],
    },
  },
  {
    name: 'empty_bucket',
    description: 'Delete all objects inside a bucket without removing the bucket.',
    inputSchema: {
      type: 'object',
      properties: { id: { type: 'string' } },
      required: ['id'],
    },
  },
  {
    name: 'list_files',
    description: 'List files in a bucket under an optional folder path.',
    inputSchema: {
      type: 'object',
      properties: {
        bucket: { type: 'string' },
        path: { type: 'string', description: 'Folder prefix (default root)' },
        limit: { type: 'number', description: 'Max items (default 100)' },
        offset: { type: 'number', description: 'Pagination offset (default 0)' },
        search: { type: 'string', description: 'Filter by name (optional)' },
      },
      required: ['bucket'],
    },
  },
  {
    name: 'upload_file',
    description:
      'Upload a local file to a bucket path. content_type is auto-detected from the extension if omitted.',
    inputSchema: {
      type: 'object',
      properties: {
        bucket: { type: 'string' },
        path: { type: 'string', description: 'Destination path inside the bucket, e.g. "salon-1/logo.png"' },
        source_path: { type: 'string', description: 'Absolute path of the local file to upload' },
        content_type: { type: 'string', description: 'MIME type (optional, auto-detected)' },
        upsert: { type: 'boolean', description: 'Overwrite if exists (default true)' },
      },
      required: ['bucket', 'path', 'source_path'],
    },
  },
  {
    name: 'download_file',
    description: 'Download a file from a bucket to a local destination path.',
    inputSchema: {
      type: 'object',
      properties: {
        bucket: { type: 'string' },
        path: { type: 'string', description: 'Source path inside the bucket' },
        dest_path: { type: 'string', description: 'Absolute local destination path' },
      },
      required: ['bucket', 'path', 'dest_path'],
    },
  },
  {
    name: 'delete_files',
    description: 'Delete one or more files from a bucket.',
    inputSchema: {
      type: 'object',
      properties: {
        bucket: { type: 'string' },
        paths: { type: 'array', items: { type: 'string' } },
      },
      required: ['bucket', 'paths'],
    },
  },
  {
    name: 'move_file',
    description: 'Move/rename a file within a bucket.',
    inputSchema: {
      type: 'object',
      properties: {
        bucket: { type: 'string' },
        from: { type: 'string' },
        to: { type: 'string' },
      },
      required: ['bucket', 'from', 'to'],
    },
  },
  {
    name: 'copy_file',
    description: 'Copy a file within a bucket.',
    inputSchema: {
      type: 'object',
      properties: {
        bucket: { type: 'string' },
        from: { type: 'string' },
        to: { type: 'string' },
      },
      required: ['bucket', 'from', 'to'],
    },
  },
  {
    name: 'get_public_url',
    description: 'Get the public URL for a file (only meaningful for public buckets).',
    inputSchema: {
      type: 'object',
      properties: {
        bucket: { type: 'string' },
        path: { type: 'string' },
      },
      required: ['bucket', 'path'],
    },
  },
  {
    name: 'create_signed_url',
    description: 'Create a time-limited signed download URL for a private file.',
    inputSchema: {
      type: 'object',
      properties: {
        bucket: { type: 'string' },
        path: { type: 'string' },
        expires_in: { type: 'number', description: 'Seconds until expiry (default 3600)' },
      },
      required: ['bucket', 'path'],
    },
  },
  {
    name: 'create_signed_upload_url',
    description: 'Create a signed URL that allows uploading a file directly (e.g. from a browser).',
    inputSchema: {
      type: 'object',
      properties: {
        bucket: { type: 'string' },
        path: { type: 'string' },
      },
      required: ['bucket', 'path'],
    },
  },
];

// ----------------------------- tool handlers --------------------------------

async function runTool(name, a = {}) {
  switch (name) {
    case 'list_buckets': {
      const { data, error } = await supabase.storage.listBuckets();
      if (error) throw error;
      return data.map((b) => ({ id: b.id, name: b.name, public: b.public }));
    }
    case 'create_bucket': {
      const { data, error } = await supabase.storage.createBucket(a.id, {
        public: a.public ?? false,
        fileSizeLimit: a.file_size_limit,
        allowedMimeTypes: a.allowed_mime_types,
      });
      if (error) throw error;
      return data;
    }
    case 'delete_bucket': {
      const { data, error } = await supabase.storage.deleteBucket(a.id);
      if (error) throw error;
      return data;
    }
    case 'empty_bucket': {
      const { data, error } = await supabase.storage.emptyBucket(a.id);
      if (error) throw error;
      return data;
    }
    case 'list_files': {
      const { data, error } = await supabase.storage.from(a.bucket).list(a.path || '', {
        limit: a.limit ?? 100,
        offset: a.offset ?? 0,
        search: a.search,
      });
      if (error) throw error;
      return data.map((f) => ({
        name: f.name,
        id: f.id,
        size: f.metadata?.size,
        mimetype: f.metadata?.mimetype,
        updated_at: f.updated_at,
      }));
    }
    case 'upload_file': {
      const buf = await readFile(a.source_path);
      const contentType = a.content_type || guessContentType(a.source_path);
      const { data, error } = await supabase.storage.from(a.bucket).upload(a.path, buf, {
        contentType,
        upsert: a.upsert ?? true,
      });
      if (error) throw error;
      return { path: data.path, contentType, bytes: buf.length, source: basename(a.source_path) };
    }
    case 'download_file': {
      const { data, error } = await supabase.storage.from(a.bucket).download(a.path);
      if (error) throw error;
      const buf = Buffer.from(await data.arrayBuffer());
      await writeFile(a.dest_path, buf);
      return { dest_path: a.dest_path, bytes: buf.length };
    }
    case 'delete_files': {
      const { data, error } = await supabase.storage.from(a.bucket).remove(a.paths);
      if (error) throw error;
      return { deleted: data?.map((d) => d.name) ?? a.paths };
    }
    case 'move_file': {
      const { data, error } = await supabase.storage.from(a.bucket).move(a.from, a.to);
      if (error) throw error;
      return data;
    }
    case 'copy_file': {
      const { data, error } = await supabase.storage.from(a.bucket).copy(a.from, a.to);
      if (error) throw error;
      return data;
    }
    case 'get_public_url': {
      const { data } = supabase.storage.from(a.bucket).getPublicUrl(a.path);
      return { publicUrl: data.publicUrl };
    }
    case 'create_signed_url': {
      const { data, error } = await supabase.storage
        .from(a.bucket)
        .createSignedUrl(a.path, a.expires_in ?? 3600);
      if (error) throw error;
      return data;
    }
    case 'create_signed_upload_url': {
      const { data, error } = await supabase.storage
        .from(a.bucket)
        .createSignedUploadUrl(a.path);
      if (error) throw error;
      return data;
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

// ----------------------------- JSON-RPC plumbing ----------------------------

function send(msg) {
  process.stdout.write(JSON.stringify(msg) + '\n');
}

function reply(id, result) {
  send({ jsonrpc: '2.0', id, result });
}

function replyError(id, code, message) {
  send({ jsonrpc: '2.0', id, error: { code, message } });
}

async function handle(req) {
  const { id, method, params } = req;
  // Notifications (no id) never get a response.
  if (id === undefined || id === null) return;

  switch (method) {
    case 'initialize':
      return reply(id, {
        protocolVersion: params?.protocolVersion || '2025-06-18',
        capabilities: { tools: {} },
        serverInfo: SERVER_INFO,
      });
    case 'ping':
      return reply(id, {});
    case 'tools/list':
      return reply(id, { tools: TOOLS });
    case 'tools/call': {
      const toolName = params?.name;
      const args = params?.arguments || {};
      try {
        const result = await runTool(toolName, args);
        return reply(id, {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        });
      } catch (err) {
        return reply(id, {
          content: [{ type: 'text', text: `Error: ${err?.message || String(err)}` }],
          isError: true,
        });
      }
    }
    default:
      return replyError(id, -32601, `Method not found: ${method}`);
  }
}

// Line-buffered stdin reader (newline-delimited JSON-RPC).
let buffer = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  buffer += chunk;
  let nl;
  while ((nl = buffer.indexOf('\n')) !== -1) {
    const line = buffer.slice(0, nl).trim();
    buffer = buffer.slice(nl + 1);
    if (!line) continue;
    let req;
    try {
      req = JSON.parse(line);
    } catch {
      continue; // ignore malformed line
    }
    handle(req).catch((e) => process.stderr.write(`[handler] ${e?.message}\n`));
  }
});

process.stderr.write('[supabase-storage-mcp] ready\n');
