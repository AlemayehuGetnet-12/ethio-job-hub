# EthioJobs Connect

A scalable Ethiopian job marketplace with a Next.js frontend and Node.js/Express backend.

## Overview

- Frontend: Next.js, TypeScript, Tailwind CSS, Redux Toolkit, React Hook Form, Zod
- Backend: Node.js, Express, MongoDB, Mongoose, JWT authentication, email verification and file upload support

## Project Structure

- `backend/` - Express API server, data models, authentication, job management, company management, applications, and messaging routes.
- `frontend/` - Next.js application for job seekers and employers with signup, login, job search, and dashboard views.

## Getting Started

### Backend

1. Copy `.env.example` to `.env` and fill in your configuration values.
2. Install dependencies:
   ```bash
   cd backend
   npm install
   ```
3. Start the server:
   ```bash
   npm run dev
   ```

### Frontend

1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```
2. Start the app:
   ```bash
   npm run dev
   ```

## Features

- JWT authentication with refresh tokens
- Role-based access control for job seekers, employers, and admins
- Job posting and search with ETB salary display
- Company profiles and application flow
- Local Ethiopian cities and categories included
- Responsive UI with reusable components

## Deployment

Deploy the backend and frontend separately using your preferred platform. Ensure the frontend uses a `NEXT_PUBLIC_API_URL` environment variable pointing to the backend API.
