# TransitOps Backend (Prototype)

Quick scaffold for core entities and CRUD APIs using TypeScript, Express, and Prisma.

Setup

1. Copy `.env.example` to `.env` and set `DATABASE_URL`.
2. Install deps:

```bash
cd backend
npm install
```

3. Generate Prisma client and run migrations:

```bash
npm run prisma:generate
npm run prisma:migrate
```

4. Run dev server:

```bash
npm run dev
```

API

REST endpoints exposed on `/:entity` for `users, roles, vehicles, drivers, trips, maintenance, fuel, expenses` with standard CRUD.

Next steps: add auth, RBAC, validations, pagination, and frontend/mobile clients.
