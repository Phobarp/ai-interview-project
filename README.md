
# AI Interview Project

## Overview
The AI Interview Project consists of:
1. **Backend**: A Python-based API built with FastAPI, including image processing and feedback generation.
2. **Frontend**: A Next.js application providing the user interface.

---

## Prerequisites
Ensure you have the following installed:
- **Backend**:
  - Python 3.9+ ([Download here](https://www.python.org/))
  - pip (comes with Python installation)
  - Uvicorn (installed via `requirements.txt`)
- **Frontend**:
  - Node.js 18+ ([Download here](https://nodejs.org/))
  - npm (comes with Node.js) or Yarn

---

## Backend Setup

### 1. Navigate to the Backend Directory
```bash
cd ai-interview-backend
```

### 2. Set Up a Virtual Environment
Create and activate a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On macOS/Linux
venv\Scripts\activate     # On Windows
```

### 3. Install Dependencies
Install the required Python packages:
```bash
pip install -r requirements.txt
```

### 4. Run the Backend
Start the server using Uvicorn:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Short Explination Video
https://drive.google.com/file/d/1GQ71QR_wppVVxYADUgxASl1V8T53IxlN/view?usp=share_link

---

## Frontend Setup

### 1. Navigate to the Frontend Directory
```bash
cd ai-interview-front-end
```

### 2. Install Dependencies
Install the necessary Node.js packages:
```bash
npm install
```

### 3. Run the Frontend
Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000` by default.

---

## Project Structure

### Backend
```
ai-interview-backend/
├── app/
│   ├── detect-smile.py
│   ├── feedback_generator.py
│   ├── image_processing.py
│   └── main.py
├── data/
│   ├── haarcascade_eye.xml
│   ├── haarcascade_frontalface_default.xml
│   ├── haarcascade_righteye_2splits.xml
│   └── shape_predictor_68_face_landmarks.dat
├── requirements.txt
```

### Frontend
```
ai-interview-front-end/
├── pages/
├── components/
├── pages/
├── public/
├── styles/
├── .env.local
├── package.json
├── next.config.js
```

---

## Running the Full Application
1. Start the **backend** server:
   ```bash
   cd ai-interview-backend
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```
2. Start the **frontend** server:
   ```bash
   cd ai-interview-front-end
   npm i
   npm run dev
   ```
3. Access the application at `http://localhost:3000`.

---

## Troubleshooting

### Common Backend Issues
- **Virtual environment not activated**: Ensure you activate your virtual environment before running the backend.
- **Missing dependencies**: Run `pip install -r requirements.txt` again.

### Common Frontend Issues
- **Port conflict**: If `http://localhost:3000` is already in use, specify a different port:
  ```bash
  npm run dev -- --port=3001
  ```

### Cross-Origin Resource Sharing (CORS)
If you encounter CORS errors, ensure the backend has the appropriate CORS policy configured.

---

## License
This project is licensed under the [MIT License](LICENSE).
