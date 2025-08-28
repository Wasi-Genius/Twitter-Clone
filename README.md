# Twitter Clone (Wasi Genius) 🚀

A full-stack, production-level Twitter Clone built with modern web technologies. This project demonstrates advanced skills in scalable backend development, responsive frontend engineering, authentication, real-time features, and clean code architecture.

## Table of Contents

- [Demo](#demo)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
- [API Documentation](#api-documentation)
- [Contact](#contact)

---

## Demo

<!-- Insert a GIF or screenshot of the main feed UI -->

![Main Feed Demo](https://github.com/Wasi-Genius/Twitter-Clone/blob/5c054761f2dfc03c70d754b2689efd6154140cb1/Read%20Me%20Assets/Overview%20Demo.gif)

---

## Features

- **Authentication & Authorization**
  - Secure JWT-based login/sign up
  - Protected routes and session management
  - Hashed passwords and password comparison using Bcrypt
- **User Profiles**
  - View, edit, and update profile details
  - Upload avatar and banner images
  - View user, liked, and bookmarked posts
- **Posts**
  - Create, edit, and delete posts
  - Like, comment, repost, and bookmark posts 
  - Upload viewable images
- **Follow System**
  - Follow/unfollow users
  - Personalized feed based on followed users
  - Who to follow right panel system
- **Notifications**
  - Real-time notifications for follows, likes, comments, and bookmarks
  - Delete one notification at a time or all notifications at once
- **Responsive UI**
  - Mobile and desktop compatible design
  - Skeleton loaders for improved UX
  - Real time data fetching and UI changes
- **Utilities**
  - Date formatting
  - Custom hooks for state management
  - Seamless database integration and mutation

---

## Architecture

The project is organized into a backend and front end:

- **Backend (Node.js, Express, MongoDB)**

  - RESTful API design
  - Modular controllers, models, and routes
  - Middleware for authentication and error handling
  - MongoDB for scalable data storage

- **Frontend (React, Vite)**
  - Component-based architecture
  - Custom hooks for business logic
  - Context API for global state
  - Optimized for performance and accessibility

---

## Tech Stack

| Layer     | Technology               | Purpose                        |
| --------- | ------------------------ | ------------------------------ |
| Frontend  | React, Vite, CSS Modules | UI, SPA, Fast Dev Experience   |
| Backend   | Node.js, Express         | API, Business Logic            |
| Database  | MongoDB, Mongoose        | Data Storage & Modeling        |
| Auth      | JWT, Custom Middleware, Bcrypt   | Secure Authentication          |
| Utilities | ESLint, Custom Hooks     | Code Quality, State Management |

---

## Project Structure

```
Twitter-Clone/
├── backend/
│   ├── controllers/        # API logic
│   ├── db/                 # DB connection
│   ├── lib/                # Utility functions
│   ├── middleware/         # Auth & error handling
│   ├── models/             # Mongoose schemas
│   └── routes/             # API endpoints
├── frontend/
│   ├── public/             # Static assets
│   └── src/
│       ├── components/     # Reusable UI
│       ├── hooks/          # Custom hooks
│       ├── pages/          # Route-based pages
│       └── utils/          # Helper functions
└── package.json
```

---

## Setup & Installation

### Prerequisites

- Node.js (v18+ recommended)
- npm
- MongoDB (local or Atlas)

### Backend

```bash
cd backend
npm install
# Create a .env file with MONGODB_URI and JWT_SECRET
npm start
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Environment Variables

Create a `.env` file in `backend/`:

```
MONGODB_URI=your-mongodb-uri
JWT_SECRET=your-jwt-secret
```

---

## API Documentation

The backend exposes RESTful endpoints for authentication, posts, users, and notifications. Example endpoints:

- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login and receive JWT
- `GET /api/posts` - Fetch posts for feed
- `POST /api/posts` - Create a new post
- `GET /api/users/:id` - Get user profile
- `POST /api/users/:id/follow` - Follow a user
- `GET /api/notifications` - Get notifications

<!-- Add more detailed API docs or link to Postman collection if available -->

---

## Contact

Created by [Your Name](https://github.com/your-username)  
Feel free to reach out via [LinkedIn](https://linkedin.com/in/your-linkedin) or email for collaboration or questions.

---
