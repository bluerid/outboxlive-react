# OutboxLive Frontend

A modern React + TypeScript + Vite frontend for the OutboxLive community platform. Features authentication, post management, comments, and admin dashboards.

## Tech Stack

- **React 19** with TypeScript
- **Vite** for fast development and building
- **React Router v7** for client-side routing
- **CSS Variables** for theming (custom design system)
- **JWT Authentication** with token storage in localStorage

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── AdminHeader.tsx     # Admin navigation header
│   ├── CommentSection.tsx  # Full comment CRUD UI
│   ├── FormButton.tsx      # Styled form button
│   ├── FormInput.tsx       # Styled form input
│   ├── PostCard.tsx        # Post card for home page
│   └── PostFeedCard.tsx    # Post card for posts feed
├── context/
│   └── AuthContext.tsx     # Global auth state (token, user, login/logout)
├── pages/                # Route-level components
│   ├── AdminLoginPage.tsx  # Admin login
│   ├── AdminPostsPage.tsx  # Admin posts management (delete)
│   ├── AdminUsersPage.tsx  # Admin users management (delete)
│   ├── HomePage.tsx        # Public landing page with posts
│   ├── LoginPage.tsx       # User login
│   ├── PostDetailPage.tsx  # Single post view + comments
│   ├── PostFormPage.tsx    # Create/edit post form
│   ├── PostsPage.tsx       # Authenticated user's post feed
│   └── RegisterPage.tsx    # User registration
├── App.tsx               # Routes + AuthProvider
├── main.tsx              # Entry point
└── index.css             # Design system + component styles
```

## Screens & Features

### Public Screens

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `HomePage` | Landing page showing paginated posts (public preview). Shows login/register prompts for unauthenticated users. |
| `/login` | `LoginPage` | User login form. On success, decodes JWT to extract user profile, stores token + user in context/localStorage, redirects to `/posts`. |
| `/register` | `RegisterPage` | User registration (name, email, password). Same JWT decode + storage flow as login. |

### Authenticated User Screens (require valid JWT)

| Route | Component | Description |
|-------|-----------|-------------|
| `/posts` | `PostsPage` | User's post feed with pagination. Header shows "Create Post" + "Logout". Fetches `/api/posts?page=N` with Bearer token. |
| `/posts/new` | `PostFormPage` | Create new post (title + content). POST to `/api/posts` with Bearer token. Redirects to `/posts` on success. |
| `/posts/:id` | `PostDetailPage` | Full post view with comments. Shows "Edit Post" button only for post author. Embeds `CommentSection` component. |
| `/posts/edit/:id` | `PostFormPage` | Edit existing post. GET `/api/posts/:id` to populate, PUT to update. Author-only (enforced by backend). |

### Admin Screens (require admin role JWT)

| Route | Component | Description |
|-------|-----------|-------------|
| `/admin/login` | `AdminLoginPage` | Admin-only login. Calls `/admins/login`, validates admin role in token payload. Redirects to `/admin/users`. |
| `/admin/users` | `AdminUsersPage` | Table of all users (GET `/api/users`). Delete button per row calls DELETE `/api/users/:id` (soft delete). |
| `/admin/posts` | `AdminPostsPage` | Table of all posts (GET `/api/posts`). Delete button per row calls DELETE `/api/posts/:id` (soft delete). Pagination supported. |

### Shared Components

| Component | Purpose |
|-----------|---------|
| `AuthContext` | Provides `token`, `user`, `login()`, `logout()`, `loading` state. Persists to localStorage. Handles role-based logout redirect. |
| `CommentSection` | Full comment CRUD: list (GET `/api/posts/:postId/comments`), create (POST), edit (PATCH `/api/comments/:id`), delete (DELETE `/api/comments/:id`). Inline editing with textarea. Owner-only edit/delete buttons. |
| `PostCard` / `PostFeedCard` | Display post title, excerpt (150 chars), author, date, "Read post" button. Used in HomePage and PostsPage respectively. |
| `AdminHeader` | Admin nav with active-state highlighting for Users/Posts tabs + Logout. |

## Backend Integration

The frontend expects the backend API at `http://localhost:3000` (configured via Vite proxy).

