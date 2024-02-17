# Gestisce il caricamento e l'utilizzo del modello ML.
# Il modello viene caricato in memoria una sola volta (pattern singleton)
# e riutilizzato per tutte le richieste successive.

import joblib
from pathlib import Path

# Percorso assoluto al file del modello serializzato,
# calcolato relativamente alla posizione di questo file.
MODEL_PATH = Path(__file__).parent / "ml" / "model.joblib"

# Variabile globale che mantiene la pipeline in memoria dopo il primo caricamento.
# None finché load_model() non viene chiamata.
_pipeline = None


def load_model():
    """
    Carica la pipeline scikit-learn dal file .joblib e la salva nella variabile globale.
    Solleva FileNotFoundError con istruzioni chiare se il modello non esiste ancora
    (cioè se training.py non è mai stato eseguito).
    """
    global _pipeline
    if not MODEL_PATH.exists():
        raise FileNotFoundError(
            f"Modello non trovato in {MODEL_PATH}. "
            "Esegui prima: python ml/training.py"
        )
    _pipeline = joblib.load(MODEL_PATH)


def predict(text: str) -> tuple[str, float]:
    """
    Classifica un testo e restituisce la categoria predetta e la confidenza.

    - Se il modello non è ancora in memoria, lo carica al primo utilizzo (lazy loading).
    - predict() restituisce la classe con probabilità più alta.
    - predict_proba() restituisce un array di probabilità per tutte le classi;
      prendiamo il massimo come score di confidenza.

    Restituisce: (categoria, confidenza) es. ("fattura", 0.94)
    """
    if _pipeline is None:
        load_model()

    category = _pipeline.predict([text])[0]

    # predict_proba restituisce es. [0.02, 0.94, 0.01, 0.02, 0.01]
    # una probabilità per ciascuna delle 5 categorie nell'ordine alfabetico
    proba = _pipeline.predict_proba([text])[0]
    confidence = float(max(proba))

    return category, confidence
