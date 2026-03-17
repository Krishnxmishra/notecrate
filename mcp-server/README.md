# NoteCrate MCP Server

Connects Claude directly to your NoteCrate highlights. Claude can list your folders, read highlights, and search across all your saved content — no copy-pasting needed.

## Setup

### 1. Export your data from NoteCrate

In the NoteCrate web app, open any folder → **Upload to Claude** → **Download** (JSON format). Save the file as `notecrate-data.json` in this directory.

Or set `DATA_FILE` env var to point to any path:
```
DATA_FILE=/path/to/my-export.json node server.js
```

### 2. Install dependencies

```bash
cd mcp-server
npm install
```

### 3. Add to Claude Desktop config

Edit `~/AppData/Roaming/Claude/claude_desktop_config.json` (Windows) or `~/Library/Application Support/Claude/claude_desktop_config.json` (Mac):

```json
{
  "mcpServers": {
    "notecrate": {
      "command": "node",
      "args": ["C:/Users/krish/Desktop/NoteCrate/mcp-server/server.js"],
      "env": {
        "DATA_FILE": "C:/Users/krish/Desktop/NoteCrate/mcp-server/notecrate-data.json"
      }
    }
  }
}
```

Restart Claude Desktop. You'll see "notecrate" in the tools panel.

## Available Tools

| Tool | Description |
|------|-------------|
| `list_folders` | List all folders with highlight counts |
| `get_folder_highlights` | Read all highlights in a folder (includes sub-folders) |
| `search_highlights` | Search across all highlights by keyword |
| `export_folder` | Export a folder as Markdown, JSON, or plain text |

## Example Claude prompts (after connecting)

- *"List my NoteCrate folders"*
- *"Get the highlights from my Kitchen Renovation folder"*
- *"Search my highlights for 'pricing'"*
- *"Export my Thesis Research folder and summarize the key themes"*

## Data file format

The MCP server expects a JSON file with this shape (produced by the NoteCrate export):

```json
{
  "folders": [
    { "id": "f1", "name": "My Folder", "parentId": null }
  ],
  "highlights": [
    {
      "id": "h1",
      "text": "Highlight text",
      "sourceTitle": "Article Title",
      "sourceUrl": "https://example.com",
      "color": "yellow",
      "folderId": "f1",
      "type": "text",
      "createdAt": "2026-01-01"
    }
  ]
}
```
