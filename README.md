# Crypto tracker app

*Automatically synced with your [v0.app](https://v0.app) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/anthonysheadwork-1804s-projects/v0-crypto-tracker-app)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/projects/l0i3IXHsiIZ)

## Overview

This repository will stay in sync with your deployed chats on [v0.app](https://v0.app).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.app](https://v0.app).

## Deployment

Your project is live at:

**[https://vercel.com/anthonysheadwork-1804s-projects/v0-crypto-tracker-app](https://vercel.com/anthonysheadwork-1804s-projects/v0-crypto-tracker-app)**

## Build your app

Continue building your app on:

**[https://v0.app/chat/projects/l0i3IXHsiIZ](https://v0.app/chat/projects/l0i3IXHsiIZ)**

## How It Works

1. Create and modify your project using [v0.app](https://v0.app)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository


## Optional database (MongoDB + Prisma)

This app is **deployable with zero database configuration**. Database support is strictly opt-in so local-only usage, Vercel previews, or portfolio demos stay fast and fail-safe.

### Environment variables

- `ENABLE_DB`  
  - Optional boolean flag; set to `true` to enable MongoDB + Prisma.  
  - Defaults to `false` when unset so builds never break due to missing secrets.
- `MONGODB_URI`  
  - Optional MongoDB connection string. Required only when `ENABLE_DB=true`.  
  - When missing, database features are skipped and the app continues to work with in-memory/localStorage state.

### Runtime behavior

- When `ENABLE_DB=false` (default), Prisma never initializes, API routes return friendly 503 messages for DB-only endpoints, and favorites stay in localStorage.
- When `ENABLE_DB=true` **and** `MONGODB_URI` is set, Prisma initializes lazily at runtime; no Prisma code runs during `next build` or postinstall steps.

### TODOs for future database work

- TODO: Provide a migration + seed path once database persistence is enabled.
- TODO: Sync localStorage favorites to the database when users sign in.
- TODO: Add authentication/authorization before storing user-specific favorites.
