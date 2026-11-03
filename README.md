# SmartApply — Next-Generation College Admission & Real-Time Tracking Platform

> **Original Mission:**
> *“To simplify and digitize the college admission process by allowing students to apply online, track progress, and receive updates in real time.”*

SmartApply is a production-grade, startup-ready web application built on the **MERN** stack (MongoDB, Express.js, React.js, Node.js). It digitizes college admissions and surrounds the journey with intelligent, explainable decision-support systems: in-flight application anomaly detection, rule-based certificate verification, multi-factor course compatibility, a What-If admission sandbox, automated scholarship matching, real-time WebSocket state propagation, and administrative fairness auditing.

---

## 🌟 Key Highlights & Innovations

1. **Real-Time Live Application Tracking (Socket.IO)**
   - When an admission officer updates an application status or verifies a document, the candidate’s dashboard, timeline, and notification drawer update **instantly without page refresh**.
   - Generates structured visual timelines with previous status, new status, timestamp, admin remarks, and officer details.

2. **Smart Application Assistant**
   - In-flight continuous anomaly detection running on client and server.
   - Cross-references student-entered academic percentages against individual subject sums and marksheet data.
   - Flags discrepancies (e.g. *“Form states 91%, marksheet indicates 89.4%”*) and missing mandatory attachments **without auto-rejecting**, allowing students to review and provide explanations.

3. **Course Compatibility Engine**
   - Evaluates academic cutoffs, foundation subjects, technical skills, interests, and career goals.
   - Categorizes courses into **Recommended** (≥70%), **Possible** (50%–69%), and **Not Recommended** (<50%).
   - Provides clear, human-readable explanations (*“Why this degree matches you”*).

4. **What-If Admission Simulator**
   - Interactive counterfactual sandbox with real-time sliders for 12th percentage, entrance score, and extracurricular depth.
   - Calculates simulated readiness percentage, breakdown weights, and comparison against current profile.
   - Prominently labeled with ethics disclaimers: *“SIMULATION — NOT A GUARANTEE OF ADMISSION”*.

5. **Fairness Audit & Policy Simulator (Admin Only)**
   - **Fairness Audit**: Evaluates selection rates and 4/5ths disparity ratios across educational streams and score cohorts to detect unintended systemic bias.
   - **Policy Simulator**: Models committee decisions: seat capacity expansion, cutoff adjustments, and deadline extensions to forecast applicant demand and waitlists.

6. **Zero-Setup Database Architecture**
   - Connects directly to `MONGODB_URI` if present.
   - If no local or remote MongoDB daemon is active, it automatically launches an embedded in-memory MongoDB instance (`mongodb-memory-server`) and pre-populates rich seed data, allowing immediate out-of-the-box demonstration!

7. **Global University Directory (Live, Region-Based)**
   - `/universities` (public) and `/student/universities` list 10,000+ universities in 200 countries, synced from the open world-universities dataset every 12 hours.
   - Filter by region (Africa, Asia, Europe, Middle East, North America, South America, Oceania), country, or search text.
   - If the live source is unreachable, the server uses its last saved copy, then a small built-in list.

8. **One-Stop Application**
   - Shortlist up to 10 universities and apply to all of them in one step with the saved profile and documents (`POST /api/universities/apply`).
   - Every application appears in "All My Applications" on the student dashboard and in the admin queue, with the same real-time tracking.

9. **Multilingual Interface**
   - Language switcher in the navbar with 130+ languages (automatic translation, needs an internet connection) and right-to-left layout for Arabic, Urdu, Persian, Hebrew and others.

10. **Counsellor Chatbot**
   - "Ask Counsellor" button on every student page. Answers from the student's own data: application status, course matches, scholarships, missing documents, deadlines, interviews, and universities by country or region.
   - Conversations are stored in MongoDB (`ChatMessage`) and served by Express (`/api/chat`).
   - Works with no setup. Optionally set `ANTHROPIC_API_KEY` in `.env` to have replies written by an AI model, in the student's own language.

---

## 🔑 Accounts

There are no built-in demo logins by default. Real accounts are created like this:

