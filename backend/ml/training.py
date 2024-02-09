# Script di training del modello ML.
# Legge il dataset CSV, addestra una pipeline TF-IDF + Logistic Regression,
# stampa le metriche di valutazione e salva il modello su disco.
#
# Esecuzione: python ml/training.py
# (dalla cartella backend/, con il virtualenv attivo)

from pathlib import Path

import joblib
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, accuracy_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer

# Percorsi assoluti calcolati dalla posizione di questo file
DATA_PATH  = Path(__file__).parent / "data" / "sample_data.csv"
MODEL_PATH = Path(__file__).parent / "model.joblib"


def main():
    # --- Caricamento dati ---
    df = pd.read_csv(DATA_PATH)

    # Rimuove righe con valori mancanti che romperebbero il training
    if df.isnull().any().any():
        print("Attenzione: trovati valori nulli nel dataset, verranno rimossi.")
        df = df.dropna()

    # X = testi di input, y = etichette di categoria
    X, y = df["text"], df["category"]

    # --- Split train / test ---
    # test_size=0.2 → 20% dei dati usati per la valutazione, 80% per il training
    # stratify=y    → mantiene le stesse proporzioni di categoria in entrambi i set
    # random_state  → rende lo split riproducibile
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # --- Pipeline ML ---
    # Step 1 — TfidfVectorizer: converte i testi in vettori numerici
    #   ngram_range=(1,2): considera sia parole singole che coppie di parole consecutive
    #   sublinear_tf=True: attenua il peso dei termini molto frequenti (log scaling)
    #   min_df=1:          include anche termini che compaiono una sola volta
    #
    # Step 2 — LogisticRegression: classificatore lineare
    #   C=5.0:        regolarizzazione moderata (valori alti = meno regolarizzazione)
    #   max_iter=1000: aumentato per garantire la convergenza su dataset piccoli
    pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(ngram_range=(1, 2), min_df=1, sublinear_tf=True)),
        ("clf",   LogisticRegression(max_iter=1000, C=5.0, random_state=42)),
    ])

    # Addestra la pipeline sull'intero set di training
    pipeline.fit(X_train, y_train)

    # --- Valutazione ---
    y_pred = pipeline.predict(X_test)
    acc    = accuracy_score(y_test, y_pred)

    print(f"\nAccuracy sul test set ({len(y_test)} campioni): {acc:.2%}\n")
    # classification_report mostra precision, recall e f1 per ogni categoria
    print(classification_report(y_test, y_pred))

    # --- Salvataggio ---
    # joblib serializza l'intera pipeline (vectorizer + classificatore) in un unico file
    joblib.dump(pipeline, MODEL_PATH)
    print(f"Modello salvato in: {MODEL_PATH}")


if __name__ == "__main__":
    main()
