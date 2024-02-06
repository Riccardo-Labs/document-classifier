# Gestisce la connessione al database SQLite tramite SQLModel.
# Espone l'engine, la funzione di inizializzazione e la dipendenza di sessione.

import os
from sqlmodel import SQLModel, create_engine, Session
from dotenv import load_dotenv

# Carica le variabili dal file .env (es. DATABASE_URL)
load_dotenv()

# Legge la stringa di connessione dall'ambiente.
# Il valore di default è usato solo se .env non è presente.
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./database.db")


# L'engine è la connessione condivisa verso il database.
# check_same_thread=False è richiesto da SQLite in contesti multi-thread (FastAPI).
# Viene creato una sola volta all'avvio e riutilizzato da tutte le richieste.
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})


def create_db_and_tables():
    """Crea tutte le tabelle definite nei modelli SQLModel, se non esistono già."""
    SQLModel.metadata.create_all(engine)


def get_session():
    """
    Generatore usato come dipendenza FastAPI (Depends).
    Apre una sessione per ogni richiesta HTTP e la chiude automaticamente al termine,
    anche in caso di eccezione.
    """
    with Session(engine) as session:
        yield session