* **Students** sign up on the **Register** page (`/register`). Every new student starts with an empty profile.
* **Admins (admissions officers)** cannot sign up publicly. Create the first one by filling in `ADMIN_NAME`, `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env` (it is created when the server starts), or run:
  ```bash
  npm run create-admin -- --name "Dr. A. Kumar" --email officer@college.edu --password "YourPass123" --college AIT
  ```
  (Stop the server first when using the built-in database.)

Data is saved in `server/data/db` (built-in database) or in the database at `MONGODB_URI`, so accounts survive restarts. To load the old sample accounts and applications instead, set `SEED_DEMO_DATA=true` on an empty database.

---

## 🛠️ Technology Stack

* **Core Stack**: MongoDB, Express.js, React.js, Node.js (MERN)
* **Frontend**: React 18, Vite, React Router 6, Tailwind CSS, Lucide Icons, Recharts, Socket.IO Client, Axios
* **Backend**: Node.js, Express.js, Mongoose, Socket.IO, JWT, bcryptjs, Multer
* **Database**: MongoDB (Mongoose ORM with embedded zero-config fallback)

---

## 🚀 Quick Start Instructions

### Deploy to Render

The repository includes a Render Blueprint in `render.yaml`. Create a Blueprint from this GitHub repository and choose the `main` branch. During initial setup, enter a MongoDB Atlas connection string and the first admissions admin's name, email and password when Render prompts for the variables. Render generates `JWT_SECRET`; demo accounts stay disabled.

The free Render service uses an ephemeral filesystem. MongoDB Atlas keeps application data persistent, but uploaded documents stored on the service may be lost on restart or redeploy. Use external file storage or a paid Render service with a persistent disk before relying on document retention.

### Prerequisites
* Node.js v18+ (tested on Node v20/v26)
* npm v9+

### 1. Run the Full Application (Unified Server)
```bash
# From the root directory:
npm start
```
The server will start on port `5001`, connect to MongoDB (or embedded MongoMemoryServer), seed the college/course/scholarship catalogue if needed, and serve both the React web application and the REST API simultaneously. It creates an admin account if `ADMIN_EMAIL` and `ADMIN_PASSWORD` are set in `.env`. Demo users and applications are only added when `SEED_DEMO_DATA=true` on a new database:
* **Web App URL**: `http://localhost:5001`
* **API Base URL**: `http://localhost:5001/api`
* **Socket.IO**: `ws://localhost:5001`

### 2. Development Mode (with Vite Hot Reloading)
```bash
# Terminal 1: Backend
cd server && npm run dev

# Terminal 2: Frontend
cd client && npm run dev
```
* **Frontend Dev Server**: `http://localhost:5173`
* **Backend API Server**: `http://localhost:5001`

### 3. Run Automated Verification Tests
The API and Socket.IO smoke tests use the demo accounts and sample applications. Start with `SEED_DEMO_DATA=true` on an empty database before running them.
```bash
# Run API smoke test suite (11 test suites)
node server/tests/smokeTest.js

# Run real-time Socket.IO synchronization test
node server/tests/socketTest.js
```

---

## 🧪 Interactive Two-Window Demo Script

To use the demo workflow below, first start the app with `SEED_DEMO_DATA=true` on an empty database. The demo buttons are not shown on the login page; sign in with the seeded accounts:

1. **Open Window 1 (Student View)**:
   - Navigate to `http://localhost:5001/login`.
   - Sign in as `student@smartapply.edu` with password `Student@123` (Aarav Patel).
   - Inspect the **Student Dashboard**: profile completion gauge, active application card, and real-time status badge (`DOCUMENT_VERIFICATION`).
   - Click on the active application card to open the **Full Tracker** (`/student/application/:id`).
   - Notice the live status timeline and audit cards. Keep this tab visible on your screen.

