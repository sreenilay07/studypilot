# Pocket Mentor 🎓🤖

> **Pocket Mentor** is an AI-powered personalized learning assistant that adapts study material to how students learn, tests what they actually understand, identifies their weak concepts, explains their mistakes, and creates 5-minute targeted revisions.

---

## 🌟 Features

- **Personalized AI Learning Kit**: Converts raw class notes into structured summaries, key points, interactive flashcards, visual concept maps, and multiple-choice quizzes.
- **5 Custom Learning Styles**: Choose between *Explain Like I'm 10*, *Simple Explanation*, *Exam Focused*, *University Level*, and *Teach Me Like a Professor*.
- **Interactive Active Recall**:
  - 3D flippable flashcards with quick navigation.
  - Interactive quiz engine with real-time progress tracking.
- **Deterministic Weakness Detection**: Automatically categorizes concepts into **🟢 Strong**, **🟡 Needs Revision**, and **🔴 Weak** based on quiz responses.
- **AI Mistake Explainer & Memory Tricks**: Analyzes student misconceptions, explains why wrong answers were chosen, and provides memorable mnemonics.
- **5-Minute Targeted Revision**: Generates focused micro-revision kits strictly targeting weak concepts.
- **Socratic Mentor**: Guided AI dialogue using the Socratic method to assist reasoning without spoiling answers directly.
- **Study History & Persistence**: Full MongoDB session history with retry and deletion capabilities.

---

## 🏗️ Architecture & Tech Stack

```text
React Frontend (Vite + Tailwind CSS + Lucide React)
       │
     Axios (with credentials / HTTP-only JWT cookie)
       │
       ▼
Express.js REST API (Node.js)
       │
   ┌───┴────────────────────────┐
   ▼                            ▼
MongoDB Atlas (Mongoose)     Groq AI API (llama-3.3-70b-versatile)
```

### Stack Details
- **Frontend**: React 18, Vite, Tailwind CSS, React Router v6, Axios, Lucide React icons.
- **Backend**: Node.js, Express.js, MongoDB + Mongoose, JWT (`httpOnly` cookies), bcryptjs, cookie-parser, CORS, dotenv.
- **AI Integration**: Groq SDK (`groq-sdk`) utilizing `llama-3.3-70b-versatile`.

---

## 📁 Project Structure

```text
pocket-mentor/
│
├── client/                      # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/          # Navbar, Footer, FlashcardViewer, KnowledgeMap, etc.
│   │   ├── pages/               # Home, Login, Register, Dashboard, Create, Quiz, Result, Mistakes, Revision, Mentor, History
│   │   ├── context/             # AuthContext (JWT session state)
│   │   ├── services/            # Axios API client
│   │   ├── App.jsx              # Main App Routes
│   │   ├── main.jsx
│   │   └── index.css            # Tailwind & custom CSS
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── server/                      # Node.js + Express Backend
│   ├── config/                  # MongoDB db.js connection
│   ├── controllers/             # authController, studyController, mentorController
│   ├── middleware/              # authMiddleware, errorHandler
│   ├── models/                  # User.js, StudySession.js
│   ├── routes/                  # authRoutes, studyRoutes, mentorRoutes
│   ├── services/                # groqService.js (Groq AI calls & validation)
│   ├── utils/                   # weaknessDetector.js (Deterministic grading logic)
│   ├── app.js                   # Express App setup
│   ├── server.js                # Server listener
│   └── package.json
│
├── .env.example
└── README.md
```

---

## 🔑 Environment Variables

### Backend (`server/.env`)
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/pocket-mentor
JWT_SECRET=your_super_secret_jwt_key
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.3-70b-versatile
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### Frontend (`client/.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js (v18+)
- MongoDB (Running locally or MongoDB Atlas connection string)
- Groq API Key (Get one from [Groq Console](https://console.groq.com))

### 1. Backend Setup
```bash
cd server
npm install
# Create .env file with your MONGO_URI and GROQ_API_KEY
npm run dev
```
The server runs at `http://localhost:5000`.

### 2. Frontend Setup
```bash
cd client
npm install
npm run dev
```
The client runs at `http://localhost:5173`.

---

## 📑 API Endpoints Documentation

### Authentication APIs
- `POST /api/auth/register` - Create new user account & set HTTP-only JWT cookie.
- `POST /api/auth/login` - Authenticate user & set HTTP-only JWT cookie.
- `POST /api/auth/logout` - Clear authentication cookie.
- `GET /api/auth/me` - Get current authenticated user profile.

### Study APIs (All require authentication)
- `POST /api/study/generate` - Generate AI learning kit (Does NOT save automatically).
- `POST /api/study` - Save study session to database.
- `GET /api/study` - List authenticated user's study sessions (newest first).
- `GET /api/study/:id` - Fetch complete study session details.
- `DELETE /api/study/:id` - Delete a study session.
- `POST /api/study/:id/analyze` - Grade quiz, calculate score/percentage, & deterministically tag concept weaknesses.
- `POST /api/study/:id/explain-mistake` - AI explanation of misconceptions & memory tricks for wrong answers.
- `POST /api/study/:id/revision` - Generate 5-minute targeted revision focused on weak concepts.
- `POST /api/study/:id/memory-booster` - Quick memory booster revision set.

### Mentor APIs
- `POST /api/mentor` - Interactive Socratic dialogue with AI mentor.

---

## 🌐 Deployment Instructions

- **Frontend Deployment (Vercel)**:
  - Connect GitHub repository and set Root Directory to `client`.
  - Add environment variable `VITE_API_URL=https://your-backend.onrender.com/api`.
- **Backend Deployment (Render)**:
  - Create Web Service, set Root Directory to `server`.
  - Set build command `npm install` and start command `node server.js`.
  - Add environment variables: `MONGO_URI`, `JWT_SECRET`, `GROQ_API_KEY`, `GROQ_MODEL`, `CLIENT_URL=https://your-frontend.vercel.app`, `NODE_ENV=production`.
- **Database (MongoDB Atlas)**:
  - Create a cluster, configure Network Access IP whitelist (`0.0.0.0/0`), and get connection string.

---

## 🚀 Future Enhancements
- Automated spaced repetition scheduling notifications (Day 1 → Day 3 → Day 7 → Day 14).
- Document PDF / DOCX file upload parser.
- Real-time peer study rooms & collaborative flashcards.