### API Endpoints Used

| Feature | Method | Endpoint | Auth |
|---------|--------|----------|------|
| User login | POST | `/auth/login` | None |
| User register | POST | `/auth/register` | None |
| Admin login | POST | `/admins/login` | None |
| Get posts (paginated) | GET | `/api/posts?page=N` | Bearer token |
| Get single post | GET | `/api/posts/:id` | Bearer token |
| Create post | POST | `/api/posts` | Bearer token (user) |
| Update post | PUT | `/api/posts/:id` | Bearer token (owner/admin) |
| Delete post | DELETE | `/api/posts/:id` | Bearer token (owner/admin) |
| Get users (admin) | GET | `/api/users` | Bearer token (admin) |
| Delete user (admin) | DELETE | `/api/users/:id` | Bearer token (admin) |
| Get comments | GET | `/api/posts/:postId/comments` | Bearer token |
| Create comment | POST | `/api/posts/:postId/comments` | Bearer token |
| Update comment | PATCH | `/api/comments/:id` | Bearer token (owner) |
| Delete comment | DELETE | `/api/comments/:id` | Bearer token (owner) |
| Health check | GET | `/api/status` | None |

### Authentication Flow

1. User submits credentials → `/auth/login` or `/admins/login`
2. Backend returns `{ accessToken, refreshToken }`
3. Frontend decodes JWT payload (`atob(payload)`) to extract `user` object
4. `AuthContext.login(token, user)` stores both in memory + localStorage
5. All subsequent API calls include `Authorization: Bearer <token>`
6. On 401 response → `AuthContext.logout()` clears storage + redirects:
   - Admin users → `/admin/login`
   - Regular users → `/login`

### JWT Token Structure Expected

```json
{
  "user": {
    "id": "string",
    "name": "string",
    "role": "admin" | "regular"
  }
}
```

## Design System (CSS Variables)

Defined in `src/index.css`:

- **Colors**: Primary (`#7047EB`), neutrals, semantic (success/warning/error)
- **Typography**: Space Grotesk (body), Fraunces (headings), IBM Plex Mono (code)
- **Spacing**: 4px base scale (--spacing-1 through --spacing-16)
- **Radius**: sm/md/lg/full
- **Shadows**: sm/md/lg
- **Breakpoints**: 1024px, 640px

Utility classes: `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-outline`, `.card`, `.form-input`, `.page-container`, etc.

## Setup & Running

### Prerequisites

- Node.js 18+
- Backend running at `http://localhost:3000` (see OutboxLive backend repo)

### Install

```bash
npm install
```

### Development

```bash
npm run dev
```

Runs Vite dev server at `http://localhost:5173` with proxy to backend.

### Build

```bash
npm run build
```

Outputs to `dist/`.

### Preview Production Build

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

## Environment Variables

| File | Variable | Description |
|------|----------|-------------|
| `.env` | `VITE_API_BASE_URL` | Backend API base (default: `http://localhost:3000/api`) |
| `.env.production` | `VITE_API_BASE_URL` | Production API URL |

## Routing Summary

```
/                    → HomePage (public posts)
/login               → LoginPage
/register            → RegisterPage
/posts               → PostsPage (auth required)
/posts/new           → PostFormPage (create, auth required)
/posts/:id           → PostDetailPage (auth required)
/posts/edit/:id      → PostFormPage (edit, auth required)
/admin/login         → AdminLoginPage
/admin/users         → AdminUsersPage (admin required)
/admin/posts         → AdminPostsPage (admin required)
*                    → 404
```

## Known Limitations / TODOs

- No refresh token handling (access token only)
- No password reset / email verification flows
- Admin user creation/editing UI not implemented (only list + delete)
- No image upload support for posts
- No real-time updates (polling or WebSockets)

## Backend Repository

Backend source: https://github.com/bluerid/OutboxLive (dev branch)

Ensure backend `.env` has:
```
DATABASE_URL=mongodb://...
ACCESS_TOKEN_SECRET=your-secret
```

Start backend:
```bash
npm run dev  # or npm start
```