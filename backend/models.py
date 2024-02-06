# Definisce il modello ORM della tabella "document" nel database.
# SQLModel unifica il modello Pydantic e la tabella SQLAlchemy in un'unica classe.

from datetime import datetime
from typing import Optional
from sqlmodel import Field, SQLModel


class Document(SQLModel, table=True):
    """
    Rappresenta un documento aziendale classificato.
    Ogni istanza corrisponde a una riga nella tabella 'document' di PostgreSQL.
    """

    # Chiave primaria autoincrementante. None finché non viene salvata nel DB.
    id: Optional[int] = Field(default=None, primary_key=True)

    # Titolo inserito dall'utente — usato solo per display, non per la classificazione.
    title: str

    # Testo grezzo del documento — è questo che viene passato al modello ML.
    raw_text: str

    # Categoria assegnata automaticamente dal modello ML.
    predicted_category: str

    # Probabilità massima restituita dal classificatore (0.0 – 1.0).
    confidence_score: float

    # Categoria corretta manualmente dall'utente. None se non ancora revisionata.
    reviewed_category: Optional[str] = None

    # Stato del documento: "new" appena classificato, "reviewed" dopo correzione manuale.
    status: str = "new"

    # Timestamp di creazione, impostato automaticamente al momento del salvataggio.
    created_at: datetime = Field(default_factory=datetime.utcnow)
