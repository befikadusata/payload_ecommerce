# Payload E-commerce Monorepo

## Project Overview

This is a monorepo e-commerce project built using Payload CMS and Qwik, managed with pnpm and Turbo. The project consists of two main applications:

1. **CMS App** (`apps/cms`): A Payload CMS 3.0 application built on Next.js 15, serving as the content management system and backend API for the e-commerce platform.
2. **Web App** (`apps/web`): A Qwik City application that serves as the frontend for the e-commerce website.

The project uses MongoDB as the database and includes a shared UI package (`packages/ui`) for common components across applications.

### Key Technologies
- **Payload CMS 3.0**: Headless CMS with built-in authentication and media management
- **Next.js 15**: Framework for the CMS application
- **Qwik City**: Framework for the frontend web application
- **MongoDB**: Database for content and e-commerce data
- **Lexical Editor**: Rich text editor for content management
- **pnpm**: Package manager
- **Turborepo**: Monorepo build system
- **TypeScript**: Type-safe JavaScript

## Project Structure

```
payload_ecommerce/
├── apps/
│   ├── cms/              # Payload CMS application (Next.js)
│   │   ├── src/
│   │   │   ├── app/      # Next.js app directory
│   │   │   ├── collections/ # Payload collections (Users, Media)
│   │   │   ├── payload.config.ts # Payload configuration
│   │   │   └── server.ts # Server entry point
│   │   └── package.json
│   └── web/              # Qwik City frontend application
│       ├── src/
│       │   ├── components/ # Qwik components
│       │   └── routes/   # Qwik City routing
│       └── package.json
├── packages/
│   └── ui/               # Shared UI components
├── package.json          # Root monorepo configuration
├── pnpm-workspace.yaml   # pnpm workspace configuration
└── turbo.json            # Turborepo configuration
```

## Collections

The Payload CMS application includes the following collections:

### Users
- Authentication-enabled collection
- Used for admin panel access
- Default email-based authentication

### Media
- Upload-enabled collection
- Includes alt text field
- Configured for media management

## Building and Running

### Prerequisites
- Node.js (v18.20.2 or >=20.9.0)
- pnpm (v10.x)
- MongoDB instance (local or cloud)

### Setup Instructions

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Set up environment variables:**
   ```bash
   # In the apps/cms directory
   cp .env.example .env
   # Add your MongoDB URL and other required environment variables
   ```

3. **Run in development mode:**
   ```bash
   # Run both apps in parallel
   pnpm dev
   
   # Or run individual apps
   cd apps/cms && pnpm dev  # CMS at http://localhost:3000
   cd apps/web && pnpm dev  # Web app (Qwik)
   ```

4. **Build for production:**
   ```bash
   pnpm build
   ```

5. **Run production build:**
   ```bash
   cd apps/cms && pnpm start
   ```

### Available Scripts

#### Root Scripts
- `pnpm dev`: Run all apps in development mode using Turbo
- `pnpm build`: Build all apps using Turbo
- `pnpm lint`: Lint all apps using Turbo
- `pnpm test`: Test all apps using Turbo
- `pnpm clean`: Remove node_modules directories

#### CMS App Scripts
- `pnpm dev`: Start development server
- `pnpm build`: Build for production
- `pnpm start`: Start production server
- `pnpm generate:types`: Generate Payload types
- `pnpm generate:importmap`: Generate import map for admin UI

#### Web App Scripts
- `pnpm dev`: Start development server
- `pnpm build`: Build for production
- `pnpm preview`: Preview production build
- `pnpm qwik`: Qwik CLI commands

## Development Conventions

### Code Style
- TypeScript is used throughout the project
- ESLint and Prettier for code formatting and linting
- Component-based architecture in both applications

### Payload CMS Development
- Collections are defined in `apps/cms/src/collections/`
- Configuration is in `apps/cms/src/payload.config.ts`
- Use the `payload generate:types` command to update TypeScript types after schema changes
- The admin panel is automatically generated based on collection configurations

### Frontend Development
- Qwik City routing system used in the web app
- Components are organized in `apps/web/src/components/`
- Routes are defined in `apps/web/src/routes/`

### Shared Components
- Common UI components should be placed in `packages/ui/`
- The shared package is linked to both applications via pnpm workspace protocol

## Testing

The project includes testing capabilities:
- Unit and integration tests in the CMS app using Vitest
- End-to-end tests using Playwright
- Run tests with `pnpm test` at the root or in individual apps

## Deployment

The project can be deployed in various ways:
- The CMS app can be deployed as a Next.js application
- The web app can be deployed as a Qwik application
- Both applications can be deployed separately or together depending on the hosting solution
- Environment variables must be configured for the production environment, especially database connections

## Additional Notes

- The project uses the Lexical editor for rich text content
- Sharp is used for image processing in the CMS
- The monorepo structure allows for shared code and coordinated development
- Both applications can be developed and deployed independently if needed