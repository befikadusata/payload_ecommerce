# E-commerce Platform Monorepo

This monorepo houses a complete e-commerce platform, featuring a powerful CMS backend built with Payload, a fast and modern frontend developed with Qwik, and a shared UI component library.

## Features

-   **Product Management**: Comprehensive tools for managing products, categories, and inventory via the CMS.
-   **User Authentication**: Secure user registration and login for both customers (frontend) and administrators (CMS).
-   **Shopping Cart & Checkout**: Seamless shopping experience with cart functionality and a robust checkout process.
-   **Content Management**: Easily manage pages, blog posts, and other static content through the CMS.
-   **Media Management**: Upload and manage product images, banners, and other media assets.

## Tech Stack

-   **Backend (CMS)**:
    -   [Payload CMS 3.0](https://payloadcms.com/): Headless CMS for data management.
    -   [Next.js](https://nextjs.org/): Framework for the Payload admin UI.
    -   [MongoDB / PostgreSQL](https://www.mongodb.com/ / https://www.postgresql.org/): Database (configured via Payload).
    -   [payload-zitadel-plugin](https://github.com/payloadcms/payload-zitadel-plugin): Zitadel integration for authentication.
-   **Frontend (Web)**:
    -   [Qwik](https://qwik.builder.io/): Resumable JavaScript framework for high-performance frontend.
    -   [Qwik City](https://qwik.builder.io/docs/qwik-city/overview/): Router and meta-framework for Qwik applications.
    -   [Tailwind CSS](https://tailwindcss.com/): Utility-first CSS framework.
    -   [matrix-js-sdk](https://github.com/matrix-org/matrix-js-sdk): Matrix client-server SDK for chat functionality (if implemented).
-   **Shared UI**:
    -   `@acme/ui`: A workspace package containing reusable UI components.
-   **Monorepo Tooling**:
    -   [pnpm](https://pnpm.io/): Fast, disk space efficient package manager.
    -   [TurboRepo](https://turbo.build/repo): High-performance build system for JavaScript and TypeScript monorepos.

## Monorepo Structure

-   `apps/cms`: The Payload CMS application, serving as the backend and administrative interface.
-   `apps/web`: The customer-facing e-commerce storefront built with Qwik.
-   `packages/ui`: A shared library for UI components used across `cms` and `web`.

## Getting Started

To get this project up and running on your local machine, follow these steps:

### Prerequisites

-   Node.js (v18.20.2 or >=20.9.0 for CMS, ^18.17.0 || ^20.3.0 || >=21.0.0 for Web)
-   pnpm (v9 or v10)

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd payload_ecommerce
```

### 2. Install Dependencies

Install all monorepo dependencies using pnpm:

```bash
pnpm install
```

### 3. Environment Variables

Each application requires its own `.env` file. Refer to the `.env.example` (or similar) files within `apps/cms` and `apps/web` for required variables.

**Example for `apps/cms/.env`:**
```env
# MONGODB_URL=mongodb://localhost:27017/payload-ecommerce
# PAYLOAD_SECRET=YOUR_PAYLOAD_SECRET_KEY
# NEXT_PUBLIC_SERVER_URL=http://localhost:3001
```

**Example for `apps/web/.env`:**
```env
# QWIK_PUBLIC_API_URL=http://localhost:3001/api # Adjust if your CMS API is on a different port/path
```

### 4. Run the Development Servers

You can run both the CMS and Web applications concurrently.

#### Start the CMS (Backend)

Navigate to the `apps/cms` directory and start the development server:

```bash
cd apps/cms
pnpm dev
# The CMS will typically run on http://localhost:3001 (or as configured in .env)
```

#### Start the Web (Frontend)

In a new terminal, navigate to the `apps/web` directory and start the development server:

```bash
cd apps/web
pnpm dev
# The Web app will typically run on http://localhost:5173 (or as configured by Vite)
```

### 5. Seeding Data (Optional)

The CMS application includes a seeding script to populate your database with initial data (e.g., admin user, products).

```bash
cd apps/cms
pnpm seed
```

## Available Scripts

Common scripts for each application:

### `apps/cms`

-   `pnpm dev`: Starts the Payload CMS with Next.js development server.
-   `pnpm build`: Builds the Payload CMS for production.
-   `pnpm start`: Starts the production Payload CMS server.
-   `pnpm seed`: Seeds the database with initial data.
-   `pnpm generate:types`: Generates Payload types.
-   `pnpm lint`: Lints the CMS codebase.
-   `pnpm test`: Runs integration and e2e tests.

### `apps/web`

-   `pnpm dev`: Starts the Qwik development server.
-   `pnpm build`: Builds the Qwik application for production.
-   `pnpm preview`: Previews the production build locally.
-   `pnpm fmt`: Formats the code using Prettier.
-   `pnpm lint`: Lints the web codebase.
-   `pnpm qwik`: Qwik CLI commands.

### `packages/ui`

(Assuming standard `package.json` scripts for a UI library)
-   `pnpm dev`: (If applicable) Starts a development environment for the UI library.
-   `pnpm build`: Builds the UI library.

---

Feel free to explore and contribute!