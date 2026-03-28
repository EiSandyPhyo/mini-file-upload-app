# Mini File Upload App

A fullstack file upload system with drag-and-drop, preview, and file management.

---

## 🔗 Live Demo

Frontend (Vercel):  
👉 https://mini-file-upload-app.vercel.app

Backend (Render):  
👉 https://mini-file-upload-app.onrender.com  

---

## 🚀 Features

- Upload files (drag & drop or file picker)
- File type and size validation
- Image preview
- PDF preview
- View uploaded files
- Delete files
- Duplicate file detection

---

## 🛠️ Tech Stack

### Frontend
- React (Vite)
- Tailwind CSS
- JavaScript (ES6)

### Backend
- Python 3
- Flask
- Flask-CORS
- Gunicorn

##Deployment
- Vercel (Frontend)
- Render (Backend)

---

## 📂 Project Structure
```
file-upload-app/
├── backend/
│ ├── app.py
│ ├── requirements.txt
│ └── uploads/
└── frontend/
  ├── src/
  ├── package.json
  └── vite.config.js
```
---

## ⚠️ Notes

- Files are stored on the server filesystem.
- On free hosting (Render), storage is temporary and may reset after restart.
- This project is designed for learning and demonstration purposes.

---

## 🧠 What I Learned

- Building a fullstack app with React and Flask
- Handling file uploads using FormData
- Creating REST APIs
- Managing state in React
- Working with deployment platforms (Vercel & Render)
- Handling real-world issues like validation and duplicates

---


## 📦 Installation (Local Setup)

### Backend

```bash
cd backend
pip install -r requirements.txt
python3 app.py
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 👤 Author

Sandy
