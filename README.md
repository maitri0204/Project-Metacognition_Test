<div align="center">
  <img src="frontend/public/banner.png" alt="Thinking & Expression Skills Test" width="100%" />
</div>

<h1 align="center">Thinking & Expression Skills Test</h1>

<p align="center">
  A full-stack metacognition assessment platform for students and parents — with quadrant-based analysis, OTP authentication, admin dashboard, and result reports.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js" />
  <img src="https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=flat-square&logo=mongodb" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss" />
</p>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Roles & Access](#roles--access)
- [Deployment](#deployment)

---

## Overview

The **Thinking & Expression Skills Test** is a metacognition evaluation platform built for schools and coaching institutions. It assesses a student's self-awareness, planning, monitoring, regulation, and reflection skills across 40 questions, then plots the result on a **metacognition quadrant graph** (Knowledge vs Regulation axes).

Parents can independently complete a **40-question parent assessment** to provide an external perspective on their child's learning habits. Both sets of results are accessible to the student and the admin.

---

## Features

### Student
- 📝 **40-question test** across 5 metacognitive domains
- 🔒 **Fullscreen, copy-protected** test environment (text selection, right-click, and keyboard shortcuts are all blocked)
- 📊 **Quadrant Analysis Graph** — plots Knowledge vs Regulation score with per-quadrant area highlight
- 📈 **Domain-wise score cards** with progress bars
- 📧 **OTP-based login & signup** (no passwords required)
- 🧭 **Question Navigator** sidebar with live answered/unanswered status
- 🟢 **Parent Assessment** unlocked only after completing at least one test

### Parent
- 📋 **40-question Parent Assessment** form with parent info (name, relation, mobile, email)
- 👨‍👩‍👧 Country code dropdown + 10-digit mobile field
- 📊 **Section-wise Quadrant Analysis** with matched color coding

### Admin
- 🗂️ **Dashboard** with student results table and parent submissions table
- 🔍 **Individual result pages** with full Q&A breakdown, domain scores, and quadrant graph
- ➕ **Question management** — add, edit, delete questions per domain and test type
- 👁️ **View all student and parent results**

### Platform
- 📬 **Plain-text OTP emails** via Gmail SMTP (Nodemailer)
- 🛡️ **DevTools protection** — blocks F12, Ctrl+Shift+I/J, Ctrl+U, right-click, and view-source globally
- 🌐 **Fully responsive** — optimised for desktop and mobile

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript 5 |
| Styling | Tailwind CSS v4, Framer Motion |
| Icons | Lucide React |
| Backend | Node.js, Express 5, TypeScript 5 |
| Database | MongoDB with Mongoose 9 |
| Auth | JWT + OTP via Nodemailer (Gmail SMTP) |
| HTTP Client | Axios |

---

## Project Structure

```
Metacognition_Test/
├── backend/
│   └── src/
│       ├── config/           # MongoDB connection
│       ├── controllers/      # Auth, Test, Parent Test, Questions
│       ├── middleware/        # JWT auth, role-based authorize, validation
│       ├── models/           # User, TestResult, ParentTestResult
│       ├── routes/           # Express route definitions
│       ├── types/            # Role enums
│       └── utils/            # JWT helpers, OTP generator, Email sender
│
└── frontend/
    ├── public/               # Static assets (logo.png, banner.png, etc.)
    └── src/
        ├── app/
        │   ├── page.tsx           # Home / landing page
        │   ├── login/             # OTP login flow
        │   ├── signup/            # OTP signup flow
        │   ├── student/
        │   │   ├── dashboard/
        │   │   ├── test/          # 40-question test (fullscreen, copy-locked)
        │   │   ├── parent-test/   # Parent assessment form + test
        │   │   ├── results/       # Student result & quadrant graph
        │   │   └── parent-results/
        │   └── admin/             # Admin dashboard + result pages
        ├── components/        # Navbar
        ├── lib/               # Axios API client
        └── types/             # Shared TypeScript interfaces
```

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- MongoDB (local instance or MongoDB Atlas)
- Gmail account with an [App Password](https://support.google.com/accounts/answer/185833) enabled for OTP emails

---

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside `backend/`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/Metacognition_test
JWT_SECRET=your_jwt_secret_here
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
ALLOWED_ORIGINS=http://localhost:3000
NODE_ENV=development
```

Start the development server:

```bash
npm run dev
```

Build and run for production:

```bash
npm run build
npm start
```

---

### Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env.local` file inside `frontend/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Start the development server:

```bash
npm run dev
```

Build and run for production:

```bash
npm run build
npm start
```

---

## Environment Variables

### Backend — `backend/.env`

| Variable | Description |
|---|---|
| `PORT` | Server port (default: `5000`) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for signing JWT tokens |
| `EMAIL_USER` | Gmail address used to send OTP emails |
| `EMAIL_PASS` | Gmail App Password |
| `ALLOWED_ORIGINS` | Comma-separated list of allowed frontend origins |
| `NODE_ENV` | `development` or `production` |

### Frontend — `frontend/.env.local`

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL of the backend API |

---

## API Reference

### Auth

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/signup` | Register a new student |
| POST | `/api/auth/verify-signup-otp` | Verify OTP after signup |
| POST | `/api/auth/login` | Request a login OTP |
| POST | `/api/auth/verify-otp` | Verify login OTP and receive JWT |
| GET | `/api/auth/profile` | Get the logged-in user's profile |

### Student Test

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/test/questions` | Get all 40 student test questions |
| POST | `/api/test/submit` | Submit test answers |
| GET | `/api/test/my-results` | Get all results for the current student |
| GET | `/api/test/results/:id` | Get a specific test result by ID |

### Parent Assessment

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/parent-test/questions` | Get all 40 parent assessment questions |
| POST | `/api/parent-test/submit` | Submit parent assessment with parent info |
| GET | `/api/parent-test/my-results` | Get parent results linked to the current student |
| GET | `/api/parent-test/results/:id` | Get a specific parent result by ID |

### Admin

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/test/admin/results` | List all student test results |
| GET | `/api/test/student/:studentId` | Get all results for a specific student |
| GET | `/api/parent-test/admin/results` | List all parent assessment results |
| GET | `/api/questions` | List all questions (by test type) |
| POST | `/api/questions` | Add a new question |
| PUT | `/api/questions/:id` | Edit an existing question |
| DELETE | `/api/questions/:id` | Delete a question |

---

## Roles & Access

| Role | Permissions |
|---|---|
| `STUDENT` | Take test, take parent assessment (after completing at least one test), view own results |
| `ADMIN` | View all student and parent results, manage questions |

Role is assigned at signup and encoded in the JWT payload. All protected routes are guarded by the `authenticate` + `authorize` middleware chain.

---

## Deployment

### Production on a VPS (e.g. Hostinger)

1. Install **Node.js 20+**, **MongoDB**, **PM2**, and **Nginx** on the server
2. Clone this repository and install dependencies for both `backend/` and `frontend/`
3. Build both projects:
   ```bash
   cd backend && npm run build
   cd ../frontend && npm run build
   ```
4. Create production `.env` / `.env.local` files with your live values
5. Start the backend with PM2:
   ```bash
   cd backend && pm2 start dist/index.js --name metacog-backend
   ```
6. Start the frontend with PM2:
   ```bash
   cd frontend && pm2 start npm --name metacog-frontend -- start
   ```
7. Configure **Nginx** as a reverse proxy — route your domain to port `3000` (frontend) and `/api` to port `5000` (backend)
8. Secure with SSL using Certbot:
   ```bash
   sudo certbot --nginx -d yourdomain.com
   ```
9. Save PM2 startup config:
   ```bash
   pm2 save && pm2 startup
   ```

---

<p align="center">Built with ❤️ for students, parents, and educators.</p>
