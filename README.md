# TaskFlow

A full stack task manager built with **React (Vite)**, **Node.js + Express** and **MongoDB (Mongoose)**.

## Features

- Sign up / log in with JWT authentication (passwords hashed with bcrypt)
- Create, update, delete tasks; each user only sees their own tasks
- Status (to do / in progress / done), priority, due dates with overdue highlighting
- Search and filter by status and priority
- Rate limiting on auth routes, input validation, central error handling

## Project structure

```
taskflow/
├── server/   Express API + MongoDB models
│   ├── models/       User, Task
│   ├── middleware/   JWT auth
│   ├── routes/       auth, tasks
│   └── server.js
└── client/   React app (Vite)
    └── src/
        ├── pages/        AuthPage, Dashboard
        ├── components/   TaskForm, TaskItem
        ├── AuthContext.jsx, api.js
        └── styles.css
```

## Run it locally

You need Node.js 18+ and a MongoDB instance (local, or a free MongoDB Atlas cluster).

**1. API**

```bash
cd server
cp .env.example .env      # then edit MONGO_URI and set a long random JWT_SECRET
npm install
npm run dev               # http://localhost:5000
```

**2. Front end** (in a second terminal)

```bash
cd client
npm install
npm run dev               # http://localhost:5173
```

In development the Vite dev server proxies `/api` to port 5000, so no extra config is needed.

## Run it with Docker

Needs Docker with Compose. This starts MongoDB, the API and the front end together.

```bash
cp .env.example .env      # set JWT_SECRET to a long random string
docker compose up --build
```

Open http://localhost:8080. The front end is served by nginx, which forwards `/api` to the API container. Data is kept in the `mongo-data` volume; `docker compose down -v` deletes it.

## API reference

| Method | Endpoint             | Auth | Description                     |
| ------ | -------------------- | ---- | ------------------------------- |
| POST   | `/api/auth/register` | no   | Create account, returns token   |
| POST   | `/api/auth/login`    | no   | Log in, returns token           |
| GET    | `/api/auth/me`       | yes  | Current user                    |
| GET    | `/api/tasks`         | yes  | List tasks (`?status=&priority=&q=`) |
| POST   | `/api/tasks`         | yes  | Create task                     |
| PUT    | `/api/tasks/:id`     | yes  | Update task                     |
| DELETE | `/api/tasks/:id`     | yes  | Delete task                     |

Send the token as `Authorization: Bearer <token>`.

## Deploying (free tiers)

1. **Database:** create a free cluster on MongoDB Atlas and copy its connection string.
2. **API:** deploy `server/` to Render or Railway. Set `MONGO_URI`, `JWT_SECRET` and `CLIENT_ORIGIN` (your front-end URL).
3. **Front end:** deploy `client/` to Vercel or Netlify. Set `VITE_API_URL` to your API URL (no trailing slash).

## Ideas to extend it

- Refresh tokens or httpOnly cookie auth
- Drag-and-drop board view
- Tests with Vitest (client) and Jest + Supertest (API)
- Docker Compose for one-command local setup
