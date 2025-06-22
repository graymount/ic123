# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

IC123 is an integrated circuit industry information aggregation platform serving as a navigation hub for Chinese IC professionals. The platform provides categorized website recommendations, WeChat public account directories, and industry news aggregation.

## Architecture

The project consists of three main components:

### Backend (`/backend`)
- **Technology**: Hono framework on Cloudflare Workers with TypeScript
- **Database**: Supabase (PostgreSQL) with comprehensive schema for websites, news, WeChat accounts, categories, and analytics
- **API**: RESTful endpoints for all platform features
- **Deployment**: Cloudflare Workers using Wrangler

### Frontend (`/frontend`) 
- **Technology**: Next.js 14 with TypeScript, Tailwind CSS, and React 18
- **Features**: Server-side rendering, responsive design, search functionality
- **Deployment**: Cloudflare Pages (static export)

### Crawler (`/crawler`)
- **Technology**: Python with BeautifulSoup, requests, and Supabase client
- **Purpose**: Automated news scraping and website status monitoring
- **Scheduling**: Built-in scheduler for periodic data updates

## Development Commands

### Quick Start
```bash
# Complete environment setup and start all services
bash scripts/dev.sh

# Check service status
bash scripts/dev.sh status

# Stop all services  
bash scripts/dev.sh stop
```

### Backend Development
```bash
cd backend
npm run dev        # Start Wrangler dev server (localhost:8787)
npm run build      # Build for production (no-op for Hono)
npm run deploy     # Deploy to Cloudflare Workers
npm run lint       # ESLint check
npm run test       # Jest tests
npm run start      # Alternative dev server command
```

### Frontend Development
```bash
cd frontend
npm run dev        # Next.js dev server (localhost:3000)
npm run build      # Production build with static export
npm run start      # Production server
npm run lint       # Next.js lint
npm run type-check # TypeScript check
```

### Crawler Operations
```bash
cd crawler
python main.py status    # Check crawler status
python main.py news      # Run news scraping
python main.py schedule  # Start background scheduler
pip install -r requirements.txt  # Install dependencies
```

## Database Schema

Key tables in Supabase PostgreSQL:
- `websites` - IC industry website directory with categories, ratings, visit counts
- `news` - Aggregated industry news with metadata and analytics  
- `wechat_accounts` - WeChat public account directory
- `categories` - Website categorization system
- `user_feedback` - Community contributions and suggestions
- `visit_stats` - Usage analytics and tracking

## Configuration Requirements

Environment files needed:
- `backend/.env` - Supabase credentials and API configuration
- `frontend/.env.local` - Frontend API endpoints and public keys
- `crawler/.env` - Python scraper configuration and database access

## Deployment Architecture

- **Backend**: Cloudflare Workers (serverless)
- **Frontend**: Cloudflare Pages (static hosting)
- **Database**: Supabase (managed PostgreSQL)
- **Domain**: Configured via Cloudflare DNS

## Development Workflow

1. Run `bash scripts/setup.sh` for initial environment setup
2. Use `bash scripts/dev.sh` to start all services simultaneously  
3. Backend API available at `http://localhost:8787/api`
4. Frontend application at `http://localhost:3000`
5. Use tmux session management for multi-service development

## Admin Functionality

The project includes admin endpoints and interfaces:

### Backend Admin Routes
- `POST /api/websites/admin/auto-classify` - Automatically categorize websites using keyword rules
- `POST /api/websites/admin/update-categories` - Batch update website categories  
- Admin feedback management endpoints in `/api/feedback/admin/`

### Frontend Admin Interface
- `/admin` - Admin dashboard for managing user feedback
- Requires no authentication (publicly accessible for development)
- Manages feedback status: pending → reviewed → approved/rejected

## Testing and Quality

- Backend uses Jest for API testing
- Frontend includes TypeScript strict checking
- ESLint configured for both frontend and backend
- Database migrations and RLS policies implemented

## Architecture Patterns

### Backend Architecture
- **Hono framework** on Cloudflare Workers with TypeScript
- **Database layer**: Typed Supabase client with service role and anon key separation
- **Routes structure**: Modular route handlers in `/src/routes/` with corresponding controllers
- **Error handling**: Centralized error middleware with structured JSON responses
- **Database access**: Row Level Security (RLS) policies for data protection

### Frontend Architecture  
- **Next.js 14** with App Router and TypeScript
- **Static generation**: Configured for Cloudflare Pages deployment
- **Component structure**: Reusable UI components in `/src/components/`
- **API integration**: Centralized API client in `/src/lib/api.ts`
- **Styling**: Tailwind CSS with custom component variants

### Data Flow
- Frontend calls backend API endpoints
- Backend validates requests and queries Supabase
- RLS policies enforce data access permissions
- Crawler independently updates database via service role