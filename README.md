# UnityGive

UnityGive is a full-stack crowdfunding platform built with the **MERN stack** (MongoDB, Express, React, Node.js). It allows organizations to create campaigns and users to explore and support active fundraising projects.

The project uses:

- **MongoDB + Mongoose** for database management  
- **Express.js** for the backend API  
- **React (Vite)** for the frontend  
- **Tailwind CSS** for styling  
- **shadcn/ui** for reusable UI components  

---

## 📁 Project Structure

```
UnityGive/
│
├── backend/ # Express + MongoDB API
├── frontend/ # React + Vite client
└── README.md
```
---

## 🚀 Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- dotenv
- cors

### Frontend
- React (with Vite)
- React Router
- Axios
- Tailwind CSS
- shadcn/ui
- Radix UI
- Sonner (toasts)

---

## ⚙️ Installation

### Clone the repository

```
git clone https://github.com/hnim3103/IE213_UnityGive.git
cd UnityGive
```
### Backend Setup

Navigate to the backend folder:
```
cd backend
```
Install dependencies:
```
npm install
```
Create a .env file inside the backend folder:
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
```
Run the backend server:
```
npm start
```
The backend will run at:
```
http://localhost:5000 #default
```
### Frontend Setup

Open a new terminal and navigate to the frontend folder:
```
cd frontend
```
Install dependencies:
```
npm install
```
Start the development server:
```
npm run dev
```
The frontend will run at:
```
http://localhost:3000
```
---
## 🎨 UI & Styling

- Tailwind CSS for utility-first styling

- shadcn/ui components built on top of Radix UI

- Custom color palette (teal & coral)

- Fully responsive design

- Modern card-based campaign layout
---
## 📦 Scripts Summary
### Backend
```
npm start
```
### Frontend
```
npm run dev
```
---
## 🌱 Future Improvements

- Authentication & Authorization (JWT)

- Payment integration

- Campaign detail page

- Admin dashboard

- Search & filtering system

- Deployment (Render / Vercel / Railway)
