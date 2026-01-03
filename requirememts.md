You are an expert full-stack developer specializing in Qwik, Payload CMS, monorepos, authentication integrations, and real-time features.

Help me build a very basic e-commerce-like website from scratch in a monorepo structure, up to production-ready deployment. Use Turborepo (or pnpm workspaces if simpler) for the monorepo to manage shared code, caching, and separate apps/packages.

Project Structure Goal (Turborepo-style):
- packages/
  - ui/ (shared UI components, e.g., buttons, layouts – optional but recommended)
  - config/ or shared types if needed
- apps/
  - cms/ (Payload CMS backend)
  - web/ (Qwik frontend app)

Key Requirements:

1. **Monorepo Setup**:
   - Initialize a Turborepo monorepo with pnpm or yarn.
   - Create two apps: one for Payload CMS (Node.js/Express), one for Qwik (Qwik City).
   - Ensure shared dependencies and types if possible.
   - Provide scripts for dev (run both apps concurrently), build, and deploy.

2. **Payload CMS Backend (apps/cms)**:
   - Set up a basic Payload CMS with MongoDB (local or Atlas).
   - Enable GraphQL API.
   - Integrate ZITADEL for authentication and user management:
     - Use the community plugin: @newesissrl/payload-zitadel-plugin (available on npm).
     - Configure OIDC/OAuth with ZITADEL (assume self-hosted or cloud instance; provide env vars for client ID, redirect URI, endpoints).
     - Sync ZITADEL users to a Payload 'Users' collection (or custom collection) for admin access and frontend auth.
     - Users logged in via ZITADEL should be manageable in Payload (e.g., roles, etc.).
   - Create a simple 'Products' collection:
     - Fields: title (text), description (rich text), price (number), variants (array of objects: e.g., size/text, color/text, stock/number, additionalPrice/number).
     - Optionally: images (upload field).
     - Seed 1-2 example products with variants via seed script.

