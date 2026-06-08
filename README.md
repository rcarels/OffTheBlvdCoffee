# Off The Blvd Coffee

## Project Overview

Off The Blvd Coffee is a Cloudflare-based website and business management platform built for mobile coffee catering businesses, pop-up vendors, and event-based entrepreneurs.

The project serves as both:

1. The production website for Off The Blvd Coffee.
2. The first implementation of a reusable multi-business website platform intended for future client deployments.

The platform is designed with a strong focus on:

* Business-owner usability
* Modern design
* Scalable architecture
* Cloud-native deployment
* Reusable modules
* Low maintenance requirements

---

# Technology Stack

## Frontend

* HTML
* CSS
* JavaScript

## Backend

* Cloudflare Pages
* Cloudflare Pages Functions

## Database

* Cloudflare D1 (SQLite)

## Hosting

* Cloudflare Pages

---

# Architecture

```text
Browser
    ↓
Cloudflare Pages
    ↓
Pages Functions
    ↓
Cloudflare D1
```

Content is managed through the custom admin dashboard.

No WordPress, CMS, or third-party site builder is used.

---

# Current Features

## Public Website

* Home page
* About section
* Menu section
* Gallery
* Reviews
* Events
* Quote request form
* Mobile responsive design

## Admin Dashboard

### Quotes

* View quote requests
* Update quote status
* Add internal notes

### Events

* Create events
* Edit events
* Publish/unpublish events

### Menu

* Manage menu items
* Control display order
* Publish/unpublish items

### Gallery

* Manage gallery content
* Display images on website

### Reviews

* Manage customer reviews
* Feature selected reviews

### About

* Manage About page content

---

# Database Structure

Primary tables:

```text
quotes
quote_notes
events
menu_items
gallery_images
reviews
site_about
```

Database migrations are stored in:

```text
Migrations/
```

Current migration files:

```text
Migrations/
├── 0001_initial_schema.sql
├── 0002_seed_data.sql
```

---

# Local Development Setup

## Requirements

Install:

* Node.js
* npm
* Cloudflare Wrangler

Verify:

```bash
node -v
npm -v
```

---

## Install Dependencies

```bash
npm install
```

---

## Authenticate Wrangler

```bash
npx wrangler login
```

Use the Cloudflare account associated with this project.

---

## Run Local Development

```bash
npx wrangler pages dev .
```

---

# Database Management

## Local Migrations

Apply migrations locally:

```bash
npx wrangler d1 migrations apply DB --local
```

---

## Remote Migrations

Apply migrations to production:

```bash
npx wrangler d1 migrations apply DB --remote
```

Always verify migration contents before applying to production.

---

# Cloudflare Configuration

Current D1 database:

```text
offtheblvdcoffee_quotes
```

Database binding:

```text
DB
```

Configuration file:

```text
wrangler.toml
```

---

# Deployment

Production deployment is handled through:

```text
GitHub
    ↓
Cloudflare Pages
    ↓
Automatic Deployment
```

Typical workflow:

```bash
git add .
git commit -m "Description"
git push
```

Cloudflare Pages automatically deploys the latest commit.

---

# Development Standards

## Admin Dashboard

All admin modules must:

* Match the public site's quality
* Be business-owner friendly
* Avoid technical terminology
* Include helper text
* Include validation messages
* Include confirmation dialogs for destructive actions

---

## JavaScript Standards

Avoid patching functionality into existing modules.

Preferred approach:

```text
Replace complete module
```

rather than:

```text
Small incremental patches
```

This helps prevent browser global collisions and event binding issues.

---

# Platform Roadmap

The long-term goal is to evolve this project into a reusable website platform supporting multiple businesses.

Future platform features may include:

* Multi-business support
* Theme system
* Template selection
* Shared media library
* Reusable modules
* Business-specific settings
* Subscription-based deployment model

---

# Current Architectural Priorities

## Sprint 1

* Database migrations
* Documentation cleanup
* Schema verification

## Sprint 2

* Authentication hardening
* Secure sessions
* Access controls

## Sprint 3

* XSS review
* Rendering cleanup
* Security improvements

## Sprint 4

* Cloudflare R2 integration
* Media asset management
* Gallery redesign

---

# Project Status

Status:

```text
Active Development
```

Architecture Direction:

```text
Reusable Multi-Business Platform
```

Primary Goal:

```text
Create a scalable, maintainable platform that can be reused for future business websites while powering Off The Blvd Coffee.
```
