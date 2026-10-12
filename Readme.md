# PrepGenius — AI-Powered Technical Placement Platform

PrepGenius is a full-stack technical placement and interview readiness application engineered for software engineering students and early-career developers. The platform integrates an active Socratic coding mentor, an ATS-focused resume optimization engine, and an adaptive mock interview simulator.

---

## Table of Contents

- [Live Deployment](#live-deployment)
- [Key Features](#key-features)
- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [Repository Structure](#repository-structure)
- [Database Schema Design](#database-schema-design)
- [API Endpoints](#api-endpoints)
- [Environment Configuration](#environment-configuration)
- [Installation and Local Setup](#installation-and-local-setup)
- [Deployment Guide](#deployment-guide)
- [License](#license)

---

## Live Deployment

- **Frontend Client:** https://prep-genius.vercel.app
- **Backend API:** https://prep-genius-server.onrender.com
- **GitHub** https://github.com/jatinkm007/Prep-Genius.git

---

## Key Features

### 1. CodePilot & Socratic DSA Workspace
- **Monaco Code Editor:** Browser IDE supporting C++, Python, and JavaScript with syntax highlighting and auto-formatting.
- **Socratic Mentoring:** Integrates Google Gemini (`gemini-3.8-flash`) to guide candidates through algorithmic challenges with targeted milestone hints, edge-case checks, and complexity analysis rather than direct code solutions.
- **Dynamic Sandbox Execution:** Evaluates code logic against sample test cases and hidden benchmarks, displaying stdout, execution runtime, and compiler error logs.
- **Submission History:** Persists candidate attempts, tracking overall accuracy and unique problems solved.

### 2. ATS Resume Auditor
- **Dual-Stream File Handling:** Simultaneously streams uploaded PDF documents to `pdf-parse` for text extraction and Supabase Storage for persistent file archival.
- **Keyword Gap Analysis:** Evaluates resumes against specified job profiles (e.g., Full Stack Developer, SDE-1, Frontend Engineer) to flag missing domain terminology and required skills.
- **STAR Optimization:** Rewrites resume bullet points into measurable, action-driven statements following the Situation, Task, Action, Result framework.

### 3. Adaptive AI Mock Interviewer
- **Realistic Pacing:** Begins with an introductory icebreaker regarding candidate background and stack familiarity before asking technical questions.
- **Calibrated Difficulty Tiers:**
  - **Entry (SDE-1 / College Placements):** Programming fundamentals, REST principles, frontend-backend request lifecycles, and core CRUD workflows.
  - **Intermediate:** Asynchronous event loops, database indexing strategies, caching mechanisms, and token-based authentication.
  - **Advanced:** High-concurrency bottlenecks, distributed resilience, horizontal database sharding, and system design trade-offs.
- **Hiring Committee Scorecards:** Produces detailed post-interview evaluations covering technical depth, communication clarity, an overall score out of 100, identified strengths, and targeted improvement notes.

---

## System Architecture

```
[ Browser Client: React 18 + Vite + Tailwind CSS ]
        │
        ├── Monaco Code Editor & Terminal Drawer (DSA Workspace)
        ├── Drag & Drop PDF Parser (Resume Reviewer)
        └── Conversational Chat Interface (Mock Interviewer)
        │
        ▼ HTTPS (Permissive CORS for Localhost & *.vercel.app)
[ Backend API: Express.js (ES Modules) on Render ]
        │
        ├── MongoDB Atlas (Users, Problems, Submissions, Audits, Interviews)
        ├── Google Gemini API (gemini-3.8-flash via @google/genai SDK)
        ├── Supabase Storage (Persistent cloud storage for candidate PDF files)
        └── Remote Execution API / Judge0 (Multi-language sandbox code runner)
```

---

## Tech Stack

| Domain | Technology / Tool | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite | SPA client framework and fast dev build toolchain |
| **Styling** | Tailwind CSS | Utility-first UI and responsive layout styling |
| **Code Editor** | Monaco Editor (`@monaco-editor/react`) | In-browser coding workspace |
| **Backend** | Node.js, Express.js (ES Modules) | REST API endpoints, routing, and controllers |
| **Database** | MongoDB Atlas (Mongoose) | Persistent document store for candidates and metrics |
| **Cloud Storage** | Supabase Storage | Secure cloud bucket storage for resume PDF uploads |
| **AI Inference** | Google Gemini API (`@google/genai`) | AI hints, resume ATS parsing, and interview loops |
| **PDF Processing** | `pdf-parse`, Multer | In-memory upload buffer handling and text extraction |
| **Deployment** | Vercel (Frontend), Render (Backend) | Global CDN static hosting and Node web service |

---

## Repository Structure

```
prep-genius/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── api/            # Centralized API service functions
│   │   ├── components/     # Reusable UI widgets and Monaco wrappers
│   │   ├── context/        # Authentication and global state
│   │   ├── pages/          # Login, Register, Dashboard, Problems, Resume, Interview
│   │   ├── App.jsx         # Client routing definitions
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── server/
│   ├── src/
│   │   ├── config/         # MongoDB connection setup
│   │   ├── controllers/    # Route handler controllers
│   │   ├── middleware/     # JWT authentication and error handlers
│   │   ├── models/         # Mongoose collection schemas
│   │   ├── routes/         # Express endpoint definitions
│   │   ├── services/       # Google Gemini SDK service wrapper
│   │   ├── utils/          # Resilient Supabase storage utilities
│   │   ├── app.js          # CORS and middleware initialization
│   │   └── server.js       # App entry point and HTTP listener
│   ├── package.json
│   └── .env.example
├── .gitignore
└── README.md
```

---

## Database Schema Design

### 1. User (`models/User.js`)
- `name` (String, required): Candidate's full name.
- `email` (String, required, unique): Account email.
- `password` (String, required): Salted bcrypt password hash.
- `targetRole` (String, default: 'Full Stack Developer'): Desired career track.

### 2. Problem (`models/Problem.js`)
- `title` (String, required): Problem display title.
- `slug` (String, required, unique): URL-friendly unique identifier.
- `difficulty` (String, enum: ['Easy', 'Medium', 'Hard']): Algorithmic difficulty.
- `category` (String, required): DSA topic category (e.g., Arrays, Graphs, Dynamic Programming).
- `tags` ([String]): Relevant search tags.
- `description` (String, required): Problem statement and constraints.
- `starterCode` (Object): Boilerplate templates keyed by language (`javascript`, `python`, `cpp`).
- `testCases` (Array): Input and expected output objects with `isHidden` flags.

### 3. Submission (`models/Submission.js`)
- `userId` (ObjectId, ref: 'User'): Candidate ID.
- `problemSlug` (String, required): Target problem identifier.
- `language` (String, required): Programming language used.
- `code` (String, required): Source code submitted.
- `passed` (Boolean, required): Test pass verdict.
- `verdict` (String, required): Execution status string (e.g., Accepted, Wrong Answer).
- `passedTestCases` (Number): Total test cases passed.
- `totalTestCases` (Number): Total test cases evaluated.
- `runtime` (String): Execution duration in milliseconds.

### 4. ResumeAudit (`models/ResumeAudit.js`)
- `userId` (ObjectId, ref: 'User'): Candidate ID.
- `fileName` (String, required): Uploaded PDF filename.
- `resumeUrl` (String): Supabase public cloud URL.
- `targetRole` (String, required): Benchmarked career track.
- `atsScore` (Number, required): Match percentage score (0-100).
- `verdict` (String, required): Executive evaluation summary.
- `strengths` ([String]): Identified strong qualification areas.
- `weaknesses` ([String]): Identified weak qualification areas.
- `missingKeywords` ([String]): Unmatched tech terms and domain tools.
- `bulletPointImprovements` (Array): Objects containing `original`, `critique`, and `improved` STAR bullet rewrites.

### 5. InterviewSession (`models/InterviewSession.js`)
- `userId` (ObjectId, ref: 'User'): Candidate ID.
- `roleTitle` (String, required): Mock interview position title.
- `difficulty` (String, enum: ['Entry', 'Intermediate', 'Advanced']): Calibrated question tier.
- `status` (String, enum: ['in-progress', 'completed']): Current session state.
- `messages` (Array): Chronological conversation history (`role`, `content`).
- `feedback` (Object): Scoring object (`technicalScore`, `communicationScore`, `overallScore`, `verdict`, `strengths`, `improvements`).

---

## API Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Registers a new user and issues a JWT token.
- `POST /api/auth/login` — Authenticates credentials and returns a JWT token.
- `GET /api/auth/profile` — Retrieves the authenticated candidate's profile (`Protected`).

### Problems & Execution (`/api/problems`, `/api/code`)
- `GET /api/problems` — Lists all available DSA problems.
- `GET /api/problems/:slug` — Retrieves problem details, starter templates, and test cases.
- `POST /api/code/run` — Executes code against public sample test cases (`Protected`).
- `POST /api/code/submit` — Benchmarks code against hidden test cases and records submission (`Protected`).
- `GET /api/code/submissions` — Fetches candidate submission history and solve telemetry (`Protected`).

### Socratic Tutor (`/api/tutor`)
- `POST /api/tutor/chat` — Sends code buffer and chat context for Socratic AI guidance (`Protected`).
- `GET /api/tutor/sessions` — Retrieves candidate active tutoring sessions (`Protected`).
- `GET /api/tutor/sessions/:id` — Fetches conversation logs for a specific session (`Protected`).

### Resume Auditor (`/api/resume`)
- `POST /api/resume/analyze` — Multipart PDF upload for text extraction, cloud storage, and AI review (`Protected`).
- `GET /api/resume/history` — Fetches past resume audit reports and scores (`Protected`).

### Mock Interviewer (`/api/interview`)
- `POST /api/interview/start` — Initializes session and returns an introductory question (`Protected`).
- `POST /api/interview/reply` — Submits candidate response and receives next question (`Protected`).
- `POST /api/interview/finish` — Ends interview session and compiles final evaluation scorecard (`Protected`).
- `GET /api/interview/history` — Retrieves past interview records and scorecards (`Protected`).

---

## Environment Configuration

### Server (`server/.env`)
```
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_gemini_api_key
SUPABASE_URL=[https://your-project.supabase.co](https://your-project.supabase.co)
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_BUCKET=resumes
CLIENT_URL=http://localhost:5173
```

### Client (`client/.env`)
```
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## Installation and Local Setup

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm or yarn
- MongoDB Atlas cluster
- Google Gemini API key
- Supabase project with a storage bucket named `resumes`

### 1. Clone Repository
```bash
git clone [https://github.com/jatinkm007/Prep-Genius.git](https://github.com/jatinkm007/Prep-Genius.git)
cd Prep-Genius
```

### 2. Backend Setup
```bash
cd server
npm install
cp .env.example .env
npm run dev
```

### 3. Frontend Setup
```bash
cd ../client
npm install
npm run dev
```

---

## Deployment Guide

### Backend (Render)
1. Create a new **Web Service** pointing to your repository.
2. Configure **Root Directory** to `server`.
3. Set **Build Command** to `npm install`.
4. Set **Start Command** to `npm start`.
5. Add all keys from `server/.env` to the Render Environment section.
6. The backend automatically accepts requests from localhost, configured `CLIENT_URL`, and all `*.vercel.app` preview deployments.

### Frontend (Vercel)
1. Import the repository into Vercel.
2. Configure **Root Directory** to `client`.
3. Select **Vite** as the framework preset.
4. Set the environment variable:
   - `VITE_API_BASE_URL`: `https://prep-genius-server.onrender.com/api`
5. Trigger deploy.

---
