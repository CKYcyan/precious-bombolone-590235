# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Taiwan Sea Slug (海蛞蝓) records website** — a community-driven citizen science platform for documenting marine nudibranch species observed around Taiwan. It features a public species database, knowledge base, gallery, user submission system, and an admin backend.

## Running Locally

There is no build step. This is a pure static site (HTML/CSS/JS) using the Supabase JS SDK directly in the browser.

To serve locally (required for Supabase CORS to work):
```bash
python -m http.server 8000
# or
npx http-server
```

Then open `http://localhost:8000`.

## Architecture

**Frontend:** Vanilla HTML/CSS/JS — no framework, no bundler, no package.json.

**Backend:** [Supabase](https://supabase.com) (PostgreSQL + Auth + Storage). All database queries run client-side using the Supabase JS SDK v2.

**Connection config:** `js/config.js` — holds the Supabase URL and public anon key.

### Shared JS Modules
- `js/config.js` — Supabase client initialization (imported by all pages)
- `js/template.js` — Injects shared `<nav>` and `<footer>` HTML, plus the lightbox component
- `js/nav.js` — Handles navigation auth state (show/hide login button, user dropdown)
- `admin/admin.js` — Admin-only utilities: `requireAdmin()` auth guard, toast notifications, file upload helpers

### Page Structure
```
index.html              # Homepage (hero, featured species, latest articles, photos)
pages/
  species/
    index.html          # Species database (search, filter by tags, grid/tree view)
    species.html        # Individual species detail (photos carousel, taxonomy, observations map)
  knowledge/
    index.html          # Knowledge base article list
    article.html        # Single article view
  gallery/index.html    # Curated photo gallery
  submit.html           # Multi-step observation submission form (photo upload, GPS, species guess)
  my-submissions.html   # Contributor's submission history
  login.html            # User login/registration
admin/
  index.html            # Dashboard (stats overview)
  species.html          # Species list management
  species-edit.html     # Species CRUD (photos, taxonomy, similar species, tags)
  submissions.html      # Review queue: approve/reject user submissions
  articles.html         # Article list management
  article-edit.html     # Article CRUD
  gallery.html          # Gallery curation
  members.html          # User management (roles: member, expert, admin)
  tags.html             # Tag/category management
  changelog.html        # Admin changelog editor
```

### Database (Supabase/PostgreSQL)

Schema is in `database/schema.sql`. Key tables:
- `profiles` — User accounts (extends Supabase `auth.users`), with `role` field (member/expert/admin)
- `species` — Sea slug catalog: scientific name, Chinese name, taxonomy, photos array, description
- `categories` / `tags` — Faceted filtering system (location, habitat, color, tidal zone, diet, etc.)
- `species_tags` / `species_similar` — Many-to-many species relationships
- `articles` — Knowledge base posts with publish status
- `gallery` — Curated photo entries linked to species
- `submissions` — User observation records (status: pending/approved/rejected)
- `expert_verifications` — Expert sign-off on species identification
- `changelog` — Website update log

**Row Level Security (RLS)** is enabled on all tables. Public users can read species/articles/gallery/tags. Only authenticated users can create submissions. Only admins can write to species/articles/gallery.

### Photo Storage (Supabase Storage Buckets)
- `species-photos` — Admin-uploaded species reference photos
- `submission-photos` — User observation uploads
- `gallery-photos` — Curated gallery images
- `avatars` — User profile pictures

### Maps
Leaflet.js (v1.9.4) is used for interactive observation maps on species detail pages and the submission form.

## Admin Authentication

All admin pages call `requireAdmin()` from `admin/admin.js` on load. This checks the Supabase session and verifies `profiles.role === 'admin'` (or `'expert'` for some pages), redirecting to `admin/login.html` if unauthorized.

## CSS Architecture

- `css/main.css` — Core styles, CSS custom properties (sea-green color palette), shared components
- `css/responsive.css` — Mobile breakpoints, hamburger nav, responsive grid adjustments
- Admin pages use `admin/admin.css` for the backend UI

## Allowed External Fetches (`.claude/settings.local.json`)

WebFetch is permitted for species reference lookups from:
- `taiwanmollusca.com`
- `www.inaturalist.org`
- `en.seaslug.world`
