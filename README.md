# Full-Stack Monorepo

A modern full-stack application built with React, Vite, Express, and TypeScript in a monorepo structure.

## 🏗️ Architecture

This project uses a monorepo structure managed by pnpm workspaces:

```
.
├── server/           # Express backend (Node.js + TypeScript)
│   ├── src/
│   │   ├── index.ts              # Application entry point
│   │   ├── routes/               # API route handlers
│   │   │   └── health.ts         # Health check endpoint
│   │   └── middleware/           # Express middleware
│   │       └── errorHandler.ts   # Centralized error handling
│   ├── package.json
│   └── tsconfig.json
│
├── client/           # React frontend (Vite + TypeScript)
│   ├── src/
│   │   ├── main.tsx              # Application entry point
│   │   ├── App.tsx               # Root component with routing
│   │   ├── pages/                # Page components
│   │   │   └── Home.tsx          # Landing page
│   │   ├── store/                # Global state management
│   │   │   └── index.ts          # Zustand store
│   │   └── components/           # Reusable components
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── tsconfig.json
│
├── docker-compose.yml   # Docker services (PostgreSQL)
├── pnpm-workspace.yaml  # Workspace configuration
└── package.json         # Root scripts and shared dependencies
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Docker and Docker Compose (optional, for database)

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd <project-directory>
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up environment variables:

**Server** (`/server/.env`):

```bash
cp server/.env.example server/.env
```

**Client** (`/client/.env`):

```bash
cp client/.env.example client/.env
```

4. Start the PostgreSQL database (optional):

```bash
docker-compose up -d
```

### Development

Start both server and client in development mode:

```bash
pnpm dev
```

This will start:

- Backend server on http://localhost:3000
- Frontend dev server on http://localhost:5173

### Individual Commands

Run server only:

```bash
pnpm --filter server dev
```

Run client only:

```bash
pnpm --filter client dev
```

Build both applications:

```bash
pnpm build
```

Run linting:

```bash
pnpm lint
```

Fix linting issues:

```bash
pnpm lint:fix
```

Format code:

```bash
pnpm format
```

Check formatting:

```bash
pnpm format:check
```

Type checking:

```bash
pnpm typecheck
```

## 📋 Environment Variables

### Server (`/server/.env`)

| Variable            | Description                  | Default                                                 |
| ------------------- | ---------------------------- | ------------------------------------------------------- |
| `PORT`              | Server port                  | `3000`                                                  |
| `NODE_ENV`          | Environment mode             | `development`                                           |
| `DATABASE_URL`      | PostgreSQL connection string | `postgresql://devuser:devpassword@localhost:5432/devdb` |
| `POSTGRES_USER`     | Database user                | `devuser`                                               |
| `POSTGRES_PASSWORD` | Database password            | `devpassword`                                           |
| `POSTGRES_DB`       | Database name                | `devdb`                                                 |
| `POSTGRES_PORT`     | Database port                | `5432`                                                  |
| `CLIENT_URL`        | Frontend URL for CORS        | `http://localhost:5173`                                 |

### Client (`/client/.env`)

| Variable       | Description     | Default                 |
| -------------- | --------------- | ----------------------- |
| `VITE_API_URL` | Backend API URL | `http://localhost:3000` |

## 🛠️ Tech Stack

### Backend

- **Runtime**: Node.js
- **Framework**: Express
- **Language**: TypeScript
- **Environment**: dotenv
- **CORS**: cors middleware

### Frontend

- **Framework**: React 18
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **State Management**: Zustand
- **UI Components**: Tailwind CSS

### Development Tools

- **Linting**: ESLint
- **Formatting**: Prettier
- **Editor Config**: EditorConfig
- **Package Manager**: pnpm workspaces

### Database

- **Database**: PostgreSQL 16 (via Docker)

## 📦 Scripts

### Root Level

- `pnpm dev` - Start both server and client in development mode
- `pnpm build` - Build both applications
- `pnpm lint` - Run ESLint on all TypeScript files
- `pnpm lint:fix` - Fix ESLint issues automatically
- `pnpm format` - Format all files with Prettier
- `pnpm format:check` - Check if files are formatted correctly
- `pnpm typecheck` - Run TypeScript type checking on both apps

### Server Scripts

- `pnpm dev` - Start development server with hot reload
- `pnpm build` - Compile TypeScript to JavaScript
- `pnpm start` - Start production server
- `pnpm typecheck` - Run TypeScript type checking

### Client Scripts

- `pnpm dev` - Start Vite development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build locally
- `pnpm typecheck` - Run TypeScript type checking

## 🧪 API Endpoints

### Health Check

- **GET** `/api/health`
- Returns server status, uptime, and environment information

Example response:

```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 123.45,
  "environment": "development"
}
```

## 🐳 Docker

The project includes a Docker Compose configuration for PostgreSQL:

```bash
# Start database
docker-compose up -d

# Stop database
docker-compose down

# View logs
docker-compose logs -f postgres

# Reset database (removes all data)
docker-compose down -v
```

## 🎨 Code Style

The project uses:

- **ESLint** for code linting
- **Prettier** for code formatting
- **EditorConfig** for consistent editor settings

Configuration files:

- `.eslintrc.json` - ESLint rules
- `.prettierrc` - Prettier configuration
- `.editorconfig` - Editor settings

## 🤝 Contributing

1. Follow the existing code style
2. Run `pnpm lint` and `pnpm format` before committing
3. Ensure `pnpm typecheck` passes
4. Test your changes locally with `pnpm dev`

## 📝 License

This project is licensed under the MIT License.