2. **Open Window 2 (Admin View - Incognito or Second Browser)**:
   - Navigate to `http://localhost:5001/login`.
   - Sign in as `admin@smartapply.edu` with password `Admin@123` (Admissions Dean Dr. Sharma).
   - Inspect the **Admin Dashboard**: Recharts donut chart for pipeline distribution and course demand bar chart.
   - Click **"Applications Queue"** (`/admin/applications`).
   - Click **"Evaluate"** on Aarav Patel's application (`SA-2026-88102`).
   - Audit the attached marksheets or change status to **`ACADEMIC_REVIEW`** with remarks: *“Candidate passed document verification. Forwarded to Mechatronics committee.”*
   - Click **"Apply Status Transition & Emit Event"**.

3. **Observe Window 1 (Student View)**:
   - **Immediately, without refreshing the page**:
     - A floating notification toast pops up in the top right corner.
     - The status badge updates to `Academic Review`.
     - The progression timeline visually moves to Step 3.
     - The new status history entry and remarks appear instantly!

4. **Demonstrate Innovation Modules**:
   - **AI Compatibility Engine** (`/student/recommendations`): Explore Recommended vs. Possible courses with transparent explanation bullet points.
   - **What-If Simulator** (`/student/simulator`): Move the 12th percentage and entrance score sliders to see real-time simulated readiness re-calculation.
   - **Scholarship Matcher** (`/student/scholarships`): See matched awards with percentage criteria satisfaction.
   - **Admin Fairness Audit** (`/admin/fairness`): Review parity metrics across school boards and streams.
   - **Admin Policy Simulator** (`/admin/policy-simulator`): Model increasing seat capacity from 60 to 100 seats and view projected yields.

---

## 📂 Project Architecture

```
SmartApply/
├── client/
│   ├── src/
│   │   ├── components/      # StatusBadge, Timeline, AssistantAlert, Modal, ToastContainer, Navbar, Footer
│   │   ├── context/         # AuthContext, SocketContext, NotificationContext
│   │   ├── layouts/         # PublicLayout, StudentLayout, AdminLayout
│   │   ├── pages/
│   │   │   ├── public/      # LandingPage, AboutPage, CoursesPage, LoginPage, RegisterPage
│   │   │   ├── student/     # StudentDashboard, StudentProfile, ApplicationWizard, ApplicationDetails,
│   │   │   │                # CourseRecommendations, AdmissionSimulator, ScholarshipMatcher, DocumentLocker, Notifications
│   │   │   └── admin/       # AdminDashboard, AdminApplications, AdminApplicationReview,
│   │   │                    # AdminCourses, AdminScholarships, AdminAnalytics, AdminFairnessAudit, AdminPolicySimulator
│   │   ├── services/        # api.js (Axios with interceptors)
│   │   └── App.jsx          # Route hierarchy
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── server/
│   ├── config/              # db.js (with MongoMemoryServer fallback), jwt.js, socket.js
│   ├── controllers/         # auth, application, course, document, recommendation, simulator, scholarship, admin
│   ├── middleware/          # auth.js (JWT & role checks), upload.js (Multer), errorHandler.js
│   ├── models/              # User, StudentProfile, College, Course, Application, Document,
│   │                        # Scholarship, Notification, ApplicationStatusHistory, AuditLog, Simulation
│   │── routes/              # auth, applications, courses, documents, recommendations, simulator, scholarships, admin
│   ├── services/            # assistantEngine.js, compatibilityEngine.js, verificationEngine.js, fairnessEngine.js, policyEngine.js
│   ├── seeds/               # seed.js and seedHelper.js (automatic database populator)
│   ├── tests/               # smokeTest.js, socketTest.js
│   └── server.js            # Express app + HTTP server + Socket.IO initialization + static bundle serving
│
├── .env.example
├── README.md
└── package.json
```

---

## 🛡️ Algorithmic Governance & Ethics

SmartApply complies with strict Human-in-the-Loop AI guidelines:
* **Assistance, Not Authority**: Compatibility scores, anomaly warnings, and simulations are decision-support aids for students and officers.
* **No Auto-Rejection**: Anomaly detections flag items for human review rather than causing automated rejections.
* **Final Authority**: All admissions decisions (offers, waitlists, rejections) remain 100% controlled by authorized human admissions officers.

---

## 📜 License
MIT License. Built for universities, students, and modern admissions offices.
