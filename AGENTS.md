# AGENTS.md - Tianrui Textile Payload CMS Migration

## Dependencies

### Backend (Payload CMS)
- `payload` - Headless CMS framework
- `@payloadcms/db-postgres` - PostgreSQL database adapter
- `@payloadcms/richtext-lexical` - Rich text editor
- `@payloadcms/payload-cloud` - Cloud deployment utilities
- `uuid` - UUID generation for chat sessions

### Frontend (Existing)
- `react` / `react-dom` - UI framework
- `react-router-dom` - Routing
- `framer-motion` - Animations
- `lucide-react` - Icons
- `recharts` - Charts
- `@supabase/supabase-js` - Supabase client (legacy)

## Architecture

### Backend Structure (Payload CMS)
```
server/
├── src/
│   ├── payload.config.ts      # Main Payload configuration
│   └── collections/
│       ├── Users.ts           # Admin users with JWT auth
│       ├── Media.ts           # File uploads with image sizes
│       ├── Products.ts        # Product catalog
│       ├── News.ts            # News articles
│       ├── FormSubmissions.ts # Contact/inquiry forms
│       └── ChatSessions.ts    # Customer chat sessions
├── uploads/                   # Static file storage
└── package.json
```

### API Changes
- **Old**: Express + Prisma REST API
- **New**: Payload CMS REST API (`/api/:collection`)
- **Auth**: JWT tokens via `/api/users/login`

### Data Model Mapping
| Prisma Model | Payload Collection | Notes |
|--------------|-------------------|-------|
| Product | products | Added attributes group |
| News | news | Auto-publishedAt hook |
| FormSubmission | form-submissions | Status workflow |
| ChatSession | chat-sessions | Messages as array |

## Patterns / Constraints

- **Port**: Server runs on 8080
- **CORS**: Configured for Cloudflare Pages and custom domains
- **Auth**: JWT stored in localStorage, sent as Bearer token
- **Images**: Payload handles resizing (thumbnail, card, tablet)
- **WebSocket**: Chat uses polling fallback (Payload doesn't include WS)
- **Deployment**: Frontend on Cloudflare Pages, Backend on境外云服务器
- **API URL**: Production uses `https://api.tianrui-textile.com`

## What Didn't Work

- ❌ Direct Prisma queries from frontend → Switched to Payload REST API
- ❌ WebSocket for real-time chat → Using polling in AdminChat
- ❌ File upload via custom endpoint → Using Payload Media collection

## Lessons

- Payload's `beforeChange` hooks auto-set publishedAt
- Image URLs need transformation: `image.url` vs direct string
- API response format: `{ docs: [], totalDocs, page, totalPages }`
