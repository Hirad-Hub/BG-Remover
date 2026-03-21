# 🚀 Image Background Remover - Deployment Guide

This project consists of a **FastAPI backend** (using the `rembg` library) and a **React frontend** (Vite).

## 1. Deploy the Backend (Required for "Online" mode)

To avoid the "Could not connect to backend server" error, your backend must be hosted on a public URL.

### Options:
- **Render (Recommended)**:
    1. Create a "Web Service" on [render.com](https://render.com).
    2. Connect your GitHub repository.
    3. **Build Command**: `pip install -r backend/requirements.txt`
    4. **Start Command**: `python backend/main.py` (or `gunicorn -w 4 -k uvicorn.workers.UvicornWorker backend.main:app`)
    5. Copy the generated URL (e.g., `https://my-bg-api.onrender.com`).

- **Railway / Fly.io**: Similar steps, connect your repo and use the `requirements.txt`.

## 2. Deploy the Frontend to Surge.sh

Once you have your backend URL:

1. Go to `frontend/src/App.jsx`.
2. Update the `API_BASE_URL` constant with your **deployed backend URL**:
   ```javascript
   const API_BASE_URL = 'https://your-backend-url.onrender.com';
   ```
3. Run the build:
   ```bash
   cd frontend
   npm run build
   ```
4. Deploy the `dist` folder to Surge:
   ```bash
   npx surge dist backgroundremover.surge.sh
   ```

## Local Development

1. **Start Backend**:
   ```bash
   cd backend
   pip install -r requirements.txt
   python main.py
   ```
2. **Start Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   *By default, the frontend points to `localhost:8000`.*