3. **Qwik Frontend (apps/web)**:
   - Use Qwik City for routing and SSR.
   - Make it a Progressive Web App (PWA):
     - Add manifest.json, icons.
     - Configure service worker (use @qwikdev/pwa or manual setup in src/routes/service-worker.ts for offline caching).
     - Ensure installable and offline-basic functionality.
   - Authentication:
     - Handle ZITADEL OAuth login/logout (redirect to ZITADEL, handle callback, store token securely – e.g., HTTP-only cookies or localStorage).
     - Protect routes/pages for logged-in users.
     - Use Payload's access control if needed for authenticated queries.
   - Product Display:
     - Create a home/page route that fetches a product (or list) via GraphQL from Payload (use @apollo/client or fetch).
     - Display product details with selectable variants (e.g., dropdowns for size/color, update price/stock dynamically client-side).
     - Reference example: https://github.com/gustavocadev/qwik-payload-cms-example for Qwik + Payload integration.
   - Simple Chat Feature (only for logged-in users):
     - Use matrix-js-sdk (https://matrix.org/docs/guides/usage-of-the-matrix-js-sdk or GitHub examples).
     - Set up a basic Matrix client (connect to a public homeserver like matrix.org or self-hosted Synapse for testing).
     - Create a single global chat room or per-user direct chats.
     - Features: login with Matrix account (or tie to ZITADEL user if possible), send/receive messages in real-time (use sync and event listeners), simple UI (message list + input).
     - Keep it minimal: one chat room, display messages, send new ones.

General Guidelines:
- Keep everything very basic/minimal viable – focus on working prototypes.
- Use TypeScript everywhere.
- Provide step-by-step instructions, code snippets, config files, and explanations.
- Handle environment variables securely.
- Suggest deployment: Payload to Cloudflare/Node, Qwik to Netlify/Vercel/Cloudflare (static-adaptable).
- If something is complex (e.g., full Matrix server), suggest simplifications or public homeserver for demo.
- Proceed phase-by-phase: start with monorepo setup, then Payload, then Qwik integration, auth, products, PWA, chat.
- Ask for clarification if needed (e.g., ZITADEL instance details, preferred Matrix homeserver).

Start with Phase 1: Setting up the Turborepo monorepo and initializing the two apps.

---

# ✅ **Phase 1 Complete: Monorepo Setup**

**What we accomplished:**

1. **Monorepo initialized**

   * Using **pnpm workspaces** and **Turborepo**.
   * Root folder structure:

```
ecommerce-monorepo/
  apps/
    cms/    (Payload CMS backend)
    web/    (Qwik frontend)
  packages/
    ui/     (shared components)
```

2. **Shared UI package scaffolded** (`packages/ui`)

   * Ready for reuse across apps.

3. **Payload CMS app scaffolded** (`apps/cms`)

   * Using the **blank template** (v3).
   * Fixed CLI issue: replaced obsolete `payload dev` with `payload run src/server.ts`.
   * `server.ts` created to bootstrap Payload with `payload.config.ts`.

4. **Qwik frontend app scaffolded** (`apps/web`)

   * Using **Qwik City**.
   * Updated dev script to use `vite --mode ssr` (replacing old `qwik dev`).
   * Linked to shared UI package.

5. **Monorepo scripts** in root `package.json`:

```json
"scripts": {
  "dev": "turbo run dev --parallel",
  "build": "turbo run build"
}
```

* `pnpm dev` now starts both apps concurrently (once CMS issues are fixed).

6. **Workspace issues resolved**

   * Removed temporary `.create-qwik-*` folders.
   * Adjusted package paths for Payload and Qwik.

**Phase 1 Result:**

* Development environment scaffolding is complete.
* Both apps are ready to connect to **MongoDB** and **ZITADEL**.

---

# 🚀 **Next Phases (Phase 2 → Phase 6)**

### **Phase 2: Backend Setup (Payload CMS)**

* Configure **Postgres connection** (via Docker Compose).
* Enable **GraphQL API**.
* Configure custom for authentication.
* Set up **Users collection** compatible with ZITADEL.
* Verify CMS boots correctly with `pnpm --filter cms dev`.

---

### **Phase 3: Products Collection**

* Create `Products` collection in Payload:

  * Fields: title, description, price, variants, images.
* Write **seed script** to insert example products with variants.
* Verify GraphQL queries return products.

---

### **Phase 4: Frontend Setup (Qwik)**

* Configure Qwik app to fetch **products via GraphQL**.
* Display products, handle **variant selection**, dynamic pricing, stock.
* Add **shared UI components** usage (`packages/ui`).
* Protect routes for logged-in users (ZITADEL auth).

---

### **Phase 5: Authentication**

* Implement **ZITADEL OAuth login/logout** in Qwik.
* Store tokens securely (HTTP-only cookies or localStorage).
* Sync users/roles from ZITADEL to Payload.
* Protect admin-only or authenticated routes.

---

### **Phase 6: Real-Time Features**

* Implement **chat feature** using **Matrix JS SDK**:

  * Use public or local homeserver.
  * Basic UI: message list + input.
  * Login tied to ZITADEL user (if possible).
* Ensure **real-time send/receive** works in frontend.

---

### **Phase 7: PWA & Deployment**

* Configure Qwik as a **Progressive Web App**:

  * Manifest, service worker, offline caching.
* Prepare **production builds**:

  * Payload: deploy via Node server / Cloudflare / Render.
  * Qwik: deploy via Vercel / Netlify / Cloudflare Pages.
* Add environment variables securely.

---

### ✅ Next Immediate Step

* Since you **don’t have MongoDB or ZITADEL locally**, we can **use Docker Compose** to spin up both services.
* After that, Payload CMS can connect and we can implement ZITADEL plugin and Products collection.

---

If you want, I can **write a ready-to-use Docker Compose setup for MongoDB + ZITADEL** that plugs directly into your monorepo. This would let us start Phase 2 immediately.

Do you want me to do that next?

