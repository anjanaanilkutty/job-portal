# Job Portal Management System

A full-stack job portal with **separate Admin and User portals**. Admins manage job
postings; candidates browse, filter, and apply for jobs.

Built with **React + Redux Toolkit + Tailwind** on the front end and
**Node.js + Express + Sequelize + PostgreSQL** on the back end. Authentication uses
JWT **access + refresh tokens**.

```
tnp project/
├── backend/        → REST API (Express, Sequelize, PostgreSQL, TypeScript)
└── frontend/
    ├── admin/      → Admin portal SPA  (Vite + React, runs on :5174)
    └── user/       → User/candidate SPA (Vite + React, runs on :5173)
```

---

## Features

### Admin portal (`/admin`)
- Login with JWT access + refresh tokens (admin-only access)
- Dashboard with totals, recent jobs, and jobs-by-category breakdown
- Job **Create / Edit / List** pages with full validation
- Full CRUD on jobs, with category / experience / status filters + pagination
- All data flows through **Redux Toolkit** (async thunks for every CRUD call)
- Reusable UI components, loading & error states, confirm dialogs

### User portal (`/user`)
- Landing page: hero, category grid, **featured** jobs, latest openings, footer
- Job listing page with advanced filters (search, category, experience, type, sort) + pagination
- User login & registration
- Job details page (data fetched from API) with **Apply** for logged-in users
- "My Applications" page to track submitted applications
- All data managed via **Redux Toolkit** + API

### Backend API
- Auth: register, login, refresh, logout, me (access + refresh tokens, hashed refresh token persisted for revocation)
- Jobs: list (filter + paginate), get, create, update, delete (+ dashboard stats)
- Applications: apply, my applications, application status
- Zod request validation, centralized error handling, role-based authorization

---

## Prerequisites

- **Node.js** 18+
- **PostgreSQL** 13+ running locally (or a connection string)

---

## 1. Backend setup

```bash
cd backend
npm install
cp .env.example .env        # then edit DB credentials + JWT secrets
```

Create the database (once):

```sql
CREATE DATABASE job_portal;
```

Seed demo data (resets the schema and inserts sample jobs + accounts):

```bash
npm run db:seed
```

Start the API:

```bash
npm run dev          # http://localhost:4000/api
```

**Demo accounts created by the seed:**

| Role  | Email                  | Password   |
|-------|------------------------|------------|
| Admin | admin@jobportal.test   | admin123   |
| User  | user@jobportal.test    | user1234   |

---

## 2. Admin portal setup

```bash
cd frontend/admin
npm install
cp .env.example .env         # VITE_API_URL defaults to http://localhost:4000/api
npm run dev                  # http://localhost:5174
```

Sign in with the **admin** account above.

---

## 3. User portal setup

```bash
cd frontend/user
npm install
cp .env.example .env
npm run dev                  # http://localhost:5173
```

Sign in with the **user** account, or register a new candidate account.

---

## Environment variables

### backend/.env
| Variable | Description |
|----------|-------------|
| `PORT` | API port (default 4000) |
| `CLIENT_ORIGINS` | Comma-separated allowed CORS origins |
| `DB_HOST`/`DB_PORT`/`DB_NAME`/`DB_USER`/`DB_PASSWORD` | PostgreSQL connection |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | Token signing secrets |
| `JWT_ACCESS_EXPIRES_IN` / `JWT_REFRESH_EXPIRES_IN` | Token lifetimes (e.g. `15m`, `7d`) |

### frontend/admin/.env and frontend/user/.env
| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Base URL of the backend API |

---

## API reference (summary)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | public | Register (defaults to `user` role) |
| POST | `/api/auth/login` | public | Login, returns tokens |
| POST | `/api/auth/refresh` | public | Exchange refresh token for new tokens |
| POST | `/api/auth/logout` | auth | Revoke refresh token |
| GET  | `/api/auth/me` | auth | Current user |
| GET  | `/api/meta` | public | Categories / experience levels / job types |
| GET  | `/api/jobs` | public | List jobs (filter + paginate) |
| GET  | `/api/jobs/:id` | public | Job details |
| POST | `/api/jobs` | admin | Create job |
| PUT  | `/api/jobs/:id` | admin | Update job |
| DELETE | `/api/jobs/:id` | admin | Delete job |
| GET  | `/api/jobs/stats/overview` | admin | Dashboard aggregates |
| POST | `/api/jobs/:id/apply` | user | Apply to a job |
| GET  | `/api/jobs/:id/application-status` | auth | Has the user applied? |
| GET  | `/api/applications/me` | user | The user's applications |

### Job list query parameters
`page`, `limit`, `search`, `category`, `experienceLevel`, `jobType`, `status`,
`featured` (`true`/`false`), `sort` (`newest`/`oldest`).

---

## Tech stack

| Layer | Choices |
|-------|---------|
| Frontend | React 18, TypeScript, Vite, Redux Toolkit, React Router, Tailwind CSS, Axios |
| Backend | Node.js, Express, TypeScript, Sequelize, Zod, bcryptjs, jsonwebtoken |
| Database | PostgreSQL |

---

## Notes
- The backend uses `sequelize.sync({ alter: true })` for convenience during the
  exercise; in production you would use migrations instead.
- Access tokens are short-lived; the Axios layer transparently refreshes them on a
  401 and replays the original request.
