# Twitter Clone (Wasi Genius) 🐦

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

## Overview Demo

![Main Feed Demo](https://github.com/Wasi-Genius/Twitter-Clone/blob/main/Read%20Me%20Assets/Overview%20Demo%20Gif.gif)

---

## Features

- **Authentication & Authorization**
  - Secure JWT-based login/sign up
  - Protected routes and session management
  - Hashed passwords and password comparison using Bcrypt

![Authentication & Authorization Demo](https://github.com/Wasi-Genius/Twitter-Clone/blob/1ea95ae76894631be68b6107685e42ee6ecbd0bc/Read%20Me%20Assets/Authentication%20%26%20Authorization%20Demo.mp4)

- **User Profiles**
  - View, edit, and update profile details
  - Upload avatar and banner images
  - View user, liked, and bookmarked posts

![User Profile Demo](https://github.com/Wasi-Genius/Twitter-Clone/blob/1ea95ae76894631be68b6107685e42ee6ecbd0bc/Read%20Me%20Assets/User%20Profiles%20Demo.mp4)

- **Posts**
  - Create and delete posts
  - Like, comment, repost, and bookmark posts 
    - Delete comments and undo bookmarks and likes
  - Upload viewable images

![Posts Demo](https://github.com/Wasi-Genius/Twitter-Clone/blob/1ea95ae76894631be68b6107685e42ee6ecbd0bc/Read%20Me%20Assets/Posts%20Demo.mp4)

- **Follow System**
  - Follow/unfollow users
  - Personalized feed based on followed users
  - Who to follow panel 
  - View followers and following

![Follow System Demo](https://github.com/Wasi-Genius/Twitter-Clone/blob/1ea95ae76894631be68b6107685e42ee6ecbd0bc/Read%20Me%20Assets/Follow%20System%20Demo.mp4)

- **Notifications**
  - Real-time notifications for follows, likes, comments, and bookmarks
  - Delete one notification at a time or all notifications at once

![Notifications Demo](https://github.com/Wasi-Genius/Twitter-Clone/blob/1ea95ae76894631be68b6107685e42ee6ecbd0bc/Read%20Me%20Assets/Notifications%20Demo.mp4)

- **Responsive UI**
  - Mobile and desktop compatible design
  - Skeleton loaders for improved UX
  - Real time data fetching and UI changes

![Responsive UI](https://github.com/Wasi-Genius/Twitter-Clone/blob/1ea95ae76894631be68b6107685e42ee6ecbd0bc/Read%20Me%20Assets/Responsive%20UI%20Demo.mp4)
  
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

The backend exposes RESTful endpoints for authentication, posts, users, and notifications. Sample endpoints:

- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login and receive JWT
- `GET /api/posts` - Fetch posts for feed
- `POST /api/posts` - Create a new post
- `GET /api/users/:id` - Get user profile
- `POST /api/users/:id/follow` - Follow a user
- `GET /api/notifications` - Get notifications


---

## Contact

Created by [Wasi Genius](https://github.com/Wasi-Genius)  
Feel free to reach out via [LinkedIn](https://www.linkedin.com/in/wasi-genius) or email for collaboration or questions.

---
