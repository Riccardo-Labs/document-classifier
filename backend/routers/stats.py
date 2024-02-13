# Router per le statistiche aggregate.
# Espone un solo endpoint che conta i documenti raggruppati per categoria.

from fastapi import APIRouter, Depends
from sqlmodel import Session, select, func

from database import get_session
from models import Document
from schemas import CategoryCount

router = APIRouter()


@router.get("/categories", response_model=list[CategoryCount])
def category_stats(session: Session = Depends(get_session)):
    """
    Restituisce il conteggio dei documenti per ciascuna categoria predetta,
    ordinato dal più frequente al meno frequente.

    Esegue una query SQL equivalente a:
        SELECT predicted_category, COUNT(id)
        FROM document
        GROUP BY predicted_category
        ORDER BY COUNT(id) DESC
    """
    rows = session.exec(
        select(Document.predicted_category, func.count(Document.id))
        .group_by(Document.predicted_category)
        .order_by(func.count(Document.id).desc())
    ).all()

    # Converte ogni riga (tupla) in un oggetto CategoryCount
    return [CategoryCount(category=cat, count=cnt) for cat, cnt in rows]
