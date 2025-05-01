# 🎯 Creator Hub App

A full-stack web application that enables creators to manage their profiles, earn credits through engagement, and interact with a dynamic, personalized content feed aggregated from Twitter, Reddit, and LinkedIn.

---

## 🚀 Features

### 👥 User Authentication

- JWT-based Register/Login
- Role-based Access Control (`User`, `Admin`)

### 💰 Credit Points System

- Earn points for:
  - Daily logins
  - Completing profile
  - Interacting with feed
- View credit stats on user dashboard
- Admin panel to view and update user credit balances

### 📰 Feed Aggregator

- Aggregates posts from:
  - Twitter
  - Reddit
- Interactive scrollable feed where users can:
  - Save content
  - Share content (copy link or simulate sharing)
  - Report inappropriate posts

### 📊 Dashboard

- **User Dashboard:**
  - View credit balance and activity
  - Access saved feeds
- **Admin Dashboard:**
  - View analytics on user and feed activity
  - Manage user credit balances

---

## 🛠 Tech Stack

| Layer      | Technology                     |
|------------|--------------------------------|
| Frontend   | React.js, Tailwind CSS         |
| Backend    | Node.js, Express.js            |
| Database   | MongoDB Atlas                  |
| Deployment | Google Cloud Run (Backend)     |
| Hosting    | Firebase Hosting (Frontend)    |

---

## 📦 Installation Instructions

### 1. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory with the following content:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/creatorhub
JWT_SECRET=XR1S+nsbKVTaCOgltrMKqQAjZtNOZGancvsufkrZKLA=
```

Run the backend server:

```bash
nodemon index.js
```

### 2. Frontend Setup

```bash
npm install
npm run dev
```

Make sure to configure API base URLs in the frontend (e.g., via `.env` or config files).

---

## 🌐 Deployment

- **Backend:** Deploy to **Google Cloud Run**
- **Frontend:** Deploy to **Firebase Hosting**
- **Database:** Use **MongoDB Atlas**

Make sure environment variables are securely set in production.

---

## 📊 Sample API Endpoints

| Method | Endpoint                      | Function                          |
|--------|-------------------------------|-----------------------------------|
| POST   | `/api/auth/register`          | Register new user                 |
| POST   | `/api/auth/login`             | Login user and get JWT            |
| GET    | `/api/feed`                   | Fetch aggregated feed             |
| POST   | `/api/feed/save/:itemId`      | Save a post                       |
| POST   | `/api/feed/report/:itemId`    | Report inappropriate content      |
| GET    | `/api/feed/saved`             | Get saved posts                   |
| GET    | `/api/feed/reported`          | Get inappropriate content         |
| PUT    | `/api/users/:userId/credits`  | Admin update to user credits      |
| POST   | `/api/feed/share/:itemId`     |  Share a post and earn credit     |

---

## 📌 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

Developed with ❤️ by [Vishal Dalvi]
