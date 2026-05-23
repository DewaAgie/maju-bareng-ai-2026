# GymCore — Gym Management System

GymCore is a modern, full-stack Gym Management System built with React, Node.js, Express, and PostgreSQL. It features role-based access control, attendance tracking via QR/Barcode, membership management, scheduling, and an AI-powered wellness assistant (CoreBot).

## Features

- **Role-Based Dashboards:** Super Admin (manage gyms/users) & Gym Admin (manage daily operations).
- **Member Management:** Profile tracking, automated QR/Barcode generation, and membership plan assignment.
- **Contactless Check-In:** Built-in QR Code and Barcode scanner for quick attendance tracking.
- **Class Scheduling:** Weekly calendar view with conflict detection for facilities and coaches.
- **CoreBot AI Assistant:** Integrated Gemini 2.5 Flash chatbot restricted exclusively to wellness, fitness, and fasting topics.
- **Analytics:** Real-time dashboard with active members, attendance trends, and top classes.

---

## Tech Stack

- **Frontend:** React (Vite), React Router v6, Tailwind CSS, shadcn/ui, Recharts, React Hook Form, Zod.
- **Backend:** Node.js, Express, Prisma ORM, PostgreSQL, JWT Auth, Multer, Nodemailer.
- **AI Integration:** `@google/generative-ai` (Gemini 2.5 Flash).

---

## Setup & Installation

### Prerequisites

- Node.js (v24+)
- PostgreSQL (v16+)
- A Google Gemini API Key

### 1. Backend Setup

1.  Navigate to the backend folder:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure environment variables:
    - Copy `.env.example` to `.env`.
    - Ensure your `DATABASE_URL` is correct.
    - Add your `GEMINI_API_KEY`.
4.  Setup Database:

    ```bash
    # Create database if it doesn't exist
    createdb gymcore_dev -U postgres

    # Run migrations
    npx prisma migrate dev

    # Seed initial data
    npm run seed
    ```

5.  Start the development server:
    ```bash
    npm run dev
    ```
    _The API will run on `http://localhost:3001`_

### 2. Frontend Setup

1.  Navigate to the frontend folder:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure environment variables:
    - Copy `.env.example` to `.env`
4.  Start the development server:
    ```bash
    npm run dev
    ```
    _The app will run on `http://localhost:5173`_

---

## Demo Credentials (from Seed Data)

- **Super Admin:** `admin@gymcore.com` / `password123`
- **Gym Admin:** `gymadmin@gymcore.com` / `password123`
