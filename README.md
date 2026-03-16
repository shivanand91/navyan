## Navyan – Internship & Services Platform (MERN)

This project is a modern SaaS-style platform for **Navyan**, a premium Indian tech brand focused on:
- **Internship & career management** for students/freshers
- **Digital services** (web/apps/UI-UX/MVP) for clients

Tech stack:
- **Frontend**: React (Vite), Tailwind CSS, shadcn-style UI components, React Router, React Hook Form + Zod, TanStack Table, Framer Motion, Axios, Sonner
- **Backend**: Node.js, Express.js, MongoDB (Mongoose), JWT auth, Multer, Cloudinary, PDF generation, date-fns, helmet, rate limiting, bcrypt

Monorepo layout:
- `client/` – React app (public site + student & admin dashboards)
- `server/` – Express API (auth, internships, applications, submissions, certificates, service inquiries)

To get started:
1. Install dependencies in both folders:
   - `cd server && npm install`
   - `cd ../client && npm install`
2. Configure environment variables as described in `server/.env.example` and `client/.env.example`.
3. Run backend and frontend in parallel:
   - `cd server && npm run dev`
   - `cd client && npm run dev`

Deployment:
- Full deployment steps: [DEPLOYMENT.md](/home/shivanand91/Desktop/navyan/DEPLOYMENT.md)
- Root helper scripts:
  - `npm run install:all`
  - `npm run build`
  - `npm run start`
  - `npm run seed:admin`

This codebase is structured in **phases**:
- Phase 1: Auth, student profile, internships, apply flow, admin internship/applicant management
- Phase 2: Selection → Offer letters, project PDFs, internship timeline
- Phase 3: Submission window, submission form, admin review
- Phase 4: Certificates, verification, UX polish and premium SaaS theming
