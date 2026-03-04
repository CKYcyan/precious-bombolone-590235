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

### Script Loading Order

Every public page loads scripts in this order: `config.js` → `template.js` → `nav.js` → page-specific inline `<script>`. Admin pages replace `nav.js` with `admin.js`. `supabase` (the global client) must be initialized before any query runs.

### Shared JS Modules
- `js/config.js` — Supabase client initialization (imported by all pages)
- `js/template.js` — Injects shared `<nav>` and `<footer>` HTML, plus the lightbox component (`initLightbox()` activates any element with `data-lightbox` attribute)
- `js/nav.js` — Hamburger menu, active link highlighting, scroll effect, and auth state (calls `updateAuthNav()` which swaps the login link for a user dropdown)
- `admin/admin.js` — `requireAdmin()` auth guard (role must equal `'admin'`), `showToast(msg, type)`, `showConfirm(title, text, onConfirm)`, `uploadImage(file, bucket)`, `renderSidebar(activePage)`

### Page Structure
```
index.html              # Homepage (hero, featured species, latest articles, photos)
pages/
  species/
    index.html          # Species database (search, filter by tags, grid/tree view)
    species.html        # Individual species detail — loaded via ?id=<species_id>
  knowledge/
    index.html          # Knowledge base article list
    article.html        # Single article view — loaded via ?slug=<article_slug>
  gallery/index.html    # Curated photo gallery
  submit.html           # Multi-step observation submission form (photo upload, GPS, species guess)
  my-submissions.html   # Contributor's submission history
  login.html            # User login/registration
  about.html            # About the website
  contact.html          # Contact form
  terms.html            # Terms of use
  changelog.html        # Public website changelog
  regions.html          # Browse by region
admin/
  index.html            # Dashboard (stats overview)
  species.html          # Species list management
  species-edit.html     # Species CRUD — ?id=<species_id> to edit, no param to create
  submissions.html      # Review queue: approve/reject user submissions (experts can also view)
  articles.html         # Article list management
  article-edit.html     # Article CRUD — ?id=<article_id> to edit, no param to create
  gallery.html          # Gallery curation
  members.html          # User management (roles: member, expert, admin)
  tags.html             # Tag/category management
  changelog.html        # Admin changelog editor
```

### CSS Patterns

- `css/main.css` — Core styles, CSS custom properties (sea-green palette), shared components
- `css/responsive.css` — Mobile breakpoints, hamburger nav, responsive grid adjustments
- Admin pages use `admin/admin.css` for the backend UI
- **Each page has its own inline `<style>` block** for page-specific layout; avoid moving these to global CSS unless styles are reused across 3+ pages

### Database (Supabase/PostgreSQL)

Schema is in `database/schema.sql`. Key tables:
- `profiles` — User accounts (extends Supabase `auth.users`), with `role` field (`member` / `expert` / `admin`)
- `species` — Sea slug catalog: `name_zh`, `name_sci`, taxonomy columns, `cover_image`, `description` (rich HTML), `worms_id`
- `categories` / `tags` — Faceted filtering system (location, habitat, color, tidal zone, diet, etc.)
- `species_tags` / `species_similar` — Many-to-many species relationships
- `articles` — Knowledge base posts; `content` stores rich HTML; `slug` used for URL routing
- `gallery` — Curated photo entries linked to species
- `submissions` — User observation records (`status`: `pending` / `approved` / `rejected` / `needs_info`); `photos TEXT[]` stores multiple upload URLs
- `expert_verifications` — Expert sign-off on species identification
- `changelog` — Website update log

**Row Level Security (RLS):** Public users can read published species/articles/gallery/tags. Authenticated users can insert submissions. `role = 'admin'` required for all content writes. `role IN ('admin','expert')` allows reading all submissions and writing `expert_verifications`.

### Photo Storage (Supabase Storage Buckets)
- `species-photos` — Admin-uploaded species reference photos
- `submission-photos` — User observation uploads
- `gallery-photos` — Curated gallery images
- `avatars` — User profile pictures

Use `uploadImage(file, bucket)` from `admin/admin.js` for all admin uploads — it generates a timestamped random filename and returns the public URL.

### Maps
Leaflet.js (v1.9.4) is used for interactive observation maps on species detail pages and the submission form. Pages using Leaflet must include `leaflet.css` from unpkg in `<head>`.

## Admin Authentication

All admin pages call `requireAdmin()` on load. It verifies `profiles.role === 'admin'` and redirects to `login.html` if not. The `submissions.html` page additionally allows `role = 'expert'` via RLS — implement this check separately if needed beyond `requireAdmin()`.

## Deployment

Deployed on Netlify. `netlify.toml` sets the publish directory to `.` (repo root), no build command. Security headers (`X-Frame-Options`, `X-Content-Type-Options`) are applied globally; `/database/*` is marked `noindex`.

## Allowed External Fetches (`.claude/settings.local.json`)

WebFetch is permitted for species reference lookups from:
- `taiwanmollusca.com`
- `www.inaturalist.org`
- `en.seaslug.world`
