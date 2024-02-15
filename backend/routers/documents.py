# Router per la gestione dei documenti.
# Espone tre endpoint: classificazione, lista e revisione manuale.

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select # type: ignore

from database import get_session
from models import Document
from schemas import ClassifyRequest, ReviewRequest, DocumentResponse
from classifier import predict

router = APIRouter()


@router.post("/classify", response_model=DocumentResponse, status_code=201)
def classify_document(payload: ClassifyRequest, session: Session = Depends(get_session)):
    """
    Riceve titolo e testo, li classifica con il modello ML e salva il documento nel DB.

    Flusso:
    1. Passa raw_text al classificatore → ottiene categoria e confidenza
    2. Crea un oggetto Document con i risultati
    3. Lo salva su PostgreSQL
    4. Restituisce il documento salvato (con id e created_at valorizzati dal DB)
    """
    category, confidence = predict(payload.raw_text)

    doc = Document(
        title=payload.title,
        raw_text=payload.raw_text,
        predicted_category=category,
        confidence_score=confidence,
    )
    session.add(doc)
    session.commit()
    # refresh ricarica l'oggetto dal DB per ottenere id e created_at generati dal server
    session.refresh(doc)
    return doc


@router.get("", response_model=list[DocumentResponse])
def list_documents(category: Optional[str] = None, session: Session = Depends(get_session)):
    """
    Restituisce tutti i documenti, ordinati dal più recente.
    Se il parametro query ?category=<valore> è presente, filtra per categoria predetta.

    Esempio: GET /documents?category=fattura
    """
    query = select(Document).order_by(Document.created_at.desc())

    if category:
        query = query.where(Document.predicted_category == category)

    return session.exec(query).all()


@router.patch("/{doc_id}/review", response_model=DocumentResponse)
def review_document(doc_id: int, payload: ReviewRequest, session: Session = Depends(get_session)):
    """
    Aggiorna la categoria di un documento dopo revisione manuale dell'utente.
    Imposta anche lo status a "reviewed" per distinguerlo dai documenti non ancora controllati.

    Restituisce 404 se il documento con l'id fornito non esiste.
    """
    doc = session.get(Document, doc_id)
    if not doc:
        # Restituisce 404 con messaggio leggibile se il documento non esiste nel DB
        raise HTTPException(status_code=404, detail="Documento non trovato")

    doc.reviewed_category = payload.reviewed_category
    doc.status = "reviewed"

    session.add(doc)
    session.commit()
    session.refresh(doc)
    return doc
