# Off The Blvd Coffee

Off The Blvd Coffee is a custom Cloudflare Pages website and admin platform for managing a mobile coffee cart business.

This project is also the first implementation of a reusable multi-business platform that can eventually support other entrepreneurs, pop-ups, service businesses, and small business websites.

## Current Architecture

The project uses:

* Cloudflare Pages for hosting
* Cloudflare Pages Functions for API endpoints
* Cloudflare D1 for database-backed content
* Custom admin dashboard for business-owner content management
* Static frontend files for the public website

## Folder Structure

```text
admin/
  admin.html
  admin.css
  admin.js

assets/
  site.css
  site.js
  images and brand assets

functions/
  api/
    admin-about.js
    admin-events.js
    admin-gallery.js
    admin-login.js
    admin-menu.js
    admin-quote-notes.js
    admin-quotes.js
    admin-reviews.js
    admin-update-quote.js
    about.js
    events.js
    gallery.js
    menu.js
    quote.js
    reviews.js

index.html
thank-you.html
TODO.md
package.json
package-lock.json
```

## Public Website

The public website is split into:

```text
index.html
assets/site.css
assets/site.js
```

The public website loads dynamic content from public API endpoints backed by D1.

## Public API Endpoints

```text
GET /api/about
GET /api/events
GET /api/gallery
GET /api/menu
GET /api/reviews
POST /api/quote
```

These endpoints power the public website.

## Admin API Endpoints

```text
POST /api/admin-login

GET /api/admin-quotes
POST /api/admin-update-quote

GET /api/admin-quote-notes
POST /api/admin-quote-notes

GET /api/admin-events
POST /api/admin-events
PUT /api/admin-events
DELETE /api/admin-events

GET /api/admin-menu
POST /api/admin-menu
PUT /api/admin-menu
DELETE /api/admin-menu

GET /api/admin-gallery
POST /api/admin-gallery
PUT /api/admin-gallery
DELETE /api/admin-gallery

GET /api/admin-reviews
POST /api/admin-reviews
PUT /api/admin-reviews
DELETE /api/admin-reviews

GET /api/admin-about
POST /api/admin-about
```

## Admin Modules

The admin dashboard currently manages:

* Quote requests
* Quote notes
* Events
* Menu items
* Gallery images
* Reviews
* About content

The admin is designed for non-technical business owners. Labels and helper text should remain friendly, clear, and business-focused.

Avoid exposing database-style terms to owners where possible.

## Database Tables

Current D1 tables include:

```text
quotes
quote_notes
events
menu_items
gallery_images
reviews
site_about
```

## Current Status

Completed:

* Public website
* Custom admin login
* Quote request system
* Quote status management
* Quote notes
* Events management
* Menu management
* About management
* Gallery management using temporary image URLs
* Reviews management
* Public D1-powered Events, Menu, About, Gallery, and Reviews
* Separated public CSS and JavaScript
* Project cleanup from old Decap CMS / JSON content architecture

## Important Development Rules

When modifying admin functionality:

* Prefer full clean replacements over small patches.
* Keep function names unique and module-specific.
* Keep DOM constants unique and descriptive.
* Update script cache-busters after JavaScript changes.
* Avoid appending random code to the bottom of files.

Example:

```html
<script src="/admin/admin.js?v=14"></script>
```

## Known Temporary Limitation

Gallery currently uses pasted public image addresses.

This is temporary.

Final desired workflow:

```text
Choose Photo From Computer
→ Upload to Cloudflare R2
→ Save image URL automatically
→ Display on website
```

Business owners should not need to understand image URLs, file paths, storage buckets, or Cloudflare R2.

## Future Roadmap

Next priorities:

1. Admin UX polish
2. Cloudflare R2 image uploads
3. Platform-ready media upload service
4. Template/theme support
5. Multi-business configuration layer
6. Reusable business modules
7. Ownership transfer plan for client projects

## Platform Direction

This project should continue evolving as a reusable small-business website platform, not a one-off coffee website.

Future features should be evaluated by whether they can support multiple businesses with different branding, services, products, and content.

The goal is to reuse the same core architecture while allowing each business to have its own look, content, modules, and configuration.
