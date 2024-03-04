# Punto di ingresso dell'applicazione FastAPI.
# Configura il server, il middleware CORS e registra i router.

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from database import create_db_and_tables
from routers import documents, stats
from classifier import _pipeline, MODEL_PATH


# lifespan viene eseguito una volta sola all'avvio del server.
# Crea le tabelle nel database se non esistono ancora,
# poi cede il controllo all'applicazione con "yield".
@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield


app = FastAPI(title="Internal Document Routing Tool", version="1.0.0", lifespan=lifespan)

# CORS: permette al frontend (locale e tutti i deploy Vercel) di chiamare il backend.
# allow_origin_regex copre sia il dominio principale che i preview deployment di Vercel.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_origin_regex=r"https://document-classifier-6hyi.*\.vercel\.app",
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registra i due router con i rispettivi prefissi URL.
# Tutti gli endpoint di documents.py saranno sotto /documents
# Tutti gli endpoint di stats.py saranno sotto /stats
app.include_router(documents.router, prefix="/documents", tags=["documents"])
app.include_router(stats.router, prefix="/stats", tags=["stats"])


@app.get("/health", tags=["health"])
def health():
    """
    Endpoint di health check usato da Railway e servizi di monitoraggio
    per verificare che il server sia attivo e il modello ML caricato.
    Risponde su GET /health senza autenticazione.
    """
    return {
        "status": "ok",
        "version": app.version,
        "model_loaded": _pipeline is not None and MODEL_PATH.exists(),
    }
