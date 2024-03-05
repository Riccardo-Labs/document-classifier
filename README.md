# Document Classifier

A full-stack web app that automatically classifies Italian business documents into predefined categories using **local machine learning** (scikit-learn), stores them in SQLite, and displays them in a React dashboard.

No external APIs, no cloud ML services, no infrastructure costs — everything runs locally.

**Live demo:** [document-classifier-6hyi.vercel.app](https://document-classifier-6hyi.vercel.app) · Backend su Railway · Frontend su Vercel

---

## Features

- **Automatic classification** — Submit a document and get an instant category prediction with a confidence score
- **Confidence score with color** — Green > 80%, yellow 50–80%, red < 50% for immediate quality feedback
- **Document management** — Filterable table with inline category editing
- **Manual review workflow** — Correct any prediction; reviewed documents are visually highlighted
- **Statistics dashboard** — Real-time category distribution with proportional bar charts
- **REST API** — Fully documented via Swagger UI and ReDoc
- **Demo data** — 15 pre-loaded example documents (3 per category) visible on first visit

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite 5 |
| Backend | Python 3.11 + FastAPI |
| Database | SQLite + SQLModel (ORM) |
| ML Pipeline | scikit-learn — TF-IDF + Logistic Regression |
| Model serialization | joblib |

---

## Supported Categories

| Category | Description |
|---|---|
| `fattura` | Invoices, credit notes, payment reminders |
| `supporto_tecnico` | IT support requests, fault reports, credential resets |
| `richiesta_commerciale` | Quote requests, supply inquiries, commercial questions |
| `reclamo` | Formal complaints, service issues, refund requests |
| `altro` | General communications, administrative documents |

The model is trained on 125 labeled Italian-language examples and achieves ~92% accuracy on the test set.

---

## Project Structure

```
document-classifier/
├── start.sh                      # Quick start (Git Bash / macOS / Linux)
├── start.bat                     # Quick start (Windows CMD)
├── backend/
│   ├── main.py                   # FastAPI app, CORS, lifespan
│   ├── database.py               # SQLModel engine & session
│   ├── models.py                 # Document table
│   ├── schemas.py                # Pydantic request/response schemas
│   ├── classifier.py             # Model loading + prediction
│   ├── seed.py                   # Pre-populates DB with 15 example documents
│   ├── requirements.txt
│   ├── .env.example
│   ├── routers/
│   │   ├── documents.py          # POST classify · GET list · PATCH review
│   │   └── stats.py              # GET stats/categories
│   └── ml/
│       ├── training.py           # Training script
│       └── data/
│           └── sample_data.csv   # 125 labeled examples
└── frontend/
    └── src/
        ├── App.jsx
        ├── api/client.js         # HTTP client
        └── components/
            ├── DocForm.jsx       # Document submission form
            ├── DocTable.jsx      # Table with filter, inline edit and confidence colors
            └── Stats.jsx         # Category stats with bar charts
```

---

## Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+

### 1. Configure environment variables

```bash
cd backend
cp .env.example .env
```

The default `.env` uses SQLite — no database server needed:
```
DATABASE_URL=sqlite:///./database.db
```

### 2. Train the ML model

```bash
cd backend
python -m venv .venv
source .venv/Scripts/activate  # Windows Git Bash
# or: source .venv/bin/activate  (macOS/Linux)

pip install -r requirements.txt
python ml/training.py
```

### 3. (Optional) Seed the database with example documents

```bash
python seed.py
```

### 4. Install frontend dependencies

```bash
cd frontend
npm install
```

### 5. Start the app

**Quick start (recommended):**
```bash
bash start.sh       # Git Bash / macOS / Linux
start.bat           # Windows CMD
```

**Manual (two terminals):**
```bash
# Terminal 1 — Backend
cd backend && uvicorn main:app --reload

# Terminal 2 — Frontend
cd frontend && npm run dev
```

### URLs

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000 |
| Swagger UI | http://localhost:8000/docs |
| ReDoc | http://localhost:8000/redoc |

---

## API

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/documents/classify` | Classify and save a document |
| `GET` | `/documents` | List documents (supports `?category=fattura`) |
| `PATCH` | `/documents/{id}/review` | Manually correct a category |
| `GET` | `/stats/categories` | Document count per category |
| `GET` | `/health` | Health check — returns server status and model state |

**Example — classify a document:**

```bash
curl -X POST http://localhost:8000/documents/classify \
  -H "Content-Type: application/json" \
  -d '{"title": "Fattura marzo", "raw_text": "Allego fattura n. 2024/0312 per la fornitura di marzo."}'
```

```json
{
  "id": 1,
  "title": "Fattura marzo",
  "predicted_category": "fattura",
  "confidence_score": 0.94,
  "status": "new",
  "created_at": "2024-03-15T10:30:00"
}
```

## License

MIT
