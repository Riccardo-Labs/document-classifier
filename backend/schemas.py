# Schemi Pydantic per la validazione delle richieste HTTP e la serializzazione delle risposte.
# Separati dal modello ORM per non esporre mai direttamente la struttura del database.

from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class ClassifyRequest(BaseModel):
    """Corpo della richiesta POST /documents/classify.
    Contiene i dati inseriti dall'utente nel form."""
    title: str      # titolo del documento
    raw_text: str   # testo da classificare


class ReviewRequest(BaseModel):
    """Corpo della richiesta PATCH /documents/{id}/review.
    Contiene solo la categoria scelta manualmente dall'utente."""
    reviewed_category: str


class DocumentResponse(BaseModel):
    """Schema di risposta per un singolo documento.
    Usato in tutti gli endpoint che restituiscono dati al frontend."""
    id: int
    title: str
    raw_text: str
    predicted_category: str
    confidence_score: float
    reviewed_category: Optional[str]
    status: str
    created_at: datetime

    # from_attributes=True permette a Pydantic di leggere i valori
    # direttamente dagli attributi di un oggetto SQLModel (non solo da dict).
    model_config = {"from_attributes": True}


class CategoryCount(BaseModel):
    """Schema di risposta per una singola voce delle statistiche.
    Rappresenta il conteggio dei documenti per una categoria."""
    category: str
    count: int
