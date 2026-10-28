# BookNest: Full-Stack Book Library (CRUD)

BookNest is a full-stack book library manager. A React frontend talks to my own Express + MongoDB REST API. You can create, view, edit, delete and rate books, and every action shows loading and error states.

- **Live app:** [book-library-manager-tau.vercel.app](https://book-library-manager-tau.vercel.app/)
- **GitHub repo:** [Zannat02/book-library-manager](https://github.com/Zannat02/book-library-manager) (frontend and backend in one repo)

## Features

- **Create** a book with a validated form and live cover preview
- **Read** the collection with search and genre filter, plus a detail page for each book
- **Update** any field, including clearing optional ones
- **Delete** with a confirmation dialog
- **Rate** books from 1 to 5, stored as a running average
- Loading spinners, locked controls during requests, and readable error messages on every action
- Retry buttons when loading fails, and a 404 page for unknown routes

## Tech stack

| Layer | Tools |
|---|---|
| Frontend | React, React Router, Tailwind CSS, Motion, Lucide icons |
| Backend | Node.js, Express, MongoDB (native driver), dotenv, cors |

## Project structure

```
backend/     Express API (server file, .env)
frontend/
  src/
    Components/   Banner, BookCollection, Navbar
    layouts/      RootLayout
    pages/        Home, AddBook, BookDetails, EditBook
    routes/       router
    utils/        api.js (shared request helper)
    config.js     API base URL
```

## Getting started

### 1. Backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/?retryWrites=true&w=majority
```

Start the server:

```bash
node index.js
```

Replace `index.js` with your server file name. The API runs at `http://localhost:5000` and stores data in the `bookLibraryDB` database, `books` collection.

### 2. Frontend

```bash
cd frontend
npm install
```

Set `API_URL` in `src/config.js` to your backend address (for example `http://localhost:5000`), then:

```bash
npm run dev
```

## API reference

Base path: `/api/books`. Every response has the shape `{ success, message, data }`.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/books` | List books. Query: `search`, `genre`, `page`, `limit` (max 50) |
| GET | `/api/books/:id` | Get one book |
| POST | `/api/books` | Create a book (`title` and `author` required) |
| PATCH | `/api/books/:id` | Update fields |
| PATCH | `/api/books/:id/rating` | Submit a rating (integer 1 to 5) |
| DELETE | `/api/books/:id` | Delete a book |

The list endpoint also returns `total`, `page`, `limit` and `totalPages`.

Status codes: `200` OK, `201` created, `400` invalid input or ID, `404` not found, `409` duplicate ISBN, `500` server error.

### Example

```bash
curl -X POST http://localhost:5000/api/books \
  -H "Content-Type: application/json" \
  -d '{"title":"The Alchemist","author":"Paulo Coelho","genre":"Fiction"}'
```

## Backend notes

- Input is validated on the server: required fields, numeric fields (year, pages, price), tags and string fields
- Search input is regex-escaped
- ISBN is unique, enforced by a database index and an application check
- Ratings are updated atomically with an aggregation pipeline
- PATCH only accepts a whitelist of fields

## State management

Each page keeps its data in local React state (`useState`). Every request tracks its own `loading` and `error` state. In-flight requests are cancelled with `AbortController`, and a shared `request()` helper (`src/utils/api.js`) handles JSON parsing and error messages.

## Possible improvements

- Pagination on the collection page
- User accounts, so each user can rate a book only once
- Image upload instead of cover image URLs

## Author

Your Name · [LinkedIn](https://linkedin.com/in/your-profile) · [GitHub](https://github.com/your-username)