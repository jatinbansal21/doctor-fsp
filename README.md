# 🏥 MedCare — Patient Management System

A production-ready, full-stack Patient Management System built with the **MERN stack**  
(MongoDB · Express · React · Node.js), featuring role-based access, analytics dashboard,  
Excel import/export, audit history, soft delete, and dark/light mode.

---

## 🚀 Quick Start

### Prerequisites

| Tool | Version |
|------|---------|
| Node.js | v18+ (v20 recommended) |
| npm | v9+ |
| MongoDB Atlas | Cluster with IP whitelisted |

---

### 1. Clone & Setup

```bash
git clone <your-repo>
cd doctor-fsp
```

### 2. Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secrets
npm install
npm start
```

Backend runs at: `http://localhost:5000`  
Swagger API docs: `http://localhost:5000/api-docs`

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## 📁 Project Structure

```
doctor-fsp/
├── backend/
│   ├── src/
│   │   ├── config/db.js          # MongoDB connection
│   │   ├── controllers/          # auth, patient, upload, analytics
│   │   ├── middleware/           # auth (JWT), RBAC, errorHandler
│   │   ├── models/               # User, Patient, AuditLog
│   │   └── routes/               # authRoutes, patientRoutes, uploadRoutes
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── api/                   # axiosInstance + services
    │   ├── components/            # Sidebar, Navbar, UploadModal, ConfirmModal
    │   ├── features/              # Redux slices (auth, patients)
    │   ├── layouts/               # DoctorLayout
    │   ├── pages/                 # Dashboard, Patients, Form, Detail, Profile, Archived
    │   ├── router/                # AppRouter with protected routes
    │   └── store/                 # Redux store
    └── package.json
```

---

## 🔐 Authentication

- **JWT** access tokens (15min) + refresh tokens (7 days)
- Automatic token refresh (silent re-auth)
- Role selection at registration: **Doctor** or **Patient**

### Default Test Flow

1. Register as **Doctor**: `/register` → select Doctor → fill form
2. Login: `/login`
3. Access dashboard, add patients, import Excel

---

## 👥 Roles & Access

| Feature | Doctor | Patient |
|---------|--------|---------|
| Dashboard analytics | ✅ | ❌ (welcome screen) |
| View all patients | ✅ | Own record only |
| Create patient | ✅ | ✅ (own) |
| Edit patient | ✅ All fields | Limited fields |
| Delete (soft) | ✅ | ❌ |
| Restore archived | ✅ | ❌ |
| Import Excel | ✅ | ❌ |
| Export Excel | ✅ | ❌ |
| Audit history | ✅ | ❌ |

---

## 📊 Patient Fields

**Mandatory:** Name, Contact Number  
**Core:** Email, Age, Gender, Blood Group, Address, Admit Date  
**Emergency:** Emergency Contact Name, Emergency Contact Number  
**Medical:** Allergies, Current Medications, Medical History, Social History  
**Doctor-only:** Payor Type, Reference, Remarks, Review, Father's Education Proof, Doctor Assigned

---

## 📂 Excel Import

Upload `.xlsx`, `.xls`, or `.csv` files with these column headers:

| Column | Required |
|--------|----------|
| Name | ✅ |
| Contact Number / Phone / Mobile | ✅ |
| Email | optional |
| Age | optional |
| Gender | optional |
| Blood Group | optional |
| Address | optional |
| Admit Date | optional |
| ... (all other fields) | optional |

Rows missing **Name** or **Contact Number** are skipped and reported in the summary.

---

## 🌐 API Endpoints

| Method | Path | Auth | Role |
|--------|------|------|------|
| POST | `/api/auth/register` | No | Any |
| POST | `/api/auth/login` | No | Any |
| GET | `/api/auth/me` | JWT | Any |
| GET | `/api/patients` | JWT | Any |
| POST | `/api/patients` | JWT | Any |
| PUT | `/api/patients/:id` | JWT | Any (limited for patient) |
| DELETE | `/api/patients/:id` | JWT | Doctor |
| PATCH | `/api/patients/:id/restore` | JWT | Doctor |
| GET | `/api/patients/:id/history` | JWT | Doctor |
| POST | `/api/upload/excel` | JWT | Doctor |
| GET | `/api/upload/export` | JWT | Doctor |
| GET | `/api/analytics/stats` | JWT | Doctor |

Full Swagger docs at `/api-docs`.

---

## 🚀 Deployment

### Frontend → Vercel

1. Push `/frontend` to GitHub
2. Import into Vercel
3. Set env var from `frontend/.env.example`:
   - `VITE_API_URL=https://your-backend.onrender.com`
4. Deploy — `vercel.json` handles SPA routing

### Backend → Render

1. Push `/backend` to GitHub
2. New Web Service on Render
3. Build command: `npm install`
4. Start command: `npm start`
5. Add environment variables from `backend/.env.example`
6. Required production values:
   - `NODE_ENV=production`
   - `FRONTEND_URL=https://your-frontend.vercel.app`
   - `FRONTEND_URLS=https://your-frontend.vercel.app,https://your-frontend-git-main.vercel.app`
   - `BACKEND_URL=https://your-backend.onrender.com`
7. Optionally use `backend/render.yaml` for Blueprint-based setup
8. **Whitelist Render's IP in MongoDB Atlas** (or allow 0.0.0.0/0)

---

## ⚠️ MongoDB Atlas IP Whitelist

The backend needs your server's IP whitelisted in Atlas:

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. **Security → Network Access → Add IP Address**
3. For development: Add your current IP
4. For Render deployment: Click **"Allow Access from Anywhere"** (`0.0.0.0/0`)
5. Confirm

---

## 🌙 Dark / Light Mode

Toggle available in the **sidebar** or **navbar**. Preference is persisted in `localStorage`.

---

## 📱 PWA Support

The app includes a `manifest.json` for installable PWA support on mobile devices.

---

## 🛡️ Security

- Passwords hashed with **bcrypt** (salt rounds: 12)
- JWT access + refresh token rotation
- Helmet.js for HTTP security headers
- Rate limiting on all `/api/*` routes (500 req/15min)
- Stricter rate limiting on auth routes (20 req/15min)
- Role-based field-level access control
- Input validation on all critical endpoints

---

## 📈 Features Summary

- ✅ Doctor & Patient registration / login
- ✅ JWT auth with auto refresh
- ✅ Full patient CRUD with form validation
- ✅ Patient search (partial, case-insensitive)
- ✅ Advanced filters (age, gender, admit date)
- ✅ Table view + Card view toggle
- ✅ Pagination
- ✅ Excel import (bulk upload) with error report
- ✅ Excel export
- ✅ Soft delete + restore archived patients
- ✅ Audit log / change history
- ✅ Dashboard analytics (totals, trends, gender chart)
- ✅ Dark / Light mode with persistence
- ✅ Mobile-first responsive design
- ✅ Toast notifications
- ✅ Swagger API documentation
- ✅ PWA manifest
- ✅ Deployment-ready (Vercel + Render)
