# Navyan Deployment Guide

This project is ready to deploy as two services:

- `client/`: Vite React frontend
- `server/`: Express API

Recommended stack:

- Frontend: Vercel or Netlify
- Backend: Render or Railway
- Database: MongoDB Atlas
- File storage: Cloudinary

## 1. Pre-deploy checklist

- Use a managed MongoDB connection string in `MONGODB_URI`
- Configure Cloudinary in production
- Set a strong `JWT_SECRET` and `JWT_REFRESH_SECRET`
- Decide your final frontend domain and backend domain
- Seed the admin account after backend deployment

## 2. Backend deployment

Deploy the `server/` app as a Node service.

Build/start:

- Build command: `npm install`
- Start command: `npm start`

Required environment variables:

- `NODE_ENV=production`
- `PORT=5000`
- `HOST=0.0.0.0`
- `MONGODB_URI=...`
- `JWT_SECRET=...`
- `JWT_REFRESH_SECRET=...`
- `CLIENT_URL=https://your-frontend-domain`
- `ALLOWED_ORIGINS=https://your-frontend-domain`
- `SERVER_ORIGIN=https://your-backend-domain`
- `COOKIE_SECURE=true`
- `COOKIE_SAME_SITE=none`
- `TRUST_PROXY=1`
- `CERTIFICATE_VERIFY_BASE_URL=https://your-frontend-domain/verify-certificate`
- `INTERNSHIP_PAYMENT_UPI_ID=your_upi_id`
- `SMTP_SERVICE=gmail`
- `SMTP_USER=your_email@example.com`
- `SMTP_PASS=your_16_char_gmail_app_password`

Optional backend environment variables:

- `COOKIE_DOMAIN=.yourdomain.com`
- `EMAIL_FROM=Navyan <your_email@example.com>`
- `SEED_ADMIN_NAME=Navyan Admin`
- `SEED_ADMIN_EMAIL=admin@yourdomain.com`
- `SEED_ADMIN_PASSWORD=change_this_password`
- `DOCUMENT_LOGO_URL=https://your-public-logo-url/logo.svg`
- `DOCUMENT_LOGO_PATH=/absolute/path/to/logo.svg`
- `CLOUDINARY_CLOUD_NAME=...`
- `CLOUDINARY_API_KEY=...`
- `CLOUDINARY_API_SECRET=...`

Important:

- If frontend and backend are on different domains, keep `COOKIE_SECURE=true` and `COOKIE_SAME_SITE=none`.
- If you deploy the backend from only the `server/` folder, set `DOCUMENT_LOGO_URL` so PDF documents can still embed the company logo.
- Local file uploads are not ideal for production. Use Cloudinary.
- For Gmail SMTP, first enable Google 2-Step Verification, then generate an App Password, and use that 16-character password in `SMTP_PASS`.

## 3. Frontend deployment

Deploy the `client/` app as a static Vite app.

Build/output:

- Build command: `npm run build`
- Publish directory: `dist`

Required frontend environment variables:

- `VITE_API_URL=https://your-backend-domain/api`

Routing:

- `client/vercel.json` is included for Vercel SPA rewrites.
- `client/public/_redirects` is included for Netlify SPA rewrites.

## 4. Admin login in production

After backend deployment, run:

```bash
cd server
npm run seed:admin
```

This creates or updates the admin user in the database using:

- `SEED_ADMIN_NAME`
- `SEED_ADMIN_EMAIL`
- `SEED_ADMIN_PASSWORD`

Use those credentials on the deployed login page.

## 5. Post-deploy verification

Check these flows after deployment:

1. Open frontend and confirm public pages load without route 404s.
2. Call `https://your-backend-domain/api/health`.
3. Register a student account.
4. Login as student and refresh the dashboard.
5. Login as admin and refresh the dashboard.
6. Create an internship and apply to it.
7. Generate an offer letter and verify the PDF shows the correct logo.
8. Complete an internship and verify certificate generation and public verification.

## 6. Same-domain deployment option

If you reverse-proxy frontend and backend under one domain, the frontend can also work without `VITE_API_URL` by using `/api`. For predictable production behavior, keep `VITE_API_URL` set explicitly anyway.
